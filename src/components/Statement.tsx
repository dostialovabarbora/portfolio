"use client";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

/** Closing statement — words light up as the card scrolls through the viewport. */
export function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const words = text.split(/\s+/);
  return (
    <div
      ref={ref}
      className="mx-[var(--gutter)] mb-[var(--gutter)] flex min-h-[clamp(360px,51.5vw,890px)] items-center justify-center rounded-[clamp(20px,2.47vw,42.764px)] bg-sand px-[clamp(20px,7vw,124px)] py-20"
    >
      <p className="max-w-[1320px] text-center font-headline text-[clamp(26px,2.78vw,48px)] font-medium uppercase leading-[0.9]">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>
    </div>
  );
}
