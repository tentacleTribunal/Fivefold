const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULE_START_UTC = Date.UTC(2026, 0, 1);

export const SCHEDULE_START_DATE = "2026-01-01";
export const SCHEDULE_END_DATE = "2027-08-17";

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

  // Future schedule for 2026-08-18 through 2027-08-17. Each curated answer
  // appears exactly once; new catalog additions occupy the first 269 dates.
  "green", "alert", "alive", "choir", "boost", "visit", "shout", "breed",
  "issue", "fluid", "acute", "shine", "logic", "block", "beard", "union",
  "dance", "clear", "smile", "pitch", "guest", "blade", "major", "print",
  "award", "later", "crazy", "zebra", "black", "eagle", "since", "grass",
  "pride", "rough", "round", "young", "cross", "elder", "asset", "eight",
  "cloak", "chair", "stock", "cause", "baker", "child", "bring", "globe",
  "error", "proof", "plain", "total", "cliff", "shirt", "owner", "wheel",
  "sport", "lover", "phone", "storm", "berry", "speed", "brass", "often",
  "catch", "might", "early", "fancy", "crash", "woman", "amuse", "image",
  "faith", "trend", "smoke", "blast", "short", "maker", "point", "night",
  "shore", "train", "buyer", "input", "cycle", "flash", "layer", "kneel",
  "cover", "mount", "argue", "entry", "empty", "today", "break", "brown",
  "olive", "paper", "below", "leave", "brain", "scene", "throw", "great",
  "outer", "fence", "aware", "prime", "forge", "month", "crawl", "heavy",
  "smart", "apron", "court", "ideal", "tough", "goose", "front", "title",
  "cheek", "burst", "harsh", "dress", "exact", "haste", "paint", "place",
  "apple", "inner", "frame", "tired", "shelf", "honey", "mayor", "horse",
  "grace", "least", "swept", "money", "first", "teach", "thing", "steep",
  "piece", "sugar", "solid", "board", "every", "crisp", "grant", "bench",
  "chief", "judge", "honor", "dirty", "value", "arrow", "guard", "watch",
  "laugh", "ready", "blind", "human", "guide", "stage", "alone", "share",
  "coach", "reach", "metal", "chase", "bread", "movie", "serve", "peach",
  "toxic", "model", "fifty", "scale", "elbow", "skill", "color", "label",
  "speak", "adore", "depth", "think", "funny", "under", "equal", "steel",
  "clerk", "steam", "bunch", "fever", "reply", "spine", "batch", "touch",
  "drama", "occur", "scope", "stake", "avoid", "sharp", "swear", "enjoy",
  "order", "flour", "pause", "focus", "whole", "fight", "apart", "raise",
  "claim", "waste", "pound", "water", "draft", "alien", "silly", "study",
  "chest", "exist", "truck", "plate", "liver", "spite", "north", "still",
  "shade", "daily", "flame", "carry", "music", "loose", "angel", "video",
  "trade", "alarm", "blend", "shake", "false", "beast", "dwell", "party",
  "doubt", "coast", "radio", "clock", "stain", "march", "cling", "thank",
  "royal", "count", "trust", "uncle", "chalk", "shift", "crowd", "fruit",
  "blank", "favor", "write", "spare", "broad",

  "flint", "gloom", "thumb", "vivid", "pearl", "slope", "tiger", "dairy",
  "queen", "quilt", "zesty", "wrist", "heart", "bloom", "jelly", "feast",
  "river", "ankle", "medal", "happy", "ocean", "cream", "novel", "grape",
  "field", "fairy", "nurse", "sound", "crane", "hinge", "drink", "dream",
  "skirt", "spoil", "beach", "whale", "trail", "giant", "cabin", "quiet",
  "badge", "grain", "proud", "torch", "woven", "ember", "crown", "polar",
  "ivory", "mouse", "waltz", "piano", "frost", "dodge", "unity", "banjo",
  "prism", "flock", "sheep", "stone", "youth", "opera", "candy", "knife",
  "coral", "clasp", "snail", "cloud", "eager", "straw", "toast", "lucky",
  "bland", "vapor", "swing", "plant", "lemon", "raven", "chess", "suite",
  "cider", "glory", "brush", "knack", "maple", "brave", "track", "mirth",
  "hound", "charm", "blaze", "plumb", "shrub", "melon", "brick", "light"
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
