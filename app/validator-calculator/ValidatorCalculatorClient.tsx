"use client";

import { useState, useEffect } from "react";

const TOTAL_DAILY_TAO = 3600;
const VALIDATOR_EMISSION_SHARE = 0.41;
const VALIDATOR_OWN_STAKE_PCT = 0.20; // assume validator owns 20%

const TAKE_SCENARIOS = [0, 9, 18, 25, 50];

function calcResults(
  yourStake: number,
  totalValidatorStake: number,
  validatorTakePct: number,
  subnetEmissionSharePct: number,
  taoPrice: number
) {
  if (yourStake <= 0 || totalValidatorStake <= 0) {
    return null;
  }

  const delegatedStake = totalValidatorStake * (1 - VALIDATOR_OWN_STAKE_PCT);
  const subnetDailyEmissions = TOTAL_DAILY_TAO * (subnetEmissionSharePct / 100);
  const validatorShareOfSubnet = subnetDailyEmissions * VALIDATOR_EMISSION_SHARE;
  const delegatedPortion = validatorShareOfSubnet * (delegatedStake / totalValidatorStake);
  const stakerPool = delegatedPortion * (1 - validatorTakePct / 100);
  const yourShare = yourStake / delegatedStake;
  const dailyTao = stakerPool * yourShare;
  const monthlyTao = dailyTao * 30;
  const annualTao = dailyTao * 365;
  const annualApy = yourStake > 0 ? (annualTao / yourStake) * 100 : 0;
  const dailyUsd = dailyTao * taoPrice;
  const annualUsd = annualTao * taoPrice;
  const yourSharePct = yourShare * 100;

  return { dailyTao, monthlyTao, annualTao, annualApy, dailyUsd, annualUsd, yourSharePct };
}

function fmt(n: number, decimals = 4) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtPct(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  tooltip: string;
  prefix?: string;
  suffix?: string;
}

