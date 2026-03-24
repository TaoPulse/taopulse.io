"use client";

import { useState } from "react";

interface Props {
  source?: string;
  className?: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function EmailSignupForm({
  source,
  className = "",
  heading,
  subheading,
  ctaText = "Join the Waitlist",
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), source }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className={`bg-[#0f1623] rounded-xl border border-purple-600/20 p-8 ${className}`}>
      {heading && (
        <h2 className="text-2xl font-bold text-white mb-2">{heading}</h2>
      )}
      {subheading && (
        <p className="text-gray-400 text-sm mb-6">{subheading}</p>
      )}

      {status === "success" ? (
        <div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
          <span className="text-emerald-400 text-lg mt-0.5">✓</span>
          <p className="text-emerald-300 font-medium">
            You&apos;re on the list! We&apos;ll be in touch.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={status === "loading"}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === "loading" ? "Joining…" : ctaText}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
