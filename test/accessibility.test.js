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
  assert.match(html, /<button[\s\S]*?id="companion-toggle"[\s\S]*?aria-expanded="false"[\s\S]*?aria-controls="companion-desk"[\s\S]*?>Companion<\/button>/);
  assert.match(html, /<aside id="companion-desk"[^>]*aria-labelledby="companion-desk-heading"[^>]*hidden>/);
  assert.match(html, /<h2 id="companion-desk-heading">Companion Desk<\/h2>/);
  assert.match(html, /<label[^>]*for="companion-reply">Paste your companion’s reply<\/label>/);
  assert.match(html, /<textarea id="companion-reply"[^>]*><\/textarea>/);
  assert.match(html, /<button id="companion-copy"[^>]*type="button">Copy for companion<\/button>/);
  assert.match(html, /<button id="companion-submit"[^>]*type="button">Submit companion guess<\/button>/);
  assert.match(html, /id="companion-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /<label[^>]*for="companion-manual"/);
  assert.match(html, /<textarea id="companion-manual"[^>]*readonly hidden><\/textarea>/);
});

test("rendered tiles expose evaluated feedback in accessible labels", () => {
  assert.match(app, /correct: "correct"/);
  assert.match(app, /present: "present elsewhere"/);
  assert.match(app, /absent: "not in the word"/);
  assert.match(app, /tile\.setAttribute\("aria-label", label\)/);
});

test("Companion Desk submits through the public companion API", () => {
  assert.match(app, /companion\.api\.submitGuess\(parsed\.word\)/);
  const deskHandler = app.slice(app.indexOf('companionSubmit.addEventListener("click"'));
  assert.doesNotMatch(deskHandler, /commitGuess\(/);
});
