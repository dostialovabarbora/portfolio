"use client";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, useRef } from "react";

function Word({ word, i, total, progress }: { word: string; i: number; total: number; progress: MotionValue<number> }) {
  const start = i / total;
  const opacity = useTransform(progress, [start, start + 1 / total], [0.25, 1]);
  return (
    <motion.span className="inline-block" style={{ opacity }}>
      {word}
    </motion.span>
  );
}

/**
 * Closing card on the homepage (Figma 1373:44550): blurred running photo with a
 * 20% black wash and red Stack Sans text. Words light up one after another as
 * the card scrolls into view.
 */
export function StatementCard({ text, image }: { text: string; image?: string | null }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 55%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  if (!text) return null;
  const words = text.split(/\s+/);

  return (
    <section className="px-[var(--gutter)] pb-[var(--gutter)]">
      <div
        ref={ref}
        className="relative flex min-h-[clamp(420px,51.5vw,890px)] items-center justify-center overflow-hidden rounded-[clamp(20px,2.47vw,42.764px)] bg-sand px-[clamp(20px,6.25vw,108px)] py-20"
      >
        {image ? (
          <motion.div className="absolute inset-0" style={{ scale: reduce ? 1 : scale }}>
            <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
          </motion.div>
        ) : null}
        <div className="absolute inset-0 bg-black/20" />
        <p className="relative max-w-[1354px] text-center font-headline text-[clamp(30px,5.09vw,88px)] font-normal uppercase leading-[0.9] text-[#ff0000]">
          {reduce
            ? text
            : words.map((w, i) => (
                <Fragment key={i}>
                  <Word word={w} i={i} total={words.length} progress={scrollYProgress} />{" "}
                </Fragment>
              ))}
        </p>
      </div>
    </section>
  );
}
