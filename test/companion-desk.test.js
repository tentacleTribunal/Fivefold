import assert from "node:assert/strict";
import test from "node:test";

import { extractCompanionGuess, formatCompanionMessage } from "../js/companion-desk.js";

const active = {
  protocolVersion: 1,
  date: "2026-08-17",
  status: "playing",
  wordLength: 5,
  maxGuesses: 6,
  remainingGuesses: 6,
  guesses: [],
  keyboard: {},
  reveal: null
};

test("empty active packet is readable and includes game facts and reply format", () => {
  const message = formatCompanionMessage(active);
  assert.match(message, /You’re playing Fivefold with me\./);
  assert.match(message, /Previous guesses: none yet\./);
  assert.match(message, /Fivefold Companion Protocol v1/);
  assert.match(message, /Date: 2026-08-17/);
  assert.match(message, /Guesses remaining: 6/);
  assert.match(message, /FIVEFOLD_GUESS: crane/);
});

test("active packet includes committed guesses and ordered, clear feedback", () => {
  const state = {
    ...active,
    remainingGuesses: 4,
    guesses: [
      { word: "crane", feedback: ["absent", "present", "correct", "absent", "present"] },
      { word: "spoil", feedback: ["correct", "absent", "present", "correct", "absent"] }
    ]
  };
  const message = formatCompanionMessage(state);
  const expectedFirst = "CRANE\nC — not in the word\nR — present elsewhere\nA — correct\nN — not in the word\nE — present elsewhere";
  assert.ok(message.includes(expectedFirst));
  assert.ok(message.indexOf("CRANE") < message.indexOf("SPOIL"));
  assert.match(message, /Guesses remaining: 4/);
});

test("active packet ignores distinctive secrets outside the public playing fields", () => {
  const secretAnswer = "XYZZY_SECRET_ANSWER";
  const secretDefinition = "DISTINCTIVE_SECRET_DEFINITION";
  const message = formatCompanionMessage({
    ...active,
    answer: secretAnswer,
    definition: secretDefinition,
    reveal: { answer: secretAnswer, definition: secretDefinition }
  });
  assert.equal(message.includes(secretAnswer), false);
  assert.equal(message.includes(secretDefinition), false);
  assert.equal(/Answer:/i.test(message), false);
  assert.equal(/Definition:/i.test(message), false);
});

test("completed win packet reveals answer and definition without requesting a guess", () => {
  const message = formatCompanionMessage({
    ...active,
    status: "won",
    remainingGuesses: 5,
    guesses: [{ word: "whale", feedback: Array(5).fill("correct") }],
    reveal: { answer: "whale", definition: "A large marine mammal." }
  });
  assert.match(message, /FINAL update/);
  assert.match(message, /game is complete: won/i);
  assert.match(message, /Answer: WHALE/);
  assert.match(message, /Definition: A large marine mammal\./);
  assert.match(message, /Fivefold Companion Protocol v1/);
  assert.doesNotMatch(message, /Choose your next guess|FIVEFOLD_GUESS/);
});

test("completed loss packet reveals the answer and tolerates no definition", () => {
  const message = formatCompanionMessage({
    ...active,
    status: "lost",
    remainingGuesses: 0,
    reveal: { answer: "whale", definition: null }
  });
  assert.match(message, /game is complete: lost/i);
  assert.match(message, /Answer: WHALE/);
  assert.doesNotMatch(message, /Definition:/);
  assert.doesNotMatch(message, /FIVEFOLD_GUESS/);
});

test("parser accepts and normalizes a plain five-letter response", () => {
  assert.deepEqual(extractCompanionGuess("  CrAnE\n"), { ok: true, word: "crane" });
});

test("parser reads a tagged line case-insensitively from a complete response", () => {
  const response = "I considered slate.\nMy choice is:\n fivefold_guess: CRANE  \nGood luck!";
  assert.deepEqual(extractCompanionGuess(response), { ok: true, word: "crane" });
});

test("parser chooses the last valid tagged line", () => {
  const response = "FIVEFOLD_GUESS: slate\nOn reflection:\nFIVEFOLD_GUESS: crane";
  assert.deepEqual(extractCompanionGuess(response), { ok: true, word: "crane" });
});

test("parser does not select arbitrary five-letter words in prose", () => {
  const result = extractCompanionGuess("I think crane would be a useful opening guess.");
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "NO_COMPANION_GUESS");
});

test("parser rejects missing and malformed tagged guesses without throwing", () => {
  for (const response of ["No final answer yet.", "FIVEFOLD_GUESS: four", "FIVEFOLD_GUESS: cranes", "FIVEFOLD_GUESS: cr4ne", null]) {
    const result = extractCompanionGuess(response);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "NO_COMPANION_GUESS");
  }
});
