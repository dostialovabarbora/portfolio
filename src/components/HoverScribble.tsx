"use client";
import { motion } from "motion/react";

/**
 * Hand-drawn ellipse from the Figma "hover" component (752:461).
 * Draws itself in like the Figma stroke animation (0 → 1 path length, ease-out).
 */
export function HoverScribble({ active, color = "currentColor" }: { active: boolean; color?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 110 37"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[34px] w-[calc(100%+48px)] min-w-[96px] -translate-x-1/2 -translate-y-1/2 -scale-x-100 overflow-visible"
    >
      <motion.path
        d="M102.794 8.17545C102.794 8.16635 102.794 8.15725 99.5125 7.54692C96.2307 6.93658 89.6671 5.72529 74.792 5.04063C59.917 4.35596 36.9295 4.23464 24.7625 4.21653C12.5956 4.19843 11.9458 4.28721 11.1091 4.48226C7.75558 5.26397 5.30635 6.68912 2.77066 8.90665C1.51683 10.0032 1.5043 11.8561 1.50001 13.8345C1.49772 14.8887 2.54075 16.1819 4.63254 18.3329C6.03161 19.7716 8.48092 21.741 10.848 23.4453C15.2884 26.6424 19.1742 28.449 22.6798 29.8628C24.8594 30.7418 28.0322 31.7315 30.6188 32.4768C33.2053 33.222 35.1554 33.6373 38.8632 34.1045C42.5709 34.5717 47.9773 35.0782 54.4064 35.3328C60.8355 35.5874 68.1234 35.5747 74.0082 35.1311C79.893 34.6875 84.1539 33.8135 87.5226 33.001C90.8914 32.1886 93.2389 31.4642 95.7505 30.5538C100.948 28.6699 104.654 26.8375 106.45 25.7791C108.066 24.8261 108.378 23.6585 108.499 20.9101C108.585 18.9346 104.831 16.5987 98.5781 13.2353C94.9256 11.2707 89.662 9.37178 84.7291 7.74968C79.7961 6.12757 75.1902 4.99045 70.2026 4.05558C65.2149 3.12071 59.9851 2.42255 53.9458 2.01244C47.9066 1.60232 41.2164 1.50141 36.8368 1.50001C32.4573 1.49862 30.591 1.59982 28.0148 1.94891C22.161 2.74212 17.1978 4.04926 14.2576 5.06285C13.0008 5.53104 12.2212 5.90548 11.7477 6.19654C11.2742 6.4876 11.1303 6.68392 10.9124 7.17613"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{
          pathLength: { duration: active ? 0.6 : 0.35, ease: active ? [0.16, 1, 0.3, 1] : [0.7, 0, 0.84, 0] },
          opacity: { duration: 0.2, delay: active ? 0 : 0.25 },
        }}
      />
    </svg>
  );
}
