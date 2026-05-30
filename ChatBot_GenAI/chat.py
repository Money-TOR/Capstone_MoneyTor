from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY"
)

chat = client.chats.create(
    model="gemini-2.5-flash"
)

system_prompt = """
Kamu adalah Financial Assistant AI.

Tugasmu:
- Menjawab pertanyaan tentang keuangan, bisnis, investasi, akuntansi, dan analisis data.
- Gunakan bahasa Indonesia.
- Berikan penjelasan yang jelas dan profesional.
- Jika pertanyaan di luar topik keuangan, tetap jawab dengan mengaitkannya ke perspektif bisnis atau keuangan jika memungkinkan.
"""

print("=" * 50)
print("Financial Chatbot")
print("Ketik 'exit' untuk keluar")
print("=" * 50)

# kirim instruksi sekali di awal
chat.send_message(system_prompt)

while True:

    user_input = input("\nAnda : ")

    if user_input.lower() == "exit":
        break

    response = chat.send_message(user_input)

    print("\nBot :", response.text)