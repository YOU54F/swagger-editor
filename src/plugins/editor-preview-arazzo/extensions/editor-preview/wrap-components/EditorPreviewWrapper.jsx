import React from 'react';
import PropTypes from 'prop-types';

const EditorPreviewWrapper = (Original, system) => {
  const EditorPreview = ({ editorSelectors, getComponent }) => {
    const EditorPreviewArazzo = getComponent('EditorPreviewArazzo', true);

    return editorSelectors.selectIsContentTypeArazzo() ? (
      <EditorPreviewArazzo />
    ) : (
      <Original {...system} /> // eslint-disable-line react/jsx-props-no-spreading
    );
  };

  EditorPreview.propTypes = {
    editorSelectors: PropTypes.oneOfType([
      PropTypes.shape({
        selectIsContentTypeArazzo: PropTypes.func.isRequired,
      }),
    ]).isRequired,
    getComponent: PropTypes.func.isRequired,
  };

  return EditorPreview;
};

export default EditorPreviewWrapper;
