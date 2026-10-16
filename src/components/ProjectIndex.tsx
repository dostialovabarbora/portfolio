"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { CoverShape, IndexItem } from "@/lib/content";
import { ToggleLoop, WorkWord } from "./Drawings";

type View = "covers" | "lines";
const ease = [0.22, 1, 0.36, 1] as const;
/** Cover proportions from the Figma frame (507 wide). */
const SHAPE: Record<CoverShape, string> = { tall: "507 / 660", square: "1 / 1", wide: "507 / 380" };

/* ---------- labels ---------- */
function Labels({ items, className = "" }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`}>
      {items.map((s) => (
        <li
          key={s}
          className="whitespace-nowrap rounded-[12px] border border-ink px-[clamp(6px,0.46vw,8px)] py-[clamp(4px,0.35vw,6px)] font-display text-[clamp(12px,0.93vw,16px)] leading-[1.2] tracking-[-0.02em]"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}

/* ---------- view toggle (Figma: covers / list icons, 40px, inactive at 24%) ---------- */
function CoversIcon() {
  return (
    <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth={2.09} aria-hidden>
      <rect x="6.75" y="6.75" width="26.5" height="26.5" rx="2.8" />
      <path d="M20 6v28M6 20h28" />
    </svg>
  );
}
function LinesIcon() {
  return (
    <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth={2.09} aria-hidden>
      <rect x="6.75" y="6.75" width="26.5" height="26.5" rx="2.8" />
      <path d="M6 13.5h28M6 20h28M6 26.5h28" />
    </svg>
  );
}

function ViewButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="relative size-8 transition-opacity duration-300 hover:!opacity-100"
      style={{ opacity: active ? 1 : 0.24 }}
    >
      {children}
      {active ? (
        // The loop is flipped vertically in Figma; keyed so it redraws on every switch.
        <ToggleLoop key={label} className="pointer-events-none absolute left-1/2 top-1/2 h-[40px] w-[54px] -translate-x-1/2 -translate-y-[48%] -scale-y-100" />
      ) : null}
    </button>
  );
}

/* ---------- covers ---------- */
function Cover({ item, index }: { item: IndexItem; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.08, ease }}
    >
      <Link href={`/work/${item.slug}`} className="group block">
        <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: SHAPE[item.coverShape] }}>
          {item.cover ? (
            <Image
              src={item.cover}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
              className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            />
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="font-display text-[clamp(22px,1.62vw,28px)] leading-[1.2] tracking-[-0.02em]">{item.title}</span>
          <Labels items={item.services} />
        </div>
      </Link>
    </motion.li>
  );
}

/* ---------- lines ---------- */
function Line({ item, index }: { item: IndexItem; index: number }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease }}
      className="relative border-b border-black/[0.08]"
      style={{ zIndex: hover ? 10 : 1 }}
    >
      <Link
        href={`/work/${item.slug}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="relative grid grid-cols-[1fr_auto] items-center gap-4 px-[clamp(12px,2.31vw,40px)] py-[clamp(20px,2.31vw,40px)] transition-colors duration-300 md:grid-cols-[41.67%_1fr_auto]"
        style={{ background: hover ? "var(--sand)" : "transparent" }}
      >
        <span className="font-display text-[clamp(26px,2.31vw,40px)] leading-[1.2] tracking-[-0.02em]">{item.title}</span>
        <span className="hidden font-display text-[clamp(15px,1.16vw,20px)] leading-[1.2] tracking-[-0.02em] text-black/[0.48] md:block">
          {item.client}
        </span>
        <Labels items={item.services} className="hidden justify-end sm:flex" />

        {/* Hover preview — 280 × 180, radius 16, between the name and client columns */}
        {item.cover ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-[calc(19.4%)] top-1/2 hidden aspect-[280/180] w-[clamp(180px,16.2vw,280px)] overflow-hidden rounded-[16px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] md:block"
            initial={false}
            animate={hover ? { opacity: 1, scale: 1, y: "-50%" } : { opacity: 0, scale: reduce ? 1 : 0.85, y: "-42%" }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <Image src={item.cover} alt="" fill sizes="280px" className="object-cover" />
          </motion.span>
        ) : null}
      </Link>
    </motion.li>
  );
}

/* ---------- index ---------- */
export function ProjectIndex({ items }: { items: IndexItem[] }) {
  const [view, setView] = useState<View>("covers");

  return (
    <section id="work" className="scroll-mt-6 px-[var(--gutter)] pb-[clamp(80px,11.57vw,200px)]">
      <header className="flex flex-col items-center">
        <h2 className="relative text-center font-headline text-[clamp(32px,2.78vw,48px)] font-medium uppercase leading-[0.9]">
          Selected
          <span className="sr-only"> work</span>
          <WorkWord className="pointer-events-none absolute left-1/2 top-[0.46em] h-[1.91em] w-[3.22em] -translate-x-1/2" />
        </h2>
        <div className="mt-[clamp(56px,4.4vw,76px)] flex items-center gap-9">
          <ViewButton label="Covers" active={view === "covers"} onClick={() => setView("covers")}>
            <CoversIcon />
          </ViewButton>
          <ViewButton label="Lines" active={view === "lines"} onClick={() => setView("lines")}>
            <LinesIcon />
          </ViewButton>
        </div>
      </header>

      <div className="mt-[clamp(56px,6.94vw,120px)]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "covers" ? (
            <motion.ul
              key="covers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid items-start gap-x-[clamp(12px,1.39vw,24px)] gap-y-[clamp(40px,4.63vw,80px)] sm:grid-cols-2 lg:grid-cols-3"
            >
              {items.map((item, i) => (
                <Cover key={item.slug} item={item} index={i} />
              ))}
            </motion.ul>
          ) : (
            <motion.ul
              key="lines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {items.map((item, i) => (
                <Line key={item.slug} item={item} index={i} />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        {!items.length ? <p className="py-20 text-center font-display text-muted">New work is on its way.</p> : null}
      </div>
    </section>
  );
}
