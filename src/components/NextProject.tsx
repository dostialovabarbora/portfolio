"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

export function NextProject({
  href,
  title,
  background,
  backgroundTo,
  textColor,
}: {
  href: string;
  title: string;
  background: string;
  backgroundTo?: string;
  textColor: string;
}) {
  const [hover, setHover] = useState(false);
  const bg = backgroundTo ? `linear-gradient(180deg, ${background} 0%, ${backgroundTo} 100%)` : background;
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group mx-[var(--gutter-case)] mb-[var(--gutter-case)] mt-[clamp(72px,9vw,160px)] block"
    >
      <p className="label mb-4 px-1">Next project</p>
      <motion.div
        className="relative flex h-[clamp(180px,24vw,420px)] items-end overflow-hidden rounded-[var(--radius)] p-[clamp(16px,2.31vw,40px)]"
        style={{ background: bg, color: textColor }}
        animate={{ height: hover ? "clamp(220px, 30vw, 520px)" : "clamp(180px, 24vw, 420px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-display text-[clamp(48px,9vw,160px)] uppercase leading-[0.8] tracking-[-0.04em]">{title}</span>
        <motion.span
          aria-hidden
          className="absolute right-[clamp(16px,2.31vw,40px)] top-[clamp(16px,2.31vw,40px)] font-display text-[clamp(28px,3vw,56px)] leading-none"
          animate={{ x: hover ? 0 : -12, y: hover ? 0 : 12, opacity: hover ? 1 : 0.6 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          ↗
        </motion.span>
      </motion.div>
    </Link>
  );
}
