"use client";
import Link from "next/link";
import { useState } from "react";

/**
 * Figma logo component set (752:1749): every mouse-enter swaps to the next
 * variant (barb-1 → barb-2 → barb-3 → …) with a 0.8s linear smart-animate.
 */
const VARIANTS = ["/brand/logo-1.svg", "/brand/logo-2.webp", "/brand/logo-3.webp"];

export function Logo() {
  const [index, setIndex] = useState(0);
  return (
    <Link
      href="/"
      aria-label="Barbora Dostálová — home"
      onMouseEnter={() => setIndex((i) => (i + 1) % VARIANTS.length)}
      onFocus={() => setIndex((i) => (i + 1) % VARIANTS.length)}
      className="relative block h-[56px] w-[128px]"
    >
      {VARIANTS.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          width={128}
          height={56}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-[800ms] ease-linear"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </Link>
  );
}
