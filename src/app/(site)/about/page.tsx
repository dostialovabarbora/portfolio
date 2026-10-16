import type { Metadata } from "next";
import { AboutHero } from "@/components/AboutHero";
import { ExperienceRow } from "@/components/ExperienceRow";
import { MediaTile } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { SiteNav } from "@/components/SiteNav";
import { Statement } from "@/components/Statement";
import { Sun } from "@/components/Sun";
import { reader } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

const heading = "mb-6 text-[18px] leading-none text-muted";

export default async function AboutPage() {
  const about = await reader.singletons.about.read();
  if (!about) return null;

  return (
    <>
      <SiteNav />
      <main>
        <AboutHero image={about.heroImage} video={about.heroVideo} labels={about.heroLabels} />

        {/* Intro — two red Monorama columns */}
        <section className="px-[var(--gutter)] py-[clamp(72px,13.1vw,227px)]">
          <div className="mx-auto grid max-w-[1568px] gap-y-10 md:grid-cols-2">
            {about.intro.map((text, i) => (
              <Reveal key={i} delay={i * 0.12} className="flex justify-center md:px-8">
                <p className="mono-copy max-w-[644px]">{text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section className="grid gap-[clamp(10px,1.16vw,20px)] px-[var(--gutter)] md:grid-cols-2">
          {about.gallery.map((tile, i) =>
            tile.image ? (
              <MediaTile key={i} src={tile.image} alt={tile.alt} background={tile.background} aspect="1 / 1" sizes="(max-width: 768px) 100vw, 46vw" />
            ) : null
          )}
        </section>

        {/* Services · Experience · Contact */}
        <section id="contact" className="scroll-mt-8 px-[var(--gutter)] pb-[clamp(56px,4.63vw,80px)] pt-[clamp(56px,4.63vw,80px)]">
          <div className="grid gap-x-8 gap-y-14 font-headline md:grid-cols-2 lg:grid-cols-[396fr_528fr_442fr_202fr] lg:gap-x-0">
            <Reveal className="lg:pr-4">
              <h2 className={heading}>Services</h2>
              <ul className="flex flex-col gap-6 text-[16px] leading-[1.2]">
                {about.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className={heading}>Experience</h2>
              <ul className="flex flex-col gap-6 lg:pr-[28%]">
                {about.experience.map((e) => (
                  <ExperienceRow key={e.company} company={e.company} years={e.years} />
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.16} className="lg:pr-4">
              <h2 className={heading}>Contact</h2>
              {/* Holds three rows so the links line up with rows 4–5 of Services / Experience */}
              <p className="text-[16px] leading-[1.2] lg:min-h-[calc(3*1.2em+48px)]">{about.contactText}</p>
              <ul className="mt-8 grid lg:mt-6 grid-cols-2 gap-x-5 gap-y-6 text-[16px] leading-[1.2]">
                {about.socials.slice(0, 1).map((s) => (
                  <SocialLink key={s.label} {...s} />
                ))}
                {about.email ? (
                  <li>
                    <a href={`mailto:${about.email}`} className="underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:decoration-current">
                      {about.email}
                    </a>
                  </li>
                ) : null}
                {about.socials.slice(1).map((s) => (
                  <SocialLink key={s.label} {...s} />
                ))}
              </ul>
            </Reveal>
            <div className="flex lg:justify-end">
              <Sun className="size-[202px] cursor-pointer" />
            </div>
          </div>
        </section>

        <div className="mx-[var(--gutter)] mb-[clamp(80px,9.26vw,160px)] h-px bg-black/15" />

        <Statement text={about.statement} />
      </main>
    </>
  );
}

function SocialLink({ label, url }: { label: string; url: string | null }) {
  return (
    <li>
      <a href={url ?? "#"} target="_blank" rel="noreferrer" className="group">
        {label}{" "}
        <span className="inline-block font-light text-black/50 transition-[transform,color] duration-300 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black">
          ↗
        </span>
      </a>
    </li>
  );
}
