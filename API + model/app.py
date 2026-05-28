from fastapi import FastAPI, HTTPException
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import joblib
import numpy as np
import pandas as pd
import os
from pydantic import BaseModel

app = FastAPI()

# ── Load semua model saat server nyala ───────────────────────────────────────
WINDOW_SIZE = 8
models  = {}
scalers = {}

for file in os.listdir('models'):
    if file.endswith('.keras'):
        key = file.replace('.keras', '')          # contoh: U001__Minuman
        models[key]  = load_model(f'models/{file}')
        scalers[key] = joblib.load(f'scalers/{key}_scaler.pkl')

print(f"Model berhasil diload: {list(models.keys())}")

# ── Load data transaksi untuk ambil history ───────────────────────────────────
transactions = pd.read_csv('Transactions.csv')
products     = pd.read_csv('Products.csv')

data = (
    transactions
    .merge(products, on=['id_produk', 'id_seller'], how='left')
)
data = data[
    data['jenis_transaksi'].str.lower().isin(['pemasukan']) &
    data['status_transaksi'].str.lower().isin(['berhasil'])
].copy()
data['tanggal'] = pd.to_datetime(data['tanggal'])

# ── Fungsi restock ────────────────────────────────────────────────────────────
def classify_restock(predicted_demand, current_stock, minimum_stok):
    if predicted_demand <= 0:
        return 'Stok Aman'
    if current_stock <= minimum_stok:
        return 'Restock Segera'
    coverage_weeks = current_stock / predicted_demand
    if coverage_weeks < 1.5:
        return 'Restock Segera'
    elif coverage_weeks < 3.0:
        return 'Monitor'
    else:
        return 'Stok Aman'

# ── Schema request ────────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    seller_id    : str
    category     : str
    current_stock: float
    minimum_stok : float = 10.0

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "API Moneytor berjalan", "total_models": len(models)}

@app.get("/categories")
def get_categories():
    return {"categories": list(models.keys())}

@app.post("/predict")
def predict(req: PredictionRequest):
    key = f"{req.seller_id}__{req.category.strip().replace(' ', '_')}"

    if key not in models:
        raise HTTPException(status_code=404, detail=f"Model '{key}' tidak ditemukan")

    # Ambil history mingguan seller & kategori ini
    mask = (
        (data['id_seller']       == req.seller_id) &
        (data['kategori_produk'] == req.category)
    )
    weekly = (
        data[mask]
        .set_index('tanggal')
        .resample('W')['qty']
        .sum()
        .reset_index()
        .rename(columns={'qty': 'qty_total'})
    )

    if len(weekly) < WINDOW_SIZE:
        raise HTTPException(status_code=400, detail="Data historis tidak cukup")

    # Prediksi
    scaler      = scalers[key]
    scaled      = scaler.transform(weekly[['qty_total']])
    last_window = scaled[-WINDOW_SIZE:].reshape(1, WINDOW_SIZE, 1)
    pred_scaled = models[key].predict(last_window, verbose=0)
    pred_actual = max(0, float(scaler.inverse_transform(pred_scaled)[0][0]))

    status = classify_restock(pred_actual, req.current_stock, req.minimum_stok)

    return {
        "seller_id"       : req.seller_id,
        "category"        : req.category,
        "prediksi_demand" : round(pred_actual, 2),
        "stok_aktual"     : req.current_stock,
        "minimum_stok"    : req.minimum_stok,
        "coverage_weeks"  : round(req.current_stock / pred_actual, 2) if pred_actual > 0 else None,
        "status_restock"  : status,
    }