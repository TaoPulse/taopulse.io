import GlossaryClient from "./GlossaryClient";

export const metadata = {
  title: "TAO & Bittensor Glossary — Plain English Definitions",
  description:
    "Plain English definitions for every Bittensor and TAO term you need to know: alpha tokens, dTAO, emissions, Yuma Consensus, validator take, Taoflow, and more.",
  keywords:
    "Bittensor glossary, TAO glossary, dTAO definition, alpha token, Yuma Consensus, Taoflow, validator take, TAO staking terms",
  openGraph: {
    title: "TAO & Bittensor Glossary — Plain English Definitions",
    description:
      "Plain English definitions for every Bittensor and TAO term: alpha tokens, dTAO, emissions, Yuma Consensus, Taoflow, and more.",
    url: "https://taopulse.io/glossary",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO & Bittensor Glossary — Plain English Definitions",
    description:
      "Plain English definitions for every Bittensor and TAO term: alpha tokens, dTAO, emissions, Yuma Consensus, and more.",
  },
  alternates: { canonical: "https://taopulse.io/glossary" },
};

export default function GlossaryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">

        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Reference
          </div>
          <h1 className="text-3xl font-bold text-white">TAO & Bittensor Glossary</h1>
          <p className="text-gray-400 leading-relaxed">
            Every Bittensor term you need to know — explained in plain English.
            No assumed knowledge beyond basic crypto familiarity. Use the search or letter tabs to jump to a term.
          </p>
        </div>

        {/* Interactive glossary */}
        <GlossaryClient />

      </div>
    </div>
  );
}
