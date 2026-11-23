# Plan: piprogram control in picontrol (tentative)

Status: draft for discussion. Planning only, nothing here is implemented.

## 1. What exists today

picontrol does **not** control piprogram. It only shows it.

- The **PiPGM Renderer** tab (`ui/index.html`, `tab-renderer`) is a stub placeholder. `main.ts` titles it "Stub Placeholder".
- The Outputs and Inputs tabs treat `PiPGM1/2/3` as video sources: they route them to Pi 1 / Pi 2 outputs (Atlona in 3 and 4) and show the pipeline snapshot (`pipgmMap`, filled from the gateway `init` payload and the `pipgm` SSE event). That is pimatrix routing, not piprogram control.
- The module toggle `piprogram` already maps to the `renderer` tab (`ui-access.ts`). It is not in `DEFAULT_MODULES`, so the tab is hidden unless `VITE_PICONTROL_MODULES` includes it.
- The picontrol CLI has `pipgm pipelines`, `pipelines <id>` and a `next` step. These talk to piprogram directly (`--program`, default `http://127.0.0.1:3200`), not through the gateway, and a hymn action through `pipgm:hymn`.
- **pigateway** already proxies piprogram (`PIGATEWAY_PIPROGRAM_API_URL`, `PIGATEWAY_PIPROGRAM_API_KEY`) under `/api/v1/pipgm/*` and lists those routes in the UI listener allowlist under module `piprogram` (LAN and relay; `DELETE items/:itemId` is `setup`, so LAN only).

### Gap that blocks the UI: the gateway speaks the old API

The gateway client (`pigateway/src/pipgm/client.ts`) was written for the old pimatrix `/api/v1/pipgm/*` routes. piprogram 1.0 renamed or added several:

| Gateway calls (old) | piprogram 1.0 (`openapi.yaml`) |
|---|---|
| `PUT pipelines/:id` | `PUT pipelines/:id/config` |
| `POST .../cue`, `/step`, `/play`, `/pause` | `POST .../control {action: next, prev, gotoStep, gotoItem, play, pause, stop, restart}` |
| `POST .../audio` (arm) | `POST .../audio`, plus `POST .../audio/play {itemId, loop, volume}` (not proxied) |
| `PUT .../playlist` | only `POST` add and `DELETE` item |
| not proxied | `POST .../ftb`, `PUT .../basic-image`, `POST tts/prepare`, `GET .../frame.png`, `GET /pipgm/:id/stage`, items `hymn`, `youtube`, `media`, `pptx`, `GET assets/:id`, step `image.png` and `thumbnail.jpg` |
| `POST items/:id/package` | `POST items/:id/canva/export-package` (the Canva path; the pigateway Canva routes may already use it, verify) |

So step 1 of any UI work is aligning the gateway with piprogram 1.0.

**Update 2026-11-18 (Pi discovery):** the Pi runs piprogram b8f17c1, which is the current main and serves `/control` (checked in the source at that commit), so it is 1.0. pimatrix no longer mounts `/api/v1/pipgm` (404). The Pi's pigateway (72dc7d0) predates the alignment, so pigateway must be deployed (from main only) before the new UI. The gateway's old `pipgm.hymn` and `pipgm.slide` rundown actions pointed at paths that exist nowhere and were removed; the replacement is `POST items/hymn {number}` followed by `POST pipelines/:id/playlist {itemId}` (and `control {gotoItem}` to show it). Mockups: https://claude.ai/artifact/2y7UTFbxr6KBiAYyCHnmhk

## 2. What piprogram can do (the control surface)

Three feeds (`PiPGM1/2/3`) published to MediaMTX, routed to HDMI by pimatrix. piprogram never carries HDMI sound; only Atlona out 1 audio reaches the PA.

