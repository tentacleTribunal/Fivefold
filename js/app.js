import {
  InvalidGuessError,
  MAX_GUESSES,
  WORD_LENGTH,
  keyboardFeedback,
  restoreGame,
  submitGuess
} from "./game-engine.js";
import { metadataForAnswer } from "./answer-metadata.js";
import { answerForDate } from "./answer-schedule.js";
import { localDateKey } from "./words.js";
import { generateShareText } from "./share.js";
import { copyText } from "./clipboard.js";
import {
  STATS_STORAGE_KEY,
  createStats,
  parseStats,
  recordResult,
  summarizeStats
} from "./stats.js";

const STORAGE_KEY = "fivefold:v1";
const KEY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"]
];

const board = document.querySelector("#board");
const keyboard = document.querySelector("#keyboard");
const message = document.querySelector("#message");
const answerCard = document.querySelector("#answer-card");
const answerCardLabel = document.querySelector("#answer-card-label");
const answerCardDate = document.querySelector("#answer-card-date");
const answerCardWord = document.querySelector("#answer-card-word");
const answerCardDefinition = document.querySelector("#answer-card-definition");
const shareControls = document.querySelector("#share-controls");
const shareButton = document.querySelector("#share-button");
const shareStatus = document.querySelector("#share-status");
const shareManual = document.querySelector("#share-manual");
const statsButton = document.querySelector("#stats-button");
const statsDialog = document.querySelector("#stats-dialog");
const statsClose = document.querySelector("#stats-close");
const statsSummary = document.querySelector("#stats-summary");
const guessDistribution = document.querySelector("#guess-distribution");
const date = localDateKey();
const answer = answerForDate(date);
let stored = loadStoredData();
let game = restoreGame(stored.currentGame, date, answer);
let stats = loadStats();
let currentInput = "";
let shareStatusTimer;

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

function loadStats() {
  try {
    return parseStats(localStorage.getItem(STATS_STORAGE_KEY));
  } catch {
    return createStats();
  }
}

function recordCompletion() {
  if (game.status === "playing") return;
  stats = recordResult(stats, game.date, game.status === "won"
    ? { status: "won", guesses: game.guesses.length }
    : { status: "lost" });
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // The game remains playable if storage is unavailable or full.
  }
}

function renderStats() {
  const summary = summarizeStats(stats);
  const values = [
    ["Played", summary.gamesPlayed],
    ["Win %", summary.winPercentage],
    ["Current streak", summary.currentStreak],
    ["Max streak", summary.maxStreak]
  ];
  statsSummary.replaceChildren(...values.map(([label, value]) => {
    const item = document.createElement("div");
    item.className = "stat-item";
    item.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    return item;
  }));

  const largest = Math.max(...summary.guessDistribution, 1);
  guessDistribution.replaceChildren(...summary.guessDistribution.map((count, index) => {
    const row = document.createElement("div");
    row.className = "distribution-row";
    row.setAttribute("aria-label", `${index + 1} guesses: ${count} wins`);
    const width = count === 0 ? 8 : Math.max(12, (count / largest) * 100);
    row.innerHTML = `<span>${index + 1}</span><span class="distribution-bar" style="width: ${width}%">${count}</span>`;
    return row;
  }));
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

  const metadata = game.status === "playing" ? null : metadataForAnswer(game.answer);
  answerCard.hidden = !metadata;
  answerCardLabel.hidden = !metadata;
  answerCardDate.textContent = metadata ? game.date : "";
  answerCardDate.dateTime = metadata ? game.date : "";
  answerCardWord.textContent = metadata ? game.answer : "";
  answerCardDefinition.textContent = metadata?.definition ?? "";
  shareControls.hidden = game.status === "playing";
  if (game.status === "playing") {
    shareStatus.textContent = "";
    shareManual.hidden = true;
  }
}

function showShareStatus(text, clearAfter = 3000) {
  window.clearTimeout(shareStatusTimer);
  shareStatus.textContent = text;
  if (clearAfter) {
    shareStatusTimer = window.setTimeout(() => {
      shareStatus.textContent = "";
    }, clearAfter);
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
    try {
      game = submitGuess(game, currentInput);
    } catch (error) {
      if (error instanceof InvalidGuessError) {
        message.textContent = error.message;
        return;
      }
      throw error;
    }
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

statsButton.addEventListener("click", () => {
  renderStats();
  statsDialog.showModal();
});
statsClose.addEventListener("click", () => statsDialog.close());
statsDialog.addEventListener("click", (event) => {
  if (event.target === statsDialog) statsDialog.close();
});

shareButton.addEventListener("click", async () => {
  const shareText = generateShareText(game);
  shareManual.hidden = true;

  if (await copyText(shareText)) {
    showShareStatus("Copied!");
  } else {
    shareManual.value = shareText;
    shareManual.hidden = false;
    showShareStatus("Copy manually below:", 0);
    shareManual.focus();
    shareManual.select();
  }
});

createBoard();
createKeyboard();
if (game.status !== "playing") recordCompletion();
saveStoredData();
render();
