import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from 'framer-motion';


const BG      = '#0C0C0C';
const HERO_BG = 'oklch(0.17 0.055 215)';
const TEXT    = 'oklch(0.94 0.008 265)';
const DIM     = 'oklch(0.48 0.006 265)';
const DIMMER  = 'oklch(0.26 0.006 265)';
const EASE    = [0.4, 0, 0.2, 1] as const;

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact'];
const LETTERS   = ['J', 'A', 'C', 'K'];


// ─── Main ────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const sectionRef              = useRef<HTMLElement>(null);
  // normalised mouse position -0.5 → 0.5
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 20 });
  const sy = useSpring(my, { stiffness: 55, damping: 20 });

  const photoX = useTransform(sx, [-0.5, 0.5], ['-14px', '14px']);
  const photoY = useTransform(sy, [-0.5, 0.5], ['-10px', '10px']);
  const textX  = useTransform(sx, [-0.5, 0.5], ['10px',  '-10px']);
  const textY  = useTransform(sy, [-0.5, 0.5], ['8px',   '-8px']);
  const spotX  = useTransform(mx, [-0.5, 0.5], ['20%', '80%']);
  const spotY  = useTransform(my, [-0.5, 0.5], ['20%', '80%']);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  }, [mx, my]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden"
      style={{ backgroundColor: HERO_BG }}
    >
      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 60,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.045,
      }} />

      {/* ── NAV ──────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative flex justify-between items-center px-8 md:px-14 pt-8"
        style={{ zIndex: 30 }}
      >
        <span className="font-black uppercase" style={{ color: TEXT, fontSize: '0.78rem', letterSpacing: '0.22em' }}>Jack</span>
        <div className="hidden sm:flex gap-8 md:gap-10">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="uppercase"
              style={{ color: DIM, fontSize: '0.70rem', letterSpacing: '0.18em', fontWeight: 500 }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: EASE }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = DIM)}
            >{link}</motion.a>
          ))}
        </div>
        <button
          className="sm:hidden flex flex-col justify-center items-center gap-[6px] w-8 h-8 cursor-pointer"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {menuOpen ? (
              <motion.svg key="x" width="16" height="16" viewBox="0 0 16 16" fill="none"
                initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <path d="M2 2L14 14M14 2L2 14" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" />
              </motion.svg>
            ) : (
              <motion.svg key="burger" width="20" height="13" viewBox="0 0 20 13" fill="none"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <line x1="0" y1="1" x2="20" y2="1" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="6.5" x2="14" y2="6.5" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="12" x2="20" y2="12" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </motion.nav>

      {/* ── MOBILE MENU ──────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 flex flex-col sm:hidden"
            style={{ backgroundColor: HERO_BG, zIndex: 50 }}
          >
            <div className="flex justify-between items-center px-8 pt-8">
              <span className="font-black uppercase" style={{ color: TEXT, fontSize: '0.78rem', letterSpacing: '0.22em' }}>Jack</span>
              <button className="cursor-pointer p-1" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8 gap-4">
              {NAV_LINKS.map((link, i) => (
                <motion.a key={link} href={`#${link.toLowerCase()}`}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 + i * 0.07, ease: EASE }}
                  onClick={() => setMenuOpen(false)}
                  className="font-black uppercase"
                  style={{ color: TEXT, fontSize: 'clamp(2.2rem, 9vw, 2.8rem)', letterSpacing: '-0.02em', lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.color = DIM)}
                  onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
                >{link}</motion.a>
              ))}
            </nav>
            <div className="px-8 pb-10">
              <span className="uppercase" style={{ color: DIMMER, fontSize: '0.58rem', letterSpacing: '0.22em' }}>©2025–2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Z:1  Full photo — atmosphere background ─────── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '82vh', zIndex: 1,
          x: photoX, y: photoY,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 80%, transparent 100%)',
          maskImage:        'linear-gradient(to bottom, transparent 0%, black 12%, black 80%, transparent 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <img src="/Jack-Photo.png" alt="Jack" className="w-full h-full select-none"
          style={{ objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          draggable={false} />
        <motion.div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(35% 40% at ${spotX} ${spotY}, oklch(0.28 0.06 215 / 0.45), transparent 100%)`,
        }} />
      </motion.div>

      {/* ── Z:3  JACK letters — on top of photo ─────────── */}
      <motion.div
        className="absolute inset-x-0 top-0 flex justify-center pointer-events-none select-none"
        style={{ paddingTop: '4vh', zIndex: 3, x: textX, y: textY }}
      >
        <div className="flex" style={{ gap: '0.01em' }}>
          {LETTERS.map((char, i) => (
            <div key={char} style={{ overflow: 'hidden' }}>
              <motion.span
                className="font-black uppercase block"
                style={{
                  fontSize: 'clamp(4.5rem, 22vw, 26rem)',
                  letterSpacing: '0.07em',
                  lineHeight: 0.88,
                  color: 'oklch(0.97 0.005 265)',
                }}
                initial={{ y: '110%' }}
                animate={loaded ? { y: '0%' } : { y: '110%' }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >{char}</motion.span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{
        height: '14vh', zIndex: 4,
        background: `linear-gradient(to top, ${BG}, transparent)`,
      }} />

      {/* ── Z:5  Subtitle ────────────────────────────────── */}
      <motion.div
        className="absolute inset-x-0 flex justify-center pointer-events-none select-none"
        style={{ top: '55%', zIndex: 5 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.0, ease: EASE }}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: 28, height: 1, background: 'oklch(0.55 0.04 215)' }} />
          <span className="uppercase" style={{ fontSize: 'clamp(0.52rem, 0.85vw, 0.78rem)', letterSpacing: '0.42em', color: 'oklch(0.65 0.04 215)' }}>
            Creative &amp; 3D Designer
          </span>
          <div style={{ width: 28, height: 1, background: 'oklch(0.55 0.04 215)' }} />
        </div>
      </motion.div>

      {/* Left tagline */}
      <motion.div className="absolute select-none" style={{ bottom: '21%', left: '5%', zIndex: 5 }}
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.0, ease: EASE }}>
        <p className="font-semibold uppercase" style={{ color: TEXT, fontSize: 'clamp(0.54rem, 0.82vw, 0.78rem)', letterSpacing: '0.14em', lineHeight: 1.8 }}>
          Driven by crafting<br />striking and unforgettable<br />3D experiences.
        </p>
      </motion.div>

      {/* Right disciplines */}
      <motion.div className="absolute text-right select-none" style={{ bottom: '21%', right: '5%', zIndex: 5 }}
        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: EASE }}>
        {['3D WORLDS', 'MOTION DESIGN', 'DIGITAL ART'].map((skill, i) => (
          <motion.p key={skill} className="font-semibold uppercase"
            style={{ color: TEXT, fontSize: 'clamp(0.54rem, 0.82vw, 0.78rem)', letterSpacing: '0.14em', lineHeight: 1.8 }}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.1 + i * 0.08, ease: EASE }}>
            {skill}
          </motion.p>
        ))}
      </motion.div>

      {/* Copyright */}
      <motion.div className="absolute select-none" style={{ bottom: '4%', left: '5%', zIndex: 5 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.3, ease: EASE }}>
        <span className="uppercase" style={{ color: DIMMER, fontSize: '0.58rem', letterSpacing: '0.22em' }}>©2025–2026</span>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div className="absolute flex flex-col items-center gap-2 select-none pointer-events-none"
        style={{ bottom: '4%', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.5, ease: EASE }}>
        <span className="uppercase" style={{ color: DIMMER, fontSize: '0.52rem', letterSpacing: '0.30em' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 28, background: `linear-gradient(to bottom, oklch(0.35 0.02 215), transparent)` }}
        />
      </motion.div>

    </section>
  );
}
