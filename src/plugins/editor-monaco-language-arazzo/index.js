import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-unresolved -- resolved via the package "exports" map
import { registerArazzoLanguage } from 'arazzo-viewer/language';

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
    const { validate } = registerArazzoLanguage(monaco, LANGUAGE_ID, () => ({}), isArazzo);

    const track = (model) => {
      if (model.getLanguageId() !== LANGUAGE_ID) return;
      validate(model);
      model.onDidChangeContent(() => validate(model));
    };
    monaco.editor.getModels().forEach(track);
    monaco.editor.onDidCreateModel(track);
    monaco.editor.onDidChangeModelLanguage(({ model }) => track(model));
  },
});

export default EditorMonacoLanguageArazzoPlugin;
