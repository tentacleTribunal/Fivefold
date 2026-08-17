export const STATS_STORAGE_KEY = "fivefold:stats:v1";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function createStats() {
  return { version: 1, results: {} };
}

function dateValue(date) {
  if (typeof date !== "string") return null;
  const match = DATE_PATTERN.exec(date);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const value = Date.UTC(year, month - 1, day);
  const parsed = new Date(value);
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    ? value
    : null;
}

function normalizeResult(result) {
  if (result?.status === "lost") return { status: "lost" };
  if (result?.status === "won" && Number.isInteger(result.guesses)
    && result.guesses >= 1 && result.guesses <= 6) {
    return { status: "won", guesses: result.guesses };
  }
  return null;
}

export function parseStats(serialized) {
  let parsed;
  try {
    parsed = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
  } catch {
    return createStats();
  }

  if (parsed?.version !== 1 || !parsed.results || typeof parsed.results !== "object"
    || Array.isArray(parsed.results)) {
    return createStats();
  }

  const results = {};
  for (const [date, result] of Object.entries(parsed.results)) {
    const normalized = normalizeResult(result);
    if (dateValue(date) !== null && normalized) results[date] = normalized;
  }
  return { version: 1, results };
}

export function recordResult(stats, date, result) {
  if (dateValue(date) === null) throw new TypeError("date must be a valid YYYY-MM-DD calendar date");
  const normalized = normalizeResult(result);
  if (!normalized) throw new TypeError("result must be a win with 1-6 guesses or a loss");

  const current = parseStats(stats);
  if (Object.hasOwn(current.results, date)) return current;
  return { version: 1, results: { ...current.results, [date]: normalized } };
}

export function summarizeStats(stats) {
  const entries = Object.entries(parseStats(stats).results)
    .map(([date, result]) => ({ date, day: dateValue(date), ...result }))
    .sort((a, b) => a.day - b.day);
  const guessDistribution = [0, 0, 0, 0, 0, 0];
  let wins = 0;
  let run = 0;
  let maxStreak = 0;
  let previousDay = null;

  for (const result of entries) {
    if (result.status === "won") {
      wins += 1;
      guessDistribution[result.guesses - 1] += 1;
      run = previousDay !== null && result.day - previousDay === DAY_MS ? run + 1 : 1;
      maxStreak = Math.max(maxStreak, run);
    } else {
      run = 0;
    }
    previousDay = result.day;
  }

  return {
    gamesPlayed: entries.length,
    wins,
    winPercentage: entries.length === 0 ? 0 : Math.round((wins / entries.length) * 100),
    currentStreak: entries.at(-1)?.status === "won" ? run : 0,
    maxStreak,
    guessDistribution
  };
}
