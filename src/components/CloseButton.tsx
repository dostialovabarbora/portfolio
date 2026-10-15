"use client";
import Link from "next/link";
import { motion } from "motion/react";

export function CloseButton({ href }: { href: string }) {
  return (
    <motion.div
      className="fixed right-[clamp(24px,4.57vw,79px)] top-[clamp(24px,4.63vw,80px)] z-30"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }}
    >
      <Link href={href} aria-label="Close project" className="block">
        <motion.img
          src="/brand/close.svg"
          alt=""
          width={44}
          height={44}
          whileHover={{ rotate: 90, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className="shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-full"
        />
      </Link>
    </motion.div>
  );
}