- **Pipelines:** list, read, config (resolution, orientation), control (next, prev, goto step or item, play, pause, stop, restart), fade to black, basic image (what a feed shows when idle).
- **Playlist:** add item, remove item.
- **Library items:** hymn, YouTube, media (image, video, audio), PPTX, Canva; delete; `use-at` dates (pistorage pre-fetches 48 h before); step previews (`steps`, thumbnails) and `prepare`.
- **Audio per feed:** arm for N seconds (default 900, max 3600), play an audio item (loop, volume, capped by `PIPGM_AUDIO_MAX_VOLUME`), stop, and a global **kill switch** that stops and disarms all feeds. Text to speech: `tts/prepare` renders a phrase to a library audio item (Piper, Finnish voices) which is then played with `audio/play`.
- **Canva:** the Canva plugin pushes through pigateway `/api/v1/canva/push`; piprogram unpacks, prepares step pictures and reports a task (`tasks/:id`). The operator only needs to see progress and "ready".
- **Frame:** `frame.png` renders the current stage (used for previews).
- Writes need the API key (held by the gateway, never by the browser). Reads are open.

## 3. Proposed UI: the PiPGM Renderer tab

Replace the stub with a real tab, built in the existing style (`*-tab.ts` module next to `sound-tab.ts`, like `voice-tab.ts`). Phased so each phase is useful alone.

**Phase A, operate (live service use):** one card per feed (1, 2, 3).
- Current item, step n of m, playing state, live thumbnail (`frame.png`, throttled).
- Prev / Next / Play / Pause / Stop; jump to a step from a step strip (step thumbnails).
- Fade to black toggle per feed. Keep the existing per-input FTB in Outputs as is; this one is the feed-side fade.
- Where the feed goes now (read-only: "on Pi 1 output") so the operator sees what the audience sees; routing stays in Outputs.
- Audio: arm with countdown (`audioArmedUntil`), stop, and a red **Kill audio** button always visible on the tab.

**Phase B, content (preparation):**
- Library as cards (2026-11-23): each item has a preview that plays or shows in this browser only (audio player for sound and TTS, image, video player, the hymn stanzas as text; slides show their step count), the type and hymnal chip, and the uploaded/recorded/created time plus use dates. **Edit** opens a dialog for the title and the library type (type chips, a free name, or the default of the kind). Hymn items filter by hymnal prefix (VK or no prefix = Virsikirja, LV = Lasten virsi, others from `PIPGM_HYMNALS`); the add-hymn form has a hymnal picker. Add to a feed's playlist, remove from the playlist.
- Add: hymn (number), YouTube link, upload media, upload PPTX. Show Canva import tasks with progress and ready state.
- Basic image picker per feed.
- Text to speech: type a phrase, prepare, play on a feed (armed only). Show the 500 character limit.

**Phase C, polish:** reorder playlist, pre-roll checks ("feed has content, sound armed, routed to an output"), mobile layout, i18n keys consistent with the other tabs.

Out of scope here: slide design (Canva/PPTX), pimatrix routing UI changes, storage admin (pistorage).

## 4. LAN versus remote relay (least privilege)

Roles come from the gateway listener, never from the browser (`ui-listener.ts`): LAN (3011, no PIN, `/api/` limited to 192.168.1.0/24 by nginx) and relay (3012 on 127.0.0.1, PIN, operate routes only, through the radio tunnel to `kehitys…/picontrol`).

Proposal for piprogram routes:

| Capability | LAN | Relay |
|---|---|---|
| Read pipelines, items, steps, thumbnails, frame | yes | yes |
| Control (next, prev, goto, play, pause, stop, restart), FTB | yes | yes |
| Playlist add/remove, basic image | yes | yes |
| Audio kill, audio stop | yes | **yes** (safety action must work remotely) |
| Audio arm and play, tts/prepare | yes | **no** (sound in the room should be an on-site decision) |
| Add items (hymn, YouTube, media, PPTX), `use-at` | yes | no (uploads and downloads are heavy, YouTube fetch is outbound) |
| Delete items | yes (`setup`) | no (`setup`) |
| Config (`PUT .../config`) | yes (`setup`) | no |
| Frame polling | yes | reduced rate, or off |

