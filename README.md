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
- `js/accepted-guesses.js` combines the accepted-guess vocabulary with every
  word in the answer pool.
- `js/enable-words.js` contains the locally bundled accepted-guess vocabulary.
- `js/words.js` contains the frozen, pre-shuffled answer order and deterministic
  local-calendar-day selection.
- `js/app.js` owns rendering, input, and versioned `localStorage` persistence.
- The current game and basic win/streak history use the `fivefold:v1` storage key.

The answer sequence cycles only after every answer in the pool has appeared.
Because this is a static client-only game, the device's local date determines the
daily puzzle and the answer pool is necessarily visible in the downloaded source.

The accepted-guess vocabulary comes from the public-domain ENABLE 1 word list.
Fivefold bundles a deduplicated subset containing only lowercase, five-letter
ASCII words, so guess validation makes no runtime network requests. The daily
answer pool remains separately curated and is not sourced from ENABLE; answers
are automatically accepted whether or not they appear in the ENABLE subset.
