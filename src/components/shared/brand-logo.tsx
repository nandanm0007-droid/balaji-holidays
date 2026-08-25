import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Balaji Holidays Travels — official company logo.
 *
 * Renders the brand's official emblem (public/images/logo.jpeg) everywhere the
 * site shows a logo mark (navbar, footer, admin sidebar, auth screens).
 * Swap the file in `public/images/logo.*` to update branding site-wide —
 * no code changes required beyond this single component + metadata.
 */
export function BrandLogo({
  className = "h-11 w-11",
  title = "Balaji Holidays Travels",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Image
      src="/images/logo.jpeg"
      alt={title}
      width={1254}
      height={1254}
      title={title}
      priority
      className={cn("shrink-0 object-contain", className)}
    />
  );
}