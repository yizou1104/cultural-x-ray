# Cultural X-Ray · 文化透视 · सांस्कृतिक दृष्टि

An interactive web app that dissects Chinese and Hindi sentences word by word, revealing the literal meaning, cultural context, and pragmatic significance behind each token.

Built for LingHacks.

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

## Features

- Real-time token streaming — chips light up as each analysis completes
- AI segmentation refinement — splits culturally loaded compounds, preserves proper names
- Word-boundary bars — shows which split characters came from the same original word
- Cultural importance heat map — 0–3 score colors each chip by how much explanation a non-native speaker needs
- Phrase context — origin, usage, and significance for idioms and proverbs
- English equivalent — closest English idiom or expression on demand
- Follow-up chat — ask questions about any aspect of the sentence
