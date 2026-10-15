"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { IndexItem } from "@/lib/content";
import { Chips } from "./Chips";
import { HoverScribble } from "./HoverScribble";

type View = "grid" | "list";
const ease = [0.22, 1, 0.36, 1] as const;
/** Repeating card proportions give the grid its masonry rhythm. */
const ASPECTS = ["4 / 5", "1 / 1", "3 / 4", "5 / 6", "1 / 1", "4 / 5"];

/* ---------- toolbar icons ---------- */
const FilterIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden>
    <path d="M3 2v12M8 2v12M13 2v12" />
    <circle cx="3" cy="10" r="1.6" fill="var(--paper)" />
    <circle cx="8" cy="5" r="1.6" fill="var(--paper)" />
    <circle cx="13" cy="9" r="1.6" fill="var(--paper)" />
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden>
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
    <path d="M8 1.5v13M1.5 8h13" />
  </svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden>
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
    <path d="M1.5 5.5h13M1.5 8h13M1.5 10.5h13" />
  </svg>
);

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative grid size-9 place-items-center transition-opacity duration-200"
      style={{ opacity: active || hover ? 1 : 0.4 }}
    >
      <HoverScribble active={active} className="h-[26px] w-[44px] min-w-0" />
      {children}
    </button>
  );
}

/* ---------- grid ---------- */
function GridCard({ item, index }: { item: IndexItem; index: number }) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06, ease }}
      className="mb-[clamp(20px,2.2vw,36px)] break-inside-avoid"
    >
      <Link href={`/work/${item.slug}`} className="group block">
        <div
          className="relative overflow-hidden rounded-[clamp(10px,1.2vw,20px)]"
          style={{ aspectRatio: ASPECTS[index % ASPECTS.length], background: item.background }}
        >
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.05]"
            />
          ) : null}
          {/* project colour wash + arrow on hover */}
          <div
            className="absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-25"
            style={{ background: item.background }}
          />
          <span
            className="absolute right-3 top-3 grid size-9 translate-y-2 place-items-center rounded-full bg-paper text-[15px] opacity-0 transition-all duration-500 ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          >
            ↗
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <span className="font-headline text-[14px] leading-tight sm:text-[16px]">{item.title}</span>
          <Chips items={item.services} className="hidden justify-end sm:flex" />
        </div>
      </Link>
    </motion.li>
  );
}

/* ---------- list ---------- */
function ListRow({ item, index }: { item: IndexItem; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [hover, setHover] = useState(false);
  // Thumbnail trails the cursor horizontally inside the row.
  const rawX = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 26, mass: 0.6 });

  const place = (clientX: number, jump = false) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const target = Math.min(Math.max(clientX - r.left, r.width * 0.22), r.width * 0.62);
    if (jump) x.jump(target);
    rawX.set(target);
  };

  const fg = hover ? item.textColor : "var(--ink)";
  const bg = item.backgroundTo ? `linear-gradient(90deg, ${item.background}, ${item.backgroundTo})` : item.background;

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="relative border-b border-black/10"
      style={{ zIndex: hover ? 20 : 1 }}
    >
      <Link
        ref={ref}
        href={`/work/${item.slug}`}
        onMouseEnter={(e) => {
          place(e.clientX, true);
          setHover(true);
        }}
        onMouseMove={(e) => place(e.clientX)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="relative grid grid-cols-[1fr_auto] items-center gap-4 px-[clamp(8px,1.2vw,20px)] py-[clamp(18px,1.8vw,30px)] md:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,4fr)_80px]"
      >
        {/* colour fill rising from the row's bottom edge */}
        <motion.span
          aria-hidden
          className="absolute inset-0 origin-bottom"
          style={{ background: bg }}
          initial={false}
          animate={{ scaleY: hover ? 1 : 0 }}
          transition={{ duration: 0.45, ease }}
        />

        <span
          className="relative font-display text-[clamp(22px,2.2vw,38px)] uppercase leading-none tracking-[-0.03em] transition-colors duration-300"
          style={{ color: fg }}
        >
          {item.title}
        </span>
        <span className="relative hidden font-headline text-[14px] transition-colors duration-300 md:block" style={{ color: hover ? item.textColor : "var(--muted)" }}>
          {item.client}
        </span>
        <Chips items={item.services} tone={hover ? item.textColor : undefined} className="relative hidden justify-end md:flex" />
        <span className="relative text-right font-headline text-[14px] tabular-nums transition-colors duration-300" style={{ color: fg }}>
          {item.year}
        </span>

        {/* floating thumbnail */}
        {item.thumbnail ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 hidden w-[clamp(150px,13vw,230px)] md:block"
            style={{ x, translateX: "-50%", translateY: "-50%" }}
          >
            <motion.span
              className="relative block aspect-[4/3] overflow-hidden rounded-[10px] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.45)]"
              initial={false}
              animate={
                hover
                  ? { opacity: 1, scale: 1, rotate: -3 }
                  : { opacity: 0, scale: reduce ? 1 : 0.6, rotate: reduce ? 0 : -10 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Image src={item.thumbnail} alt="" fill sizes="230px" className="object-cover" />
            </motion.span>
          </motion.span>
        ) : null}
      </Link>
    </motion.li>
  );
}

