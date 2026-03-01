---
name: premium-ui-3d-effects
description: Generates premium UI components with 3D effects, glassmorphism, neumorphism, advanced animations, parallax, particles, and micro-interactions using Tailwind CSS and Framer Motion. Use when building visually rich interfaces, adding depth or motion to components, creating landing pages, hero sections, cards with 3D transforms, or when the user mentions premium UI, 3D effects, glassmorphism, neumorphism, parallax, or advanced animations.
---

# Premium UI Design & 3D Effects

Build visually stunning, performance-conscious interfaces with depth, motion, and polish using Tailwind CSS and Framer Motion.

## Core Principles

1. **Depth through layers** -- combine transforms, shadows, and blur to create convincing depth
2. **Motion with purpose** -- every animation should guide attention or provide feedback
3. **Performance first** -- GPU-accelerated properties only (`transform`, `opacity`, `filter`); avoid animating `width`, `height`, `top`, `left`
4. **Progressive enhancement** -- effects degrade gracefully; core content remains accessible
5. **Respect user preferences** -- honor `prefers-reduced-motion` and `prefers-color-scheme`

## Quick Decision Guide

| Effect | Best For | Complexity |
|--------|----------|------------|
| Glassmorphism | Cards, modals, nav overlays | Low |
| Neumorphism | Buttons, toggles, input fields | Low |
| 3D Transforms | Cards, product showcases, heroes | Medium |
| Layered Shadows | Elevation hierarchy, floating elements | Low |
| Gradients | Backgrounds, text accents, borders | Low |
| Micro-interactions | Buttons, inputs, toggles, icons | Medium |
| Parallax | Hero sections, scroll storytelling | Medium |
| Particles/WebGL | Backgrounds, heroes, immersive pages | High |
| Text Effects | Headlines, hero text, brand elements | Medium |
| Complex Animations | Page transitions, orchestrated sequences | High |

## 1. Glassmorphism

Use `backdrop-blur` + semi-transparent background + subtle border.

```jsx
<div className="relative rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
  {children}
</div>
```

Tailwind classes: `backdrop-blur-sm | md | lg | xl | 2xl | 3xl`, `bg-white/5` through `bg-white/20`, `border-white/10` through `border-white/30`.

Dark mode variant: swap to `bg-black/20 border-white/10`.

## 2. Neumorphism

Dual inset/outset shadows on a matching background.

```jsx
<button className="rounded-2xl bg-slate-200 px-6 py-3 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] transition-shadow active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:bg-slate-800 dark:shadow-[6px_6px_12px_#1a1a2e,-6px_-6px_12px_#2a2a4a] dark:active:shadow-[inset_4px_4px_8px_#1a1a2e,inset_-4px_-4px_8px_#2a2a4a]">
  Click me
</button>
```

Keep background color close to the page background for realistic depth.

## 3. CSS 3D Transforms & Perspective

Set `perspective` on the parent, apply `rotateX/Y/Z` and `translateZ` on children.

```jsx
<motion.div
  className="group [perspective:1000px]"
  onMouseMove={handleMouse}
>
  <motion.div
    className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-2xl [transform-style:preserve-3d]"
    style={{ rotateX, rotateY }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="[transform:translateZ(40px)]">
      <h3>Floating content</h3>
    </div>
  </motion.div>
</motion.div>
```

Framer Motion `useMotionValue` + `useTransform` for smooth mouse-tracked tilt:

```jsx
const x = useMotionValue(0);
const y = useMotionValue(0);
const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

function handleMouse(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  x.set((e.clientX - rect.left) / rect.width - 0.5);
  y.set((e.clientY - rect.top) / rect.height - 0.5);
}
```

## 4. Layered Shadows & Depth

Stack multiple `box-shadow` values for realistic elevation.

```jsx
// Tailwind custom shadow utility
className="shadow-[0_1px_2px_rgba(0,0,0,0.07),0_4px_8px_rgba(0,0,0,0.07),0_12px_24px_rgba(0,0,0,0.07),0_24px_48px_rgba(0,0,0,0.07)]"
```

Elevation scale: `sm` (1 layer) -> `md` (2 layers) -> `lg` (3 layers) -> `xl` (4 layers).

Use colored shadows for glow effects: `shadow-[0_0_30px_rgba(99,102,241,0.4)]`.

## 5. Advanced Gradients

**Mesh gradient** -- overlay multiple radial gradients:

