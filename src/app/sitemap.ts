import type { MetadataRoute } from "next";
import { seedRoutes } from "@/lib/mockData";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: "/", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: "/routes", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "/plan", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "/about", lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: "/privacy", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
  const routes: MetadataRoute.Sitemap = seedRoutes.map((r) => ({
    url: `/routes/${r.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...base, ...routes];
}
