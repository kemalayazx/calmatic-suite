#!/usr/bin/env python3
"""
Translate 1118 English keys to 14 languages using llm-balancer.
Then merge into translations.ts.
"""
import sys, json, re, time, os
sys.path.insert(0, '/Users/root1/Desktop/skills for claude by kemal/skills for claude by kemal/elastic-leavitt')

from memory_server import ask

# ── Config ────────────────────────────────────────────────────────────────────

KEY_FILES = [
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group1.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group2.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group3.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group4.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group5.json",
]

TRANSLATIONS_FILE = "/Users/root1/Desktop/calmatic-suite/src/i18n/translations.ts"
OUTPUT_FILE = "/Users/root1/Desktop/calmatic-suite/src/i18n/translations.ts"
CACHE_FILE = "/Users/root1/Desktop/calmatic-suite/translations_cache.json"

LANGUAGES = {
    "tr": "Turkish",
    "de": "German",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "it": "Italian",
    "nl": "Dutch",
    "pl": "Polish",
    "ru": "Russian",
    "ar": "Arabic",
    "ja": "Japanese",
    "zh": "Chinese (Simplified)",
    "ko": "Korean",
    "hi": "Hindi",
}

BATCH_SIZE = 35  # keys per API call

# ── Load keys ─────────────────────────────────────────────────────────────────

def load_all_keys() -> dict:
    merged = {}
    for f in KEY_FILES:
        with open(f) as fp:
            merged.update(json.load(fp))
    return merged

# ── Cache (resume support) ────────────────────────────────────────────────────

def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}

def save_cache(cache: dict):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

# ── Translation ───────────────────────────────────────────────────────────────

def extract_json(text: str) -> dict | None:
    """Try to extract JSON from LLM response."""
    text = text.strip()
    # Remove [via provider] prefix
    text = re.sub(r'^\[via [^\]]+\]\n?', '', text).strip()

    # Try direct parse
    try:
        return json.loads(text)
    except:
        pass

    # Try to find JSON block
    m = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except:
            pass

    # Try to find raw { } block
    m = re.search(r'\{[^{}]*\}', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except:
            pass

    # Try larger block
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end+1])
        except:
            pass

    return None

def translate_batch(batch: dict, lang_code: str, lang_name: str) -> dict:
    """Translate a batch of keys to target language."""
    batch_json = json.dumps(batch, ensure_ascii=False)

    prompt = f"""Translate these UI labels from English to {lang_name}. Return ONLY valid JSON with the exact same keys. Keep brand names (Calmatic Suite), abbreviations, units (kg, km, kWh, APR, FICA, BMI, BMR, GPA, DCA, ROI, CAGR), math symbols, and technical terms in English. Translations must be concise and natural for a calculator app UI. Do NOT add any explanation, markdown, or extra text — just the JSON object.

{batch_json}"""

    for attempt in range(3):
        try:
            result, provider = ask(prompt, task="translate")
            # Strip [via provider] prefix
            result = re.sub(r'^\[via [^\]]+\]\n?', '', result).strip()
            parsed = extract_json(result)
            if parsed:
                # Verify keys match (at least partially)
                if len(parsed) >= len(batch) * 0.5:
                    return parsed
                else:
                    print(f"  Warning: got {len(parsed)}/{len(batch)} keys (attempt {attempt+1})")
                    if attempt < 2:
                        time.sleep(2)
                        continue
                    return parsed  # accept partial
            else:
                print(f"  Could not parse JSON (attempt {attempt+1}): {result[:200]}")
                if attempt < 2:
                    time.sleep(3)
        except Exception as e:
            print(f"  Error (attempt {attempt+1}): {e}")
            if attempt < 2:
                time.sleep(5)

    # Fallback: return empty dict (keys will be missing, that's OK)
    print(f"  FAILED batch for {lang_name}, returning empty")
    return {}

