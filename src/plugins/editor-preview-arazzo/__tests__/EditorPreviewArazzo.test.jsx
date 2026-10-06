import React from 'react';
import { act, render } from '@testing-library/react';

import EditorPreviewArazzo from '../components/EditorPreviewArazzo.jsx';
import EditorPreviewWrapper from '../extensions/editor-preview/wrap-components/EditorPreviewWrapper.jsx';
import EditorPreviewArazzoPlugin from '../index.js';

vi.mock('arazzo-viewer', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // the real element pulls in a full rendering stack; a light stand-in is enough here
    defineArazzoViewer: () => {
      if (customElements.get('arazzo-viewer')) return;
      customElements.define(
        'arazzo-viewer',
        class extends HTMLElement {
          constructor() {
            super();
            this.revealLine = vi.fn();
          }
        }
      );
    },
  };
});

const { NAVIGATE_EVENT } = await import('arazzo-viewer');

let urlCounter = 0;
const nextId = () => {
  urlCounter += 1;
  return urlCounter;
};
const uniqueUrl = (suffix = 'openapi.json') => `https://example.com/${nextId()}/${suffix}`;

const arazzoWith = (...sources) =>
  [
    'arazzo: 1.0.0',
    'info:',
    '  title: t',
    '  version: 1.0.0',
    'sourceDescriptions:',
    ...sources.flatMap((s) => [`  - name: ${s.name}`, `    url: ${s.url}`, '    type: openapi']),
    'workflows: []',
    '',
  ].join('\n');

const jsonResponse = (body) => ({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) });

const setup = ({ content = 'arazzo: 1.0.0\n', editor = null } = {}) => {
  let currentContent = content;
  const editorSelectors = {
    selectContent: () => currentContent,
    selectEditor: () => editor,
  };
  const editorActions = { setPosition: vi.fn() };
  const view = render(
    <EditorPreviewArazzo editorSelectors={editorSelectors} editorActions={editorActions} />
  );
  const setContent = (next) => {
    currentContent = next;
    view.rerender(
      <EditorPreviewArazzo editorSelectors={editorSelectors} editorActions={editorActions} />
    );
  };
  const viewer = view.container.querySelector('arazzo-viewer');
  return { ...view, viewer, editorSelectors, editorActions, setContent };
};

const flush = (ms = 500) => act(() => vi.advanceTimersByTimeAsync(ms));

