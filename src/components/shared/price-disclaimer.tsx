import { Info } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function PriceDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gold-200 bg-gold-50 p-3.5 text-sm text-gold-900",
        className,
      )}
    >
      <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gold-gradient" />
      <div className="flex items-start gap-2.5 pl-1">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Estimated Price Only:</strong> This amount is an approximate estimate based on the
          entered trip details and configured rates. Final pricing may vary based on route, tolls,
          parking, permits, driver charges, waiting time and other applicable charges. The final price
          will be confirmed by Balaji Holidays.
        </p>
      </div>
    </div>
  );
}