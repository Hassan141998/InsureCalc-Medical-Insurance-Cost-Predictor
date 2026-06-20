"""
InsureCalc — Vercel Serverless API
All FastAPI routes served as a single serverless function.
Vercel routes /api/* → this file.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os, uuid, json
from dotenv import load_dotenv

load_dotenv()

# ── ML Model (trained once per cold start) ────────────────────────────────────
from api.ml_model import predict, model_metrics, age_group_stats, df_global

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_conn():
    if not DATABASE_URL:
        return None
    import psycopg2
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_conn()
    if not conn:
        return
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS quotes (
            id SERIAL PRIMARY KEY,
            share_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
            age INT NOT NULL,
            sex VARCHAR(10),
            bmi FLOAT,
            children INT,
            smoker BOOLEAN,
            region VARCHAR(20),
            predicted_cost FLOAT,
            ci_low FLOAT,
            ci_high FLOAT,
            savings_smoking FLOAT DEFAULT 0,
            savings_bmi FLOAT DEFAULT 0,
            breakdown JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def save_quote(data: dict) -> str:
    share_id = str(uuid.uuid4())
    conn = get_conn()
    if not conn:
        return share_id
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO quotes
              (share_id,age,sex,bmi,children,smoker,region,
               predicted_cost,ci_low,ci_high,savings_smoking,savings_bmi,breakdown)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            share_id,
            data["age"], data["sex"], data["bmi"], data["children"],
            data["smoker"] == "yes", data["region"],
            data["predicted_cost"],
            data["confidence_interval"]["low"],
            data["confidence_interval"]["high"],
            data.get("savings_if_quit_smoking", 0),
            data.get("savings_if_bmi_normal", 0),
            json.dumps(data["breakdown"]),
        ))
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"[db] save error: {e}")
    finally:
        conn.close()
    return share_id

def fetch_quote(share_id: str):
    conn = get_conn()
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT share_id,age,sex,bmi,children,smoker,region,
                   predicted_cost,ci_low,ci_high,savings_smoking,savings_bmi,
                   breakdown,created_at
            FROM quotes WHERE share_id=%s
        """, (share_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return None
        return {
            "share_id": str(row[0]),
            "age": row[1], "sex": row[2], "bmi": row[3],
            "children": row[4], "smoker": "yes" if row[5] else "no",
            "region": row[6], "predicted_cost": row[7],
            "confidence_interval": {"low": row[8], "high": row[9]},
            "savings_if_quit_smoking": row[10],
            "savings_if_bmi_normal": row[11],
            "breakdown": row[12],
            "created_at": row[13].isoformat() if row[13] else None,
        }
    except Exception as e:
        print(f"[db] fetch error: {e}")
        return None

def fetch_history():
    conn = get_conn()
    if not conn:
        return []
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT share_id,age,sex,bmi,smoker,region,predicted_cost,created_at
            FROM quotes ORDER BY created_at DESC LIMIT 20
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{
            "share_id": str(r[0]), "age": r[1], "sex": r[2],
            "bmi": r[3], "smoker": "yes" if r[4] else "no",
            "region": r[5], "predicted_cost": r[6],
            "created_at": r[7].isoformat() if r[7] else None,
        } for r in rows]
    except Exception as e:
        print(f"[db] history error: {e}")
        return []

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(title="InsureCalc API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init DB on startup
try:
    init_db()
except Exception as e:
    print(f"[db] init error: {e}")

# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    sex: str = Field(..., pattern="^(male|female)$")
    bmi: float = Field(..., ge=10, le=70)
    children: int = Field(..., ge=0, le=5)
    smoker: str = Field(..., pattern="^(yes|no)$")
    region: str = Field(..., pattern="^(northeast|northwest|southeast|southwest)$")

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api")
@app.get("/api/")
def root():
    return {"app": "InsureCalc API", "version": "2.0.0", "status": "ok"}

@app.get("/api/health")
def health():
    return {"status": "ok", "models_trained": list(model_metrics.keys())}

@app.post("/api/predict-cost")
def predict_cost(req: PredictRequest):
    result = predict(
        age=req.age, sex=req.sex, bmi=req.bmi,
        children=req.children, smoker=req.smoker, region=req.region,
    )
    share_id = save_quote({**req.dict(), **result})
    result["share_id"] = share_id
    return result

@app.get("/api/quote/{share_id}")
def get_quote(share_id: str):
    q = fetch_quote(share_id)
    if not q:
        raise HTTPException(404, "Quote not found")
    return q

@app.get("/api/history")
def history():
    return {"quotes": fetch_history()}

@app.get("/api/model-leaderboard")
def leaderboard():
    ranked = sorted(model_metrics.items(), key=lambda x: x[1]["r2"], reverse=True)
    return {
        "leaderboard": [
            {"rank": i+1, "model": name, **metrics}
            for i, (name, metrics) in enumerate(ranked)
        ]
    }

@app.get("/api/regional-stats")
def regional_stats():
    if df_global is None:
        return {"regions": {}}
    stats = df_global.groupby("region")["charges"].agg(["mean","median","std"]).round(2)
    return {
        "regions": {
            r: {"mean": float(stats.loc[r,"mean"]),
                "median": float(stats.loc[r,"median"]),
                "std": float(stats.loc[r,"std"])}
            for r in stats.index
        }
    }

@app.get("/api/age-group-stats")
def age_group_stats_endpoint():
    return {"age_groups": age_group_stats}
