import type { Metadata } from "next";
import "@fontsource-variable/stack-sans-headline";
import "../globals.css";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.title, template: `%s — ${site.title}` },
    description: site.description,
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
