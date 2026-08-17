const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULE_START_UTC = Date.UTC(2026, 0, 1);

export const SCHEDULE_START_DATE = "2026-01-01";
export const SCHEDULE_END_DATE = "2026-08-31";

export const ANSWER_SCHEDULE = Object.freeze([
  // Published history through 2026-08-17. These assignments are immutable.
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
  "happy", "trail", "queen", "stone", "candy", "light", "brave", "melon",
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
  "happy", "trail", "queen", "stone", "candy", "light", "brave", "melon",
  "crane", "spoil", "thumb", "eager", "flint", "proud", "cabin", "waltz",
  "sheep", "brick", "ocean", "glory", "nurse", "piano", "frost", "badge",
  "quilt", "lemon", "swing", "vapor", "toast", "dairy", "chess", "bloom",
  "grape", "skirt", "novel", "hound", "pearl", "mirth", "jelly", "clasp",
  "river", "torch", "bland", "unity", "whale",

  // Unpublished runway for 2026-08-18 through 2026-08-31. These may be
  // deliberately replaced before publication during the catalog expansion.
  "cream", "zesty", "hinge", "maple", "straw", "quiet", "dodge", "fairy",
  "plumb", "crown", "beach", "gloom", "knack", "ivory"
]);

function utcTimeForDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new TypeError("dateKey must use YYYY-MM-DD format");
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const utcTime = Date.UTC(year, month - 1, day);
  const date = new Date(utcTime);
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${dateKey}`);
  }
  return utcTime;
}

export function answerForDate(dateKey, schedule = ANSWER_SCHEDULE) {
  const dayOffset = Math.floor((utcTimeForDateKey(dateKey) - SCHEDULE_START_UTC) / DAY_MS);
  if (dayOffset < 0 || dayOffset >= schedule.length) {
    throw new RangeError(`No answer is scheduled for ${dateKey}`);
  }
  return schedule[dayOffset];
}
