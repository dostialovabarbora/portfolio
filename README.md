# Barb · Portfolio

Next.js 15 + Keystatic CMS + Motion, built from the Figma file
[Portfolio-Works](https://www.figma.com/design/gzflNgqsndoBWWb0G3EnJ0/Portfolio-Works?node-id=751-314).

## Run it locally

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Editor: http://localhost:3000/admin (redirects to `/keystatic`)

Locally the editor writes straight into `content/` (YAML) and `public/images/`.
Commit and push to publish.

## What's where

| Path | What |
| --- | --- |
| `keystatic.config.ts` | CMS schema: projects, About page, site settings |
| `content/projects/<slug>/index.yaml` | One case study each (header + ordered blocks) |
| `content/about.yaml`, `content/site.yaml` | About page and navigation |
| `src/components/` | UI: `CaseHeader`, `Blocks`, `WorkCard`, `Nav`, `Logo`, `Sun`… |
| `src/app/globals.css` | Design tokens and `@font-face` for Suisse Intl / Monorama |
| `public/fonts/` | Converted `.woff2` fonts (sources are git-ignored) |

### Case-study blocks
Each project is a list of blocks you can reorder in the editor:
**Text** (1 or 2 red Monorama columns), **Full-width image**, **Two squares**, **Video**.

### Micro-interactions (from Figma, plus a few additions)
- Nav: hand-drawn ellipse draws in on hover / marks the active page (Figma `hover` component)
- Logo: each mouse-enter swaps to the next variant, 0.8s linear (Figma `logo` variants)
- About sun: strokes draw in on scroll; rays spin on hover
- About hero: portrait unblurs in, labels stagger and drift against the cursor
- Case-study header: title rises out of a mask, card scales back slightly on scroll
- Media: tiles rise in and settle from a slight zoom
- Work grid: project thumbnail wipes up behind the title on hover
- Closing statement: words light up as you scroll

## Deploy (Vercel)

1. Import `dostialovabarbora/portfolio` at vercel.com/new — defaults are fine.
2. Editing in production: add env var `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=dostialovabarbora/portfolio`,
   redeploy, open `https://<your-domain>/keystatic` and follow the wizard to create the GitHub app.
   It gives you `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`
   and `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` — add them to Vercel and redeploy.
   From then on every Save in the editor is a commit, and Vercel redeploys automatically.
3. Domain: Vercel → Project → Settings → Domains → add your domain, then at your registrar
   replace the Framer records with what Vercel shows (usually `A @ 76.76.21.21` and
   `CNAME www cname.vercel-dns.com`). Remove the domain from Framer once Vercel shows "Valid".

## Content check

```bash
npx tsx scripts/check-content.mts
```
Validates every entry against the schema.