/* ---------- index ---------- */
export function ProjectIndex({ items, title = "Index" }: { items: IndexItem[]; title?: string }) {
  const [view, setView] = useState<View>("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [service, setService] = useState<string | null>(null);

  const services = useMemo(() => [...new Set(items.flatMap((i) => i.services))].sort(), [items]);
  const shown = service ? items.filter((i) => i.services.includes(service)) : items;

  return (
    <section id="index" className="scroll-mt-6 px-[var(--gutter)] pb-[var(--gutter)]">
      <div className="flex flex-col items-center">
        <h2 className="font-display text-[clamp(40px,4.63vw,80px)] uppercase leading-none tracking-[-0.04em]">{title}</h2>
        <div className="mt-5 flex items-center gap-1">
          <ToolButton label="Filter by service" active={filterOpen || !!service} onClick={() => setFilterOpen((o) => !o)}>
            <FilterIcon />
          </ToolButton>
          <span className="mx-1 h-4 w-px bg-black/20" aria-hidden />
          <ToolButton label="Grid view" active={view === "grid"} onClick={() => setView("grid")}>
            <GridIcon />
          </ToolButton>
          <ToolButton label="List view" active={view === "list"} onClick={() => setView("list")}>
            <ListIcon />
          </ToolButton>
        </div>

        <AnimatePresence initial={false}>
          {filterOpen ? (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap justify-center gap-2 pt-5">
                {[null, ...services].map((s) => {
                  const on = service === s;
                  return (
                    <button
                      key={s ?? "all"}
                      type="button"
                      onClick={() => setService(s)}
                      className="rounded-full border border-ink px-3 py-1.5 font-headline text-[12px] lowercase leading-none transition-colors duration-200"
                      style={{ background: on ? "var(--ink)" : "transparent", color: on ? "var(--paper)" : "var(--ink)" }}
                    >
                      {s ?? "all work"}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-[clamp(32px,4vw,64px)]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "grid" ? (
            <motion.ul
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="columns-2 gap-[clamp(10px,1.2vw,20px)] lg:columns-3 xl:columns-4"
            >
              <AnimatePresence mode="popLayout">
                {shown.map((item, i) => (
                  <GridCard key={item.slug} item={item} index={i} />
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.ul
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-[1360px] border-t border-black/10"
            >
              <AnimatePresence mode="popLayout">
                {shown.map((item, i) => (
                  <ListRow key={item.slug} item={item} index={i} />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
        {!shown.length ? <p className="label py-20 text-center text-muted">Nothing here yet.</p> : null}
      </div>
    </section>
  );
}
