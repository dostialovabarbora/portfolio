import "server-only";
import { createReader } from "@keystatic/core/reader";
import config, { SERVICES } from "../../keystatic.config";

export const reader = createReader(process.cwd(), config);

export async function getSite() {
  return (
    (await reader.singletons.site.read()) ?? {
      title: "Barbora Dostálová",
      description: "",
      navLeft: [],
      navRight: [],
    }
  );
}

export async function getProjects(category?: string) {
  const all = await reader.collections.projects.all();
  return all
    .filter((p) => p.entry.published && (!category || p.entry.category === category))
    .sort((a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0));
}

export const CATEGORIES = {
  "digital-mark": "Digital mark",
  imagination: "Imagination",
} as const;
export type Category = keyof typeof CATEGORIES;


const serviceLabel = new Map(SERVICES.map((s) => [s.value, s.label]));

export type IndexItem = {
  slug: string;
  title: string;
  client: string;
  year: string;
  summary: string;
  services: string[];
  background: string;
  backgroundTo: string | null;
  textColor: string;
  thumbnail: string | null;
  featured: boolean;
  featuredImages: string[];
};

/** Plain, serialisable project data for the client-side index components. */
export async function getIndexItems(category?: Category): Promise<IndexItem[]> {
  const projects = await getProjects(category);
  return projects.map(({ slug, entry }) => ({
    slug,
    title: entry.title,
    client: entry.client,
    year: entry.year,
    summary: entry.summary,
    services: entry.services.map((s) => serviceLabel.get(s) ?? s),
    background: entry.header.background,
    backgroundTo: entry.header.backgroundTo || null,
    textColor: entry.header.textColor,
    thumbnail: entry.thumbnail,
    featured: entry.featured,
    featuredImages: entry.featuredImages.filter((x): x is string => Boolean(x)),
  }));
}
