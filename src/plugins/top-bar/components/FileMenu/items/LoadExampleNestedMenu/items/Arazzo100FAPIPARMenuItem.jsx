import PropTypes from 'prop-types';

const Arazzo100FAPIPARMenuItem = ({ getComponent, onClick, children = null }) => {
  const DropdownMenuItem = getComponent('DropdownMenuItem');

  return <DropdownMenuItem onClick={onClick}>{children || 'Arazzo 1.0 FAPI PAR'}</DropdownMenuItem>;
};

Arazzo100FAPIPARMenuItem.propTypes = {
  getComponent: PropTypes.func.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

export default Arazzo100FAPIPARMenuItem;
