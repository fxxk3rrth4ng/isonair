# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`isonair` is a single-file Cloudflare Worker that aggregates live-stream status for a
fixed list of [CHZZK](https://chzzk.naver.com/) (Naver) streamers. On each request it
fans out to the CHZZK live-detail API for every channel ID and returns a JSON array
describing whether each streamer is `OPEN` or offline, plus stream metadata (title,
category, frame rate, start time, and an HLS `m3u8` URL when available).

The entire app lives in [src/index.js](src/index.js) — there is no framework, router, or
build step. The worker exports a single `fetch` handler.

## Commands

```bash
npm start      # wrangler dev --ip 0.0.0.0  — local dev server with hot reload
npm run deploy # wrangler deploy             — publish to Cloudflare
```

There is no test suite, linter, or build. Deploys also happen automatically: pushing to
`master` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which runs
`wrangler deploy` using the `CLOUDFLARE_API_TOKEN` secret. Treat a push to `master` as a
production deploy.

## Day-to-day changes

The most common change (and nearly the entire git history) is editing the `ids` array in
[src/index.js](src/index.js) to add, remove, or comment out streamers. Each entry is a
CHZZK channel ID with the streamer's name as a trailing comment. Commenting out an ID
disables polling for that channel without deleting the reference.

## Behavior notes worth knowing before editing the handler

- **Adult streams are handled specially.** When `result.adult` is true, `frameRate` is
  hard-coded to `"19.0"` and `m3u8` is set to `null` (the playback JSON is not parsed for
  adult channels). Non-adult streams read frame rate from
  `livePlaybackJson.media[0].encodingTrack[3]` and the HLS path from `media[1].path`.
  These are fixed array indices into CHZZK's response — if CHZZK changes its encoding-track
  ordering, these reads break.
- **No error handling.** Every channel is fetched sequentially in a `for` loop and the
  response is assumed to be well-formed JSON with a `.content` field. A failed fetch or an
  unexpected shape from CHZZK will throw and fail the whole request.
- **CORS is open** (`Access-Control-Allow-Origin: *`) so the endpoint can be consumed
  directly from browser front-ends.
