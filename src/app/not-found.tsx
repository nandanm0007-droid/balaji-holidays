import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-px flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-gradient font-display text-4xl font-extrabold text-gold-300 shadow-soft-lg">
        404
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on the road.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
        <Link href="/contact" className="btn-outline">
          Contact Us
        </Link>
      </div>
    </div>
  );
}