import { SiteNav } from "@/components/SiteNav";
import { WorkIndex } from "@/components/WorkIndex";

export const metadata = { title: "Imagination" };

export default function Imagination() {
  return (
    <>
      <SiteNav />
      <main className="pt-[clamp(24px,3vw,56px)]">
        <h1 className="sr-only">Imagination</h1>
        <WorkIndex category="imagination" />
      </main>
    </>
  );
}
