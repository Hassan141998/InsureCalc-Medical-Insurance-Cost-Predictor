"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/api";

interface Props {
  breakdown: {
    base_cost: number;
    smoker_premium: number;
    bmi_surcharge: number;
    age_factor: number;
  };
  total: number;
}

const SEGMENTS = [
  { key: "base_cost",      label: "Base Cost",       color: "#00b894", icon: "🏥" },
  { key: "smoker_premium", label: "Smoker Premium",  color: "#e17055", icon: "🚬" },
  { key: "bmi_surcharge",  label: "BMI Surcharge",   color: "#fdcb6e", icon: "⚖️" },
  { key: "age_factor",     label: "Age Factor",      color: "#74b9ff", icon: "📅" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div className="glass rounded-lg p-3 text-sm">
        <p className="font-semibold" style={{ color: d.payload.color }}>{d.payload.label}</p>
        <p className="font-mono-custom text-white">{fmt(d.value)}</p>
        <p className="text-gray-400">{d.payload.pct.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export default function CostBreakdownChart({ breakdown, total }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [breakdown]);

  const data = SEGMENTS
    .map(s => ({
      ...s,
      value: breakdown[s.key as keyof typeof breakdown] || 0,
      pct: ((breakdown[s.key as keyof typeof breakdown] || 0) / total) * 100,
    }))
    .filter(d => d.value > 0);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-xl font-semibold text-white">Cost Breakdown</h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={90}
              startAngle={90} endAngle={-270}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={animated}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map(d => (
          <div key={d.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-sm text-gray-300">{d.icon} {d.label}</span>
            </div>
            <div className="text-right">
              <span className="font-mono-custom text-sm font-semibold" style={{ color: d.color }}>
                {fmt(d.value)}
              </span>
              <span className="text-xs text-gray-500 ml-2">({d.pct.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar visualization */}
      <div className="space-y-1">
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {data.map(d => (
            <div
              key={d.key}
              style={{ width: `${d.pct}%`, background: d.color, transition: "width 0.8s ease-out" }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center">Annual cost distribution</p>
      </div>
    </div>
  );
}
