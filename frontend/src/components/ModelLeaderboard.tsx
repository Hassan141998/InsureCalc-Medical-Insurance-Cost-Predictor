"use client";
import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";

const RANK_STYLES = ["badge-gold", "badge-silver", "badge-bronze", "badge-plain"];
const RANK_EMOJI = ["🥇", "🥈", "🥉", "4"];

const BAR_MAX_R2 = 1;

export default function ModelLeaderboard({ metrics }: { metrics?: Record<string, any> }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (metrics) {
      const ranked = Object.entries(metrics)
        .map(([model, m]: [string, any]) => ({ rank: 0, model, ...m }))
        .sort((a, b) => b.r2 - a.r2)
        .map((e, i) => ({ ...e, rank: i + 1 }));
      setEntries(ranked);
    } else {
      getLeaderboard().then(d => setEntries(d.leaderboard)).catch(() => {});
    }
  }, [metrics]);

  if (!entries.length) return null;

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-white">Model Leaderboard</h3>
        <span className="text-xs text-gray-500 font-mono-custom">4 models compared</span>
      </div>

      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={e.model} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono-custom ${RANK_STYLES[i] || RANK_STYLES[3]}`}>
                  {RANK_EMOJI[i] || `${i+1}`}
                </span>
                <span className="text-sm font-medium text-white">{e.model}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono-custom">
                <span className="text-[#00b894]">R² {(e.r2 * 100).toFixed(1)}%</span>
                <span className="text-gray-400 hidden sm:inline">MAE ${e.mae.toLocaleString()}</span>
                <span className="text-gray-400 hidden sm:inline">RMSE ${e.rmse.toLocaleString()}</span>
              </div>
            </div>

            {/* R² bar */}
            <div className="h-1.5 bg-[rgba(0,77,77,0.5)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(e.r2 / BAR_MAX_R2) * 100}%`,
                  background: i === 0
                    ? "linear-gradient(90deg, #00b894, #00d2a8)"
                    : i === 1
                    ? "linear-gradient(90deg, #74b9ff, #a29bfe)"
                    : "rgba(0,184,148,0.3)",
                }}
              />
            </div>

            {/* CV score */}
            {e.cv_r2_mean && (
              <p className="text-[10px] text-gray-500 font-mono-custom">
                5-fold CV: {(e.cv_r2_mean * 100).toFixed(1)}% ± {(e.cv_r2_std * 100).toFixed(1)}%
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[rgba(0,184,148,0.1)]">
        <p className="text-xs text-gray-500">
          Primary prediction uses <span className="text-[#00b894] font-mono-custom">GradientBoosting</span> — highest accuracy model.
          All models trained on the Medical Cost Personal Dataset.
        </p>
      </div>
    </div>
  );
}
