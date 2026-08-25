import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [vehicles, packages] = await Promise.all([
    prisma.vehicle.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.package.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/vehicles",
    "/calculator",
    "/packages",
    "/about",
    "/gallery",
    "/enquiry",
    "/contact",
    "/book",
    "/login",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${base}/vehicles/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const packageRoutes: MetadataRoute.Sitemap = packages.map((p) => ({
    url: `${base}/packages/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...vehicleRoutes, ...packageRoutes];
}
