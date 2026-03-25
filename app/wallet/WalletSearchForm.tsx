"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WalletSearchForm({ defaultAddress }: { defaultAddress?: string }) {
  const [address, setAddress] = useState(defaultAddress ?? "");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (trimmed) router.push(`/wallet/${trimmed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-8">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        autoComplete="off"
        spellCheck={false}
        className="flex-1 bg-[#0f1623] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors font-mono"
      />
      <button
        type="submit"
        disabled={!address.trim()}
        className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shrink-0"
      >
        Look Up
      </button>
    </form>
  );
}
