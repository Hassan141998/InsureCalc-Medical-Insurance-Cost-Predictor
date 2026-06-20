"use client";
import { useEffect, useState } from "react";
import { getRegionalStats, fmt } from "@/lib/api";

const REGIONS = [
  { id: "northeast", label: "Northeast", x: 72, y: 28, abbr: "NE" },
  { id: "northwest", label: "Northwest", x: 18, y: 20, abbr: "NW" },
  { id: "southeast", label: "Southeast", x: 68, y: 65, abbr: "SE" },
  { id: "southwest", label: "Southwest", x: 22, y: 65, abbr: "SW" },
];

export default function RegionalMap({ activeRegion }: { activeRegion?: string }) {
  const [stats, setStats] = useState<Record<string, { mean: number; median: number; std: number }>>({});
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    getRegionalStats().then(d => setStats(d.regions)).catch(() => {});
  }, []);

  const maxMean = Math.max(...Object.values(stats).map(s => s.mean), 1);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-xl font-semibold text-white">Regional Cost Map</h3>
      <p className="text-xs text-gray-400">Average annual insurance costs by US region</p>

      {/* SVG US outline */}
      <div className="relative">
        <svg viewBox="0 0 100 80" className="w-full" style={{ filter: "drop-shadow(0 4px 20px rgba(0,184,148,0.1))" }}>
          {/* Simplified US shape */}
          <path
            d="M5,15 L95,15 L95,70 L5,70 Z"
            fill="rgba(0,77,77,0.15)"
            stroke="rgba(0,184,148,0.15)"
            strokeWidth="0.5"
          />
          {/* Dividing lines */}
          <line x1="50" y1="15" x2="50" y2="70" stroke="rgba(0,184,148,0.15)" strokeWidth="0.3" strokeDasharray="2,2" />
          <line x1="5" y1="47" x2="95" y2="47" stroke="rgba(0,184,148,0.15)" strokeWidth="0.3" strokeDasharray="2,2" />

          {/* Region nodes */}
          {REGIONS.map(r => {
            const s = stats[r.id];
            const intensity = s ? s.mean / maxMean : 0.5;
            const isActive = activeRegion === r.id || hovered === r.id;
            const color = isActive ? "#00b894" : `rgba(0,${Math.floor(100 + intensity * 100)},${Math.floor(100 + intensity * 50)},0.8)`;
            const radius = isActive ? 6 : 4 + intensity * 3;

            return (
              <g key={r.id} onMouseEnter={() => setHovered(r.id)} onMouseLeave={() => setHovered(null)}>
                {/* Glow ring for active */}
                {isActive && (
                  <circle cx={r.x} cy={r.y} r={radius + 3} fill="none" stroke="#00b894" strokeWidth="0.5" opacity="0.5" />
                )}
                <circle
                  cx={r.x} cy={r.y} r={radius}
                  fill={color}
                  stroke={isActive ? "#00b894" : "rgba(0,184,148,0.4)"}
                  strokeWidth="0.5"
                  style={{ transition: "all 0.3s", cursor: "pointer" }}
                />
                <text
                  x={r.x} y={r.y + 0.5}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="3" fontWeight="bold"
                  style={{ pointerEvents: "none", fontFamily: "monospace" }}
                >
                  {r.abbr}
                </text>
                {/* Cost label */}
                {s && (
                  <text
                    x={r.x} y={r.y + radius + 5}
                    textAnchor="middle"
                    fill={isActive ? "#00b894" : "rgba(255,255,255,0.6)"}
                    fontSize="2.5"
                    style={{ pointerEvents: "none", fontFamily: "monospace", transition: "all 0.3s" }}
                  >
                    ${(s.mean / 1000).toFixed(1)}k
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region cards */}
      <div className="grid grid-cols-2 gap-2">
        {REGIONS.map(r => {
          const s = stats[r.id];
          const isActive = activeRegion === r.id;
          return (
            <div
              key={r.id}
              className={`rounded-lg p-3 transition-all ${isActive ? "border border-[#00b894] bg-[rgba(0,184,148,0.1)]" : "border border-[rgba(0,184,148,0.1)] bg-[rgba(0,42,42,0.4)]"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-[#00b894]" : "bg-[rgba(0,184,148,0.5)]"}`} />
                <span className="text-xs font-semibold text-gray-300">{r.label}</span>
                {isActive && <span className="text-[10px] text-[#00b894] ml-auto">← You</span>}
              </div>
              {s ? (
                <>
                  <p className="font-mono-custom text-sm font-bold text-white">{fmt(s.mean)}</p>
                  <p className="text-[10px] text-gray-500">avg/year · median {fmt(s.median)}</p>
                </>
              ) : (
                <p className="text-xs text-gray-500">Loading…</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
