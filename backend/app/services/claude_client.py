# app/services/claude_client.py
# We're replacing the Anthropic client with Gemini
# Everything else in the project stays exactly the same

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def call_claude(system_prompt: str, user_message: str, max_tokens: int = 2000) -> str:
    """
    Same function signature as before — no other file needs to change.
    Gemini combines system + user into one prompt.
    """
    full_prompt = f"{system_prompt}\n\n{user_message}"
    response = model.generate_content(full_prompt)
    return response.text