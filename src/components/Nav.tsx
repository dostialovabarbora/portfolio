"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { HoverScribble } from "./HoverScribble";
import { Logo } from "./Logo";
import { Sun } from "./Sun";

type Item = { label: string; href: string };
const EASE = [0.65, 0, 0.35, 1] as const;

function NavLink({ item, active, className = "" }: { item: Item; active: boolean; className?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={item.href}
      className={`relative inline-block px-1 py-2 font-display uppercase leading-none tracking-[-0.02em] ${className || "text-[16px]"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-current={active ? "page" : undefined}
    >
      <HoverScribble active={hover || active} />
      <span className="relative">{item.label}</span>
    </Link>
  );
}

/** Hamburger from Figma "Mobile menu" (1380:44835): three 22px bars; a scribble loops round it while open. */
function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="relative grid size-8 place-items-center"
    >
      <span className="flex w-[22px] flex-col gap-1">
        <span className="h-0.5 w-full bg-ink" />
        <span className="h-0.5 w-full bg-ink" />
        <span className="h-0.5 w-full bg-ink" />
      </span>
      <svg
        aria-hidden
        viewBox="0 0 52 38"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36px] w-[50px] -translate-x-[54%] -translate-y-1/2 -scale-y-100 overflow-visible"
      >
        <motion.path
          d="M4.1129 8.37179C4.1129 8.36242 4.1129 8.35306 5.61579 7.72477C7.11122 7.0996 10.0947 5.86191 16.8353 5.15529M16.8353 5.15529C16.8689 5.15176 16.9026 5.14826 16.9364 5.14476C23.7483 4.43996 34.2753 4.31507 39.8471 4.29643C41.4219 4.29116 42.5754 4.29469 43.4285 4.30698M16.8353 5.15529C15.3541 5.9148 13.9037 6.81143 12.3858 7.9335C10.1267 9.60331 7.7163 11.5581 6.04369 13.5805C3.18018 17.0428 1.46112 19.4474 1.50067 21.481C1.55569 24.3102 1.69866 25.5122 2.43896 26.4932C3.26109 27.5827 4.9585 29.469 7.33856 31.4083C8.48875 32.3455 9.56377 33.0912 11.1065 33.9275C12.6491 34.7639 14.6004 35.6637 17.2953 36.1203C19.9902 36.5769 23.3277 36.5899 26.2718 36.3279C29.216 36.0658 31.6918 35.5444 33.3898 35.0634C35.0877 34.5825 35.9807 34.1551 37.1652 33.3879C38.3497 32.6207 39.8027 31.6019 40.8008 30.697C42.4062 29.2416 44.1857 27.3819 46.2191 24.0908C47.3031 22.3363 48.4248 20.309 49.0655 18.828C50.0234 16.6137 50.501 15.2825 50.5 14.1973C50.498 12.1607 50.4923 10.2533 49.9181 9.12449C48.7569 6.84174 47.6353 5.37468 46.0996 4.56998C45.8247 4.42594 45.5939 4.3382 43.4285 4.30698M16.8353 5.15529C17.5584 4.78452 18.2888 4.44643 19.0381 4.13075C21.3221 3.16838 23.7171 2.44969 26.4828 2.02751C29.2484 1.60533 32.3121 1.50145 34.3177 1.50001C36.3233 1.49858 37.1779 1.60275 38.3577 1.96212C40.3413 2.56632 42.1017 3.46021 43.4285 4.30698M43.4285 4.30698C43.8948 4.60456 44.3076 4.89632 44.6577 5.16764C45.2333 5.6496 45.5903 6.03506 45.8071 6.33468C46.024 6.63429 46.0899 6.83639 46.1896 7.34308"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: open ? 1 : 0, opacity: open ? 1 : 0 }}
          transition={{
            pathLength: { duration: open ? 0.6 : 0.3, ease: open ? [0.16, 1, 0.3, 1] : [0.7, 0, 0.84, 0] },
            opacity: { duration: 0.15, delay: open ? 0 : 0.2 },
          }}
        />
      </svg>
    </button>
  );
}

/**
 * Mobile menu sheet. Items sit in the staggered zig-zag from Figma (positions
 * as % of the 402px frame), with the hand-drawn loop on the current page and
 * the sun at the bottom.
 */
const MOBILE_SPOTS: React.CSSProperties[] = [
  // (±4px makes up for the link's own 4px side padding)
  { marginLeft: "calc(13.7% - 4px)" },
  { marginLeft: "calc(40.5% - 4px)" },
  { marginLeft: "calc(41.8% + 4px)", transform: "translateX(-100%)" },
  { marginLeft: "calc(75.4% + 4px)", transform: "translateX(-100%)" },
];

function MobileMenu({ items, isActive, onClose }: { items: Item[]; isActive: (href: string) => boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      id="mobile-menu"
      className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-paper px-7 pb-10 pt-[98px] md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.1 } }}
      transition={{ duration: 0.25 }}
    >
      <ul className="-mx-7 mt-[38px] flex flex-col gap-[38px]">
        {items.map((item, i) => (
          <li key={item.href} style={MOBILE_SPOTS[i % MOBILE_SPOTS.length]} className="w-max">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.5, delay: 0.08 + i * 0.07, ease: EASE }}
              onClick={onClose}
            >
              <NavLink item={item} active={isActive(item.href)} className="!font-headline text-[22px] font-medium" />
            </motion.div>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex justify-center pt-12">
        <Sun className="size-[280px]" />
      </div>
    </motion.div>
  );
}

export function Nav({ left, right }: { left: Item[]; right: Item[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    !href.includes("#") && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Close on route change / Escape, and stop the page scrolling behind the menu.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="relative z-40 px-7 py-7 md:px-[var(--gutter)] md:py-6">
      {/* Desktop */}
      <nav className="hidden h-14 items-center md:grid md:grid-cols-[1fr_auto_1fr]">
        <ul className="flex items-center gap-[clamp(16px,5.6vw,96px)]">
          {left.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
        <Logo />
        <ul className="flex items-center justify-end gap-[clamp(16px,7.2vw,124px)]">
          {right.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: centred logo + menu button */}
      <nav className="relative z-40 flex h-[42px] items-center justify-center md:hidden">
        <Logo className="h-[42px] w-[96px]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <MenuButton open={open} onClick={() => setOpen((o) => !o)} />
        </div>
      </nav>
      <AnimatePresence>
        {open ? <MobileMenu items={[...left, ...right]} isActive={isActive} onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </header>
  );
}
