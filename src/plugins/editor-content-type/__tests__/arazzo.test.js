import { Map } from 'immutable';

import EditorContentTypePlugin from '../index.js';
import EditorContentFixturesPlugin from '../../editor-content-fixtures/index.js';

const buildSystem = () => {
  const plugin = EditorContentTypePlugin();
  const { actions, selectors, reducers } = plugin.statePlugins.editor;
  let state = Map();
  let counter = 0;

  const dispatch = (action) => {
    const reducer = reducers[action.type];
    if (reducer) state = reducer(state, action);
    return action;
  };

  const system = {
    fn: {
      ...plugin.fn,
      generateRequestId: () => {
        counter += 1;
        return `req-${counter}`;
      },
    },
  };
  system.editorActions = {
    detectContentTypeStarted: (args) => dispatch(actions.detectContentTypeStarted(args)),
    detectContentTypeSuccess: (args) => dispatch(actions.detectContentTypeSuccess(args)),
    detectContentTypeFailure: (args) => dispatch(actions.detectContentTypeFailure(args)),
  };

  return {
    detect: async (content) => {
      await actions.detectContentType(content)(system);
      return state;
    },
    getState: () => state,
    selectors,
  };
};

const detect = async (content) => {
  const { detect: run, selectors } = buildSystem();
  const state = await run(content);
  return { state, selectors, contentType: selectors.selectContentType(state) };
};

