import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  // eslint-disable-next-line no-unused-vars -- motion used as motion.div, motion.span etc in JSX
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import ParticleWave from '../components/ParticleWave';
import ScrollProgressBar from '../components/Common/ScrollProgressBar';
import { LandingScrollProvider } from '../context/LandingScrollContext';
import {
  TiltCard3D,
  AnimatedGradientText,
  LayeredShadowCard,
  PremiumButton,
} from '../components/Landing';

const trustedLogoImages = [
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><circle cx="24" cy="24" r="20" fill="%231e3a5f"/><text x="24" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="white">MB</text><text x="70" y="30" font-family="Arial, sans-serif" font-weight="600" font-size="11" fill="%231e3a5f">MayBank</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><polygon points="24,4 44,24 24,44 4,24" fill="%230d9488"/><text x="24" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="white">PT</text><text x="70" y="30" font-family="Arial, sans-serif" font-weight="600" font-size="10" fill="%230d9488">Petronas</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><rect x="4" y="4" width="40" height="40" rx="10" fill="%23dc2626"/><text x="24" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="white">AA</text><text x="70" y="30" font-family="Arial, sans-serif" font-weight="600" font-size="10" fill="%23dc2626">AirAsia</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><circle cx="24" cy="24" r="20" fill="%2316a34a"/><text x="24" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="white">G</text><text x="70" y="30" font-family="Arial, sans-serif" font-weight="600" font-size="11" fill="%2316a34a">Grab</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><rect x="2" y="8" width="116" height="32" rx="6" fill="%23991b1b"/><text x="60" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="white" letter-spacing="2">CIMB</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><circle cx="24" cy="24" r="20" fill="%23d97706"/><polygon points="22,8 16,26 24,26 20,40 32,20 24,20 28,8" fill="white"/><text x="70" y="26" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="%23d97706">Tenaga</text><text x="70" y="38" font-family="Arial, sans-serif" font-weight="600" font-size="9" fill="%23d97706" opacity="0.7">Digital</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="%237c3aed"/><text x="24" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="white">AX</text><text x="70" y="30" font-family="Arial, sans-serif" font-weight="600" font-size="11" fill="%237c3aed">Axiata</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><polygon points="24,4 44,24 24,44 4,24" fill="%23064E3B"/><text x="24" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="white">SD</text><text x="66" y="26" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="%23064E3B">Sime</text><text x="66" y="38" font-family="Arial, sans-serif" font-weight="600" font-size="10" fill="%23064E3B" opacity="0.7">Darby</text></svg>'),
];

const FEATURES = [
  {
    icon: 'analytics',
    title: 'SST Tracking',
    description: 'Automated digital journals and tax period monitoring. Never miss a submission window with smart reminders and pre-filled returns.',
  },
  {
    icon: 'description',
    title: 'Automated EA Forms',
    description: 'One-click generation for employee payroll compliance. Export thousands of EA forms instantly, ready for employee distribution.',
  },
  {
    icon: 'speed',
    title: 'Real-time Tax Liability',
    description: 'A live dashboard showing your current tax debt and credits. Predict future cash flow needs with high-accuracy tax forecasting.',
  },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Companies Trust Us' },
  { value: 3.5, suffix: 'M+', prefix: 'RM ', label: 'Tax Processed', decimals: 1 },
  { value: 99.9, suffix: '%', label: 'Platform Uptime', decimals: 1 },
  { value: 20, suffix: '+', label: 'Hours Saved / Season' },
];

