"use client";

import Script from "next/script";

interface Props {
  source?: string;
  className?: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
}

export default function EmailSignupForm({
  className = "",
  heading,
  subheading,
}: Props) {
  return (
    <div className={`bg-[#0f1623] rounded-xl border border-purple-600/20 p-8 ${className}`}>
      {heading && (
        <h2 className="text-2xl font-bold text-white mb-2">{heading}</h2>
      )}
      {subheading && (
        <p className="text-gray-400 text-sm mb-6">{subheading}</p>
      )}

      <Script
        src="https://subscribe-forms.beehiiv.com/embed.js"
        strategy="lazyOnload"
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <iframe
          src="https://subscribe-forms.beehiiv.com/a290cdad-6846-4bac-99df-55e0cc240ece"
          className="beehiiv-embed"
          data-test-id="beehiiv-embed"
          frameBorder={0}
          scrolling="no"
          style={{
            width: "100%",
            maxWidth: "560px",
            height: "160px",
            margin: "0 auto",
            borderRadius: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
