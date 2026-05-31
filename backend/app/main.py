"""
BlueCollar AI Platform — FastAPI Backend (Serving 100% Pure-Python Full-Stack UI)
Created by Akarsh Chaturvedi
"""
from contextlib import asynccontextmanager
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")

# Import routers
from .api.chatbot import router as chatbot_router
from .api.workers import router as workers_router
from .api.bookings import router as bookings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("🚀 BlueCollar Platform starting...")
    yield
    logging.info("Shutting down.")


app = FastAPI(
    title="BlueCollar AI Platform",
    description="AI-powered blue-collar job platform by Akarsh Chaturvedi",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(workers_router, prefix="/api/workers", tags=["Workers"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])


# Helper to load HTML templates dynamically
def load_html_template(filename: str) -> str:
    template_path = os.path.join(os.path.dirname(__file__), "templates", filename)
    if os.path.exists(template_path):
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    return f"<h1>Template '{filename}' not found at: {template_path}</h1>"


@app.get("/", response_class=HTMLResponse)
async def root():
    return load_html_template("index.html")


@app.get("/customer", response_class=HTMLResponse)
async def customer_portal():
    return load_html_template("customer.html")


@app.get("/worker", response_class=HTMLResponse)
async def worker_portal():
    return load_html_template("worker.html")


@app.get("/admin", response_class=HTMLResponse)
async def admin_portal():
    return load_html_template("admin.html")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "bluecollar-platform"}

