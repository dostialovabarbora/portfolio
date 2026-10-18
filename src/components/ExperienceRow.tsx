/** Company on the left, years in 50% black on the right (Figma about › Experience). Static. */
export function ExperienceRow({ company, years }: { company: string; years: string }) {
  return (
    <li className="flex items-center justify-between gap-4 text-[16px] leading-[1.2]">
      <span className="min-w-0">{company}</span>
      <span className="w-[120px] shrink-0 text-right tabular-nums text-black/50">{years}</span>
    </li>
  );
}
