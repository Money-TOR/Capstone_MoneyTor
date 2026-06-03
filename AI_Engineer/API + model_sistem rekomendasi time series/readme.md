# MoneyTor AI Forecasting API

## Install Dependencies

```bash
pip install tensorflow fastapi uvicorn pandas numpy scikit-learn joblib
```

## Menjalankan API

```bash
python -m uvicorn app:app --reload
```

## Akses API

* API: http://127.0.0.1:8000
* Dokumentasi: http://127.0.0.1:8000/docs

## Struktur Penting

```text
models/
scalers/
app.py
```

Pastikan folder `models` dan `scalers` tersedia sebelum menjalankan API.
