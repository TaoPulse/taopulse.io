import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://taopulse.io"),
  title: {
    default: "TaoPulse — Bittensor TAO Analytics",
    template: "%s | TaoPulse",
  },
  description: "TaoPulse is the beginner-friendly guide to Bittensor and TAO. Live subnet emissions, validator calculator, staking guides, halving countdown, and TAO market data.",
  keywords: ["Bittensor", "TAO", "TAO staking", "decentralized AI", "Bittensor subnets", "TAO price", "TAO halving", "dTAO", "Bittensor validator", "buy TAO"],
  authors: [{ name: "TaoPulse" }],
  creator: "TaoPulse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://taopulse.io",
    siteName: "TaoPulse",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@taopulseio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080d14] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "TaoPulse",
              "url": "https://taopulse.io",
              "description": "Bittensor and TAO analytics, education, and tools",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://taopulse.io/glossary?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
