"use client";

import { useState, useMemo } from "react";

// TAO_PRICE_USD_EST is an estimate used for illustration only — actual price varies
const TAO_PRICE_USD_EST = 300;
const APY_OPTIONS = [
  { label: "Conservative ~15% (est.)", value: 15 },
  { label: "Standard ~18% (est.)", value: 18 },
  { label: "Optimistic ~22% (est.)", value: 22 },
];

export default function StakingCalculator() {
  const [taoAmount, setTaoAmount] = useState<string>("100");
  const [apy, setApy] = useState<number>(18);

  const amount = parseFloat(taoAmount) || 0;

  const earnings = useMemo(() => {
    const daily = (amount * apy) / 100 / 365;
    const monthly = (amount * apy) / 100 / 12;
    const yearly = (amount * apy) / 100;
    return { daily, monthly, yearly };
  }, [amount, apy]);

  const formatTao = (val: number) =>
    val.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  const formatUsd = (val: number) =>
    (val * TAO_PRICE_USD_EST).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Staking Calculator</h3>
          <p className="text-xs text-gray-400">Estimate your TAO staking returns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            TAO Amount
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={taoAmount}
              onChange={(e) => setTaoAmount(e.target.value)}
              className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
              placeholder="100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
              TAO
            </span>
          </div>
          {amount > 0 && (
            <p className="mt-1.5 text-xs text-gray-500">
              ≈ {formatUsd(amount)} at ~${TAO_PRICE_USD_EST.toLocaleString()}/TAO (est.)
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Annual Yield (APY)
          </label>
          <select
            value={apy}
            onChange={(e) => setApy(Number(e.target.value))}
            className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-600 transition-colors appearance-none cursor-pointer"
          >
            {APY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Estimated range — actual APY varies by validator &amp; emissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Daily", tao: earnings.daily, usd: earnings.daily * TAO_PRICE_USD_EST },
          { label: "Monthly", tao: earnings.monthly, usd: earnings.monthly * TAO_PRICE_USD_EST },
          { label: "Yearly", tao: earnings.yearly, usd: earnings.yearly * TAO_PRICE_USD_EST },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#080d14] rounded-lg p-3 border border-white/5"
          >
            <p className="text-xs text-gray-500 mb-1.5">{item.label}</p>
            <p className="text-sm font-semibold text-white">
              {formatTao(item.tao)}
              <span className="text-xs font-normal text-gray-500 ml-1">TAO</span>
            </p>
            <p className="text-xs text-emerald-400 mt-0.5">
              {formatUsd(item.tao)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-600">
        * Illustrative estimates only. APY range (~15–22%) is based on historical network data post-halving and is not guaranteed. TAO price used (~$300) is a rough estimate — actual price varies. Actual returns depend on network emissions, validator commission, and TAO price. Not financial advice.
      </p>
    </div>
  );
}
