# picontrol: pilight Tally & Director Cue UI Integration Plan

> For the `pilight` backend protocol, endpoints, and CLI implementation, see [pilight/README.md](file:///d:/pilight/README.md).

This document details the planned UI additions in `picontrol` for managing Tally-Ma wireless tally lights, multi-status LED segmenting, and camera operator PTZ cueing.

---

## 1. Overview & Data Flow

`picontrol` manages tally lights through `pilight` (default port `3200`, proxied or direct via `pigateway`).

```
[ picontrol Browser UI ] ──HTTP / REST──► [ pilight:3200 ] (or via pigateway proxy)
           ▲                                     │
           └──────────────SSE /api/v1/events─────┘
                                                 │
                                 ┌───────────────┴───────────────┐
                                 ▼ (HTTP /NONE, /PGM, /PRV)       ▼ (UDP 21324: 9 zones)
                         [ Tally-Ma Lights ]             [ Moving Cues / Segments ]
```

---

## 2. UI Components Needed in `picontrol`

### A. Camera View Director Cues (on Cameras / Video Page)
When viewing an individual camera in `picontrol` (`ui/src/main.ts` / video page):

1. **PTZ Direction Cue Panel**:
   - Floating action buttons / bar below the camera preset matrix to cue the physical camera operator:
     - **`[ ◄ Pan Left ]`**: Calls `POST /api/v1/lights/{tallyId}/cue` with `{"direction": "pan-left"}`
     - **`[ Pan Right ► ]`**: Calls `{"direction": "pan-right"}`
     - **`[ 🔍+ Zoom In ]`**: Calls `{"direction": "zoom-in"}`
     - **`[ 🔍- Zoom Out ]`**: Calls `{"direction": "zoom-out"}`
     - **`[ 🔔 Cue Operator ]`**: Calls `{"direction": "operator-call"}`, flashing rear LEDs 1 & 9 in amber/white without blinding the talent on stage.
   - Includes brief haptic / visual highlight in the browser UI when triggered.

---

### B. Tally Overview & Monitor Card (in Video / Switcher View)
A compact monitoring strip showing all configured tally lights (up to 8 units):

1. **Tally Light Unit Badges**:
   - Unit identifier and label (e.g. `Tally 1: Cam 1 (Center)`, `Tally 2: Cam 3 (Pulpit)`).
   - Real-time status indicator:
     - **Red Solid / Pulse**: Program (On Air).
     - **Green Solid**: Preview (Cued).
     - **Dark / Gray**: Off / Safe.
     - **Mini 9-LED Bar**: For multi-status segmented lights (shows the active colors of the 9 individual zones).
   - Host badge showing connection address (`tally01.local` or fallback `192.168.1.70`).
2. **Quick Actions per Light**:
   - **`[ CALL ]`**: Flashes white 3 times (`POST /api/v1/lights/{id}/call`).
   - **`[ HOLD ]`**: Toggles HOLDDATA to isolate the light from external TallyServer interference.
   - **`[ Brightness ]`**: Toggle `LOW` | `MEDIUM` | `HIGH`.

---

### C. Tally Configuration & Mapping Modal
Accessible via a `[ Tally Settings ]` button:

1. **Input Mapping (Decoupling unit number from ATEM input)**:
   - Dropdown for each tally unit (`1..8`):
     - `ATEM Input 1 (Camera 1 - Center)`
     - `ATEM Input 2 (Camera 2 - Pulpit)`
     - `ATEM Input 3 (Camera 3 - Altar)`
     - `ATEM Input 4 (Slides / PC)`
     - `Multi-Status Segmented Monitor`
     - `Manual / Static Color`
2. **Free 9-LED Segment Builder (for Multi-Status Lights)**:
   - Interactive 9-LED preview strip: `[ 1 ][ 2 ][ 3 ] | [ 4 ][ 5 ][ 6 ] | [ 7 ][ 8 ][ 9 ]`.
   - Allows selecting LED ranges and assigning them to:
     - `YouTube Live Stream` (Red = Live, Amber = Buffering, Off = Idle)
     - `ATEM Recording` (Red = Recording, Off = Idle)
     - `Matrox Encoder 1 / 2` (Red = Live, Off = Standby)
     - `Projector 1 / 2` (Cyan = Lamp On, Off = Standby)
     - `Atlona Matrix Output 1 / 2` (Purple = Route 1, Blue = Route 2, Off = Muted)
3. **LED Ordering Diagnostic Tool**:
   - Button: **`[ Cycle Test 9 LEDs ]`**:
   - Triggers sequential lighting of LEDs 1 through 9 in Red $\rightarrow$ Green $\rightarrow$ Amber.
   - Allows the operator to verify physical LED orientation (front vs. rear) from the booth.

---

## 3. API Contract for `picontrol`

| Operation | Method | Endpoint | Payload |
|---|---|---|---|
| Get All Lights | `GET` | `/api/v1/lights` | |
| Set Input Tally Mode | `POST` | `/api/v1/lights/{id}/state` | `{"mode": "pgm" \| "prv" \| "off"}` |
| Trigger Director Cue | `POST` | `/api/v1/lights/{id}/cue` | `{"direction": "pan-left" \| "pan-right" \| "zoom-in" \| "zoom-out" \| "operator-call", "durationMs": 2000}` |
| Flash Call | `POST` | `/api/v1/lights/{id}/call` | |
| Toggle HOLDDATA | `POST` | `/api/v1/lights/{id}/hold` | `{"hold": true \| false}` |
| Set Free Segments | `POST` | `/api/v1/lights/{id}/segments` | `{"segments": [{"id": "stream", "leds": [0,1,2], "facet": {"type": "youtube-stream"}}, ...]}` |
| Real-time Event Stream | `GET` | `/api/v1/events` | Server-Sent Events (`event: snapshot`, `event: change`) |
