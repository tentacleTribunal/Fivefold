# Fivefold

Fivefold is a free daily five-letter word puzzle. Players have six attempts to
find the day's word, with correct, present, and absent feedback on the board and
keyboard.

## Run locally

The project has no dependencies or build step. Serve the repository root with
any static file server, then open `index.html` through that server. For example:

```sh
python3 -m http.server 8000
```

It can also be published directly from the repository root with GitHub Pages.

## Design

- `js/game-engine.js` contains DOM-free, serializable game rules.
- `js/words.js` contains the frozen, pre-shuffled answer order and deterministic
  local-calendar-day selection.
- `js/app.js` owns rendering, input, and versioned `localStorage` persistence.
- The current game and basic win/streak history use the `fivefold:v1` storage key.

The answer sequence cycles only after every answer in the pool has appeared.
Because this is a static client-only game, the device's local date determines the
daily puzzle and the answer pool is necessarily visible in the downloaded source.

For this first milestone, any five alphabetic characters form an accepted guess.
A future version should add a curated guess dictionary and clear invalid-word
feedback without coupling dictionary validation to the UI.
