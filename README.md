# Cultural X-Ray · 文化透视 · सांस्कृतिक दृष्टि

An interactive web app that dissects Chinese and Hindi sentences word by word, revealing the literal meaning, cultural context, and pragmatic significance behind each token.

Built for LingHacks 2026.

## Stack

- **Frontend** — React + Vite + Tailwind CSS v4
- **Backend** — Python + FastAPI (streaming SSE)
- **LLMs** — Qwen3-8B and Qwen3-14B via [Featherless.ai](https://featherless.ai)
- **Segmentation** — jieba (Chinese), whitespace + particle filter (Hindi)

## Setup

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn httpx jieba python-dotenv
cp .env.example .env          # add your Featherless API key
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Pre-compute demo cache (optional)

```bash
cd backend
python populate_cache.py
```
