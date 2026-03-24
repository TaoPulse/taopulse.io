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
  title: "TaoPulse | TAO & Bittensor Analytics",
  description:
    "TaoPulse is the leading analytics platform for TAO and the Bittensor ecosystem. Track subnets, validators, staking yields, and real-time prices across the decentralized AI network.",
  keywords: ["TAO", "Bittensor", "analytics", "subnets", "staking", "crypto", "AI"],
  openGraph: {
    title: "TaoPulse | TAO & Bittensor Analytics",
    description:
      "Track TAO prices, subnet performance, staking yields, and validator data across the Bittensor network.",
    type: "website",
    url: "https://taopulse.io",
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
