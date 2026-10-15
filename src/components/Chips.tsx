/** Outlined service tags. `tone` lets a hovered row recolour them. */
export function Chips({ items, tone, className = "" }: { items: string[]; tone?: string; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((s) => (
        <li
          key={s}
          className="rounded-full border px-2 py-[3px] font-headline text-[11px] lowercase leading-none transition-colors duration-300"
          style={{ borderColor: tone ?? "currentColor", color: tone ?? "inherit" }}
        >
          {s}
        </li>
      ))}
    </ul>
  );
}
