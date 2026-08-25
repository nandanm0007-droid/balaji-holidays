import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/layout/floating-buttons";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: s.seoTitle,
      template: `%s | ${s.businessName}`,
    },
    description: s.seoDescription,
    keywords: [
      "Balaji Holidays Shivamogga",
      "Bus rental Shivamogga",
      "Travel agency Shivamogga",
      "Tempo Traveller Shivamogga",
      "Innova rental Shivamogga",
      "Bus booking Shivamogga",
      "Train booking Shivamogga",
      "Flight booking Shivamogga",
      "Package trips Shivamogga",
      "Vehicle rental Shivamogga",
    ],
    openGraph: {
      title: s.seoTitle,
      description: s.seoDescription,
      type: "website",
      siteName: s.businessName,
      locale: "en_IN",
      images: [{ url: "/images/logo.jpeg" }],
    },
    icons: { icon: "/images/logo.jpeg", apple: "/images/logo.jpeg" },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const session = await getSession();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.businessName,
    description: settings.seoDescription,
    slogan: settings.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sahyadri College OPP.",
      addressLocality: settings.city,
      addressRegion: settings.state,
      addressCountry: "IN",
    },
    telephone: settings.phones.map((p) => `+91${p}`).join(", "),
    sameAs: [`https://instagram.com/${settings.instagram.replace(/^@/, "")}`],
    openingHours: "Mo-Su 00:00-24:00",
    areaServed: "Karnataka, India",
  };

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col bg-slate-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar settings={settings} session={session} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <FloatingButtons settings={settings} />
        <Analytics />
      </body>
    </html>
  );
}
