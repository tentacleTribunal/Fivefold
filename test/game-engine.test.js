import assert from "node:assert/strict";
import test from "node:test";

import { ACCEPTED_GUESSES, isAcceptedGuess } from "../js/accepted-guesses.js";
import { ANSWER_METADATA, metadataForAnswer } from "../js/answer-metadata.js";
import { ENABLE_FIVE_LETTER_WORDS } from "../js/enable-words.js";
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

test("every answer has exactly one nonblank definition", () => {
  assert.equal(Object.keys(ANSWER_METADATA).length, ANSWERS.length);
  for (const answer of ANSWERS) {
    const metadata = metadataForAnswer(answer);
    assert.ok(metadata, answer);
    assert.equal(typeof metadata.definition, "string", answer);
    assert.notEqual(metadata.definition.trim(), "", answer);
  }
});

test("answer metadata contains only current lowercase five-letter answers", () => {
  const answers = new Set(ANSWERS);
  for (const key of Object.keys(ANSWER_METADATA)) {
    assert.match(key, /^[a-z]{5}$/, key);
    assert.equal(answers.has(key), true, key);
  }
});

test("metadata lookup fails gracefully for an unknown answer", () => {
  assert.equal(metadataForAnswer("xxxxx"), null);
});

test("ENABLE vocabulary accepts the hands QA case", () => {
  assert.equal(ENABLE_FIVE_LETTER_WORDS.includes("hands"), true);
  assert.equal(isAcceptedGuess("hands"), true);
});

test("bundled ENABLE entries are unique lowercase five-letter words", () => {
  assert.equal(new Set(ENABLE_FIVE_LETTER_WORDS).size, ENABLE_FIVE_LETTER_WORDS.length);
  for (const word of ENABLE_FIVE_LETTER_WORDS) assert.match(word, /^[a-z]{5}$/, word);
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

test("completed games restore with their terminal status", () => {
  const won = restoreGame({ version: 1, date: DATE, guesses: [{ word: "crane" }] }, DATE, "crane");
  const lost = restoreGame({
    version: 1,
    date: DATE,
    guesses: ["spoil", "thumb", "eager", "flint", "proud", "cabin"].map((word) => ({ word }))
  }, DATE, "crane");

  assert.equal(won.status, "won");
  assert.equal(lost.status, "lost");
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
