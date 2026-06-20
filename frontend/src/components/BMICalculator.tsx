"use client";
import { useState, useEffect } from "react";

interface BMICalcProps {
  value: number;
  onChange: (bmi: number) => void;
}

function getBMICategory(bmi: number): { label: string; color: string; description: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#74b9ff", description: "Below healthy range" };
  if (bmi < 25)   return { label: "Normal",      color: "#00b894", description: "Healthy weight range" };
  if (bmi < 30)   return { label: "Overweight",  color: "#fdcb6e", description: "Above healthy range" };
  if (bmi < 35)   return { label: "Obese I",     color: "#e17055", description: "Health risks increase" };
  return              { label: "Obese II+",   color: "#d63031", description: "Significant health risks" };
}

export default function BMICalculator({ value, onChange }: BMICalcProps) {
  const [mode, setMode] = useState<"direct" | "calc">("direct");
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(7);
  const [lbs, setLbs] = useState(154);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  useEffect(() => {
    if (mode !== "calc") return;
    let bmi: number;
    if (unit === "metric") {
      bmi = weightKg / Math.pow(heightCm / 100, 2);
    } else {
      const totalIn = feet * 12 + inches;
      bmi = (703 * lbs) / Math.pow(totalIn, 2);
    }
    onChange(Math.round(bmi * 10) / 10);
  }, [heightCm, weightKg, feet, inches, lbs, unit, mode]);

  const cat = getBMICategory(value);
  const pct = Math.min(100, Math.max(0, ((value - 10) / 50) * 100));

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-[rgba(0,184,148,0.2)]">
        <button
          onClick={() => setMode("direct")}
          className={`flex-1 py-2 text-sm font-medium transition-all ${mode === "direct" ? "bg-[#00b894] text-white" : "text-gray-400 hover:text-white"}`}
        >
          Enter BMI
        </button>
        <button
          onClick={() => setMode("calc")}
          className={`flex-1 py-2 text-sm font-medium transition-all ${mode === "calc" ? "bg-[#00b894] text-white" : "text-gray-400 hover:text-white"}`}
        >
          Calculate BMI
        </button>
      </div>

      {mode === "direct" ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">BMI Value</label>
            <span className="font-mono-custom text-lg font-semibold" style={{ color: cat.color }}>{value.toFixed(1)}</span>
          </div>
          <input
            type="range" min="10" max="60" step="0.1"
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10</span><span>25</span><span>30</span><span>60</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unit toggle */}
          <div className="flex gap-2">
            {(["metric", "imperial"] as const).map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-3 py-1 text-xs rounded-full border transition-all capitalize ${unit === u ? "border-[#00b894] text-[#00b894]" : "border-gray-600 text-gray-400 hover:border-gray-400"}`}
              >
                {u}
              </button>
            ))}
          </div>

          {unit === "metric" ? (
            <>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Height</span><span className="font-mono-custom">{heightCm} cm</span>
                </div>
                <input type="range" min="120" max="220" value={heightCm} onChange={e => setHeightCm(+e.target.value)} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Weight</span><span className="font-mono-custom">{weightKg} kg</span>
                </div>
                <input type="range" min="30" max="200" value={weightKg} onChange={e => setWeightKg(+e.target.value)} className="w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Feet</span><span className="font-mono-custom">{feet}′</span>
                  </div>
                  <input type="range" min="4" max="7" value={feet} onChange={e => setFeet(+e.target.value)} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Inches</span><span className="font-mono-custom">{inches}″</span>
                  </div>
                  <input type="range" min="0" max="11" value={inches} onChange={e => setInches(+e.target.value)} className="w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Weight</span><span className="font-mono-custom">{lbs} lbs</span>
                </div>
                <input type="range" min="60" max="440" value={lbs} onChange={e => setLbs(+e.target.value)} className="w-full" />
              </div>
            </>
          )}
        </div>
      )}

      {/* BMI gauge */}
      <div className="space-y-1">
        <div className="h-2 rounded-full overflow-hidden" style={{
          background: "linear-gradient(to right, #74b9ff 0%, #00b894 30%, #fdcb6e 55%, #e17055 75%, #d63031 100%)"
        }}>
          <div
            className="h-full w-1 rounded-full bg-white shadow-lg transition-all duration-300"
            style={{ marginLeft: `${pct}%`, transform: "translateX(-50%)" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{
        background: `${cat.color}18`, border: `1px solid ${cat.color}40`
      }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
        <div>
          <span style={{ color: cat.color }} className="font-semibold">{cat.label}</span>
          <span className="text-gray-400 ml-2 text-xs">{cat.description}</span>
        </div>
        <span className="ml-auto font-mono-custom font-bold" style={{ color: cat.color }}>{value.toFixed(1)}</span>
      </div>
    </div>
  );
}
