"use server";

import { prisma } from "@/lib/db";
import { setSession, clearSession, getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

const credentialsSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function loginWithEmail(email: string, password: string, name?: string): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  let user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hashPassword(parsed.data.password),
        name: name?.trim() || null,
      },
    });
  } else if (!user.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  await setSession({ id: user.id, phone: user.phone, email: user.email, name: user.name, role: user.role as "CUSTOMER" | "ADMIN" });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function loginAsAdmin(email: string, password: string): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Invalid administrator email or password." };
  }

  await setSession({ id: user.id, phone: user.phone, email: user.email, name: user.name, role: "ADMIN" });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await clearSession();
}

export async function updateProfile(name: string, email: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You must be logged in." };
  await prisma.user.update({
    where: { id: session.id },
    data: {
      name: name.trim() || undefined,
      email: email.trim() ? email.trim() : null,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}
