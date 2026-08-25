import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Make an Enquiry — Balaji Holidays",
  description:
    "Send an enquiry to Balaji Holidays, Shivamogga about vehicle rental, trip pricing, train booking, flight booking or package trips.",
};

export default function EnquiryPage() {
  return (
    <div className="bg-slate-100">
      <PageHeader
        eyebrow="Enquiry"
        title="How Can We Help?"
        subtitle="Have a question about vehicles, pricing or packages? Send us a message and we'll get back to you shortly."
        compact
      />
      <div className="container-px py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <EnquiryForm />
        </div>
      </div>
    </div>
  );
}