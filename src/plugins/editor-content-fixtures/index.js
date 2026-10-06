import selectOpenAPI320PetstoreYAML from './selectors/selectOpenAPI320PetstoreYAML.js';
import selectOpenAPI310PetstoreYAML from './selectors/selectOpenAPI310PetstoreYAML.js';
import selectOpenAPI304PetstoreYAML from './selectors/selectOpenAPI304PetstoreYAML.js';
import selectOpenAPI20PetstoreYAML from './selectors/selectOpenAPI20PetstoreYAML.js';
import selectAsyncAPI260PetstoreYAML from './selectors/selectAsyncAPI260PetstoreYAML.js';
import selectAsyncAPI300PetstoreYAML from './selectors/selectAsyncAPI300PetstoreYAML.js';
import selectAsyncAPI260StreetlightsYAML from './selectors/selectAsyncAPI260StreetlightsYAML.js';
import selectAsyncAPI300StreetlightsYAML from './selectors/selectAsyncAPI300StreetlightsYAML.js';
import selectJSONSchema202012YAML from './selectors/selectJSONSchema202012YAML.js';
import selectAPIDesignSystemsYAML from './selectors/selectAPIDesignSystemsYAML.js';
import selectArazzo100LoginAndRetrievePetsYAML from './selectors/selectArazzo100LoginAndRetrievePetsYAML.js';
import selectArazzo100PetCouponsYAML from './selectors/selectArazzo100PetCouponsYAML.js';
import selectArazzo100OAuthYAML from './selectors/selectArazzo100OAuthYAML.js';
import selectArazzo110AsyncAPIYAML from './selectors/selectArazzo110AsyncAPIYAML.js';
import selectArazzo100BNPLYAML from './selectors/selectArazzo100BNPLYAML.js';
import selectArazzo100FAPIPARYAML from './selectors/selectArazzo100FAPIPARYAML.js';
// test

const EditorContentFixturesPlugin = () => ({
  statePlugins: {
    editorContentFixtures: {
      selectors: {
        selectOpenAPI320PetstoreYAML,
        selectOpenAPI310PetstoreYAML,
        selectOpenAPI304PetstoreYAML,
        selectOpenAPI20PetstoreYAML,
        selectAsyncAPI260PetstoreYAML,
        selectAsyncAPI300PetstoreYAML,
        selectAsyncAPI260StreetlightsYAML,
        selectAsyncAPI300StreetlightsYAML,
        selectJSONSchema202012YAML,
        selectAPIDesignSystemsYAML,
        selectArazzo100LoginAndRetrievePetsYAML,
        selectArazzo100PetCouponsYAML,
        selectArazzo100OAuthYAML,
        selectArazzo110AsyncAPIYAML,
        selectArazzo100BNPLYAML,
        selectArazzo100FAPIPARYAML,
      },
    },
  },
});

export default EditorContentFixturesPlugin;
