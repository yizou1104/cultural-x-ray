import jieba
import re

# Pure grammatical postpositions and conjunctions with no cultural value on their own
_HINDI_PARTICLES = frozenset({
    # Postpositions
    'से', 'में', 'को', 'पर', 'के', 'की', 'का', 'ने', 'तक', 'पे', 'द्वारा',
    'लिए', 'लिये', 'बिना', 'साथ', 'बाद', 'पहले',
    # Conjunctions
    'और', 'या', 'व', 'तथा', 'एवं', 'किंतु', 'परंतु', 'लेकिन', 'मगर',
    # Subordinators
    'कि', 'जो', 'जब', 'जहाँ', 'जहां', 'क्योंकि',
})


def segment(text: str, language: str) -> list[str]:
    if language == "chinese":
        return [t for t in jieba.cut(text) if t.strip() and re.search(r'[一-鿿]', t)]
    else:
        # Split on punctuation and whitespace; keep Devanagari words
        raw = re.split(r'[,।\s]+', text)
        return [
            t.strip() for t in raw
            if t.strip()
            and re.search(r'[ऀ-ॿ]', t)  # must contain Devanagari
            and t.strip() not in _HINDI_PARTICLES
        ]
