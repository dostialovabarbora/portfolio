"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { IndexItem } from "@/lib/content";
import { Chips } from "./Chips";

const ease = [0.22, 1, 0.36, 1] as const;

/** Resting pose of each card in the stack: front, middle, back. */
const POSES = [
  { x: "0%", y: "0%", rotate: -2, z: 3 },
  { x: "14%", y: "9%", rotate: 4, z: 2 },
  { x: "22%", y: "-6%", rotate: 9, z: 1 },
];

/**
 * Featured showcase — big project names on the left; hovering one swaps the
 * fanned image stack, summary and service tags on the right.
 */
export function FeaturedShowcase({ items }: { items: IndexItem[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const current = items[active];
  const stack = current.featuredImages.length ? current.featuredImages : current.thumbnail ? [current.thumbnail] : [];

  return (
    <section className="grid items-center overflow-x-clip gap-y-10 px-[var(--gutter)] pb-[clamp(64px,8vw,140px)] pt-[clamp(32px,5vw,96px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-x-[clamp(24px,4vw,72px)]">
      <ul className="order-2 md:order-1">
        {items.map((item, i) => (
          <li key={item.slug}>
            <Link
              href={`/work/${item.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group flex items-baseline gap-3 py-[0.04em] font-display text-[clamp(40px,4.63vw,80px)] uppercase leading-[0.92] tracking-[-0.04em] outline-none"
            >
              <span
                className="transition-colors duration-300 ease-out"
                style={{ color: i === active ? "var(--ink)" : "rgba(0,0,0,0.16)" }}
              >
                {item.title}
              </span>
              <motion.span
                aria-hidden
                className="font-headline text-[clamp(12px,0.93vw,16px)] tracking-normal text-ink"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, x: i === active ? 0 : -8 }}
                transition={{ duration: 0.35, ease }}
              >
                {item.year}
              </motion.span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="order-1 md:order-2">
        {/* Image stack */}
        <div className="relative mx-auto aspect-[4/3] w-[78%] md:mr-[18%] md:w-[72%]">
          <AnimatePresence initial={false}>
            {stack.slice(0, 3).map((src, i) => {
              const pose = POSES[i];
              return (
                <motion.div
                  key={`${current.slug}-${i}`}
                  className="absolute inset-0 overflow-hidden rounded-[clamp(10px,1.2vw,20px)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]"
                  style={{ zIndex: pose.z, background: i === 0 ? current.background : current.backgroundTo ?? current.background }}
                  initial={reduce ? false : { opacity: 0, x: pose.x, y: "12%", rotate: pose.rotate - 8, scale: 0.92 }}
                  animate={{ opacity: 1, x: pose.x, y: pose.y, rotate: pose.rotate, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                  transition={{ type: "spring", stiffness: 170, damping: 22, delay: 0.06 + (2 - i) * 0.05 }}
                >
                  <Image src={src} alt="" fill sizes="(max-width: 768px) 80vw, 40vw" className="object-cover" priority={active === 0} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Summary + tags */}
        <div className="mx-auto mt-[clamp(40px,6vw,96px)] w-[78%] md:ml-0 md:w-[64%]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease }}
            >
              {current.summary ? <p className="mono-copy mb-4 !text-left">{current.summary}</p> : null}
              <Chips items={current.services} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
