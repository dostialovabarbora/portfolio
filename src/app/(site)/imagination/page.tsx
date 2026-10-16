import { ImaginationCanvas } from "@/components/ImaginationCanvas";
import { SiteNav } from "@/components/SiteNav";
import { getPieces } from "@/lib/content";

export const metadata = { title: "Imagination" };

export default async function Imagination() {
  const pieces = await getPieces();
  return (
    <>
      <SiteNav />
      <main>
        <h1 className="sr-only">Imagination</h1>
        <ImaginationCanvas pieces={pieces} />
      </main>
    </>
  );
}
