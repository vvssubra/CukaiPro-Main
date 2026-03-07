import PropTypes from 'prop-types';

const SHADOW_LAYERED =
  '0 1px 2px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07), 0 12px 24px rgba(0,0,0,0.07), 0 24px 48px rgba(0,0,0,0.07)';
const SHADOW_LAYERED_EMERALD_GLOW =
  '0 1px 2px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07), 0 12px 24px rgba(0,0,0,0.07), 0 24px 48px rgba(0,0,0,0.07), 0 0 40px rgba(16,185,129,0.2)';

function LayeredShadowCard({ children, className = '', glow = false }) {
  const boxShadow = glow === 'emerald' || glow === true ? SHADOW_LAYERED_EMERALD_GLOW : SHADOW_LAYERED;

  return (
    <div
      className={className}
      style={{ boxShadow }}
    >
      {children}
    </div>
  );
}

LayeredShadowCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  glow: PropTypes.oneOf([false, true, 'emerald']),
};

export default LayeredShadowCard;
