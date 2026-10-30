import "./styles.css";
import {
  renderBadge,
  renderButton,
  renderCard,
  renderIcon,
  renderMeter,
  renderSlider,
  renderStatDisplay,
  renderStatusDot,
  renderTextInput,
  renderToggleSwitch,
} from "./components/atoms/index.js";

import {
  renderAtemBusSelector,
  renderAudioFader,
  renderCaptionItem,
  renderCueButtonGroup,
  renderEcosystemHealthCard,
  renderEncoderMonitor,
  renderLiveCaptionsFeed,
  renderMatrixRouteRow,
  renderPtzPad,
  renderPtzPresetCard,
  renderRadioPlayerCard,
  renderRoutingOutputCard,
  renderSlideFeedCard,
  renderStreamStatusCard,
  renderTallyFacetWidget,
  type CaptionItemProps,
  type EcosystemComponentStatus,
} from "./components/molecules/index.js";

// Sample / Mock Data representing real pi* ecosystem states
const mockCaptions: CaptionItemProps[] = [
  {
    id: "cap-1",
    seq: 104,
    speaker: "Liturgi",
    text: "Herra olkoon teidän kanssanne. Niin myös sinun henkesi kanssa.",
    timestamp: Date.now() - 45000,
    lagMs: 110,
    language: "fi",
    flags: { youtube: "sent", relay: "sent" }
  },
  {
    id: "cap-2",
    seq: 105,
    speaker: "Kanttori",
    text: "Ylistäkää Herraa, sillä Hän on hyvä ja Hänen armonsa pysyy iankaikkisesti.",
    timestamp: Date.now() - 22000,
    lagMs: 140,
    language: "fi",
    flags: { youtube: "sent", relay: "sent" }
  },
  {
    id: "cap-3",
    seq: 106,
    speaker: "Lukija",
    text: "Ensimmäinen lukukappale on profeetta Jesajan kirjasta luvusta viisikymmentäviisi.",
    timestamp: Date.now() - 5000,
    lagMs: 95,
    language: "fi",
    flags: { youtube: "sent", relay: "dropped" }
  },
  {
    id: "cap-4",
    seq: 107,
    speaker: "Liturgi",
    text: "Kuulkaa Herran sanaa...",
    timestamp: Date.now() - 800,
    lagMs: 130,
    language: "fi",
    flags: { youtube: "pending", relay: "pending" }
  }
];

const mockEcosystemServices: EcosystemComponentStatus[] = [
  {
    name: "PiTube",
    repo: "pitube",
    description: "YouTube live broadcast lifecycle, Matrox encoder sync & closed captions sender.",
    port: 3105,
    status: "ok",
    latencyMs: 12,
    version: "0.2.1"
  },
  {
    name: "PiVoice",
    repo: "pivoice",
    description: "Multi-channel audio capture, Silero VAD, STT Auditor connection & Web Radio Relay.",
    port: 3103,
    status: "ok",
    latencyMs: 18,
    version: "0.3.0"
  },
  {
    name: "PiLight",
    repo: "pilight",
    description: "Tally-Ma wireless tally lights manager, mDNS discovery, 9-zone facets & director cues.",
    port: 3200,
    status: "ok",
    latencyMs: 8,
    version: "0.2.0"
  },
  {
    name: "PiSound",
    repo: "pisound",
    description: "BSS BLU-100 DSP Soundweb client, multi-mix (Sali/Striimi) faders, VU meters & presets.",
    port: 3104,
    status: "ok",
    latencyMs: 15,
    version: "0.2.4"
  },
  {
    name: "PiMatrix",
    repo: "pimatrix",
    description: "Raspberry Pi dual HDMI routing, crop/zoom keying, RTSP streaming & Atlona matrix.",
    port: 3100,
    status: "ok",
    latencyMs: 5,
    version: "0.1.3"
  },
  {
    name: "PiSwitch",
    repo: "piswitch",
    description: "Blackmagic ATEM Mini video switcher driver, transitions, media player & tally sync.",
    port: 3102,
    status: "ok",
    latencyMs: 11,
    version: "0.1.8"
  },
  {
    name: "PiProgram",
    repo: "piprogram",
    description: "Graphics/slides presentation renderer, PPTX/Canva pipeline snapshot & frame router.",
    port: 3101,
    status: "ok",
    latencyMs: 14,
    version: "0.2.0"
  },
  {
    name: "PiCanva",
    repo: "picanva",
    description: "Canva App presenter extension for slide progression and projector picMute blackout.",
    port: 3106,
    status: "ok",
    latencyMs: 22,
    version: "0.1.2"
  },
  {
    name: "PiGateway",
    repo: "pigateway",
    description: "Central event hub, SSE transcript replay ring, unified API router & state supervisor.",
    port: 8080,
    status: "ok",
    latencyMs: 4,
    version: "0.4.0"
  }
];

