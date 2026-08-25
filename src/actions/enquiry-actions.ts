"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enquirySchema, packageEnquirySchema } from "@/lib/validation";
import { sendEnquiryEmailToAdmin, sendPackageEnquiryEmailToAdmin } from "@/lib/email";
import { revalidatePath } from "next/cache";

export type EnquiryResult = { ok: boolean; error?: string; id?: string };

export async function submitEnquiry(raw: Record<string, unknown>): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const session = await getSession();
  const data = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: {
      userId: session?.id ?? null,
      vehicleId: data.vehicleId || null,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      subject: data.subject || null,
      message: data.message,
      status: "NEW",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorName: data.name,
      action: "ENQUIRY_CREATED",
      entity: "Enquiry",
      entityId: enquiry.id,
    },
  });

  sendEnquiryEmailToAdmin({
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    subject: data.subject || null,
    message: data.message,
  }).catch((err) => console.error("Failed to send enquiry email to admin:", err));

  revalidatePath("/dashboard");
  return { ok: true, id: enquiry.id };
}

export async function submitPackageEnquiry(
  raw: Record<string, unknown>,
): Promise<EnquiryResult> {
  const parsed = packageEnquirySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const session = await getSession();
  const data = parsed.data;

  const enquiry = await prisma.packageEnquiry.create({
    data: {
      userId: session?.id ?? null,
      packageId: data.packageId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      travelDate: data.travelDate ? new Date(data.travelDate) : null,
      passengers: data.passengers ?? null,
      message: data.message || null,
      status: "NEW",
    },
  });

  const pkg = await prisma.package.findUnique({
    where: { id: data.packageId },
    select: { name: true },
  });

  await prisma.auditLog.create({
    data: {
      actorName: data.name,
      action: "PACKAGE_ENQUIRY_CREATED",
      entity: "PackageEnquiry",
      entityId: enquiry.id,
    },
  });

  sendPackageEnquiryEmailToAdmin({
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    packageName: pkg?.name || "Unknown Package",
    travelDate: data.travelDate ? new Date(data.travelDate) : null,
    passengers: data.passengers ?? null,
    message: data.message || null,
  }).catch((err) => console.error("Failed to send package enquiry email to admin:", err));

  return { ok: true, id: enquiry.id };
}
