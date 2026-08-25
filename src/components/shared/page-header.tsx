import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  align = "left",
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  align?: "left" | "center";
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-gradient">
      {/* decorative glows */}
      <div aria-hidden className="absolute inset-0 bg-radial-gold" />
      <div
        aria-hidden
        className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-navy-700/20 blur-3xl"
      />
      {/* bottom hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
      />

      <div
        className={cn(
          "container-px relative",
          compact ? "py-10 sm:py-12" : "py-14 sm:py-16 lg:py-20",
          align === "center" && "flex flex-col items-center text-center",
        )}
      >
        {eyebrow && <span className="eyebrow-dark animate-slide-up">{eyebrow}</span>}
        <h1
          className={cn(
            "mt-4 animate-slide-up text-3xl font-extrabold leading-[1.1] text-white sm:text-4xl lg:text-5xl",
            align === "center" && "max-w-3xl",
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-3 max-w-2xl animate-slide-up text-slate-300 [animation-delay:80ms]",
              align === "center" && "max-w-2xl",
            )}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}