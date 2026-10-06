import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-unresolved -- resolved via the package "exports" map
import { registerArazzoLanguage, buildSources } from 'arazzo-viewer/language';

import loadArazzoSources from '../editor-preview-arazzo/utils/sources.js';

// the editor's own language id (see editor-monaco-language-apidom)
const LANGUAGE_ID = 'apidom';
const ARAZZO_RE = /^\s*["']?arazzo["']?\s*:\s*["']?1\.\d+\.\d+/m;
const ARAZZO_JSON_RE = /"arazzo"\s*:\s*"1\.\d+\.\d+"/;

const isArazzo = (model) => {
  const head = model.getValue().slice(0, 4096);
  return ARAZZO_RE.test(head) || ARAZZO_JSON_RE.test(head);
};

/**
 * Completion, hover and diagnostics for Arazzo documents. Providers are
 * registered once on the editor's language and stay inert for other content.
 */
const EditorMonacoLanguageArazzoPlugin = () => ({
  afterLoad() {
    let sources = {};
    const { validate } = registerArazzoLanguage(monaco, LANGUAGE_ID, () => ({ sources }), isArazzo);

    let timer;
    const refreshSources = (model) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (!isArazzo(model)) return;
        sources = buildSources(await loadArazzoSources(model.getValue()));
        validate(model);
      }, 500);
    };

    const track = (model) => {
      if (model.getLanguageId() !== LANGUAGE_ID) return;
      validate(model);
      refreshSources(model);
      model.onDidChangeContent(() => {
        validate(model);
        refreshSources(model);
      });
    };
    monaco.editor.getModels().forEach(track);
    monaco.editor.onDidCreateModel(track);
    monaco.editor.onDidChangeModelLanguage(({ model }) => track(model));
  },
});

export default EditorMonacoLanguageArazzoPlugin;
