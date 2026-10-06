import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineArazzoViewer, NAVIGATE_EVENT } from 'arazzo-viewer';

import loadArazzoSources from '../utils/sources.js';

defineArazzoViewer();

const EditorPreviewArazzo = ({ editorSelectors, editorActions }) => {
  const ref = useRef(null);
  const content = editorSelectors.selectContent();

  useEffect(() => {
    if (ref.current) {
      ref.current.source = content;
    }
  }, [content]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onNavigate = (e) => editorActions.setPosition({ lineNumber: e.detail.line, column: 1 });
    el.addEventListener(NAVIGATE_EVENT, onNavigate);
    return () => el.removeEventListener(NAVIGATE_EVENT, onNavigate);
  }, [editorActions]);

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
  editorActions: PropTypes.shape({
    setPosition: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditorPreviewArazzo;
