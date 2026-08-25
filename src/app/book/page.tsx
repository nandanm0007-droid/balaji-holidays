import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { BookingWizard } from "@/components/book/booking-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Vehicle — Bus, Tempo Traveller & Innova Rental",
  description:
    "Book a bus, Tempo Traveller or Innova from Balaji Holidays, Shivamogga. Get an estimated price and submit a booking request.",
};

function WizardLoader() {
  return (
    <div className="card flex h-72 items-center justify-center text-slate-400">
      Loading…
    </div>
  );
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const settings = await getSettings();
  const g = (k: string) => (typeof searchParams[k] === "string" ? searchParams[k] : undefined);

  const initial = {
    vehicle: g("vehicle"),
    pickup: g("pickup"),
    destination: g("destination"),
    travelDate: g("travelDate"),
    returnDate: g("returnDate"),
    tripType: g("tripType"),
    passengers: g("passengers"),
    distance: g("distance"),
  };

  return (
    <div className="bg-slate-100">
      <PageHeader
        eyebrow="Book Your Trip"
        title="Book a Vehicle"
        subtitle="Enter trip details, compare vehicles and submit a booking request. No online payment — Balaji Holidays will confirm your final price."
        compact
      />
      <div className="container-px py-10">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<WizardLoader />}>
            <BookingWizard settings={settings} initial={initial} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
