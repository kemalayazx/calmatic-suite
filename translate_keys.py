#!/usr/bin/env python3
"""
Translate 1118 English keys to 14 languages using OpenRouter free models.
Then merge into translations.ts.
"""
import sys, json, re, time, os, requests
sys.path.insert(0, '/Users/root1/Desktop/skills for claude by kemal/skills for claude by kemal/elastic-leavitt')

try:
    from keychain_helper import load_all_keys
    load_all_keys()
except Exception:
    pass

# ── Config ────────────────────────────────────────────────────────────────────

KEY_FILES = [
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group1.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group2.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group3.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group4.json",
    "/Users/root1/Desktop/calmatic-suite/src/i18n/keys-group5.json",
]

TRANSLATIONS_FILE = "/Users/root1/Desktop/calmatic-suite/src/i18n/translations.ts"
CACHE_FILE = "/Users/root1/Desktop/calmatic-suite/translations_cache.json"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# Model priority — first working one is used
MODELS = [
    "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "z-ai/glm-4.5-air:free",
    "arcee-ai/trinity-large-preview:free",
]

LANGUAGES = {
    "tr": "Turkish",
    "de": "German",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese (Brazilian)",
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

BATCH_SIZE = 40  # keys per API call

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

# ── Translation via OpenRouter ────────────────────────────────────────────────

def call_openrouter(prompt: str, model: str, timeout: int = 90) -> str:
    resp = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json",
            "X-Title": "Calmatic Translation",
        },
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4000,
            "temperature": 0.1,
        },
        timeout=timeout
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def extract_json(text: str) -> dict | None:
    """Try to extract JSON from LLM response."""
    text = text.strip()
    # Remove think tags (qwen models)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

    # Try direct parse
    try:
        return json.loads(text)
    except:
        pass

    # Try JSON block in markdown
    m = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except:
            pass

    # Try to find first { to last }
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end+1])
        except:
            pass

    return None


def translate_batch(batch: dict, lang_name: str) -> dict:
    """Translate a batch of keys using OpenRouter, trying models in order."""
    batch_json = json.dumps(batch, ensure_ascii=False)

    prompt = f"""Translate these UI labels from English to {lang_name}. Return ONLY valid JSON with the exact same keys. Keep brand names (Calmatic Suite), abbreviations (APR, FICA, BMI, BMR, GPA, DCA, ROI, CAGR, kWh, MPG), math symbols, currency symbols, and technical terms unchanged in English. Translations must be concise and natural for a calculator/finance app UI. No explanation, no markdown formatting, no extra text — ONLY the JSON object.

{batch_json}"""

    for model in MODELS:
        for attempt in range(2):
            try:
                result = call_openrouter(prompt, model)
                parsed = extract_json(result)
                if parsed and len(parsed) >= len(batch) * 0.5:
                    return parsed
                elif parsed:
                    print(f"  Partial: {len(parsed)}/{len(batch)} keys from {model}")
                    return parsed
                else:
                    print(f"  Could not parse JSON from {model} (attempt {attempt+1})")
                    if attempt == 0:
                        time.sleep(2)
                    continue
            except requests.HTTPError as e:
                if e.response.status_code == 429:
                    print(f"  Rate limit on {model}, trying next...")
                    break  # try next model
                elif e.response.status_code in (404, 400):
                    print(f"  Model unavailable: {model}")
                    break
                else:
                    print(f"  HTTP {e.response.status_code} on {model} (attempt {attempt+1})")
                    if attempt == 0:
                        time.sleep(3)
            except Exception as e:
                print(f"  Error on {model} (attempt {attempt+1}): {str(e)[:100]}")
                if attempt == 0:
                    time.sleep(3)

    print(f"  FAILED all models for batch")
    return {}


