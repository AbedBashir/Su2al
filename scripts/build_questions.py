"""Validates the question source files and writes src/data/questions/<category>.json.

Run from the repo root: python3 scripts/build_questions.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from q_history_geo import HISTORY, GEOGRAPHY
from q_sci_sport_lang import SCIENCE, SPORTS, LANGUAGE
from q_rest import RELIGION, ARTS, TECHNOLOGY, NATURE, GENERAL

CATEGORIES = {
    "history": ("his", HISTORY), "geography": ("geo", GEOGRAPHY), "science": ("sci", SCIENCE),
    "sports": ("spo", SPORTS), "language": ("lan", LANGUAGE), "religion": ("rel", RELIGION),
    "arts": ("art", ARTS), "technology": ("tec", TECHNOLOGY), "nature": ("nat", NATURE), "general": ("gen", GENERAL),
}
out_dir = os.path.join(os.path.dirname(__file__), "..", "src", "data", "questions")
errors, seen_text, total = [], {}, 0
for cat, (prefix, items) in CATEGORIES.items():
    rows = []
    for n, (q, options, d) in enumerate(items, 1):
        where = f"{cat} #{n}"
        if len(options) != 4: errors.append(f"{where}: needs 4 options")
        if len(set(o.strip() for o in options)) != 4: errors.append(f"{where}: duplicate options")
        if d not in (1, 2, 3): errors.append(f"{where}: bad difficulty")
        key = q.strip()
        if key in seen_text: errors.append(f"{where}: duplicate of {seen_text[key]}")
        seen_text[key] = where
        # The correct answer is first in the source; the app shuffles options at runtime.
        rows.append({"id": f"{prefix}-{n:03d}", "q": q, "o": options, "a": 0, "d": d})
    total += len(rows)
    with open(os.path.join(out_dir, f"{cat}.json"), "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=0)
    by_d = {k: sum(1 for r in rows if r["d"] == k) for k in (1, 2, 3)}
    print(f"{cat:11s} {len(rows):4d}  easy {by_d[1]:3d}  medium {by_d[2]:3d}  hard {by_d[3]:3d}")
print(f"total      {total:4d}")
if errors:
    print("\n".join(errors)); sys.exit(1)
