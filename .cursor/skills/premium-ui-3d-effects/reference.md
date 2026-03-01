# Premium UI & 3D Effects -- Reference

## Tailwind CSS Utility Cheatsheet

### Backdrop & Blur

| Class | Effect |
|-------|--------|
| `backdrop-blur-sm` | 4px blur |
| `backdrop-blur` | 8px blur |
| `backdrop-blur-md` | 12px blur |
| `backdrop-blur-lg` | 16px blur |
| `backdrop-blur-xl` | 24px blur |
| `backdrop-blur-2xl` | 40px blur |
| `backdrop-blur-3xl` | 64px blur |
| `backdrop-saturate-150` | Boost color through glass |
| `backdrop-brightness-110` | Lighten through glass |

### Opacity Backgrounds

Use `bg-{color}/{opacity}` for semi-transparent fills:

```
bg-white/5   bg-white/10  bg-white/15  bg-white/20
bg-black/5   bg-black/10  bg-black/20  bg-black/40
bg-indigo-500/20  bg-purple-500/30
```

### Transform Utilities

| Class | CSS |
|-------|-----|
| `[perspective:800px]` | `perspective: 800px` |
| `[transform-style:preserve-3d]` | `transform-style: preserve-3d` |
| `[backface-visibility:hidden]` | `backface-visibility: hidden` |
| `[transform:translateZ(40px)]` | `transform: translateZ(40px)` |
| `rotate-x-12` (custom) | `transform: rotateX(12deg)` |

### Shadow Presets

**Elevation system** (add to `tailwind.config.js`):

```js
boxShadow: {
  'elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
  'elevation-2': '0 3px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
  'elevation-3': '0 10px 20px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)',
  'elevation-4': '0 15px 25px rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.06), 0 30px 50px rgba(0,0,0,0.08)',
  'glow-indigo': '0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2)',
  'glow-purple': '0 0 20px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.2)',
  'glow-pink': '0 0 20px rgba(236,72,153,0.4), 0 0 60px rgba(236,72,153,0.2)',
  'neu-light': '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
  'neu-light-inset': 'inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff',
  'neu-dark': '6px 6px 12px #1a1a2e, -6px -6px 12px #2a2a4a',
  'neu-dark-inset': 'inset 4px 4px 8px #1a1a2e, inset -4px -4px 8px #2a2a4a',
},
```

### Gradient Presets

```js
// tailwind.config.js extend
backgroundImage: {
  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  'mesh-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'mesh-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'mesh-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
},
```

---

## Framer Motion Reference

### Motion Value Patterns

**Mouse-tracked tilt** (full implementation):

```jsx
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

function TiltCard({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 300, damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 300, damping: 20,
  });

  function handleMouse(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="[perspective:1000px]"
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="[transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

**Scroll-linked parallax** (full implementation):

```jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function ParallaxSection({ children, speed = 0.5 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
```

### Animation Variants Library

```jsx
// Fade + slide up
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Scale in
const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

// Slide from left
const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Stagger container
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Blur in
const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8 } },
};

// Flip in (3D)
const flipIn = {
  hidden: { opacity: 0, rotateX: -90 },
  visible: { opacity: 1, rotateX: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
};
```

### Spring Presets

| Name | Stiffness | Damping | Use Case |
|------|-----------|---------|----------|
| Snappy | 400 | 15 | Buttons, toggles |
| Smooth | 200 | 25 | Cards, modals |
| Bouncy | 300 | 10 | Playful elements |
| Gentle | 120 | 20 | Page transitions |
| Heavy | 150 | 30 | Large elements |

### Easing Curves

```jsx
// Premium easing curves
const easings = {
  smooth: [0.22, 1, 0.36, 1],     // ease-out-quint -- premium feel
  snappy: [0.16, 1, 0.3, 1],      // ease-out-expo -- responsive
  bounce: [0.34, 1.56, 0.64, 1],  // overshoot -- playful
  gentle: [0.4, 0, 0.2, 1],       // material design standard
};
```

---

## CSS Custom Properties for Theming

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: 20px;
  --shadow-color: 220 3% 15%;
  --shadow-elevation-low: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.34),
    0.4px 0.8px 1px -1.2px hsl(var(--shadow-color) / 0.34);
  --shadow-elevation-mid: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.36),
    0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.36),
    2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.36);
  --shadow-elevation-high: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.34),
    1.5px 2.9px 3.7px -0.4px hsl(var(--shadow-color) / 0.34),
    2.7px 5.4px 6.8px -0.7px hsl(var(--shadow-color) / 0.34),
    4.5px 8.9px 11.2px -1.1px hsl(var(--shadow-color) / 0.34),
    7.1px 14.3px 18px -1.4px hsl(var(--shadow-color) / 0.34);
}

.dark {
  --glass-bg: rgba(0, 0, 0, 0.2);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

---

## Performance Optimization Patterns

### Debounced Mouse Handler

```jsx
import { useCallback } from "react";

function useDebouncedMouse(callback, delay = 16) {
  const lastCall = useRef(0);
  return useCallback((e) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(e);
    }
  }, [callback, delay]);
}
```

### Intersection Observer for Lazy Effects

```jsx
import { useInView } from "framer-motion";

function LazyEffect({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref}>
      {isInView && children}
    </div>
  );
}
```

### GPU Layer Hints

Only promote elements that are actively animating:

```jsx
<motion.div
  onAnimationStart={() => el.style.willChange = "transform"}
  onAnimationComplete={() => el.style.willChange = "auto"}
>
```
