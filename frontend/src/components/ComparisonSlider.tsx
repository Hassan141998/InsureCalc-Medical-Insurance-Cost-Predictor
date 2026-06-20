"use client";
import { fmt } from "@/lib/api";

interface Props {
  yourCost: number;
  avgCost: number;
  ageGroup: string;
}

export default function ComparisonSlider({ yourCost, avgCost, ageGroup }: Props) {
  const max = Math.max(yourCost, avgCost) * 1.2;
  const yourPct = (yourCost / max) * 100;
  const avgPct = (avgCost / max) * 100;
  const diff = yourCost - avgCost;
  const diffPct = Math.abs((diff / avgCost) * 100).toFixed(1);
  const isBelow = diff < 0;

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-white">Age Group Comparison</h3>
        <span className="text-xs font-mono-custom px-2 py-1 rounded-full bg-[rgba(0,77,77,0.5)] text-[#00b894]">
          Ages {ageGroup}
        </span>
      </div>

      <div className="space-y-4">
        {/* Your cost bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00b894] inline-block" />
              Your estimate
            </span>
            <span className="font-mono-custom font-bold text-white">{fmt(yourCost)}</span>
          </div>
          <div className="h-3 bg-[rgba(0,77,77,0.3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${yourPct}%`,
                background: "linear-gradient(90deg, #00b894, #00d2a8)",
              }}
            />
          </div>
        </div>

        {/* Avg cost bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#74b9ff] inline-block" />
              Avg for ages {ageGroup}
            </span>
            <span className="font-mono-custom font-bold text-white">{fmt(avgCost)}</span>
          </div>
          <div className="h-3 bg-[rgba(0,77,77,0.3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${avgPct}%`,
                background: "linear-gradient(90deg, #74b9ff, #a29bfe)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div
        className="flex items-center gap-3 rounded-xl p-4"
        style={{
          background: isBelow ? "rgba(0,184,148,0.1)" : "rgba(225,112,85,0.1)",
          border: `1px solid ${isBelow ? "rgba(0,184,148,0.25)" : "rgba(225,112,85,0.25)"}`,
        }}
      >
        <span className="text-2xl">{isBelow ? "👏" : "⚠️"}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: isBelow ? "#00b894" : "#e17055" }}>
            {isBelow
              ? `${diffPct}% below average for your age group`
              : `${diffPct}% above average for your age group`}
          </p>
          <p className="text-xs text-gray-400">
            {isBelow
              ? `You save ${fmt(Math.abs(diff))}/yr compared to peers`
              : `You pay ${fmt(Math.abs(diff))}/yr more than peers`}
          </p>
        </div>
      </div>
    </div>
  );
}
