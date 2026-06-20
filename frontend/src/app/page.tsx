"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { predictCost, fmt, type PredictResponse, type PredictRequest } from "@/lib/api";
import BMICalculator from "@/components/BMICalculator";
import CostBreakdownChart from "@/components/CostBreakdownChart";
import ModelLeaderboard from "@/components/ModelLeaderboard";
import RegionalMap from "@/components/RegionalMap";
import ComparisonSlider from "@/components/ComparisonSlider";
import SavingsEstimator from "@/components/SavingsEstimator";
import QuoteHistory from "@/components/QuoteHistory";
import AnimatedCounter from "@/components/AnimatedCounter";

const INITIAL: PredictRequest = {
  age: 32,
  sex: "male",
  bmi: 26.5,
  children: 0,
  smoker: "no",
  region: "northeast",
};

export default function HomePage() {
  const [form, setForm] = useState<PredictRequest>(INITIAL);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"quote" | "history" | "leaderboard">("quote");

  const set = (k: keyof PredictRequest, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await predictCost(form);
      setResult(res);
      setHistoryKey(k => k + 1);
      toast.success("Prediction ready!");
    } catch (e: any) {
      toast.error(e.message || "API error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const shareQuote = () => {
    if (!result?.share_id) return;
    const url = `${window.location.origin}/quote/${result.share_id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
  };

  return (
    <div className="min-h-screen bg-[#001a1a]">
      {/* ── Header ── */}
      <header className="border-b border-[rgba(0,184,148,0.15)] sticky top-0 z-50 backdrop-blur-md bg-[rgba(0,26,26,0.85)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00b894] flex items-center justify-center text-sm font-bold text-[#001a1a]">
              IC
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-white leading-none">InsureCalc</h1>
              <p className="text-[10px] text-gray-500 font-mono-custom">Medical Cost Predictor</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {(["quote", "history", "leaderboard"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                  activeTab === tab
                    ? "bg-[rgba(0,184,148,0.15)] text-[#00b894] border border-[rgba(0,184,148,0.3)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "leaderboard" ? "🏆 Models" : tab === "history" ? "📋 History" : "💡 Quote"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="border-b border-[rgba(0,184,148,0.1)]" style={{
        background: "linear-gradient(135deg, rgba(0,77,77,0.3) 0%, transparent 60%)"
      }}>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center space-y-3">
          <p className="text-[#00b894] font-mono-custom text-sm tracking-widest uppercase">AI-Powered · 4 ML Models · Instant</p>
          <h2 className="font-display text-5xl md:text-6xl font-light text-white">
            Know Your Medical<br />
            <span className="gradient-text font-semibold">Insurance Cost</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Trained on 1,338+ real insurance records. Compare Linear, Ridge, Lasso &amp; Gradient Boosting.
            Get personalized predictions with confidence intervals in seconds.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── QUOTE TAB ── */}
        {activeTab === "quote" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Form */}
            <div className="lg:col-span-1 space-y-5">
              <div className="glass rounded-2xl p-6 space-y-5">
                <h3 className="font-display text-xl font-semibold text-white">Your Profile</h3>

                {/* Age */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="text-gray-300">Age</label>
                    <span className="font-mono-custom text-[#00b894]">{form.age} yrs</span>
                  </div>
                  <input
                    type="range" min="18" max="100" value={form.age}
                    onChange={e => set("age", +e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Sex */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Biological Sex</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["male", "female"] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => set("sex", s)}
                        className={`py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                          form.sex === s
                            ? "bg-[#004d4d] border border-[#00b894] text-[#00b894]"
                            : "input-teal rounded-lg text-gray-300 hover:text-white"
                        }`}
                      >
                        {s === "male" ? "♂ Male" : "♀ Female"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BMI */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">BMI</label>
                  <BMICalculator value={form.bmi} onChange={v => set("bmi", v)} />
                </div>

                {/* Children */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="text-gray-300">Dependents</label>
                    <span className="font-mono-custom text-[#00b894]">{form.children}</span>
                  </div>
                  <div className="flex gap-2">
                    {[0,1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => set("children", n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-mono-custom transition-all ${
                          form.children === n
                            ? "bg-[#00b894] text-[#001a1a] font-bold"
                            : "bg-[rgba(0,77,77,0.3)] text-gray-400 hover:text-white border border-[rgba(0,184,148,0.15)]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoker */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Smoking Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["no", "yes"] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => set("smoker", s)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                          form.smoker === s
                            ? s === "yes"
                              ? "bg-[rgba(225,112,85,0.2)] border border-[#e17055] text-[#e17055]"
                              : "bg-[#004d4d] border border-[#00b894] text-[#00b894]"
                            : "input-teal rounded-lg text-gray-300 hover:text-white"
                        }`}
                      >
                        {s === "yes" ? "🚬 Smoker" : "✅ Non-smoker"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">US Region</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["northeast","northwest","southeast","southwest"] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => set("region", r)}
                        className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                          form.region === r
                            ? "bg-[#004d4d] border border-[#00b894] text-[#00b894]"
                            : "input-teal rounded-lg text-gray-300 hover:text-white"
                        }`}
                      >
                        {r.slice(0,2).toUpperCase()} · {r.slice(2)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 rounded-xl btn-primary text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed glow-green"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Calculating…
                    </span>
                  ) : "Calculate My Cost →"}
                </button>
              </div>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-2 space-y-5">
              {!result ? (
                <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-64">
                  <div className="w-16 h-16 rounded-full border-2 border-[rgba(0,184,148,0.3)] flex items-center justify-center text-3xl">
                    🏥
                  </div>
                  <h3 className="font-display text-2xl text-white">Ready to Predict</h3>
                  <p className="text-gray-400 text-sm max-w-sm">
                    Fill in your profile on the left and click "Calculate My Cost" to get your personalized insurance estimate.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 text-center w-full max-w-xs">
                    {[["4", "ML Models"], ["95%+", "Accuracy"], ["1,338+", "Training rows"], ["< 1s", "Response"]].map(([v, l]) => (
                      <div key={l} className="rounded-lg p-3 bg-[rgba(0,77,77,0.2)] border border-[rgba(0,184,148,0.1)]">
                        <p className="font-mono-custom text-[#00b894] font-bold text-lg">{v}</p>
                        <p className="text-gray-500 text-xs">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-slide-in">

                  {/* ── Cost hero card ── */}
                  <div className="glass-strong rounded-2xl p-8 text-center space-y-4 glow-green">
                    <p className="text-sm text-gray-400 font-mono-custom uppercase tracking-widest">
                      Estimated Annual Cost
                    </p>
                    <div className="text-6xl font-bold gradient-text font-display">
                      <AnimatedCounter value={result.predicted_cost} />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <span>90% CI:</span>
                      <span className="font-mono-custom text-white">
                        {fmt(result.confidence_interval.low)} – {fmt(result.confidence_interval.high)}
                      </span>
                    </div>

                    {/* Model predictions row */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {Object.entries(result.all_model_predictions).map(([name, cost]) => (
                        <div key={name} className={`rounded-lg p-2 text-center ${name === result.primary_model ? "border border-[#00b894] bg-[rgba(0,184,148,0.1)]" : "bg-[rgba(0,42,42,0.5)]"}`}>
                          <p className="text-[9px] text-gray-500 truncate">{name.replace("GradientBoosting","GB")}</p>
                          <p className="font-mono-custom text-xs font-semibold text-white">{fmt(cost)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Share button */}
                    <button onClick={shareQuote} className="btn-secondary px-6 py-2 rounded-lg text-sm">
                      🔗 Share Quote
                    </button>
                  </div>

                  {/* ── 2-col grid ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CostBreakdownChart breakdown={result.breakdown} total={result.predicted_cost} />
                    <SavingsEstimator
                      savingsSmoking={result.savings_if_quit_smoking}
                      savingsBMI={result.savings_if_bmi_normal}
                      isSmoker={form.smoker === "yes"}
                      bmi={form.bmi}
                    />
                  </div>

                  <ComparisonSlider
                    yourCost={result.predicted_cost}
                    avgCost={result.avg_cost_age_group}
                    ageGroup={result.age_group}
                  />

                  <RegionalMap activeRegion={form.region} />
                  <ModelLeaderboard metrics={result.model_metrics} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="max-w-2xl mx-auto">
            <QuoteHistory refreshKey={historyKey} />
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === "leaderboard" && (
          <div className="max-w-2xl mx-auto space-y-5">
            <ModelLeaderboard />
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-xl text-white">About the Models</h3>
              <div className="space-y-3">
                {[
                  { name: "Linear Regression", desc: "Baseline model. Assumes linear relationships between features and cost. Fast, interpretable, but misses non-linear patterns." },
                  { name: "Ridge Regression", desc: "L2 regularization prevents overfitting. Handles correlated features (e.g. BMI & smoker status) better than plain linear." },
                  { name: "Lasso Regression", desc: "L1 regularization performs implicit feature selection. Shrinks unimportant coefficients to zero." },
                  { name: "Gradient Boosting", desc: "Ensemble of 300 shallow trees. Captures non-linear interactions and is our primary prediction model — highest R² and lowest error." },
                ].map(m => (
                  <div key={m.name} className="rounded-xl p-4 bg-[rgba(0,42,42,0.4)] border border-[rgba(0,184,148,0.1)]">
                    <p className="font-semibold text-[#00b894] text-sm mb-1">{m.name}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[rgba(0,184,148,0.1)] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-gray-600 text-xs font-mono-custom">
            InsureCalc v2.0 · Built with Next.js 14 + FastAPI + scikit-learn
          </p>
          <p className="text-gray-700 text-xs">
            For educational purposes only. Not financial or medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
