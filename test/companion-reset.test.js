import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { formatCompanionMessage } from "../js/companion-desk.js";
import { createCompanionInterface } from "../js/companion-interface.js";
import { createGame, submitGuess } from "../js/game-engine.js";
import { createStats, recordResult } from "../js/stats.js";

const app = await readFile(new URL("../js/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const DATE = "2026-08-18";
const ANSWER = "whale";

function handlerFor(control, nextControl) {
  const start = app.indexOf(`${control}.addEventListener("click"`);
  const end = nextControl
    ? app.indexOf(`${nextControl}.addEventListener("click"`, start)
    : app.indexOf("\n});", start) + 4;
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return app.slice(start, end);
}

test("reset is a terminal-only Companion Desk control", () => {
  assert.match(html, /id="companion-reset-section"[\s\S]*hidden/);
  assert.match(html, /id="companion-reset-open"[\s\S]*>Reset for companion play<\/button>/);
  assert.match(app, /const companionComplete = game\.status !== "playing";[\s\S]*companionResetSection\.hidden = !companionComplete/);
});

test("opening and cancelling confirmation do not mutate the game", () => {
  const openHandler = handlerFor("companionResetOpen", "companionResetCancel");
  const cancelHandler = handlerFor("companionResetCancel", "companionResetConfirm");
  assert.doesNotMatch(openHandler, /game\s*=|saveStoredData|recordCompletion/);
  assert.doesNotMatch(cancelHandler, /game\s*=|saveStoredData|recordCompletion/);
  assert.match(openHandler, /companionResetConfirmation\.hidden = false/);
  assert.match(cancelHandler, /closeCompanionResetConfirmation\(companionResetOpen\)/);
});

test("confirmed reset uses createGame with the scheduled date and answer without recording stats", () => {
  const resetHandler = handlerFor("companionResetConfirm");
  assert.match(resetHandler, /game = createGame\(date, answer\)/);
  assert.match(resetHandler, /currentInput = ""/);
  assert.match(resetHandler, /saveStoredData\(\)/);
  assert.match(resetHandler, /render\(\)/);
  assert.match(resetHandler, /companion\.notify\(\)/);
  assert.doesNotMatch(resetHandler, /recordCompletion|STATS_STORAGE_KEY|localStorage|removeItem|clear\(/);
});

test("confirmed reset clears Companion Desk transient reply and manual fallback", () => {
  const resetHandler = handlerFor("companionResetConfirm");
  assert.match(resetHandler, /companionReply\.value = ""/);
  assert.match(resetHandler, /companionManual\.value = ""/);
  assert.match(resetHandler, /companionManual\.hidden = true/);
  assert.match(resetHandler, /Board reset for companion play\. Your stats are unchanged\./);
});

test("a reset game preserves date and answer while restoring fresh public state", () => {
  let game = submitGuess(createGame(DATE, ANSWER), ANSWER);
  game = createGame(game.date, game.answer);
  const companion = createCompanionInterface({
    getGame: () => game,
    commitGuess: () => {},
    metadataForAnswer: () => ({ definition: "secret definition" })
  });
  const state = companion.api.getState();

  assert.equal(game.date, DATE);
  assert.equal(game.answer, ANSWER);
  assert.equal(game.status, "playing");
  assert.deepEqual(game.guesses, []);
  assert.equal(state.status, "playing");
  assert.equal(state.remainingGuesses, 6);
  assert.deepEqual(state.guesses, []);
  assert.deepEqual(state.keyboard, {});
  assert.equal(state.reveal, null);
  assert.equal(JSON.stringify(state).includes(ANSWER), false);
});

test("the existing recorded result remains authoritative after replay completion", () => {
  const original = recordResult(createStats(), DATE, { status: "won", guesses: 4 });
  const replayResult = recordResult(original, DATE, { status: "won", guesses: 1 });
  assert.deepEqual(replayResult, original);
  assert.deepEqual(replayResult.results[DATE], { status: "won", guesses: 4 });
});

test("Copy for companion naturally formats the reset snapshot as an empty active packet", () => {
  const game = createGame(DATE, ANSWER);
  const companion = createCompanionInterface({
    getGame: () => game,
    commitGuess: () => {},
    metadataForAnswer: () => ({ definition: "secret definition" })
  });
  const packet = formatCompanionMessage(companion.api.getState());
  assert.match(packet, /Previous guesses: none yet\./);
  assert.match(packet, /Guesses remaining: 6/);
  assert.doesNotMatch(packet, /FINAL update|Answer:|Definition:|whale/i);
});

test("reset explicitly notifies existing companion subscribers", () => {
  const resetHandler = handlerFor("companionResetConfirm");
  assert.match(resetHandler, /render\(\);[\s\S]*companionStatus\.textContent[\s\S]*companion\.notify\(\)/);
});
