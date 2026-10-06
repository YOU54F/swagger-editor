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

  // Follow the editor cursor. Moves made through the API (a line button in the preview) are skipped,
  // and the viewer is not focused, so typing is never interrupted.
  useEffect(() => {
    let subscription;
    const attach = () => {
      const editor = editorSelectors.selectEditor();
      if (!editor || !ref.current) return false;
      subscription = editor.onDidChangeCursorPosition((e) => {
        if (e.source !== 'api') ref.current?.revealLine(e.position.lineNumber, { focus: false });
      });
      return true;
    };
    let poll;
    if (!attach()) {
      poll = setInterval(() => {
        if (attach()) clearInterval(poll);
      }, 250);
    }
    return () => {
      clearInterval(poll);
      subscription?.dispose();
    };
  }, [editorSelectors]);

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
      <arazzo-viewer ref={ref} theme="light" />
    </section>
  );
};

EditorPreviewArazzo.propTypes = {
  editorSelectors: PropTypes.shape({
    selectContent: PropTypes.func.isRequired,
    selectEditor: PropTypes.func.isRequired,
  }).isRequired,
  editorActions: PropTypes.shape({
    setPosition: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditorPreviewArazzo;
