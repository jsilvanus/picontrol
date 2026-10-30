# picontrol

Ecosystem UI housing and CLI for the Pi stack: `pigateway`, `pimatrix`, `pitube`, `pilight`, `pivoice`, and `piprogram`.

Provides **UI**, **CLI**, and **control plane access** for all church broadcast operations.

---

## Architecture & Responsibilities

```
                      ┌──────────────────────────────────────┐
                      │    picontrol (Browser UI & CLI)      │
                      └──────────────────┬───────────────────┘
                                         │ HTTP REST & SSE
                                         ▼
                             ┌───────────────────────┐
                             │       pigateway       │
                             └───────────┬───────────┘
               ┌─────────────┬───────────┼───────────┬─────────────┐
               ▼             ▼           ▼           ▼             ▼
          [ pitube ]   [ pilight ]  [ pivoice ] [ pimatrix ]  [ ATEM / Cam ]
           YouTube       Tally       Audio &      Video &       Hardware
          Broadcasts    Lights      Captions     Routing       Switching
```

---

## 1. Browser UI (`ui/`)

Responsive Material Design / Tailwind UI built for phones, tablets, and booth touchscreens.

### Bottom Navigation Bar & Overflow (`...`)
The bottom navigation bar presents primary tabs:
- **Outputs**: Pi 1 (`hdmi 0`) & Pi 2 (`hdmi 1`) hardware outputs, crop/effects, and tactile switching.
- **Video**: Double/single camera feeds, parameter matrix, PTZ directional controls, optical zoom, preset bank, and **operator tally cue buttons**.
- **YouTube (`pitube`)**: Live broadcast selector, ad-hoc broadcast creation modal (`+ Uusi lähetys`), 16:9 confidence monitor iframe preview (`~30s delay`, muted for sound booth hygiene, with `[CC]` caption check), stream health, and **[ Aloita lähetys / Go Live ]** / **[ Lopeta lähetys / End ]** controls.
- **Tally (`pilight`)**: 8-unit Tally-Ma wireless monitor strip, live PGM (Red) / PRV (Green) / OFF state toggles, talent `[ CALL ]` (flash 3x white), `[ HOLD ]`, `[ Brightness ]`, 9-LED cycle test, and **PTZ Camera Director Cues** (`Pan Left`, `Pan Right`, `Zoom In`, `Zoom Out`, `Cue Operator`).
- **Voice (`pivoice`)**: Microphone capture status, voice activity detection, live transcription feed from the Auditor hub, and modes (Auditor, Radio, Relay, YouTube).
- **More (`...`) Overflow Button**: Tapping `...` opens a bottom sheet with the remaining destinations:
  - **Web Radio**: Icecast2 relay client status, transmission start/stop, and HTML5 audio confidence preview player.
  - **Matrix Inputs**: Atlona 4x4 hardware video switcher routing and safety lock.
  - **PiPGM Renderer**: Graphics & slide pipeline placeholder.
  - **Multiview**: Direct link to the standalone multiview monitoring grid.

### Running & Building the UI
```sh
npm run dev:ui     # Starts Vite development server at http://localhost:5173
npm run build:ui   # Typechecks and builds production bundle in ui/dist
```

---

## 2. picontrol CLI (`bin/picontrol.mjs`)

Command-line interface to monitor and control the entire Pi stack via `pigateway`.

### Global Options
- `--gateway <url>`: Gateway URL (default `http://127.0.0.1:3100` or `PIGATEWAY_URL`)
- `--youtube <url>`: pitube URL (default `http://127.0.0.1:3105` or `PITUBE_URL`)
- `--tally <url>`: pilight URL (default `http://127.0.0.1:3200` or `PILIGHT_URL`)
- `--api-key <key>`: Gateway API authorization token (`PIGATEWAY_API_KEY`)
- `--json`: Output raw JSON for scripts and agents

### Commands

#### Overall Status
```sh
picontrol status
picontrol --json status
```

#### YouTube & Broadcasts (pitube)
```sh
picontrol youtube status                                  # Ingest health, state, and caption counts
picontrol youtube list                                    # List upcoming scheduled broadcasts
picontrol youtube select <broadcastId|auto>               # Select active broadcast
picontrol youtube create --title "Messu 1.11.2026"        # Create ad-hoc broadcast
picontrol youtube start                                   # Transition broadcast to LIVE
picontrol youtube stop                                    # Transition broadcast to COMPLETE
```

