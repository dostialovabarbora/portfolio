"use client";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

type Label = { text: string; side: "left" | "right"; offsetX: number | null; top: number | null };

const ease = [0.22, 1, 0.36, 1] as const;
/** Figma px (on the 1728 frame) → fluid vw, capped at the design size. */
const fx = (px: number) => `min(${((px / 1728) * 100).toFixed(3)}vw, ${px}px)`;

export function AboutHero({ image, video, labels }: { image?: string | null; video?: string | null; labels: readonly Label[] }) {
  const reduce = useReducedMotion();
  // Labels drift gently against the cursor for a bit of depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const lx = useTransform(sx, (v) => v * -14);
  const ly = useTransform(sy, (v) => v * -10);
  const px = useTransform(sx, (v) => v * 6);

  return (
    <section
      className="px-[var(--gutter)]"
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div className="relative h-[clamp(520px,57.87vw,1000px)] overflow-hidden rounded-[var(--radius-lg)]">
        <motion.div
          style={{ x: px }}
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

        {labels.map((label, i) => (
          <motion.p
            key={i}
            style={{
              x: lx,
              y: ly,
              top: `${((label.top ?? 0) / 1000) * 100}%`,
              ...(label.side === "right"
                ? { left: `calc(50% + ${fx(label.offsetX ?? 0)})` }
                : { right: `calc(50% + ${fx(label.offsetX ?? 0)})`, textAlign: "right" }),
            }}
            className="absolute whitespace-pre font-headline text-[clamp(10px,1.157vw,20px)] font-normal uppercase leading-[0.96] tracking-[-0.01em]"
            initial={reduce ? false : { opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.6 + i * 0.15, ease }}
          >
            {label.text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
