import EditorPreviewArazzo from './components/EditorPreviewArazzo.jsx';
import EditorPreviewWrapper from './extensions/editor-preview/wrap-components/EditorPreviewWrapper.jsx';

/**
 * Previews Arazzo workflow descriptions (1.0.x and 1.1.x) using the embeddable
 * <arazzo-viewer> web component. The viewer parses the content itself, so no
 * parse state is kept in the store.
 */
const EditorPreviewArazzoPlugin = () => ({
  components: {
    EditorPreviewArazzo,
  },
  wrapComponents: {
    EditorPreviewPane: EditorPreviewWrapper,
  },
});

export default EditorPreviewArazzoPlugin;
