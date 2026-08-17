import {
  InvalidGuessError,
  MAX_GUESSES,
  WORD_LENGTH,
  keyboardFeedback
} from "./game-engine.js";

export const COMPANION_PROTOCOL_VERSION = 1;

const COMPLETE_MESSAGE = "This game is already complete.";
const INPUT_MESSAGE = "Guess must be exactly five alphabetic letters.";
const INTERNAL_MESSAGE = "The guess could not be submitted.";

function snapshotFor(game, metadataLookup) {
  const complete = game.status !== "playing";
  const metadata = complete ? metadataLookup(game.answer) : null;

  return {
    protocolVersion: COMPANION_PROTOCOL_VERSION,
    date: game.date,
    status: game.status,
    wordLength: WORD_LENGTH,
    maxGuesses: MAX_GUESSES,
    remainingGuesses: Math.max(0, MAX_GUESSES - game.guesses.length),
    guesses: game.guesses.map(({ word, feedback }) => ({ word, feedback: [...feedback] })),
    keyboard: { ...keyboardFeedback(game.guesses) },
    reveal: complete
      ? { answer: game.answer, definition: metadata?.definition ?? null }
      : null
  };
}

export function createCompanionInterface({ getGame, commitGuess, metadataForAnswer = () => null }) {
  if (typeof getGame !== "function" || typeof commitGuess !== "function") {
    throw new TypeError("getGame and commitGuess must be functions");
  }

  const listeners = new Set();
  const getState = () => snapshotFor(getGame(), metadataForAnswer);

  function deliver(listener) {
    try {
      listener(getState());
    } catch {
      // Companion failures are isolated from gameplay and other subscribers.
    }
  }

  function notify() {
    for (const listener of [...listeners]) deliver(listener);
  }

  function failure(code, message) {
    return { ok: false, error: { code, message }, state: getState() };
  }

  function submit(word) {
    if (getGame().status !== "playing") return failure("GAME_COMPLETE", COMPLETE_MESSAGE);
    if (typeof word !== "string" || !/^[a-z]{5}$/i.test(word.trim())) {
      return failure("INVALID_INPUT", INPUT_MESSAGE);
    }

    try {
      commitGuess(word.trim().toLowerCase());
    } catch (error) {
      if (error instanceof InvalidGuessError) return failure("INVALID_GUESS", error.message);
      return failure("INTERNAL_ERROR", INTERNAL_MESSAGE);
    }

    notify();
    return { ok: true, state: getState() };
  }

  function subscribe(listener) {
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    listeners.add(listener);
    deliver(listener);
    return () => listeners.delete(listener);
  }

  const api = Object.freeze({
    version: COMPANION_PROTOCOL_VERSION,
    getState,
    submitGuess: submit,
    subscribe
  });

  return Object.freeze({ api, notify });
}
