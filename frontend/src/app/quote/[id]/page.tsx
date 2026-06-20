"use client";
import { useEffect, useState } from "react";
import { getQuote, fmt, type Quote } from "@/lib/api";
import CostBreakdownChart from "@/components/CostBreakdownChart";
import Link from "next/link";

export default function QuotePage({ params }: { params: { id: string } }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getQuote(params.id)
      .then(setQuote)
      .catch(() => setError(true));
  }, [params.id]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center space-y-4 p-8">
      <div>
        <div className="text-5xl mb-4">❌</div>
        <h2 className="font-display text-3xl text-white mb-2">Quote Not Found</h2>
        <p className="text-gray-400 mb-6">This quote may have expired or the link is invalid.</p>
        <Link href="/" className="btn-primary px-6 py-3 rounded-xl">← Back to InsureCalc</Link>
      </div>
    </div>
  );

  if (!quote) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-2 border-[#00b894] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400">Loading quote…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            ← InsureCalc
          </Link>
          <span className="font-mono-custom text-xs text-gray-600">{quote.share_id.slice(0, 8)}…</span>
        </div>

        {/* Hero */}
        <div className="glass-strong rounded-2xl p-8 text-center space-y-3 glow-green">
          <p className="text-gray-400 text-sm font-mono-custom uppercase tracking-widest">Shared Quote</p>
          <h1 className="font-display text-5xl font-semibold gradient-text">{fmt(quote.predicted_cost)}</h1>
          <p className="text-gray-400 text-sm">
            90% CI: {fmt(quote.confidence_interval.low)} – {fmt(quote.confidence_interval.high)}
          </p>
          <p className="text-xs text-gray-600 font-mono-custom">
            Generated {quote.created_at ? new Date(quote.created_at).toLocaleDateString("en-US", { dateStyle: "long" }) : ""}
          </p>
        </div>

        {/* Profile */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl text-white">Profile</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Age", `${quote.age} years`],
              ["Sex", quote.sex],
              ["BMI", quote.bmi?.toFixed(1)],
              ["Children", quote.children],
              ["Smoker", quote.smoker],
              ["Region", quote.region],
            ].map(([k, v]) => (
              <div key={k as string} className="text-center p-3 rounded-lg bg-[rgba(0,42,42,0.5)] border border-[rgba(0,184,148,0.1)]">
                <p className="text-xs text-gray-500 mb-1">{k}</p>
                <p className="font-mono-custom text-sm text-white capitalize font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        {quote.breakdown && (
          <CostBreakdownChart
            breakdown={quote.breakdown as any}
            total={quote.predicted_cost}
          />
        )}

        {/* Savings */}
        {(quote.savings_if_quit_smoking > 0 || quote.savings_if_bmi_normal > 0) && (
          <div className="glass rounded-2xl p-6 space-y-3">
            <h2 className="font-display text-xl text-white">Potential Savings</h2>
            {quote.savings_if_quit_smoking > 0 && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(0,184,148,0.08)] border border-[rgba(0,184,148,0.2)]">
                <span className="text-sm text-gray-300">🚭 If quit smoking</span>
                <span className="font-mono-custom text-[#00b894] font-bold">{fmt(quote.savings_if_quit_smoking)}/yr</span>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="btn-primary px-8 py-3 rounded-xl inline-block">
            Get Your Own Quote →
          </Link>
        </div>
      </div>
    </div>
  );
}
