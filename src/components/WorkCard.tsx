"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

/**
 * Work index card — a miniature of the case-study header. On hover the
 * project thumbnail wipes up from the bottom behind the title.
 */
export function WorkCard({
  href,
  title,
  year,
  client,
  thumbnail,
  background,
  backgroundTo,
  textColor,
  index,
}: {
  href: string;
  title: string;
  year: string;
  client: string;
  thumbnail?: string | null;
  background: string;
  backgroundTo?: string;
  textColor: string;
  index: number;
}) {
  const [hover, setHover] = useState(false);
  const bg = backgroundTo ? `linear-gradient(180deg, ${background} 0%, ${backgroundTo} 100%)` : background;
  return (
    <motion.li
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative block aspect-[1648/936] overflow-hidden rounded-[var(--radius)]"
        style={{ background: bg, color: textColor }}
      >
        {thumbnail ? (
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ clipPath: hover ? "inset(0% 0% 0% 0% round 0px)" : "inset(100% 0% 0% 0% round 0px)" }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div className="absolute inset-0" animate={{ scale: hover ? 1 : 1.15 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
              <Image src={thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          </motion.div>
        ) : null}
        <div
          className="absolute inset-x-0 bottom-0 flex items-end justify-between p-[clamp(14px,1.6vw,28px)] transition-colors duration-500"
          style={{ color: hover && thumbnail ? "#fff" : textColor }}
        >
          <span className="font-display text-[clamp(36px,5.2vw,96px)] uppercase leading-[0.8] tracking-[-0.04em]">{title}</span>
          <span className="shrink-0 whitespace-nowrap text-right font-display text-[clamp(12px,0.95vw,16px)] uppercase leading-tight">
            {client}
            <br />
            {year} ©
          </span>
        </div>
      </Link>
    </motion.li>
  );
}
