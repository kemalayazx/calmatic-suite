export interface Timezone {
  label: string;
  tz: string;
  city: string;
}

export const TIMEZONES: Timezone[] = [
  { label: "UTC (Coordinated Universal Time)", tz: "UTC", city: "UTC" },
  { label: "EST — Eastern Standard Time", tz: "America/New_York", city: "New York" },
  { label: "CST — Central Standard Time", tz: "America/Chicago", city: "Chicago" },
  { label: "MST — Mountain Standard Time", tz: "America/Denver", city: "Denver" },
  { label: "PST — Pacific Standard Time", tz: "America/Los_Angeles", city: "Los Angeles" },
  { label: "AKST — Alaska Standard Time", tz: "America/Anchorage", city: "Anchorage" },
  { label: "HST — Hawaii Standard Time", tz: "Pacific/Honolulu", city: "Honolulu" },
  { label: "GMT — Greenwich Mean Time", tz: "Europe/London", city: "London" },
  { label: "CET — Central European Time", tz: "Europe/Paris", city: "Paris" },
  { label: "EET — Eastern European Time", tz: "Europe/Helsinki", city: "Helsinki" },
  { label: "TRT — Turkey Time", tz: "Europe/Istanbul", city: "Istanbul" },
  { label: "MSK — Moscow Time", tz: "Europe/Moscow", city: "Moscow" },
  { label: "GST — Gulf Standard Time", tz: "Asia/Dubai", city: "Dubai" },
  { label: "IST — India Standard Time", tz: "Asia/Kolkata", city: "Mumbai" },
  { label: "BST — Bangladesh Standard Time", tz: "Asia/Dhaka", city: "Dhaka" },
  { label: "ICT — Indochina Time", tz: "Asia/Bangkok", city: "Bangkok" },
  { label: "CST — China Standard Time", tz: "Asia/Shanghai", city: "Shanghai" },
  { label: "JST — Japan Standard Time", tz: "Asia/Tokyo", city: "Tokyo" },
  { label: "KST — Korea Standard Time", tz: "Asia/Seoul", city: "Seoul" },
  { label: "AEST — Australian Eastern Time", tz: "Australia/Sydney", city: "Sydney" },
  { label: "ACST — Australian Central Time", tz: "Australia/Adelaide", city: "Adelaide" },
  { label: "AWST — Australian Western Time", tz: "Australia/Perth", city: "Perth" },
  { label: "NZST — New Zealand Standard Time", tz: "Pacific/Auckland", city: "Auckland" },
  { label: "SGT — Singapore Time", tz: "Asia/Singapore", city: "Singapore" },
  { label: "HKT — Hong Kong Time", tz: "Asia/Hong_Kong", city: "Hong Kong" },
  { label: "PKT — Pakistan Standard Time", tz: "Asia/Karachi", city: "Karachi" },
  { label: "AST — Arabia Standard Time", tz: "Asia/Riyadh", city: "Riyadh" },
  { label: "EAT — East Africa Time", tz: "Africa/Nairobi", city: "Nairobi" },
  { label: "WAT — West Africa Time", tz: "Africa/Lagos", city: "Lagos" },
  { label: "BRT — Brasilia Time", tz: "America/Sao_Paulo", city: "São Paulo" },
];

export const WORLD_CITIES: Timezone[] = [
  { label: "New York", tz: "America/New_York", city: "New York" },
  { label: "London", tz: "Europe/London", city: "London" },
  { label: "Tokyo", tz: "Asia/Tokyo", city: "Tokyo" },
  { label: "Sydney", tz: "Australia/Sydney", city: "Sydney" },
  { label: "Istanbul", tz: "Europe/Istanbul", city: "Istanbul" },
  { label: "Dubai", tz: "Asia/Dubai", city: "Dubai" },
];

export function convertTime(
  date: Date,
  fromTz: string,
  toTz: string
): { result: string; diff: number } {
  const fromOffset = getOffsetMinutes(date, fromTz);
  const toOffset = getOffsetMinutes(date, toTz);
  const diffMinutes = toOffset - fromOffset;
  const diffHours = diffMinutes / 60;

  const converted = new Date(date.getTime() + diffMinutes * 60 * 1000);
  const result = formatInTz(date, toTz);

  return { result, diff: diffHours };
}

export function formatInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    weekday: "short",
  }).format(date);
}

export function formatTimeOnly(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function getOffsetMinutes(date: Date, tz: string): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}
