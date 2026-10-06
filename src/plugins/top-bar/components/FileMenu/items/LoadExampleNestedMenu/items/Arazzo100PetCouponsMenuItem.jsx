import PropTypes from 'prop-types';

const Arazzo100PetCouponsMenuItem = ({ getComponent, onClick, children = null }) => {
  const DropdownMenuItem = getComponent('DropdownMenuItem');

  return <DropdownMenuItem onClick={onClick}>{children || 'Arazzo 1.0 Pet Coupons'}</DropdownMenuItem>;
};

Arazzo100PetCouponsMenuItem.propTypes = {
  getComponent: PropTypes.func.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

export default Arazzo100PetCouponsMenuItem;
