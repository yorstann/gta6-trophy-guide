# Leonida Legend — GTA VI Trophy Guide & Tracker

![GTA 6 trophy guide bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/yorstann/gta6-trophy-guide/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/yorstann/gta6-trophy-guide/reward.svg)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI**, built for the make.fun bounty [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).

Every trophy carries its official name, description and grade, a guide in this app's own words that **names its sources** (PSNProfiles, PowerPyx, Exophase and the official PlayStation list), its kind, its roadmap stage, and — where PlayStation counts — a progress counter (42 Shooting Range challenges, 250 stunts, $250,000 of laundered Marked Bills, and more).

## What it does

- **Checklist** of all 55 trophies with grade medals, earned checkboxes and counter steppers; progress is saved in the browser (localStorage), with a header showing percent complete and per-grade counts.
- **Next up** panel: the next three unearned trophies in roadmap order, so the tracker always points at the platinum path.
- **Filters** — Story / Missable / Collectibles / Activities / Online chips, a grade select and text search. (The PS5 list has no online trophies; the Online chip says so honestly.)
- **Spoiler shield**: hides the names, descriptions and guides of the 28 hidden trophies until they are earned. Deep-linkable: `#/trophies?shield=on`.
- **Roadmap view**: seven stages from "Story first" to "100% & platinum", each with its trophies and earned state.
- **Missables view**: the 7 missable trophies — six strand finales that lock out when the final mission begins, plus the choice-based Actions Speak Louder — each with its reason.
- **Detail page per trophy** (`#/trophy/<id>`): the full guide, its sources, trophy facts and its counter.
- **Export / import / reset** of your progress as a JSON file, all client-side.

The app is plain static files with no build step and makes **no network requests**: every script, style and data file lives in `app/`. Its look — a Leonida sunset of plum, neon pink and cyan, with CSS-gradient medals — is its own; no Rockstar artwork is used.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 in a desktop browser. (Any static file server with `app/` at its root works just as well.)

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the bounty kit).

## Layout

- `app/index.html`, `app/style.css` — the shell and the sunset theme
- `app/app.js` — routing and wiring; `app/store.js` — saved progress; `app/filters.js` — filter logic; `app/render.js` — checklist, header, Next up; `app/detail.js` — trophy pages; `app/roadmap.js` — roadmap and missables; `app/io.js` — export/import; `app/stages.js` — the seven roadmap stages
- `app/data/trophies.json` — the 55 trophies: official name/description/grade plus guide, sources, kind, hidden, missable, count and stage
- `screenshots/` — four screenshots of the app itself; `shots.json` records what each one shows
