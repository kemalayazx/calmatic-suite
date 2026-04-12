const STOPWORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","is",
  "are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","could","should","may","might","it","its","this","that","these",
  "those","i","you","he","she","we","they","me","him","her","us","them","my","your",
  "his","our","their","not","no","so","if","as","up","by","from","about","into",
  "than","then","when","where","who","which","what","how","all","each","every",
  "both","few","more","most","other","some","such","also","just","over","out",
  "after","before","between","through","during","because","while","though","although",
]);

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeSeconds: number;
  speakingTimeSeconds: number;
  topKeywords: { word: string; count: number; pct: number }[];
}

export function analyzeText(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const wordMatches = text.match(/\b\w+\b/g) ?? [];
  const words = wordMatches.length;

  const sentences = (text.match(/[.!?]+/g) ?? []).length || (words > 0 ? 1 : 0);
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0);
  const lines = text.split(/\n/).length;

  const readingTimeSeconds = Math.ceil((words / 200) * 60);
  const speakingTimeSeconds = Math.ceil((words / 130) * 60);

  // keyword density (stopword filtered)
  const freq: Record<string, number> = {};
  for (const w of wordMatches) {
    const lower = w.toLowerCase();
    if (!STOPWORDS.has(lower) && lower.length > 1) {
      freq[lower] = (freq[lower] ?? 0) + 1;
    }
  }
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const totalFiltered = Object.values(freq).reduce((a, b) => a + b, 0);
  const topKeywords = sorted.map(([word, count]) => ({
    word,
    count,
    pct: totalFiltered > 0 ? (count / totalFiltered) * 100 : 0,
  }));

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeSeconds,
    speakingTimeSeconds,
    topKeywords,
  };
}

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}