describe('EditorPreviewArazzo', () => {
  let fetchMock;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('should render a light themed <arazzo-viewer>', () => {
    const { viewer } = setup();

    expect(viewer).not.toBeNull();
    expect(viewer.getAttribute('theme')).toBe('light');
    expect(viewer.closest('section')).toHaveClass('swagger-editor__editor-preview-arazzo');
  });

  test('should set content on the element immediately and follow content changes', () => {
    const { viewer, setContent } = setup({ content: 'arazzo: 1.0.0\n# one\n' });

    expect(viewer.source).toBe('arazzo: 1.0.0\n# one\n');

    setContent('arazzo: 1.0.0\n# two\n');

    expect(viewer.source).toBe('arazzo: 1.0.0\n# two\n');
  });

  describe('source fetching', () => {
    test('should not fetch before the 500ms debounce elapses', async () => {
      const url = uniqueUrl();
      fetchMock.mockResolvedValue(jsonResponse({ openapi: '3.0.0' }));
      const { viewer } = setup({ content: arazzoWith({ name: 'api', url }) });

      await flush(499);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(viewer.sources).toBeUndefined();
    });

    test('should fetch absolute http(s) sources and assign them to the element', async () => {
      const url = uniqueUrl();
      const doc = { openapi: '3.0.0', paths: {} };
      fetchMock.mockResolvedValue(jsonResponse(doc));
      const { viewer } = setup({ content: arazzoWith({ name: 'api', url }) });

      await flush();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(url);
      expect(viewer.sources).toEqual({ api: doc });
    });

    test('should ignore non-http(s) source URLs', async () => {
      fetchMock.mockResolvedValue(jsonResponse({}));
      const { viewer } = setup({
        content: arazzoWith(
          { name: 'a', url: 'file:///etc/passwd' },
          { name: 'b', url: 'ftp://example.com/x.json' },
          { name: 'c', url: 'javascript:alert(1)' } // eslint-disable-line no-script-url
        ),
      });

      await flush();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(viewer.sources).toEqual({});
    });

    test('should resolve relative URLs against the document base URI', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ openapi: '3.0.0' }));
      const relative = `rel-${nextId()}.json`;
      setup({ content: arazzoWith({ name: 'api', url: relative }) });

      await flush();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe(new URL(relative, document.baseURI).href);
    });

    test('should debounce rapid edits into a single fetch', async () => {
      const url = uniqueUrl();
      fetchMock.mockResolvedValue(jsonResponse({ openapi: '3.0.0' }));
      const { setContent } = setup({ content: arazzoWith({ name: 'api', url }) });

      await flush(300);
      setContent(`${arazzoWith({ name: 'api', url })}# edit 1\n`);
      await flush(300);
      setContent(`${arazzoWith({ name: 'api', url })}# edit 2\n`);
      await flush(500);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('should reuse the cache across edits and elements', async () => {
      const url = uniqueUrl();
      fetchMock.mockResolvedValue(jsonResponse({ openapi: '3.0.0' }));
      const first = setup({ content: arazzoWith({ name: 'api', url }) });
      await flush();
      first.unmount();

      const second = setup({ content: `${arazzoWith({ name: 'other', url })}# changed\n` });
      await flush();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(second.viewer.sources).toEqual({ other: { openapi: '3.0.0' } });
    });

    test('should omit sources that fail to load', async () => {
      const okUrl = uniqueUrl();
      const badUrl = uniqueUrl();
      fetchMock.mockImplementation((u) =>
        u === badUrl
          ? Promise.resolve({ ok: false, status: 404 })
          : Promise.resolve(jsonResponse({ ok: 1 }))
      );
      const { viewer } = setup({
        content: arazzoWith({ name: 'good', url: okUrl }, { name: 'bad', url: badUrl }),
      });

      await flush();

      expect(viewer.sources).toEqual({ good: { ok: 1 } });
    });

    test('should not touch the element after unmount', async () => {
      const url = uniqueUrl();
      let resolveFetch;
      fetchMock.mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      );
      const { viewer, unmount } = setup({ content: arazzoWith({ name: 'api', url }) });
      await flush();
      unmount();

      resolveFetch(jsonResponse({ openapi: '3.0.0' }));
      await flush(0);

      expect(viewer.sources).toBeUndefined();
    });

    test('should not publish stale sources from a superseded content', async () => {
      const slowUrl = uniqueUrl();
      const fastUrl = uniqueUrl();
      let resolveSlow;
      fetchMock.mockImplementation((u) =>
        u === slowUrl
          ? new Promise((resolve) => {
              resolveSlow = resolve;
            })
          : Promise.resolve(jsonResponse({ fast: true }))
      );
      const { viewer, setContent } = setup({ content: arazzoWith({ name: 'slow', url: slowUrl }) });
      await flush();
      setContent(arazzoWith({ name: 'fast', url: fastUrl }));
      await flush();
      expect(viewer.sources).toEqual({ fast: { fast: true } });

      resolveSlow(jsonResponse({ slow: true }));
      await flush(0);

      expect(viewer.sources).toEqual({ fast: { fast: true } });
    });
  });

  describe('navigation', () => {
    test('should move the editor cursor to the line of a navigate event', () => {
      const { viewer, editorActions } = setup();

      viewer.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: { line: 42 } }));

      expect(editorActions.setPosition).toHaveBeenCalledWith({ lineNumber: 42, column: 1 });
    });

    test('should stop listening for navigate events after unmount', () => {
      const { viewer, editorActions, unmount } = setup();
      unmount();

      viewer.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: { line: 7 } }));

      expect(editorActions.setPosition).not.toHaveBeenCalled();
    });
  });

  describe('cursor follow', () => {
    const makeEditor = () => {
      const dispose = vi.fn();
      const editor = {
        handler: null,
        dispose,
        onDidChangeCursorPosition: vi.fn((cb) => {
          editor.handler = cb;
          return { dispose };
        }),
      };
      return editor;
    };

    test('should reveal the cursor line without stealing focus', () => {
      const editor = makeEditor();
      const { viewer } = setup({ editor });

      act(() => editor.handler({ source: 'keyboard', position: { lineNumber: 12, column: 3 } }));

      expect(viewer.revealLine).toHaveBeenCalledWith(12, { focus: false });
    });

    test.each(['mouse', 'keyboard', 'model'])('should follow %s moves', (source) => {
      const editor = makeEditor();
      const { viewer } = setup({ editor });

      editor.handler({ source, position: { lineNumber: 3, column: 1 } });

      expect(viewer.revealLine).toHaveBeenCalledTimes(1);
    });

    test('should ignore moves made through the API', () => {
      const editor = makeEditor();
      const { viewer } = setup({ editor });

      editor.handler({ source: 'api', position: { lineNumber: 99, column: 1 } });

      expect(viewer.revealLine).not.toHaveBeenCalled();
    });

    test('should dispose the cursor subscription on unmount', () => {
      const editor = makeEditor();
      const { unmount } = setup({ editor });

      unmount();

      expect(editor.dispose).toHaveBeenCalledTimes(1);
    });

    test('should poll until the editor becomes available, then attach once', async () => {
      const editor = makeEditor();
      let available = null;
      const editorSelectors = {
        selectContent: () => 'arazzo: 1.0.0\n',
        selectEditor: () => available,
      };
      const editorActions = { setPosition: vi.fn() };
      const { container, unmount } = render(
        <EditorPreviewArazzo editorSelectors={editorSelectors} editorActions={editorActions} />
      );

      await flush(750);
      expect(editor.onDidChangeCursorPosition).not.toHaveBeenCalled();

      available = editor;
      await flush(250);
      expect(editor.onDidChangeCursorPosition).toHaveBeenCalledTimes(1);

      await flush(1000);
      expect(editor.onDidChangeCursorPosition).toHaveBeenCalledTimes(1);

      editor.handler({ source: 'mouse', position: { lineNumber: 5, column: 1 } });
      expect(container.querySelector('arazzo-viewer').revealLine).toHaveBeenCalledWith(5, {
        focus: false,
      });
      unmount();
      expect(editor.dispose).toHaveBeenCalledTimes(1);
    });

    test('should stop polling after unmount', async () => {
      const selectEditor = vi.fn(() => null);
      const { unmount } = render(
        <EditorPreviewArazzo
          editorSelectors={{ selectContent: () => 'x', selectEditor }}
          editorActions={{ setPosition: vi.fn() }}
        />
      );
      await flush(500);
      unmount();
      selectEditor.mockClear();

      await flush(2000);

      expect(selectEditor).not.toHaveBeenCalled();
    });
  });
});

