import { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform, useMotionTemplate,
  type MotionValue,
} from 'framer-motion';

// ─── Scene data ───────────────────────────────────────────────────────────────
const SCENES = [
  {
    descriptor: 'builds 3D worlds.',
    object:     '/obj-camera.png',
    objAlt:     'Clay camera',
    glow:       'radial-gradient(ellipse 60% 70% at 55% 52%, oklch(0.38 0.14 22 / 0.55), transparent 72%)',
    accent:     'oklch(0.68 0.17 22)',
    dot:        '#F4826A',
  },
  {
    descriptor: 'captures every sense.',
    object:     '/obj-headphones.png',
    objAlt:     'Clay headphones',
    glow:       'radial-gradient(ellipse 60% 70% at 55% 52%, oklch(0.38 0.13 300 / 0.55), transparent 72%)',
    accent:     'oklch(0.72 0.13 300)',
    dot:        '#C3ABDB',
  },
  {
    descriptor: 'speaks in color.',
    object:     '/obj-palette.png',
    objAlt:     'Clay paint palette',
    glow:       'radial-gradient(ellipse 60% 70% at 55% 52%, oklch(0.50 0.08 55 / 0.45), transparent 72%)',
    accent:     'oklch(0.78 0.10 55)',
    dot:        '#E8C97A',
  },
  {
    descriptor: 'creates from concept.',
    object:     '/obj-pencil.png',
    objAlt:     'Clay pencil',
    glow:       'radial-gradient(ellipse 60% 70% at 55% 52%, oklch(0.42 0.13 165 / 0.50), transparent 72%)',
    accent:     'oklch(0.70 0.15 165)',
    dot:        '#7DCFBA',
  },
] as const;

const INTERVAL_MS = 3500;

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG      = '#0C0C0C';
const TEXT    = 'oklch(0.94 0.008 265)';
const DIM     = 'oklch(0.48 0.006 265)';
const DIMMER  = 'oklch(0.26 0.006 265)';
const RULE    = 'oklch(0.20 0.006 265)';
const EASE    = [0.4, 0, 0.2, 1]    as const;  // smooth decel — silky landing
const EASE_IN = [0.4, 0, 0.6, 1]    as const;  // gentle S-curve out — no lurch

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact'];

// ─── Animation variants ───────────────────────────────────────────────────────
const objVariants = {
  initial: { x: 48, opacity: 0, scale: 0.91, rotate: 1.5 },
  animate: { x: 0, opacity: 1, scale: 1, rotate: 0,
    transition: { duration: 1.05, ease: EASE } },
  exit:    { x: -48, opacity: 0, scale: 0.91, rotate: -1.5,
    transition: { duration: 0.55, ease: EASE_IN } },
};

const objMobileVariants = {
  initial: { opacity: 0, scale: 0.92, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  exit:    { opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.45, ease: EASE_IN } },
};

const glowVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.9 } },
  exit:    { opacity: 0, transition: { duration: 0.5 } },
};

const descContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  exit:    { transition: { staggerChildren: 0.04 } },
};

const descWord = {
  hidden:   { y: '110%', opacity: 0 },
  visible:  { y: '0%',   opacity: 1, transition: { duration: 0.75, ease: EASE } },
  exit:     { y: '-110%',opacity: 0, transition: { duration: 0.45, ease: EASE_IN } },
};

// ─── ScatterLetter — springs toward cursor on proximity ───────────────────────
function ScatterLetter({
  char,
  rawX,
  rawY,
}: {
  char:  string;
  rawX:  MotionValue<number>;
  rawY:  MotionValue<number>;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const lx  = useMotionValue(0);
  const ly  = useMotionValue(0);
  const sx  = useSpring(lx, { stiffness: 120, damping: 22, mass: 1.0 });
  const sy  = useSpring(ly, { stiffness: 120, damping: 22, mass: 1.0 });

  useEffect(() => {
    const RADIUS   = 180;  // px — how close cursor needs to be
    const STRENGTH = 28;   // px — max pull distance

    function update() {
      const el = ref.current;
      if (!el) return;
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const mx = rawX.get();
      const my = rawY.get();
      const dx = mx - cx;
      const dy = my - cy;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < RADIUS && d > 0) {
        const force = (1 - d / RADIUS) ** 2 * STRENGTH;
        lx.set((dx / d) * force);
        ly.set((dy / d) * force);
      } else {
        lx.set(0);
        ly.set(0);
      }
    }

    const u1 = rawX.on('change', update);
    const u2 = rawY.on('change', update);
    return () => { u1(); u2(); };
  }, [rawX, rawY, lx, ly]);

  return (
    <motion.span ref={ref} style={{ x: sx, y: sy, display: 'inline-block' }}>
      {char}
    </motion.span>
  );
}

