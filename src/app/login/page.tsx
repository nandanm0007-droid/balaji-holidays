import { Suspense } from "react";
import { EmailLogin } from "@/components/auth/email-login";

export const metadata = {
  title: "Login — Balaji Holidays",
  description: "Login to your Balaji Holidays account to manage bookings and enquiries.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="bg-slate-100">
      <div className="container-px flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={null}>
            <EmailLogin next={searchParams.next} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