describe('EditorPreviewWrapper', () => {
  const Original = () => <div data-testid="original-preview" />;
  const ArazzoStub = () => <div data-testid="arazzo-preview" />;

  const renderWrapper = (isArazzo) => {
    const Wrapped = EditorPreviewWrapper(Original, {});
    const getComponent = vi.fn(() => ArazzoStub);
    const editorSelectors = { selectIsContentTypeArazzo: () => isArazzo };
    return render(<Wrapped editorSelectors={editorSelectors} getComponent={getComponent} />);
  };

  test('should show the Arazzo preview for Arazzo content', () => {
    const { queryByTestId } = renderWrapper(true);

    expect(queryByTestId('arazzo-preview')).toBeInTheDocument();
    expect(queryByTestId('original-preview')).not.toBeInTheDocument();
  });

  test('should fall through to the original preview for non-Arazzo content', () => {
    const { queryByTestId } = renderWrapper(false);

    expect(queryByTestId('original-preview')).toBeInTheDocument();
    expect(queryByTestId('arazzo-preview')).not.toBeInTheDocument();
  });
});

describe('EditorPreviewArazzoPlugin', () => {
  test('should register the component and wrap EditorPreviewPane', () => {
    const plugin = EditorPreviewArazzoPlugin();

    expect(plugin.components.EditorPreviewArazzo).toBe(EditorPreviewArazzo);
    expect(plugin.wrapComponents.EditorPreviewPane).toBe(EditorPreviewWrapper);
  });
});
