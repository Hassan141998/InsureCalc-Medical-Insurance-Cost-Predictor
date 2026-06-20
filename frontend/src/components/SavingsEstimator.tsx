"use client";
import { fmt } from "@/lib/api";
import AnimatedCounter from "./AnimatedCounter";

interface Props {
  savingsSmoking: number;
  savingsBMI: number;
  isSmoker: boolean;
  bmi: number;
}

export default function SavingsEstimator({ savingsSmoking, savingsBMI, isSmoker, bmi }: Props) {
  const hasSavings = savingsSmoking > 0 || savingsBMI > 0;

  if (!hasSavings) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-2">
        <div className="text-3xl">✅</div>
        <h3 className="font-display text-lg text-white">Great Health Profile!</h3>
        <p className="text-sm text-gray-400">No major risk-based cost reductions available — you're in good shape.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-xl font-semibold text-white">💰 Savings Estimator</h3>
      <p className="text-xs text-gray-400">Estimated annual savings if you make these changes</p>

      {savingsSmoking > 0 && (
        <div className="rounded-xl p-4 space-y-2" style={{
          background: "rgba(0,184,148,0.08)",
          border: "1px solid rgba(0,184,148,0.2)"
        }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚭</span>
            <div>
              <p className="text-sm font-semibold text-white">Quit Smoking</p>
              <p className="text-xs text-gray-400">Estimated annual insurance savings</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-mono-custom font-bold text-xl text-[#00b894]">
                <AnimatedCounter value={savingsSmoking} />
              </p>
              <p className="text-xs text-gray-500">/year</p>
            </div>
          </div>

          {/* 5-year projection */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[rgba(0,184,148,0.1)]">
            {[1, 5, 10].map(y => (
              <div key={y} className="text-center">
                <p className="text-[10px] text-gray-500">{y} year{y>1?"s":""}</p>
                <p className="text-xs font-mono-custom text-[#00b894] font-semibold">
                  {fmt(savingsSmoking * y)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {savingsBMI > 100 && (
        <div className="rounded-xl p-4 space-y-2" style={{
          background: "rgba(116,185,255,0.08)",
          border: "1px solid rgba(116,185,255,0.2)"
        }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <div>
              <p className="text-sm font-semibold text-white">Reach Healthy BMI</p>
              <p className="text-xs text-gray-400">Reduce BMI from {bmi.toFixed(1)} to 25.0</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-mono-custom font-bold text-xl text-[#74b9ff]">
                <AnimatedCounter value={savingsBMI} />
              </p>
              <p className="text-xs text-gray-500">/year</p>
            </div>
          </div>
        </div>
      )}

      {savingsSmoking > 0 && savingsBMI > 100 && (
        <div className="rounded-xl p-4" style={{
          background: "linear-gradient(135deg, rgba(0,184,148,0.12), rgba(116,185,255,0.08))",
          border: "1px solid rgba(0,184,148,0.25)"
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">🌟 Maximum Savings</p>
              <p className="text-xs text-gray-400">Both changes combined</p>
            </div>
            <div className="text-right">
              <p className="font-mono-custom font-bold text-2xl gradient-text">
                <AnimatedCounter value={savingsSmoking + savingsBMI} />
              </p>
              <p className="text-xs text-gray-500">/year</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
