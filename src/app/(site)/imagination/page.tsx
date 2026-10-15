import { FeaturedShowcase } from "@/components/FeaturedShowcase";
import { ProjectIndex } from "@/components/ProjectIndex";
import { SiteNav } from "@/components/SiteNav";
import { getIndexItems } from "@/lib/content";

export const metadata = { title: "Imagination" };

export default async function Imagination() {
  const items = await getIndexItems("imagination");
  return (
    <>
      <SiteNav />
      <main>
        <h1 className="sr-only">Imagination</h1>
        {items.length ? (
          <>
            <FeaturedShowcase items={items.filter((i) => i.featured)} />
            <ProjectIndex items={items} />
          </>
        ) : (
          <p className="label py-[20vh] text-center text-muted">New work is on its way.</p>
        )}
      </main>
    </>
  );
}
