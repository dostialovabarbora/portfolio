"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HoverScribble } from "./HoverScribble";
import { Logo } from "./Logo";

type Item = { label: string; href: string };

function NavLink({ item, active }: { item: Item; active: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={item.href}
      className="relative inline-block px-1 py-2 font-display text-[16px] uppercase leading-none tracking-[-0.02em]"
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

export function Nav({ left, right }: { left: Item[]; right: Item[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    !href.includes("#") && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="relative z-20 px-[var(--gutter)] py-6">
      <nav className="flex h-14 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <ul className="hidden items-center gap-[clamp(16px,5.6vw,96px)] md:flex">
          {left.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
        <Logo />
        <ul className="flex items-center justify-end gap-6 md:gap-[clamp(16px,7.2vw,124px)]">
          {right.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
      </nav>
      {/* Mobile: left items move under the logo */}
      <ul className="mt-2 flex gap-8 md:hidden">
        {left.map((item) => (
          <li key={item.href}>
            <NavLink item={item} active={isActive(item.href)} />
          </li>
        ))}
      </ul>
    </header>
  );
}
