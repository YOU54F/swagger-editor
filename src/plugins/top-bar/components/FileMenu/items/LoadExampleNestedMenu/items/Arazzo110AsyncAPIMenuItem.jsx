import PropTypes from 'prop-types';

const Arazzo110AsyncAPIMenuItem = ({ getComponent, onClick, children = null }) => {
  const DropdownMenuItem = getComponent('DropdownMenuItem');

  return <DropdownMenuItem onClick={onClick}>{children || 'Arazzo 1.1 AsyncAPI'}</DropdownMenuItem>;
};

Arazzo110AsyncAPIMenuItem.propTypes = {
  getComponent: PropTypes.func.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

export default Arazzo110AsyncAPIMenuItem;
