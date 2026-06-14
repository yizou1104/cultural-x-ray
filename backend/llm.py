import os
import re
import json
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY", "")
FEATHERLESS_URL = "https://api.featherless.ai/v1/chat/completions"

TOKEN_MODEL   = "Qwen/Qwen3-8B"   # fast, per-token explanations
OVERALL_MODEL = "Qwen/Qwen3-14B"  # deeper, for idiom/phrase context

# ── Prompts ───────────────────────────────────────────────────────────────────

TOKEN_SYSTEM = """You are a cultural linguistics expert. Analyze the given word or phrase as it appears in the provided sentence.

CRITICAL: Every field in your response MUST be written entirely in English. Do NOT use any Chinese, Hindi, or other non-English characters in the values — not even as examples or labels.

Return ONLY a valid JSON object with exactly these fields:
{
  "literal": "English gloss only. For single characters: their direct meaning. For compounds: break down each part in English (e.g. for 加油 write '加 = add, 油 = oil → literally add oil'). Never use the original script in this field.",
  "semantic": "what it actually means in this context, in English",
  "cultural_note": "cultural, social, or pragmatic insight in English — be specific. For compounds, explain how the literal parts connect to the real meaning.",
  "tone": "e.g. formal, poetic, casual, archaic, empathetic",
  "example": "one short natural example sentence in English showing how this concept is used",
  "anecdote": "COMPLETE story in English — only if there is a genuinely notable cultural story or historical origin. Write it fully."
}
Omit anecdote if not applicable. No markdown, no code fences. All values must be in English."""

OVERALL_SYSTEM = """You are a cultural linguistics expert. Analyze the given sentence.

CRITICAL: Every field in your response MUST be written entirely in English. Do NOT use any Chinese, Hindi, or other non-English characters in any value.

Return ONLY a valid JSON object with these fields:
{
  "literal_translation": "word-for-word English translation — all English, no original script",
  "semantic_translation": "natural English equivalent a native speaker would say",
  "phrase_context": {
    "type": "idiom | proverb | classical quote | saying | expression",
    "origin": "specific historical or literary origin in English — dynasty, text, or figure name in English romanization",
    "cultural_usage": "in English: how and when this phrase is used in modern life",
    "significance": "in English: the cultural lesson, value, or worldview it embodies"
  }
}
Include phrase_context ONLY if the input is a recognized idiom, proverb, or classical expression. Omit for plain sentences.
No markdown, no code fences. All values must be in English."""

REFINE_SYSTEM = """You are a Chinese linguistics expert. Refine a jieba word segmentation to maximize cultural insight for a learner.

STEP 0 — JUDGE SENTENCE LENGTH first, then apply the rules below accordingly:
  - SHORT (≤6 characters total): split aggressively — reveal every compound's etymology.
  - MEDIUM (7–15 characters): split the 2–3 most culturally interesting compounds; leave the rest as jieba gave them.
  - LONG (16+ characters): split sparingly — only the single most culturally loaded compound; prefer keeping clusters together so the token count stays manageable.

RULE 1 — SPLIT compound words character-by-character when seeing each character's literal meaning reveals the cultural metaphor. Apply this rule more selectively as sentence length grows.
  加油 → ["加","油"]          (add + oil → "keep going!")
  随便 → ["随","便"]          (follow + convenience → casual)
  辛苦 → ["辛","苦"]          (bitter + hard → toil)
  不好意思 → ["不","好","意思"]  (not + good + meaning → embarrassed)
  差不多 → ["差","不","多"]    (differ + not + much → "close enough")

RULE 2 — KEEP as a single unit regardless of sentence length (never split these):
  - Proper names and historical figures: 孔子, 孟子, 老子, 诸葛亮, 李白, 武则天
  - Four-character chéngyǔ idioms: 塞翁失马, 焉知非福, 一石二鸟
  - Words where splitting destroys meaning: 朋友, 老师, 学生, 图书馆, 电话
  - Grammatical particles — leave exactly as jieba gave them: 了, 的, 吗, 呢, 吧, 是, 在, 不, 也, 都

Return ONLY a flat JSON array of strings. No explanation, no markdown."""

