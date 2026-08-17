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
  "happy", "trail", "queen", "stone", "candy", "light", "brave", "melon"
]);

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
