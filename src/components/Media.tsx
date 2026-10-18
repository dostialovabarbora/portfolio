"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

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
        <Image
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

export function VideoTile({ src, poster, background }: { src: string; poster?: string | null; background: string }) {
  return (
    <div className="relative aspect-[1648/936] w-full overflow-hidden rounded-[var(--radius)]" style={{ background }}>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster ?? undefined}
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}