// ─── FlipCounter — silky digit crossfade, zero layout shift ──────────────────
function FlipDigit({ digit }: { digit: string }) {
  return (
    // Outer span: fixed size from invisible "8" spacer — never resizes
    <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
      {/* Invisible widest-digit spacer — holds the container size constant */}
      <span style={{ visibility: 'hidden', userSelect: 'none' }} aria-hidden>8</span>

      {/* Animated digit — absolutely fills the spacer's footprint */}
      <AnimatePresence>
        <motion.span
          key={digit}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%',   opacity: 1,
            transition: { duration: 0.65, ease: EASE } }}
          exit={{ y: '-105%',   opacity: 0,
            transition: { duration: 0.5,  ease: EASE_IN } }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FlipCounter({ scene }: { scene: number }) {
  const display = String(scene + 1).padStart(2, '0');
  return (
    <span style={{ display: 'inline-flex' }} aria-hidden>
      {display.split('').map((d, i) => (
        <FlipDigit key={i} digit={d} />
      ))}
    </span>
  );
}

// ─── Magnetic CTA hook ────────────────────────────────────────────────────────
function useMagnetic(strength = 0.38) {
  const ref = useRef<HTMLElement>(null);
  const rx  = useMotionValue(0);
  const ry  = useMotionValue(0);
  const x   = useSpring(rx, { stiffness: 210, damping: 22 });
  const y   = useSpring(ry, { stiffness: 210, damping: 22 });

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = ref.current!.getBoundingClientRect();
    rx.set((e.clientX - r.left - r.width  / 2) * strength);
    ry.set((e.clientY - r.top  - r.height / 2) * strength);
  }, [rx, ry, strength]);

  const onLeave = useCallback(() => { rx.set(0); ry.set(0); }, [rx, ry]);
  return { ref, x, y, onMove, onLeave };
}

