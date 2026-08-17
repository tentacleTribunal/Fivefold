import { ANSWERS } from "./words.js";

// This intentionally small supplement covers common guesses that are not yet
// in the answer pool. It can be expanded without changing the game rules.
export const ADDITIONAL_GUESSES = Object.freeze([
  "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult",
  "after", "again", "agent", "agree", "ahead", "alarm", "album", "alert",
  "alien", "align", "alive", "allow", "alone", "along", "alter", "among",
  "anger", "angle", "angry", "apart", "apple", "apply", "arena", "argue",
  "arise", "array", "aside", "asset", "avoid", "awake", "award", "aware",
  "awful", "basic", "basis", "begin", "below", "bench", "birth", "black",
  "blame", "blind", "block", "blood", "board", "brain", "bread", "break",
  "brief", "bring", "broad", "brown", "build", "buyer", "carry", "catch",
  "cause", "chain", "chair", "chart", "chase", "cheap", "check", "chief",
  "child", "civil", "claim", "class", "clean", "clear", "climb", "clock",
  "close", "coach", "coast", "could", "count", "court", "cover", "crash",
  "cross", "cycle", "dance", "death", "delay", "depth", "dirty", "doubt",
  "dozen", "draft", "drama", "drawn", "dress", "drive", "early", "earth",
  "eight", "elite", "empty", "enemy", "enjoy", "enter", "entry", "equal",
  "error", "event", "every", "exact", "exist", "extra", "faith", "false",
  "fault", "favor", "fiber", "final", "first", "fixed", "floor", "focus",
  "force", "frame", "fresh", "front", "fruit", "glass", "grand", "grant",
  "grass", "great", "green", "group", "guard", "guess", "guest", "guide",
  "habit", "heavy", "horse", "hotel", "house", "human", "ideal", "image",
  "issue", "judge", "known", "large", "later", "learn", "least", "leave",
  "level", "local", "major", "metal", "might", "model", "money", "month",
  "motor", "mount", "movie", "music", "never", "night", "north", "offer",
  "often", "order", "other", "paint", "panel", "paper", "party", "peace",
  "phase", "phone", "piece", "pilot", "pitch", "place", "plain", "plane",
  "point", "power", "price", "prime", "print", "prior", "prize", "proof",
  "raise", "range", "rapid", "reach", "ready", "right", "round", "route",
  "royal", "rural", "scale", "scene", "scope", "score", "sense", "serve",
  "seven", "shall", "shape", "share", "sharp", "shift", "shirt", "shock",
  "shoot", "short", "shown", "sight", "since", "skill", "slate", "sleep", "small",
  "smart", "smile", "solid", "solve", "sorry", "south", "space", "speak",
  "speed", "spend", "sport", "staff", "stage", "stand", "start", "state",
  "steam", "steel", "stick", "still", "stock", "store", "story", "study",
  "style", "sugar", "table", "teach", "thank", "their", "theme", "there",
  "thick", "thing", "think", "third", "those", "three", "throw", "today",
  "topic", "total", "touch", "tough", "tower", "trade", "train", "treat",
  "trend", "trial", "truck", "truly", "trust", "truth", "twice", "under",
  "value", "video", "visit", "voice", "waste", "watch", "water", "wheel",
  "where", "which", "while", "white", "whole", "woman", "world", "worry",
  "worth", "would", "write", "wrong", "young"
]);

export const ACCEPTED_GUESSES = Object.freeze([
  ...new Set([...ANSWERS, ...ADDITIONAL_GUESSES])
]);

const acceptedGuessSet = new Set(ACCEPTED_GUESSES);

export function isAcceptedGuess(word) {
  return acceptedGuessSet.has(word);
}
