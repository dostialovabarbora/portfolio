import { Manifesto } from "@/components/Manifesto";
import { ProjectIndex } from "@/components/ProjectIndex";
import { Reveal } from "@/components/Reveal";
import { SiteNav } from "@/components/SiteNav";
import { getHome, getIndexItems } from "@/lib/content";

export default async function Home() {
  const [items, home] = await Promise.all([getIndexItems("digital-mark"), getHome()]);
  return (
    <>
      <SiteNav />
      <main>
        <h1 className="sr-only">Digital mark — selected work</h1>
        {home.intro ? (
          <section className="flex min-h-[clamp(360px,51.5vw,890px)] items-center justify-center px-[var(--gutter)] pb-[clamp(40px,4.63vw,80px)] pt-[clamp(24px,4.63vw,80px)]">
            <Reveal y={24}>
              <p className="mx-auto max-w-[1320px] text-center font-headline text-[clamp(26px,2.78vw,48px)] font-normal uppercase leading-[0.9]">
                {home.intro}
              </p>
            </Reveal>
          </section>
        ) : null}
        <ProjectIndex items={items} />
        <Manifesto text={home.manifesto} />
      </main>
    </>
  );
}
