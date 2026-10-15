import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import { CaseHeader } from "@/components/CaseHeader";
import { CloseButton } from "@/components/CloseButton";
import { NextProject } from "@/components/NextProject";
import { getProjects, reader } from "@/lib/content";

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

  const siblings = await getProjects(project.category);
  const index = siblings.findIndex((p) => p.slug === slug);
  const next = siblings[(index + 1) % siblings.length];
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
      {next && next.slug !== slug ? (
        <NextProject
          href={`/work/${next.slug}`}
          title={next.entry.title}
          background={next.entry.header.background}
          backgroundTo={next.entry.header.backgroundTo || undefined}
          textColor={next.entry.header.textColor}
        />
      ) : (
        <div className="h-[var(--gutter-case)]" />
      )}
    </div>
  );
}
