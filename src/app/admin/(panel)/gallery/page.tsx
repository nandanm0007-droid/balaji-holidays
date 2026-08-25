import { prisma } from "@/lib/db";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery — Admin" };

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return (
    <GalleryManager
      items={items.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        url: i.url,
        sortOrder: i.sortOrder,
      }))}
    />
  );
}
