const FEEDBACK_TEXT = {
  correct: "correct",
  present: "present elsewhere",
  absent: "not in the word"
};

const PROTOCOL_FOOTER = "Fivefold Companion Protocol v1";

function formatGuesses(guesses) {
  if (guesses.length === 0) return "Previous guesses: none yet.";

  const entries = guesses.map(({ word, feedback }) => {
    const letters = [...word.toUpperCase()];
    const results = letters.map((letter, index) =>
      `${letter} — ${FEEDBACK_TEXT[feedback[index]]}`
    );
    return [word.toUpperCase(), ...results].join("\n");
  });

  return `Previous guesses:\n${entries.join("\n\n")}`;
}

export function formatCompanionMessage(state) {
  const guesses = Array.isArray(state.guesses) ? state.guesses : [];
  const history = formatGuesses(guesses);

  if (state.status === "won" || state.status === "lost") {
    const outcome = state.status === "won" ? "won" : "lost";
    const definition = state.reveal?.definition
      ? `\nDefinition: ${state.reveal.definition}`
      : "";

    return `Fivefold FINAL update

The game is complete: ${outcome}.
Date: ${state.date}
Answer: ${state.reveal?.answer?.toUpperCase() ?? "Unavailable"}${definition}

${history}

${PROTOCOL_FOOTER}`;
  }

  return `You’re playing Fivefold with me.

Fivefold is a daily five-letter word puzzle. You have up to six guesses.

Choose your next guess. You may explain your reasoning if you like.
End your reply with exactly one line in this format:

FIVEFOLD_GUESS: crane

Current game:
Date: ${state.date}
Guesses remaining: ${state.remainingGuesses}

${history}

${PROTOCOL_FOOTER}`;
}

export function extractCompanionGuess(text) {
  if (typeof text !== "string") return noGuess();

  const trimmed = text.trim();
  if (/^[a-z]{5}$/i.test(trimmed)) {
    return { ok: true, word: trimmed.toLowerCase() };
  }

  const taggedLine = /^\s*FIVEFOLD_GUESS:\s*([a-z]{5})\s*$/gim;
  let match;
  let word = null;
  while ((match = taggedLine.exec(text)) !== null) word = match[1].toLowerCase();

  return word ? { ok: true, word } : noGuess();
}

function noGuess() {
  return {
    ok: false,
    error: {
      code: "NO_COMPANION_GUESS",
      message: "I couldn’t find a companion guess. Ask them to end with FIVEFOLD_GUESS: _____"
    }
  };
}
