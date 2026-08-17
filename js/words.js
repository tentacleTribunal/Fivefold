// Curated words that are eligible to be daily answers. Scheduling is maintained
// separately in answer-schedule.js.
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
  "happy", "trail", "queen", "stone", "candy", "light", "brave", "melon",
  "apple", "chair", "smile", "water", "green", "bread", "black", "horse", "dance",
  "adore", "acute", "alarm", "alert", "alien", "alive", "alone", "amuse", "angel",
  "apart", "apron", "argue", "arrow", "asset", "avoid", "award", "aware", "baker",
  "batch", "beard", "beast", "below", "bench", "berry", "blade", "blank", "blast",
  "blend", "blind", "block", "board", "boost", "brain", "brass", "break", "breed",
  "bring", "broad", "brown", "bunch", "burst", "buyer", "carry", "catch", "cause",
  "chalk", "chase", "cheek", "chest", "chief", "child", "choir", "claim", "clear",
  "clerk", "cliff", "cling", "cloak", "clock", "coach", "coast", "color", "count",
  "court", "cover", "crash", "crawl", "crazy", "crisp", "cross", "crowd", "cycle",
  "daily", "depth", "dirty", "doubt", "draft", "drama", "dress", "dwell", "eagle",
  "early", "eight", "elbow", "elder", "empty", "enjoy", "entry", "equal", "error",
  "every", "exact", "exist", "faith", "false", "fancy", "favor", "fence", "fever",
  "fifty", "fight", "first", "flame", "flash", "flour", "fluid", "focus", "forge",
  "frame", "front", "fruit", "funny", "globe", "goose", "grace", "grant", "grass",
  "great", "guard", "guest", "guide", "harsh", "haste", "heavy", "honey", "honor",
  "human", "ideal", "image", "inner", "input", "issue", "judge", "kneel", "label",
  "later", "laugh", "layer", "least", "leave", "liver", "logic", "loose", "lover",
  "major", "maker", "march", "mayor", "metal", "might", "model", "money", "month",
  "mount", "movie", "music", "night", "north", "occur", "often", "olive", "order",
  "outer", "owner", "paint", "paper", "party", "pause", "peach", "phone", "piece",
  "pitch", "place", "plain", "plate", "point", "pound", "pride", "prime", "print",
  "proof", "radio", "raise", "reach", "ready", "reply", "rough", "round", "royal",
  "scale", "scene", "scope", "serve", "shade", "shake", "share", "sharp", "shelf",
  "shift", "shine", "shirt", "shore", "short", "shout", "silly", "since", "skill",
  "smart", "smoke", "solid", "spare", "speak", "speed", "spine", "spite", "sport",
  "stage", "stain", "stake", "steam", "steel", "steep", "still", "stock", "storm",
  "study", "sugar", "swear", "swept", "teach", "thank", "thing", "think", "throw",
  "tired", "title", "today", "total", "touch", "tough", "toxic", "trade", "train",
  "trend", "truck", "trust", "uncle", "under", "union", "value", "video", "visit",
  "waste", "watch", "wheel", "whole", "woman", "write", "young", "zebra"
]);

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
