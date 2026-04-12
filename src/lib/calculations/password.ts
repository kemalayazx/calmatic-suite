export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
const AMBIGUOUS = /[0O1Ill]/g;

export function buildCharset(opts: PasswordOptions): string {
  let charset = "";
  if (opts.uppercase) charset += UPPERCASE;
  if (opts.lowercase) charset += LOWERCASE;
  if (opts.numbers) charset += NUMBERS;
  if (opts.symbols) charset += SYMBOLS;
  if (opts.excludeAmbiguous) charset = charset.replace(AMBIGUOUS, "");
  return charset;
}

export function generatePassword(opts: PasswordOptions): string {
  const charset = buildCharset(opts);
  if (!charset) return "";
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => charset[v % charset.length]).join("");
}

export function generatePasswords(opts: PasswordOptions, count: number): string[] {
  return Array.from({ length: count }, () => generatePassword(opts));
}

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";
  entropy: number;
  color: string;
}

export function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: "Weak", entropy: 0, color: "#ef4444" };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = Math.log2(Math.pow(poolSize || 1, password.length));

  let score: 0 | 1 | 2 | 3 | 4;
  let label: "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";
  let color: string;

  if (entropy < 28) {
    score = 0; label = "Weak"; color = "#ef4444";
  } else if (entropy < 56) {
    score = 1; label = "Fair"; color = "#f97316";
  } else if (entropy < 80) {
    score = 2; label = "Good"; color = "#eab308";
  } else if (entropy < 112) {
    score = 3; label = "Strong"; color = "#22c55e";
  } else {
    score = 4; label = "Very Strong"; color = "#10b981";
  }

  return { score, label, entropy, color };
}
