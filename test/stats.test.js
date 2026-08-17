import assert from "node:assert/strict";
import test from "node:test";

import { createStats, parseStats, recordResult, summarizeStats } from "../js/stats.js";

function add(stats, date, status, guesses) {
  return recordResult(stats, date, { status, ...(guesses ? { guesses } : {}) });
}

test("empty stats have zeroed aggregates", () => {
  assert.deepEqual(summarizeStats(createStats()), {
    gamesPlayed: 0, wins: 0, winPercentage: 0, currentStreak: 0, maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0]
  });
});

test("a one-guess win records correctly", () => {
  assert.deepEqual(summarizeStats(add(createStats(), "2026-08-17", "won", 1)), {
    gamesPlayed: 1, wins: 1, winPercentage: 100, currentStreak: 1, maxStreak: 1,
    guessDistribution: [1, 0, 0, 0, 0, 0]
  });
});

test("a six-guess win records in bucket six", () => {
  assert.deepEqual(summarizeStats(add(createStats(), "2026-08-17", "won", 6)).guessDistribution,
    [0, 0, 0, 0, 0, 1]);
});

test("a loss affects played but not wins or distribution", () => {
  const summary = summarizeStats(add(createStats(), "2026-08-17", "lost"));
  assert.equal(summary.gamesPlayed, 1);
  assert.equal(summary.wins, 0);
  assert.deepEqual(summary.guessDistribution, [0, 0, 0, 0, 0, 0]);
});

test("recording the same date twice is idempotent", () => {
  const once = add(createStats(), "2026-08-17", "won", 2);
  assert.deepEqual(add(once, "2026-08-17", "won", 2), once);
});

test("a conflicting result preserves the first valid result", () => {
  const won = add(createStats(), "2026-08-17", "won", 2);
  const conflict = add(won, "2026-08-17", "lost");
  assert.deepEqual(conflict.results["2026-08-17"], { status: "won", guesses: 2 });
  assert.equal(summarizeStats(conflict).gamesPlayed, 1);
});

test("consecutive calendar-day wins increase current streak", () => {
  let stats = add(createStats(), "2026-08-17", "won", 2);
  stats = add(stats, "2026-08-18", "won", 3);
  assert.equal(summarizeStats(stats).currentStreak, 2);
});

test("a loss resets current streak and preserves maximum streak", () => {
  let stats = add(createStats(), "2026-08-17", "won", 2);
  stats = add(stats, "2026-08-18", "won", 3);
  stats = add(stats, "2026-08-19", "lost");
  assert.equal(summarizeStats(stats).currentStreak, 0);
  assert.equal(summarizeStats(stats).maxStreak, 2);
});

test("a missed calendar day breaks current streak", () => {
  let stats = add(createStats(), "2026-08-17", "won", 2);
  stats = add(stats, "2026-08-19", "won", 3);
  assert.equal(summarizeStats(stats).currentStreak, 1);
  assert.equal(summarizeStats(stats).maxStreak, 1);
});

test("maximum streak remains after a later broken streak", () => {
  let stats = add(createStats(), "2026-08-15", "won", 2);
  stats = add(stats, "2026-08-16", "won", 3);
  stats = add(stats, "2026-08-17", "lost");
  stats = add(stats, "2026-08-19", "won", 4);
  assert.equal(summarizeStats(stats).maxStreak, 2);
  assert.equal(summarizeStats(stats).currentStreak, 1);
});

test("multiple wins populate the correct distribution", () => {
  let stats = add(createStats(), "2026-08-15", "won", 1);
  stats = add(stats, "2026-08-16", "won", 4);
  stats = add(stats, "2026-08-17", "won", 4);
  assert.deepEqual(summarizeStats(stats).guessDistribution, [1, 0, 0, 2, 0, 0]);
});

test("invalid dates and result records are rejected", () => {
  assert.throws(() => add(createStats(), "2026-02-30", "won", 1), TypeError);
  assert.throws(() => add(createStats(), "2026-08-17", "won", 0), TypeError);
  assert.throws(() => add(createStats(), "2026-08-17", "playing", 1), TypeError);
});

test("deserialization safely ignores malformed storage and invalid records", () => {
  assert.deepEqual(parseStats("not json"), createStats());
  const parsed = parseStats(JSON.stringify({ version: 1, results: {
    "2026-08-17": { status: "won", guesses: 5 },
    "2026-02-30": { status: "lost" },
    "2026-08-18": { status: "won", guesses: 7 }
  } }));
  assert.deepEqual(parsed.results, { "2026-08-17": { status: "won", guesses: 5 } });
});

test("results are summarized chronologically regardless of insertion order", () => {
  let stats = add(createStats(), "2026-08-18", "won", 2);
  stats = add(stats, "2026-08-17", "won", 3);
  assert.equal(summarizeStats(stats).currentStreak, 2);
  assert.equal(summarizeStats(stats).maxStreak, 2);
});
