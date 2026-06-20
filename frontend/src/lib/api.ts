const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PredictRequest {
  age: number;
  sex: "male" | "female";
  bmi: number;
  children: number;
  smoker: "yes" | "no";
  region: "northeast" | "northwest" | "southeast" | "southwest";
}

export interface PredictResponse {
  predicted_cost: number;
  confidence_interval: { low: number; high: number };
  breakdown: {
    base_cost: number;
    smoker_premium: number;
    bmi_surcharge: number;
    age_factor: number;
  };
  savings_if_quit_smoking: number;
  savings_if_bmi_normal: number;
  age_group: string;
  avg_cost_age_group: number;
  all_model_predictions: Record<string, number>;
  model_metrics: Record<string, { r2: number; mae: number; rmse: number; cv_r2_mean: number; cv_r2_std: number }>;
  primary_model: string;
  share_id: string;
}

export interface Quote {
  share_id: string;
  age: number;
  sex: string;
  bmi: number;
  children: number;
  smoker: string;
  region: string;
  predicted_cost: number;
  confidence_interval: { low: number; high: number };
  savings_if_quit_smoking: number;
  savings_if_bmi_normal: number;
  breakdown: Record<string, number>;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  model: string;
  r2: number;
  mae: number;
  rmse: number;
  cv_r2_mean: number;
  cv_r2_std: number;
}

export async function predictCost(req: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${API}/api/predict-cost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getQuote(shareId: string): Promise<Quote> {
  const res = await fetch(`${API}/api/quote/${shareId}`);
  if (!res.ok) throw new Error("Quote not found");
  return res.json();
}

export async function getHistory(): Promise<{ quotes: Quote[] }> {
  const res = await fetch(`${API}/api/history`);
  return res.json();
}

export async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  const res = await fetch(`${API}/api/model-leaderboard`);
  return res.json();
}

export async function getRegionalStats(): Promise<{
  regions: Record<string, { mean: number; median: number; std: number }>;
}> {
  const res = await fetch(`${API}/api/regional-stats`);
  return res.json();
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
