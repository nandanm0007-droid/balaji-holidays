import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "gold" | "green" | "red" | "amber" | "slate" | "blue";

const tones: Record<Tone, string> = {
  navy: "bg-navy-100 text-navy-800",
  gold: "bg-gold-100 text-gold-800",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-700",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
