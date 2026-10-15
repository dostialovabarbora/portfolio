import { getProjects, type Category } from "@/lib/content";
import { WorkCard } from "./WorkCard";

export async function WorkIndex({ category }: { category: Category }) {
  const projects = await getProjects(category);
  if (!projects.length) {
    return (
      <p className="label py-[20vh] text-center text-muted">New work is on its way.</p>
    );
  }
  return (
    <ul className="grid gap-[var(--gap)] px-[var(--gutter)] pb-[var(--gutter)] md:grid-cols-2">
      {projects.map(({ slug, entry }, i) => (
        <WorkCard
          key={slug}
          index={i}
          href={`/work/${slug}`}
          title={entry.title}
          year={entry.year}
          client={entry.client}
          thumbnail={entry.thumbnail}
          background={entry.header.background}
          backgroundTo={entry.header.backgroundTo || undefined}
          textColor={entry.header.textColor}
        />
      ))}
    </ul>
  );
}
