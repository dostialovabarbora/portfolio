"use client";
import { motion } from "motion/react";

export function ExperienceRow({ company, years, index }: { company: string; years: string; index: number }) {
  return (
    <li className="group flex items-center gap-3 text-[16px] leading-[1.2]">
      <span className="shrink-0 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1">{company}</span>
      <motion.span
        aria-hidden
        className="h-px flex-1 origin-left bg-black/25 transition-colors duration-300 group-hover:bg-black"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="w-[120px] shrink-0 text-right tabular-nums">{years}</span>
    </li>
  );
}
