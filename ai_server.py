from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import time
from dotenv import load_dotenv

# Load dependencies from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("AI_MODEL", "gemini-2.5-flash")

if not api_key:
    print("WARNING: GEMINI_API_KEY not found in .env")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name)

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    try:
        data = request.json
        messages = data.get("messages", [])
        
        # Extract the last user message as the prompt
        prompt = ""
        for msg in messages:
            if msg.get("role") == "user":
                prompt = msg.get("content")
        
        print(f"Received Prompt: {prompt[:100]}...")

        # Generate content using Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Simple cleaning of markdown code blocks if Gemini returns them
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```sql" in response_text:
            response_text = response_text.split("```sql")[1].split("```")[0].strip()
        elif "```" in response_text:
            # Check if it's a triple backtick block
            parts = response_text.split("```")
            if len(parts) >= 3:
                response_text = parts[1].strip()
                # If the first line is a language identifier, remove it
                lines = response_text.split('\n')
                if lines and not any(c in lines[0] for c in [' ', '{', '[', '(', '=', ':', ';']):
                    response_text = '\n'.join(lines[1:]).strip()

        print(f"Gemini Response: {response_text[:100]}...")

        # Return OpenAI-compatible response
        return jsonify({
            "id": f"chatcmpl-{int(time.time())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model_name,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_text
                    },
                    "finish_reason": "stop"
                }
            ]
        })

    except Exception as e:
        error_msg = str(e)
        print(f"Error: {error_msg}")
        if "429" in error_msg or "quota" in error_msg.lower():
            return jsonify({"error": error_msg}), 429
        return jsonify({"error": error_msg}), 500

if __name__ == "__main__":
    print("=================================")
    print(f" Gemini AI SQL Server ({model_name}) Running ")
    print(" http://localhost:5001")
    print("=================================")
    app.run(port=5001, debug=False)