HINDI_REFINE_SYSTEM = """You are a Hindi and Sanskrit linguistics expert. Review a whitespace-based tokenization of Hindi/Sanskrit text and refine it.

STEP 0 — JUDGE SENTENCE LENGTH first:
  - SHORT (≤3 words): keep each word separate if it carries cultural value; only merge if it is clearly a single fixed unit.
  - MEDIUM (4–8 words): merge 1–2 fixed idiomatic phrases where the phrase is the cultural unit; keep culturally rich individual words separate.
  - LONG (9+ words): merge more aggressively — prefer grouping related words into meaningful clusters to keep the token count manageable.

MERGE multi-word fixed expressions into a single token when the phrase is an idiom or fixed unit:
  - Colloquial fixed phrases: कोई बात नहीं, क्या बात है, चलता है, ठीक है
  - Cultural expressions used as a unit: मन की बात, जुगाड़ करना

KEEP SEPARATE when each word carries independent cultural or etymological value:
  - Sanskrit proverb components where every word is a lesson: अतिथि + देवो + भव (keep 3), वसुधैव + कुटुम्बकम् (keep 2)
  - Any word that individually references a concept, deity, or cultural idea

DO NOT split anything — Hindi is already space-separated.

Return ONLY a flat JSON array of strings. No explanation, no markdown."""

ENGLISH_EQUIV_SYSTEM = """You are a cultural linguistics expert. Given a non-English sentence, find the best English equivalent — ideally a well-known English idiom, proverb, or colloquial expression that carries the same cultural weight and sentiment.

CRITICAL: All fields must be written entirely in English.

Return ONLY a valid JSON object:
{
  "english_phrase": "the best English idiom, proverb, or expression that captures the same meaning and feel",
  "type": "idiom | proverb | expression | saying | phrase",
  "explanation": "one sentence explaining why this English equivalent captures the same cultural sentiment",
  "alternatives": ["one or two other English equivalents if they exist — omit this field if none"]
}

Prefer well-known English expressions over literal translations. If no idiom exists, give the most natural conversational phrasing an English speaker would actually use.
No markdown, no code fences. All values in English."""

SCORE_SYSTEM = """You are a Chinese/Hindi linguistics expert. Score each token by how much cultural explanation a non-native speaker needs to truly understand it.

Scoring scale:
  0 — Grammatical particle, filler, or common word with no cultural weight (了, 的, है, से, pronouns, basic verbs like 是/go/come)
  1 — Ordinary content word; meaning is transparent, minor contextual note at most
  2 — Culturally significant: carries hidden connotation, social register, indirect meaning, or cultural reference a learner would likely miss
  3 — Highly culturally loaded: idiom component, metaphor, historical/literary reference, or expression that is commonly misunderstood by non-natives (e.g. 加, 油, 不好意思, अतिथि, जुगाड़)

Return ONLY a JSON array of integers, one per token in the same order. Example: [0, 3, 1, 2, 0]
No markdown, no explanation."""


# ── JSON parsing helpers ──────────────────────────────────────────────────────

def _clean_json(s: str) -> str:
    """Remove trailing commas that LLMs commonly emit but JSON forbids."""
    return re.sub(r',\s*([}\]])', r'\1', s)


def _parse_json(raw: str):
    """Try progressively harder to extract valid JSON from LLM output."""
    # Pass 1: as-is
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    # Pass 2: strip trailing commas
    try:
        return json.loads(_clean_json(raw))
    except json.JSONDecodeError:
        pass
    # Pass 3: extract first {...} or [...] block, then clean
    m = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', raw)
    if m:
        extracted = m.group(1)
        try:
            return json.loads(extracted)
        except json.JSONDecodeError:
            return json.loads(_clean_json(extracted))
    raise json.JSONDecodeError("No valid JSON found in LLM response", raw, 0)


# ── Internal call helper ──────────────────────────────────────────────────────

