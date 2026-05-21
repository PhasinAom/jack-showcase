import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';

// ─── Tokens (mirror hero) ─────────────────────────────────────────────────────
const BG      = '#0C0C0C';
const TEXT    = 'oklch(0.94 0.008 265)';
const DIM     = 'oklch(0.48 0.006 265)';
const DIMMER  = 'oklch(0.26 0.006 265)';
const RULE    = 'oklch(0.20 0.006 265)';
const ACCENT  = 'oklch(0.58 0.26 316)';
const EASE    = [0.4, 0, 0.2, 1] as const;

// ─── Content ─────────────────────────────────────────────────────────────────
const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact'];

const SOCIALS = [
  {
    label: 'Instagram',
    href:  '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href:  '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href:  '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="3" />
        <line x1="8" y1="11" x2="8" y2="17" />
        <line x1="8" y1="7" x2="8" y2="8" />
        <path d="M12 11v6m0 0v-4a2 2 0 0 1 4 0v4" />
      </svg>
    ),
  },
];

// ─── Variants ────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay, ease: EASE } },
});

function Float({ children, amp = 12, dur = 6 }: {
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

function useMagnetic(strength = 0.35) {
  const ref  = useRef<HTMLElement>(null);
  const rx   = useMotionValue(0);
  const ry   = useMotionValue(0);
  const x    = useSpring(rx, { stiffness: 200, damping: 22 });
  const y    = useSpring(ry, { stiffness: 200, damping: 22 });

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = ref.current!.getBoundingClientRect();
    rx.set((e.clientX - r.left - r.width  / 2) * strength);
    ry.set((e.clientY - r.top  - r.height / 2) * strength);
  }, [rx, ry, strength]);

  const onLeave = useCallback(() => { rx.set(0); ry.set(0); }, [rx, ry]);
  return { ref, x, y, onMove, onLeave };
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M2 11L11 2M11 2H4.5M11 2V8.5" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function FooterSection() {
  const btn    = useMagnetic(0.38);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Scroll-driven horizontal drift for headline lines
  const { scrollYProgress } = useScroll({
    target:  ctaRef,
    offset:  ['start end', 'end start'],
  });
  const x1 = useTransform(scrollYProgress, [0, 1], ['7vw',  '-5vw']);   // left
  const x2 = useTransform(scrollYProgress, [0, 1], ['-7vw', '5vw']);    // right
  const x3 = useTransform(scrollYProgress, [0, 1], ['5vw',  '-7vw']);   // left, different pace

  return (
    <footer id="contact" style={{ backgroundColor: BG }}>

      {/* ══ CTA SECTION ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden px-8 md:px-14 lg:px-16 pt-28 md:pt-36 pb-24 md:pb-32">

        {/* Grain */}
        <div className="fixed inset-0 pointer-events-none" style={{
          zIndex: 60,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.042,
        }} />

        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 35% 55%, oklch(0.22 0.06 316 / 0.45), transparent 70%)',
          }}
        />

        {/* Floating object — top-right decoration */}
        <motion.div
          className="absolute hidden lg:block pointer-events-none select-none"
          style={{ top: '8%', right: '6%', width: 'clamp(140px, 16vw, 240px)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.0, delay: 0.6, ease: EASE }}
        >
          <Float amp={14} dur={7}>
            <img src="/obj-palette.png" alt="" draggable={false}
              className="w-full select-none" />
          </Float>
        </motion.div>

        {/* Second object — bottom-left, subtle */}
        <motion.div
          className="absolute hidden lg:block pointer-events-none select-none"
          style={{ bottom: '14%', right: '18%', width: 'clamp(90px, 9vw, 140px)', opacity: 0.6 }}
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 0.6, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.0, delay: 0.85, ease: EASE }}
        >
          <Float amp={10} dur={8.5}>
            <img src="/obj-pencil.png" alt="" draggable={false}
              className="w-full select-none" />
          </Float>
        </motion.div>

        {/* ── Eyebrow ─────────────────────────────────────────── */}
        <motion.div
          className="flex items-center gap-3 mb-10 md:mb-14"
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div style={{ width: '2rem', height: '1px', backgroundColor: RULE }} />
          <span className="uppercase"
            style={{ color: DIM, fontSize: '0.66rem', letterSpacing: '0.30em' }}>
            Get in touch
          </span>
        </motion.div>

        {/* ── Headline — scroll-driven horizontal drift ────────── */}
        <div
          ref={ctaRef}
          className="font-black uppercase leading-[0.88] mb-14 md:mb-20"
          style={{ fontSize: 'clamp(3.8rem, 10.5vw, 11rem)', letterSpacing: '-0.03em' }}
        >
          <div style={{ overflow: 'hidden' }}>
            <motion.div style={{ x: x1, color: TEXT }}>Let's build</motion.div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.div style={{ x: x2, color: ACCENT }}>something</motion.div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.div style={{ x: x3, color: TEXT }}>insane.</motion.div>
          </div>
        </div>

        {/* ── Rule ────────────────────────────────────────────── */}
        <motion.div
          className="origin-left mb-10 md:mb-12"
          style={{ height: '1px', backgroundColor: RULE }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.1, ease: EASE }}
        />

        {/* ── Bottom row: tagline + CTA ────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-10">

          {/* Tagline */}
          <motion.p
            className="font-light"
            style={{ color: DIM, fontSize: 'clamp(0.85rem, 1.3vw, 1.05rem)', lineHeight: 1.75, maxWidth: '28ch' }}
            variants={fadeUp(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.span
              style={{ display: 'block' }}
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2, repeatDelay: 0.6 }}
            >
              Got a project in mind?
              <br />Let's make it unforgettable.
            </motion.span>
          </motion.p>

          {/* CTA + email */}
          <motion.div
            className="flex flex-col items-start sm:items-end gap-4"
            variants={fadeUp(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* Magnetic button */}
            <motion.button
              ref={btn.ref as React.RefObject<HTMLButtonElement>}
              style={{
                x: btn.x, y: btn.y,
                padding: '0.8rem 1.1rem 0.8rem 1.6rem',
                border: `1px solid ${RULE}`,
                background: 'oklch(0.13 0.008 265)',
                color: TEXT,
              }}
              onMouseMove={btn.onMove as unknown as React.MouseEventHandler<HTMLButtonElement>}
              onMouseLeave={btn.onLeave as unknown as React.MouseEventHandler<HTMLButtonElement>}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 rounded-full cursor-pointer select-none"
            >
              <span className="font-medium uppercase"
                style={{ fontSize: '0.70rem', letterSpacing: '0.22em' }}>
                Start a project
              </span>
              <motion.span
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: RULE, color: TEXT, flexShrink: 0 }}
                whileHover={{ backgroundColor: ACCENT, x: 3, y: -3,
                  transition: { duration: 0.22, ease: EASE } }}
              >
                <Arrow />
              </motion.span>
            </motion.button>

            {/* Email */}
            <motion.a
              href="mailto:hello@jack.com"
              className="uppercase transition-colors duration-300"
              style={{ color: DIMMER, fontSize: '0.68rem', letterSpacing: '0.18em', fontWeight: 500 }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 2.4, repeatDelay: 0.3 }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = DIMMER)}
            >
              hello@jack.com
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* ══ FOOTER BAR ═══════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${RULE}` }}>

        {/* Main bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center
          gap-6 px-8 md:px-14 lg:px-16 py-6">

          {/* Logo */}
          <span className="font-black uppercase"
            style={{ color: TEXT, fontSize: '0.78rem', letterSpacing: '0.22em' }}>
            Jack
          </span>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-6 md:gap-8">
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="uppercase transition-colors duration-300"
                style={{ color: DIM, fontSize: '0.68rem', letterSpacing: '0.18em', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={e => (e.currentTarget.style.color = DIM)}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-5">
            {SOCIALS.map(s => (
              <motion.a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="transition-colors duration-300"
                style={{ color: DIMMER }}
                whileHover={{ color: TEXT, y: -2, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.9 }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center
            gap-2 px-8 md:px-14 lg:px-16 pb-7 pt-2"
          style={{ borderTop: `1px solid ${RULE}` }}
        >
          <span className="uppercase"
            style={{ color: DIMMER, fontSize: '0.56rem', letterSpacing: '0.22em' }}>
            © 2024 Jack — All rights reserved
          </span>
          <span className="uppercase"
            style={{ color: DIMMER, fontSize: '0.56rem', letterSpacing: '0.22em' }}>
            3D Creator — Branding — Web Design
          </span>
        </div>
      </div>

    </footer>
  );
}
