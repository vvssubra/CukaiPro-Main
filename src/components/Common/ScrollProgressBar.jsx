import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

function ScrollProgressBar() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const widthPercent = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const widthSpring = useSpring(widthPercent, { stiffness: 100, damping: 30 });
  const widthStyle = useTransform(widthSpring, (v) => `${Math.max(0, v)}%`);

  if (shouldReduce) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[200] h-[3px] overflow-hidden rounded-r pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className="h-full rounded-r bg-gradient-to-r from-emerald-300 to-primary"
        style={{ width: widthStyle }}
      />
    </div>
  );
}

export default ScrollProgressBar;