async def _call(messages: list, model: str, extra_body: dict | None = None, retries: int = 2):
    """Non-streaming LLM call. Returns parsed JSON (dict or list)."""
    for attempt in range(retries + 1):
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 1024,
            }
            if extra_body:
                payload.update(extra_body)

            async with httpx.AsyncClient(timeout=60) as client:
                r = await client.post(
                    FEATHERLESS_URL,
                    headers={
                        "Authorization": f"Bearer {FEATHERLESS_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                r.raise_for_status()
                raw = r.json()["choices"][0]["message"]["content"].strip()
                # Strip markdown fences
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[1]
                if raw.endswith("```"):
                    raw = raw.rsplit("```", 1)[0]
                raw = raw.strip()
                return _parse_json(raw)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < retries:
                await asyncio.sleep(2 ** attempt)
            else:
                raise


async def _call_text(messages: list, model: str, extra_body: dict | None = None) -> str:
    """Non-streaming LLM call that returns raw text without JSON parsing."""
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024,
    }
    if extra_body:
        payload.update(extra_body)
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            FEATHERLESS_URL,
            headers={
                "Authorization": f"Bearer {FEATHERLESS_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


def _qwen3_extra():
    return {"chat_template_kwargs": {"enable_thinking": False}}


# ── Public API ────────────────────────────────────────────────────────────────

async def refine_segmentation(text: str, language: str, initial_tokens: list[str]) -> list[str]:
    """Ask AI to review and optionally refine a segmentation."""
    system = REFINE_SYSTEM if language == "chinese" else HINDI_REFINE_SYSTEM
    try:
        result = await _call(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content":
                    f"/no_think\nOriginal text: {text}\n"
                    f"Initial segmentation: {json.dumps(initial_tokens, ensure_ascii=False)}\n\n"
                    "Return the refined segmentation as a flat JSON array of strings."},
            ],
            model=TOKEN_MODEL,
            extra_body=_qwen3_extra(),
        )
        if isinstance(result, list):
            refined = [str(t).strip() for t in result if str(t).strip()]
            if refined:
                return refined
    except Exception:
        pass
    return initial_tokens


async def analyze_token(sentence: str, language: str, token: str, index: int) -> dict:
    data = await _call(
        messages=[
            {"role": "system", "content": TOKEN_SYSTEM},
            {"role": "user", "content":
                f"/no_think\nLanguage: {language}\n"
                f"Full sentence: {sentence}\n"
                f"Analyze this token: \"{token}\""},
        ],
        model=TOKEN_MODEL,
        extra_body=_qwen3_extra(),
    )
    return {"type": "token", "index": index, "data": {"token": token, **data}}


async def analyze_overall(sentence: str, language: str) -> dict:
    data = await _call(
        messages=[
            {"role": "system", "content": OVERALL_SYSTEM},
            {"role": "user", "content": f"Language: {language}\nSentence: {sentence}"},
        ],
        model=OVERALL_MODEL,
        extra_body=_qwen3_extra(),
    )
    return {"type": "overall", "data": data}


CHAT_SYSTEM = """You are a friendly cultural linguistics expert helping someone understand a {language} sentence and its cultural context. Answer the user's follow-up question in 2–4 clear, engaging sentences. Focus on cultural insight. Write in plain English — no bullet points, no headers, no JSON, no markdown."""


async def chat_about_sentence(sentence: str, language: str, question: str) -> str:
    """Answer a follow-up question about the sentence. Returns plain text."""
    system = CHAT_SYSTEM.format(language=language)
    return await _call_text(
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content":
                f"/no_think\nSentence: {sentence}\nQuestion: {question}"},
        ],
        model=OVERALL_MODEL,
        extra_body=_qwen3_extra(),
    )


async def get_english_equivalent(sentence: str, language: str) -> dict:
    """Return an English idiom/expression equivalent for the given sentence."""
    return await _call(
        messages=[
            {"role": "system", "content": ENGLISH_EQUIV_SYSTEM},
            {"role": "user", "content":
                f"/no_think\nLanguage: {language}\nSentence: {sentence}\n\n"
                "Find the closest English equivalent expression."},
        ],
        model=OVERALL_MODEL,
        extra_body=_qwen3_extra(),
    )


async def score_tokens(sentence: str, language: str, token_data: list[dict]) -> list[int]:
    """Return a 0–3 cultural importance score for each token."""
    summary = "\n".join(
        f'{i}. "{t["token"]}": literal="{t.get("literal","")}", semantic="{t.get("semantic","")}"'
        for i, t in enumerate(token_data)
    )
    try:
        result = await _call(
            messages=[
                {"role": "system", "content": SCORE_SYSTEM},
                {"role": "user", "content":
                    f"/no_think\nLanguage: {language}\nSentence: {sentence}\n\n"
                    f"Tokens:\n{summary}\n\n"
                    "Return scores as a JSON array of integers."},
            ],
            model=TOKEN_MODEL,
            extra_body=_qwen3_extra(),
        )
        if isinstance(result, list) and len(result) == len(token_data):
            return [max(0, min(3, int(s))) for s in result]
    except Exception:
        pass
    return [1] * len(token_data)  # neutral fallback