const CHECKLIST = [
  { title: 'LHDN & Kastam Validated', description: 'Calculations are updated in real-time following every Budget announcement.' },
  { title: 'Localized Support', description: 'Our expert team understands local requirements like CP22, CP39, and PCB.' },
  { title: 'Bank-Grade Security', description: 'AES-256 encryption for all your corporate financial data and employee records.' },
];

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    bestFor: 'Freelancers & Startups',
    monthlyPrice: 0,
    original12: 0,
    price12: 0,
    original24: 0,
    price24: 0,
    users: '1 user',
    features: {
      accounting: true,
      sstFiling: true,
      lhdnEInvoice: true,
      eaForms: false,
      support: 'Email support',
      attachment: '—',
    },
    cta: 'Get Started Free',
    ctaLink: '/login',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    bestFor: 'Growing Businesses',
    monthlyPrice: 49,
    original12: 588,
    price12: 206,
    original24: 1176,
    price24: 294,
    users: 'Up to 5 users',
    features: {
      accounting: true,
      sstFiling: true,
      lhdnEInvoice: true,
      eaForms: true,
      support: 'Email & Live Chat',
      attachment: '5GB',
    },
    cta: 'Start Free Trial',
    ctaLink: '/login',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    bestFor: 'Large Organizations',
    monthlyPrice: null,
    original12: null,
    price12: null,
    original24: null,
    price24: null,
    users: 'Unlimited',
    features: {
      accounting: true,
      sstFiling: true,
      lhdnEInvoice: true,
      eaForms: true,
      support: 'Priority & Phone',
      attachment: '20GB',
    },
    cta: 'Contact Sales',
    ctaLink: 'mailto:support@cukaipro.my?subject=Enterprise%20Plan%20-%20CukaiPro',
    highlighted: false,
  },
];

/** Billing interval: 'monthly' | '12months' | '24months' */
const BILLING_TABS = [
  { id: 'monthly', label: 'Monthly' },
  { id: '12months', label: '12 Months 65% Off' },
  { id: '24months', label: '24 Months 75% Off' },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

function useCountUp(end, { decimals = 0, duration = 2000, enabled = true } = {}) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) { queueMicrotask(() => setValue(end)); return; }
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, decimals, duration, enabled]);

  return value;
}

function StatItem({ stat, inView }) {
  const shouldReduce = useReducedMotion();
  const count = useCountUp(stat.value, {
    decimals: stat.decimals || 0,
    duration: 2000,
    enabled: inView && !shouldReduce,
  });

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 sm:py-8 sm:px-6 flex-1 min-w-0">
      <p className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold gradient-text mb-1.5 tabular-nums whitespace-nowrap">
        {stat.prefix || ''}{count}{stat.suffix}
      </p>
      <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wide text-center">{stat.label}</p>
    </div>
  );
}

