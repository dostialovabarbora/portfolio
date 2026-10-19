"use client";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Image tile that settles from a slight zoom as it scrolls into view. */
export function MediaTile({
  src,
  alt,
  background,
  fit = "cover",
  rounded = true,
  aspect,
  sizes,
  position = "center",
}: {
  src: string;
  alt: string;
  background: string;
  fit?: "cover" | "contain";
  rounded?: boolean;
  aspect: string;
  sizes: string;
  /** Which part of the picture stays visible when it's cropped. */
  position?: "top" | "center" | "bottom";
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative w-full overflow-hidden"
      style={{ background, aspectRatio: aspect, borderRadius: rounded ? "var(--radius)" : 0 }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image quality={90}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain" : "object-cover"}
          style={{ objectPosition: `50% ${position === "top" ? "0%" : position === "bottom" ? "100%" : "50%"}` }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Muted looping video with the same reveal as MediaTile. It only plays while
 * on screen (saves battery and data), and shows the poster until it can play.
 */
export function VideoTile({
  src,
  poster,
  background,
  aspect = "1648 / 936",
  fit = "cover",
  rounded = true,
  label,
}: {
  src: string;
  poster?: string | null;
  background: string;
  aspect?: string;
  fit?: "cover" | "contain";
  rounded?: boolean;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const visible = useInView(ref, { margin: "200px 0px 200px 0px" });
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visible && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [visible, reduce]);

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      style={{ background, aspectRatio: aspect, borderRadius: rounded ? "var(--radius)" : 0 }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <video
        ref={ref}
        className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        src={src}
        poster={poster ?? undefined}
        aria-label={label || undefined}
        muted
        loop
        playsInline
        preload="metadata"
      />
    </motion.div>
  );
}
