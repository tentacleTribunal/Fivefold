import assert from "node:assert/strict";
import test from "node:test";

import { ACCEPTED_GUESSES, isAcceptedGuess } from "../js/accepted-guesses.js";
import {
  ANSWER_SCHEDULE,
  SCHEDULE_END_DATE,
  SCHEDULE_START_DATE,
  answerForDate
} from "../js/answer-schedule.js";
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
import { ANSWERS } from "../js/words.js";
import { HISTORICAL_ANSWERS } from "./fixtures/historical-answers.js";

const DATE = "2026-01-01";
const PUBLISHED_COUNT = 229;
const ORIGINAL_ANSWER_COUNT = 96;

test("the curated answer catalog has 365 unique lowercase five-letter words", () => {
  assert.equal(ANSWERS.length, 365);
  assert.equal(new Set(ANSWERS).size, ANSWERS.length);
  for (const answer of ANSWERS) assert.match(answer, /^[a-z]{5}$/, answer);
});

test("every answer is accepted as a guess", () => {
  for (const answer of ANSWERS) assert.equal(isAcceptedGuess(answer), true, answer);
});

test("every answer has exactly one nonblank definition", () => {
  assert.equal(Object.keys(ANSWER_METADATA).length, ANSWERS.length);
  for (const answer of ANSWERS) {
    const metadata = metadataForAnswer(answer);
    assert.ok(metadata, answer);
    assert.deepEqual(Object.keys(metadata), ["definition"], answer);
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

function dateForOffset(offset) {
  return new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
}

test("all 229 published dates match the independent historical snapshot", () => {
  assert.equal(HISTORICAL_ANSWERS.length, PUBLISHED_COUNT);
  HISTORICAL_ANSWERS.forEach((expected, offset) => {
    assert.equal(answerForDate(dateForOffset(offset)), expected, dateForOffset(offset));
  });
});

test("the final published historical answer remains whale", () => {
  assert.equal(answerForDate("2026-08-17"), "whale");
});

test("the explicit schedule has the documented first and last dates", () => {
  assert.equal(ANSWER_SCHEDULE.length, 594);
  assert.equal(SCHEDULE_START_DATE, "2026-01-01");
  assert.equal(answerForDate(SCHEDULE_START_DATE), "crane");
  assert.equal(SCHEDULE_END_DATE, "2027-08-17");
  assert.equal(answerForDate(SCHEDULE_END_DATE), "light");
});

test("the future year is a permutation of the complete answer catalog", () => {
  const future = ANSWER_SCHEDULE.slice(PUBLISHED_COUNT);
  assert.equal(future.length, 365);
  assert.equal(new Set(future).size, 365);
  assert.deepEqual(new Set(future), new Set(ANSWERS));
});

test("all new answers precede reused original answers in the future schedule", () => {
  const future = ANSWER_SCHEDULE.slice(PUBLISHED_COUNT);
  const originalAnswers = new Set(ANSWERS.slice(0, ORIGINAL_ANSWER_COUNT));
  const newAnswers = new Set(ANSWERS.slice(ORIGINAL_ANSWER_COUNT));

  assert.equal(future.slice(0, 269).every((answer) => newAnswers.has(answer)), true);
  assert.equal(future.slice(269).every((answer) => originalAnswers.has(answer)), true);
});

test("the schedule rejects invalid and unscheduled dates", () => {
  assert.throws(() => answerForDate("2026-02-31"), RangeError);
  assert.throws(() => answerForDate("not-a-date"), TypeError);
  assert.throws(() => answerForDate("2025-12-31"), RangeError);
  assert.throws(() => answerForDate("2027-08-18"), RangeError);
});

test("every scheduled answer belongs to the catalog and its related data", () => {
  const catalog = new Set(ANSWERS);
  for (const answer of ANSWER_SCHEDULE) {
    assert.equal(catalog.has(answer), true, answer);
    assert.ok(metadataForAnswer(answer), answer);
    assert.equal(isAcceptedGuess(answer), true, answer);
  }
});

test("catalog growth cannot influence the dated schedule", () => {
  const expandedCatalog = Object.freeze([...ANSWERS, "extra"]);
  assert.equal(expandedCatalog.length, ANSWERS.length + 1);
  HISTORICAL_ANSWERS.forEach((expected, offset) => {
    assert.equal(answerForDate(dateForOffset(offset)), expected);
  });
});

test("appending schedule entries cannot alter earlier dates", () => {
  const extendedSchedule = Object.freeze([...ANSWER_SCHEDULE, "crane"]);
  ANSWER_SCHEDULE.forEach((expected, offset) => {
    assert.equal(answerForDate(dateForOffset(offset), extendedSchedule), expected);
  });
  assert.equal(answerForDate("2027-08-18", extendedSchedule), "crane");
});

test("representative in-progress and completed v1 games retain historical behavior", () => {
  const date = "2026-08-17";
  const answer = answerForDate(date);
  const savedPlaying = { version: 1, date, answer, guesses: [{ word: "crane" }] };
  const playing = restoreGame(savedPlaying, date, answer);
  assert.equal(playing.answer, "whale");
  assert.equal(playing.status, "playing");
  assert.deepEqual(playing.guesses[0].feedback, evaluateGuess("whale", "crane"));

  const savedWon = { version: 1, date, answer, guesses: [{ word: "whale" }] };
  const won = restoreGame(savedWon, date, answer);
  assert.equal(won.answer, "whale");
  assert.equal(won.status, "won");
  assert.deepEqual(won.guesses[0].feedback, Array(5).fill("correct"));

  const losingWords = ["crane", "spoil", "thumb", "eager", "flint", "proud"];
  const savedLost = {
    version: 1,
    date,
    answer,
    guesses: losingWords.map((word) => ({ word }))
  };
  const lost = restoreGame(savedLost, date, answer);
  assert.equal(lost.answer, "whale");
  assert.equal(lost.status, "lost");
  assert.equal(lost.guesses.length, 6);
  lost.guesses.forEach((guess, index) => {
    assert.deepEqual(guess.feedback, evaluateGuess("whale", losingWords[index]));
  });
});