def translate_all_languages(all_keys: dict, cache: dict) -> dict:
    """Translate all keys to all languages, with caching."""
    keys_list = list(all_keys.items())

    # Create batches
    batches = []
    for i in range(0, len(keys_list), BATCH_SIZE):
        chunk = dict(keys_list[i:i+BATCH_SIZE])
        batches.append(chunk)

    print(f"Total keys: {len(all_keys)}, Batches: {len(batches)}, Languages: {len(LANGUAGES)}")
    print(f"Total API calls needed: {len(batches) * len(LANGUAGES)}")

    for lang_code, lang_name in LANGUAGES.items():
        if lang_code not in cache:
            cache[lang_code] = {}

        lang_translations = cache[lang_code]

        # Check how many keys already translated
        already_done = len(lang_translations)
        remaining = len(all_keys) - already_done

        if remaining == 0:
            print(f"[{lang_code}] Already complete ({already_done} keys)")
            continue

        print(f"\n[{lang_code}/{lang_name}] Starting ({already_done}/{len(all_keys)} done)")

        for i, batch in enumerate(batches):
            # Check if any key in this batch is missing
            missing_in_batch = {k: v for k, v in batch.items() if k not in lang_translations}

            if not missing_in_batch:
                continue

            print(f"  Batch {i+1}/{len(batches)}: {len(missing_in_batch)} keys...", end=' ', flush=True)

            translated = translate_batch(missing_in_batch, lang_code, lang_name)
            lang_translations.update(translated)

            # Save cache after each batch
            cache[lang_code] = lang_translations
            save_cache(cache)

            print(f"got {len(translated)}/{len(missing_in_batch)}")

            # Small delay to avoid rate limits
            time.sleep(0.5)

        print(f"[{lang_code}] Done: {len(lang_translations)} keys translated")

    return cache

# ── Merge into translations.ts ────────────────────────────────────────────────

def merge_into_translations(all_keys: dict, translations: dict):
    """Read translations.ts, add new keys to each locale block, write back."""
    with open(TRANSLATIONS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find locale block positions
    locale_pattern = re.compile(r'^  ([a-z]{2}): \{', re.MULTILINE)
    locales = [(m.group(1), m.start()) for m in locale_pattern.finditer(content)]

    # Find what keys already exist in each locale
    # We'll insert new keys just before the closing `},` of each locale

    # Get existing keys per locale by parsing the file
    # We'll use a simpler approach: find locale block content and check key presence

    new_content = content
    offset = 0  # track position shifts as we insert

    for i, (lang_code, pos) in enumerate(locales):
        # Find the end of this locale block
        if i + 1 < len(locales):
            next_pos = locales[i+1][1]
            block = content[pos:next_pos]
        else:
            # Last locale - find the closing };
            block = content[pos:]

        # Find closing `  },` of this locale block
        # The block ends at the first `  },` at top level
        close_match = re.search(r'\n  \},?\n', block)
        if not close_match:
            print(f"WARNING: could not find closing for {lang_code}")
            continue

        close_pos_in_block = close_match.start()

        # Extract existing keys in this block
        existing_keys = set(re.findall(r'"([^"]+)":', block[:close_pos_in_block]))

        # Get translations for this language
        if lang_code == 'en':
            lang_trans = all_keys  # en = source
        else:
            lang_trans = translations.get(lang_code, {})

        # Build new keys to insert
        new_entries = []
        for key, en_value in all_keys.items():
            if key in existing_keys:
                continue  # already exists

            if lang_code == 'en':
                value = en_value
            else:
                value = lang_trans.get(key, en_value)  # fallback to English if missing

            # Escape value for JSON-in-TS
            value = value.replace('\\', '\\\\').replace('"', '\\"')
            new_entries.append(f'    "{key}": "{value}",')

        if not new_entries:
            print(f"[{lang_code}] No new keys to add")
            continue

        # Find absolute position to insert
        abs_close_pos = pos + offset + close_pos_in_block
        insert_text = '\n' + '\n'.join(new_entries)

        new_content = new_content[:abs_close_pos] + insert_text + new_content[abs_close_pos:]
        offset += len(insert_text)

        print(f"[{lang_code}] Added {len(new_entries)} new keys")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\nWrote updated translations to {OUTPUT_FILE}")

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Calmatic Suite Translation Script ===\n")

    # Step 1: Load keys
    all_keys = load_all_keys()
    print(f"Loaded {len(all_keys)} English keys\n")

    # Step 2: Load cache (for resume support)
    cache = load_cache()

    # Step 3: Translate
    cache = translate_all_languages(all_keys, cache)

    # Step 4: Merge into translations.ts
    print("\n=== Merging into translations.ts ===")
    merge_into_translations(all_keys, cache)

    print("\nDone!")
