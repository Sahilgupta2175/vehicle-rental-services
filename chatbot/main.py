from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
import os

app = FastAPI(title="Vehicle Rental Chatbot API")

# ---- Rate Limiter ----
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Gemini API Key ----
# Use environment variable in production, fallback to hardcoded for development
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBfKGbSUvHXFVbAB-1JFqsdzZtLuVJ4owk")

try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API configured successfully")
except Exception as e:
    print(f"❌ Error configuring Gemini API: {e}")

class ChatRequest(BaseModel):
    message: str


# ----------- CLEAN MARKDOWN -----------
def clean_markdown(text: str) -> str:
    if not text:
        return text
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'^\s*\*\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# ----------- VEHICLE SUPPORT SYSTEM PROMPT -----------
SYSTEM_PROMPT = """
You are a Vehicle Rental Service Support Chatbot. 
You must answer ONLY questions related to:
- Payment modes (cash, UPI, wallets, cards)
- Pickup & required documents
- Driving licence requirements
- Refunds, cancellation fees, cancellation rules
- Pricing for bikes & cars
- Rental policies

RULES:
1. Be short, friendly, and clear.
2. If user asks anything out of topic, reply:
   "I can help only with vehicle rental information — please ask about payments, pricing, bookings, documents, or cancellations."
3. Payment Policy:
   - Cash allowed only at selected pickup points.
   - UPI, Wallets, and Cards are fully supported.
   - Full payment is required before vehicle release; no post-usage payment allowed.
4. Document Policy:
   - Valid Driving Licence is mandatory.
   - Aadhar or any government ID proof is required.
   - We provide vehicle documents at pickup.
5. Cancellation Policy:
   - Free cancellation up to 30 minutes before pickup.
   - Refund is processed back to original payment mode within 3-5 business days.
"""


# ----------- INTENT DETECTION (Keyword-Based Routing) -----------
def detect_intent(user_text: str):
    text = user_text.lower()

    intents = {
        "payment": ["pay", "cash", "upi", "wallet", "card", "payment", "online"],
        "documents": ["document", "licence", "license", "aadhar", "id proof", "dl", "bring", "pickup"],
        "cancel": ["cancel", "refund", "charge", "cancellation", "fee"],
        "pricing": ["price", "cost", "rent", "rate", "charges", "how much"],
    }

    for intent, keywords in intents.items():
        if any(k in text for k in keywords):
            return intent

    return "general"


def build_prompt(intent: str, user_message: str):
    return f"{SYSTEM_PROMPT}\nUser intent: {intent}\nUser: {user_message}\nAssistant:"


# ----------- HEALTH CHECK -----------
@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Vehicle Rental Chatbot",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY)
    }

# ----------- MAIN CHAT ENDPOINT -----------
@app.post("/chat")
@limiter.limit("15/minute")
async def chat(request: Request, req: ChatRequest):
    try:
        user_message = req.message
        
        if not user_message or len(user_message.strip()) == 0:
            return {"answer": "Please ask me a question about vehicle rentals!"}

        # 1️⃣ Detect what type of question the user is asking
        intent = detect_intent(user_message)

        # 2️⃣ Build a prompt based on intent + system rules
        final_prompt = build_prompt(intent, user_message)

        # 3️⃣ Call Gemini (using stable model)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(final_prompt)

        # 4️⃣ Clean stars / markdown
        cleaned = clean_markdown(response.text)

        # 5️⃣ Return in the same field your frontend expects
        return {"answer": cleaned}
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return {
            "answer": "I apologize, but I'm having trouble processing your request right now. Please try asking about our payment methods, pricing, or rental policies."
        }
