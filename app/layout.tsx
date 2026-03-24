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
  description: "Your guide to Bittensor and TAO. Track live subnet emissions, compare validators, learn to stake TAO.",
  keywords: ["Bittensor", "TAO", "TAO staking", "decentralized AI", "Bittensor subnets"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080d14] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
