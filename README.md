# picontrol

UI housing for pimatrix, pivoice and piprogram. Controls cameras, the video mixer, Pi inputs and outputs, piprogram and pivoice.

Status: phase A. The browser UI from `jsilvanus/pimatrix` (`packages/web`) is copied into `ui/`. Types will come from each service's OpenAPI.

Multiview: served from picontrol as a client-side page (`ui/multiview.html`, `ui/src/multiview/`). It reads the pimatrix API over HTTP, base URL from `?api=` or `VITE_PIMATRIX_URL`. pimatrix still serves its own `/multiview` until this is deployed. Cross-origin use needs CORS on pimatrix or a same-origin proxy.

Devices: `devices.html` is a page for the pimatrix device controls: cameras (pan/tilt, zoom, presets 1-6), the ATEM program/preview/cut, and the HDMI output sources. It uses the same API base as multiview (`?api=` or `VITE_PIMATRIX_URL`). It is built on the multiview branch and is not yet deployed; it has not been run against a live pimatrix or on the cameras and ATEM.
