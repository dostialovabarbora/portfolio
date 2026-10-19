"use client";
import Image from "next/image";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Piece } from "@/lib/content";

/**
 * Spots from the Figma "Imagination" frame (535:14, 1920 × 1405). Pieces fill
 * them in CMS order; every 7 pieces add a new block next to / below the last,
 * so the canvas grows with the collection. Each picture appears once.
 */
const TILE = { w: 1920, h: 1405 };
const SPOTS = [
  { x: 80, y: 213, w: 299, h: 299 },
  { x: 522, y: 328, w: 425, h: 314 },
  { x: 1069, y: 213, w: 203, h: 283 },
  { x: 1415, y: 295, w: 425, h: 238 },
  { x: 303, y: 775, w: 203, h: 203 },
  { x: 748, y: 732, w: 425, h: 574 },
  { x: 1313, y: 657, w: 236, h: 236 },
];
const EASE = [0.65, 0, 0.35, 1] as const;

type Placed = Piece & { x: number; y: number; w: number; h: number; index: number };

function layout(pieces: Piece[]) {
  const blocks = Math.max(1, Math.ceil(pieces.length / SPOTS.length));
  const cols = Math.ceil(Math.sqrt(blocks));
  const placed: Placed[] = pieces.map((p, i) => {
    const b = Math.floor(i / SPOTS.length);
    const s = SPOTS[i % SPOTS.length];
    // Keep the picture's own proportions: fit it inside the spot (never crop), centred in it.
    const k = p.width && p.height ? Math.min(s.w / p.width, s.h / p.height) : 1;
    const w = p.width && p.height ? Math.round(p.width * k) : s.w;
    const h = p.width && p.height ? Math.round(p.height * k) : s.h;
    const x = s.x + (s.w - w) / 2 + (b % cols) * TILE.w;
    const y = s.y + (s.h - h) / 2 + Math.floor(b / cols) * TILE.h;
    return { ...p, index: i, x, y, w, h };
  });
  // Canvas ends 80px (Figma margin) past the right-most / lowest picture + caption.
  const width = Math.max(TILE.w, ...placed.map((p) => p.x + p.w + 80));
  const height = Math.max(...placed.map((p) => p.y + p.h + 20 + 80), 0);
  return { placed, width, height };
}

function useViewport() {
  const [vp, setVp] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return vp;
}

/** Rubber-band past the edges, like a native scroll view. */
const rubber = (v: number, min: number, max: number) => {
  if (v > max) return max + (v - max) * 0.35;
  if (v < min) return min + (v - min) * 0.35;
  return v;
};

