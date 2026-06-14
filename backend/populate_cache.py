"""
Run once to pre-compute LLM responses for all demo examples.
Results are written to cache.py and served instantly at demo time.

Usage: python3 populate_cache.py
"""
import asyncio
import json
import sys
sys.path.insert(0, '.')

from segmenter import segment
from llm import analyze_token, analyze_overall, score_tokens, refine_segmentation
from examples import EXAMPLES


def _compute_groups(initial: list[str], refined: list[str]) -> list[int]:
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
    while ri < len(refined):
        groups.append(gid)
        gid += 1
        ri += 1
    return groups


async def compute(example: dict) -> tuple[str, dict]:
    text = example["text"]
    language = example["language"]
    jieba_tokens = segment(text, language)
    tokens = jieba_tokens[:]

    # AI refinement (same as live path)
    try:
        refined = await refine_segmentation(text, language, jieba_tokens)
        if refined != jieba_tokens:
            tokens = refined
            print(f"  ✓ refined segmentation: {tokens}")
    except Exception as e:
        print(f"  ! refinement skipped: {e}")

    groups = _compute_groups(jieba_tokens, tokens)

    token_results = []
    for i, t in enumerate(tokens):
        res = await analyze_token(text, language, t, i)
        token_results.append(res["data"])
        print(f"  ✓ token {i+1}/{len(tokens)}: {t}")

    overall_res = await analyze_overall(text, language)
    print(f"  ✓ overall")

    scores = [1] * len(tokens)
    try:
        scores = await score_tokens(text, language, token_results)
        print(f"  ✓ scores: {scores}")
    except Exception as e:
        print(f"  ! scores skipped: {e}")

    return text, {
        "tokens": tokens,
        "groups": groups,
        "token_data": token_results,
        "overall": overall_res["data"],
        "scores": scores,
    }


async def main():
    cache = {}
    for ex in EXAMPLES:
        print(f"\nComputing: {ex['text']} ({ex['language']})")
        try:
            key, value = await compute(ex)
            cache[key] = value
        except Exception as e:
            print(f"  ERROR: {e}")

    lines = ["CACHE: dict[str, dict] = "]
    lines.append(json.dumps(cache, ensure_ascii=False, indent=2))
    content = '"""\nPre-computed responses for the demo example phrases.\nRun `python3 populate_cache.py` to regenerate these.\n"""\n'
    content += "CACHE: dict[str, dict] = " + json.dumps(cache, ensure_ascii=False, indent=2) + "\n"

    with open("cache.py", "w") as f:
        f.write(content)

    print(f"\n✓ Wrote {len(cache)} entries to cache.py")


asyncio.run(main())
