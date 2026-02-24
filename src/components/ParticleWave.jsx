import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DOT_SPACING = 28;
const BASE_RADIUS = 1.2;
const RADIUS_AMPLITUDE = 0.8;
const WAVE_SPEED = 0.0004;
const WAVE_SCALE_X = 0.008;
const WAVE_SCALE_Y = 0.006;
const DEPTH_SHIFT = 4;
const DOT_COLOR = 'rgba(255, 255, 255, 0.3)';

function ParticleWave({ className = '', dotColor = DOT_COLOR }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t) => {
      if (!startTimeRef.current) startTimeRef.current = t;
      const time = (t - startTimeRef.current) * WAVE_SPEED;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / DOT_SPACING) + 2;
      const rows = Math.ceil(height / DOT_SPACING) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * DOT_SPACING;
          const baseY = j * DOT_SPACING;

          const wave1 = Math.sin(baseX * WAVE_SCALE_X + time * Math.PI * 2) * 0.5;
          const wave2 = Math.cos(baseY * WAVE_SCALE_Y + time * Math.PI * 2 * 0.7) * 0.5;
          const wave3 = Math.sin((baseX + baseY) * 0.004 + time * Math.PI * 2 * 0.5) * 0.5;

          const combined = wave1 + wave2 + wave3;
          const radius = Math.max(0.2, BASE_RADIUS + combined * RADIUS_AMPLITUDE);
          const shiftX = Math.sin(baseY * 0.003 + time) * DEPTH_SHIFT;
          const shiftY = Math.cos(baseX * 0.003 + time * 0.8) * DEPTH_SHIFT;

          const x = baseX + shiftX;
          const y = baseY + shiftY;

          const alpha = 0.15 + 0.2 * (0.5 + combined * 0.5);
          const a = Math.max(0.08, Math.min(0.5, alpha));
          const fillColor = dotColor.replace(/,?\s*[\d.]+\)$/, `, ${a})`);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    setSize();
    animationRef.current = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(() => {
      setSize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [dotColor]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

ParticleWave.propTypes = {
  className: PropTypes.string,
  dotColor: PropTypes.string,
};

export default ParticleWave;
