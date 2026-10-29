# Deployment Guide: Nginx, Local DNS & Reverse Proxy

This document outlines the production deployment architecture for `picontrol` and its associated Pi ecosystem services (`pigateway`, `picontrol-mcp`, and `picanva`).

---

## 1. Architecture Overview

`picontrol` is deployed as a **static single-page application (SPA)** served directly by **Nginx**, while dynamic operations, real-time telemetry, MCP tools, and slide integrations are reverse-proxied to internal loopback daemons.

```
                           [ Local Church LAN Clients ]
                          (Phones, Tablets, Booth Touchscreens)
                                        │
                                        │ http://keskuskirkko.fi (or HTTPS)
                                        ▼
                        ┌───────────────────────────────┐
                        │      Local Router / DNS       │
                        │ (Maps keskuskirkko.fi -> Pi) │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ Raspberry Pi 5 (Boxtop / Church Sound Booth)                                │
 │                                                                             │
 │   ┌─────────────────────────────────────────────────────────────────────┐   │
 │   │                             NGINX                                   │   │
 │   │  server_name: keskuskirkko.fi, control.keskuskirkko.fi             │   │
 │   └───────┬───────────────────┬──────────────────┬──────────────────┬───┘   │
 │           │                   │                  │                  │       │
 │   Static Assets        /api/ & SSE             /mcp            /canva /:8443│
 │   (ui/dist)                   │                  │                  │       │
 │           ▼                   ▼                  ▼                  ▼       │
 │    ┌─────────────┐     ┌─────────────┐    ┌─────────────┐    ┌────────────┐ │
 │    │ Static Files│     │  pigateway  │    │picontrol-mcp│    │  picanva   │ │
 │    │  (HTML/JS)  │     │  Port 3100  │    │  Port 3200  │    │ Port 3103  │ │
 │    └─────────────┘     └─────────────┘    └─────────────┘    └────────────┘ │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Domain & Local Network Resolution

To provide seamless access to the sound booth control panel without needing cloud roundtrips or internet access:

1. **Church Domain Name:**
   - The production interface is addressed at the church domain (e.g. `keskuskirkko.fi` or `control.keskuskirkko.fi`).
2. **Local Router DNS Configuration:**
   - Configure the church router (or local DNS server, e.g., dnsmasq, UniFi, MikroTik, or Pi-hole) with a **DNS override / split-horizon DNS entry**:
     ```text
     keskuskirkko.fi         IN A  192.168.1.50   # (Replace with Pi's static LAN IP)
     control.keskuskirkko.fi IN A  192.168.1.50
     ```
   - When booth operators connect via Wi-Fi or booth Ethernet, their devices automatically resolve the church domain directly to the local Pi.
3. **Pi Local Resolution (`/etc/hosts`):**
   - The Pi itself is configured to resolve the domain to loopback so local agents and CLI tools operate consistently:
     ```text
     127.0.0.1  localhost keskuskirkko.fi control.keskuskirkko.fi
     ```

---

## 3. Static Build Pipeline

The frontend is built with Vite into a static bundle containing HTML, JavaScript, CSS, and SVG assets:

```bash
# Build the UI static production bundle
npm run build:ui
```

The output artifacts are written to `ui/dist/`:
- `ui/dist/index.html` (Primary control dashboard)
- `ui/dist/multiview.html` (Standalone video multiview monitor)
- `ui/dist/assets/` (Bcrypt/hashed CSS, JS, and vendor bundles)

### Gateway Address Configuration & Same-Host Support
The frontend resolves the Gateway address according to the following precedence:
1. **Query parameter**: `?gateway=<url>` or `?api=<url>` (useful for runtime testing)
2. **Runtime property**: `window.__PICONTROL_GATEWAY_URL__`
3. **Build-time env variable**: `VITE_GATEWAY_URL` (configured in `ui/.env` or CI)
4. **Default (Same-Host)**: When unset, empty (`""`), or set to `"same-origin"`, all API calls and SSE telemetry (`/api/...`) resolve **relative to the exact host and origin the static bundle is served from**.

This allows the same static build to be served at `http://keskuskirkko.fi` and seamlessly communicate with the Gateway reverse proxy without CORS issues or hardcoded addresses. See [ui/.env.example](../ui/.env.example).

