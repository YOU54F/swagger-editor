import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineArazzoViewer } from 'arazzo-viewer';

defineArazzoViewer();

const EditorPreviewArazzo = ({ editorSelectors }) => {
  const ref = useRef(null);
  const content = editorSelectors.selectContent();

  useEffect(() => {
    if (ref.current) {
      ref.current.source = content;
    }
  }, [content]);

  return (
    <section className="swagger-editor__editor-preview-arazzo">
      <arazzo-viewer ref={ref} />
    </section>
  );
};

EditorPreviewArazzo.propTypes = {
  editorSelectors: PropTypes.shape({
    selectContent: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditorPreviewArazzo;