export function ImaginationCanvas({ pieces }: { pieces: Piece[] }) {
  const reduce = useReducedMotion();
  const vp = useViewport();
  const scale = Math.min(1, Math.max(0.5, vp.w / 1728));
  const { placed, width, height } = useMemo(() => layout(pieces), [pieces]);
  const W = width * scale;
  const H = height * scale;
  const top = 0;

  // Pan limits — if the canvas is narrower/shorter than the screen it stays centred.
  const bounds = useMemo(() => {
    const bx = W <= vp.w ? { min: (vp.w - W) / 2, max: (vp.w - W) / 2 } : { min: vp.w - W, max: 0 };
    const by = H + top <= vp.h ? { min: top, max: top } : { min: vp.h - H, max: top };
    return { x: bx, y: by };
  }, [W, H, vp, top]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glide = useRef<AnimationPlaybackControls[]>([]);
  const stop = () => {
    glide.current.forEach((a) => a.stop());
    glide.current = [];
  };

  // Keep the canvas inside its bounds when the window changes.
  useEffect(() => {
    x.set(Math.min(bounds.x.max, Math.max(bounds.x.min, x.get())));
    y.set(Math.min(bounds.y.max, Math.max(bounds.y.min, y.get() || bounds.y.max)));
  }, [bounds, x, y]);

  const [open, setOpen] = useState<{ piece: Placed; rect: DOMRect } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hiddenSlug, setHiddenSlug] = useState<string | null>(null);
  const moved = useRef(false);

  /* ---- drag with momentum ---- */
  const drag = useRef<{ px: number; py: number; t: number; vx: number; vy: number; id: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    stop();
    moved.current = false;
    drag.current = { px: e.clientX, py: e.clientY, t: performance.now(), vx: 0, vy: 0, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!moved.current && Math.hypot(dx, dy) < 4) return;
    if (!moved.current) {
      moved.current = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.vx = 0.8 * ((dx / dt) * 1000) + 0.2 * d.vx;
    d.vy = 0.8 * ((dy / dt) * 1000) + 0.2 * d.vy;
    d.px = e.clientX;
    d.py = e.clientY;
    d.t = now;
    // Resist when pulled past an edge.
    const rx = x.get() > bounds.x.max || x.get() < bounds.x.min ? 0.35 : 1;
    const ry = y.get() > bounds.y.max || y.get() < bounds.y.min ? 0.35 : 1;
    x.set(x.get() + dx * rx);
    y.set(y.get() + dy * ry);
  };
  // Glide on with the release speed, then ease into a resting spot inside the bounds.
  const settle = (vx: number, vy: number) => {
    const to = (v: number, velocity: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v + (reduce ? 0 : velocity * 0.32)));
    const opts = (velocity: number) =>
      reduce ? { duration: 0.3, ease: EASE } : ({ type: "spring", velocity, stiffness: 90, damping: 22, mass: 1, restDelta: 0.5 } as const);
    glide.current = [
      animate(x, to(x.get(), vx, bounds.x.min, bounds.x.max), opts(vx)),
      animate(y, to(y.get(), vy, bounds.y.min, bounds.y.max), opts(vy)),
    ];
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !moved.current) return;
    setDragging(false);
    const fresh = performance.now() - d.t < 80;
    settle(fresh ? d.vx : 0, fresh ? d.vy : 0);
  };

  /* ---- trackpad / wheel and keyboard pan ---- */
  const root = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (open) return;
      e.preventDefault();
      stop();
      const k = e.deltaMode === 1 ? 32 : 1;
      const dx = (e.shiftKey ? e.deltaY : e.deltaX) * k;
      const dy = (e.shiftKey ? 0 : e.deltaY) * k;
      x.set(rubber(x.get() - dx, bounds.x.min - 60, bounds.x.max + 60));
      y.set(rubber(y.get() - dy, bounds.y.min - 60, bounds.y.max + 60));
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => settle(0, 0), 120);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const nudge = useCallback(
    (dx: number, dy: number) => {
      stop();
      const clampX = Math.min(bounds.x.max, Math.max(bounds.x.min, x.get() + dx));
      const clampY = Math.min(bounds.y.max, Math.max(bounds.y.min, y.get() + dy));
      const opts = reduce ? { duration: 0 } : { duration: 0.6, ease: EASE };
      glide.current = [animate(x, clampX, opts), animate(y, clampY, opts)];
    },
    [bounds, reduce, x, y]
  );

  /* ---- detail ---- */
  const go = useCallback(
    (dir: 1 | -1) =>
      setOpen((o) => {
        if (!o) return o;
        const piece = placed[(o.piece.index + dir + placed.length) % placed.length];
        // Close back into wherever that picture sits on the canvas.
        const el = document.querySelector<HTMLElement>(`[data-piece="${piece.slug}"]`);
        const rect = el ? el.getBoundingClientRect() : o.rect;
        setHiddenSlug(piece.slug);
        return { piece, rect };
      }),
    [placed]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === "Escape") setOpen(null);
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
        return;
      }
      const step = 320;
      if (e.key === "ArrowRight") nudge(-step, 0);
      if (e.key === "ArrowLeft") nudge(step, 0);
      if (e.key === "ArrowDown") nudge(0, -step);
      if (e.key === "ArrowUp") nudge(0, step);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, nudge]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div
        ref={root}
        className="fixed inset-0 touch-none select-none overflow-hidden"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Imagination canvas — drag or scroll to explore"
        role="region"
      >
        <motion.div className="absolute left-0 top-0 will-change-transform" style={{ x, y, width: W, height: H }}>
          {placed.map((p) => (
            <Tile
              key={p.slug}
              piece={p}
              scale={scale}
              delay={reduce ? 0 : 0.05 + p.index * 0.06}
              hidden={hiddenSlug === p.slug}
              onOpen={(rect) => {
                if (moved.current) return;
                stop();
                setHiddenSlug(p.slug);
                setOpen({ piece: p, rect });
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Keeps the nav readable while pictures slide underneath */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[120px] bg-gradient-to-b from-white from-40% to-white/0 md:h-[clamp(120px,9vw,160px)]" />

      <AnimatePresence onExitComplete={() => setHiddenSlug(null)}>
        {open ? <Detail key="detail" piece={open.piece} from={open.rect} vp={vp} onClose={() => setOpen(null)} onStep={go} /> : null}
      </AnimatePresence>
    </>
  );
}

function Tile({
  piece,
  scale,
  delay,
  hidden,
  onOpen,
}: {
  piece: Placed;
  scale: number;
  delay: number;
  hidden: boolean;
  onOpen: (rect: DOMRect) => void;
}) {
  const frame = useRef<HTMLButtonElement>(null);
  return (
    <motion.figure
      className="absolute m-0"
      style={{ left: piece.x * scale, top: piece.y * scale, width: piece.w * scale }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        ref={frame}
        data-piece={piece.slug}
        type="button"
        aria-label={`Open ${piece.title}`}
        onClick={() => frame.current && onOpen(frame.current.getBoundingClientRect())}
        className="group relative block w-full cursor-[inherit] overflow-hidden bg-[#f2f2f2] outline-none focus-visible:ring-2 focus-visible:ring-ink"
        style={{ height: piece.h * scale, opacity: hidden ? 0 : 1 }}
      >
        <Image
          src={piece.image}
          alt={piece.alt || piece.title}
          fill
          draggable={false}
          priority={piece.index < 7}
          sizes={`${Math.round(piece.w * scale * 2)}px`}
          className="pointer-events-none object-cover transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-[1.04]"
        />
      </button>
      <figcaption className="mt-2 whitespace-nowrap font-headline text-[12px] leading-none">{piece.title}</figcaption>
    </motion.figure>
  );
}

/** Fit the picture's own proportions inside the screen (40px margin, square corners). */
function fit(piece: Piece, vp: { w: number; h: number }) {
  const inset = Math.min(40, Math.max(12, vp.w * 0.0231));
  const maxW = vp.w - 2 * inset;
  const maxH = vp.h - 2 * inset;
  const s = Math.min(maxW / piece.width, maxH / piece.height);
  const w = piece.width * s;
  const h = piece.height * s;
  return { left: (vp.w - w) / 2, top: (vp.h - h) / 2, width: w, height: h };
}

function Detail({
  piece,
  from,
  vp,
  onClose,
  onStep,
}: {
  piece: Placed;
  from: DOMRect;
  vp: { w: number; h: number };
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const reduce = useReducedMotion();
  const target = fit(piece, vp);
  const start = { top: from.top, left: from.left, width: from.width, height: from.height };

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-sand"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.25 } }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label={piece.title}
      onClick={onClose}
    >
      <motion.div
        className="fixed overflow-hidden"
        style={{ background: piece.background }}
        initial={reduce ? { opacity: 0, ...target } : start}
        animate={{ opacity: 1, ...target }}
        exit={reduce ? { opacity: 0 } : start}
        transition={{ duration: 0.7, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={piece.slug}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Image src={piece.image} alt={piece.alt || piece.title} fill sizes="100vw" className="object-cover" priority />
          </motion.div>
        </AnimatePresence>

        <button type="button" aria-label="Previous" onClick={() => onStep(-1)} className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize" />
        <button type="button" aria-label="Next" onClick={() => onStep(1)} className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize" />

        <motion.button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-[clamp(12px,1.85vw,32px)] top-[clamp(12px,1.85vw,32px)] z-10 rounded-full"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.45, type: "spring", stiffness: 300, damping: 18 } }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
          whileHover={{ rotate: 90, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/close.svg" alt="" width={44} height={44} className="block" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
