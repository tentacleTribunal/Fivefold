import assert from "node:assert/strict";
import test from "node:test";

import { generateShareText } from "../js/share.js";

const GREEN = Array(5).fill("correct");

function game(status, feedbackRows, extras = {}) {
  return {
    version: 1,
    date: "2026-08-17",
    answer: "sphinxanswersecret",
    status,
    definition: "distinctive definition secret",
    guesses: feedbackRows.map((feedback, index) => ({
      word: `guesssecret${index}`,
      feedback
    })),
    ...extras
  };
}

test("a one-guess win has the correct heading and one all-green row", () => {
  assert.equal(
    generateShareText(game("won", [GREEN])),
    "Fivefold 2026-08-17 1/6\n\n🟩🟩🟩🟩🟩"
  );
});

test("a multi-guess win preserves feedback row order", () => {
  const output = generateShareText(game("won", [
    ["absent", "present", "absent", "correct", "present"],
    ["present", "absent", "correct", "absent", "absent"],
    GREEN
  ]));
  assert.deepEqual(output.split("\n").slice(2), ["⬛🟨⬛🟩🟨", "🟨⬛🟩⬛⬛", "🟩🟩🟩🟩🟩"]);
});

test("a six-guess win reports 6/6", () => {
  const output = generateShareText(game("won", Array(6).fill(GREEN)));
  assert.match(output, /^Fivefold 2026-08-17 6\/6$/m);
});

test("a loss reports exactly X/6", () => {
  const rows = Array(6).fill(["absent", "absent", "absent", "absent", "absent"]);
  assert.match(generateShareText(game("lost", rows)), /^Fivefold 2026-08-17 X\/6$/m);
});

test("feedback states map exactly to green, yellow, and black", () => {
  const output = generateShareText(game("won", [["correct", "present", "absent", "correct", "present"]]));
  assert.equal(output.split("\n")[2], "🟩🟨⬛🟩🟨");
});

test("repeated-letter feedback is represented as supplied without rescoring", () => {
  const supplied = ["correct", "present", "absent", "absent", "correct"];
  assert.equal(generateShareText(game("won", [supplied])).split("\n")[2], "🟩🟨⬛⬛🟩");
});

test("an in-progress game cannot generate share text", () => {
  assert.throws(() => generateShareText(game("playing", [])), /only after the game is complete/);
});

test("share output omits answer, guesses, definitions, and other internal data", () => {
  const output = generateShareText(game("won", [GREEN], { internalStorageSecret: "storage-secret" }));
  for (const secret of ["sphinxanswersecret", "guesssecret0", "distinctive definition secret", "storage-secret"]) {
    assert.equal(output.includes(secret), false, secret);
  }
  assert.match(output, /^Fivefold /);
});

test("every feedback row contains exactly five result squares", () => {
  const valid = generateShareText(game("won", [GREEN, GREEN])).split("\n").slice(2);
  for (const row of valid) assert.equal(Array.from(row).length, 5);

  assert.throws(
    () => generateShareText(game("won", [["correct", "correct", "correct", "correct"]])),
    /exactly five/
  );
});