def translate_all_languages(all_keys: dict, cache: dict) -> dict:
    keys_list = list(all_keys.items())

    # Create batches
    batches = []
    for i in range(0, len(keys_list), BATCH_SIZE):
        chunk = dict(keys_list[i:i+BATCH_SIZE])
        batches.append(chunk)

    total_needed = sum(
        1 for lang_code in LANGUAGES
        for batch in batches
        if any(k not in cache.get(lang_code, {}) for k in batch)
    )
    print(f"Total keys: {len(all_keys)}, Batches: {len(batches)}, Languages: {len(LANGUAGES)}")
    print(f"Batches still needed: {total_needed}")

    for lang_code, lang_name in LANGUAGES.items():
        if lang_code not in cache:
            cache[lang_code] = {}

        lang_translations = cache[lang_code]
        already_done = len(lang_translations)

        if already_done >= len(all_keys):
            print(f"[{lang_code}] Already complete ({already_done} keys)")
            continue

        print(f"\n[{lang_code}/{lang_name}] Starting ({already_done}/{len(all_keys)} done)")

        for i, batch in enumerate(batches):
            missing_in_batch = {k: v for k, v in batch.items() if k not in lang_translations}

            if not missing_in_batch:
                continue

            print(f"  Batch {i+1}/{len(batches)} ({len(missing_in_batch)} keys)...", end=' ', flush=True)

            translated = translate_batch(missing_in_batch, lang_name)
            lang_translations.update(translated)

            cache[lang_code] = lang_translations
            save_cache(cache)

            print(f"got {len(translated)}/{len(missing_in_batch)}")

            # Small delay between batches
            time.sleep(1.0)

        print(f"[{lang_code}] Done: {len(lang_translations)} keys translated")

    return cache


# ── Merge into translations.ts ────────────────────────────────────────────────

def escape_ts_value(value: str) -> str:
    """Escape a string value for use inside TypeScript double-quoted string."""
    value = value.replace('\\', '\\\\')
    value = value.replace('"', '\\"')
    return value


def merge_into_translations(all_keys: dict, translations: dict):
    with open(TRANSLATIONS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find locale block start positions
    locale_pattern = re.compile(r'^  ([a-z]{2}): \{', re.MULTILINE)
    locales = [(m.group(1), m.start()) for m in locale_pattern.finditer(content)]

    new_content = content
    offset = 0

    for i, (lang_code, pos) in enumerate(locales):
        # Get the block content
        if i + 1 < len(locales):
            block_end_search = locales[i+1][1]
            block = content[pos:block_end_search]
        else:
            block = content[pos:]

        # Find closing `  },` of this locale block
        close_match = re.search(r'\n  \},?\n', block)
        if not close_match:
            print(f"WARNING: could not find closing for {lang_code}")
            continue

        close_pos_in_block = close_match.start()

        # Extract existing keys in this block
        existing_keys = set(re.findall(r'"([^"]+)":', block[:close_pos_in_block]))

        # Get translations for this language
        if lang_code == 'en':
            lang_trans = all_keys
        else:
            lang_trans = translations.get(lang_code, {})

        # Build new keys to insert
        new_entries = []
        for key, en_value in all_keys.items():
            if key in existing_keys:
                continue

            if lang_code == 'en':
                value = en_value
            else:
                value = lang_trans.get(key, en_value)  # fallback to English

            value = escape_ts_value(value)
            new_entries.append(f'    "{key}": "{value}",')

        if not new_entries:
            print(f"[{lang_code}] No new keys to add")
            continue

        abs_close_pos = pos + offset + close_pos_in_block
        insert_text = '\n' + '\n'.join(new_entries)

        new_content = new_content[:abs_close_pos] + insert_text + new_content[abs_close_pos:]
        offset += len(insert_text)

        print(f"[{lang_code}] Added {len(new_entries)} new keys")

    with open(TRANSLATIONS_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\nWrote updated translations to {TRANSLATIONS_FILE}")


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--merge-only", action="store_true", help="Skip translation, just merge cache into .ts")
    parser.add_argument("--lang", help="Only translate this language code (e.g. tr)")
    args = parser.parse_args()

    print("=== Calmatic Suite Translation Script ===\n")

    all_keys = load_all_keys()
    print(f"Loaded {len(all_keys)} English keys\n")

    cache = load_cache()

    if args.lang:
        # Only translate one language
        target_lang = args.lang
        if target_lang not in LANGUAGES:
            print(f"Unknown language: {target_lang}. Valid: {list(LANGUAGES.keys())}")
            sys.exit(1)
        lang_subset = {target_lang: LANGUAGES[target_lang]}
        orig_langs = LANGUAGES.copy()
        LANGUAGES.clear()
        LANGUAGES.update(lang_subset)

    if not args.merge_only:
        cache = translate_all_languages(all_keys, cache)

    print("\n=== Merging into translations.ts ===")
    merge_into_translations(all_keys, cache)

    print("\nDone!")
