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

export const SERVICES = [
  { label: "Branding", value: "branding" },
  { label: "Mobile App", value: "mobile-app" },
  { label: "Website", value: "website" },
  { label: "Visual Direction", value: "visual-direction" },
  { label: "Product Design", value: "product-design" },
  { label: "Motion", value: "motion" },
  { label: "Illustration", value: "illustration" },
];

export default config({
  // Local `npm run dev` always edits the files on disk (whatever branch you're on);
  // the deployed site edits through GitHub.
  storage: githubRepo && process.env.NODE_ENV === "production" ? { kind: "github", repo: githubRepo } : { kind: "local" },
  ui: {
    brand: { name: "Barb · Portfolio" },
    navigation: {
      Work: ["projects", "imagination"],
      Pages: ["home", "about", "site"],
    },
  },

  singletons: {
    home: singleton({
      label: "Homepage",
      path: "content/home",
      format: { data: "yaml" },
      schema: {
        intro: fields.text({
          label: "Intro statement",
          description: "Each line break is a line on the site — the lines stay the same on every screen size",
          multiline: true,
        }),
        introHighlights: fields.array(
          fields.object({
            text: fields.text({ label: "Words", description: "Exactly as written in the intro, e.g. Arnold Schwarzenegger" }),
            image: image("Image shown on hover (landscape)", "home"),
          }),
          { label: "Intro hover images", itemLabel: (p) => p.fields.text.value || "Highlight" }
        ),
        manifesto: fields.text({
          label: "Red manifesto",
          description: "The hand-drawn circle, arrows and underline are placed for the current wording",
          multiline: true,
        }),
      },
    }),
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
        heroImage: image("Hero portrait / video poster (portrait, white background, about 1080 × 1920)", "about"),
        heroVideo: fields.file({
          label: "Hero video (optional, replaces the portrait)",
          description: "MP4 (H.264), portrait 1080 × 1920 or 720 × 1280, no sound, ideally under 8 MB",
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
            mobileX: fields.number({ label: "Phone: bubble across (%)", description: "0 = left edge of the video, 100 = right edge", defaultValue: 50 }),
            mobileY: fields.number({ label: "Phone: bubble down (%)", description: "0 = top of the video, 100 = bottom", defaultValue: 50 }),
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
            focus: fields.select({
              label: "Keep visible when cropped",
              options: [
                { label: "Top", value: "top" },
                { label: "Centre", value: "center" },
                { label: "Bottom", value: "bottom" },
              ],
              defaultValue: "center",
            }),
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
      },
    }),
  },

  collections: {
    imagination: collection({
      label: "Imagination canvas",
      slugField: "title",
      path: "content/imagination/*",
      format: { data: "yaml" },
      columns: ["title", "order"],
      schema: {
        title: fields.slug({ name: { label: "Label", description: "Shown under the picture, e.g. tyvole.png" } }),
        published: fields.checkbox({ label: "Published", defaultValue: true }),
        order: fields.integer({
          label: "Order (lower = first)",
          description: "Pieces fill the canvas spots from the Figma layout in this order",
          defaultValue: 100,
        }),
        image: image("Image", "imagination"),
        alt: fields.text({ label: "Alt text" }),
        background: colour("Detail background", "#000000"),
      },
    }),
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
        client: fields.text({ label: "Client", description: "Shown in the lines view, e.g. National Hockey League" }),
        indexTitle: fields.text({
          label: "Short name on the homepage",
          description: "Optional, e.g. NHL instead of NHL Gamezone",
        }),
        services: fields.multiselect({
          label: "Labels",
          description: "Shown next to the project on the homepage",
          options: SERVICES,
          defaultValue: ["mobile-app"],
        }),
        coverShape: fields.select({
          label: "Cover shape",
          options: [
            { label: "Tall (507 × 660)", value: "tall" },
            { label: "Square (507 × 507)", value: "square" },
            { label: "Wide (507 × 380)", value: "wide" },
          ],
          defaultValue: "square",
        }),
        thumbnail: image("Cover (homepage covers & lines hover)", "projects"),
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