### Serving the Web App Directly from Gateway or a Subpath
1. **When Gateway serves the static files directly (All-in-One)**:
   - If `pigateway` (Fastify) is configured to host the static UI bundle directly via `@fastify/static`, Nginx does not need a local static `root` directive.
   - Nginx simply proxies all traffic (`location /`) to `http://127.0.0.1:3100`.
   - The UI automatically resolves all `/api/...` calls to the same origin without extra configuration.
2. **When the Web App is served on a subpath (e.g. `/control/`)**:
   - `ui/vite.config.ts` uses `base: "./"`, which generates relative asset paths (`./assets/...`). This guarantees the UI functions correctly regardless of whether it is served from the root `/` or any subpath like `/control/`.
   - In Nginx, use `location /control/ { alias /var/www/picontrol/ui/dist/; try_files $uri $uri/ /control/index.html; }`.

In production, these files are copied or symlinked to `/var/www/picontrol/ui/dist`:

```bash
sudo mkdir -p /var/www/picontrol
sudo rsync -av --delete ui/dist/ /var/www/picontrol/ui/dist/
sudo chown -R www-data:www-data /var/www/picontrol
```

---

## 4. Nginx Reverse Proxy Routing

Nginx directs incoming requests based on path and port:

| Route / Port | Upstream Destination | Protocol | Purpose & Configuration Notes |
|---|---|---|---|
| `/` | `root /var/www/picontrol/ui/dist` | Static File | Single-Page Application (`try_files $uri $uri/ /index.html`) |
| `/assets/` | `root /var/www/picontrol/ui/dist/assets` | Static File | Immutable 1-year browser caching for hashed bundles |
| `/api/` | `http://127.0.0.1:3100` | HTTP/REST | Routes all control commands to `pigateway` |
| `/api/v1/events` | `http://127.0.0.1:3100` | SSE Stream | **Buffering off** (`proxy_buffering off`), persistent keepalive, 24h timeout |
| `/multiview` | `http://127.0.0.1:3100` | HTTP | Gateway multiview telemetry endpoint |
| `/pipgm` | `http://127.0.0.1:3100` | HTTP | Gateway PGM rendering endpoint |
| `/mcp` | `http://127.0.0.1:3200` | HTTP / SSE | Routes MCP tool calls & resources to `picontrol-mcp`, forwards `Authorization: Bearer` |
| `/canva/` (or `:8443`) | `http://127.0.0.1:3103` | HTTP / HTTPS | Reverse proxy for `picanva` slide builder application |

### Ready-to-Use Nginx Configuration File
The reference configuration file is stored in this repo at:
👉 [deploy/nginx/picontrol.conf](../deploy/nginx/picontrol.conf)

To enable it on the Pi:
```bash
sudo cp deploy/nginx/picontrol.conf /etc/nginx/sites-available/picontrol.conf
sudo ln -sf /etc/nginx/sites-available/picontrol.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Server-Sent Events (SSE) & WebSocket Support

Real-time telemetry feeds (such as the VU meters, tally states, ATEM cuts, and YouTube stream health) rely on continuous SSE streams. 

Nginx is tuned with the following directives for `/api/v1/events` and `/mcp`:
```nginx
proxy_buffering off;
proxy_cache off;
proxy_set_header Connection '';
proxy_http_version 1.1;
chunked_transfer_encoding off;
proxy_read_timeout 86400s;
```
This ensures zero latency on status indicators and avoids socket drops during quiet intervals.

---

## 6. Service Management (Systemd)

All backend daemons run as systemd user or system services:
- `pigateway.service` (Port 3100)
- `picontrol-mcp.service` (Port 3200)
- `picanva.service` (Port 3103, if running dynamically or served via static proxy)
- `nginx.service` (Ports 80 / 443 / 8443)

---

## 7. Operator Access & Remote User-Level Authentication

- **Physical Sound Booth Operator**: Guaranteed full operator capabilities (`*:write`) via local subnet auto-authorization / bypass so operators are never locked out or impeded during a live church service.
- **Remote & Church Multi-User Access**: Users connecting remotely or from personal devices log in using **Username & Password**. Permissions are enforced at the user level with customizable domain grants and denies (e.g. slides only, audio only, viewer, or full admin).

See the full specification in:  
👉 **[docs/authentication-and-permissions.md](authentication-and-permissions.md)**.

