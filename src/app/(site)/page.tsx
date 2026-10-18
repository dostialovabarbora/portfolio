import { ProjectIndex } from "@/components/ProjectIndex";
import { Intro } from "@/components/Intro";
import { SiteNav } from "@/components/SiteNav";
import { StatementCard } from "@/components/StatementCard";
import { getHome, getIndexItems } from "@/lib/content";

export default async function Home() {
  const [items, home] = await Promise.all([getIndexItems("digital-mark"), getHome()]);
  return (
    <>
      <SiteNav />
      <main>
        <h1 className="sr-only">Digital mark — selected work</h1>
        <Intro text={home.intro} highlights={home.introHighlights ?? []} />
        <ProjectIndex items={items} />
        <StatementCard text={home.statement} image={home.statementImage} />
      </main>
    </>
  );
}
