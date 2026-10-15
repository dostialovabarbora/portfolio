import { SiteNav } from "@/components/SiteNav";
import { WorkIndex } from "@/components/WorkIndex";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="pt-[clamp(24px,3vw,56px)]">
        <h1 className="sr-only">Digital mark — selected work</h1>
        <WorkIndex category="digital-mark" />
      </main>
    </>
  );
}
