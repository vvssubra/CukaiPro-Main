import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 400, damping: 15 };

const MotionLink = motion(Link);
const MotionA = motion.a;
const MotionButton = motion.button;

function PremiumButton({
  to,
  href,
  variant = 'primary',
  children,
  className = '',
  onClick,
  ...rest
}) {
  const shouldReduce = useReducedMotion();

  const hoverTapProps = useMemo(() => {
    if (shouldReduce) return {};
    return {
      whileHover: { scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
      whileTap: { scale: 0.97 },
      transition: spring,
    };
  }, [shouldReduce]);

  const baseClass =
    'inline-flex items-center justify-center gap-2 font-bold text-lg rounded-xl px-8 py-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';
  const variantClass =
    variant === 'primary'
      ? 'bg-white text-primary hover:bg-white/90 focus:ring-white/30'
      : 'border border-white/30 text-white hover:bg-white/10 focus:ring-white/30';

  const combinedClassName = `${baseClass} ${variantClass} ${className}`.trim();

  if (to) {
    return (
      <MotionLink
        to={to}
        className={combinedClassName}
        {...hoverTapProps}
        {...rest}
      >
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <MotionA
        href={href}
        className={combinedClassName}
        {...hoverTapProps}
        {...rest}
      >
        {children}
      </MotionA>
    );
  }

  return (
    <MotionButton
      type="button"
      className={combinedClassName}
      onClick={onClick}
      {...hoverTapProps}
      {...rest}
    >
      {children}
    </MotionButton>
  );
}

PremiumButton.propTypes = {
  to: PropTypes.string,
  href: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default PremiumButton;
