import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../js/app.js", import.meta.url), "utf8");

test("the document retains its core accessibility relationships", () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<main class="game" aria-labelledby="game-heading">/);
  assert.match(html, /<h2 id="game-heading"[^>]*>Daily five-letter puzzle<\/h2>/);
  assert.match(html, /id="board"[^>]*role="grid"[^>]*aria-rowcount="6"[^>]*aria-colcount="5"/);
  assert.match(html, /<dialog id="stats-dialog"[^>]*aria-labelledby="stats-heading"/);
  assert.match(html, /id="share-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /<label[^>]*for="share-manual"/);
  assert.match(html, /<textarea id="share-manual"[^>]*readonly hidden><\/textarea>/);
});

test("rendered tiles expose evaluated feedback in accessible labels", () => {
  assert.match(app, /correct: "correct"/);
  assert.match(app, /present: "present elsewhere"/);
  assert.match(app, /absent: "not in the word"/);
  assert.match(app, /tile\.setAttribute\("aria-label", label\)/);
});
