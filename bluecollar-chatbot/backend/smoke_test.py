"""
Smoke test — run with: python smoke_test.py
Tests all major endpoints of the running backend.
"""
import urllib.request
import json
import sys

BASE = "http://localhost:8000"

def get(path):
    return json.loads(urllib.request.urlopen(BASE + path, timeout=5).read())

def post(path, body):
    data = json.dumps(body).encode()
    req  = urllib.request.Request(
        BASE + path, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    return json.loads(urllib.request.urlopen(req, timeout=5).read())

results = []

def check(name, fn):
    try:
        result = fn()
        if result is False:
            results.append((name, False, "assertion failed"))
        else:
            results.append((name, True, "OK"))
    except urllib.error.HTTPError as e:
        # 401 on bad login is expected — treat as pass for that test
        if "invalid" in name.lower() and e.code == 401:
            results.append((name, True, f"HTTP {e.code} (expected)"))
        else:
            results.append((name, False, f"HTTP {e.code}"))
    except Exception as e:
        results.append((name, False, str(e)[:60]))

# ── Tests ──────────────────────────────────────────────────────────────────
check("GET /health",
    lambda: get("/health")["status"] in ("ok", "degraded"))

check("GET /",
    lambda: "Sahayak" in get("/")["message"])

check("GET /api/config",
    lambda: "version" in get("/api/config"))

check("GET /api/analytics/dashboard",
    lambda: "kpis" in get("/api/analytics/dashboard"))

check("POST /api/auth/login (valid)",
    lambda: "access_token" in post("/api/auth/login",
        {"email": "admin@bluecollar.in", "password": "admin123"}))

check("POST /api/auth/login (invalid — expect 401)",
    lambda: post("/api/auth/login",
        {"email": "bad@x.com", "password": "wrong"}))

check("POST /api/chatbot/message (customer search)",
    lambda: post("/api/chatbot/message",
        {"user_id": "t1", "user_type": "customer",
         "message": "I need a plumber near me", "language": "en"})["intent"] == "search_workers")

check("POST /api/chatbot/message (worker earnings)",
    lambda: post("/api/chatbot/message",
        {"user_id": "t2", "user_type": "worker",
         "message": "How much did I earn today", "language": "en"})["intent"] == "earnings_query")

check("POST /api/chatbot/message (admin analytics)",
    lambda: post("/api/chatbot/message",
        {"user_id": "t3", "user_type": "admin",
         "message": "Show me platform metrics", "language": "en"})["intent"] == "platform_analytics")

check("POST /api/chatbot/message (moderation block)",
    lambda: post("/api/chatbot/message",
        {"user_id": "t4", "user_type": "customer",
         "message": "how to make a bomb", "language": "en"})["intent"] == "blocked")

check("POST /api/chatbot/message (greeting)",
    lambda: post("/api/chatbot/message",
        {"user_id": "t5", "user_type": "customer",
         "message": "Hello", "language": "en"})["intent"] == "greeting")

check("GET /api/conversations/",
    lambda: isinstance(get("/api/conversations/"), list))

# ── Print results ──────────────────────────────────────────────────────────
print("\n" + "=" * 62)
print("  BlueCollar Chatbot v2 — Smoke Test")
print("=" * 62)
passed = 0
for name, ok, detail in results:
    icon = "PASS" if ok else "FAIL"
    print(f"  [{icon}] {name:<44} {detail}")
    if ok:
        passed += 1
print("=" * 62)
print(f"  {passed}/{len(results)} tests passed")
print(f"  API: {BASE}  |  Docs: {BASE}/docs")
print("=" * 62 + "\n")
sys.exit(0 if passed == len(results) else 1)