Tell me if you want arm and play on the relay too. Mark the new rules in `UI_ROUTES` accordingly; the existing `setup` flag already gives the relay/LAN split. `frame.png` and thumbnails are binary: check the relay's size and rate limits and that cookies/PIN cover image requests.

## 5. Work breakdown (separate PRs)

1. **pigateway:** align `PiProgramClient` and routes with piprogram 1.0 (table in section 1), add the missing routes, extend `UI_ROUTES` per section 4, update the OpenAPI and tests. Also forward piprogram pipeline changes as the `pipgm` SSE event if it does not already.
2. **picontrol UI:** new `renderer-tab.ts`, Phase A first, then B. Add `piprogram` to the default modules for LAN builds when it is verified (decision for Juha). Update `index.html` stub, `main.ts` header text.
3. **picontrol CLI:** extend `pipgm` commands (control, ftb, audio arm, audio kill, items) and route through the gateway by default so the CLI works the same on LAN and via relay where allowed. Update docs and OpenAPI and `piecosystem` catalog (`docs/inter-service-matrix.md`) as piprogram asks.
4. **piprogram:** none expected; maybe a pipeline change stream (SSE) if polling the gateway is too chatty.
5. **Tests:** gateway route tests against a fake piprogram; picontrol tests for the CLI; UI checked against a mock API in headless Chromium (as for the other tabs). Nothing verified on the real Pi yet. piprogram is also "not started" in the on-site verification ledger, so a verification checklist is part of the work.

## 6. Open questions

1. Is the gateway talking to a piprogram 1.0 on the Pi already, or still to the pimatrix routes? (Decides whether step 1 is a fix or a migration.) The README says pimatrix still mounts the old routes until the Pi switches over.
2. Arm and play audio from the relay: no (proposed) or yes?
3. Should the tab also route a feed to Pi 1 / Pi 2 (one-tap "put this on the left projector"), or stay separate from Outputs?
4. Live thumbnail via `frame.png` polling, or only step thumbnails? Chromium on the Pi must render frames (`PIPGM_CHROMIUM`), which costs CPU on a Pi 4 already near 84 °C under detection.

## 7. Feed focus view and playlists (added 2026-11-18)

Mockups: https://claude.ai/artifact/2y7UTFbxr6KBiAYyCHnmhk (tabs C and D). A second set of layout alternatives is at https://claude.ai/artifact/3WRnvAU52MQBxzxTkKs1f1.

### Feed focus view
Clicking a feed on the Operate view opens it. The current output is pinned to the top: full width in landscape, a mini vertical at the top right in portrait. Below it are the upcoming steps of the whole playlist as thumbnails, grouped by item so item boundaries stay visible. Tapping a thumbnail jumps to that step. Next, Back, Pause and fade to black sit under the pinned view. Thumbnails use the prepared step pictures (`steps/{n}/thumbnail.jpg`), so they cost the Pi nothing; only the pinned current view uses the live `frame.png`. Items without prepared pictures show a placeholder and a Prepare button. Jumping from a thumbnail on the relay needs a confirm.

### Playlists: what exists
Each pipeline has one in-memory playlist that holds copies of library items. The API has add and remove only. There is no reorder, no replace, no save, no load, and the playlist is lost on a piprogram restart.

### Playlists: what is needed
Each feed has one live playlist. Editing happens on a **draft** that goes on air only with "Apply to PiPGM n", so the audience never sees a half-edited list.

