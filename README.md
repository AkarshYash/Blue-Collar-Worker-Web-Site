# 🔧 BlueCollar AI — Enterprise-Grade AI-Powered Workforce Marketplace

<div align="center">

![BlueCollar AI](https://img.shields.io/badge/BlueCollar-AI%20Marketplace-6366f1?style=for-the-badge&logo=lightning&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG%20Engine-121212?style=for-the-badge&logo=chainlink&logoColor=white)
![Groq LLM](https://img.shields.io/badge/Groq-LLM%20Inference-F54E42?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI%20Framework-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Blockchain](https://img.shields.io/badge/Blockchain-Verification-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)

**A voice-first, AI-powered, blockchain-verified Indian blue-collar hiring marketplace.**  
Built with Python · FastAPI · RAG · LLM · NLP · Machine Learning · HTML · TailwindCSS

</div>

---

## 📌 What Is This Project?

**BlueCollar AI** is a full-stack, industry-level workforce marketplace designed specifically for **India's blue-collar sector** — plumbers, electricians, carpenters, mechanics, painters, and more.

It solves a real-world problem: **connecting skilled workers with clients instantly, intelligently, and safely.** The platform uses cutting-edge AI, Machine Learning, RAG (Retrieval-Augmented Generation), and Blockchain to go far beyond a simple job board.

> 🎯 **Target Users:** Clients who need skilled workers + Workers who want jobs + Admins who manage the platform.

---

## 🗺️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BLUECOLLAR AI PLATFORM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CLIENT BROWSER                    WORKER BROWSER                       │
│  ┌──────────────┐                  ┌──────────────┐                     │
│  │ index.html   │                  │ worker.html  │                     │
│  │ customer.html│                  │ (Dashboard,  │                     │
│  │ (Search, Book│                  │  Quiz, Lang  │                     │
│  │  Voice, Chat)│                  │  Profile)    │                     │
│  └──────┬───────┘                  └──────┬───────┘                     │
│         │  HTTP / REST API                │                             │
│  ┌──────▼─────────────────────────────────▼────────────────────────┐    │
│  │                    FastAPI Backend (Port 8001)                   │   │
│  │   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │     │
│  │   │/api/     │  │/api/     │  │/api/      │  │/api/         │  │     │
│  │   │workers/  │  │bookings/ │  │chatbot/   │  │workers/      │  │     │
│  │   │(Search,  │  │(Booking, │  │(RAG Chat, │  │verify/,quiz/ │  │     │
│  │   │ ML Score)│  │ Escrow)  │  │ LLM,Trans)│  │(Blockchain,  │  │     │
│  │   └──────────┘  └──────────┘  └───────────┘  │ AI Quiz)     │  │     │
│  │                                               └──────────────┘  │    │
│  └─────────────────────────┬───────────────────────────────────────┘    │
│                            │                                            │
│  ┌─────────────────────────▼───────────────────────────────────────┐    │
│  │                        DATA LAYER                               │    │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────────────────┐  │    │
│  │  │ SQLite DB   │  │ CSV Worker │  │  In-Memory Vector Index  │  │    │
│  │  │ (Bookings,  │  │ Database   │  │  (500 worker embeddings) │  │    │
│  │  │  Verify,    │  │ (500 rows) │  │                          │  │    │
│  │  │  Quiz Scores│  │            │  │                          │  │    │
│  │  └─────────────┘  └────────────┘  └──────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              AI / ML / RAG ENGINE LAYER                         │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │     │
│  │  │ Groq LLM │ │LangChain │ │Sentence  │ │ NLP Intent Parser  │ │     │
│  │  │(llama3)  │ │   RAG    │ │Transform-│ │ Synonym Map        │ │     │
│  │  │          │ │ Pipeline │ │   ers    │ │ Typo Tolerator     │ │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │     │
│  │  │ Pricing  │ │ Sigmoid  │ │ Review   │ │ Deep Translator    │ │     │ 
│  │  │Regression│ │Classifier│ │ Auth     │ │ (9 Indian langs)   │ │     │
│  │  │   ML     │ │   ML     │ │ Detector │ │                    │ │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │     │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │         CHATBOT SERVICE (Port 8000) — bluecollar-chatbot/       │    │
│  │  LangChain · Pinecone · Sentence Transformers · Groq · Twilio   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Full Project File Structure

```
bluecollar-platform/
│
├── 📄 README.md                        ← This documentation file
├── 🔒 .env                             ← API keys and secrets (not committed)
├── 🔒 .env.example                     ← Template for environment setup
├── 🐳 docker-compose.yml               ← Docker multi-service orchestration
├── ▶️  run_app.bat                      ← Windows launcher (opens both servers)
├── ▶️  start_project.bat               ← Alternative startup script
├── 🧹 cleanup_and_run.bat              ← Clean DB + restart servers
├── 📊 blue_collar_workers_500.csv      ← Main worker database (500 records)
│
├── backend/                            ← Main FastAPI application
│   ├── Dockerfile                      ← Docker container config
│   ├── requirements.txt                ← Python dependencies
│   └── app/
│       ├── main.py                     ← FastAPI app entry point, CORS, routers
│       ├── __init__.py
│       ├── api/
│       │   ├── workers.py              ← AI Search, ML scoring, Quiz, Blockchain
│       │   ├── bookings.py             ← Booking creation, escrow, acceptance
│       │   └── chatbot.py              ← RAG chatbot, LLM, translation endpoints
│       └── templates/
│           ├── index.html              ← Homepage: hero, search, chatbot, stats
│           ├── customer.html           ← Client portal: search results, booking
│           ├── worker.html             ← Worker dashboard: jobs, quiz, languages
│           └── admin.html              ← Admin portal: analytics, KYC, payouts
│
└── bluecollar-chatbot/                 ← Advanced standalone chatbot service
    ├── backend/
    │   ├── app/
    │   │   ├── main.py                 ← Chatbot FastAPI app
    │   │   ├── api/
    │   │   │   ├── chatbot.py          ← WebSocket + REST chat endpoints
    │   │   │   ├── analytics.py        ← Usage analytics API
    │   │   │   ├── auth.py             ← JWT authentication
    │   │   │   └── conversations.py    ← Session management
    │   │   ├── services/
    │   │   │   ├── chatbot_engine.py   ← Core LLM orchestration (Groq + LangChain)
    │   │   │   ├── rag_service.py      ← RAG pipeline (Pinecone vector DB)
    │   │   │   ├── intent_classifier.py← ML intent detection
    │   │   │   ├── translation_service.py ← Multilingual translation
    │   │   │   ├── moderation.py       ← Content safety filter
    │   │   │   ├── action_handlers.py  ← Booking/search action handlers
    │   │   │   ├── sms_chatbot.py      ← Twilio SMS integration
    │   │   │   └── telegram_bot.py     ← Telegram bot integration
    │   │   └── models/
    │   │       ├── database.py         ← Async SQLAlchemy setup
    │   │       └── db_models.py        ← Conversation, session DB models
    │   └── migrations/                 ← Alembic DB migration scripts
    ├── frontend/                       ← React + Vite admin chatbot dashboard
    │   └── src/
    │       ├── pages/                  ← Dashboard, Analytics, Sessions pages
    │       └── components/             ← ChatbotWidget, MessageBubble, etc.
    └── website/                        ← Static HTML chatbot demo site
        ├── index.html
        ├── workers.html
        ├── booking.html
        ├── dashboard-customer.html
        ├── dashboard-worker.html
        ├── admin.html
        ├── css/
        │   ├── global.css
        │   └── chatbot.css
        └── js/
            └── chatbot.js
```

---

## 🛠️ Complete Tech Stack — Explained

### 🐍 Python (Backend Core Language)
| Library | Version | What It Does Here |
|---|---|---|
| `fastapi` | 0.111.0 | Web framework — powers all REST API routes |
| `uvicorn` | 0.29.0 | ASGI server — runs FastAPI at lightning speed |
| `pydantic` | 2.7.1 | Data validation — validates all API request/response schemas |
| `sqlalchemy` | 2.0.30 | ORM — maps Python classes to SQLite database tables |
| `aiosqlite` | 0.20.0 | Async SQLite driver — non-blocking database queries |
| `python-dotenv` | 1.0.1 | Loads `.env` secrets (API keys) at runtime |
| `httpx` | 0.27.0 | Async HTTP client — makes requests to external APIs |
| `redis` | 5.0.4 | In-memory cache — sessions, rate limiting, quick lookups |
| `python-multipart` | 0.0.9 | File uploads (KYC documents, profile images) |

---

### 🤖 AI — Large Language Model (LLM)
| Library | Version | What It Does Here |
|---|---|---|
| `groq` | 0.9.0 | **Main LLM API** — connects to Groq's ultra-fast inference engine running **Llama 3** |
| `langchain` | 0.2.1 | LLM orchestration framework — chains prompts, tools, memory together |
| `langchain-groq` | 0.1.3 | LangChain adapter for the Groq LLM provider |
| `langchain-community` | 0.2.1 | Community tools: document loaders, vector store connectors |

**Where LLM is used:**
- `backend/app/api/chatbot.py` — **Sahayak chatbot** sends user queries to Groq LLM
- `bluecollar-chatbot/backend/app/services/chatbot_engine.py` — Full LangChain conversation chain with system prompt, memory, and tool use

**System Prompt (simplified):**
```
You are Sahayak, an AI assistant for BlueCollar marketplace.
You help clients find workers, answer pricing questions,
compare workers, and explain platform policies.
Always answer in the user's detected language.
```

---

### 🧠 RAG — Retrieval-Augmented Generation

RAG = **Retrieve relevant worker data** → **Augment the LLM prompt** → **Generate an accurate answer**

Without RAG, the LLM would hallucinate or give generic answers. With RAG, it answers based on **real worker profiles from the database.**

```
User Query: "Which plumber in Noida has best rating under ₹500?"
      ↓
[Step 1 — Retrieve]  Search vector DB → Top 5 matching worker profiles
      ↓
[Step 2 — Augment]   Inject profiles into LLM context/prompt
      ↓
[Step 3 — Generate]  LLM generates a specific, accurate answer with names & prices
```

| Library | Version | Role in RAG |
|---|---|---|
| `pinecone-client` | 3.2.2 | Vector database — stores worker profile embeddings for similarity search |
| `sentence-transformers` | 2.7.0 | Creates **vector embeddings** from text (converts "plumber in Delhi" → a 384-dim vector) |
| `langchain` | 0.2.1 | Orchestrates the retrieve → augment → generate pipeline |

**Files:**
- `bluecollar-chatbot/backend/app/services/rag_service.py` — Full RAG pipeline
- `backend/app/api/chatbot.py` — Simplified in-memory RAG for main platform

---

### 📊 Machine Learning (ML) Models

All ML runs **in Python without external ML frameworks** — pure mathematical implementations:

#### 1. 🔍 Weighted Match Score (Multi-Criteria Scoring)
```python
# In: backend/app/api/workers.py
match_score = (
    skill_match   * 0.35 +   # Skill relevance weight
    budget_match  * 0.25 +   # Budget fit weight
    rating_score  * 0.20 +   # Worker rating weight
    distance_score* 0.15 +   # Proximity weight
    availability  * 0.05     # Availability weight
) * 100
```
Returns a **0–100% match percentage** shown on each worker card.

#### 2. 💰 Price Prediction Regression
```python
# Linear regression model for fair pricing
predicted_rate = base_rate + (experience_years * 15) + (rating * 45) ± city_index
```
Tells clients the **expected fair price** before they even contact a worker.

#### 3. 📈 Hiring Success Probability (Sigmoid Classifier)
```python
# Sigmoid activation function
z = (1.8 * rating) + (0.12 * experience) + (0.005 * reviews) - (0.25 * distance) - 7.5
probability = 100 / (1 + e^(-z))
```
Calculates the **probability (%) that a worker will complete the job successfully.**

#### 4. 🔎 NLP Intent Parser
```python
# Keyword synonym expansion
synonyms = {
    "pipe": "plumber", "leak": "plumber", "tap": "plumber",
    "shock": "electrician", "wiring": "electrician",
    "furniture": "carpenter", "wood": "carpenter"
}
# Typo tolerance via edit-distance fuzzy matching
```
Translates messy client queries into structured search parameters.

#### 5. 🚩 Review Authenticity Detector
```python
# Flags suspicious review patterns
if review_count > 200 and avg_length < 15:
    flag = "Possible Bulk Reviews"
```
Detects fake/spam reviews and flags them in the admin panel.

---

### 🌐 NLP & Translation

| Library | Version | Purpose |
|---|---|---|
| `langdetect` | 1.0.9 | Auto-detects language of user input (Hindi, English, Marathi, etc.) |
| `deep-translator` | 1.11.4 | Translates the UI into 9 Indian regional languages |
| `openai-whisper` | 20231117 | Speech-to-text — transcribes voice search recordings |
| `gTTS` | 2.5.1 | Text-to-speech — reads chatbot responses aloud |

**Languages Supported:** English · Hindi · Gujarati · Punjabi · Bengali · Tamil · Telugu · Kannada · Marathi

---

### 🔗 Blockchain Verification (Simulated)

Not a real blockchain, but a **cryptographic simulation** that demonstrates exactly how blockchain identity verification works:

```
Worker submits PAN/Aadhaar number
          ↓
Admin reviews in admin portal → clicks "Approve"
          ↓
SHA-256 hash computed from (worker_id + doc_number + timestamp)
          ↓
Merkle root calculated from current block hashes
          ↓
New block appended: { index, hash, prev_hash, merkle_root, timestamp }
          ↓
Worker profile gets "✅ On-Chain Identity Verified" badge
          ↓
Badge shown on search results — boosts trust score +20%
```

**Files:** `backend/app/api/workers.py` (verify endpoints) · `backend/app/templates/worker.html` (mining UI)

---

### 🌐 Frontend — HTML + CSS + JavaScript

| Technology | Where Used | Purpose |
|---|---|---|
| **HTML5** | All 4 template files | Page structure, semantic markup |
| **TailwindCSS** (CDN) | All templates | Utility-first CSS framework — rapid responsive styling |
| **Vanilla JavaScript** | All templates | Fetch API calls, DOM updates, animations |
| **Web Speech API** | `index.html` | Voice search — microphone input → text query |
| **SpeechSynthesis API** | `index.html` | Read chatbot replies aloud in Indian English/Hindi |
| **Custom CSS (glassmorphism)** | All templates | Dark mode glass cards, glow effects, animations |
| **Inline SVG Charts** | `admin.html` | Bar charts, line graphs, donut charts — no Chart.js needed |
| **localStorage** | `index.html` | Persists dark/light theme preference across page loads |

#### 🎨 Design System
```css
/* Core dark palette */
Background:   #020617  (near-black slate)
Primary:      #6366f1  (indigo)
Secondary:    #a855f7  (purple)
Accent:       #10b981  (emerald green)
Text:         #f8fafc  (white)

/* Glassmorphism cards */
background: rgba(15, 23, 42, 0.45);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

---

### 🗄️ Database

| Storage | Technology | Data Stored |
|---|---|---|
| **Worker Profiles** | CSV file (500 rows) | Name, designation, rating, hourly rate, city, languages, payment method |
| **Bookings & Escrow** | SQLite (async) | Booking records, customer info, payment status, worker acceptance |
| **Verification Records** | SQLite (async) | KYC submissions, blockchain block hashes, approval status |
| **Quiz Results** | SQLite (async) | Worker quiz scores, certification tier, timestamp |
| **Chat Sessions** | SQLite (async) | Conversation history, user sessions, message logs |
| **Cache** | Redis | Rate limiting, session tokens, fast lookups |

#### Worker Database Schema (CSV columns):
```
worker_id | full_name | designation | rating | reviews_count | hourly_rate_inr |
experience_years | mobile_number | state | city | languages_known |
payment_method | availability | profile_summary
```

---

## 🌟 Complete Feature List

### 👤 For Clients (customer.html + index.html)

| Feature | Technology Used | Description |
|---|---|---|
| **🔍 AI Smart Search** | Python NLP + ML | Type naturally: "Hindi plumber Noida under ₹600" — AI parses intent and returns ranked matches |
| **🎤 Voice Search** | Web Speech API | Speak your requirement in Hindi or English — auto-transcribed to text |
| **📊 Match Score (%)** | ML Weighted Scoring | Every worker shown with 0-100% match relevance score |
| **💰 Price Prediction** | Linear Regression ML | See estimated fair price before contacting worker |
| **📈 Success Probability** | Sigmoid Classifier ML | Know the % chance a worker completes your job |
| **💬 Sahayak AI Chatbot** | Groq LLM + RAG | Ask anything — compare workers, get pricing advice, book directly |
| **📅 Book & Escrow** | FastAPI + SQLite | Book a worker, pay advance into escrow — released on job completion |
| **🌐 9 Language UI** | Deep Translator + langdetect | Full UI translation into Hindi, Gujarati, Punjabi, Bengali, Tamil, Telugu, Kannada, Marathi |
| **🌗 Dark/Light Theme** | CSS Variables + localStorage | Toggle between dark space theme and clean light mode |
| **🚨 Emergency Booking** | FastAPI | Flag a booking as urgent — notifies nearby workers with +50% rate incentive |

### 👷 For Workers (worker.html)

| Feature | Technology Used | Description |
|---|---|---|
| **📊 Dispatch Board** | JavaScript + REST API | See incoming job requests from nearby clients in real-time |
| **⚡ Emergency Mode** | JavaScript | Toggle emergency shift — bumps hourly rates +50% for urgent jobs |
| **💰 Escrow Wallet** | FastAPI + SQLite | View earnings balance, request UPI payout of escrowed funds |
| **🆔 Blockchain Verification** | SHA-256 + Merkle Trees | Submit PAN/Aadhaar → admin approves → verified badge added to profile |
| **🎓 AI Skill Quiz** | Python + Groq LLM | Take a technical quiz in your trade category → earn certification tier |
| **🗣️ Language Profile** | JavaScript | Display languages spoken (Hindi, Marathi, English, Gujarati, etc.) with proficiency level |
| **👤 Profile Config** | JavaScript + REST API | Update name, skill, phone, city — syncs live across all views |

### 🔑 For Admins (admin.html)

| Feature | Technology Used | Description |
|---|---|---|
| **📊 Live Analytics** | SVG Charts + FastAPI | Real-time worker stats, bookings, revenue charts drawn with custom SVGs |
| **👁️ KYC Approval Queue** | FastAPI + SQLite | Review worker documents, approve/reject identity verification |
| **⛓️ Block Mining Console** | SHA-256 + Python | Approve verification → triggers live mining animation → commits block to ledger |
| **💵 Escrow Management** | FastAPI + SQLite | Release or refund escrowed payments, resolve disputes |
| **📋 All Bookings View** | FastAPI + SQLite | See all platform bookings with status (pending/accepted/completed) |
| **🚩 Fraud Detection** | ML Pattern Analysis | Flags workers with suspicious review patterns or abnormal activity |

### 🤖 AI Chatbot Service (bluecollar-chatbot/)

| Feature | Technology Used | Description |
|---|---|---|
| **💬 Conversational AI** | Groq LLM (Llama 3) | Natural conversation about workers, pricing, bookings |
| **🔗 RAG Pipeline** | Pinecone + Sentence Transformers | Retrieves relevant worker data to ground LLM responses in facts |
| **🌐 WebSocket Chat** | FastAPI WebSockets | Real-time streaming chat responses |
| **📱 SMS Bot** | Twilio API | Chat with the AI via SMS text messages |
| **✈️ Telegram Bot** | python-telegram-bot | Full chatbot accessible on Telegram |
| **🔐 Auth System** | JWT + bcrypt | Secure login for admin chatbot dashboard |
| **📈 Analytics Dashboard** | React + Vite | Admin panel showing chat volumes, intents, sessions |
| **🚦 Rate Limiting** | Redis | Prevents API abuse, limits requests per user |
| **🛡️ Content Moderation** | Python NLP | Filters inappropriate messages before LLM processing |
| **🌍 Auto Translation** | Deep Translator | Detects user language and responds in same language |
| **📊 Prometheus Monitoring** | prometheus-client | Tracks API latency, error rates, request counts |

---

## 🔄 Data Flow — How A Search Works

```
1. User types: "need a Hindi speaking electrician in Noida under ₹500"
   
2. [NLP Parser] (backend/app/api/workers.py)
   - Detects skill: "electrician" (+ synonym: "shock" → electrician)
   - Detects budget: ₹500
   - Detects language: "Hindi"
   - Detects location: "Noida"

3. [Database Query] (blue_collar_workers_500.csv → SQLite)
   - Filter: designation = electrician
   - Filter: hourly_rate_inr ≤ 500
   - Filter: languages_known contains "Hindi"
   - Filter: city = Noida

4. [ML Scoring] (weighted match algorithm)
   - Calculate match score for each result (0-100%)
   - Run price regression → predicted fair rate
   - Run sigmoid → hiring success probability
   - Sort by match score descending

5. [API Response] → JSON array of ranked workers

6. [Frontend] (customer.html)
   - Renders worker cards with match %, price, success probability
   - Shows "AI Recommended" badge on top result
```

---

## 📡 All API Endpoints

### Workers API (`/api/workers/`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workers/search?q={query}` | AI-powered NLP search with ML scoring |
| `GET` | `/api/workers/` | List all workers with filters |
| `GET` | `/api/workers/{id}` | Single worker profile with ML scores |
| `POST` | `/api/workers/predict-price` | ML price prediction for a service |
| `GET` | `/api/workers/quiz/{category}` | Fetch quiz questions for a trade category |
| `POST` | `/api/workers/quiz/submit` | Submit quiz score → update certification |
| `POST` | `/api/workers/verify/submit` | Submit KYC document for verification |
| `POST` | `/api/workers/verify/approve/{id}` | Admin: approve KYC → mine blockchain block |
| `POST` | `/api/workers/translate` | Translate text to target language |

### Bookings API (`/api/bookings/`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings/` | Create new booking with escrow |
| `GET` | `/api/bookings/` | List all bookings |
| `POST` | `/api/bookings/{id}/accept` | Worker accepts job |
| `POST` | `/api/bookings/{id}/complete` | Mark job complete → release escrow |

### Chatbot API (`/api/chatbot/`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chatbot/message` | Send message → get RAG + LLM response |
| `GET` | `/api/chatbot/suggestions` | Get smart quick-reply suggestions |
| `POST` | `/api/chatbot/voice-review` | Submit voice review (speech-to-text) |

---

## ⚙️ Environment Variables (.env)

```env
# LLM Provider
GROQ_API_KEY=your_groq_api_key_here

# Vector Database (for full RAG)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENV=us-east-1-aws

# Translation (optional — uses free tier by default)
GOOGLE_TRANSLATE_KEY=optional

# SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_bot_token

# App Config
SECRET_KEY=your_random_secret_key
DATABASE_URL=sqlite+aiosqlite:///./bluecollar.db
REDIS_URL=redis://localhost:6379
```

---
## 🎥 Video Demo

<div align="center">
  <a href="https://drive.google.com/file/d/1dYgF3H2GvtUGvK-G_ohqxRE53gs5BN1c/view?usp=drive_link" target="_blank">
    <img src="https://drive.google.com/thumbnail?id=1Q45-azbInJQ6QVOnnhaSdOGoDT4tVv4U&sz=w1920" 
         alt="Sahayak AI Chatbot Demo - Click to Watch"
         style="border-radius: 16px; border: 2px solid #333; width: 100%; max-width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: transform 0.2s;"
         onmouseover="this.style.transform='scale(1.02)'"
         onmouseout="this.style.transform='scale(1)'">
  </a>
</div>

<div align="center">
  <br>
  <a href="https://drive.google.com/file/d/1dYgF3H2GvtUGvK-G_ohqxRE53gs5BN1c/view?usp=drive_link" target="_blank">
    <img src="https://img.shields.io/badge/▶️_Click_to_Watch_Video_Demo-FF0000?style=for-the-badge&logo=googledrive&logoColor=white" alt="Watch on Google Drive">
  </a>
</div>

---

## 📈 Platform Statistics

| Metric | Value |
|---|---|
| Worker Database Size | 500 verified profiles |
| Supported Languages | 9 Indian regional languages |
| API Endpoints | 15+ REST endpoints |
| ML Models | 4 (Match Score, Price Regression, Sigmoid, Review Auth) |
| Pages / Views | 4 (Home, Customer, Worker, Admin) |
| LLM Provider | Groq (Llama 3 — fastest open-source LLM) |
| Blockchain Algorithm | SHA-256 + Merkle Tree |
| Response Time | < 200ms (Groq inference) |

---

## 🧪 Testing

```powershell
# Run chatbot service tests
cd bluecollar-chatbot/backend
pytest tests/ -v

# Smoke test
python smoke_test.py
```

---

## 🏗️ Built With

| Category | Technologies |
|---|---|
| **Language** | Python 3.9+ |
| **Backend Framework** | FastAPI, Uvicorn, Pydantic |
| **LLM** | Groq API (Llama 3-8B / 70B) |
| **RAG** | LangChain + Pinecone + Sentence Transformers |
| **NLP** | langdetect, deep-translator, custom synonym engine |
| **ML** | Custom Python (regression, sigmoid, cosine similarity) |
| **Database** | SQLite (aiosqlite + SQLAlchemy) |
| **Cache** | Redis |
| **Frontend** | HTML5, TailwindCSS (CDN), Vanilla JS |
| **Voice** | Web Speech API, SpeechSynthesis API, OpenAI Whisper, gTTS |
| **Blockchain** | SHA-256, Merkle Trees (Python hashlib) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **SMS** | Twilio |
| **Telegram** | python-telegram-bot |
| **Monitoring** | Prometheus |
| **Containerization** | Docker, Docker Compose |
| **Version Control** | Git + GitHub |

---

## 👨‍💻 Author

**Akarsh Chaturvedi**  
🔗 GitHub: [AkarshYash](https://github.com/AkarshYash)  
📁 Repository: [Blue-Collar-Worker-Web-Site](https://github.com/AkarshYash/Blue-Collar-Worker-Web-Site)

---

*Built for portfolio demonstrations, hackathons, and investor presentations.*  
*Showcasing real-world AI, ML, RAG, Blockchain, and Full-Stack Python engineering.*
