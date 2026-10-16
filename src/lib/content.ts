import "server-only";
import { createReader } from "@keystatic/core/reader";
import { readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
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

export type CoverShape = "tall" | "square" | "wide";

export type IndexItem = {
  slug: string;
  title: string;
  client: string;
  year: string;
  services: string[];
  cover: string | null;
  coverShape: CoverShape;
};

/** Plain, serialisable project data for the client-side index components. */
export async function getIndexItems(category?: Category): Promise<IndexItem[]> {
  const projects = await getProjects(category);
  return projects.map(({ slug, entry }) => ({
    slug,
    title: entry.indexTitle || entry.title,
    client: entry.client,
    year: entry.year,
    services: entry.services.map((s) => serviceLabel.get(s) ?? s),
    cover: entry.thumbnail,
    coverShape: entry.coverShape,
  }));
}

export async function getHome() {
  return (await reader.singletons.home.read()) ?? { intro: "", introHighlights: [], manifesto: "" };
}

export type Piece = { slug: string; title: string; image: string; alt: string; background: string; width: number; height: number };

/** Imagination canvas pieces, in CMS order. */
export async function getPieces(): Promise<Piece[]> {
  const all = await reader.collections.imagination.all();
  return all
    .filter((p) => p.entry.published && p.entry.image)
    .sort((a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0))
    .map(({ slug, entry }) => {
      const image = entry.image as string;
      let width = 1600;
      let height = 1200;
      try {
        const dim = imageSize(readFileSync(path.join(process.cwd(), "public", image)));
        width = dim.width ?? width;
        height = dim.height ?? height;
      } catch {}
      return { slug, title: entry.title, image, alt: entry.alt, background: entry.background || "#000000", width, height };
    });
}
