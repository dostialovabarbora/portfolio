"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Label = { text: string; side: "left" | "right"; offsetX: number | null; top: number | null };

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
      className="absolute cursor-default whitespace-pre font-headline text-[clamp(10px,1.157vw,20px)] font-normal uppercase leading-[0.96] tracking-[-0.01em]"
      initial={reduce ? false : { opacity: 0, y: 10, clipPath: "inset(-20% -10% 110% -10%)" }}
      animate={{ opacity: 1, y: 0, clipPath: "inset(-20% -10% -20% -10%)" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      <span aria-hidden>{shown}</span>
    </motion.p>
  );
}

export function AboutHero({ image, video, labels }: { image?: string | null; video?: string | null; labels: readonly Label[] }) {
  const reduce = useReducedMotion();

  return (
    <section className="px-[var(--gutter)]">
      <div className="relative h-[clamp(520px,57.87vw,1000px)] overflow-hidden rounded-[var(--radius-lg)]">
        <motion.div
          className="absolute bottom-[8.8%] left-1/2 top-[8.8%] aspect-[550/824] -translate-x-1/2 overflow-hidden"
          initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease }}
        >
          {video ? (
            <video className="h-full w-full object-cover" src={video} poster={image ?? undefined} autoPlay muted loop playsInline />
          ) : image ? (
            <Image src={image} alt="Barbora Dostálová" fill priority sizes="(max-width: 768px) 60vw, 560px" className="object-cover" />
          ) : null}
        </motion.div>

        {/* Labels appear one by one, top to bottom, after the portrait. */}
        {[...labels]
          .map((label, i) => ({ label, i }))
          .sort((a, b) => (a.label.top ?? 0) - (b.label.top ?? 0))
          .map(({ label, i }, order) => (
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
    </section>
  );
}
