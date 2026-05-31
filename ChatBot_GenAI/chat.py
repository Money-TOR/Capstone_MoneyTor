from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

system_prompt = """
Kamu adalah Financial Assistant AI.

Tugasmu:
- Menjawab pertanyaan tentang keuangan
- Menjawab pertanyaan tentang bisnis
- Menjawab pertanyaan tentang investasi
- Menjawab pertanyaan tentang akuntansi
- Gunakan Bahasa Indonesia
- Berikan jawaban yang jelas dan profesional
"""

chat = client.chats.create(
    model="gemini-3.1-flash-lite",
    config=types.GenerateContentConfig(
        system_instruction=system_prompt
    )
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(data: ChatRequest):

    response = chat.send_message(data.message)

    return {
        "response": response.text
    }