// ─── Arrow icon ───────────────────────────────────────────────────────────────
function Arrow({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Animated descriptor ─────────────────────────────────────────────────────
function AnimatedDescriptor({ text, sceneIdx }: { text: string; sceneIdx: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={sceneIdx}
        className="flex flex-wrap"
        style={{ gap: '0 0.28em' }}
        variants={descContainer}
        initial="hidden"
        animate="visible"
        exit="exit"
        aria-label={text}
      >
        {text.split(' ').map((word, i) => (
          <span key={i} className="overflow-hidden leading-none" style={{ display: 'inline-block' }}>
            <motion.span className="block" variants={descWord}>{word}</motion.span>
          </span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Float wrapper ────────────────────────────────────────────────────────────
function Float({ children, amp = 14, dur = 6.5 }: {
  children: React.ReactNode; amp?: number; dur?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -amp, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const [scene, setScene] = useState(0);
  const cta     = useMagnetic(0.4);
  const current = SCENES[scene];

  // ── Raw mouse coordinates (window-level, drives both scatter + tilt) ────────
  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [rawX, rawY]);

  // ── Right column hover — 3D depth effect ────────────────────────────────
  const rightRef    = useRef<HTMLDivElement>(null);
  const colX        = useMotionValue(0);   // -0.5 → 0.5 relative to column
  const colY        = useMotionValue(0);
  const spotOpacity = useSpring(0, { stiffness: 80, damping: 22 });

  // Tilt: springs back to 0,0 when cursor leaves
  const tiltRotateX = useSpring(
    useTransform(colY, [-0.5, 0.5], [14, -14]),
    { stiffness: 130, damping: 18 }
  );
  const tiltRotateY = useSpring(
    useTransform(colX, [-0.5, 0.5], [-14, 14]),
    { stiffness: 130, damping: 18 }
  );

  // Spotlight: follows cursor, uses scene accent tint
  const spotXPct   = useTransform(colX, [-0.5, 0.5], ['10%', '90%']);
  const spotYPct   = useTransform(colY, [-0.5, 0.5], ['10%', '90%']);
  const spotlight  = useMotionTemplate`radial-gradient(320px circle at ${spotXPct} ${spotYPct}, oklch(0.35 0.07 316 / 0.65), transparent 72%)`;

  // Drop-shadow: cursor is the light source — shadow falls opposite
  const shadowX    = useTransform(colX, [-0.5, 0.5], ['22px', '-22px']);
  const shadowY    = useTransform(colY, [-0.5, 0.5], ['22px', '-22px']);
  const dropShadow = useMotionTemplate`drop-shadow(${shadowX} ${shadowY} 28px oklch(0.12 0.06 265 / 0.7))`;

  const handleRightMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = rightRef.current!.getBoundingClientRect();
    colX.set((e.clientX - r.left)  / r.width  - 0.5);
    colY.set((e.clientY - r.top)   / r.height - 0.5);
    spotOpacity.set(1);
  }, [colX, colY, spotOpacity]);

  const handleRightLeave = useCallback(() => {
    colX.set(0);
    colY.set(0);
    spotOpacity.set(0);
  }, [colX, colY, spotOpacity]);

  // ── Auto-advance ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setScene(s => (s + 1) % SCENES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const goTo = useCallback((i: number) => setScene(i), []);

  return (
    <section
      className="relative min-h-[100dvh] flex flex-col overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 60,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.042,
      }} />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="relative z-20 flex justify-between items-center px-8 md:px-14 pt-8 flex-shrink-0"
      >
        <span className="font-black uppercase"
          style={{ color: TEXT, fontSize: '0.78rem', letterSpacing: '0.22em' }}>
          Jack
        </span>
        <div className="hidden sm:flex gap-8 md:gap-10">
          {NAV_LINKS.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className="uppercase transition-colors duration-300"
              style={{ color: DIM, fontSize: '0.70rem', letterSpacing: '0.18em', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = DIM)}
            >
              {link}
            </a>
          ))}
        </div>
      </motion.nav>

      {/* ── HERO BODY ───────────────────────────────────────── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 px-8 md:px-14 lg:px-0">

        {/* ── LEFT — identity ───────────────────────────────── */}
        <div className="relative flex flex-col justify-center lg:px-16 py-10 lg:py-0 overflow-hidden">

          {/* Background scene counter — faded, absolute */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: EASE }}
            className="absolute font-black leading-none"
            style={{
              bottom:        '-8%',
              right:         '-6%',
              fontSize:      'clamp(9rem, 22vw, 20rem)',
              color:         TEXT,
              opacity:       0.038,
              letterSpacing: '-0.05em',
              userSelect:    'none',
              pointerEvents: 'none',
            }}
          >
            <FlipCounter scene={scene} />
          </motion.div>

          {/* Mobile object */}
          <div className="lg:hidden relative h-[44vw] max-h-[260px] mb-8 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div key={scene} variants={objMobileVariants}
                initial="initial" animate="animate" exit="exit" className="absolute">
                <Float amp={10} dur={5.5}>
                  <img src={current.object} alt={current.objAlt}
                    className="select-none"
                    style={{ height: '200px', width: 'auto', objectFit: 'contain' }}
                    draggable={false} />
                </Float>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Name — scatter letters */}
          <div className="overflow-visible mb-3">
            <motion.h1
              className="font-black leading-[0.88]"
              initial={{ y: '105%', opacity: 0 }}
              animate={{ y: '0%',   opacity: 1 }}
              transition={{ duration: 0.95, delay: 0.38, ease: EASE }}
              style={{
                fontSize:      'clamp(4.5rem, 11.5vw, 10rem)',
                color:         TEXT,
                letterSpacing: '-0.03em',
              }}
            >
              {['J','a','c','k'].map((char, i) => (
                <ScatterLetter key={i} char={char} rawX={rawX} rawY={rawY} />
              ))}
            </motion.h1>
          </div>

          {/* Cycling descriptor */}
          <div
            className="font-black leading-[0.9] mb-10"
            style={{
              fontSize:      'clamp(1.8rem, 4.5vw, 4.2rem)',
              letterSpacing: '-0.025em',
              color:         current.accent,
              transition:    'color 0.6s ease',
              minHeight:     'clamp(2.2rem, 5.5vw, 5rem)',
            }}
            aria-live="polite"
          >
            <AnimatedDescriptor text={current.descriptor} sceneIdx={scene} />
          </div>

          {/* Rule */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 1.0, delay: 0.7, ease: EASE }}
            className="origin-left mb-8"
            style={{ height: '1px', backgroundColor: RULE }}
          />

          {/* Tagline — entrance then idle breath */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
            className="font-light mb-10"
            style={{ color: DIM, fontSize: 'clamp(0.82rem, 1.25vw, 1rem)', lineHeight: 1.75, maxWidth: '30ch' }}
          >
            <motion.span
              style={{ display: 'block' }}
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2, repeatDelay: 0.6 }}
            >
              Driven by crafting striking and
              <br />unforgettable 3D experiences.
            </motion.span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 1.0, ease: EASE }}
            className="flex items-center gap-8"
          >
            <motion.button
              ref={cta.ref as React.RefObject<HTMLButtonElement>}
              style={{
                x: cta.x, y: cta.y,
                padding: '0.75rem 1rem 0.75rem 1.5rem',
                border:  `1px solid ${RULE}`,
                background: 'oklch(0.13 0.008 265)',
                color: TEXT,
              }}
              onMouseMove={cta.onMove as unknown as React.MouseEventHandler<HTMLButtonElement>}
              onMouseLeave={cta.onLeave as unknown as React.MouseEventHandler<HTMLButtonElement>}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 rounded-full cursor-pointer select-none"
            >
              <span className="font-medium uppercase"
                style={{ fontSize: '0.70rem', letterSpacing: '0.22em' }}>
                View Work
              </span>
              <motion.span
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: RULE, color: TEXT, flexShrink: 0 }}
                whileHover={{ backgroundColor: current.accent, x: 3, y: -3,
                  transition: { duration: 0.22, ease: EASE } }}
              >
                <Arrow size={11} />
              </motion.span>
            </motion.button>

            <motion.a
              href="#contact"
              className="uppercase"
              style={{ color: DIMMER, fontSize: '0.68rem', letterSpacing: '0.22em', fontWeight: 500 }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 2.4, repeatDelay: 0.3 }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = DIMMER)}
            >
              Contact
            </motion.a>
          </motion.div>
        </div>

        {/* ── RIGHT — 3D depth object stage ─────────────────── */}
        <div
          ref={rightRef}
          className="relative hidden lg:block overflow-hidden cursor-none"
          onMouseMove={handleRightMove}
          onMouseLeave={handleRightLeave}
        >
          {/* Tilt wrapper — perspective lives on the parent, rotation on this div */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              rotateX:             tiltRotateX,
              rotateY:             tiltRotateY,
              transformPerspective: 900,
              transformStyle:      'preserve-3d',
            }}
          >
            {/* Per-scene ambient glow */}
            <AnimatePresence>
              <motion.div key={`glow-${scene}`} variants={glowVariants}
                initial="initial" animate="animate" exit="exit"
                className="absolute inset-0 pointer-events-none"
                style={{ background: current.glow }} />
            </AnimatePresence>

            {/* Cursor spotlight — fades in on hover, tracks cursor */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: spotlight, opacity: spotOpacity }}
            />

            {/* Left-edge bleed */}
            <div className="absolute inset-y-0 left-0 w-32 pointer-events-none"
              style={{ background: `linear-gradient(to right, ${BG}, transparent)` }} />

            {/* Top/bottom vignettes */}
            <div className="absolute inset-x-0 top-0 h-28 pointer-events-none"
              style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }} />
            <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
              style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />

            {/* 3D Object — scale up on hover, drop-shadow shifts with light */}
            <AnimatePresence mode="popLayout">
              <motion.div key={`obj-${scene}`} variants={objVariants}
                initial="initial" animate="animate" exit="exit"
                className="relative flex items-center justify-center"
                style={{ width: 'clamp(260px, 38vw, 520px)', height: 'clamp(260px, 38vw, 520px)' }}
              >
                <Float amp={16} dur={7}>
                  {/* filter wrapper: drop-shadow follows cursor direction */}
                  <motion.div
                    className="w-full h-full"
                    style={{ filter: dropShadow }}
                    whileHover={{ scale: 1.06, transition: { duration: 0.5, ease: EASE } }}
                  >
                    <img src={current.object} alt={current.objAlt}
                      className="select-none w-full h-full"
                      style={{ objectFit: 'contain' }}
                      draggable={false} />
                  </motion.div>
                </Float>
              </motion.div>
            </AnimatePresence>

            {/* Vertical stamp */}
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
              className="absolute uppercase pointer-events-none select-none"
              style={{
                right: '1.25rem', top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                color: DIMMER, fontSize: '0.58rem', letterSpacing: '0.38em', whiteSpace: 'nowrap',
              }}
            >
              Portfolio — 2024
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.3, ease: EASE }}
        className="relative z-20 flex items-center justify-between px-8 md:px-14 pb-7 flex-shrink-0 gap-6"
      >
        <span className="uppercase"
          style={{ color: DIMMER, fontSize: '0.58rem', letterSpacing: '0.22em' }}>
          © 2024
        </span>

        <div className="flex items-center gap-3 flex-1 max-w-[220px]">
          {SCENES.map((_s, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="relative cursor-pointer flex-1 h-[2px] rounded-full overflow-hidden"
              style={{ background: RULE }}
              aria-label={`Scene ${i + 1}`}
            >
              {i === scene && (
                <motion.div key={scene}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: current.accent }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
                />
              )}
              {i < scene && (
                <div className="absolute inset-0 rounded-full"
                  style={{ background: current.accent, opacity: 0.35 }} />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="uppercase"
            style={{ color: DIMMER, fontSize: '0.56rem', letterSpacing: '0.30em' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '28px',
              background: `linear-gradient(to bottom, ${RULE}, transparent)` }}
          />
        </div>
      </motion.div>

    </section>
  );
}
