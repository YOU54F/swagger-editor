import EditorMonacoLanguageArazzoPlugin from '../index.js';

const mocks = vi.hoisted(() => ({
  monaco: {
    editor: {
      getModels: vi.fn(),
      onDidCreateModel: vi.fn(),
      onDidChangeModelLanguage: vi.fn(),
    },
  },
  registerArazzoLanguage: vi.fn(),
  buildSources: vi.fn(),
  loadArazzoSources: vi.fn(),
}));

vi.mock('monaco-editor', () => mocks.monaco);
vi.mock('arazzo-viewer/language', () => ({
  registerArazzoLanguage: mocks.registerArazzoLanguage,
  buildSources: mocks.buildSources,
}));
vi.mock('../../editor-preview-arazzo/utils/sources.js', () => ({
  default: mocks.loadArazzoSources,
}));

const makeModel = (value, languageId = 'apidom') => {
  const model = {
    contentListener: null,
    getValue: () => model.value,
    getLanguageId: () => languageId,
    onDidChangeContent: vi.fn((cb) => {
      model.contentListener = cb;
    }),
    value,
  };
  return model;
};

describe('EditorMonacoLanguageArazzoPlugin', () => {
  let validate;
  let isArazzo;
  let getSources;
  let models;

  const load = () => {
    EditorMonacoLanguageArazzoPlugin().afterLoad();
    const call = mocks.registerArazzoLanguage.mock.calls[0];
    [getSources, isArazzo] = [call[2], call[3]]; // eslint-disable-line prefer-destructuring
  };

  beforeEach(() => {
    vi.useFakeTimers();
    validate = vi.fn();
    models = [];
    mocks.registerArazzoLanguage.mockReturnValue({ validate });
    mocks.monaco.editor.getModels.mockImplementation(() => models);
    mocks.buildSources.mockImplementation((s) => ({ built: s }));
    mocks.loadArazzoSources.mockResolvedValue({ api: { openapi: '3.0.0' } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should expose an afterLoad hook only', () => {
    const plugin = EditorMonacoLanguageArazzoPlugin();

    expect(typeof plugin.afterLoad).toBe('function');
  });

  describe('registration', () => {
    test('should register once on the apidom language with a detection predicate', () => {
      load();

      expect(mocks.registerArazzoLanguage).toHaveBeenCalledTimes(1);
      const [monacoArg, languageId, sourcesFn, predicate] =
        mocks.registerArazzoLanguage.mock.calls[0];
      expect(monacoArg.editor).toBe(mocks.monaco.editor);
      expect(languageId).toBe('apidom');
      expect(typeof sourcesFn).toBe('function');
      expect(typeof predicate).toBe('function');
    });

    test('should provide empty sources until loaded', () => {
      load();

      expect(getSources()).toEqual({ sources: {} });
    });

    test('should subscribe to model creation and language changes', () => {
      load();

      expect(mocks.monaco.editor.onDidCreateModel).toHaveBeenCalledTimes(1);
      expect(mocks.monaco.editor.onDidChangeModelLanguage).toHaveBeenCalledTimes(1);
    });
  });

  describe('isArazzo predicate', () => {
    beforeEach(load);
    const check = (value) => isArazzo(makeModel(value));

    test.each([
      ['YAML 1.0.0', 'arazzo: 1.0.0\ninfo: {}\n'],
      ['YAML 1.1.0', 'arazzo: 1.1.0\n'],
      ['quoted YAML', '"arazzo": "1.0.1"\n'],
      ['YAML after a leading comment', '# header\narazzo: 1.0.0\n'],
      ['JSON', '{\n  "arazzo": "1.0.0",\n  "info": {}\n}'],
    ])('should accept %s', (_, value) => {
      expect(check(value)).toBe(true);
    });

    test.each([
      ['openapi', 'openapi: 3.1.0\ninfo: {}\n'],
      ['asyncapi', 'asyncapi: 3.0.0\n'],
      ['empty', ''],
      ['plain text', 'hello world'],
      ['arazzo 2.x', 'arazzo: 2.0.0\n'],
      ['arazzo 0.x', 'arazzo: 0.9.0\n'],
      ['arazzo in a comment', '# arazzo: 1.0.0\nfoo: bar\n'],
      ['arazzo past the first 4096 chars', `${'#'.repeat(5000)}\narazzo: 1.0.0\n`],
    ])('should reject %s', (_, value) => {
      expect(check(value)).toBe(false);
    });
  });

  describe('model tracking', () => {
    const arazzo = 'arazzo: 1.0.0\ninfo:\n  title: t\n';

    test('should validate and track existing apidom models', () => {
      const model = makeModel(arazzo);
      models = [model];
      load();

      expect(validate).toHaveBeenCalledWith(model);
      expect(model.onDidChangeContent).toHaveBeenCalledTimes(1);
    });

    test('should ignore models of other languages', () => {
      const model = makeModel(arazzo, 'plaintext');
      models = [model];
      load();

      expect(validate).not.toHaveBeenCalled();
      expect(model.onDidChangeContent).not.toHaveBeenCalled();
    });

    test('should track models created later and models switched to apidom', () => {
      load();
      const created = makeModel(arazzo);
      mocks.monaco.editor.onDidCreateModel.mock.calls[0][0](created);
      expect(created.onDidChangeContent).toHaveBeenCalledTimes(1);

      const switched = makeModel(arazzo);
      mocks.monaco.editor.onDidChangeModelLanguage.mock.calls[0][0]({ model: switched });
      expect(switched.onDidChangeContent).toHaveBeenCalledTimes(1);

      const other = makeModel(arazzo, 'json');
      mocks.monaco.editor.onDidChangeModelLanguage.mock.calls[0][0]({ model: other });
      expect(other.onDidChangeContent).not.toHaveBeenCalled();
    });

    test('should load sources after the debounce and revalidate for Arazzo content', async () => {
      const model = makeModel(arazzo);
      models = [model];
      load();
      validate.mockClear();

      await vi.advanceTimersByTimeAsync(499);
      expect(mocks.loadArazzoSources).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(mocks.loadArazzoSources).toHaveBeenCalledWith(arazzo);
      expect(mocks.buildSources).toHaveBeenCalledWith({ api: { openapi: '3.0.0' } });
      expect(validate).toHaveBeenCalledWith(model);
      expect(getSources()).toEqual({ sources: { built: { api: { openapi: '3.0.0' } } } });
    });

    test('should revalidate immediately and debounce source loading on content changes', async () => {
      const model = makeModel(arazzo);
      models = [model];
      load();
      await vi.advanceTimersByTimeAsync(500);
      mocks.loadArazzoSources.mockClear();
      validate.mockClear();

      model.contentListener();
      expect(validate).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(300);
      model.contentListener();
      await vi.advanceTimersByTimeAsync(499);
      expect(mocks.loadArazzoSources).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);

      expect(mocks.loadArazzoSources).toHaveBeenCalledTimes(1);
    });
  });

  describe('non-Arazzo content', () => {
    test('should never fetch sources or build them', async () => {
      const model = makeModel('openapi: 3.1.0\ninfo: {}\n');
      models = [model];
      load();

      await vi.advanceTimersByTimeAsync(2000);
      model.value = '{"asyncapi":"3.0.0"}';
      model.contentListener();
      await vi.advanceTimersByTimeAsync(2000);

      expect(mocks.loadArazzoSources).not.toHaveBeenCalled();
      expect(mocks.buildSources).not.toHaveBeenCalled();
      expect(getSources()).toEqual({ sources: {} });
    });

    test('should stop loading sources when a model stops being Arazzo', async () => {
      const model = makeModel('arazzo: 1.0.0\n');
      models = [model];
      load();
      await vi.advanceTimersByTimeAsync(500);
      mocks.loadArazzoSources.mockClear();

      model.value = 'openapi: 3.1.0\n';
      model.contentListener();
      await vi.advanceTimersByTimeAsync(1000);

      expect(mocks.loadArazzoSources).not.toHaveBeenCalled();
    });
  });
});