function renderSectionHeader(title: string, repoTag: string, description: string): string {
  return `<div class="pb-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div>
      <div class="flex items-center gap-2">
        <h2 class="font-headline-md text-[20px] font-bold text-on-surface leading-tight">${title}</h2>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase bg-primary/10 text-primary border border-primary/20">${repoTag}</span>
      </div>
      <p class="text-[12px] font-body-sm text-on-surface-variant mt-0.5">${description}</p>
    </div>
  </div>`;
}

export function buildCatalogHtml(): string {
  // 1. ATOMS GALLERY SECTION
  const atomsSection = `
    <section id="group-atoms" class="catalog-group space-y-4">
      ${renderSectionHeader("Atoms Gallery", "Design System Core", "Basic, atomic UI primitives: buttons, badges, status dots, icons, cards, sliders, meters, and inputs.")}

      <!-- Row 1: Buttons & Badges -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderCard({
          title: "Buttons (Atom: Button)",
          subtitle: "Standardized button variants, states and sizes",
          icon: "smart_button",
          content: `
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                ${renderButton({ label: "Primary", variant: "primary", size: "sm" })}
                ${renderButton({ label: "Secondary", variant: "secondary", size: "sm" })}
                ${renderButton({ label: "Danger", variant: "danger", size: "sm" })}
                ${renderButton({ label: "Surface High", variant: "surface-high", size: "sm" })}
                ${renderButton({ label: "Ghost", variant: "ghost", size: "sm" })}
              </div>
              <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
                ${renderButton({ label: "With Icon", icon: "play_arrow", variant: "primary", size: "sm" })}
                ${renderButton({ label: "Disabled", variant: "primary", size: "sm", disabled: true })}
                ${renderButton({ label: "Active Toggle", variant: "primary", size: "sm", active: true })}
                ${renderButton({ icon: "tune", variant: "surface-high", size: "sm", title: "Icon only" })}
              </div>
              <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
                ${renderButton({ label: "PGM (Cut)", variant: "atem-pgm", size: "sm" })}
                ${renderButton({ label: "PVW (Auto)", variant: "atem-pvw", size: "sm" })}
                ${renderButton({ label: "Tie (Amber)", variant: "atem-tie", size: "sm" })}
              </div>
            </div>
          `
        })}

        ${renderCard({
          title: "Badges & Pills (Atom: Badge & StatusDot)",
          subtitle: "Visual indicators, facet flags, and delivery status dots",
          icon: "label",
          content: `
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-1.5">
                ${renderBadge({ label: "LIVE", variant: "error", dot: "live", pulse: true })}
                ${renderBadge({ label: "READY", variant: "success", dot: "online" })}
                ${renderBadge({ label: "TESTING", variant: "warning", dot: "warning", pulse: true })}
                ${renderBadge({ label: "STANDBY", variant: "neutral", dot: "standby" })}
                ${renderBadge({ label: "FTB", variant: "ftb" })}
                ${renderBadge({ label: "CROP", variant: "crop" })}
              </div>
              <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-outline-variant/20">
                ${renderBadge({ label: "Sent to YT", variant: "success", icon: "check" })}
                ${renderBadge({ label: "Dropped", variant: "error", icon: "error" })}
                ${renderBadge({ label: "In Flight", variant: "warning", pulse: true })}
                ${renderBadge({ label: "fi-FI", variant: "outline" })}
                ${renderBadge({ label: "1080p60", variant: "accent" })}
              </div>
              <div class="flex items-center gap-3 pt-1 border-t border-outline-variant/20">
                <span class="text-[11px] font-label-sm text-on-surface-variant">Dots:</span>
                ${renderStatusDot({ status: "online", title: "Online" })}
                ${renderStatusDot({ status: "live", title: "Live", pulse: true })}
                ${renderStatusDot({ status: "warning", title: "Warning" })}
                ${renderStatusDot({ status: "error", title: "Error" })}
                ${renderStatusDot({ status: "busy", title: "Busy", pulse: true })}
                ${renderStatusDot({ status: "offline", title: "Offline" })}
              </div>
            </div>
          `
        })}
      </div>

      <!-- Row 2: Sliders, Meters, Toggle Switches -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${renderCard({
          title: "Sliders (Atom: Slider)",
          subtitle: "Fader controls & PTZ speed",
          icon: "linear_scale",
          content: `
            <div class="space-y-2.5">
              ${renderSlider({ id: "demo-fader", min: 0, max: 100, value: 75, label: "Channel Gain", unit: "%" })}
              ${renderSlider({ id: "demo-ptz-speed", min: 1, max: 24, value: 12, label: "PTZ Speed", unit: "" })}
            </div>
          `
        })}

        ${renderCard({
          title: "Audio Meters (Atom: Meter)",
          subtitle: "VU and peak level bars",
          icon: "equalizer",
          content: `
            <div class="space-y-3">
              ${renderMeter({ value: -14, min: -60, max: 0, label: "Speech Mic Level" })}
              ${renderMeter({ value: -6, min: -60, max: 0, label: "Master Output (Near Peak)" })}
            </div>
          `
        })}

        ${renderCard({
          title: "Toggle Switch (Atom)",
          subtitle: "Segmented state selectors",
          icon: "toggle_on",
          content: `
            <div class="space-y-2.5">
              <span class="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold block">Pipeline Mode:</span>
              ${renderToggleSwitch({
                options: [
                  { value: "auto", label: "Auto" },
                  { value: "on", label: "On" },
                  { value: "off", label: "Off" }
                ],
                selectedValue: "auto"
              })}
              <span class="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold block pt-1">Audio Preset:</span>
              ${renderToggleSwitch({
                options: [
                  { value: "messu", label: "Messu" },
                  { value: "bandi", label: "Bändi" },
                  { value: "all", label: "Kaikki" }
                ],
                selectedValue: "messu"
              })}
            </div>
          `
        })}
      </div>
    </section>
  `;

  // 2. PITUBE SECTION
  const pitubeSection = `
    <section id="group-pitube" class="catalog-group space-y-4">
      ${renderSectionHeader("pitube Monitoring & Control", "d:\\pitube", "YouTube live stream lifecycle, Matrox Monarch HDX hardware encoder integration & live caption delivery stats.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderStreamStatusCard({
          state: "live",
          health: "good",
          broadcastTitle: "Sunnuntain Jumalanpalvelus - Riihimäen Keskuskirkko",
          privacy: "public",
          embedUrl: "https://www.youtube.com/watch?v=mockLiveId",
          captionsSent: 412,
          captionsDropped: 2,
          gatewayConnected: true
        })}

        <div class="space-y-4">
          ${renderEncoderMonitor({
            name: "Matrox Monarch HDX (Räkkikaappi)",
            connected: true,
            encoder1: { mode: "RTMP Stream (YouTube)", state: "streaming", bitrateKbps: 6500 },
            encoder2: { mode: "MP4 Record (USB / NAS)", state: "recording", bitrateKbps: 12000 }
          })}

          ${renderStreamStatusCard({
            state: "ready",
            health: "noData",
            broadcastTitle: "Keskiviikon Iltamusiikki (Scheduled)",
            privacy: "unlisted",
            captionsSent: 0,
            captionsDropped: 0,
            gatewayConnected: true
          })}
        </div>
      </div>
    </section>
  `;

  // 3. PIVOICE SECTION
  const pivoiceSection = `
    <section id="group-pivoice" class="catalog-group space-y-4">
      ${renderSectionHeader("pivoice Speech & Audio Pipeline", "d:\\pivoice", "Speech-to-Text (STT Auditor), Silero VAD voice activity detection, live transcript streaming & delivery flags.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderLiveCaptionsFeed({
          captions: mockCaptions,
          isVoiceActive: true,
          sttBusy: false,
          processedCount: 107,
          droppedCount: 1,
          lagMs: 125,
          language: "fi"
        })}

        <div class="space-y-4">
          ${renderCard({
            title: "Auditor STT & VAD Monitor",
            subtitle: "Voice Activity Detection & STT Engine Health",
            icon: "record_voice_over",
            badgeHtml: renderBadge({ label: "VAD ACTIVE", variant: "success", dot: "live", pulse: true }),
            content: `
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-2">
                  ${renderStatDisplay({ label: "Speech Engine", value: "Auditor", size: "sm" })}
                  ${renderStatDisplay({ label: "Audio Model", value: "Whisper-FI", size: "sm" })}
                  ${renderStatDisplay({ label: "VAD Window", value: "300ms", size: "sm" })}
                </div>

                <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5 text-[11px] font-body-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-on-surface-variant">Gate Status:</span>
                    <strong class="text-emerald-600 dark:text-emerald-400">Microphone gate open (speech detected)</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-on-surface-variant">Delivery Targets:</span>
                    <span class="font-mono text-on-surface">YouTube Live + Web Radio Relay</span>
                  </div>
                </div>
              </div>
            `
          })}

          ${renderRadioPlayerCard({
            streamName: "Riihimäen Keskuskirkko - Nettiradio",
            mountPoint: "/live.mp3",
            streamUrl: "https://nettiradio.keskuskirkko.fi/live.mp3",
            isStreaming: true,
            listenersCount: 18,
            soundComingIn: true,
            captionsComingIn: true
          })}
        </div>
      </div>
    </section>
  `;

  // 4. PILIGHT SECTION
  const pilightSection = `
    <section id="group-pilight" class="catalog-group space-y-4">
      ${renderSectionHeader("pilight Tally & Camera Cueing", "d:\\pilight", "Tally-Ma wireless tally devices, 9-zone segmented LED matrix with facet tracking & director camera operator cues.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-4">
          ${renderTallyFacetWidget({
            id: "tally01",
            name: "Tally 01 (Kamera 1 / Pääkamera)",
            host: "tally01.local",
            fallbackIp: "192.168.1.70",
            mode: "pgm",
            activeFacet: "atem-input (Input 1: Program RED)",
            connected: true,
            zones: [
              { index: 0, color: [255, 0, 0] },
              { index: 1, color: [255, 0, 0] },
              { index: 2, color: [255, 0, 0] },
              { index: 3, color: [255, 0, 0] },
              { index: 4, color: [255, 0, 0] },
              { index: 5, color: [255, 0, 0] },
              { index: 6, color: [255, 0, 0] },
              { index: 7, color: [255, 0, 0] },
              { index: 8, color: [255, 0, 0] }
            ]
          })}

          ${renderTallyFacetWidget({
            id: "tally02",
            name: "Tally 02 (Kamera 2 / Lähikuva)",
            host: "tally02.local",
            fallbackIp: "192.168.1.89",
            mode: "prv",
            activeFacet: "atem-input (Input 2: Preview GREEN)",
            connected: true,
            zones: [
              { index: 0, color: [0, 255, 0] },
              { index: 1, color: [0, 255, 0] },
              { index: 2, color: [0, 255, 0] },
              { index: 3, color: [0, 255, 0] },
              { index: 4, color: [0, 255, 0] },
              { index: 5, color: [0, 255, 0] },
              { index: 6, color: [0, 255, 0] },
              { index: 7, color: [0, 255, 0] },
              { index: 8, color: [0, 255, 0] }
            ]
          })}
        </div>

        <div class="space-y-4">
          ${renderCueButtonGroup({
            targetLightId: "tally01",
            targetLightName: "Kamera 1 (Pääkamera)"
          })}

          ${renderCard({
            title: "Tally Facets Reference (pilight)",
            subtitle: "System facets that drive the 9-zone segmented tally lights",
            icon: "hub",
            content: `
              <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-primary font-bold block">atem-input</span>
                  <span class="text-on-surface-variant text-[10px]">Program (Red) / Preview (Green)</span>
                </div>
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-primary font-bold block">youtube-stream</span>
                  <span class="text-on-surface-variant text-[10px]">Live on YouTube (Red/Amber)</span>
                </div>
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-primary font-bold block">matrox-encoder</span>
                  <span class="text-on-surface-variant text-[10px]">Encoder 1/2 state</span>
                </div>
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-primary font-bold block">caption-state</span>
                  <span class="text-on-surface-variant text-[10px]">Captions flowing (Cyan)</span>
                </div>
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-primary font-bold block">atlona-output</span>
                  <span class="text-on-surface-variant text-[10px]">Matrix display routed</span>
                </div>
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-primary font-bold block">stt-state</span>
                  <span class="text-on-surface-variant text-[10px]">Speech transcribing</span>
                </div>
              </div>
            `
          })}
        </div>
      </div>
    </section>
  `;

  // 5. PISOUND SECTION
  const pisoundSection = `
    <section id="group-pisound" class="catalog-group space-y-4">
      ${renderSectionHeader("pisound Sanctuary Audio Mixer", "d:\\pisound", "BSS BLU-100 DSP Soundweb integration, Sali & Striimi channel faders, peak VU meters & mute toggles.")}

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${renderAudioFader({
          id: "kapula1",
          name: "Kapula 1",
          role: "Liturgi / Pappi",
          group: "handheld",
          volumePercent: 82,
          isMuted: false,
          peakDbfs: -16,
          signalPresent: true
        })}

        ${renderAudioFader({
          id: "madonna1",
          name: "Madonna 1",
          role: "Pappi / Liturgi",
          group: "madonna",
          volumePercent: 78,
          isMuted: false,
          peakDbfs: -22,
          signalPresent: true
        })}

        ${renderAudioFader({
          id: "wired4",
          name: "Lukupulpetti",
          role: "Tekstinluku",
          group: "wired",
          volumePercent: 65,
          isMuted: true,
          peakDbfs: -60,
          signalPresent: false
        })}
      </div>
    </section>
  `;

  // 6. PIMATRIX SECTION
  const pimatrixSection = `
    <section id="group-pimatrix" class="catalog-group space-y-4">
      ${renderSectionHeader("pimatrix HDMI Outputs & Matrix Router", "d:\\pimatrix", "Pi 1 & Pi 2 HDMI hardware outputs, FTB/Crop boundaries & Atlona 44M NetLinx matrix destinations.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderRoutingOutputCard({
          outputIndex: 1,
          activeSourceId: "hama",
          isCropped: true,
          routedToLabels: ["Vasen Tykki", "Striimi"],
          sources: [
            { id: "hama", label: "hama (HDMI Capture)" },
            { id: "rtmp1", label: "rtmp1 (Main Stream)" },
            { id: "PiPGM1", label: "pipgm 1 (Slides)" }
          ]
        })}

        ${renderRoutingOutputCard({
          outputIndex: 2,
          activeSourceId: "PiPGM1",
          isFtb: true,
          routedToLabels: ["Oikea Tykki"],
          sources: [
            { id: "hama", label: "hama (HDMI Capture)" },
            { id: "PiPGM1", label: "pipgm 1 (Slides)" },
            { id: "compose1", label: "compose 1 (Keyed)" }
          ]
        })}
      </div>

      <div class="space-y-3 pt-2">
        <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Atlona AT-UHD-PRO3-44M Video Matrix Crosspoints</h3>
        <div class="grid grid-cols-1 gap-2.5">
          ${renderMatrixRouteRow({
            destinationId: 1,
            destinationName: "Videotykki 1 (Vasen / Vertical Left)",
            destinationSubtitle: "Atlona Out 1 • Epson EB-L1050U • Etuseinä",
            activeInputId: 1,
            locked: false
          })}

          ${renderMatrixRouteRow({
            destinationId: 2,
            destinationName: "Videotykki 2 (Oikea / Horizontal Right)",
            destinationSubtitle: "Atlona Out 2 • Epson EB-L1050U • Sivuseinä",
            activeInputId: 3,
            locked: false
          })}

          ${renderMatrixRouteRow({
            destinationId: 5,
            destinationName: "Videomikseri (ATEM Mini Aux In)",
            destinationSubtitle: "Atlona Out 5 • HDMI peilaus mikserille",
            activeInputId: 2,
            locked: false
          })}
        </div>
      </div>
    </section>
  `;

  // 7. PISWITCH SECTION
  const piswitchSection = `
    <section id="group-piswitch" class="catalog-group space-y-4">
      ${renderSectionHeader("piswitch ATEM Video Mixer", "d:\\piswitch", "Blackmagic ATEM Mini video switcher driver, preview/program bus, transitions and downstream keyers.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderAtemBusSelector({
          connected: true,
          programInput: 1,
          previewInput: 2,
          inputs: [
            { id: 1, label: "CAM 1 (Pää)" },
            { id: 2, label: "CAM 2 (Lähikuva)" },
            { id: 3, label: "PIPGM (Grafiikka)" }
          ],
          isAutoActive: false,
          isFtbActive: false
        })}

        ${renderCard({
          title: "PTZ Camera Control Pad",
          subtitle: "Camera 1 & 2 Pan-Tilt-Zoom with Speed Fader",
          icon: "videocam",
          content: renderPtzPad({
            cameraId: "cam1",
            speed: 12
          })
        })}
      </div>
    </section>
  `;

  // 8. PIPROGRAM & PICANVA SECTION
  const piprogramSection = `
    <section id="group-piprogram" class="catalog-group space-y-4">
      ${renderSectionHeader("piprogram & picanva Slide Graphics", "d:\\piprogram & d:\\picanva", "PiPGM slide renderer, Canva presentation synchronizer & projector picMute control.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderSlideFeedCard({
          pipelineId: "PiPGM1",
          currentSlideNumber: 4,
          totalSlides: 16,
          keyMode: "luma",
          picMute: false
        })}

        ${renderCard({
          title: "Canva Integration Status (picanva)",
          subtitle: "Slide Deck Synced with Altar / Lectern Screens",
          icon: "auto_awesome",
          badgeHtml: renderBadge({ label: "SYNCED", variant: "success", dot: "online", size: "xs" }),
          content: `
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Deck Name</span>
                  <span class="font-bold text-on-surface truncate block">Messu_30_10_2026.canva</span>
                </div>
                <div class="p-2 rounded bg-surface-container border border-outline-variant/30">
                  <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Blackout / PicMute</span>
                  <span class="font-bold text-emerald-600 block">VISIBLE (Off)</span>
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-[11px] font-body-sm text-on-surface-variant">
                The Canva App extension communicates directly via <code>/api/v1/canva/*</code> endpoints to allow slide presenters to control output pipeline blackout without manual operator intervention.
              </div>
            </div>
          `
        })}
      </div>
    </section>
  `;

  // 9. PIGATEWAY SECTION
  const pigatewaySection = `
    <section id="group-pigateway" class="catalog-group space-y-4">
      ${renderSectionHeader("pigateway Ecosystem Grid", "d:\\pigateway", "Central supervisor, SSE transcript replay ring & microservice daemon heartbeats.")}

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        ${mockEcosystemServices.map(svc => renderEcosystemHealthCard({ component: svc })).join("")}
      </div>
    </section>
  `;

  return `
    <div class="space-y-12">
      ${atomsSection}
      ${pitubeSection}
      ${pivoiceSection}
      ${pilightSection}
      ${pisoundSection}
      ${pimatrixSection}
      ${piswitchSection}
      ${piprogramSection}
      ${pigatewaySection}
    </div>
  `;
}

// Filter button behavior for Catalog Page
function setupFilterTabs(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".catalog-filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("bg-primary", "text-on-primary", "shadow-sm");
        b.classList.add("bg-surface-container-high", "text-on-surface");
      });
      btn.classList.add("bg-primary", "text-on-primary", "shadow-sm");
      btn.classList.remove("bg-surface-container-high", "text-on-surface");

      const group = btn.getAttribute("data-group");
      const sections = document.querySelectorAll<HTMLElement>(".catalog-group");
      sections.forEach(sec => {
        if (group === "all") {
          sec.style.display = "block";
        } else if (sec.id === `group-${group}`) {
          sec.style.display = "block";
        } else {
          sec.style.display = "none";
        }
      });
    });
  });
}

function initCatalog(): void {
  const root = document.getElementById("catalog-root");
  if (root) {
    if (!root.innerHTML.trim() || root.children.length === 0) {
      root.innerHTML = buildCatalogHtml();
    }
    setupFilterTabs();
  }
}

// In ES modules (type="module"), document.readyState is often already "interactive" or "complete"
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalog);
} else {
  initCatalog();
}
