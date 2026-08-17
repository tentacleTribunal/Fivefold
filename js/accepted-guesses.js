import { ENABLE_FIVE_LETTER_WORDS } from "./enable-words.js";
import { ANSWERS } from "./words.js";

export const ACCEPTED_GUESSES = Object.freeze([
  ...new Set([...ANSWERS, ...ENABLE_FIVE_LETTER_WORDS])
]);

const acceptedGuessSet = new Set(ACCEPTED_GUESSES);

export function isAcceptedGuess(word) {
  return acceptedGuessSet.has(word);
}
