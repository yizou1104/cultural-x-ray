import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from segmenter import segment
from llm import analyze_token, analyze_overall, refine_segmentation, score_tokens, get_english_equivalent, chat_about_sentence
from examples import EXAMPLES
from cache import CACHE

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str
    language: str


class ChatRequest(BaseModel):
    text: str
    language: str
    question: str


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


def _compute_groups(initial: list[str], refined: list[str]) -> list[int]:
    """
    Map each refined token back to the index of the initial (jieba) token it came from,
    by greedily consuming refined tokens until their combined length matches each initial token.
    Refined tokens with the same group ID should be visually connected in the UI.
    """
    groups: list[int] = []
    gid = 0
    ri = 0
    for it in initial:
        target = len(it)
        accumulated = 0
        start = ri
        while ri < len(refined) and accumulated < target:
            accumulated += len(refined[ri])
            ri += 1
        for _ in range(ri - start):
            groups.append(gid)
        gid += 1
    # Any leftover refined tokens (e.g. from AI adding tokens beyond initial)
    while ri < len(refined):
        groups.append(gid)
        gid += 1
        ri += 1
    return groups


@app.post("/analyze")
async def analyze_text(req: AnalyzeRequest):
    if req.language not in ("chinese", "hindi"):
        raise HTTPException(status_code=400, detail="language must be 'chinese' or 'hindi'")
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    cached = CACHE.get(req.text.strip())

    async def event_stream():
        # ── Cached fast-path ──────────────────────────────────────────────
        if cached:
            toks = cached["tokens"]
            yield _sse({"type": "tokens", "tokens": toks,
                         "groups": cached.get("groups", list(range(len(toks))))})
            for i, data in enumerate(cached["token_data"]):
                await asyncio.sleep(0.15)
                yield _sse({"type": "token", "index": i, "data": data})
            yield _sse({"type": "overall", "data": cached["overall"]})
            if cached.get("scores"):
                yield _sse({"type": "scores", "scores": cached["scores"]})
            yield "data: [DONE]\n\n"
            return

        # ── Live path ─────────────────────────────────────────────────────

        # Step 1: fast local segmentation shown immediately (each token is its own group)
        initial_tokens = segment(req.text, req.language)
        yield _sse({"type": "tokens", "tokens": initial_tokens,
                     "groups": list(range(len(initial_tokens)))})

        # Step 2: AI refines segmentation; compute groups against jieba baseline
        jieba_tokens = initial_tokens[:]
        try:
            refined = await refine_segmentation(req.text, req.language, initial_tokens)
            if refined != initial_tokens:
                initial_tokens = refined
                groups = _compute_groups(jieba_tokens, refined)
                yield _sse({"type": "tokens", "tokens": initial_tokens, "groups": groups})
        except Exception:
            pass  # keep initial segmentation on any error

        tokens = initial_tokens

        # Step 3: analyze each token, stream results as they finish
        completed_token_data: list[dict] = []
        for i, token in enumerate(tokens):
            try:
                event = await analyze_token(req.text, req.language, token, i)
                completed_token_data.append(event["data"])
                yield _sse(event)
            except Exception:
                pass  # skip this token; don't abort the whole stream

        # Step 4: overall translations + phrase context
        try:
            yield _sse(await analyze_overall(req.text, req.language))
        except Exception:
            pass  # overall is best-effort; don't abort

        # Step 5: score tokens for cultural importance heat map
        if completed_token_data:
            try:
                scores = await score_tokens(req.text, req.language, completed_token_data)
                yield _sse({"type": "scores", "scores": scores})
            except Exception:
                pass  # scores are optional; never block completion

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/english_equivalent")
async def english_equivalent(req: AnalyzeRequest):
    if req.language not in ("chinese", "hindi"):
        raise HTTPException(status_code=400, detail="language must be 'chinese' or 'hindi'")
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")
    try:
        return await get_english_equivalent(req.text, req.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(req: ChatRequest):
    if req.language not in ("chinese", "hindi"):
        raise HTTPException(status_code=400, detail="language must be 'chinese' or 'hindi'")
    if not req.text.strip() or not req.question.strip():
        raise HTTPException(status_code=400, detail="text and question must not be empty")
    try:
        answer = await chat_about_sentence(req.text, req.language, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/examples")
def get_examples():
    return EXAMPLES
