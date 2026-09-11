import httpx
from app.config import settings

class GeminiClient:
    def __init__(self):
        self.headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": settings.GEMINI_API_KEY
        }
        # Primary endpoint and fallback endpoint
        self.primary_url = settings.GEMINI_API_URL
        self.fallback_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def _post_with_fallback(self, payload: dict) -> dict:
        # Increase read timeout to 120s for processing audio over mobile networks
        timeout_config = httpx.Timeout(120.0, connect=20.0, read=120.0)
        async with httpx.AsyncClient(timeout=timeout_config) as client:
            resp = await client.post(self.primary_url, headers=self.headers, json=payload)
            if resp.status_code == 404:
                print(f"[GEMINI WARNING] Primary model 404, falling back to gemini-1.5-flash...")
                resp = await client.post(self.fallback_url, headers=self.headers, json=payload)

            if resp.status_code != 200:
                print(f"[GEMINI ERROR] {resp.status_code}: {resp.text}")
                raise Exception(f"Google API HTTP {resp.status_code}: {resp.text}")

            return resp.json()

    async def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        data = await self._post_with_fallback(payload)
        return data["candidates"][0]["content"]["parts"][0]["text"]

    async def transcribe_audio(self, audio_base64: str, mime_type: str = "audio/webm") -> str:
        prompt = (
            "You are an expert Bangla speech-to-text transcriber for Bangladesh legal aid. "
            "Accurately transcribe the attached spoken audio into clean Bangla text. "
            "Do NOT summarize, invent, or translate to English. Return only the verbatim Bangla transcript."
        )

        # Gemini supports: audio/wav, audio/mp3, audio/ogg, audio/webm, audio/aac
        # Clean mime type
        clean_mime = mime_type.split(";")[0].strip()
        if "webm" in clean_mime:
            clean_mime = "audio/webm"
        elif "wav" in clean_mime:
            clean_mime = "audio/wav"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": clean_mime,
                                "data": audio_base64
                            }
                        }
                    ]
                }
            ]
        }

        data = await self._post_with_fallback(payload)
        
        candidates = data.get("candidates", [])
        if not candidates:
            raise Exception("Gemini returned no candidates for audio transcription.")

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts or "text" not in parts[0]:
            finish_reason = candidates[0].get("finishReason", "UNKNOWN")
            raise Exception(f"Gemini did not return text (Finish reason: {finish_reason})")

        return parts[0]["text"].strip()

gemini_client = GeminiClient()