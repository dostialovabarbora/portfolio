"use client";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useState } from "react";
import { AhojTitle } from "./Drawings";
import { Reveal } from "./Reveal";

export type Highlight = { text: string; image: string | null };

/** Figma px on the 1320-wide text frame → container-relative size, so the lines never rewrap. */
const u = (px: number) => `calc(${px} * 100cqw / 1320)`;

type Segment = { text: string; highlight?: Highlight };

function split(line: string, highlights: readonly Highlight[]): Segment[] {
  const list = highlights.filter((h) => h.text.trim());
  if (!list.length) return [{ text: line }];
  const escaped = list.map((h) => h.text.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  return line
    .split(re)
    .filter(Boolean)
    .map((text) => ({ text, highlight: list.find((h) => h.text.trim().toLowerCase() === text.toLowerCase()) }));
}

function Name({ text, image }: { text: string; image: string | null }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const x = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 });

  const track = (e: React.PointerEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
  };

  return (
    <span
      className="relative inline-block cursor-default"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.jump(e.clientX - r.left - r.width / 2);
        setOpen(true);
      }}
      onPointerMove={track}
      onPointerLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {text}
      <AnimatePresence>
        {open && image ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 z-10 block"
            style={{ x: sx, bottom: `calc(100% - max(${u(14)}, 4px))`, width: `max(${u(180)}, 150px)`, marginLeft: `calc(max(${u(180)}, 150px) / -2)` }}
          >
            <motion.span
              className="relative block aspect-[3/2] overflow-hidden rounded-[12px]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 16, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: -4 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8, rotate: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <Image quality={90} src={image} alt="" fill sizes="180px" className="object-cover" />
            </motion.span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

/**
 * Homepage statement (Figma 1358:43435). Each line from the CMS is its own
 * non-wrapping line, sized against a 1320px frame so the three lines look the
 * same on every screen. Names listed under "Intro hover images" show a tilted
 * photo card on hover.
 */
export function Intro({ text, highlights }: { text: string; highlights: readonly Highlight[] }) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    // Phones (Figma 1399:46285): a full first screen, title + 24px text wrapping naturally, centred a bit high.
    // Desktop: the fixed three lines on the 1320 frame with the title floating above.
    <section className="flex min-h-[calc(100svh-98px)] items-center justify-center px-[22px] pb-[60px] md:min-h-[clamp(220px,51.5vw,890px)] md:px-[var(--gutter)] md:pb-[clamp(40px,4.63vw,80px)] md:pt-[clamp(24px,4.63vw,80px)]">
      <div
        className="relative w-full max-w-[1320px] [container-type:inline-size]"
        style={{ "--tw": u(306), "--th": u(55), "--tb": `calc(100% + ${u(14)})`, "--fs": u(48) } as React.CSSProperties}
      >
        {/* Hand-lettered "Ahoj, I'm Barb" writes itself in above the statement */}
        <AhojTitle
          className="mx-auto mb-2 block h-[33px] w-[196px] rotate-[0.9deg] text-ink md:absolute md:bottom-[var(--tb)] md:left-1/2 md:mb-0 md:h-[var(--th)] md:w-[var(--tw)] md:-translate-x-1/2"
        />
        <Reveal y={24}>
          <p
            className="text-center font-headline text-[24px] font-normal uppercase leading-[0.9] md:text-[length:var(--fs)]"
          >
            {lines.map((line, i) => (
              <span key={i} className="md:block md:whitespace-nowrap">
                {i > 0 ? <span className="md:hidden"> </span> : null}
                {split(line, highlights).map((s, j) =>
                  s.highlight ? <Name key={j} text={s.text} image={s.highlight.image} /> : <span key={j}>{s.text}</span>
                )}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
