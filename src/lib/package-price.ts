import type { Package } from "@prisma/client";
import { formatINR } from "@/lib/utils";

export function packagePriceLabel(pkg: Package): string {
  switch (pkg.pricingType) {
    case "PER_PERSON":
      return pkg.perPersonPrice
        ? `${formatINR(pkg.perPersonPrice)} per person`
        : "Per-person pricing";
    case "FIXED":
      return pkg.price ? formatINR(pkg.price) : "Fixed price";
    case "VEHICLE_BASED":
      return "Vehicle-based pricing";
    default:
      return "Contact for price";
  }
}
