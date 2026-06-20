// On Vercel: frontend and backend are same domain, use relative /api/*
// Locally: point to localhost:8000
const API = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "")
  : (process.env.NEXT_PUBLIC_API_URL || "");

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

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function predictCost(req: PredictRequest): Promise<PredictResponse> {
  return apiFetch("/api/predict-cost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

export async function getQuote(shareId: string): Promise<Quote> {
  return apiFetch(`/api/quote/${shareId}`);
}

export async function getHistory(): Promise<{ quotes: Quote[] }> {
  return apiFetch("/api/history");
}

export async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return apiFetch("/api/model-leaderboard");
}

export async function getRegionalStats(): Promise<{
  regions: Record<string, { mean: number; median: number; std: number }>;
}> {
  return apiFetch("/api/regional-stats");
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
