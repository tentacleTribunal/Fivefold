import {
  MAX_GUESSES,
  WORD_LENGTH,
  keyboardFeedback,
  restoreGame,
  submitGuess
} from "./game-engine.js";
import { answerForDate, localDateKey } from "./words.js";

const STORAGE_KEY = "fivefold:v1";
const KEY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"]
];

const board = document.querySelector("#board");
const keyboard = document.querySelector("#keyboard");
const message = document.querySelector("#message");
const date = localDateKey();
const answer = answerForDate(date);
let stored = loadStoredData();
let game = restoreGame(stored.currentGame, date, answer);
let currentInput = "";

function emptyHistory() {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    lastCompletedDate: null
  };
}

function loadStoredData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed?.version === 1
      ? { version: 1, currentGame: parsed.currentGame, history: { ...emptyHistory(), ...parsed.history } }
      : { version: 1, currentGame: null, history: emptyHistory() };
  } catch {
    return { version: 1, currentGame: null, history: emptyHistory() };
  }
}

function saveStoredData() {
  stored.currentGame = game;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // The game remains playable if storage is unavailable or full.
  }
}

function dayDifference(later, earlier) {
  const parse = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((parse(later) - parse(earlier)) / 86400000);
}

function recordCompletion() {
  const history = stored.history;
  if (history.lastCompletedDate === game.date) return;

  history.played += 1;
  if (game.status === "won") {
    history.wins += 1;
    history.currentStreak = history.lastCompletedDate && dayDifference(game.date, history.lastCompletedDate) === 1
      ? history.currentStreak + 1
      : 1;
    history.maxStreak = Math.max(history.maxStreak, history.currentStreak);
    history.guessDistribution[game.guesses.length - 1] += 1;
  } else {
    history.currentStreak = 0;
  }
  history.lastCompletedDate = game.date;
}

function createBoard() {
  for (let row = 0; row < MAX_GUESSES; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.className = "board-row";
    rowElement.setAttribute("role", "group");
    rowElement.setAttribute("aria-label", `Guess ${row + 1}`);
    for (let column = 0; column < WORD_LENGTH; column += 1) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("aria-label", "empty");
      rowElement.append(tile);
    }
    board.append(rowElement);
  }
}

function createKeyboard() {
  for (const row of KEY_ROWS) {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";
    for (const key of row) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `key${key.length > 1 ? " wide" : ""}`;
      button.dataset.key = key;
      button.textContent = key === "Backspace" ? "Delete" : key;
      button.setAttribute("aria-label", key);
      rowElement.append(button);
    }
    keyboard.append(rowElement);
  }
}

function render() {
  const rows = board.querySelectorAll(".board-row");
  rows.forEach((row, rowIndex) => {
    const completed = game.guesses[rowIndex];
    const pending = rowIndex === game.guesses.length ? currentInput : "";
    row.querySelectorAll(".tile").forEach((tile, columnIndex) => {
      const letter = completed?.word[columnIndex] || pending[columnIndex] || "";
      const feedback = completed?.feedback[columnIndex];
      tile.textContent = letter;
      tile.className = `tile${letter ? " filled" : ""}${feedback ? ` ${feedback}` : ""}`;
      tile.setAttribute("aria-label", letter ? `${letter}, ${feedback || "not submitted"}` : "empty");
    });
  });

  const keyFeedback = keyboardFeedback(game.guesses);
  keyboard.querySelectorAll(".key").forEach((key) => {
    const feedback = keyFeedback[key.dataset.key];
    key.className = `key${key.dataset.key.length > 1 ? " wide" : ""}${feedback ? ` ${feedback}` : ""}`;
  });

  if (game.status === "won") {
    message.textContent = `Solved in ${game.guesses.length}/6!`;
  } else if (game.status === "lost") {
    message.textContent = `The word was ${game.answer.toUpperCase()}.`;
  } else {
    message.textContent = "";
  }
}

function handleKey(key) {
  if (game.status !== "playing") return;

  if (key === "Backspace") {
    currentInput = currentInput.slice(0, -1);
    message.textContent = "";
  } else if (key === "Enter") {
    if (currentInput.length !== WORD_LENGTH) {
      message.textContent = "Enter five letters.";
      return;
    }
    game = submitGuess(game, currentInput);
    currentInput = "";
    if (game.status !== "playing") recordCompletion();
    saveStoredData();
  } else if (/^[a-z]$/i.test(key) && currentInput.length < WORD_LENGTH) {
    currentInput += key.toLowerCase();
    message.textContent = "";
  }
  render();
}

keyboard.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (button) handleKey(button.dataset.key);
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Enter" || event.key === "Backspace" || /^[a-z]$/i.test(event.key)) {
    event.preventDefault();
    handleKey(event.key);
  }
});

createBoard();
createKeyboard();
saveStoredData();
render();
