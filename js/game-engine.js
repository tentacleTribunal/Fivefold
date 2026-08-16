export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

const LETTERS_ONLY = /^[a-z]{5}$/;
const FEEDBACK_RANK = Object.freeze({ absent: 1, present: 2, correct: 3 });

function normalizeWord(word) {
  return typeof word === "string" ? word.trim().toLowerCase() : "";
}

function requireWord(word, label) {
  const normalized = normalizeWord(word);
  if (!LETTERS_ONLY.test(normalized)) {
    throw new TypeError(`${label} must be exactly five alphabetic letters`);
  }
  return normalized;
}

export function evaluateGuess(answerInput, guessInput) {
  const answer = requireWord(answerInput, "answer");
  const guess = requireWord(guessInput, "guess");
  const feedback = Array(WORD_LENGTH).fill("absent");
  const remaining = {};

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    if (guess[index] === answer[index]) {
      feedback[index] = "correct";
    } else {
      remaining[answer[index]] = (remaining[answer[index]] || 0) + 1;
    }
  }

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    const letter = guess[index];
    if (feedback[index] !== "correct" && remaining[letter] > 0) {
      feedback[index] = "present";
      remaining[letter] -= 1;
    }
  }

  return feedback;
}

export function createGame(date, answerInput) {
  const answer = requireWord(answerInput, "answer");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new TypeError("date must use YYYY-MM-DD format");
  }

  return { version: 1, date, answer, guesses: [], status: "playing" };
}

export function submitGuess(game, guessInput) {
  if (game.status !== "playing") {
    throw new Error("This game is already complete");
  }

  const word = requireWord(guessInput, "guess");
  const feedback = evaluateGuess(game.answer, word);
  const guesses = [...game.guesses, { word, feedback }];
  const won = feedback.every((result) => result === "correct");
  const status = won ? "won" : guesses.length >= MAX_GUESSES ? "lost" : "playing";
  return { ...game, guesses, status };
}

export function restoreGame(saved, date, answer) {
  let game = createGame(date, answer);
  if (!saved || saved.version !== 1 || saved.date !== date || !Array.isArray(saved.guesses)) {
    return game;
  }

  for (const entry of saved.guesses.slice(0, MAX_GUESSES)) {
    if (game.status !== "playing") break;
    try {
      game = submitGuess(game, entry?.word);
    } catch {
      break;
    }
  }
  return game;
}

export function keyboardFeedback(guesses) {
  const result = {};
  for (const guess of guesses) {
    guess.word.split("").forEach((letter, index) => {
      const feedback = guess.feedback[index];
      if (!result[letter] || FEEDBACK_RANK[feedback] > FEEDBACK_RANK[result[letter]]) {
        result[letter] = feedback;
      }
    });
  }
  return result;
}
