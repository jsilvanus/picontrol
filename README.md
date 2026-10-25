# picontrol

UI housing for pimatrix, pivoice and piprogram. Controls cameras, the video mixer, Pi inputs and outputs, piprogram and pivoice.

Status: phase A. The browser UI from `jsilvanus/pimatrix` (`packages/web`) is copied into `ui/`. Types will come from each service's OpenAPI.

Multiview: served from picontrol as a client-side page (`ui/multiview.html`, `ui/src/multiview/`). It reads the pimatrix API over HTTP, base URL from `?api=` or `VITE_PIMATRIX_URL`. pimatrix still serves its own `/multiview` until this is deployed. Cross-origin use needs CORS on pimatrix or a same-origin proxy.

Main UI (`ui/index.html`, `ui/src/main.ts`): the PiMatrix main UI is the one UI; the devices page was folded into it.
- **Video** page (was Cameras): tap a camera view to enter single view, tap it again to go back to double view. Single view has the parameter matrix, presets, PTZ movement and the Focus buttons (Auto, Manual, Privacy Blur). SmartFrame is gone from the preset cards.
- **ATEM view** (double view only, `ui/src/atem.ts`): inputs 1, 2, 3 (tap sets preview; green = preview, red = program), FTB, CUT, AUTO, and DSK 1 (Input 4) / DSK 2 (Media player) with TIE and ON AIR for the selected DSK. It polls `GET /api/v1/atem` once a second while visible and only sends a command when a button is pressed. Needs the ATEM endpoints from pimatrix PR #28.
- **Crop & Effects** (long-press an input row in Outputs): tabs Crop (as before) and Composite (`ui/src/composite-tab.ts`): the slide frame of `/api/v1/composites` with a preview, a draggable frame, Left/Right/10:16/9:16/Reset presets, nudge and Smaller/Larger. Needs `offsetY` from pimatrix PR #28. `composite.html` stays for key colour, slide upload and ATEM media settings ("More settings").
- Checked with a mock API in headless Chromium only; never run against a live pimatrix, ATEM or cameras.

Composite: `composite.html` (`ui/src/composite/`) is the slide composite card for pimatrix's `/api/v1/composites`. It shows both outputs as tabs: `compose1` (HDMI key: full-frame key page, slide at left or right, key colour and chroma/luma mode) and `compose2` (ATEM media pool: media slot, media player, DSK, auto on air). It can start and stop each output, switch the slide side, save the frame and slide settings, preview the key page as a PNG, and send a test slide PNG. Status is polled every 2 s. It uses the same API base as devices. Cross-origin use needs `PIMATRIX_CORS_ORIGINS` on pimatrix listing the picontrol origin. Not run against a live pimatrix, Pi or ATEM; checked with a mock API in headless Chromium only.
