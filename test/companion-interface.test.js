import assert from "node:assert/strict";
import test from "node:test";

import { createCompanionInterface } from "../js/companion-interface.js";
import { createGame, submitGuess } from "../js/game-engine.js";

const DATE = "2026-08-17";
const SECRET = "whale";
const DEFINITION = "A distinctive secret definition.";

function harness(initialGame = createGame(DATE, SECRET)) {
  let game = initialGame;
  let commits = 0;
  const controller = createCompanionInterface({
    getGame: () => game,
    commitGuess(word) {
      game = submitGuess(game, word);
      commits += 1;
    },
    metadataForAnswer: (answer) => answer === SECRET ? { definition: DEFINITION } : null
  });
  return {
    ...controller,
    game: () => game,
    commits: () => commits,
    humanGuess(word) {
      game = submitGuess(game, word);
      controller.notify();
    }
  };
}

test("playing snapshots expose only the documented public state", () => {
  const { api } = harness();
  assert.deepEqual(api.getState(), {
    protocolVersion: 1,
    date: DATE,
    status: "playing",
    wordLength: 5,
    maxGuesses: 6,
    remainingGuesses: 6,
    guesses: [],
    keyboard: {},
    reveal: null
  });
  assert.equal(api.version, 1);
  assert.equal(Object.isFrozen(api), true);
});

test("playing snapshots contain neither answer nor definition", () => {
  const state = harness().api.getState();
  assert.equal("answer" in state, false);
  assert.equal("definition" in state, false);
  assert.equal(JSON.stringify(state).includes(SECRET), false);
  assert.equal(JSON.stringify(state).includes(DEFINITION), false);
});

test("completed snapshots reveal the answer and available definition", () => {
  const won = submitGuess(createGame(DATE, SECRET), SECRET);
  assert.deepEqual(harness(won).api.getState().reveal, {
    answer: SECRET,
    definition: DEFINITION
  });

  const controller = createCompanionInterface({
    getGame: () => won,
    commitGuess: () => {},
    metadataForAnswer: () => null
  });
  assert.deepEqual(controller.api.getState().reveal, { answer: SECRET, definition: null });
});

test("guess order, feedback order, remaining guesses, and strongest keyboard state are preserved", () => {
  let game = createGame(DATE, SECRET);
  game = submitGuess(game, "eager");
  game = submitGuess(game, "crane");
  const state = harness(game).api.getState();

  assert.deepEqual(state.guesses, game.guesses);
  assert.equal(state.remainingGuesses, 4);
  assert.equal(state.keyboard.e, "correct");
  assert.equal(state.keyboard.a, "correct");
  assert.equal(state.keyboard.c, "absent");
});

test("mutating snapshots cannot alter the underlying game or later snapshots", () => {
  const h = harness(submitGuess(createGame(DATE, SECRET), "crane"));
  const state = h.api.getState();
  state.guesses[0].word = SECRET;
  state.guesses[0].feedback[0] = "correct";
  state.keyboard.c = "correct";
  state.remainingGuesses = 0;

  assert.equal(h.game().guesses[0].word, "crane");
  assert.equal(h.api.getState().guesses[0].word, "crane");
  assert.equal(h.api.getState().remainingGuesses, 5);
});

test("valid companion submissions return structured success and use the commit callback", () => {
  const h = harness();
  const result = h.api.submitGuess(" CRANE ");
  assert.equal(result.ok, true);
  assert.equal(result.state.guesses[0].word, "crane");
  assert.equal(h.commits(), 1);
});

test("invalid vocabulary and malformed guesses return stable errors without mutation", () => {
  const h = harness();
  const before = h.api.getState();
  const invalid = h.api.submitGuess("zzzzz");
  const malformed = h.api.submitGuess("four");

  assert.equal(invalid.ok, false);
  assert.equal(invalid.error.code, "INVALID_GUESS");
  assert.equal(malformed.ok, false);
  assert.equal(malformed.error.code, "INVALID_INPUT");
  assert.deepEqual(h.api.getState(), before);
  assert.equal(h.commits(), 0);
  assert.equal(JSON.stringify([invalid, malformed]).includes(SECRET), false);
});

test("completed games reject further submissions without mutation", () => {
  const h = harness(submitGuess(createGame(DATE, SECRET), SECRET));
  const before = h.api.getState();
  const result = h.api.submitGuess("crane");
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "GAME_COMPLETE");
  assert.deepEqual(h.api.getState(), before);
  assert.equal(h.commits(), 0);
});

test("subscribers receive current state and successful companion and human updates", () => {
  const h = harness();
  const states = [];
  h.api.subscribe((state) => states.push(state));
  h.api.submitGuess("crane");
  h.humanGuess("spoil");

  assert.deepEqual(states.map((state) => state.guesses.length), [0, 1, 2]);
});

test("failed submissions emit no false state-change notifications", () => {
  const h = harness();
  let calls = 0;
  h.api.subscribe(() => { calls += 1; });
  h.api.submitGuess("zzzzz");
  h.api.submitGuess(null);
  assert.equal(calls, 1);
});

test("two subscribers receive updates and unsubscribe independently", () => {
  const h = harness();
  const first = [];
  const second = [];
  const unsubscribeFirst = h.api.subscribe((state) => first.push(state.guesses.length));
  const unsubscribeSecond = h.api.subscribe((state) => second.push(state.guesses.length));

  h.api.submitGuess("crane");
  unsubscribeFirst();
  h.api.submitGuess("spoil");
  unsubscribeSecond();
  h.api.submitGuess("thumb");

  assert.deepEqual(first, [0, 1]);
  assert.deepEqual(second, [0, 1, 2]);
});

test("a throwing subscriber cannot break other subscribers or gameplay", () => {
  const h = harness();
  const received = [];
  h.api.subscribe(() => { throw new Error(`do not leak ${SECRET}`); });
  h.api.subscribe((state) => received.push(state.guesses.length));

  const result = h.api.submitGuess("crane");
  assert.equal(result.ok, true);
  assert.deepEqual(received, [0, 1]);
  assert.equal(h.game().guesses.length, 1);
});

test("subscription snapshots are independent fresh data", () => {
  const h = harness();
  let second;
  h.api.subscribe((state) => { state.keyboard.injected = "correct"; });
  h.api.subscribe((state) => { second = state; });
  assert.equal("injected" in second.keyboard, false);
});
