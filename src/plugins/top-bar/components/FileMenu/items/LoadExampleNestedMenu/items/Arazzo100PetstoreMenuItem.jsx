import PropTypes from 'prop-types';

const Arazzo100PetstoreMenuItem = ({ getComponent, onClick, children = null }) => {
  const DropdownMenuItem = getComponent('DropdownMenuItem');

  return <DropdownMenuItem onClick={onClick}>{children || 'Arazzo 1.0 Petstore'}</DropdownMenuItem>;
};

Arazzo100PetstoreMenuItem.propTypes = {
  getComponent: PropTypes.func.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

export default Arazzo100PetstoreMenuItem;
