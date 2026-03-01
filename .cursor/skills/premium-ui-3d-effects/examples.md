# Premium UI & 3D Effects -- Component Examples

Complete, copy-paste-ready React components using Tailwind CSS and Framer Motion.

---

## 1. Glass Card

```jsx
import { motion } from "framer-motion";

function GlassCard({ title, description, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </motion.div>
  );
}
```

---

## 2. 3D Tilt Card with Floating Layers

```jsx
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function TiltCard({ image, title, subtitle, tag }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 20 });

  function handleMouse(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.div
      className="[perspective:1000px]"
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div
        className="relative w-80 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        <img src={image} alt={title} className="h-48 w-full object-cover" />
        <div className="p-6 [transform:translateZ(30px)]">
          <span className="mb-2 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400">
            {tag}
          </span>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 [transform:translateZ(2px)]" />
      </motion.div>
    </motion.div>
  );
}
```

---

## 3. Neumorphic Toggle

```jsx
import { useState } from "react";
import { motion } from "framer-motion";

function NeuToggle({ label, defaultChecked = false, onChange }) {
  const [checked, setChecked] = useState(defaultChecked);

  function toggle() {
    setChecked(!checked);
    onChange?.(!checked);
  }

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      className="flex items-center gap-3 rounded-2xl bg-slate-200 p-2 shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] dark:bg-slate-800 dark:shadow-[4px_4px_8px_#1a1a2e,-4px_-4px_8px_#2a2a4a]"
    >
      <div className="relative h-7 w-12 rounded-full bg-slate-300 shadow-inner dark:bg-slate-700">
        <motion.div
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md dark:bg-slate-300"
          animate={{ left: checked ? "1.5rem" : "0.125rem" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
        {checked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </button>
  );
}
```

---

## 4. Animated Gradient Hero

```jsx
import { motion } from "framer-motion";

function GradientHero({ title, subtitle, cta }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/30 blur-[120px]"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/30 blur-[120px]"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-pink-600/20 blur-[100px]"
          animate={{ x: [0, 60, 0], y: [0, 80, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-r from-white via-blue-200 to-indigo-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-400"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25"
          >
            {cta}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 5. Parallax Scroll Section

```jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function ParallaxHero({ backgroundImage, title, subtitle }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ y: bgY, backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        className="relative flex h-full items-center justify-center text-center"
        style={{ y: textY, opacity }}
      >
        <div>
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">{title}</h1>
          <p className="mt-4 text-xl text-white/80">{subtitle}</p>
        </div>
      </motion.div>
    </div>
  );
}
```

---

## 6. Magnetic Button

```jsx
import { motion, useMotionValue, useSpring } from "framer-motion";

function MagneticButton({ children, className = "" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function handleMouse(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }

  return (
    <motion.button
      className={`rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
```

---

## 7. Staggered Card Grid

```jsx
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

function StaggeredGrid({ cards }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={i}
          variants={item}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white">{card.title}</h3>
          <p className="mt-2 text-sm text-white/60">{card.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 8. Character-by-Character Text Reveal

```jsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const charVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4 } },
};

function TextReveal({ text, className = "" }) {
  return (
    <motion.h1
      className={`text-5xl font-bold ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={charVariants} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
```

---

## 9. Animated Gradient Border Card

```jsx
import { motion } from "framer-motion";

function GradientBorderCard({ children }) {
  return (
    <div className="relative rounded-2xl p-[1px]">
      <motion.div
        className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ filter: "blur(4px)" }}
      />
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)]" />
      <div className="relative rounded-[15px] bg-slate-900 p-6">
        {children}
      </div>
    </div>
  );
}
```

---

## 10. Reduced Motion Wrapper

Use this utility to wrap any animated component and automatically disable motion when the user prefers reduced motion.

```jsx
import { useReducedMotion } from "framer-motion";

function MotionSafe({ children, fallback = null }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return fallback || <div>{children}</div>;
  }
  return children;
}
```

Usage:

```jsx
<MotionSafe fallback={<StaticHero />}>
  <AnimatedHero />
</MotionSafe>
```