#### Tally Lights & Director Cues (pilight)
```sh
picontrol tally list                                      # List all lights and states
picontrol tally set tally01 pgm                           # Set solid Program (Red)
picontrol tally set 1 prv                                 # Set solid Preview (Green)
picontrol tally cue 1 pan-left                            # Cue camera operator to pan left
picontrol tally cue 1 zoom-in                             # Cue camera operator to zoom in
picontrol tally cue 1 operator-call                       # Flash rear operator LEDs 1 & 9
picontrol tally call tally01                              # Flash talent call (white 3x)
picontrol tally hold tally01 1                            # Enable HOLDDATA
picontrol tally brightness tally01 high                   # Set brightness (low/medium/high)
picontrol tally cycle 1                                   # Run 9-LED cycle diagnostic test
```

#### Voice & Audio (pivoice)
```sh
picontrol voice status                                    # Voice detection & capture state
picontrol voice capture start                             # Start ALSA audio capture
picontrol voice capture stop                              # Stop audio capture
```

#### Web Radio Relay
```sh
picontrol radio status                                    # Relay lifecycle and listeners
picontrol radio start                                     # Start streaming to web radio
picontrol radio stop                                      # Stop web radio stream
```

#### ATEM Switcher & Hardware
```sh
picontrol atem status                                     # ATEM connection & preview/program inputs
picontrol atem preview 2                                  # Set preview to input 2
picontrol atem cut                                        # Trigger CUT transition
picontrol atem auto                                       # Trigger AUTO transition
picontrol atem ftb                                        # Fade to black
```

#### Atlona Video Matrix
```sh
picontrol matrix status                                   # Route mapping
picontrol matrix route 1 2                                # Route input 1 to output 2
```

#### Cameras & PTZ
```sh
picontrol camera list                                     # List cameras & connection status
picontrol camera move cam1 left                           # Move camera
picontrol camera zoom cam1 in                             # Zoom camera
picontrol camera preset cam1 3                            # Recall preset 3
picontrol camera preset cam1 3 --save                     # Save current position to preset 3
```

---

## 3. Production Deployment (Nginx & Reverse Proxy)

In production, `picontrol` is deployed as a **static build** served directly by **Nginx** at the church domain (e.g. `keskuskirkko.fi`).

### Architecture Highlights
- **Static Assets**: Nginx serves the pre-compiled UI (`ui/dist`) directly with aggressive asset caching.
- **Local Domain & Router Split-DNS**: The local church router overrides DNS so all devices on the LAN resolve `keskuskirkko.fi` directly to the local Pi's IP address. The Pi is also configured locally in `/etc/hosts` to answer to that domain name.
- **Reverse Proxy Routing**:
  - `/api/...` & `/multiview`: Proxied to `pigateway` (`http://127.0.0.1:3100`) with unbuffered SSE support for `/api/v1/events`.
  - `/mcp`: Proxied to `picontrol-mcp` (`http://127.0.0.1:3200`) for AI agent tool execution and OAuth/PAT headers.
  - `/canva` (or dedicated port `:8443`): Proxied to `picanva` (`http://127.0.0.1:3103`) for slide generation.

- **Authentication & Rights**:
  - **Operator Fail-Safe**: Physical sound booth console / LAN subnet is guaranteed full operator rights (`*:write`) to ensure an operator is never locked out during a service.
  - **User-Based Remote Control**: Multi-user and remote access uses individual **Username & Password** authentication with granular, user-level rights (`extraGrants` / `extraDenies`). See **[docs/authentication-and-permissions.md](docs/authentication-and-permissions.md)**.

Detailed setup instructions and systemd service templates are in **[docs/deployment.md](docs/deployment.md)**.  
Reference Nginx configuration: **[deploy/nginx/picontrol.conf](deploy/nginx/picontrol.conf)**.

---

## 4. Testing & Building Everything

```sh
npm test         # Runs unit and integration test suite
npm run build    # Compiles CLI TypeScript and UI bundle
```

---

## Pi Ecosystem Integration & Status Updates

This project is an integral component of the [Pi Production Ecosystem](file:///d:/piecosystem).

> [!IMPORTANT]
> Any changes to this repository's architectural role, API routes, communication protocols, exposed ports, dependencies, or runtime status **must be documented in the central `piecosystem` coordination repository** (`docs/projects-catalog.md` and `docs/inter-service-matrix.md`).
> Always verify cross-system health with `npm run status` in `D:\piecosystem`.
