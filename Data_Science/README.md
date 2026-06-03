# Analisis Data UMKM Indonesia 2024–2026

## Deskripsi Proyek

Proyek analisis data UMKM Indonesia periode 2024–2026 menggunakan Python. Analisis dilakukan mulai dari Data Wrangling, Exploratory Data Analysis (EDA), Visualization & Explanatory Analysis, Feature Engineering, hingga Dashboard Interaktif menggunakan Streamlit.

## Struktur Folder

```text
Data_Science/
│
├── Analisis/
│   ├── Notebook.ipynb
│   ├── Feature_Engineering.ipynb
│   └── Data_Dictionary.ipynb
│   └── AB_Testing.ipynb
│
├── Dashboard/
│   ├── Dashboard.py
│   └── url.txt
│
├── Dataset/
│   ├── Transactions.csv
│   ├── Products.csv
│   ├── Sellers.csv
│   ├── Suppliers.csv
│   ├── Logs.csv
│   ├── main_data.csv
│   └── main_data_featured.csv
│
├── requirements.txt
└── README.md
```

## Tahapan Analisis

- Data Wrangling
- Business Understanding
- Exploratory Data Analysis (EDA)
- Visualization & Explanatory Analysis
- Feature Engineering
- Dashboard Streamlit
- A/B Testing

## Pertanyaan Bisnis

1. Bagaimana tren total pendapatan transaksi UMKM dari tahun 2024 - 2026 dan kapan peningkatan transaksi tertinggi terjadi?
2. Kategori produk atau layanan apa yang menghasilkan total pendapatan tertinggi selama periode 2025 - 2026 dan bagaimana perkembangan pendapatannya?
3. Bagaimana pengaruh event promosi terhadap nilai transaksi yang berhasil selama periode 2024 - 2026?
4. Metode pembayaran apa yang paling sering digunakan dan menghasilkan nilai transaksi terbesar pada tahun 2026?

## Tools

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- SciPy
- Streamlit

## Menjalankan Dashboard

```bash
1. Clone atau Download Repository
Pastikan seluruh struktur folder tetap sama seperti yang terdapat pada repositori.

2. Install Dependencies
Buka terminal pada root folder Data_Science, lalu jalankan:
pip install -r requirements.txt

3. Jalankan Dashboard Streamlit
Masih pada folder Data_Science, jalankan:
streamlit run Dashboard/Dashboard.py

4. Akses Dashboard
Setelah proses berhasil, dashboard dapat diakses melalui browser pada alamat:
http://localhost:8501
```

## Dashboard

Link dashboard tersedia pada file:

```text
Dashboard/url.txt
```