- **Build:** add from the library, add a hymn by number, drag to reorder, remove, duplicate. Generate a draft for a date: library items whose `useAt` matches, ordered by a simple rule (hymns and liturgy, then PPTX, then Canva); the operator edits the result. Later: from a pirundown rundown, from a liturgy template.
- **Save and load:** a saved playlist is a named JSON document stored in the library store (pistorage) at `piprogram/playlists/<id>.json`. It references library items by id, with kind and title as a fallback match, and a hymn can be rebuilt from its number. Loading replaces the draft; applying while on air keeps the current item until Next. A missing item is shown on load and never dropped silently.
- **Export and import:** the same JSON as a file, to move playlists between Pis or to keep a copy.
- **Reuse:** duplicate to another feed or to next week's date.

Proposed file shape (`schema` is versioned):

```json
{
  "schema": "piprogram.playlist/1",
  "name": "Sunday mass, normal",
  "savedAt": "2026-11-18T17:20:00Z",
  "orientation": "landscape",
  "items": [
    { "itemId": "itm_8f2a", "kind": "hymn", "title": "Virsi 336", "hymn": { "number": 336 } },
    { "itemId": "itm_c01d", "kind": "pptx", "title": "Kuulutukset" }
  ]
}
```

### API additions (piprogram, then pigateway)
- `GET/POST /playlists`, `GET/PUT/DELETE /playlists/{id}`
- `PUT /pipelines/{id}/playlist` with `{itemIds: []}` to replace or reorder atomically (the old PUT in the gateway already hints at this)
- `POST /pipelines/{id}/playlist/load {playlistId, mode: replace|append}` and `POST /pipelines/{id}/playlist/save {name}`
- `POST /playlists/generate {date}` returns a draft, changes nothing
- Persist each feed's current playlist in the store so a restart keeps it.
- Gateway: all routes proxied. LAN gets everything. Relay: read, load and apply; save, delete, import and generate stay LAN (`setup`).

### Open questions
1. Saved playlists as references (a changed slide updates everywhere; recommended, with a warning if an item changes after the service started) or frozen copies?
2. One live playlist per feed plus saved ones as alternatives: enough?
3. Pause markers and auto-advance between items: now or later?
4. Is the focus view for one operator or an operator plus a monitor person?

