chatbot AI)
python -m venv venv
source venv/Scripts/activate
pip install fastapi uvicorn google-genai python-dotenv

uvicorn chat:app --reload

=====================================
(sistem rekomendasi)

python -m venv venv

(venv)
source venv/Scripts/activate
pip install pandas numpy scikit-learn tensorflow fastapi uvicorn
pip install tensorboard tensorflow
python train.py
python inference.py
pip install setuptools==69.5.1
python -c "import pkg_resources; print('OK')"

tensorboard --logdir logs

uvicorn api:app --reload

=====================================
(chatbot Rulebased)

python -m venv venv
. venv/Scripts/activate   atau source venv/Scripts/activate

sedang di dalam (venv) 
pip install Flask torch torchvision nltk Sastrawi

python
import nltk
nltk.download('punkt_tab')
quit()

Python train.py
