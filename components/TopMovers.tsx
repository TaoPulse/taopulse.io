import Link from "next/link";

export interface Mover {
  id: number;
  name: string;
  emission: number;
  diff: number; // projected - current (absolute)
  diffPct: number; // percentage change
}

interface TopMoversProps {
  gainers: Mover[];
  losers: Mover[];
}

function MoverRow({ mover, isGainer }: { mover: Mover; isGainer: boolean }) {
  const sign = isGainer ? "+" : "";
  const arrowColor = isGainer ? "text-emerald-400" : "text-red-400";
  const arrow = isGainer ? "↑" : "↓";

  return (
    <Link
      href={`/subnets/${mover.id}`}
      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">SN{mover.id}</p>
        <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate leading-tight">
          {mover.name}
        </p>
      </div>
      <div className="ml-3 text-right shrink-0">
        <p className={`text-sm font-bold ${arrowColor}`}>
          {arrow} {sign}{mover.diffPct.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-500">{(mover.emission * 100).toFixed(2)}% emission</p>
      </div>
    </Link>
  );
}

export default function TopMovers({ gainers, losers }: TopMoversProps) {
  if (gainers.length === 0 && losers.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">Top Movers</h2>
        <p className="text-sm text-gray-500 mt-0.5">Subnets with the biggest emission momentum (projected vs current)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="rounded-xl border border-emerald-500/20 bg-[#0f1623] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-400 font-bold text-sm">Gaining ↑</span>
            <span className="text-xs text-gray-500">top 3 by momentum</span>
          </div>
          {gainers.length > 0 ? (
            <div className="divide-y divide-white/5">
              {gainers.map((m) => (
                <MoverRow key={m.id} mover={m} isGainer={true} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">No significant gainers right now</p>
          )}
        </div>

        {/* Losers */}
        <div className="rounded-xl border border-red-500/20 bg-[#0f1623] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-400 font-bold text-sm">Losing ↓</span>
            <span className="text-xs text-gray-500">top 3 by momentum</span>
          </div>
          {losers.length > 0 ? (
            <div className="divide-y divide-white/5">
              {losers.map((m) => (
                <MoverRow key={m.id} mover={m} isGainer={false} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">No significant losers right now</p>
          )}
        </div>
      </div>
    </div>
  );
}
