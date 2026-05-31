"""
Multi-language translation and speech services for the BlueCollar chatbot.
Supports 100+ languages with Indian language priority.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Language code → display name mapping (primary Indian + global)
SUPPORTED_LANGUAGES: dict[str, str] = {
    "hi": "Hindi", "bn": "Bengali", "te": "Telugu", "ta": "Tamil",
    "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam",
    "pa": "Punjabi", "or": "Odia", "as": "Assamese", "ur": "Urdu",
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "zh-cn": "Chinese", "ar": "Arabic", "ru": "Russian", "ja": "Japanese",
    "ko": "Korean", "pt": "Portuguese", "it": "Italian", "tr": "Turkish",
}

# Polly voice IDs for TTS (AWS Polly / gTTS fallback)
VOICE_MAP: dict[str, str] = {
    "hi": "Aditi", "en": "Joanna", "ta": "default",
    "te": "default", "bn": "default", "mr": "default",
}


class TranslationService:
    """
    Wraps deep-translator (Google Translate) with a graceful fallback.
    Import is deferred so the service starts even if the library is absent
    (useful during local dev without internet).
    """

    def detect_language(self, text: str) -> str:
        try:
            import langdetect
            return langdetect.detect(text)
        except Exception:
            return "en"

    def translate(self, text: str, target_lang: str, source_lang: str = "auto") -> str:
        if target_lang == "en" and source_lang in ("en", "auto"):
            return text
        try:
            from deep_translator import GoogleTranslator
            translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            return translated or text
        except Exception as exc:
            logger.warning("Translation failed (%s→%s): %s", source_lang, target_lang, exc)
            return text  # return original on failure

    # ------------------------------------------------------------------
    # Voice helpers (gTTS — offline-friendly)
    # ------------------------------------------------------------------
    def text_to_speech_bytes(self, text: str, lang: str = "en") -> Optional[bytes]:
        try:
            from gtts import gTTS
            import io
            tts = gTTS(text=text, lang=lang, slow=False)
            buf = io.BytesIO()
            tts.write_to_fp(buf)
            return buf.getvalue()
        except Exception as exc:
            logger.warning("TTS failed: %s", exc)
            return None

    def speech_to_text(self, audio_bytes: bytes, language: str = "en") -> str:
        """
        Transcribe audio using OpenAI Whisper (local model).
        Falls back to empty string if Whisper is unavailable.
        """
        try:
            import whisper, tempfile, os
            model = whisper.load_model("base")
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            result = model.transcribe(tmp_path, language=language)
            os.unlink(tmp_path)
            return result.get("text", "")
        except Exception as exc:
            logger.warning("STT failed: %s", exc)
            return ""
