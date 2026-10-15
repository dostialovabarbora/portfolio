import { FeaturedShowcase } from "@/components/FeaturedShowcase";
import { ProjectIndex } from "@/components/ProjectIndex";
import { SiteNav } from "@/components/SiteNav";
import { getIndexItems } from "@/lib/content";

export default async function Home() {
  const items = await getIndexItems("digital-mark");
  const featured = items.filter((i) => i.featured);
  return (
    <>
      <SiteNav />
      <main>
        <h1 className="sr-only">Digital mark — selected work</h1>
        <FeaturedShowcase items={featured} />
        <ProjectIndex items={items} />
      </main>
    </>
  );
}
