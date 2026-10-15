import { config, collection, singleton, fields } from "@keystatic/core";

/**
 * Content lives in /content as YAML and images in /public/images.
 * - Locally (`npm run dev`) the editor at /keystatic writes straight to disk.
 * - In production set KEYSTATIC_GITHUB_REPO=owner/repo (plus the GitHub app
 *   env vars Keystatic generates) and edits become commits to the repo,
 *   which Vercel redeploys automatically.
 */
const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO as
  | `${string}/${string}`
  | undefined;

const image = (label: string, directory: string) =>
  fields.image({
    label,
    directory: `public/images/${directory}`,
    publicPath: `/images/${directory}/`,
  });

const colour = (label: string, defaultValue: string) =>
  fields.text({
    label,
    defaultValue,
    description: "Hex colour, e.g. #e43c36",
    validation: { length: { min: 4, max: 9 } },
  });

export default config({
  storage: githubRepo ? { kind: "github", repo: githubRepo } : { kind: "local" },
  ui: {
    brand: { name: "Barb · Portfolio" },
    navigation: {
      Work: ["projects"],
      Pages: ["about", "site"],
    },
  },

  singletons: {
    site: singleton({
      label: "Site settings",
      path: "content/site",
      format: { data: "yaml" },
      schema: {
        title: fields.text({ label: "Site title", defaultValue: "Barbora Dostálová" }),
        description: fields.text({ label: "SEO description", multiline: true }),
        navLeft: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.text({ label: "Link", description: "/digital-mark, /about, #contact…" }),
          }),
          { label: "Navigation – left", itemLabel: (p) => p.fields.label.value }
        ),
        navRight: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.text({ label: "Link" }),
          }),
          { label: "Navigation – right", itemLabel: (p) => p.fields.label.value }
        ),
      },
    }),

    about: singleton({
      label: "About page",
      path: "content/about",
      format: { data: "yaml" },
      schema: {
        heroImage: image("Hero portrait (transparent PNG)", "about"),
        heroVideo: fields.file({
          label: "Hero video (optional, replaces the portrait)",
          directory: "public/media",
          publicPath: "/media/",
        }),
        heroLabels: fields.array(
          fields.object({
            text: fields.text({ label: "Text", multiline: true }),
            side: fields.select({
              label: "Side",
              options: [
                { label: "Left of portrait", value: "left" },
                { label: "Right of portrait", value: "right" },
              ],
              defaultValue: "right",
            }),
            offsetX: fields.integer({ label: "Distance from centre (px)", defaultValue: 140 }),
            top: fields.integer({ label: "Distance from top (px, at 1000px hero)", defaultValue: 200 }),
          }),
          { label: "Hero labels", itemLabel: (p) => p.fields.text.value }
        ),
        intro: fields.array(fields.text({ label: "Paragraph", multiline: true }), {
          label: "Intro columns (red mono text)",
          itemLabel: (p) => p.value.slice(0, 60),
        }),
        gallery: fields.array(
          fields.object({
            image: image("Image", "about"),
            alt: fields.text({ label: "Alt text" }),
            background: colour("Background", "#06090e"),
          }),
          { label: "Gallery (2 tiles)", itemLabel: (p) => p.fields.alt.value || "Tile" }
        ),
        services: fields.array(fields.text({ label: "Service" }), {
          label: "Services",
          itemLabel: (p) => p.value,
        }),
        experience: fields.array(
          fields.object({
            company: fields.text({ label: "Company" }),
            years: fields.text({ label: "Years", description: "e.g. 2021 — Now" }),
          }),
          { label: "Experience", itemLabel: (p) => `${p.fields.company.value} · ${p.fields.years.value}` }
        ),
        contactText: fields.text({ label: "Contact intro", multiline: true }),
        email: fields.text({ label: "Email" }),
        socials: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            url: fields.url({ label: "URL" }),
          }),
          { label: "Social links", itemLabel: (p) => p.fields.label.value }
        ),
        statement: fields.text({ label: "Closing statement", multiline: true }),
      },
    }),
  },

  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*/",
      format: { data: "yaml" },
      columns: ["title", "year"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        published: fields.checkbox({ label: "Published", defaultValue: true }),
        category: fields.select({
          label: "Category",
          options: [
            { label: "Digital mark", value: "digital-mark" },
            { label: "Imagination", value: "imagination" },
          ],
          defaultValue: "digital-mark",
        }),
        order: fields.integer({ label: "Order (lower = first)", defaultValue: 10 }),
        year: fields.text({ label: "Year", defaultValue: "2026" }),
        tagline: fields.text({ label: "Header tagline", multiline: true }),
        client: fields.text({ label: "Client" }),
        thumbnail: image("Thumbnail (work grid)", "projects"),
        header: fields.object(
          {
            background: colour("Background", "#e43c36"),
            backgroundTo: fields.text({
              label: "Gradient end colour (optional)",
              description: "Leave empty for a flat colour",
            }),
            textColor: colour("Text colour", "#ffffff"),
            image: image("Image next to title (optional)", "projects"),
          },
          { label: "Header" }
        ),
        blocks: fields.blocks(
          {
            text: {
              label: "Text",
              itemLabel: (p) => p.fields.columns.elements[0]?.value.slice(0, 50) ?? "Text",
              schema: fields.object({
                columns: fields.array(fields.text({ label: "Paragraph", multiline: true }), {
                  label: "Columns (1 = centred, 2 = side by side)",
                  itemLabel: (p) => p.value.slice(0, 50),
                  validation: { length: { min: 1, max: 2 } },
                }),
              }),
            },
            image: {
              label: "Full-width image",
              itemLabel: (p) => p.fields.alt.value || "Image",
              schema: fields.object({
                image: image("Image", "projects"),
                alt: fields.text({ label: "Alt text" }),
                background: colour("Background", "#f7f1e4"),
                fit: fields.select({
                  label: "Fit",
                  options: [
                    { label: "Fill (crop)", value: "cover" },
                    { label: "Contain", value: "contain" },
                  ],
                  defaultValue: "cover",
                }),
                rounded: fields.checkbox({ label: "Rounded corners", defaultValue: true }),
              }),
            },
            pair: {
              label: "Two squares",
              itemLabel: (p) => p.fields.left.fields.alt.value || "Pair",
              schema: fields.object({
                left: fields.object({
                  image: image("Left image", "projects"),
                  alt: fields.text({ label: "Alt text" }),
                  background: colour("Background", "#000000"),
                }),
                right: fields.object({
                  image: image("Right image", "projects"),
                  alt: fields.text({ label: "Alt text" }),
                  background: colour("Background", "#000000"),
                }),
              }),
            },
            video: {
              label: "Video",
              itemLabel: () => "Video",
              schema: fields.object({
                src: fields.file({
                  label: "Video file (mp4/webm)",
                  directory: "public/media",
                  publicPath: "/media/",
                }),
                poster: image("Poster image", "projects"),
                background: colour("Background", "#000000"),
              }),
            },
          },
          { label: "Content blocks" }
        ),
      },
    }),
  },
});
