/**
 * auto-translate.ts
 * Translates missing keys in translations.ts using Gemini flash (free tier).
 *
 * Usage:
 *   npx tsx scripts/auto-translate.ts              # translate all missing keys
 *   npx tsx scripts/auto-translate.ts --dry-run    # preview only, no write
 *   npx tsx scripts/auto-translate.ts --key nav.finance  # single key
 *
 * Requires: GOOGLE_API_KEY env var (already in .mcp.json)
 */

import * as fs from "fs";
import * as path from "path";

const TRANSLATIONS_PATH = path.join(__dirname, "../src/i18n/translations.ts");
const API_KEY = process.env.GOOGLE_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const SINGLE_KEY = (() => {
  const i = process.argv.indexOf("--key");
  return i !== -1 ? process.argv[i + 1] : null;
})();

const LOCALES = [
  "tr", "de", "fr", "es", "pt", "it",
  "nl", "pl", "ru", "ar", "ja", "zh", "ko", "hi",
];

const LOCALE_NAMES: Record<string, string> = {
  tr: "Turkish", de: "German", fr: "French", es: "Spanish",
  pt: "Portuguese", it: "Italian", nl: "Dutch", pl: "Polish",
  ru: "Russian", ar: "Arabic", ja: "Japanese",
  zh: "Simplified Chinese", ko: "Korean", hi: "Hindi",
};

// ── Load current translations ─────────────────────────────────────────────────

function loadTranslations(): Record<string, Record<string, string>> {
  const raw = fs.readFileSync(TRANSLATIONS_PATH, "utf-8");
  // Extract the object literal — eval is safe here (local file)
  const match = raw.match(/export const translations[^=]+=\s*(\{[\s\S]+?\});\s*\nexport/);
  if (!match) throw new Error("Could not parse translations.ts");
  // Use Function to avoid direct eval
  return new Function(`return ${match[1]}`)() as Record<string, Record<string, string>>;
}

// ── Gemini API call ──────────────────────────────────────────────────────────

async function translateBatch(
  texts: Record<string, string>,
  targetLang: string
): Promise<Record<string, string>> {
  if (!API_KEY) throw new Error("GOOGLE_API_KEY not set");

  const entries = Object.entries(texts);
  const prompt = `You are a professional translator. Translate the following UI strings from English to ${LOCALE_NAMES[targetLang]}.

Rules:
- Keep proper nouns, brand names (Calmatic Suite, GPA, BMI, SGK) as-is
- Keep "(TR)", "(Turkey)", "(US)" suffixes as-is
- Keep "←", "→", "..." punctuation
- Return ONLY valid JSON, no explanation

Input JSON:
${JSON.stringify(Object.fromEntries(entries), null, 2)}

Return a JSON object with the same keys but translated values.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]+\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${text}`);
  return JSON.parse(jsonMatch[0]);
}

// ── Patch translations.ts in-place ───────────────────────────────────────────

function patchTranslationsFile(
  locale: string,
  newKeys: Record<string, string>
): void {
  let src = fs.readFileSync(TRANSLATIONS_PATH, "utf-8");

  // Find the locale block's closing brace
  // Pattern: look for `  ${locale}: {` then its closing `  },`
  const localePattern = new RegExp(
    `(  ${locale}: \\{[\\s\\S]+?)(  \\},)`,
    "g"
  );

  const keysToInsert = Object.entries(newKeys)
    .map(([k, v]) => `    "${k}": ${JSON.stringify(v)},`)
    .join("\n");

  src = src.replace(localePattern, (_, block, closing) => {
    // Don't duplicate existing keys
    const filtered = Object.entries(newKeys)
      .filter(([k]) => !block.includes(`"${k}"`))
      .map(([k, v]) => `    "${k}": ${JSON.stringify(v)},`)
      .join("\n");
    if (!filtered) return block + closing;
    return `${block}${filtered}\n${closing}`;
  });

  fs.writeFileSync(TRANSLATIONS_PATH, src, "utf-8");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Loading translations...");
  const translations = loadTranslations();
  const enKeys = translations["en"];

  // Determine which keys to translate
  const keysToCheck = SINGLE_KEY
    ? [SINGLE_KEY].filter((k) => k in enKeys)
    : Object.keys(enKeys);

  let totalAdded = 0;

  for (const locale of LOCALES) {
    const existing = translations[locale] ?? {};
    const missing: Record<string, string> = {};

    for (const key of keysToCheck) {
      if (!existing[key]) {
        missing[key] = enKeys[key];
      }
    }

    if (Object.keys(missing).length === 0) {
      console.log(`✓ ${locale}: up to date`);
      continue;
    }

    console.log(`→ ${locale}: translating ${Object.keys(missing).length} keys...`);

    if (DRY_RUN) {
      console.log("  [dry-run]", Object.keys(missing).join(", "));
      continue;
    }

    try {
      // Batch in groups of 20 to avoid token limits
      const entries = Object.entries(missing);
      const batches = [];
      for (let i = 0; i < entries.length; i += 20) {
        batches.push(Object.fromEntries(entries.slice(i, i + 20)));
      }

      const translated: Record<string, string> = {};
      for (const batch of batches) {
        const result = await translateBatch(batch, locale);
        Object.assign(translated, result);
        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 500));
      }

      patchTranslationsFile(locale, translated);
      totalAdded += Object.keys(translated).length;
      console.log(`  ✓ added ${Object.keys(translated).length} keys`);
    } catch (err) {
      console.error(`  ✗ ${locale} failed:`, (err as Error).message);
    }
  }

  console.log(`\nDone. Total keys added: ${totalAdded}`);
}

main().catch(console.error);
