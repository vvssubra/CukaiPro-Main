import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03, delayChildren: 0.15 },
  },
};

const characterVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function AnimatedGradientText({
  text,
  className = '',
  gradientClass = 'gradient-text',
  as: Component = 'span',
}) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <Component className={`${gradientClass} ${className}`.trim()}>
        {text}
      </Component>
    );
  }

  const characters = text.split('');

  return (
    <motion.span
      className={`inline-block ${className}`.trim()}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          className={gradientClass}
          variants={characterVariants}
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

AnimatedGradientText.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  gradientClass: PropTypes.string,
  as: PropTypes.elementType,
};

export default AnimatedGradientText;