### Order of work
Gateway alignment (done in pigateway #33, needs deploying), piprogram playlist API, picontrol Operate and focus view, then generate-for-date.

## 8. Work split into small pieces (2026-11-18)

Each piece is one repo, one area, 1 to 3 files, and has a test or a curl check as its done condition. Corrections to the first draft of this split: the gateway `control` and `ftb` routes (old G1) and the stale hymn and slide actions (old G2) are done in pigateway #33; piprogram b8f17c1 on the Pi is 1.0 and serves `/control` (old B1 is settled); the UI is the picontrol tab (`picontrol/ui`), not a new pigateway page; WAN access is the existing relay listener (3012), LAN is 3011, 3010 is the Canva-only listener and 3000 the main API, so no new LAN/WAN classifier is needed, only new allowlist entries.

### Backend: piprogram
- **B1** `GET /pipelines/:id/playlist/steps`: the playlist flattened to one ordered step list (itemId, stepIndex, title, thumbnail URL or null, isActive). openapi entry and a test in `server.test.ts`.
- **B2** `PUT /pipelines/:id/playlist/order {itemIds[]}`: atomic reorder or replace, 422 for ids not in the library. openapi and test.
- **B3** Persist each feed's live playlist in the library store so a restart keeps it. Test with the fake store.
- **B4** `src/playlist-store.ts`: save, load, list, delete saved playlists as `piprogram/playlists/<id>.json` in pistorage, memory fallback like `library-store.ts`. Unit tests only, no routes.
- **B5** Routes `GET/POST /playlists`, `GET/PUT/DELETE /playlists/{id}` with Zod validation of the `piprogram.playlist/1` shape. openapi and tests. Needs B4.
- **B6** `POST /pipelines/:id/playlist/save {name}`. Needs B5.
- **B7** `POST /pipelines/:id/playlist/load {playlistId, mode}`: replaces or appends, reports missing items, keeps the active item while on air. Needs B5. Judgement needed; do with a bigger model.
- **B8** `POST /playlists/generate {date}`: returns a draft from `useAt` matches, changes nothing. Needs B5.
- **B9** Regenerate the client and add CLI subcommands `piprogram playlists list|get|save|load|export|import`. Needs B1 to B7.
- **B10** (later) Pause entries and auto-advance seconds: model and persistence only.

### Backend: pigateway
- **G1** Proxy routes for B1, B2, B5 to B8 in `src/pipgm/pipgm-routes.ts`, with tests that check the upstream call. Needs those routes to exist.
- **G2** `UI_ROUTES` entries (`src/ui/ui-listener.ts`): LAN gets all; relay gets reads, `steps`, `load` and control; `save`, `delete`, `generate`, `order`, import are `setup` (LAN only). Audio kill and stop stay allowed on the relay. Test per rule.
- **G3** Update the pigateway OpenAPI and README for the new routes.
- **G4** Deploy pigateway #33 and the later routes to the Pi from main (Pi agent, with Juha's go).

### Frontend: picontrol/ui (plain TypeScript, `renderer-tab.ts`)
- **F1** API client wrapper plus poller (1 s on air, 10 s idle): `getPipelines`, `getSteps`, `control`, `ftb`, `audioKill`. No UI.
- **F2** Tab shell replacing the stub: feed cards (mockup tab A) and a fixed Kill audio button with the arm countdown. Needs F1.
- **F3** Feed focus view: pinned current output (landscape full width, portrait mini top right). Needs F1.
- **F4** Next, Back, Pause, fade to black and keyboard shortcuts (space and right arrow, left arrow, B). Needs F3.
- **F5** Coming-up thumbnail strip from `steps`: item boundaries, tap to jump, placeholder plus Prepare. Needs B1.
- **F6** Playlist draft editor: add from the library, drag to reorder, remove, Apply. Needs B2.
- **F7** Save, load, export, import panel with the on-air confirm and the missing-items report. Needs B5 to B7.
- **F8** Library view: use-at filter, kind filter, Canva task progress. Reads only.
- **F9** Generate-for-date dialog. Needs B8.
- **F10** Content add: hymn, YouTube, upload, PPTX, speak a phrase (LAN only).
- **F11** Error banners (409 AUDIO_NOT_ARMED, 503 pistorage down, failed task) with a next step.
- **F12** (later) Feed monitor tiles.

### Order
B1 and F1 to F4 first (first on-air screen), then B2 with F5 and F6, then B4 to B7 with G1, G2 and F7, then B8, F8 to F11, G3 and G4.

## 9. Canva one-click "Go live" as an action list (added 2026-11-18)

Request (Juha): after a Canva export reaches piprogram, the plugin offers Play options. For a vertical design the user picks left or right, feed (PiPGM 1, 2 or 3), output (Pi 1, 2 or 3), projector (1 or 2), fade to black or not, and presses Go live. One click should: save the set as a playlist, set it live on the chosen feed, route the feed to the chosen Pi output, route that output to the chosen projector, go live (with or without FTB), and open picontrol. The button saves an **action list** with a UUID, and the button is a link that executes the list.

### Who owns action lists: pigateway (recommended)

| Candidate | Verdict |
|---|---|
| **pigateway** | **Owner.** It already has the action registry and `POST /api/v1/actions/execute` (actors, results, events), the matrix and AMX route, ATEM, cameras, and the piprogram proxy. It has the LAN and relay listeners that decide who may run what, and the Canva-only listener the plugin already uses. A list is just a stored, ordered set of calls it can already make. |
| piprogram | No. It must not know about HDMI or the matrix (project rule: piprogram makes feeds, pimatrix routes). It stays one step in the list. |
| pirundown | Not the owner. It is a cue walker that already calls gateway actions. Later it can get a "run action list" action type so a service can trigger lists. |
| new app | No. More ports, auth and deployment for something the gateway does in one module. |

### Model
`ActionList { id (uuid), name, createdBy ("canva"), createdAt, expiresAt, singleUse, steps: [{ action, params }], onError: "stop" }`. Steps are existing registry actions, so nothing new has to be invented per list. For the Canva example:
1. `pipgm:playlist-set {feed, itemIds}`: save and set the playlist (also saved by name for reuse).
2. `pipgm:route {feed, output}`: feed to Pi 1, 2 or 3 (today routed through pimatrix; piece A7 documents how).
3. `matrix:route {input, output}`: Pi output to projector 1 or 2 (existing action).
4. `pipgm:ftb {feed, on}`.
5. `pipgm:control {feed, action: gotoItem|play}`.
Then picontrol opens the feed focus view.

### Access and safety
- The Canva-only listener may **create** lists, but only from an allowlist of actions (pipgm steps, route to projector outputs 1 and 2, fade to black). It cannot create lists with camera, encoder, ATEM or setup steps.
- **Run** is allowed on the LAN listener, and on the relay only if the list holds no projector or matrix step (proposal; the relay stays read and operate).
- The link is a capability, so it must not run on a mere page load by a link prefetcher or another site. The link opens picontrol at `/run/<uuid>`, which runs at once only when opened on the LAN with a valid session, once (`singleUse`) and within 15 minutes; otherwise it shows the list summary and one Run button. Every run is logged with the list id.
- Sound is separate: going live on a projector shows the picture; piprogram audio still needs to be armed.

### Phases and pieces (Haiku-sized)

**Phase 0, decisions:** done (see Decisions below).

**Phase 1, action list core (pigateway):**
- A1 Zod schema and file store for action lists (create, get, list, delete, expiry), with tests.
- A2 Routes `POST/GET/DELETE /api/v1/action-lists[/:id]`; create validates steps against the allowlist for the Canva key. Tests.
- A3 `POST /api/v1/action-lists/:id/run`: runs steps in order with the existing executor, per-step result, stops on error, single-use and expiry honoured, bus event per run. Tests.
- A4 `UI_ROUTES` and Canva-listener entries per the access rules above. Test per rule.
- A5 OpenAPI, README and CLI (`pigateway action-lists ...`).

**Phase 2, new steps (pigateway, needs piprogram B2 and B4 to B7 for playlist set and save):**
- A6 Registry actions `pipgm:playlist-set`, `pipgm:control`, `pipgm:ftb` calling the piprogram proxy. Tests.
- A7 Read-only: document how a PiPGM feed is routed to Pi 1, 2 and 3 today (pimatrix or piswitch), then add the `pipgm:route` action on top.
- A8 Preset wrapper "feed to projector" that expands to A7 plus `matrix:route`, so the plugin sends one small payload.

**Phase 3, Canva plugin (canva-pieco-app):**
- C1 After the export task is `ready`, enable a Play options panel for that item.
- C2 Options form: feed 1 to 3, Pi output 1 to 3, projector (left = 1, right = 2, or none), fade to black checkbox.
- C3 Go live: create the action list through the Canva listener, receive uuid and link, open the link in a new tab.
- C4 Error states (list refused, gateway unreachable) with a plain next step.

**Phase 4, picontrol:**
- P1 Route `/run/<uuid>`: fetch the summary, show it, Run button, per-step progress, then open the feed focus view.
- P2 Auto-run when on LAN with a session and the list is single-use and fresh; otherwise confirm.
- P3 (later) Small "Action lists" screen: recent lists, re-run, delete.

**Phase 5 (later):** pirundown action type `actionlist:run`.

### Decisions (Juha, 2026-11-18)
1. Left or right means the **projectors** (left = projector 1, right = projector 2). The left/right toggle and the projector choice are one control; the options form (C2) has feed, Pi output, projector (left or right), fade to black.
2. One tap with no confirm is accepted on the church LAN (single-use, 15 minutes, valid session); elsewhere one Run button.
3. The relay cannot run lists that route a projector (and, as before, cannot create them).
