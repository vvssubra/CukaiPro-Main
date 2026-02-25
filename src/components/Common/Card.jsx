import PropTypes from 'prop-types';

/**
 * Shared card container: elevation, radius, border, optional hover. Use for dashboard and list panels.
 */
function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`card ${hover ? 'card-hover transition-shadow duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

export default Card;