function LandingPage() {
  const shouldReduce = useReducedMotion();
  const contentRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const statsSectionRef = useRef(null);
  const pricingRef = useRef(null);
  const ctaRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const [billingInterval, setBillingInterval] = useState('monthly');

  const sectionRefs = {
    features: featuresRef,
    stats: statsSectionRef,
    highlight: contentRef,
    pricing: pricingRef,
    cta: ctaRef,
  };

  const { scrollYProgress: contentScroll } = useScroll({
    target: contentRef,
    offset: ['start end', 'end start'],
  });
  const contentImageY = useTransform(contentScroll, [0, 1], [60, -60]);

  return (
    <div className="bg-background-dark text-white">
      <ScrollProgressBar />
      <LandingScrollProvider sectionRefs={sectionRefs}>
      {/* Hero */}
      <header className="relative overflow-hidden pt-20 pb-28 bg-background-dark">
        <ParticleWave className="z-0 pointer-events-none" dotColor="rgba(16, 185, 129, 0.18)" />

        {/* Mesh gradient blobs */}
        <motion.div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px]"
          animate={shouldReduce ? {} : { x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[100px]"
          animate={shouldReduce ? {} : { x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute left-1/3 -bottom-20 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[100px]"
          animate={shouldReduce ? {} : { x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Now LHDN e-Invoice Compatible
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.08] mb-6">
                <AnimatedGradientText text="LHDN-Ready" as="span" />{' '}
                <span className="text-white">in Minutes</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-white/80 mb-10 max-w-2xl leading-relaxed">
                The modern tax platform built specifically for Malaysian businesses. Automate your SST compliance, EA form generation, and real-time liability tracking with enterprise-grade security.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <PremiumButton to="/login" variant="primary">
                  Start Free Trial <span className="material-icons text-base">arrow_forward</span>
                </PremiumButton>
                <PremiumButton
                  href="mailto:support@cukaipro.my?subject=Demo%20request%20-%20CukaiPro"
                  variant="secondary"
                >
                  Book a Demo
                </PremiumButton>
              </motion.div>

              <motion.p variants={fadeUp} className="mt-6 text-sm text-white/60">
                No credit card required. 14-day free trial.
              </motion.p>
            </div>

            <motion.div variants={scaleIn} className="flex-1 w-full max-w-2xl">
              <TiltCard3D shadowVariant="glow-emerald" innerTranslateZ>
                <div className="relative rounded-2xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm overflow-hidden p-2">
                  <img
                    alt="CukaiPro on dual monitors - hero section and dashboard"
                    className="rounded-xl w-full h-auto object-cover"
                    src="/hero-setup.png"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
                </div>
              </TiltCard3D>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* Trust Bar — Premium Ticker */}
      <section id="trust" className="py-16 border-y border-white/10 bg-background-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-400/40" />
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
              Trusted by Industry Leaders
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-400/40" />
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-card overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background-dark to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background-dark to-transparent pointer-events-none" />

            <div className="py-8 px-4">
              <div className="ticker-track flex items-center gap-16 shrink-0 w-max">
                {[...trustedLogoImages, ...trustedLogoImages].map((src, i) => (
                  <div key={i} className="shrink-0 group relative" aria-hidden="true">
                    <div className="relative px-4 py-2 rounded-xl transition-all duration-300 group-hover:bg-white/[0.06]">
                      <img
                        src={src}
                        alt=""
                        className="h-8 w-auto object-contain opacity-50 grayscale brightness-200 transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110"
                        width={120}
                        height={48}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald-500/[0.08] blur-xl -z-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-white/70">
              <span className="material-icons text-sm text-emerald-400/70">verified</span>
              <span className="text-xs font-semibold">500+ Companies</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2 text-white/70">
              <span className="material-icons text-sm text-emerald-400/70">trending_up</span>
              <span className="text-xs font-semibold">RM 2.1B+ Processed</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-white/70">
              <span className="material-icons text-sm text-emerald-400/70">schedule</span>
              <span className="text-xs font-semibold">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" ref={featuresRef} className="py-28 bg-background-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-emerald-600/[0.07] blur-[150px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-extrabold mb-4">
              <span className="gradient-text">Streamline</span> Your Compliance Workflow
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 max-w-2xl mx-auto text-base">
              Everything you need to stay compliant with Malaysian tax laws without the manual paperwork.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <TiltCard3D shadowVariant="glow-emerald">
                  <motion.div
                    className="glass p-8 rounded-2xl h-full transition-colors duration-300 hover:bg-white/[0.08]"
                    whileHover={shouldReduce ? {} : { y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <span className="material-icons text-emerald-400">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </TiltCard3D>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content Section / Mockup Display */}
      <section ref={contentRef} id="highlight" className="py-24 bg-background-dark relative overflow-hidden">
        <div className="absolute -right-40 top-1/4 h-[400px] w-[400px] rounded-full bg-teal-600/[0.06] blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div
              className="flex-1 order-2 lg:order-1"
              style={shouldReduce ? {} : { y: contentImageY }}
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
                  <img
                    alt="Financial Visualization"
                    className="w-full h-auto object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2V4fcBwYg5hqJo5DaSJpMnuWL_C84ZqnjjY9XscGBNs2UdTi9aaK9-2wzBl9L-HL-jjvFeKraq2TSvSzUAavfiyfQrlXKufFbOyIn1C6xTwo2ZT8Am7RJVkJPwUO3Ikt5ob1c2GAFM4RTyGS-xuzMEnBJBBQUxaHesYE3fmyhFg01BjIob_XuqjVNW2rcBVsdjGziXK6NrfW2VTsY9iEXOaP-SxtMEtButfVRiUQZsb9hear8GFbD3pCizxbnov4za5Apm6sU01Y"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex-1 order-1 lg:order-2"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-extrabold mb-8 leading-tight">
                Built for the Malaysian{' '}
                <span className="gradient-text">regulatory landscape.</span>
              </motion.h2>

              <ul className="space-y-6">
                {CHECKLIST.map((item) => (
                  <motion.li key={item.title} variants={fadeUp} className="flex items-start gap-4">
                    <motion.span
                      className="material-icons text-emerald-400 mt-1 shrink-0"
                      whileInView={shouldReduce ? {} : { scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                    >
                      check_circle
                    </motion.span>
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-white/70 text-sm">{item.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section id="stats" ref={statsSectionRef} className="py-20 bg-background-dark relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" aria-hidden="true" />

        <div ref={statsRef} className="max-w-5xl mx-auto px-4 sm:px-6">
          <LayeredShadowCard className="rounded-2xl">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={scaleIn}
            >
              {/* Subtle top-edge highlight for glass effect */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" aria-hidden="true" />
              <div className="flex flex-col divide-y divide-white/10 sm:flex-row sm:divide-y-0 sm:divide-x sm:divide-white/10">
                {STATS.map((stat) => (
                  <StatItem key={stat.label} stat={stat} inView={statsInView} />
                ))}
              </div>
            </motion.div>
          </LayeredShadowCard>
        </div>
      </section>

      {/* Pricing Section — AutoCount-style */}
      <section id="pricing" ref={pricingRef} className="py-28 bg-background-dark relative overflow-hidden">
        <div className="absolute -left-60 top-1/3 h-[500px] w-[500px] rounded-full bg-emerald-600/[0.05] blur-[150px] pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-500/[0.04] blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Free trial CTA — same as AutoCount */}
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-3">
              Start using CukaiPro for free!
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/80 max-w-2xl mx-auto text-base mb-6">
              Access all CukaiPro features for free, then decide which plan best suits your business.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70 mb-6">
              <span className="flex items-center gap-1.5"><span className="material-icons text-emerald-400 text-base">check_circle</span> Cancel any time</span>
              <span className="flex items-center gap-1.5"><span className="material-icons text-emerald-400 text-base">check_circle</span> No minimum contract</span>
              <span className="flex items-center gap-1.5"><span className="material-icons text-emerald-400 text-base">check_circle</span> No credit card required</span>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors duration-200 shadow-lg shadow-emerald-500/25"
              >
                Start Your Free Trial <span className="material-icons text-lg">arrow_forward</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Choose Your Pricing Plan + tabs */}
          <motion.div
            className="mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-6 text-center">
              Choose Your Pricing Plan
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
              {BILLING_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBillingInterval(tab.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    billingInterval === tab.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Comparison table — AutoCount-style */}
          <motion.div
            className="overflow-x-auto rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scaleIn}
          >
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="p-4 text-sm font-bold uppercase tracking-wider text-white/60 w-48 sm:w-56" />
                  {PRICING_PLANS.map((plan) => (
                    <th key={plan.id} className={`p-4 sm:p-6 text-center border-l border-white/10 ${plan.highlighted ? 'bg-emerald-500/10' : ''}`}>
                      <div className="font-display font-bold text-white text-lg">{plan.name}</div>
                      <div className="mt-2 text-white/90 font-semibold">
                        {plan.monthlyPrice !== null ? (
                          plan.monthlyPrice === 0 ? (
                            <span className="text-white">Free</span>
                          ) : billingInterval === 'monthly' ? (
                            <>RM {plan.monthlyPrice} <span className="text-white/60 font-normal text-sm">/mo</span></>
                          ) : billingInterval === '12months' ? (
                            <>
                              <span className="line-through text-white/50 mr-1">RM {plan.original12}</span>
                              <span className="text-emerald-400">RM {plan.price12}</span>
                              <span className="text-white/60 font-normal text-sm ml-1">/yr</span>
                            </>
                          ) : (
                            <>
                              <span className="line-through text-white/50 mr-1">RM {plan.original24}</span>
                              <span className="text-emerald-400">RM {plan.price24}</span>
                              <span className="text-white/60 font-normal text-sm ml-1">/2 yr</span>
                            </>
                          )
                        ) : (
                          <span className="text-white">Custom</span>
                        )}
                      </div>
                      {plan.ctaLink.startsWith('mailto:') ? (
                        <a href={plan.ctaLink} className="mt-4 inline-block w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold bg-white text-primary hover:bg-white/90 transition-colors">
                          {plan.cta}
                        </a>
                      ) : (
                        <Link to={plan.ctaLink} className="mt-4 inline-block w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold bg-white text-primary hover:bg-white/90 transition-colors text-center">
                          {plan.cta}
                        </Link>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <td className="p-4 font-semibold text-white/80">Best for</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-white/70">{plan.bestFor}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 font-semibold text-white/80">Included users</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-white/70">{plan.users}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <td className="p-4 font-bold text-white/60 uppercase tracking-wider text-xs">Tax & compliance</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10" />
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 pl-6 text-white/70">Accounting & Reports</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-center">
                      {plan.features.accounting ? <span className="material-icons text-emerald-400 text-lg">check_circle</span> : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 pl-6 text-white/70">SST Filing</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-center">
                      {plan.features.sstFiling ? <span className="material-icons text-emerald-400 text-lg">check_circle</span> : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 pl-6 text-white/70">LHDN e-Invoice</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-center">
                      {plan.features.lhdnEInvoice ? <span className="material-icons text-emerald-400 text-lg">check_circle</span> : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 pl-6 text-white/70">EA Forms</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-center">
                      {plan.features.eaForms ? <span className="material-icons text-emerald-400 text-lg">check_circle</span> : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <td className="p-4 font-bold text-white/60 uppercase tracking-wider text-xs">Support</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-white/70">{plan.features.support}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 font-semibold text-white/80">Attachment</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="p-4 border-l border-white/10 text-white/70">{plan.features.attachment}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>

          {/* Footer disclaimer — same as AutoCount */}
          <motion.p
            className="text-center text-sm text-white/50 mt-6 italic"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Price displayed excludes SST charges. All promotion offers are subject to terms and conditions.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" ref={ctaRef} className="py-28 bg-background-dark">
        <div className="max-w-7xl mx-auto px-4">
          <LayeredShadowCard glow="emerald" className="rounded-3xl">
            <motion.div
              className="relative rounded-3xl p-12 lg:p-20 text-center overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              {/* Mesh gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-800 to-teal-900 rounded-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.3),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.2),transparent_50%)]" />

              {/* Floating orbs */}
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-[80px]"
                animate={shouldReduce ? {} : { x: [0, 20, 0], y: [0, -15, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-teal-400/10 blur-[60px]"
                animate={shouldReduce ? {} : { x: [0, -15, 0], y: [0, 10, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <motion.h2
                  variants={fadeUp}
                  className="text-3xl lg:text-5xl font-display font-extrabold mb-6"
                >
                  Ready to <span className="text-emerald-200">automate</span> your taxes?
                </motion.h2>
                <motion.p variants={fadeUp} className="text-white/85 text-lg mb-10 max-w-2xl mx-auto">
                  Join hundreds of Malaysian businesses saving 20+ hours every tax season with CukaiPro.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <PremiumButton to="/login" variant="primary">
                    Start Your Free Trial
                  </PremiumButton>
                  <PremiumButton
                    href="mailto:support@cukaipro.my?subject=Contact%20Sales%20-%20CukaiPro"
                    variant="secondary"
                  >
                    Contact Sales
                  </PremiumButton>
                </motion.div>
              </div>
            </motion.div>
          </LayeredShadowCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-dark py-12 border-t border-white/10 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <span className="material-icons text-emerald-400 text-xs">account_balance_wallet</span>
                </div>
                <span className="text-xl font-display font-extrabold text-white">CukaiPro</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Simplifying Malaysian corporate taxes since 2021. Built with love in Kuala Lumpur.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/80">Product</h4>
              <ul className="space-y-4 text-white/60">
                <li><Link to="/e-invoicing" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">E-Invoicing</Link></li>
                <li><Link to="/payroll-tax" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Payroll Tax</Link></li>
                <li><Link to="/sst-compliance" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">SST Compliance</Link></li>
                <li><Link to="/integrations" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/80">Company</h4>
              <ul className="space-y-4 text-white/60">
                <li><Link to="/about" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Careers</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/80">Support</h4>
              <ul className="space-y-4 text-white/60">
                <li><Link to="/help" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Help Center</Link></li>
                <li><Link to="/lhdn-guidelines" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">LHDN Guidelines</Link></li>
                <li><Link to="/tax-calendar" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Tax Calendar</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50">
            <p>&copy; 2026 CukaiPro Sdn Bhd. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-white transition-colors" href="#"><span className="material-icons text-lg">public</span></a>
              <a className="hover:text-white transition-colors" href="#"><span className="material-icons text-lg">alternate_email</span></a>
              <a className="hover:text-white transition-colors" href="#"><span className="material-icons text-lg">share</span></a>
            </div>
          </div>
        </div>
      </footer>
      </LandingScrollProvider>
    </div>
  );
}

export default LandingPage;
