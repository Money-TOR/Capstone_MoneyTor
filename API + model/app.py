from fastapi import FastAPI, HTTPException, BackgroundTasks
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Input, LSTM, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import numpy as np
import pandas as pd
import os
from pydantic import BaseModel
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from dotenv import load_dotenv
load_dotenv()
app = FastAPI(title="Moneytor Rekomendasi API", version="2.0")

#konfigurasi
WINDOW_SIZE       = 12
MIN_WEEKS         = 52
TRAIN_RATIO       = 0.70
VAL_RATIO         = 0.15
EPOCHS            = 150
BATCH_SIZE        = 8
PATIENCE          = 15
THRESHOLD_SEGERA  = 1.5
THRESHOLD_MONITOR = 3.0
API_KEY           = os.getenv("RETRAIN_API_KEY")

os.makedirs("models",  exist_ok=True)
os.makedirs("scalers", exist_ok=True)

#Status retrain
retrain_status = {
    "is_running" : False,
    "last_run"   : None,
    "last_result": None,
    "message"    : "Belum pernah dijalankan"
}

#load semua model saat server nyala
models  = {}
scalers = {}

def load_all_models():
    global models, scalers
    models  = {}
    scalers = {}
    if not os.path.exists("models"):
        return
    for file in os.listdir("models"):
        if file.endswith(".keras"):
            key         = file.replace(".keras", "")
            scaler_path = f"scalers/{key}_scaler.pkl"
            if not os.path.exists(scaler_path):
                print(f"[SKIP] Scaler tidak ditemukan untuk {key}")
                continue
            try:
                models[key]  = load_model(f"models/{file}")
                scalers[key] = joblib.load(scaler_path)
                print(f"[LOAD] {key}")
            except Exception as e:
                print(f"[ERROR] Gagal load {key}: {e}")
    print(f"\nTotal model aktif: {len(models)}")

load_all_models()

#Load data
def load_data():
    """Load dan preprocess data transaksi."""
    transactions = pd.read_csv("Transactions.csv")
    products     = pd.read_csv("Products.csv")

    data = transactions.merge(products, on=["id_produk", "id_seller"], how="left")
    data = data[
        data["jenis_transaksi"].str.lower().isin(["pemasukan"]) &
        data["status_transaksi"].str.lower().isin(["berhasil"])
    ].copy()
    data["tanggal"] = pd.to_datetime(data["tanggal"])
    data = data.dropna(subset=["id_seller", "kategori_produk", "qty", "tanggal"])
    data["qty"] = pd.to_numeric(data["qty"], errors="coerce").fillna(0)
    return data

data = load_data()

def create_sequences(scaled_data, window_size):
    X, y = [], []
    for i in range(len(scaled_data) - window_size):
        X.append(scaled_data[i : i + window_size])
        y.append(scaled_data[i + window_size])
    return np.array(X), np.array(y)

def split_sequences(X, y, train_ratio, val_ratio):
    n         = len(X)
    train_end = int(n * train_ratio)
    val_end   = int(n * (train_ratio + val_ratio))
    return (
        X[:train_end],        y[:train_end],
        X[train_end:val_end], y[train_end:val_end],
        X[val_end:],          y[val_end:]
    )

def build_model(window_size):
    inputs  = Input(shape=(window_size, 1))
    x       = LSTM(64)(inputs)
    x       = Dropout(0.2)(x)
    x       = Dense(32, activation="relu")(x)
    outputs = Dense(1)(x)
    model   = Model(inputs, outputs)
    model.compile(optimizer="adam", loss="mse")
    return model

def classify_restock(predicted_demand, current_stock, minimum_stok):
    if predicted_demand <= 0:
        return "Stok Aman"
    if current_stock <= minimum_stok:
        return "Restock Segera"
    coverage_weeks = current_stock / predicted_demand
    if coverage_weeks < THRESHOLD_SEGERA:
        return "Restock Segera"
    elif coverage_weeks < THRESHOLD_MONITOR:
        return "Monitor"
    else:
        return "Stok Aman"

def safe_key(category):
    return category.strip().replace(" ", "_")

