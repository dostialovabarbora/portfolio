import { getSite } from "@/lib/content";
import { Nav } from "./Nav";

export async function SiteNav() {
  const site = await getSite();
  return <Nav left={[...site.navLeft]} right={[...site.navRight]} />;
}
