# systemd user unit

`picontrol-ui.service` serves the built UI (static files plus a `/voice` proxy to pivoice) as a systemd user service.

Expected layout (relative to the service user's home, `%h`):

- UI server script: `~/apps/bin/picontrol-ui-server.mjs` (not part of this repo yet)
- Node.js: `~/.local/bin/node`
- `PIVOICE_URL` is set in the unit (loopback); change it there if pivoice listens elsewhere.

Install:

```sh
mkdir -p ~/.config/systemd/user
cp deploy/picontrol-ui.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now picontrol-ui
loginctl enable-linger "$USER"   # once, so it runs without a login session
```

Status and logs: `systemctl --user status picontrol-ui`, `journalctl --user -u picontrol-ui -f`.