function NumberInput({ label, value, onChange, min = 0, step = 1, tooltip, prefix, suffix }: NumberInputProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5" title={tooltip}>
        {label}
        <span className="text-gray-600 cursor-help text-xs border border-gray-700 rounded-full w-4 h-4 inline-flex items-center justify-center" title={tooltip}>?</span>
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 text-sm pointer-events-none select-none">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= min) onChange(v);
          }}
          className={`w-full bg-[#0a1220] border border-white/10 rounded-lg text-white text-sm py-2.5 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 text-sm pointer-events-none select-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip: string;
  displayValue: string;
  accentClass?: string;
}

function SliderInput({ label, value, onChange, min, max, step, tooltip, displayValue, accentClass = "accent-purple-500" }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300" title={tooltip}>
          {label}
          <span className="text-gray-600 cursor-help text-xs border border-gray-700 rounded-full w-4 h-4 inline-flex items-center justify-center" title={tooltip}>?</span>
        </label>
        <span className="text-sm font-semibold text-purple-400 tabular-nums">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${accentClass} bg-white/10`}
        style={{ backgroundImage: `linear-gradient(to right, #7c3aed ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  large?: boolean;
  accent?: boolean;
}

function ResultCard({ label, value, sub, large, accent }: ResultCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "bg-purple-600/10 border-purple-500/30" : "bg-[#0a1220] border-white/8"}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`font-bold tabular-nums ${large ? "text-3xl sm:text-4xl text-purple-400" : "text-xl text-white"}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ValidatorCalculatorClient({ initialPrice }: { initialPrice: number }) {
  const [yourStake, setYourStake] = useState(10);
  const [totalValidatorStake, setTotalValidatorStake] = useState(10000);
  const [validatorTake, setValidatorTake] = useState(18);
  const [subnetEmissionShare, setSubnetEmissionShare] = useState(2);
  const [taoPrice, setTaoPrice] = useState(initialPrice);

  // Attempt a fresh price fetch client-side in case server fetch was stale
  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((d) => { if (d?.price) setTaoPrice(d.price); })
      .catch(() => {});
  }, []);

  const results = calcResults(yourStake, totalValidatorStake, validatorTake, subnetEmissionShare, taoPrice);

  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-purple-900/15 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a1 1 0 001-1V6a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" />
            </svg>
            Staking Tools
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-3">
            Validator{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
              Take Calculator
            </span>
          </h1>
          <p className="text-base text-gray-400 max-w-xl">
            See exactly how much TAO you'll earn after the validator's cut. Adjust any input and results update instantly.
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Inputs ── */}
          <div className="space-y-6">
            <div className="bg-[#0f1623] rounded-2xl border border-white/8 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Your Position</h2>

              <NumberInput
                label="Your Stake (TAO)"
                value={yourStake}
                onChange={setYourStake}
                min={0.001}
                step={1}
                tooltip="How many TAO you plan to delegate to this validator"
                suffix="TAO"
              />

              <NumberInput
                label="Validator Total Stake (TAO)"
                value={totalValidatorStake}
                onChange={setTotalValidatorStake}
                min={1}
                step={100}
                tooltip="Total TAO staked to this validator, including their own stake and all delegators"
                suffix="TAO"
              />

              <NumberInput
                label="TAO Price (USD)"
                value={taoPrice}
                onChange={setTaoPrice}
                min={0.01}
                step={1}
                tooltip="Current or forecasted TAO price in USD. Auto-loaded from live feed."
                prefix="$"
              />
            </div>

            <div className="bg-[#0f1623] rounded-2xl border border-white/8 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Network Parameters</h2>

              <SliderInput
                label="Validator Take"
                value={validatorTake}
                onChange={setValidatorTake}
                min={0}
                max={50}
                step={0.5}
                tooltip="The percentage of staker rewards the validator keeps. Bittensor default is 18%. Lower is better for you."
                displayValue={`${validatorTake.toFixed(1)}%`}
              />

              <SliderInput
                label="Subnet Emission Share"
                value={subnetEmissionShare}
                onChange={setSubnetEmissionShare}
                min={0}
                max={10}
                step={0.1}
                tooltip="This subnet's share of total daily TAO emissions (3,600 TAO/day). Proportional to the subnet's stake weight in the network."
                displayValue={`${subnetEmissionShare.toFixed(1)}%`}
              />
            </div>
          </div>

          {/* ── Results ── */}
          <div className="space-y-4">
            {results ? (
              <>
                {/* APY — hero result */}
                <ResultCard
                  label="Annual APY (est.)"
                  value={`${fmtPct(results.annualApy)}%`}
                  sub="Based on current emission parameters"
                  large
                  accent
                />

                {/* Share */}
                <ResultCard
                  label="Your Share of Delegated Stake"
                  value={`${fmtPct(results.yourSharePct)}%`}
                  sub={`You / ${(totalValidatorStake * 0.8).toLocaleString("en-US")} TAO delegated`}
                />

                {/* TAO earned */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a1220] border border-white/8 rounded-xl p-4">
                    <p className="text-[10px] font-medium text-gray-500 mb-1">Daily TAO</p>
                    <p className="text-base font-bold text-white tabular-nums">{fmt(results.dailyTao)}</p>
                  </div>
                  <div className="bg-[#0a1220] border border-white/8 rounded-xl p-4">
                    <p className="text-[10px] font-medium text-gray-500 mb-1">Monthly TAO</p>
                    <p className="text-base font-bold text-white tabular-nums">{fmt(results.monthlyTao, 3)}</p>
                  </div>
                  <div className="bg-[#0a1220] border border-white/8 rounded-xl p-4">
                    <p className="text-[10px] font-medium text-gray-500 mb-1">Annual TAO</p>
                    <p className="text-base font-bold text-white tabular-nums">{fmt(results.annualTao, 2)}</p>
                  </div>
                </div>

                {/* USD values */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a1220] border border-white/8 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Daily USD (est.)</p>
                    <p className="text-lg font-bold text-emerald-400 tabular-nums">${fmtUsd(results.dailyUsd)}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">at ${taoPrice.toLocaleString("en-US")} / TAO</p>
                  </div>
                  <div className="bg-[#0a1220] border border-white/8 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Annual USD (est.)</p>
                    <p className="text-lg font-bold text-emerald-400 tabular-nums">${fmtUsd(results.annualUsd)}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">at ${taoPrice.toLocaleString("en-US")} / TAO</p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed bg-white/3 rounded-lg px-4 py-3 border border-white/5">
                  Calculations are estimates based on current emission parameters. Actual yield varies with network conditions, subnet emission weight changes, and total stake movement.
                </p>
              </>
            ) : (
              <div className="bg-[#0f1623] rounded-2xl border border-white/8 p-10 text-center">
                <p className="text-gray-500 text-sm">Enter valid stake amounts to see results.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Compare Validators Table ── */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white mb-1">Compare Validator Take Scenarios</h2>
            <p className="text-gray-400 text-sm">
              How your estimated annual APY changes across different validator take rates — given your current inputs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f1623] border-b border-white/8">
                  <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Validator Take</th>
                  <th className="text-right px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Annual APY</th>
                  <th className="text-right px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Daily TAO</th>
                  <th className="text-right px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Annual TAO</th>
                  <th className="text-right px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Annual USD</th>
                </tr>
              </thead>
              <tbody>
                {TAKE_SCENARIOS.map((take) => {
                  const r = calcResults(yourStake, totalValidatorStake, take, subnetEmissionShare, taoPrice);
                  const isCurrent = take === validatorTake;
                  return (
                    <tr
                      key={take}
                      className={`border-b border-white/5 last:border-0 transition-colors ${isCurrent ? "bg-purple-600/8" : "bg-[#080d14] hover:bg-white/3"}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold tabular-nums ${isCurrent ? "text-purple-400" : "text-white"}`}>
                            {take}%
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
                              current
                            </span>
                          )}
                          {take === 0 && <span className="text-[10px] text-gray-600">max yield</span>}
                          {take === 18 && !isCurrent && <span className="text-[10px] text-gray-600">default</span>}
                          {take === 50 && <span className="text-[10px] text-gray-600">max take</span>}
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-bold tabular-nums ${isCurrent ? "text-purple-400" : "text-white"}`}>
                        {r ? `${fmtPct(r.annualApy)}%` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-300 tabular-nums">
                        {r ? fmt(r.dailyTao) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-300 tabular-nums">
                        {r ? fmt(r.annualTao, 2) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-emerald-400 tabular-nums hidden sm:table-cell">
                        {r ? `$${fmtUsd(r.annualUsd)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-600 mt-3">
            All figures are estimates (est.) using the same stake and subnet emission inputs above. Highlighted row = your currently selected take rate.
          </p>
        </section>

        {/* ── CTA ── */}
        <section className="mt-12 rounded-2xl border border-purple-500/20 bg-purple-600/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to start staking?</h2>
          <p className="text-gray-400 mb-6 text-sm max-w-md mx-auto">
            Choose a validator with a competitive take rate and start earning TAO yield today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/staking"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
            >
              Staking Guide →
            </a>
            <a
              href="/buy-tao"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
            >
              Buy TAO →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
