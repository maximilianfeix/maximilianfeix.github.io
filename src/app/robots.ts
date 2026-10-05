import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // project sites (e.g. /proxy-scraper/) are separate repos under this domain – crawlers only read robots.txt
    // here, so their sitemaps are announced here too
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/proxy-scraper/sitemap.xml`],
    host: site.url,
  };
}
