"use client";

import { useState } from "react";

const APY = 0.18; // ~18% est. APY

export default function CalcClient() {
  const [amount, setAmount] = useState("");

  const tao = parseFloat(amount) || 0;
  const monthly = (tao * APY) / 12;
  const yearly = tao * APY;

  return (
    <div className="bg-[#080d14] min-h-screen flex items-start justify-center p-3">
      <div className="w-full bg-[#0f1623] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Staking Calculator
          </h3>
          <a
            href="https://www.taopulse.io/staking"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            TaoPulse.io
          </a>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1.5">
            TAO Amount
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-mono pointer-events-none">
              τ
            </span>
          </div>
        </div>

        {tao > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-[#0a0f1a] rounded-lg p-3 border border-white/5">
              <div className="text-[11px] text-gray-500 mb-1">
                Monthly (est.)
              </div>
              <div className="text-base font-bold font-mono text-green-400">
                +{monthly.toFixed(3)} τ
              </div>
            </div>
            <div className="bg-[#0a0f1a] rounded-lg p-3 border border-white/5">
              <div className="text-[11px] text-gray-500 mb-1">
                Yearly (est.)
              </div>
              <div className="text-base font-bold font-mono text-emerald-400">
                +{yearly.toFixed(3)} τ
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0f1a] rounded-lg p-3 border border-white/5 mb-3">
            <p className="text-xs text-gray-600 text-center">
              Enter a TAO amount to see your estimated yield
            </p>
          </div>
        )}

        <p className="text-[10px] text-gray-600">
          Based on ~18% APY est. · Not financial advice
        </p>
      </div>
    </div>
  );
}
