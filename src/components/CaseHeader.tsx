"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type Props = {
  title: string;
  tagline?: string;
  year?: string;
  background: string;
  backgroundTo?: string;
  textColor: string;
  image?: string | null;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function CaseHeader({ title, tagline, year, background, backgroundTo, textColor, image }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // The title drifts slower than the page and the card scales back a touch as you leave it.
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const words = title.split(" ");
  const lines = image && words.length > 1 ? [words[0], words.slice(1).join(" ")] : words.length > 1 && title.length > 9 ? [words[0], words.slice(1).join(" ")] : [title];
  const bg = backgroundTo ? `linear-gradient(180deg, ${background} 0%, ${backgroundTo} 100%)` : background;

  return (
    <motion.header
      ref={ref}
      style={{ background: bg, color: textColor, scale }}
      className="relative mx-[var(--gutter-case)] mt-[var(--gutter-case)] aspect-[1648/936] max-h-[calc(100svh-2*var(--gutter-case))] min-h-[420px] w-[calc(100%-2*var(--gutter-case))] origin-top overflow-hidden rounded-[var(--radius)] max-md:aspect-auto max-md:h-[78svh]"
    >
      {tagline ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          className="absolute left-[42.5%] top-1/2 w-[min(426px,40%)] -translate-y-full font-display text-[clamp(14px,1.157vw,20px)] leading-none tracking-[-0.02em] max-md:left-[var(--gutter-case)] max-md:top-[18%] max-md:w-[70%]"
        >
          {tagline}
        </motion.p>
      ) : null}
      {year ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute right-[clamp(16px,2.31vw,40px)] top-[calc(50%-36px)] font-display text-[clamp(14px,1.157vw,20px)] uppercase leading-[0.9] tracking-[-0.02em] max-md:top-[18%]"
        >
          {year} ©
        </motion.p>
      ) : null}

      <motion.h1
        style={{ y: titleY }}
        className="absolute bottom-[clamp(16px,2.31vw,40px)] left-[clamp(16px,2.31vw,40px)] font-display text-[clamp(56px,11.574vw,200px)] uppercase leading-[0.8] tracking-[-0.04em]"
      >
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.04em]">
            <motion.span
              className="flex items-end gap-[0.12em]"
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease }}
            >
              {line}
              {i === 0 && image ? (
                <motion.img
                  src={image}
                  alt=""
                  className="mb-[0.02em] h-[0.63em] w-auto mix-blend-multiply"
                  initial={{ rotate: -14, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.7 }}
                  whileHover={{ rotate: 10, scale: 1.08 }}
                />
              ) : null}
            </motion.span>
          </span>
        ))}
      </motion.h1>
    </motion.header>
  );
}
