// The order is intentionally pre-shuffled. Do not sort this list: its order is
// the deterministic daily sequence, and every entry appears before it cycles.
export const ANSWERS = Object.freeze([
  "crane", "spoil", "thumb", "eager", "flint", "proud", "cabin", "waltz",
  "sheep", "brick", "ocean", "glory", "nurse", "piano", "frost", "badge",
  "quilt", "lemon", "swing", "vapor", "toast", "dairy", "chess", "bloom",
  "grape", "skirt", "novel", "hound", "pearl", "mirth", "jelly", "clasp",
  "river", "torch", "bland", "unity", "whale", "cream", "zesty", "hinge",
  "maple", "straw", "quiet", "dodge", "fairy", "plumb", "crown", "beach",
  "gloom", "knack", "ivory", "track", "medal", "brush", "snail", "opera",
  "field", "raven", "youth", "charm", "blaze", "suite", "drink", "polar",
  "woven", "flock", "giant", "prism", "heart", "cider", "slope", "banjo",
  "dream", "ankle", "tiger", "cloud", "feast", "grain", "shrub", "vivid",
  "mouse", "coral", "lucky", "plant", "wrist", "ember", "sound", "knife",
  "happy", "trail", "queen", "stone", "candy", "light", "brave", "melon"
]);

const EPOCH_UTC = Date.UTC(2026, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function answerForDate(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new TypeError("dateKey must use YYYY-MM-DD format");
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const utcDate = Date.UTC(year, month - 1, day);
  const dayNumber = Math.floor((utcDate - EPOCH_UTC) / DAY_MS);
  const index = ((dayNumber % ANSWERS.length) + ANSWERS.length) % ANSWERS.length;
  return ANSWERS[index];
}
