import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { FadeIn } from '../animations/FadeIn';
import { LiveProjectButton } from '../ui/LiveProjectButton';

const PROJECTS = [
  {
    num: '01',
    name: 'Nextlevel Studio',
    category: 'Client',
    col1img1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
    col1img2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    col2img:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
  },
  {
    num: '02',
    name: 'Aura Brand Identity',
    category: 'Personal',
    col1img1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
    col1img2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    col2img:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
  },
  {
    num: '03',
    name: 'Solaris Digital',
    category: 'Client',
    col1img1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
    col1img2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    col2img:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
  },
];

const TOTAL = PROJECTS.length;
// Each card shrinks by this factor per level it gets buried
const SCALE_STEP = 0.06;
// Top offset per card so buried card edges stay visible
const PEEK_PX = 20;

interface ProjectCardProps {
  project: (typeof PROJECTS)[number];
  index: number;
  containerProgress: MotionValue<number>;
}

function ProjectCard({ project, index, containerProgress }: ProjectCardProps) {
  const n = TOTAL;
  const i = index;

  // ─── Y (slide in from below) ────────────────────────────────────────────
  // Card 0 starts in place.
  // Card i (i > 0) starts below the viewport and slides up during the
  // progress window that belongs to the previous card: [(i-1)/(n-1), i/(n-1)].
  const slideStart = i === 0 ? 0 : (i - 1) / (n - 1);
  const slideEnd   = i === 0 ? 0 : i / (n - 1);
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const y = useTransform(
    containerProgress,
    [slideStart, slideEnd],
    i === 0 ? [0, 0] : [vh, 0]
  );

  // ─── Scale (shrink as next card lands on top) ────────────────────────────
  // Card i shrinks while card i+1 is sliding in.
  const scaleStart   = i / (n - 1);
  const scaleEnd     = Math.min((i + 1) / (n - 1), 1);
  const targetScale  = i === n - 1 ? 1 : 1 - (n - 1 - i) * SCALE_STEP;
  const scale = useTransform(
    containerProgress,
    i === n - 1 ? [0, 1] : [scaleStart, scaleEnd],
    [1, targetScale]
  );

  // ─── Overlay (darken as card sinks into the stack) ───────────────────────
  const overlayOpacity = useTransform(
    containerProgress,
    i === n - 1 ? [0, 1] : [scaleStart, scaleEnd],
    [0, i === n - 1 ? 0 : 0.45]
  );

  const cardRadius = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';
  const topOffset = PEEK_PX + i * PEEK_PX;

  return (
    <motion.div
      className={`absolute inset-x-0 ${cardRadius} border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 overflow-hidden flex flex-col`}
      style={{
        top: topOffset,
        height: `calc(100svh - 40px - ${topOffset}px)`,
        zIndex: i + 1,
        y,
        scale,
        transformOrigin: 'top center',
      }}
    >
      {/* Depth overlay */}
      <motion.div
        className={`absolute inset-0 bg-black pointer-events-none z-10 ${cardRadius}`}
        style={{ opacity: overlayOpacity }}
      />

      {/* Top row */}
      <div className="relative flex flex-wrap items-center gap-4 mb-4 sm:mb-6 shrink-0">
        <div className="flex items-baseline gap-4 sm:gap-6 flex-1">
          <span
            className="font-black text-[#D7E2EA] leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
          >
            {project.num}
          </span>
          <div className="flex flex-col">
            <span
              className="text-[#D7E2EA]/50 font-medium uppercase tracking-widest"
              style={{ fontSize: 'clamp(0.65rem, 1vw, 0.85rem)' }}
            >
              {project.category}
            </span>
            <span
              className="text-[#D7E2EA] font-medium uppercase tracking-wide leading-tight"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.8rem)' }}
            >
              {project.name}
            </span>
          </div>
        </div>
        <LiveProjectButton />
      </div>

      {/* Image grid — flex-1 fills remaining card height */}
      <div className="relative flex gap-3 sm:gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-3 sm:gap-4" style={{ width: '40%' }}>
          <img
            src={project.col1img1}
            alt={`${project.name} preview 1`}
            loading="lazy"
            className={`w-full object-cover ${cardRadius}`}
            style={{ flex: '2', minHeight: 0 }}
          />
          <img
            src={project.col1img2}
            alt={`${project.name} preview 2`}
            loading="lazy"
            className={`w-full object-cover ${cardRadius}`}
            style={{ flex: '3', minHeight: 0 }}
          />
        </div>
        <div className="flex" style={{ width: '60%' }}>
          <img
            src={project.col2img}
            alt={`${project.name} preview 3`}
            loading="lazy"
            className={`w-full object-cover ${cardRadius}`}
            style={{ minHeight: 0 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectsSection() {
  // This tall div is the scroll driver — one viewport per card.
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]
        -mt-10 sm:-mt-12 md:-mt-14 z-10 relative
        px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-0"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center
            mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Project
        </h2>
      </FadeIn>

      {/*
        SCROLL DRIVER — its height creates the scroll room.
        Cards inside the sticky child are all absolutely positioned and
        layered on top of each other. As you scroll through this tall div,
        progress 0→1 drives all the card y/scale animations.
      */}
      <div
        ref={scrollRef}
        style={{ height: `${TOTAL * 60}svh` }}
      >
        {/*
          STICKY VIEWPORT — stays pinned at the top of the screen for the
          entire duration of the scroll driver. overflow:hidden clips cards
          sliding in from below so they don't cause horizontal scroll.
        */}
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: 'calc(100svh - 40px)' }}
        >
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.num}
              project={project}
              index={i}
              containerProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
