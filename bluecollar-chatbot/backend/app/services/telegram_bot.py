"""
Telegram Bot integration for BlueCollar Chatbot (Sahayak).
Uses python-telegram-bot v20+ (async).
Run standalone: python -m app.services.telegram_bot
"""
import asyncio
import logging
import os

from .chatbot_engine import ChatbotEngine

logger = logging.getLogger(__name__)
engine = ChatbotEngine()


async def start_telegram_bot():
    try:
        from telegram import Update, ReplyKeyboardMarkup
        from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
    except ImportError:
        logger.error("python-telegram-bot not installed. Run: pip install python-telegram-bot==20.7")
        return

    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not set in environment.")
        return

    # ── Handlers ────────────────────────────────────────────────────────────

    async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        keyboard = [["🔍 Find Worker", "📋 My Bookings"], ["💰 Wallet", "🎧 Support"]]
        markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        await update.message.reply_text(
            "🙏 Namaste! I'm *Sahayak* — your BlueCollar assistant.\n\n"
            "I can help you find workers, manage bookings, check payments, and more.\n"
            "Just type your question or pick an option below!",
            parse_mode="Markdown",
            reply_markup=markup,
        )

    async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "*Available commands:*\n"
            "/start — Main menu\n"
            "/help — This message\n"
            "/bookings — My bookings\n"
            "/wallet — Wallet balance\n"
            "/jobs — Available jobs (workers)\n"
            "/earnings — Today's earnings (workers)\n"
            "/metrics — Platform metrics (admins)\n",
            parse_mode="Markdown",
        )

    async def cmd_bookings(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await _process(update, "my bookings", "customer")

    async def cmd_wallet(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await _process(update, "wallet balance", "customer")

    async def cmd_jobs(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await _process(update, "show available jobs", "worker")

    async def cmd_earnings(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await _process(update, "how much earned today", "worker")

    async def cmd_metrics(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await _process(update, "show me metrics", "admin")

    async def handle_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        # Map keyboard shortcuts
        text_map = {
            "🔍 Find Worker": "find worker",
            "📋 My Bookings": "my bookings",
            "💰 Wallet": "wallet balance",
            "🎧 Support": "help",
        }
        text = text_map.get(update.message.text, update.message.text)
        await _process(update, text, ctx.user_data.get("user_type", "customer"))

    async def handle_voice(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        """Download voice message, transcribe, then process."""
        await update.message.reply_text("🎙️ Processing your voice message...")
        try:
            file = await update.message.voice.get_file()
            audio_bytes = await file.download_as_bytearray()
            from .translation_service import TranslationService
            ts = TranslationService()
            text = ts.speech_to_text(bytes(audio_bytes))
            if text:
                await _process(update, text, ctx.user_data.get("user_type", "customer"))
            else:
                await update.message.reply_text("Sorry, I couldn't understand the audio. Please try typing.")
        except Exception as exc:
            logger.error("Voice processing error: %s", exc)
            await update.message.reply_text("Voice processing failed. Please type your message.")

    async def _process(update: Update, text: str, user_type: str):
        user_id = str(update.effective_user.id)
        await update.message.chat.send_action("typing")
        result = await engine.process_message(
            user_id=user_id,
            message=text,
            user_type=user_type,
            language="en",
            session_id=f"tg-{user_id}",
        )
        response = result["response"]
        # Telegram max message length is 4096
        for chunk in [response[i:i+4000] for i in range(0, len(response), 4000)]:
            await update.message.reply_text(chunk)

    # ── Build & run app ──────────────────────────────────────────────────────
    app = (
        Application.builder()
        .token(token)
        .build()
    )
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("bookings", cmd_bookings))
    app.add_handler(CommandHandler("wallet", cmd_wallet))
    app.add_handler(CommandHandler("jobs", cmd_jobs))
    app.add_handler(CommandHandler("earnings", cmd_earnings))
    app.add_handler(CommandHandler("metrics", cmd_metrics))
    app.add_handler(MessageHandler(filters.VOICE, handle_voice))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Telegram bot starting (polling)...")
    await app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(start_telegram_bot())
