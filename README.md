# InsureCalc — Medical Insurance Cost Predictor

> AI-powered medical insurance cost prediction using 4 ML models, with confidence intervals, interactive breakdowns, savings estimator, and shareable quotes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 4 ML Models | Linear · Ridge · Lasso · GradientBoosting compared live |
| 📊 Cost Breakdown | Animated donut chart: base + smoker + BMI + age |
| 🔢 BMI Calculator | Metric/Imperial with live BMI gauge |
| 💰 Savings Estimator | "Quit smoking → save $X/yr" projections |
| 📈 Age Group Comparison | Slider vs peers in your age bracket |
| 🗺️ Regional Map | SVG US map with avg costs by region |
| 🔗 Shareable Quotes | Unique URL per prediction (e.g. `/quote/uuid`) |
| 📋 Quote History | Neon PostgreSQL persistence |
| 🏆 Model Leaderboard | R², MAE, RMSE, 5-fold CV for all models |
| ⚡ Live Counter | Animated dollar counter on result reveal |

---

## 🏗️ Tech Stack

```
Frontend:   Next.js 14 · TypeScript · Tailwind CSS · Recharts · Framer Motion
Backend:    FastAPI · uvicorn · scikit-learn · pandas · numpy
Database:   Neon PostgreSQL (psycopg2)
Fonts:      Cormorant Garamond (display) · Fira Code (mono) · Inter (body)
Deploy:     Vercel (frontend) · Railway/Render (backend)
```

---

## 🚀 Quick Start (Local)

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/insurecalc.git
cd insurecalc
```

### 2. Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your Neon DATABASE_URL (optional, works without DB)

# (Optional) Download real dataset
# Place insurance.csv from Kaggle in backend/ directory
# https://www.kaggle.com/datasets/mirichoi0218/insurance

# Run the API
python main.py
```

Backend runs at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000 (already default)

# Run dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 📡 API Reference

### `POST /api/predict-cost`
```json
{
  "age": 32,
  "sex": "male",
  "bmi": 26.5,
  "children": 0,
  "smoker": "no",
  "region": "northeast"
}
```
**Response:**
```json
{
  "predicted_cost": 12400.50,
  "confidence_interval": { "low": 9200.00, "high": 15600.00 },
  "breakdown": {
    "base_cost": 5200.00,
    "smoker_premium": 0.00,
    "bmi_surcharge": 1400.00,
    "age_factor": 5800.00
  },
  "savings_if_quit_smoking": 0.00,
  "savings_if_bmi_normal": 890.00,
  "age_group": "26-35",
  "avg_cost_age_group": 11200.00,
  "all_model_predictions": { "LinearRegression": 11900, "Ridge": 12100, "Lasso": 11800, "GradientBoosting": 12400 },
  "model_metrics": { "GradientBoosting": { "r2": 0.8762, "mae": 2340, "rmse": 3100 } },
  "share_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `GET /api/quote/{share_id}` — Retrieve a saved quote
### `GET /api/history` — Recent 20 quotes
### `GET /api/model-leaderboard` — Ranked model metrics
### `GET /api/regional-stats` — Mean/median/std by US region

---

## 🗄️ Database Schema

```sql
CREATE TABLE quotes (
  id           SERIAL PRIMARY KEY,
  share_id     UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  age          INT NOT NULL,
  sex          VARCHAR(10),
  bmi          FLOAT,
  children     INT,
  smoker       BOOLEAN,
  region       VARCHAR(20),
  predicted_cost FLOAT,
  ci_low       FLOAT,
  ci_high      FLOAT,
  savings_smoking FLOAT DEFAULT 0,
  savings_bmi  FLOAT DEFAULT 0,
  breakdown    JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🌍 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

### Backend → Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up

# Set environment variables in Railway dashboard:
# DATABASE_URL = your-neon-connection-string
```

### Backend → Render
1. New Web Service → connect GitHub repo
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env var: `DATABASE_URL`

---

## 🐙 GitHub Setup

```bash
# Initialize git
git init
git add .
git commit -m "feat: initial InsureCalc v2 — 4 ML models, donut chart, savings estimator"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/insurecalc.git
git branch -M main
git push -u origin main

# For subsequent updates
git add .
git commit -m "your message"
git push
```

---

## 📊 Dataset

Using the [Medical Cost Personal Dataset](https://www.kaggle.com/datasets/mirichoi0218/insurance) (Kaggle).

| Column | Type | Description |
|---|---|---|
| age | int | Primary beneficiary age |
| sex | str | male / female |
| bmi | float | Body mass index |
| children | int | Number of dependents (0-5) |
| smoker | str | yes / no |
| region | str | northeast / northwest / southeast / southwest |
| charges | float | Annual insurance cost (target) |

**Without the CSV file**, the app auto-generates realistic synthetic data matching the original distribution.

---

## 🧠 Model Performance (typical)

| Model | R² | MAE | RMSE |
|---|---|---|---|
| Gradient Boosting | ~0.88 | ~$2,300 | ~$3,100 |
| Ridge Regression | ~0.75 | ~$3,900 | ~$5,600 |
| Linear Regression | ~0.74 | ~$4,000 | ~$5,700 |
| Lasso Regression | ~0.74 | ~$4,000 | ~$5,700 |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#001a1a` (deep teal black) |
| Primary | `#004d4d` (deep teal) |
| Accent | `#00b894` (money green) |
| Display font | Cormorant Garamond |
| Mono font | Fira Code |
| Body font | Inter |

---

## 📁 Project Structure

```
insurecalc/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── ml_model.py          # Model training + prediction
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main quote page
│   │   │   ├── layout.tsx       # Root layout + fonts
│   │   │   ├── globals.css      # Design tokens + utilities
│   │   │   └── quote/[id]/      # Shared quote page
│   │   ├── components/
│   │   │   ├── BMICalculator.tsx
│   │   │   ├── CostBreakdownChart.tsx
│   │   │   ├── ModelLeaderboard.tsx
│   │   │   ├── RegionalMap.tsx
│   │   │   ├── ComparisonSlider.tsx
│   │   │   ├── SavingsEstimator.tsx
│   │   │   ├── QuoteHistory.tsx
│   │   │   └── AnimatedCounter.tsx
│   │   └── lib/
│   │       └── api.ts           # API client + types
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── vercel.json
├── .gitignore
└── README.md
```

---

## 📄 License

MIT — free to use, modify, and deploy.
