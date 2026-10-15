import "server-only";
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";

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
