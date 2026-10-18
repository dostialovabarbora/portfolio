"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

/**
 * Figma logo component set (752:1749): every mouse-enter swaps to the next
 * variant (barb-1 → barb-2 → barb-3 → …). The outgoing mark blurs and lifts
 * away while the next one springs in from a slight tilt.
 */
const VARIANTS = ["/brand/logo-1.svg", "/brand/logo-nature.webp", "/brand/logo-balloon.webp"];
const ease = [0.22, 1, 0.36, 1] as const;

export function Logo({ className = "h-[56px] w-[128px]" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const next = () => setIndex((i) => (i + 1) % VARIANTS.length);

  return (
    <Link
      href="/"
      aria-label="Barbora Dostálová — home"
      onMouseEnter={next}
      onFocus={next}
      className={`relative block ${className}`}
    >
      {/* Preload every variant so the first swap is instant */}
      {VARIANTS.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <AnimatePresence initial={false}>
        <motion.img
          key={VARIANTS[index]}
          src={VARIANTS[index]}
          alt=""
          width={128}
          height={56}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72, rotate: -7, y: 6, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
            y: 0,
            filter: "blur(0px)",
            transition: {
              scale: { type: "spring", stiffness: 380, damping: 17, mass: 0.8 },
              rotate: { type: "spring", stiffness: 300, damping: 14 },
              y: { type: "spring", stiffness: 300, damping: 20 },
              opacity: { duration: 0.25, ease: "easeOut" },
              filter: { duration: 0.45, ease },
            },
          }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.2 } }
              : { opacity: 0, scale: 1.18, rotate: 5, y: -8, filter: "blur(10px)", transition: { duration: 0.4, ease } }
          }
        />
      </AnimatePresence>
    </Link>
  );
}