describe('Arazzo content type detection', () => {
  describe('plugin wiring', () => {
    test('should expose selectIsContentTypeArazzo as an editor state selector', () => {
      const { selectors } = EditorContentTypePlugin().statePlugins.editor;

      expect(typeof selectors.selectIsContentTypeArazzo).toBe('function');
    });

    test('should read from state', () => {
      const { selectors } = EditorContentTypePlugin().statePlugins.editor;

      expect(selectors.selectIsContentTypeArazzo(Map({ contentType: null }))).toBe(false);
      expect(selectors.selectIsContentTypeArazzo(Map())).toBe(false);
      expect(
        selectors.selectIsContentTypeArazzo(
          Map({ contentType: 'application/vnd.oai.arazzo+yaml;version=1.0.1' })
        )
      ).toBe(true);
      expect(
        selectors.selectIsContentTypeArazzo(
          Map({ contentType: 'application/vnd.oai.openapi+yaml;version=3.1.0' })
        )
      ).toBe(false);
    });

    test('should infer the "arazzo" file name', () => {
      const { selectors } = EditorContentTypePlugin().statePlugins.editor;
      const state = Map({ contentType: 'application/vnd.oai.arazzo+yaml;version=1.0.0' });

      expect(selectors.selectInferFileNameFromContent(state)).toBe('arazzo');
    });
  });

  describe.each(['1.0.0', '1.0.1', '1.1.0'])('version %s', (version) => {
    test('should detect YAML', async () => {
      const { contentType, selectors, state } = await detect(
        `arazzo: ${version}\ninfo:\n  title: t\n  version: 1.0.0\n`
      );

      expect(contentType).toBe(`application/vnd.oai.arazzo+yaml;version=${version}`);
      expect(selectors.selectIsContentTypeArazzo(state)).toBe(true);
      expect(selectors.selectIsContentTypeOpenAPI(state)).toBe(false);
      expect(selectors.selectIsContentTypeAsyncAPI(state)).toBe(false);
      expect(selectors.selectIsContentFormatYAML(state)).toBe(true);
    });

    test('should detect quoted YAML', async () => {
      const { contentType } = await detect(`"arazzo": '${version}'\ninfo:\n  title: t\n`);

      expect(contentType).toBe(`application/vnd.oai.arazzo+yaml;version=${version}`);
    });

    test('should detect JSON', async () => {
      const { contentType, selectors, state } = await detect(
        JSON.stringify({ arazzo: version, info: { title: 't', version: '1' } }, null, 2)
      );

      expect(contentType).toBe(`application/vnd.oai.arazzo+json;version=${version}`);
      expect(selectors.selectIsContentTypeArazzo(state)).toBe(true);
      expect(selectors.selectIsContentFormatJSON(state)).toBe(true);
    });
  });

  describe('forward-compatible 1.x range', () => {
    // The detector accepts any 1.x.y (documented behaviour of the current regexes), so
    // 1.2.0 is classified as Arazzo even though the viewer only targets 1.0.x / 1.1.x.
    test('should currently detect 1.2.0 as Arazzo', async () => {
      const { contentType } = await detect('arazzo: 1.2.0\ninfo:\n  title: t\n');

      expect(contentType).toBe('application/vnd.oai.arazzo+yaml;version=1.2.0');
    });
  });

  describe('non-Arazzo content', () => {
    test.each([
      ['openapi YAML', 'openapi: 3.1.0\ninfo:\n  title: t\n  version: 1.0.0\npaths: {}\n'],
      ['openapi JSON', '{"openapi":"3.0.3","info":{"title":"t","version":"1"},"paths":{}}'],
      ['asyncapi YAML', 'asyncapi: 3.0.0\ninfo:\n  title: t\n  version: 1.0.0\n'],
      ['asyncapi JSON', '{"asyncapi":"2.6.0","info":{"title":"t","version":"1"}}'],
      ['arazzo 0.x YAML', 'arazzo: 0.9.0\ninfo:\n  title: t\n'],
      ['arazzo 0.x JSON', '{"arazzo":"0.9.0"}'],
      ['arazzo 2.0.0 YAML', 'arazzo: 2.0.0\ninfo:\n  title: t\n'],
      ['arazzo 2.0.0 JSON', '{"arazzo":"2.0.0"}'],
      ['arazzo version without patch', 'arazzo: 1.0\ninfo:\n  title: t\n'],
      ['apidom-ish JSON', '{"element":"arazzo","content":[]}'],
      ['arazzo only in a YAML comment', '# arazzo: 1.0.0\nfoo: bar\n'],
      ['arazzo only in an indented key', 'foo:\n  arazzo: 1.0.0\n'],
      ['arazzo only in a YAML string', 'description: "arazzo: 1.0.0"\nfoo: bar\n'],
      ['arazzo version only inside a JSON string', '{"description":"\\"arazzo\\": \\"1.0.0\\""}'],
    ])('should not detect %s as Arazzo', async (_, content) => {
      const { selectors, state } = await detect(content);

      expect(selectors.selectIsContentTypeArazzo(state)).toBe(false);
    });

    test.each([
      ['empty', ''],
      ['whitespace', '   \n'],
      ['malformed JSON', '{"arazzo": "1.0.0", '],
    ])('should not detect %s content as Arazzo', async (_, content) => {
      const { selectors, state } = await detect(content);

      expect(selectors.selectIsContentTypeArazzo(state)).toBe(false);
    });

    test('should fail detection for empty content', async () => {
      const { state, selectors } = await detect('');

      expect(selectors.selectContentType(state)).toBeNull();
      expect(selectors.selectContentTypeDetectionStatus(state)).toBe('failure');
    });

    test('should not detect malformed YAML with an arazzo line', async () => {
      const { selectors, state } = await detect('arazzo: 1.0.0\n  bad: [unclosed\n');

      expect(selectors.selectIsContentTypeArazzo(state)).toBe(false);
    });

    test('should classify plain JSON and YAML generically', async () => {
      expect((await detect('{"a":1}')).contentType).toBe('application/json');
      expect((await detect('a: 1\n')).contentType).toBe('text/yaml');
    });
  });

  describe('precedence', () => {
    test('should prefer OpenAPI over Arazzo when both keys are present (YAML)', async () => {
      const { contentType, selectors, state } = await detect('openapi: 3.1.0\narazzo: 1.0.0\n');

      expect(contentType).toBe('application/vnd.oai.openapi+yaml;version=3.1.0');
      expect(selectors.selectIsContentTypeArazzo(state)).toBe(false);
    });

    test('should prefer AsyncAPI over Arazzo when both keys are present (JSON)', async () => {
      const { contentType, selectors, state } = await detect(
        '{"asyncapi":"3.0.0","arazzo":"1.0.0"}'
      );

      expect(contentType).toBe('application/vnd.aai.asyncapi+json;version=3.0.0');
      expect(selectors.selectIsContentTypeArazzo(state)).toBe(false);
    });

    test('should detect Arazzo that references OpenAPI/AsyncAPI sources', async () => {
      const content = [
        'arazzo: 1.1.0',
        'info:',
        '  title: t',
        '  version: 1.0.0',
        'sourceDescriptions:',
        '  - name: api',
        '    url: https://example.com/openapi.yaml',
        '    type: openapi',
        '',
      ].join('\n');
      const { contentType } = await detect(content);

      expect(contentType).toBe('application/vnd.oai.arazzo+yaml;version=1.1.0');
    });

    test('should detect Arazzo that is also a JSON Schema carrier', async () => {
      const { contentType } = await detect(
        '{"$schema":"https://json-schema.org/draft/2020-12/schema","arazzo":"1.0.0"}'
      );

      expect(contentType).toBe('application/vnd.oai.arazzo+json;version=1.0.0');
    });
  });

  describe('Arazzo fixtures', () => {
    const fixtureSelectors =
      EditorContentFixturesPlugin().statePlugins.editorContentFixtures.selectors;
    const arazzoFixtureNames = Object.keys(fixtureSelectors).filter((name) =>
      name.startsWith('selectArazzo')
    );

    test('should expose all six Arazzo fixture selectors', () => {
      expect(arazzoFixtureNames.sort()).toEqual([
        'selectArazzo100BNPLYAML',
        'selectArazzo100FAPIPARYAML',
        'selectArazzo100LoginAndRetrievePetsYAML',
        'selectArazzo100OAuthYAML',
        'selectArazzo100PetCouponsYAML',
        'selectArazzo110AsyncAPIYAML',
      ]);
    });

    test.each([
      'selectArazzo100BNPLYAML',
      'selectArazzo100FAPIPARYAML',
      'selectArazzo100LoginAndRetrievePetsYAML',
      'selectArazzo100OAuthYAML',
      'selectArazzo100PetCouponsYAML',
      'selectArazzo110AsyncAPIYAML',
    ])('%s should be detected as Arazzo', async (name) => {
      const { contentType, selectors, state } = await detect(fixtureSelectors[name]());
      const expectedVersion = name.includes('110') ? '1.1.0' : '1.0.0';

      expect(contentType).toBe(`application/vnd.oai.arazzo+yaml;version=${expectedVersion}`);
      expect(selectors.selectIsContentTypeArazzo(state)).toBe(true);
    });

    test.each([
      'selectOpenAPI320PetstoreYAML',
      'selectOpenAPI20PetstoreYAML',
      'selectAsyncAPI300PetstoreYAML',
      'selectJSONSchema202012YAML',
      'selectAPIDesignSystemsYAML',
    ])('non-Arazzo fixture %s should not be detected as Arazzo', async (name) => {
      const { selectors, state } = await detect(fixtureSelectors[name]());

      expect(selectors.selectIsContentTypeArazzo(state)).toBe(false);
    });
  });
});
