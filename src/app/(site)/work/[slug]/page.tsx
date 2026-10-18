import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import { CaseHeader } from "@/components/CaseHeader";
import { CloseButton } from "@/components/CloseButton";
import { OtherProjects } from "@/components/ProjectIndex";
import { getIndexItems, getProjects, reader } from "@/lib/content";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);
  return { title: project?.title, description: project?.tagline };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);
  if (!project || !project.published) notFound();

  // The three projects that follow this one (wrapping round), never the one that's open.
  const all = await getIndexItems(project.category);
  const index = all.findIndex((p) => p.slug === slug);
  const others = [...all.slice(index + 1), ...all.slice(0, Math.max(0, index))].filter((p) => p.slug !== slug).slice(0, 3);
  const back = project.category === "digital-mark" ? "/" : `/${project.category}`;

  return (
    <div className="min-h-screen bg-sand">
      <CloseButton href={back} />
      <CaseHeader
        title={project.title}
        tagline={project.tagline}
        year={project.year}
        background={project.header.background}
        backgroundTo={project.header.backgroundTo || undefined}
        textColor={project.header.textColor}
        image={project.header.image}
      />
      <main>
        <Blocks blocks={project.blocks} />
      </main>
      <OtherProjects items={others} />
    </div>
  );
}
