import { prisma } from "@/lib/db";
import { EnquiryManager } from "@/components/admin/enquiry-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries — Admin" };

export default async function AdminEnquiriesPage() {
  const [enquiries, packageEnquiries] = await Promise.all([
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.packageEnquiry.findMany({ include: { package: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const rows = [
    ...enquiries.map((e) => ({
      id: e.id,
      kind: "general" as const,
      name: e.name,
      phone: e.phone,
      email: e.email,
      subject: e.subject || "General enquiry",
      message: e.message,
      status: e.status,
      adminNotes: e.adminNotes,
      createdAt: e.createdAt.toISOString(),
      travelDate: null,
      passengers: null,
      packageName: null,
    })),
    ...packageEnquiries.map((e) => ({
      id: e.id,
      kind: "package" as const,
      name: e.name,
      phone: e.phone,
      email: e.email,
      subject: "Package enquiry",
      message: e.message || "",
      status: e.status,
      adminNotes: e.adminNotes,
      createdAt: e.createdAt.toISOString(),
      travelDate: e.travelDate?.toISOString() ?? null,
      passengers: e.passengers,
      packageName: e.package?.name ?? null,
    })),
  ];

  return <EnquiryManager enquiries={rows} />;
}
