# AI Projects Collection

Repository ini berisi beberapa proyek berbasis Artificial Intelligence:

1. Chatbot AI (Google Gemini API)
2. Sistem Rekomendasi Produk (Deep Learning TensorFlow)
3. Chatbot Rule-Based (PyTorch + NLP)

---

# 1. Chatbot AI

## Membuat Virtual Environment

```bash
python -m venv venv
```

## Aktivasi Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / MacOS

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install fastapi uvicorn google-genai python-dotenv
```

## Menjalankan Aplikasi

```bash
uvicorn chat:app --reload
```

Aplikasi akan berjalan pada:

```text
http://127.0.0.1:8000
```

---

# 2. Sistem Rekomendasi Produk

## Membuat Virtual Environment

```bash
python -m venv venv
```

## Aktivasi Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / MacOS

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install pandas numpy scikit-learn tensorflow fastapi uvicorn
pip install tensorboard tensorflow
```

## Training Model

```bash
python train.py
```

## Menjalankan Inference

```bash
python inference.py
```

## Mengatasi Error pkg_resources

Jika muncul error terkait `pkg_resources`, jalankan:

```bash
pip install setuptools==69.5.1
```

Verifikasi instalasi:

```bash
python -c "import pkg_resources; print('OK')"
```

## Menjalankan TensorBoard

```bash
tensorboard --logdir logs
```

TensorBoard dapat diakses melalui:

```text
http://localhost:6006
```

## Menjalankan REST API

```bash
uvicorn api:app --reload
```

REST API berjalan pada:

```text
http://127.0.0.1:8000
```

---

# 3. Chatbot Rule-Based

## Membuat Virtual Environment

```bash
python -m venv venv
```

## Aktivasi Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

atau

```bash
. venv/Scripts/activate
```

### Linux / MacOS

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install Flask torch torchvision nltk Sastrawi
```

## Download Dataset NLTK

Masuk ke Python:

```bash
python
```

Kemudian jalankan:

```python
import nltk
nltk.download('punkt_tab')
quit()
```

## Training Model

```bash
python train.py
```

## Menjalankan Chatbot

```bash
python chat.py
```

---

# Struktur Folder (Contoh)

```text
project/
│
├── chatbot-ai/
│   ├── chat.py
│   ├── .env
│   └── requirements.txt
│
├── recommendation-system/
│   ├── train.py
│   ├── inference.py
│   ├── api.py
│   └── logs/
│
├── chatbot-rulebased/
│   ├── train.py
│   ├── chat.py
│   └── intents.json
│
└── README.md
```

---

# Requirements

* Python 3.10+
* FastAPI
* TensorFlow
* PyTorch
* Google GenAI SDK
* NLTK
* Sastrawi
