import PropTypes from 'prop-types';

const Arazzo100OAuthMenuItem = ({ getComponent, onClick, children = null }) => {
  const DropdownMenuItem = getComponent('DropdownMenuItem');

  return <DropdownMenuItem onClick={onClick}>{children || 'Arazzo 1.0 OAuth'}</DropdownMenuItem>;
};

Arazzo100OAuthMenuItem.propTypes = {
  getComponent: PropTypes.func.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

export default Arazzo100OAuthMenuItem;
