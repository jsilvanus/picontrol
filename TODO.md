# picontrol: YouTube & pitube Integration Plan

> For the complete API specification, schemas, and expectations, see [docs/pitube-integration.md](docs/pitube-integration.md).

This document details the planned UI additions for YouTube broadcast management and live stream monitoring in `picontrol`.

---

## 1. Overview & Data Flow

`picontrol` does not talk directly to YouTube or `pitube`. All calls route through `pigateway` (as the single API ingress).

```
[ picontrol Browser UI ] ──HTTP / REST──► [ pigateway ] ──Proxy──► [ pitube ] ────► YouTube Data API
           ▲                                     │
           └──────────────SSE /events────────────┘
```

---

## 2. UI Components Needed

### A. YouTube Broadcast Selector & Creation
Located in the YouTube section (under Voice / Streaming tab):

1. **Broadcast Selector Dropdown:**
   - Calls `GET /api/v1/youtube/broadcasts` to list upcoming broadcasts.
   - Options list:
     - `[Auto-detect closest upcoming]` (Default)
     - `Messu 1.11.2026 klo 10:00 (Public)`
     - `Pyhäinpäivän iltakirkko 1.11.2026 klo 18:00 (Public)`
   - On change, calls `POST /api/v1/youtube/broadcasts/select` with `{ "broadcastId": "<id>" | "auto" }`.

2. **Ad-Hoc Creation Button & Dialog:**
   - Button: `+ Uusi lähetys (Ad-hoc)`
   - Modal Dialog fields:
     - Title (default: `Jumalanpalvelus - [Päivämäärä]`)
     - Privacy: `Public` | `Unlisted` | `Private` (default: `Public`)
     - Description (optional)
   - On submit, calls `POST /api/v1/youtube/broadcasts/create`.
   - Automatically selects the new broadcast upon creation.

### B. YouTube Live Preview (Confidence Monitor)
A dedicated preview card showing the actual YouTube viewer stream (with ~30-second delay):

1. **Embedded Player (`<iframe>`):**
   - Source: `https://www.youtube.com/embed/{broadcastId}?autoplay=1&mute=1&enablejsapi=1`
   - Attributes:
     - `aspect-video` (16:9 container)
     - Muted by default (`mute=1`) to prevent feedback loops in the sound booth.
     - Responsive width with toggle to collapse/expand.
2. **Purpose & CC Verification:**
   - Lets the operator confirm video is reaching YouTube and is healthy.
   - Allows operator to press the native **`[CC]`** button on the player to verify that `lcyt` captions appear on screen in sync with the audio.

### C. Broadcast State & Controls
1. **Status Badges:**
   - Broadcast State: `Offline` (gray) | `Ready` (blue) | `Testing` (yellow) | `Live` (red pulsing).
   - Ingest Health: `Good` | `OK` | `No Data` | `Poor`.
   - Captions: `Active (Delay: 30s)` | `Idle` | `Error`.
2. **Action Buttons:**
   - **[ Start Broadcast / Go Live ]** (requires confirmation if in ad-hoc or testing mode).
   - **[ End Broadcast ]** (requires confirmation, transitions state to complete).

---

## 3. API Endpoints Contract (via pigateway)

* `GET /api/v1/youtube/broadcasts`: List upcoming broadcasts + currently selected broadcast ID.
* `POST /api/v1/youtube/broadcasts/select`: Body `{ "broadcastId": string }`.
* `POST /api/v1/youtube/broadcasts/create`: Body `{ "title": string, "privacy": "public"|"unlisted"|"private" }`.
* `POST /api/v1/youtube/broadcasts/start`: Transition current broadcast to testing/live.
* `POST /api/v1/youtube/broadcasts/stop`: Transition current broadcast to complete.
* `GET /api/v1/youtube/broadcasts/current`: Returns `{ broadcastId, embedUrl, state, health, captions }`.

---

## 4. Tally & Camera Director Cueing (pilight)

> For full specification and component details, see [docs/pilight-integration.md](docs/pilight-integration.md).

### Planned UI Additions:
1. **Camera PTZ Page Director Cues**:
   - Quick action bar: `[ ◄ Pan Left ]`, `[ Pan Right ► ]`, `[ 🔍+ Zoom In ]`, `[ 🔍- Zoom Out ]`, and `[ 🔔 Cue Operator ]` (flashes rear LEDs 1 & 9).
2. **Tally Monitor Strip**:
   - Compact badges for each light (`tally01`..`tally08`) showing real-time state: Program (Red), Preview (Green), Off, or mini 9-zone segment bar.
   - Quick buttons: `[ CALL ]` (flash 3x), `[ HOLD ]` (toggle server data ignore), `[ Brightness ]`.
3. **Tally Configuration & Mapping Modal**:
   - ATEM input assignment dropdown (decouples Tally unit number from ATEM input).
   - Free 9-LED segment editor for multi-status monitor lights (YouTube stream, ATEM recording, projector power, Atlona routes).
   - `[ Cycle Test 9 LEDs ]` diagnostic button to verify physical LED ordering.
