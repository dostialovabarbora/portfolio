"use client";
import Image from "next/image";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Piece } from "@/lib/content";

/**
 * Spots from the Figma "Imagination" frame (535:14, 1920 × 1405). Pieces fill
 * them in CMS order; every 7 pieces start a new block, and the whole set of
 * blocks repeats forever in every direction.
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

type Placed = Piece & { x: number; y: number; w: number; h: number; index: number };

function layout(pieces: Piece[]) {
  const blocks = Math.max(1, Math.ceil(pieces.length / SPOTS.length));
  const cols = Math.ceil(Math.sqrt(blocks));
  const rows = Math.ceil(blocks / cols);
  const placed: Placed[] = pieces.map((p, i) => {
    const b = Math.floor(i / SPOTS.length);
    const s = SPOTS[i % SPOTS.length];
    return { ...p, index: i, x: s.x + (b % cols) * TILE.w, y: s.y + Math.floor(b / cols) * TILE.h, w: s.w, h: s.h };
  });
  return { placed, width: cols * TILE.w, height: rows * TILE.h };
}

const wrap = (v: number, size: number) => ((v % size) + size) % size;

function useScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => setScale(Math.min(1, Math.max(0.5, window.innerWidth / 1728)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
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

export function ImaginationCanvas({ pieces }: { pieces: Piece[] }) {
  const reduce = useReducedMotion();
  const scale = useScale();
  const vp = useViewport();
  const { placed, width, height } = useMemo(() => layout(pieces), [pieces]);
  const W = width * scale;
  const H = height * scale;

  // Pan position (unbounded) → wrapped offset of the repeating grid.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const gx = useTransform(x, (v) => wrap(v, W) - W);
  const gy = useTransform(y, (v) => wrap(v, H) - H);

  const copiesX = Math.ceil(vp.w / W) + 1;
  const copiesY = Math.ceil(vp.h / H) + 1;

  const [open, setOpen] = useState<{ piece: Placed; rect: DOMRect } | null>(null);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);
  const glide = useRef<AnimationPlaybackControls[]>([]);
  const stop = () => {
    glide.current.forEach((a) => a.stop());
    glide.current = [];
  };

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
    x.set(x.get() + dx);
    y.set(y.get() + dy);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !moved.current) return;
    setDragging(false);
    if (reduce || performance.now() - d.t > 80) return;
    glide.current = [
      animate(x, x.get(), { type: "inertia", velocity: d.vx, power: 0.35, timeConstant: 420, restDelta: 0.5 }),
      animate(y, y.get(), { type: "inertia", velocity: d.vy, power: 0.35, timeConstant: 420, restDelta: 0.5 }),
    ];
    void e;
  };

  /* ---- trackpad / wheel and keyboard pan ---- */
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (open) return;
      e.preventDefault();
      stop();
      const k = e.deltaMode === 1 ? 32 : 1;
      x.set(x.get() - (e.shiftKey ? e.deltaY : e.deltaX) * k);
      y.set(y.get() - (e.shiftKey ? 0 : e.deltaY) * k);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open, x, y]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      stop();
      const opts = reduce ? { duration: 0 } : { duration: 0.6, ease: [0.65, 0, 0.35, 1] as const };
      glide.current = [animate(x, x.get() + dx, opts), animate(y, y.get() + dy, opts)];
    },
    [reduce, x, y]
  );

  /* ---- detail ---- */
  const go = useCallback(
    (dir: 1 | -1) =>
      setOpen((o) => {
        if (!o) return o;
        const next = placed[(o.piece.index + dir + placed.length) % placed.length];
        return { piece: next, rect: o.rect };
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

  // Phones: the nav takes two rows, so start the canvas a little lower.
  useEffect(() => {
    if (window.innerWidth < 768) y.set(70);
  }, [y]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const copies: { cx: number; cy: number }[] = [];
  for (let cy = 0; cy <= copiesY; cy++) for (let cx = 0; cx <= copiesX; cx++) copies.push({ cx, cy });

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
        <motion.div className="absolute left-0 top-0 will-change-transform" style={{ x: gx, y: gy }}>
          {copies.map(({ cx, cy }) =>
            placed.map((p) => (
              <Tile
                key={`${cx}-${cy}-${p.slug}`}
                piece={p}
                left={(cx * width + p.x) * scale}
                top={(cy * height + p.y) * scale}
                scale={scale}
                eager={cx <= 1 && cy <= 1}
                delay={reduce ? 0 : 0.05 + p.index * 0.06}
                onOpen={(rect) => {
                  if (moved.current) return;
                  stop();
                  setOpen({ piece: p, rect });
                }}
              />
            ))
          )}
        </motion.div>
      </div>

      {/* Keeps the nav readable while pictures slide underneath */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[170px] md:h-[clamp(120px,9vw,160px)] bg-gradient-to-b from-white from-40% to-white/0" />

      <AnimatePresence>
        {open ? <Detail key="detail" piece={open.piece} from={open.rect} onClose={() => setOpen(null)} onStep={go} /> : null}
      </AnimatePresence>
    </>
  );
}

function Tile({
  piece,
  left,
  top,
  scale,
  eager,
  delay,
  onOpen,
}: {
  piece: Placed;
  left: number;
  top: number;
  scale: number;
  eager: boolean;
  delay: number;
  onOpen: (rect: DOMRect) => void;
}) {
  const frame = useRef<HTMLButtonElement>(null);
  return (
    <motion.figure
      className="absolute m-0"
      style={{ left, top, width: piece.w * scale }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        ref={frame}
        type="button"
        aria-label={`Open ${piece.title}`}
        onClick={() => frame.current && onOpen(frame.current.getBoundingClientRect())}
        className="group relative block w-full cursor-[inherit] overflow-hidden bg-[#f2f2f2] outline-none focus-visible:ring-2 focus-visible:ring-ink"
        style={{ height: piece.h * scale }}
      >
        <Image
          src={piece.image}
          alt={piece.alt || piece.title}
          fill
          draggable={false}
          loading={eager ? "eager" : "lazy"}
          sizes={`${Math.round(piece.w * scale * 2)}px`}
          className="pointer-events-none object-cover transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-[1.04]"
        />
      </button>
      <figcaption className="mt-2 whitespace-nowrap font-headline text-[12px] leading-none">{piece.title}</figcaption>
    </motion.figure>
  );
}

function Detail({
  piece,
  from,
  onClose,
  onStep,
}: {
  piece: Placed;
  from: DOMRect;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const reduce = useReducedMotion();
  const ease = [0.65, 0, 0.35, 1] as const;
  const vw = typeof window === "undefined" ? 1920 : window.innerWidth;
  const vh = typeof window === "undefined" ? 1080 : window.innerHeight;
  const inset = Math.min(40, Math.max(12, vw * 0.0231));
  const radius = Math.min(48, Math.max(24, vw * 0.0278));
  return (
    <motion.div
      className="fixed inset-0 z-40 bg-sand"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.15 } }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label={piece.title}
      onClick={onClose}
    >
      <motion.div
        className="fixed overflow-hidden"
        style={{ background: piece.background }}
        initial={
          reduce
            ? { opacity: 0 }
            : { top: from.top, left: from.left, width: from.width, height: from.height, borderRadius: 0 }
        }
        animate={{
          opacity: 1,
          top: inset,
          left: inset,
          width: vw - 2 * inset,
          height: vh - 2 * inset,
          borderRadius: radius,
        }}
        exit={
          reduce
            ? { opacity: 0 }
            : { top: from.top, left: from.left, width: from.width, height: from.height, borderRadius: 0, opacity: 0 }
        }
        transition={{ duration: 0.7, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={piece.slug}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Image src={piece.image} alt={piece.alt || piece.title} fill sizes="100vw" className="object-contain" priority />
          </motion.div>
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-[clamp(16px,1.85vw,32px)] top-[clamp(16px,1.85vw,32px)] z-10 rounded-full"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.45, type: "spring", stiffness: 300, damping: 18 } }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
          whileHover={{ rotate: 90, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/close.svg" alt="" width={44} height={44} className="block" />
        </motion.button>

        <button type="button" aria-label="Previous" onClick={() => onStep(-1)} className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize" />
        <button type="button" aria-label="Next" onClick={() => onStep(1)} className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize" />
      </motion.div>
    </motion.div>
  );
}
