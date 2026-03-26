"use client";

import { useState } from "react";

interface WidgetDef {
  id: string;
  title: string;
  desc: string;
  path: string;
  defaultWidth: number;
  defaultHeight: number;
}

const WIDGETS: WidgetDef[] = [
  {
    id: "price",
    title: "TAO Price Badge",
    desc: "Live TAO price + 24h change. Compact badge-style widget for sidebars, headers, or footers.",
    path: "/embed/price",
    defaultWidth: 300,
    defaultHeight: 72,
  },
  {
    id: "subnets",
    title: "Subnet Emission Bars",
    desc: "Top 5 subnets by emission with proportional bars. Great for Bittensor-focused sites.",
    path: "/embed/subnets",
    defaultWidth: 420,
    defaultHeight: 240,
  },
  {
    id: "calculator",
    title: "Staking Calculator",
    desc: "Enter a TAO amount to see estimated monthly and yearly yield at ~18% APY. Pure frontend math.",
    path: "/embed/calculator",
    defaultWidth: 380,
    defaultHeight: 200,
  },
];

export default function EmbedAdminPage() {
  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f1623] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Embed Widget Builder</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Internal tool · /admin/embed — generate iframe codes for external sites
          </p>
        </div>
        <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full font-medium">
          Admin Preview
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 text-sm text-blue-300">
          <strong className="text-blue-200">How it works:</strong> Copy an embed code and paste it into any
          website. The iframe loads the widget directly from TaoPulse — live data, styled to match, no setup
          required.
        </div>

        {WIDGETS.map((widget) => (
          <WidgetSection key={widget.id} widget={widget} />
        ))}
      </div>
    </div>
  );
}

function WidgetSection({ widget }: { widget: WidgetDef }) {
  const [width, setWidth] = useState(widget.defaultWidth);
  const [height, setHeight] = useState(widget.defaultHeight);
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="https://www.taopulse.io${widget.path}" width="${width}" height="${height}" frameborder="0" style="border:none;border-radius:8px;overflow:hidden;" loading="lazy" title="${widget.title}"></iframe>`;

  async function copy() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#0f1623] rounded-2xl border border-white/10 overflow-hidden">
      {/* Widget header */}
      <div className="px-6 py-5 border-b border-white/8">
        <h2 className="text-base font-semibold text-white">{widget.title}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{widget.desc}</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: preview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Live Preview
          </p>
          <div className="bg-[#080d14] rounded-xl border border-white/8 p-4 overflow-hidden">
            <iframe
              src={widget.path}
              width={width}
              height={height}
              frameBorder={0}
              className="block rounded-lg max-w-full"
              title={widget.title}
            />
          </div>
        </div>

        {/* Right: controls + code */}
        <div className="space-y-4">
          {/* Size controls */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Dimensions
            </p>
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="text-xs text-gray-400 block mb-1">Width (px)</span>
                <input
                  type="number"
                  value={width}
                  min={200}
                  max={800}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                />
              </label>
              <label className="flex-1">
                <span className="text-xs text-gray-400 block mb-1">Height (px)</span>
                <input
                  type="number"
                  value={height}
                  min={60}
                  max={600}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Embed code */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Embed Code
            </p>
            <pre className="bg-[#080d14] rounded-xl border border-white/8 px-4 py-3 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {embedCode}
            </pre>
          </div>

          {/* Copy button */}
          <button
            onClick={copy}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
              copied
                ? "bg-green-500/20 border border-green-500/40 text-green-400"
                : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25"
            }`}
          >
            {copied ? "✓ Copied to clipboard!" : "Copy Embed Code"}
          </button>

          <p className="text-xs text-gray-600">
            Embed URL:{" "}
            <span className="font-mono text-gray-500">
              taopulse.io{widget.path}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
