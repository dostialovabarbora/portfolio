// Validates every CMS entry against the schema: `npx tsx scripts/check-content.mts`
import { createReader } from "@keystatic/core/reader";
import configModule from "../keystatic.config";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config = ((configModule as any).default ?? configModule) as typeof configModule;

const reader = createReader(process.cwd(), config);
let failed = false;
for (const slug of await reader.collections.projects.list()) {
  try {
    await reader.collections.projects.readOrThrow(slug);
    console.log("✓", slug);
  } catch (e) {
    failed = true;
    console.log("✗", slug, "\n", (e as Error).message.slice(0, 1200));
  }
}
for (const s of ["site", "about"] as const) {
  try { await reader.singletons[s].readOrThrow(); console.log("✓", s); } catch (e) { failed = true; console.log("✗", s, (e as Error).message.slice(0, 600)); }
}
process.exit(failed ? 1 : 0);