```jsx
<div className="relative h-64 overflow-hidden rounded-2xl">
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.6),transparent_50%)]" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.4),transparent_50%)]" />
</div>
```

**Animated gradient**: use `bg-[length:200%_200%]` with Framer Motion or CSS `@keyframes`.

**Gradient text**: `bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`.

**Gradient borders**: use pseudo-elements or `border-image` with a gradient.

## 6. Micro-Interactions

Use Framer Motion `whileHover`, `whileTap`, `whileFocus` for instant feedback.

```jsx
<motion.button
  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
  className="rounded-xl bg-indigo-600 px-6 py-3 text-white"
>
  Action
</motion.button>
```

Common micro-interaction patterns:
- **Magnetic button**: element shifts toward cursor on hover
- **Ripple effect**: expanding circle from click point
- **Morphing icon**: icon shape transitions on state change
- **Loading shimmer**: `animate-pulse` or custom shimmer gradient

## 7. Parallax & Scroll Effects

Use Framer Motion `useScroll` + `useTransform` for scroll-linked motion.

```jsx
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

<motion.div style={{ y, opacity }}>
  <h1>Hero Content</h1>
</motion.div>
```

For element-scoped parallax, pass `target` ref to `useScroll`:

```jsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"],
});
```

## 8. Particles & WebGL

For particle backgrounds, use `@tsparticles/react` (lightweight) or Three.js via `@react-three/fiber` for full 3D.

**tsParticles** -- simple ambient particles:

```jsx
import Particles from "@tsparticles/react";

<Particles
  options={{
    particles: {
      number: { value: 50 },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 1 },
      opacity: { value: { min: 0.1, max: 0.5 } },
      links: { enable: true, distance: 150, opacity: 0.2 },
    },
  }}
/>
```

**React Three Fiber** -- for immersive 3D scenes. Wrap in `Canvas`, use `useFrame` for animation loops. Always wrap in `Suspense` with a fallback.

## 9. Premium Typography

**Gradient text**:
```jsx
<h1 className="bg-gradient-to-r from-white via-blue-200 to-indigo-400 bg-clip-text text-5xl font-bold text-transparent">
  Premium Heading
</h1>
```

**Text shadow glow**: `[text-shadow:0_0_20px_rgba(99,102,241,0.5)]`

**Animated text reveal** (Framer Motion stagger):

```jsx
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const child = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

<motion.h1 variants={container} initial="hidden" animate="visible" className="text-5xl font-bold">
  {"Premium Text".split("").map((char, i) => (
    <motion.span key={i} variants={child}>{char}</motion.span>
  ))}
</motion.h1>
```

## 10. Complex Animations

**Orchestrated sequences** with Framer Motion `staggerChildren` and `delayChildren`:

```jsx
const stagger = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
```

**Layout animations**: use `layout` prop on `motion` elements for smooth reflows.

**Page transitions**: wrap routes in `AnimatePresence` with `exit` variants.

**Spring physics**: prefer `type: "spring"` with `stiffness` (100-500), `damping` (10-30), `mass` (0.5-2) over duration-based easing.

## Performance & Accessibility

### Performance Budget
- Limit simultaneous animations to 8-10 elements
- Use `will-change: transform` sparingly (only during animation)
- Prefer `transform` and `opacity` -- these run on the compositor thread
- Debounce `mousemove` handlers to 16ms (one frame at 60fps)
- Lazy-load heavy effects (particles, WebGL) below the fold
- Use `content-visibility: auto` for off-screen sections

### Reduced Motion

Always provide a reduced-motion fallback:

```jsx
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

<motion.div
  animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
  transition={prefersReducedMotion ? {} : { repeat: Infinity, duration: 2 }}
>
```

Or with Framer Motion's built-in hook:

```jsx
import { useReducedMotion } from "framer-motion";
const shouldReduce = useReducedMotion();
```

### Accessibility Checklist
- [ ] All animated elements have meaningful content accessible without motion
- [ ] Contrast ratios meet WCAG AA (4.5:1 text, 3:1 large text) even through glass/blur
- [ ] Interactive 3D elements are keyboard navigable
- [ ] `aria-label` or visible text on icon-only animated buttons
- [ ] No content is conveyed solely through color or animation

## Additional Resources

- For detailed CSS/Tailwind reference, see [reference.md](reference.md)
- For full component examples, see [examples.md](examples.md)
