import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

const SHADOW_ELEVATION =
  '0 1px 2px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07), 0 12px 24px rgba(0,0,0,0.07), 0 24px 48px rgba(0,0,0,0.07)';
const SHADOW_GLOW_EMERALD =
  '0 1px 2px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07), 0 12px 24px rgba(0,0,0,0.07), 0 24px 48px rgba(0,0,0,0.07), 0 0 30px rgba(16,185,129,0.25)';

function TiltCard3D({
  children,
  className = '',
  enableTilt = true,
  shadowVariant = 'elevation',
  innerTranslateZ = false,
}) {
  const shouldReduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 20 });

  const handleMouse = useCallback(
    (e) => {
      if (shouldReduce || !enableTilt) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [shouldReduce, enableTilt, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const boxShadow =
    shadowVariant === 'glow-emerald' ? SHADOW_GLOW_EMERALD : SHADOW_ELEVATION;
  const tiltStyle =
    shouldReduce || !enableTilt
      ? { boxShadow }
      : { rotateX, rotateY, boxShadow };

  return (
    <motion.div
      className={`[perspective:800px] ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="[transform-style:preserve-3d]"
        style={tiltStyle}
      >
        {innerTranslateZ ? (
          <div style={{ transform: 'translateZ(40px)' }}>{children}</div>
        ) : (
          children
        )}
      </motion.div>
    </motion.div>
  );
}

TiltCard3D.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  enableTilt: PropTypes.bool,
  shadowVariant: PropTypes.oneOf(['elevation', 'glow-emerald']),
  innerTranslateZ: PropTypes.bool,
};

export default TiltCard3D;
