import assert from "node:assert/strict";
import test from "node:test";

import { ACCEPTED_GUESSES, isAcceptedGuess } from "../js/accepted-guesses.js";
import {
  InvalidGuessError,
  createGame,
  evaluateGuess,
  keyboardFeedback,
  restoreGame,
  submitGuess
} from "../js/game-engine.js";
import { ANSWERS, answerForDate } from "../js/words.js";

const DATE = "2026-01-01";

test("every answer is accepted as a guess", () => {
  for (const answer of ANSWERS) assert.equal(isAcceptedGuess(answer), true, answer);
});

test("accepted guesses are unique lowercase five-letter words", () => {
  assert.equal(new Set(ACCEPTED_GUESSES).size, ACCEPTED_GUESSES.length);
  for (const word of ACCEPTED_GUESSES) assert.match(word, /^[a-z]{5}$/, word);
});

test("an invalid new guess throws without mutating the game", () => {
  const game = createGame(DATE, "crane");
  const before = structuredClone(game);

  assert.throws(() => submitGuess(game, "zzzzz"), InvalidGuessError);
  assert.deepEqual(game, before);
});

test("a valid guess consumes one guess and produces feedback", () => {
  const game = createGame(DATE, "crane");
  const next = submitGuess(game, "spoil");

  assert.equal(next.guesses.length, game.guesses.length + 1);
  assert.equal(next.guesses[0].word, "spoil");
  assert.deepEqual(next.guesses[0].feedback, ["absent", "absent", "absent", "absent", "absent"]);
});

test("a syntactically valid legacy v1 guess restores without dictionary membership", () => {
  assert.equal(isAcceptedGuess("zzzzz"), false);
  const saved = { version: 1, date: DATE, guesses: [{ word: "zzzzz" }] };

  const restored = restoreGame(saved, DATE, "crane");

  assert.equal(restored.guesses.length, 1);
  assert.equal(restored.guesses[0].word, "zzzzz");
  assert.deepEqual(restored.guesses[0].feedback, Array(5).fill("absent"));
});

test("repeated letters are scored only as often as they occur in the answer", () => {
  assert.deepEqual(
    evaluateGuess("apple", "allee"),
    ["correct", "present", "absent", "absent", "correct"]
  );
});

test("a correct guess immediately wins", () => {
  const game = submitGuess(createGame(DATE, "crane"), "crane");

  assert.equal(game.status, "won");
  assert.equal(game.guesses.length, 1);
});

test("six unsuccessful guesses lose the game", () => {
  const guesses = ["spoil", "thumb", "eager", "flint", "proud", "cabin"];
  const game = guesses.reduce((current, guess) => submitGuess(current, guess), createGame(DATE, "crane"));

  assert.equal(game.status, "lost");
  assert.equal(game.guesses.length, 6);
});

test("keyboard feedback preserves the strongest state for each letter", () => {
  const guesses = [
    { word: "aaaaa", feedback: ["absent", "present", "correct", "absent", "present"] },
    { word: "bbbbb", feedback: ["present", "absent", "absent", "absent", "absent"] }
  ];

  assert.deepEqual(keyboardFeedback(guesses), { a: "correct", b: "present" });
});

test("daily answers are deterministic and unique for a complete cycle", () => {
  const dateForOffset = (offset) => {
    const date = new Date(Date.UTC(2026, 0, 1 + offset));
    return date.toISOString().slice(0, 10);
  };
  const dates = Array.from({ length: ANSWERS.length }, (_, offset) => dateForOffset(offset));
  const cycle = dates.map(answerForDate);

  assert.equal(answerForDate(DATE), answerForDate(DATE));
  assert.equal(new Set(cycle).size, ANSWERS.length);
  assert.equal(answerForDate(dateForOffset(ANSWERS.length)), answerForDate(DATE));
});
