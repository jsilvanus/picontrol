# Authentication & User-Level Permissions Architecture

This document defines the authentication model and access control architecture for `picontrol`, `pigateway`, and the church Pi ecosystem.

---

## 1. Core Principles

The authentication architecture is governed by two complementary requirements:

1. **Operator Fail-Safe Guarantee:**
   - The on-duty sound booth operator running the physical church service **must never be blocked or locked out** from performing essential duties (cutting ATEM video, switching camera presets, triggering tally cues, starting YouTube live streams, adjusting audio).
   - Local sound booth access (physical console / touchscreens on the booth LAN subnet) automatically possesses complete **Operator** rights without friction, login timeouts, or mid-service token expirations.
2. **User-Based Authentication for Remote & Secondary Controllers:**
   - Anyone connecting outside the physical booth console—such as remote volunteers, stage managers, slide operators, remote pastors, or sound engineers on mobile devices—must authenticate using **individual User Accounts (Username & Password)**.
   - Access is **user-based, not anonymous or single-shared-passkey**.
   - Permissions are enforced at the **user level**, providing granular access according to each person's role and designated tasks.

---

## 2. Operator Rights vs. Remote User-Level Rights

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Sound Booth Operator (Physical)                       │
│  - Dedicated booth touchscreen / local booth IP                                 │
│  - Fail-safe: Always granted full Operator (*:write) capabilities              │
│  - Never locked out; no surprise expirations during a live service              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        ▲
                                        │
                               [ System Ingress ]
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       Remote & Church LAN Multi-Users                           │
│  - Username + Password Authentication (scrypt hashing)                          │
│  - User-level granular rights & domain scopes:                                  │
│      • Slide Operator:   composites:write, program:write, *:read                │
│      • Audio Technician: voice:write, radio:write, *:read                       │
│      • Camera Operator:  cameras:write, tally:write, *:read                     │
│      • Sanctuary Monitor: *:read (Multiview / Confidence only)                  │
│      • AV Director:      *:admin                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User-Level Permissions & Rights Model

Permissions follow the fine-grained `domain:level` format established in the ecosystem:

### Domains
- `routing`: Atlona video matrix inputs and outputs.
- `cameras`: PTZ movements, optical zoom, presets, smart framing.
- `atem`: Blackmagic ATEM video switcher (CUT, AUTO, Preview, FTB).
- `program`: Pipeline switching, playlists, Canva slides integration.
- `composites`: Slide layering, lower-thirds, graphic overlays.
- `voice`: Audio capture, transcription modes, live caption relay.
- `youtube`: YouTube scheduled broadcasts, ad-hoc creation, live start/stop.
- `tally`: Tally lights, talent CALL, director cues (pan, zoom, operator-call).
- `radio`: Web radio Icecast relay start/stop.
- `encoder`: Hardware MediaMTX / RTMP streaming encoders.
- `system`: System diagnosis, reboot, configuration, user management.

### Access Levels (Hierarchical)
1. `read`: View status, confidence monitors, active routes, and telemetry.
2. `write`: Trigger operational changes, switch inputs, pan cameras, go live.
3. `admin`: System reconfiguration, matrix locks, user management, preset saving.

### User Account Structure
Each user account in the system store (`users.json` / state DB) includes:

```json
{
  "username": "mikko_slides",
  "displayName": "Mikko (Slides & Canva)",
  "passwordHash": "scrypt$N=32768,r=8,p=1$...",
  "role": "operator",
  "extraGrants": [
    "composites:write",
    "program:write"
  ],
  "extraDenies": [
    "youtube:write",
    "atem:write"
  ],
  "disabled": false
}
```

- **Base Roles:**
  - `viewer`: `*:read`
  - `operator`: `*:write`
  - `admin`: `*:admin`
- **User-Level Granular Overrides:**
  - `extraGrants`: Adds permissions to a user beyond their base role.
  - `extraDenies`: Revokes specific capabilities from a user (e.g. preventing a volunteer slide operator from accidentally stopping the YouTube live broadcast or cutting the ATEM switcher).

---

## 4. Authentication Flow

### A. Sound Booth Auto-Authorization (Fail-Safe)
1. The physical booth console / booth iPad connects via the booth subnet (e.g., `192.168.1.50-60` or `127.0.0.1`).
2. `pigateway` and `picontrol` evaluate the client IP against `AUTH_ALLOWED_HOSTS`.
3. If matched, the session is granted `operator:write` immediately without prompting for credentials.
4. Top status bar shows: `🟢 BOOTH OPERATOR (Active)`.

### B. Remote / Multi-User Login
1. Remote client loads `http://keskuskirkko.fi`.
2. When client IP is not on the booth auto-whitelisted subnet:
   - UI displays current permissions as `viewer` (`*:read`) or opens the **User Login Modal**.
3. User enters their **Username** and **Password**.
4. Request:
   ```http
   POST /api/v1/auth/login
   Content-Type: application/json

   {
     "username": "anna",
     "password": "••••••••••••"
   }
   ```
5. Response:
   ```json
   {
     "status": "ok",
     "token": "eyJhbGciOi...",
     "user": {
       "username": "anna",
       "displayName": "Anna Virtanen",
       "role": "operator",
       "effectiveRights": {
         "atem": 2,
         "cameras": 2,
         "youtube": 2,
         "tally": 2,
         "voice": 2,
         "routing": 2,
         "program": 2,
         "composites": 2,
         "radio": 2,
         "encoder": 2,
         "system": 1
       }
     }
   }
   ```
6. The client stores the token in `sessionStorage` (or `localStorage` if "Remember Me" is checked) and attaches it as `Authorization: Bearer <token>` on all requests.

---

## 5. UI Adaptation & Permission Enforcement

The `picontrol` interface dynamically adjusts controls to match the logged-in user's effective rights:

1. **Read-Only / Disabled Buttons:**
   - If a user lacks `write` access for a domain (e.g. `youtube < 2`), the **[ Aloita lähetys / Go Live ]** and **[ Lopeta lähetys ]** buttons are disabled with a tooltip explaining: *"Requires YouTube Write permissions"*.
   - If a user lacks `cameras < 2`, PTZ directional buttons and preset save buttons are disabled, while live camera previews remain visible.
2. **Account Indicator in Header:**
   - Displays the logged-in user's name and role badge:
     - `👤 Anna Virtanen (Operator)`
     - `👤 Mikko (Slides Only)`
     - `👁️ Guest (Viewer)`
   - Tapping the badge opens user profile details, effective rights summary, and **Log Out**.
3. **Instant User Invalidation:**
   - If an admin revokes a user's rights or disables their account via CLI (`npm run user -- update <user> --disable`), existing tokens are immediately rejected by the backend with `401 Unauthorized`, and the UI returns to the login screen.

---

## 6. CLI User Management

User accounts and rights can be managed via the CLI on the Pi:

```bash
# Add a new user with password prompt
npm run user -- add matti --role operator

# Restrict user from touching ATEM or YouTube broadcasts
npm run user -- update matti --deny atem:write --deny youtube:write

# Grant admin rights on audio/voice to a sound technician
npm run user -- update soundtech --grant voice:admin

# List all configured users and their effective rights
npm run user -- list

# Disable a user account immediately
npm run user -- update matti --disable
```
