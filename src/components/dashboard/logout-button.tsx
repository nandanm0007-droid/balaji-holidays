"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth-actions";
import { LogOut } from "@/components/ui/icons";

export function LogoutButton() {
  const router = useRouter();
  return (
    <form
      action={async () => {
        await logoutAction();
        router.push("/");
        router.refresh();
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </form>
  );
}
