import { ProjectIndex } from "@/components/ProjectIndex";
import { SiteNav } from "@/components/SiteNav";
import { getIndexItems } from "@/lib/content";

export const metadata = { title: "Imagination" };

export default async function Imagination() {
  const items = await getIndexItems("imagination");
  return (
    <>
      <SiteNav />
      <main className="pt-[clamp(40px,6vw,104px)]">
        <h1 className="sr-only">Imagination</h1>
        <ProjectIndex items={items} />
      </main>
    </>
  );
}
