const MAX_GUESSES = 6;
const FEEDBACK_EMOJI = Object.freeze({
  correct: "🟩",
  present: "🟨",
  absent: "⬛"
});

export function generateShareText(game) {
  if (game?.status !== "won" && game?.status !== "lost") {
    throw new Error("Share results are available only after the game is complete");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(game.date) || !Array.isArray(game.guesses)) {
    throw new TypeError("Invalid completed game state");
  }

  const rows = game.guesses.map((guess) => {
    if (!Array.isArray(guess?.feedback) || guess.feedback.length !== 5) {
      throw new TypeError("Each guess must contain exactly five feedback states");
    }
    return guess.feedback.map((state) => {
      const emoji = FEEDBACK_EMOJI[state];
      if (!emoji) throw new TypeError(`Unknown feedback state: ${state}`);
      return emoji;
    }).join("");
  });

  if (rows.length < 1 || rows.length > MAX_GUESSES) {
    throw new TypeError("A completed game must contain between one and six guesses");
  }

  const result = game.status === "won" ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `Fivefold ${game.date} ${result}\n\n${rows.join("\n")}`;
}
