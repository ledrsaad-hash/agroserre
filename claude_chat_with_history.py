import os
import json
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
import anthropic

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    raise ValueError("ANTHROPIC_API_KEY est introuvable dans le fichier .env")

client = anthropic.Anthropic(api_key=API_KEY)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

SESSION_ID = datetime.now().strftime("%Y%m%d_%H%M%S")
SESSION_FILE = DATA_DIR / f"session_{SESSION_ID}.json"

MODEL = "claude-sonnet-4-5-20250929"

conversation_history = []


def extract_text_from_response(response) -> str:
    texts = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            texts.append(block.text)
    return "\n".join(texts).strip()


def save_session():
    payload = {
        "session_id": SESSION_ID,
        "saved_at": datetime.now().isoformat(),
        "model": MODEL,
        "history": conversation_history,
    }
    with open(SESSION_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def ask_claude(user_message: str) -> str:
    conversation_history.append({
        "role": "user",
        "content": user_message
    })

    response = client.messages.create(
        model=MODEL,
        max_tokens=1200,
        messages=conversation_history
    )

    assistant_text = extract_text_from_response(response)

    conversation_history.append({
        "role": "assistant",
        "content": assistant_text
    })

    save_session()
    return assistant_text


if __name__ == "__main__":
    print(f"Session locale : {SESSION_ID}")
    print("Écris 'exit' pour quitter.\n")

    while True:
        user_input = input("Toi : ").strip()
        if user_input.lower() in {"exit", "quit"}:
            print(f"Session sauvegardée dans : {SESSION_FILE}")
            break

        try:
            reply = ask_claude(user_input)
            print(f"\nClaude : {reply}\n")
        except Exception as e:
            print(f"\nErreur : {e}\n")