import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineArazzoViewer } from 'arazzo-viewer';

import loadArazzoSources from '../utils/sources.js';

defineArazzoViewer();

const EditorPreviewArazzo = ({ editorSelectors }) => {
  const ref = useRef(null);
  const content = editorSelectors.selectContent();

  useEffect(() => {
    if (ref.current) {
      ref.current.source = content;
    }
  }, [content]);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(async () => {
      const sources = await loadArazzoSources(content);
      if (current && ref.current) ref.current.sources = sources;
    }, 500);
    return () => {
      current = false;
      clearTimeout(timer);
    };
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
