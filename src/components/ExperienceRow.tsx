/** Company ··· years, with a faint rule between (Figma about › Experience). Static — no hover or motion. */
export function ExperienceRow({ company, years }: { company: string; years: string }) {
  return (
    <li className="flex items-center text-[16px] leading-[1.2]">
      <span className="shrink-0 pr-7">{company}</span>
      <span aria-hidden className="h-px flex-1 bg-black/[0.08]" />
      <span className="w-[120px] shrink-0 text-right tabular-nums">{years}</span>
    </li>
  );
}
