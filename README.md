# Fivefold

Fivefold is a free daily five-letter word puzzle. Players have six attempts to
find the day's word, with correct, present, and absent feedback on the board and
keyboard.
After a puzzle is completed, the daily answer and a concise definition are
revealed beneath the game.
Completed games can also generate a spoiler-free emoji result. Sharing happens
locally through clipboard copy; the answer and guessed words are omitted.

## Run locally

The project has no dependencies or build step. Serve the repository root with
any static file server, then open `index.html` through that server. For example:

```sh
python3 -m http.server 8000
```

It can also be published directly from the repository root with GitHub Pages.

## Design

- `js/game-engine.js` contains DOM-free, serializable game rules.
- `js/accepted-guesses.js` combines the accepted-guess vocabulary with every
  word in the answer pool.
- `js/enable-words.js` contains the locally bundled accepted-guess vocabulary.
- `js/words.js` contains the curated answer catalog and local-date formatting.
- `js/answer-schedule.js` contains the explicit dated puzzle schedule and its
  deterministic local-calendar-date resolver.
- `js/answer-metadata.js` contains locally bundled definitions for the curated
  daily answers.
- `js/app.js` owns rendering, input, and versioned `localStorage` persistence.
- `js/companion-interface.js` defines the DOM-free, versioned companion contract.
- `js/companion-desk.js` formats safe companion messages and extracts replies.
- `js/stats.js` contains DOM-free result validation and derived player statistics.
- `js/share.js` generates DOM-free, spoiler-free text for completed games.
- The current daily game remains in `fivefold:v1`. Completed dated results use the
  separate `fivefold:stats:v1` storage key, making completion recording idempotent.

Player statistics persist across daily puzzles and refreshes, including games
played, wins, streaks, and guess distribution. They remain local to the current
browser/device; Fivefold does not sync them to an account or server.

The curated answer catalog and dated schedule are separate: adding eligible
answers does not assign them to dates. Published schedule entries are immutable,
while future entries are maintained explicitly by appending or deliberately
replacing them before publication. The temporary future runway currently ends on
2026-08-31; the resolver does not silently cycle beyond it.

Because this is a static client-only game, the device's local date determines the
daily puzzle and the schedule is necessarily visible in the downloaded source.

The accepted-guess vocabulary comes from the public-domain ENABLE 1 word list.
Fivefold bundles a deduplicated subset containing only lowercase, five-letter
ASCII words, so guess validation makes no runtime network requests. The daily
answer pool remains separately curated and is not sourced from ENABLE; answers
are automatically accepted whether or not they appear in the ENABLE subset.

## Play with a companion

Expand **Play with a companion** below the game, then use this loop:

1. Copy the current game state and paste it into any text companion that can
   read and reply to pasted text.
2. Paste the companion's complete reply back into Fivefold.
3. Submit the companion guess, then copy the updated state for the next turn.

The Companion Desk needs no DevTools, account, extension, or provider
integration. Everything stays browser-local, and while the puzzle is active the
copied message contains no answer or definition. Once the game is complete, you
can copy a final update containing the revealed answer.

