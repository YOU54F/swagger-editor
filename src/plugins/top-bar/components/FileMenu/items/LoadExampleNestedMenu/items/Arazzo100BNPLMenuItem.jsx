import PropTypes from 'prop-types';

const Arazzo100BNPLMenuItem = ({ getComponent, onClick, children = null }) => {
  const DropdownMenuItem = getComponent('DropdownMenuItem');

  return <DropdownMenuItem onClick={onClick}>{children || 'Arazzo 1.0 Buy Now Pay Later'}</DropdownMenuItem>;
};

Arazzo100BNPLMenuItem.propTypes = {
  getComponent: PropTypes.func.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

export default Arazzo100BNPLMenuItem;
