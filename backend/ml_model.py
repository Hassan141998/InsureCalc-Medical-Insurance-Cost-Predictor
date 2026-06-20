"""
InsureCalc - ML Model Training Module
Trains Linear, Ridge, Lasso, GradientBoosting on insurance.csv dataset.
Falls back to synthetic data if CSV is not available.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import os
import pickle
import warnings
warnings.filterwarnings("ignore")

# ─── Generate synthetic dataset (mirrors Kaggle insurance.csv distribution) ───
def generate_synthetic_data(n=1338):
    np.random.seed(42)
    regions = ["northeast", "northwest", "southeast", "southwest"]
    sexes = ["male", "female"]

    age = np.random.randint(18, 65, n)
    sex = np.random.choice(sexes, n)
    bmi = np.clip(np.random.normal(30.7, 6.1, n), 15, 55)
    children = np.random.choice([0, 1, 2, 3, 4, 5], n, p=[0.43, 0.24, 0.18, 0.10, 0.03, 0.02])
    smoker = np.random.choice(["yes", "no"], n, p=[0.20, 0.80])
    region = np.random.choice(regions, n)

    # Realistic cost formula
    charges = (
        250 * age
        + 330 * bmi
        + 475 * children
        + np.where(smoker == "yes", 23848, 0)
        + np.where(smoker == "yes", 1380 * bmi, 0)
        + np.where(region == "southeast", 800, 0)
        + np.where(region == "northeast", 500, 0)
        + np.random.normal(0, 2000, n)
        - 11900
    )
    charges = np.clip(charges, 1121, 65000)

    return pd.DataFrame({
        "age": age, "sex": sex, "bmi": bmi,
        "children": children, "smoker": smoker,
        "region": region, "charges": charges
    })


def load_data():
    csv_path = os.path.join(os.path.dirname(__file__), "insurance.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        print(f"[model] Loaded real dataset: {len(df)} rows")
    else:
        df = generate_synthetic_data()
        print(f"[model] Using synthetic dataset: {len(df)} rows")
    return df


def build_pipeline(model):
    cat_features = ["sex", "smoker", "region"]
    num_features = ["age", "bmi", "children"]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_features),
        ("cat", OneHotEncoder(drop="first", sparse_output=False), cat_features),
    ])
    return Pipeline([("pre", preprocessor), ("model", model)])


MODELS = {
    "LinearRegression": LinearRegression(),
    "Ridge": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=1.0),
    "GradientBoosting": GradientBoostingRegressor(
        n_estimators=300, learning_rate=0.08, max_depth=4,
        subsample=0.8, random_state=42
    ),
}

trained_pipelines = {}
model_metrics = {}
df_global = None
age_group_stats = {}


def train_all():
    global trained_pipelines, model_metrics, df_global, age_group_stats
    df = load_data()
    df_global = df.copy()

    # Pre-compute age-group averages
    df["age_group"] = pd.cut(df["age"], bins=[17, 25, 35, 45, 55, 65],
                              labels=["18-25", "26-35", "36-45", "46-55", "56-65"])
    age_group_stats = df.groupby("age_group", observed=True)["charges"].mean().to_dict()
    age_group_stats = {str(k): float(v) for k, v in age_group_stats.items()}

    X = df[["age", "sex", "bmi", "children", "smoker", "region"]]
    y = df["charges"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    best_r2 = -999
    best_name = "GradientBoosting"

    for name, base_model in MODELS.items():
        pipe = build_pipeline(base_model)
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)

        r2 = r2_score(y_test, preds)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))

        # Cross-val for robustness
        cv_scores = cross_val_score(pipe, X, y, cv=5, scoring="r2")

        model_metrics[name] = {
            "r2": round(r2, 4),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "cv_r2_mean": round(cv_scores.mean(), 4),
            "cv_r2_std": round(cv_scores.std(), 4),
        }
        trained_pipelines[name] = pipe

        if r2 > best_r2:
            best_r2 = r2
            best_name = name

        print(f"[{name}] R²={r2:.4f} MAE=${mae:,.0f} RMSE=${rmse:,.0f}")

    print(f"[model] Best model: {best_name} (R²={best_r2:.4f})")
    return best_name


def get_age_group(age: int) -> str:
    if age <= 25: return "18-25"
    elif age <= 35: return "26-35"
    elif age <= 45: return "36-45"
    elif age <= 55: return "46-55"
    else: return "56-65"


def predict(age, sex, bmi, children, smoker, region):
    """Return prediction from best model + all model comparisons + breakdown."""
    import math

    input_df = pd.DataFrame([{
        "age": age, "sex": sex, "bmi": bmi,
        "children": children, "smoker": smoker, "region": region
    }])

    # Use GB as primary
    primary = "GradientBoosting"
    predicted_cost = float(trained_pipelines[primary].predict(input_df)[0])
    predicted_cost = max(predicted_cost, 1000)

    # Confidence interval via residual std of GB
    residual_std = model_metrics[primary]["rmse"]
    ci_low = max(0, predicted_cost - 1.645 * residual_std)
    ci_high = predicted_cost + 1.645 * residual_std

    # ── Cost breakdown ──
    # Base cost (age + region)
    base_age_factor = 200 * age
    region_factor = {"northeast": 500, "northwest": 300, "southeast": 800, "southwest": 200}
    base_cost = base_age_factor + region_factor.get(region, 0) + 2500

    smoker_premium = 0.0
    if smoker == "yes":
        smoker_premium = min(predicted_cost * 0.52, 24000 + 1200 * (bmi - 25) if bmi > 25 else 24000)

    bmi_surcharge = 0.0
    if bmi > 25:
        bmi_surcharge = (bmi - 25) * 280 * (1.3 if smoker == "yes" else 1.0)

    age_factor = max(0, (age - 18) * 220)

    total_calc = base_cost + smoker_premium + bmi_surcharge + age_factor
    scale = predicted_cost / max(total_calc, 1)
    breakdown = {
        "base_cost": round(base_cost * scale, 2),
        "smoker_premium": round(smoker_premium * scale, 2),
        "bmi_surcharge": round(bmi_surcharge * scale, 2),
        "age_factor": round(age_factor * scale, 2),
    }

    # ── Savings if quit smoking ──
    savings_if_quit = 0.0
    if smoker == "yes":
        no_smoke_df = input_df.copy()
        no_smoke_df["smoker"] = "no"
        no_smoke_cost = float(trained_pipelines[primary].predict(no_smoke_df)[0])
        savings_if_quit = max(0, predicted_cost - no_smoke_cost)

    # ── Savings if BMI normalised to 25 ──
    savings_if_bmi_normal = 0.0
    if bmi > 25:
        normal_bmi_df = input_df.copy()
        normal_bmi_df["bmi"] = 25.0
        normal_bmi_cost = float(trained_pipelines[primary].predict(normal_bmi_df)[0])
        savings_if_bmi_normal = max(0, predicted_cost - normal_bmi_cost)

    # ── Age group comparison ──
    age_grp = get_age_group(age)
    avg_for_age_group = age_group_stats.get(age_grp, predicted_cost)

    # ── All model predictions ──
    all_predictions = {}
    for name, pipe in trained_pipelines.items():
        all_predictions[name] = round(float(pipe.predict(input_df)[0]), 2)

    return {
        "predicted_cost": round(predicted_cost, 2),
        "confidence_interval": {"low": round(ci_low, 2), "high": round(ci_high, 2)},
        "breakdown": breakdown,
        "savings_if_quit_smoking": round(savings_if_quit, 2),
        "savings_if_bmi_normal": round(savings_if_bmi_normal, 2),
        "age_group": age_grp,
        "avg_cost_age_group": round(avg_for_age_group, 2),
        "all_model_predictions": all_predictions,
        "model_metrics": model_metrics,
        "primary_model": primary,
    }


# Train on import
best_model_name = train_all()