#Fungsi training 1 kombinasi
def train_one(category, results):
    key = safe_key(category)

    # Filter hanya per kategori
    mask   = (data["kategori_produk"] == category)
    weekly = (
        data[mask]
        .set_index("tanggal")
        .resample("W")["qty"]
        .sum()
        .reset_index()
        .rename(columns={"qty": "qty_total"})
    )

    if len(weekly) < MIN_WEEKS:
        results.append({
            "key"   : key,
            "status": "skip",
            "reason": f"Data hanya {len(weekly)} minggu (min {MIN_WEEKS})"
        })
        return

    sales      = weekly[["qty_total"]]
    train_size = int(len(sales) * TRAIN_RATIO)
    scaler     = MinMaxScaler()
    scaler.fit(sales[:train_size])
    scaled_all = scaler.transform(sales)

    X, y = create_sequences(scaled_all, WINDOW_SIZE)
    X_train, y_train, X_val, y_val, X_test, y_test = split_sequences(
        X, y, TRAIN_RATIO, VAL_RATIO
    )

    if len(X_val) == 0 or len(X_test) == 0:
        results.append({"key": key, "status": "skip", "reason": "Val/Test kosong"})
        return

    model      = build_model(WINDOW_SIZE)
    early_stop = EarlyStopping(monitor="val_loss", patience=PATIENCE, restore_best_weights=True)
    model.fit(
        X_train, y_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_data=(X_val, y_val),
        callbacks=[early_stop],
        verbose=0
    )

    preds_scaled = model.predict(X_test, verbose=0)
    preds_actual = scaler.inverse_transform(preds_scaled)
    y_actual     = scaler.inverse_transform(y_test)
    mae  = float(mean_absolute_error(y_actual, preds_actual))
    rmse = float(np.sqrt(mean_squared_error(y_actual, preds_actual)))

    model.save(f"models/{key}.keras")
    joblib.dump(scaler, f"scalers/{key}_scaler.pkl")

    models[key]  = load_model(f"models/{key}.keras")
    scalers[key] = joblib.load(f"scalers/{key}_scaler.pkl")

    results.append({
        "key"   : key,
        "status": "success",
        "mae"   : round(mae, 4),
        "rmse"  : round(rmse, 4)
    })

#Fungsi retrain (dijalankan di background)
def run_retrain(category=None, only_new=True):
    global retrain_status, data
    retrain_status["is_running"] = True
    retrain_status["message"]    = "Training sedang berjalan..."

    try:
        data    = load_data()
        results = []

        if category:
            # Train 1 kategori spesifik
            train_one(category, results)
        else:
            # Train semua kategori
            categories = data["kategori_produk"].unique()
            for cat in categories:
                key = safe_key(cat)
                if only_new and key in models:
                    continue
                train_one(cat, results)

        success = [r for r in results if r.get("status") == "success"]
        skipped = [r for r in results if r.get("status") == "skip"]

        retrain_status["last_result"] = {
            "total_diproses": len(results),
            "berhasil"      : len(success),
            "dilewati"      : len(skipped),
            "detail"        : results
        }
        retrain_status["message"] = f"Selesai. {len(success)} model berhasil dilatih."

    except Exception as e:
        retrain_status["message"] = f"Error: {str(e)}"

    finally:
        from datetime import datetime
        retrain_status["last_run"]   = datetime.now().isoformat()
        retrain_status["is_running"] = False

#Schema
class PredictionRequest(BaseModel):
    category     : str
    current_stock: float
    minimum_stok : float = 10.0

class RetrainRequest(BaseModel):
    api_key   : str
    category  : str | None = None
    only_new  : bool        = True

#Endpoints
@app.get("/")
def home():
    return {
        "message"      : "Moneytor Rekomendasi API",
        "version"      : "2.0",
        "total_models" : len(models),
        "status"       : "running"
    }

@app.get("/categories")
def get_categories():
    return {
        "total"     : len(models),
        "categories": list(models.keys())
    }

@app.post("/predict")
def predict(req: PredictionRequest):
    key = safe_key(req.category)

    if key not in models:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{key}' tidak ditemukan. Jalankan /retrain terlebih dahulu."
        )

    mask = (data["kategori_produk"] == req.category)
    weekly = (
        data[mask]
        .set_index("tanggal")
        .resample("W")["qty"]
        .sum()
        .reset_index()
        .rename(columns={"qty": "qty_total"})
    )

    if len(weekly) < WINDOW_SIZE:
        raise HTTPException(status_code=400, detail="Data historis tidak cukup")

    scaler      = scalers[key]
    scaled      = scaler.transform(weekly[["qty_total"]])
    last_window = scaled[-WINDOW_SIZE:].reshape(1, WINDOW_SIZE, 1)
    pred_scaled = models[key].predict(last_window, verbose=0)
    pred_actual = max(0, float(scaler.inverse_transform(pred_scaled)[0][0]))

    status = classify_restock(pred_actual, req.current_stock, req.minimum_stok)

    return {
        "category"        : req.category,
        "prediksi_demand" : round(pred_actual, 2),
        "stok_aktual"     : req.current_stock,
        "minimum_stok"    : req.minimum_stok,
        "coverage_weeks"  : round(req.current_stock / pred_actual, 2) if pred_actual > 0 else None,
        "status_restock"  : status,
    }

@app.post("/retrain")
def retrain(req: RetrainRequest, background_tasks: BackgroundTasks):
    if req.api_key != API_KEY:
        raise HTTPException(status_code=403, detail="API key tidak valid")

    if retrain_status["is_running"]:
        raise HTTPException(status_code=409, detail="Training sedang berjalan, tunggu selesai")

    background_tasks.add_task(
        run_retrain,
        category=req.category,
        only_new=req.only_new
    )

    return {
        "message": "Training dimulai di background",
        "info"   : "Cek progress di GET /retrain/status",
        "mode"   : "single" if req.category else ("new_only" if req.only_new else "all")
    }

@app.get("/retrain/status")
def retrain_status_check():
    """Cek progress training yang sedang berjalan."""
    return retrain_status

