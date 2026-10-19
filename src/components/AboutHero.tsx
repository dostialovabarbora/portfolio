"use client";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Label = {
  text: string;
  side: "left" | "right";
  offsetX: number | null;
  top: number | null;
  mobileX?: number | null;
  mobileY?: number | null;
};

const ease = [0.22, 1, 0.36, 1] as const;
/** Figma px (on the 1728 frame) → fluid vw, capped at the design size. */
const fx = (px: number) => `min(${((px / 1728) * 100).toFixed(3)}vw, ${px}px)`;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+-";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Hover "decode": the label resolves left to right while the letters still to
 * come flicker through random glyphs (refreshed every 40ms for a slightly
 * choppy, terminal feel). Same timing as filipslovacek.com's nav labels:
 * 32ms per character, never shorter than 300ms or longer than 560ms.
 */
function GlitchLabel({ text, delay, style }: { text: string; delay: number; style: React.CSSProperties }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(text);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), []);

  const decode = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    cancelAnimationFrame(frame.current ?? 0);
    const chars = text.split("");
    const duration = Math.min(560, Math.max(300, chars.length * 32));
    const start = performance.now();
    let last = 0;
    const render = (settled: number) =>
      setShown(chars.map((c, i) => (i < settled || c === " " || c === "\n" ? c : glyph())).join(""));
    render(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      if (now - last > 40 || p === 1) {
        last = now;
        render(Math.floor(p * chars.length));
      }
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else setShown(text);
    };
    frame.current = requestAnimationFrame(tick);
  };

  return (
    <motion.p
      style={style}
      onPointerEnter={decode}
      aria-label={text.replace(/\n/g, " ")}
      className="absolute cursor-default whitespace-pre font-headline text-[clamp(10px,1.042vw,18px)] font-normal uppercase leading-[0.96] tracking-[-0.01em]"
      initial={reduce ? false : { opacity: 0, y: 10, clipPath: "inset(-20% -10% 110% -10%)" }}
      animate={{ opacity: 1, y: 0, clipPath: "inset(-20% -10% -20% -10%)" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      <span aria-hidden>{shown}</span>
    </motion.p>
  );
}

/** Phone "+" bubble (Figma 1380:45161); the cross turns 45° into a red × while its text shows. */
function Bubble({ open, label, onClick, x, y, delay }: { open: boolean; label: string; onClick: () => void; x: number; y: number; delay: number }) {
  const reduce = useReducedMotion();
  const colour = open ? "#FF0F0F" : "#000000";
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={open}
      data-bubble
      onClick={onClick}
      className="absolute -ml-[17.5px] -mt-[16.5px] grid size-[35px] place-items-center"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={reduce ? false : { opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 380, damping: 18, delay }}
    >
      <svg viewBox="0 0 35 33" width={35} height={33} fill="none" aria-hidden className="overflow-visible">
        <motion.path
          d="M33.9686 15.0238C33.9686 21.9537 35.402 31.2619 18.9177 32C12.1886 32 3.86684 31.2619 1.00001 19.4524C1.00001 12.5225 1.00001 3.95238 18.201 1C24.93 1 33.9686 8.09395 33.9686 15.0238Z"
          strokeWidth={2}
          animate={{ stroke: colour }}
          transition={{ duration: 0.25 }}
        />
        <motion.g
          style={{ transformOrigin: "17.6px 17.6px" }}
          animate={{ rotate: open ? 45 : 0, stroke: colour }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M17.1398 24.5588C17.146 24.565 17.1522 24.5711 17.1567 23.2807C17.1611 21.9903 17.1637 19.4031 17.2875 17.1659C17.4113 14.9288 17.6561 13.1201 17.7808 12.1398C17.9054 11.1595 17.9024 11.0624 17.8589 10.92" />
          <path d="M11.3979 17.381C11.4072 17.3718 11.5607 17.3177 13.7186 17.2544C15.7264 17.1955 19.5923 17.2639 21.6614 17.287C23.7176 17.3101 23.8847 17.3323 24.0103 17.3489C24.1385 17.3659 24.2292 17.3764 24.32 17.381" />
        </motion.g>
      </svg>
    </motion.button>
  );
}

export function AboutHero({ image, video, labels }: { image?: string | null; video?: string | null; labels: readonly Label[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  // Tapping anywhere that isn't a bubble closes the open text.
  useEffect(() => {
    if (active === null) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-bubble]")) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);
  const ordered = [...labels].map((label, i) => ({ label, i })).sort((a, b) => (a.label.top ?? 0) - (b.label.top ?? 0));

  return (
    // Tapping anywhere outside a bubble closes the open text (phones).
    <section className="px-[var(--gutter)]">
      <div className="relative md:h-[clamp(520px,57.87vw,1000px)] md:overflow-hidden md:rounded-[var(--radius-lg)]">
        {/* Phone: 401 × 600 video, full width — but never taller than the screen minus the nav and
            the text line under it, so the tapped text is always visible. Desktop: centred 550 × 824 portrait. */}
        <motion.div
          className="relative mx-auto aspect-[401/600] h-[min(calc(100vw*600/401),calc(100svh-206px))] max-w-[100vw] md:absolute md:bottom-[8.8%] md:left-1/2 md:top-[8.8%] md:h-auto md:max-w-none md:aspect-[550/824] md:-translate-x-1/2"
          initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {video ? (
              <video className="h-full w-full object-cover [filter:brightness(1.012)]" src={video} poster={image ?? undefined} autoPlay muted loop playsInline />
            ) : image ? (
              <Image quality={90} src={image} alt="Barbora Dostálová" fill priority sizes="(max-width: 768px) 100vw, 560px" className="object-cover [filter:brightness(1.012)]" />
            ) : null}
          </div>
          <div className="md:hidden">
            {ordered.map(({ label, i }, order) => (
              <Bubble
                key={i}
                label={label.text.replace(/\n/g, " ")}
                open={active === i}
                onClick={() => setActive((a) => (a === i ? null : i))}
                x={label.mobileX ?? (label.side === "left" ? 22 : 75)}
                y={label.mobileY ?? Math.max(5, Math.min(95, ((label.top ?? 500) / 1000) * 121 - 4))}
                delay={reduce ? 0 : 0.9 + order * 0.12}
              />
            ))}
          </div>
        </motion.div>

        {/* Desktop labels appear one by one, top to bottom, after the portrait. */}
        <div className="hidden md:block">
          {ordered.map(({ label, i }, order) => (
            <GlitchLabel
              key={i}
              text={label.text}
              delay={0.9 + order * 0.35}
              style={{
                top: `${((label.top ?? 0) / 1000) * 100}%`,
                ...(label.side === "right"
                  ? { left: `calc(50% + ${fx(label.offsetX ?? 0)})` }
                  : { right: `calc(50% + ${fx(label.offsetX ?? 0)})`, textAlign: "right" }),
              }}
            />
          ))}
        </div>
      </div>

      {/* Phone: the tapped bubble's text, 40px under the video */}
      <div className="relative mt-10 min-h-[35px] md:hidden" aria-live="polite">
        <AnimatePresence mode="wait">
          {active !== null && labels[active] ? (
            <motion.p
              key={active}
              className="whitespace-pre text-center font-headline text-[18px] font-normal uppercase leading-[0.96] tracking-[-0.01em]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease }}
            >
              {labels[active].text}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
