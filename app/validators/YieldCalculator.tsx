"use client";

import { useState } from "react";
import type { ValidatorRow } from "./ValidatorsClient";

interface Props {
  validators: ValidatorRow[];
  taoPrice: number | null;
}

export default function YieldCalculator({ validators, taoPrice }: Props) {
  const [selectedHotkey, setSelectedHotkey] = useState<string>(validators[0]?.hotkey ?? "");
  const [taoAmount, setTaoAmount] = useState<string>("");

  const validator = validators.find((v) => v.hotkey === selectedHotkey) ?? validators[0];
  const amount = parseFloat(taoAmount);
  const hasAmount = !isNaN(amount) && amount > 0;

  let weeklyTao: number | null = null;
  let monthlyTao: number | null = null;
  let yearlyTao: number | null = null;

  if (hasAmount && validator) {
    yearlyTao = amount * (validator.aprRaw / 100);
    monthlyTao = yearlyTao / 12;
    weeklyTao = yearlyTao / 52;
  }

  function fmt(n: number) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }

  function fmtUsd(n: number) {
    if (taoPrice === null) return "—";
    return (n * taoPrice).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }

  const rows: { label: string; tao: number | null }[] = [
    { label: "Weekly", tao: weeklyTao },
    { label: "Monthly", tao: monthlyTao },
    { label: "Yearly", tao: yearlyTao },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1623] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080d14] border-b border-white/10">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Calculate Your Yield
        </span>
        <span className="text-xs text-gray-600">Based on current est. APR</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Validator selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Select Validator
            </label>
            <select
              value={selectedHotkey}
              onChange={(e) => setSelectedHotkey(e.target.value)}
              className="w-full rounded-lg bg-[#080d14] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            >
              {validators.map((v) => (
                <option key={v.hotkey} value={v.hotkey}>
                  {v.name} — {v.apr} APR · {v.fee} fee
                </option>
              ))}
            </select>
          </div>

          {/* TAO amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Your Stake (TAO)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 100"
                value={taoAmount}
                onChange={(e) => setTaoAmount(e.target.value)}
                className="w-full rounded-lg bg-[#080d14] border border-white/10 text-white text-sm px-3 py-2.5 pr-14 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors placeholder:text-gray-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-medium">
                TAO
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasAmount && validator ? (
          <div className="grid grid-cols-3 gap-3">
            {rows.map(({ label, tao }) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-[#080d14] p-4 space-y-2 text-center"
              >
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {label}
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {tao !== null ? fmt(tao) : "—"}
                  <span className="text-xs font-normal text-gray-500 ml-1">TAO</span>
                </div>
                <div className="text-sm text-emerald-400 font-medium tabular-nums">
                  {tao !== null ? fmtUsd(tao) : "—"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 py-8 text-center">
            <p className="text-gray-600 text-sm">Enter a TAO amount to see your projected yield</p>
          </div>
        )}

        {/* Validator summary pill */}
        {validator && (
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 border border-purple-600/20 text-purple-400 text-xs">
              <span className="font-semibold">{validator.name}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              APR: {validator.apr}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
              Fee: {validator.fee}
            </span>
            {taoPrice !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                TAO price: ${taoPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-gray-700 leading-relaxed">
          Estimates based on current on-chain APR. APR fluctuates with network conditions — actual yield may differ. Fee is already reflected in the APR figure. Not financial advice.
        </p>
      </div>
    </div>
  );
}
