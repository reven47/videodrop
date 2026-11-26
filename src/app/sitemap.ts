import type { MetadataRoute } from "next";

const routes = ["", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000").replace(
    /\/$/,
    "",
  );

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
