"use client";
import { useEffect, useState } from "react";
import { getHistory, fmt, type Quote } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  refreshKey?: number;
}

export default function QuoteHistory({ refreshKey }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHistory()
      .then(d => setQuotes(d.quotes || []))
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const share = (id: string) => {
    const url = `${window.location.origin}/quote/${id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Share link copied!"));
  };

  if (loading) return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <h3 className="font-display text-xl text-white">Quote History</h3>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-[rgba(0,77,77,0.2)] animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (!quotes.length) return (
    <div className="glass rounded-2xl p-6 text-center space-y-2">
      <div className="text-3xl">📋</div>
      <h3 className="font-display text-lg text-white">No quotes yet</h3>
      <p className="text-sm text-gray-400">Generate a prediction above to see history here</p>
    </div>
  );

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-white">Quote History</h3>
        <span className="text-xs text-gray-500">{quotes.length} quote{quotes.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {quotes.map(q => (
          <div
            key={q.share_id}
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-all hover:bg-[rgba(0,77,77,0.3)] cursor-pointer"
            style={{ border: "1px solid rgba(0,184,148,0.1)" }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono-custom text-sm font-bold text-white">
                  {fmt(q.predicted_cost)}
                </span>
                <span className="text-xs text-gray-500">
                  {q.age}y · {q.region} · BMI {q.bmi?.toFixed(1)}
                </span>
                {q.smoker === "yes" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(225,112,85,0.2)] text-[#e17055]">
                    smoker
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-600 font-mono-custom mt-0.5">
                {q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}
              </p>
            </div>

            <button
              onClick={() => share(q.share_id)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg btn-secondary"
            >
              Share
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
