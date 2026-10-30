#!/usr/bin/env node
import { GatewayClient, type CliConfig } from "./client.js";

function printUsage(): void {
  console.log(`
picontrol CLI - Gateway & Pi Ecosystem Control Plane

USAGE:
  picontrol [options] <command> [subcommand] [args...]

COMMANDS:
  status                     Show overall Pi ecosystem & gateway status
  ecosystem [status|probe]   Query or actively probe all components across the Pi ecosystem
  sound [status|probe]       Check or actively probe PiSound BLU-100 DSP status
  youtube <action> [...]     Manage YouTube broadcasts (status, list, select, create, start, stop)
  tally <action> [...]       Control Tally-Ma lights & director cues (list, set, cue, call, hold, brightness, cycle)
  voice <action> [...]       Control pivoice audio capture & speech status (status, capture)
  radio <action> [...]       Control web radio relay stream (status, start, stop)
  atem <action> [...]        Control ATEM switcher (status, cut, auto, preview, ftb)
  encoder <action> [...]     Control Matrox Monarch HDX encoder (status, start, stop, settings)
  matrix <action> [...]      Control Atlona video matrix (status, route)
  camera <action> [...]      Control PTZ cameras & presets (list, move, zoom, preset)
  rundown <action> [...]     Control PiRundown (status, next, prev, reset, fire, cues, storage)
  graphics <action> [...]    Control PiGraphics (status, templates, active, show, hide, clear)
  program <action> [...]     Control PiProgram presentation (status, pipelines, advance, hymn)
  space <action> [...]       Query PiSpace 3D venue & spatial solver (status, venue, solve)
  perception [status|tracks] Query PiPerception neural tracker
  world                      Query fused World State (VAD + 3D spatial + speaker)
  transcripts                Query latest speech transcripts from Auditor

GLOBAL OPTIONS:
  --gateway <url>            pigateway base URL (default: http://127.0.0.1:3100 or PIGATEWAY_URL)
  --youtube <url>            pitube base URL (default: http://127.0.0.1:3105)
  --tally <url>              pilight base URL (default: http://127.0.0.1:3200)
  --rundown <url>            pirundown base URL (default: http://127.0.0.1:3400)
  --graphics <url>           pigraphics base URL (default: http://127.0.0.1:3107)
  --program <url>            piprogram base URL (default: http://127.0.0.1:3104)
  --space <url>              pispace base URL (default: http://127.0.0.1:3108)
  --perception <url>         piperception base URL (default: http://127.0.0.1:3110)
  --api-key <key>            API key / Bearer token (default: PIGATEWAY_API_KEY)
  --json                     Output raw JSON
  -h, --help                 Show this help message
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  // Parse global flags
  const config: CliConfig = {
    gatewayUrl: process.env.PIGATEWAY_URL || "http://127.0.0.1:3100",
    youtubeUrl: process.env.PITUBE_URL || "http://127.0.0.1:3105",
    tallyUrl: process.env.PILIGHT_URL || "http://127.0.0.1:3200",
    voiceUrl: process.env.PIVOICE_URL || "http://127.0.0.1:3101",
    apiKey: process.env.PIGATEWAY_API_KEY,
    soundUrl: process.env.PISOUND_URL || "http://127.0.0.1:3300",
    rundownUrl: process.env.PIRUNDOWN_URL || "http://127.0.0.1:3400",
    graphicsUrl: process.env.PIGRAPHICS_URL || "http://127.0.0.1:3107",
    programUrl: process.env.PIPROGRAM_URL || "http://127.0.0.1:3104",
    spaceUrl: process.env.PISPACE_URL || "http://127.0.0.1:3108",
    perceptionUrl: process.env.PIPERCEPTION_URL || "http://127.0.0.1:3110",
    json: false,
  };

  const remaining: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--gateway" && i + 1 < args.length) {
      config.gatewayUrl = args[++i]!;
    } else if (arg === "--youtube" && i + 1 < args.length) {
      config.youtubeUrl = args[++i]!;
    } else if (arg === "--tally" && i + 1 < args.length) {
      config.tallyUrl = args[++i]!;
    } else if (arg === "--voice" && i + 1 < args.length) {
      config.voiceUrl = args[++i]!;
    } else if (arg === "--sound" && i + 1 < args.length) {
      config.soundUrl = args[++i]!;
    } else if (arg === "--rundown" && i + 1 < args.length) {
      config.rundownUrl = args[++i]!;
    } else if (arg === "--graphics" && i + 1 < args.length) {
      config.graphicsUrl = args[++i]!;
    } else if (arg === "--program" && i + 1 < args.length) {
      config.programUrl = args[++i]!;
    } else if (arg === "--space" && i + 1 < args.length) {
      config.spaceUrl = args[++i]!;
    } else if (arg === "--perception" && i + 1 < args.length) {
      config.perceptionUrl = args[++i]!;
    } else if (arg === "--api-key" && i + 1 < args.length) {
      config.apiKey = args[++i]!;
    } else if (arg === "--json") {
      config.json = true;
    } else {
      remaining.push(arg);
    }
  }

  if (remaining.length === 0) {
    printUsage();
    process.exit(0);
  }

  const client = new GatewayClient(config);
  const command = remaining[0]!.toLowerCase();
  const sub = remaining[1]?.toLowerCase();
  const rest = remaining.slice(2);

  try {
    switch (command) {
      case "status": {
        const res = await client.getStatus();
        if (config.json) {
          console.log(JSON.stringify(res, null, 2));
        } else {
          console.log("=== Pi Ecosystem Status ===");
          console.log(`Service:      ${res.service || "pigateway"}`);
          console.log(`Mode:         ${res.mode || "unknown"}`);
          if (Array.isArray(res.inUseTabs)) {
            console.log(`In-Use Tabs:  ${res.inUseTabs.join(", ")}`);
          }
          if (Array.isArray(res.activePlugins)) {
            console.log(`Active Items: ${res.activePlugins.join(", ")}`);
          }
          console.log(`YouTube:      ${(res.youtube as any)?.state || "unknown"}`);
          console.log(`ATEM:         ${(res.atem as any)?.connected ? "CONNECTED" : "DISCONNECTED"}`);
          console.log(`Encoder:      ${(res.encoder as any)?.connected ? "CONNECTED" : "STANDBY"}`);
          console.log(`Radio Relay:  ${(res.radioRelay as any)?.reachable ? "ONLINE" : "STANDBY"}`);
          console.log(`Cameras:      ${Array.isArray(res.cameras) ? res.cameras.map((c: any) => `${c.id} (${c.connection})`).join(", ") : "none"}`);
        }
        break;
      }

      case "ecosystem": {
        const action = sub || "status";
        const eco = action === "probe"
          ? await client.probeEcosystem()
          : await client.getEcosystem();

        if (config.json) {
          console.log(JSON.stringify(eco, null, 2));
        } else {
          console.log(`=== Pi Ecosystem Control Plane (${action.toUpperCase()}) ===`);
          console.log(`Updated:      ${eco.updatedAt}`);
          console.log(`In-Use Tabs:  ${eco.inUseTabs.join(", ") || "none"}`);
          console.log(`Active Items: ${eco.activePlugins.join(", ") || "none"}\n`);
          console.log("Components:");
          for (const [id, comp] of Object.entries(eco.components)) {
            const statusBadge = comp.inUse ? "IN USE " : comp.available ? "ONLINE " : "OFFLINE";
            console.log(`  [${statusBadge}] ${id.padEnd(12)} -> Tab: ${comp.tab.padEnd(10)} | ${comp.name}`);
            if (comp.url) console.log(`               URL: ${comp.url}`);
          }
        }
        break;
      }

      case "sound": {
        const action = sub || "status";
        const result = action === "probe"
          ? await client.probeSound()
          : await client.getSoundStatus();

        if (config.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`=== PiSound Audio DSP (${action.toUpperCase()}) ===`);
          if (action === "probe") {
            const soundweb = (result.soundweb as any) || {};
            console.log(`Reachable:    ${result.ok ? "YES" : "NO"}`);
            console.log(`Soundweb:     ${soundweb.host}:${soundweb.port} (${soundweb.status || "unknown"})`);
            if (result.telemetry) {
              const tel = result.telemetry as any;
              console.log(`Telemetry:    ${tel.running ? "ACTIVE" : "STANDBY"} -> ${tel.host}:${tel.port}`);
            }
          } else {
            console.log(`Status:       ${result.status || "unknown"}`);
            console.log(`Mode:         ${result.mode || "unknown"}`);
            console.log(`DSP Host:     ${result.host}:${result.port}`);
            console.log(`Wireless On:  ${result.activeWirelessCount ?? "N/A"}`);
            console.log(`Wired On:     ${result.activeWiredCount ?? "N/A"}`);
          }
        }
        break;
      }

      case "youtube": {
        if (!sub || sub === "status") {
          const res = await client.getYoutubeStatus();
          if (config.json) {
            console.log(JSON.stringify(res, null, 2));
          } else {
            console.log("=== YouTube / pitube Status ===");
            console.log(`State:        ${(res as any).state || "offline"}`);
            console.log(`Health:       ${(res as any).streamHealth || "noData"}`);
            const b = (res as any).selectedBroadcast;
            if (b) {
              console.log(`Selected ID:  ${b.id}`);
              console.log(`Title:        ${b.title}`);
              console.log(`Privacy:      ${b.privacy}`);
              console.log(`Embed URL:    ${b.embedUrl}`);
            } else {
              console.log("Broadcast:    None selected");
            }
            if ((res as any).captions) {
              console.log(`Captions:     ${(res as any).captions.sent} sent, ${(res as any).captions.dropped} dropped`);
            }
          }
        } else if (sub === "list") {
          const res = await client.listBroadcasts();
          if (config.json) {
            console.log(JSON.stringify(res, null, 2));
          } else {
            console.log(`Selected: ${res.selectedId || "none"}`);
            console.log("Upcoming Broadcasts:");
            for (const item of res.items as any[]) {
              console.log(` - [${item.id}] ${item.title} (${item.privacy})`);
            }
          }
        } else if (sub === "select") {
          const target = rest[0];
          if (!target) throw new Error("Usage: picontrol youtube select <broadcastId|auto>");
          const res = await client.selectBroadcast(target);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Selected broadcast: ${target}`);
        } else if (sub === "create") {
          let title = "";
          let privacy = "public";
          let description = "";
          for (let i = 0; i < rest.length; i++) {
            if (rest[i] === "--title" && i + 1 < rest.length) title = rest[++i]!;
            else if (rest[i] === "--privacy" && i + 1 < rest.length) privacy = rest[++i]!;
            else if (rest[i] === "--desc" && i + 1 < rest.length) description = rest[++i]!;
          }
          if (!title) throw new Error("Usage: picontrol youtube create --title <title> [--privacy public|unlisted|private] [--desc description]");
          const res = await client.createBroadcast({ title, privacy, description });
          console.log(config.json ? JSON.stringify(res, null, 2) : `Created broadcast: ${(res as any).id || title}`);
        } else if (sub === "start") {
          const res = await client.startBroadcast();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Broadcast transitioned to LIVE");
        } else if (sub === "stop") {
          const res = await client.stopBroadcast();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Broadcast ended (COMPLETED)");
        } else {
          throw new Error(`Unknown youtube action: ${sub}`);
        }
        break;
      }

      case "tally": {
        if (!sub || sub === "list") {
          const res = await client.listTallyLights();
          if (config.json) {
            console.log(JSON.stringify(res, null, 2));
          } else {
            console.log("=== Tally Lights ===");
            for (const l of res as any[]) {
              console.log(` - ${l.id} (${l.name}): ${l.mode?.toUpperCase()} [Brightness: ${l.brightness}, Hold: ${l.hold ? "ON" : "OFF"}]`);
            }
          }
        } else if (sub === "set") {
          const [id, mode] = rest;
          if (!id || !mode) throw new Error("Usage: picontrol tally set <id> <pgm|prv|off|#hex>");
          const res = await client.setTallyState(id, mode);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Set ${id} -> ${mode}`);
        } else if (sub === "cue") {
          const [id, dir] = rest;
          if (!id || !dir) throw new Error("Usage: picontrol tally cue <id> <pan-left|pan-right|zoom-in|zoom-out|operator-call>");
          const res = await client.sendTallyCue(id, dir);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Sent cue ${dir} to ${id}`);
        } else if (sub === "call") {
          const id = rest[0];
          if (!id) throw new Error("Usage: picontrol tally call <id>");
          const res = await client.sendTallyCall(id);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Sent call to ${id}`);
        } else if (sub === "hold") {
          const [id, val] = rest;
          if (!id || val === undefined) throw new Error("Usage: picontrol tally hold <id> <0|1|true|false>");
          const hold = val === "1" || val.toLowerCase() === "true";
          const res = await client.toggleTallyHold(id, hold);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Tally ${id} hold: ${hold}`);
        } else if (sub === "brightness") {
          const [id, level] = rest;
          if (!id || !["low", "medium", "high"].includes(level || "")) {
            throw new Error("Usage: picontrol tally brightness <id> <low|medium|high>");
          }
          const res = await client.setTallyBrightness(id, level as "low" | "medium" | "high");
          console.log(config.json ? JSON.stringify(res, null, 2) : `Tally ${id} brightness: ${level}`);
        } else if (sub === "cycle") {
          const id = rest[0];
          if (!id) throw new Error("Usage: picontrol tally cycle <id>");
          const res = await client.cycleTally(id);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Triggered 9-LED cycle test on ${id}`);
        } else {
          throw new Error(`Unknown tally action: ${sub}`);
        }
        break;
      }

      case "voice": {
        if (!sub || sub === "status") {
          const res = await client.getVoiceStatus();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "capture") {
          const action = rest[0]?.toLowerCase();
          if (action !== "start" && action !== "stop") throw new Error("Usage: picontrol voice capture <start|stop>");
          const res = await client.setVoiceCapture(action === "start");
          console.log(config.json ? JSON.stringify(res, null, 2) : `Capture ${action}ed`);
        } else {
          throw new Error(`Unknown voice action: ${sub}`);
        }
        break;
      }

      case "radio": {
        if (!sub || sub === "status") {
          const res = await client.getRadioStatus();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "start") {
          const res = await client.startRadio();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Web radio relay started");
        } else if (sub === "stop") {
          const res = await client.stopRadio();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Web radio relay stopped");
        } else {
          throw new Error(`Unknown radio action: ${sub}`);
        }
        break;
      }

      case "atem": {
        if (!sub || sub === "status") {
          const res = await client.getAtemState();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "cut") {
          const res = await client.atemCut();
          console.log(config.json ? JSON.stringify(res, null, 2) : "ATEM CUT triggered");
        } else if (sub === "auto") {
          const res = await client.atemAuto();
          console.log(config.json ? JSON.stringify(res, null, 2) : "ATEM AUTO transition triggered");
        } else if (sub === "preview") {
          const input = Number.parseInt(rest[0] || "", 10);
          if (Number.isNaN(input)) throw new Error("Usage: picontrol atem preview <inputNumber>");
          const res = await client.atemPreview(input);
          console.log(config.json ? JSON.stringify(res, null, 2) : `ATEM preview set to ${input}`);
        } else if (sub === "ftb") {
          const res = await client.atemFtb();
          console.log(config.json ? JSON.stringify(res, null, 2) : "ATEM FTB toggled");
        } else {
          throw new Error(`Unknown atem action: ${sub}`);
        }
        break;
      }

      case "matrix": {
        if (!sub || sub === "status") {
          const res = await client.getMatrixRoutes();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "route") {
          const inp = Number.parseInt(rest[0] || "", 10);
          const out = Number.parseInt(rest[1] || "", 10);
          if (Number.isNaN(inp) || Number.isNaN(out)) throw new Error("Usage: picontrol matrix route <input> <output>");
          const res = await client.routeMatrix(inp, out);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Matrix route: input ${inp} -> output ${out}`);
        } else {
          throw new Error(`Unknown matrix action: ${sub}`);
        }
        break;
      }

      case "encoder": {
        if (!sub || sub === "status") {
          const res = await client.getEncoderState();
          if (config.json) {
            console.log(JSON.stringify(res, null, 2));
          } else {
            console.log("=== Matrox Monarch HDX Encoder ===");
            console.log(`Device:    ${res.name || "Matrox Monarch HDX"}`);
            console.log(`Connected: ${res.connected ? "YES" : "NO"}`);
            console.log(`Encoder 1: ${(res.encoder1 as any)?.state || "UNKNOWN"} (mode: ${(res.encoder1 as any)?.mode || "rtmp"})`);
            console.log(`Encoder 2: ${(res.encoder2 as any)?.state || "UNKNOWN"} (mode: ${(res.encoder2 as any)?.mode || "record"})`);
          }
        } else if (sub === "start") {
          const targetArg = rest[0]?.toLowerCase();
          const target = targetArg === "1" ? 1 : targetArg === "2" ? 2 : "both";
          const res = await client.startEncoder(target);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Encoder started: ${target}`);
        } else if (sub === "stop") {
          const targetArg = rest[0]?.toLowerCase();
          const target = targetArg === "1" ? 1 : targetArg === "2" ? 2 : "both";
          const res = await client.stopEncoder(target);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Encoder stopped: ${target}`);
        } else if (sub === "settings") {
          const res = await client.getEncoderSettings();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else {
          throw new Error(`Unknown encoder action: ${sub}. Supported: status, start, stop, settings`);
        }
        break;
      }

      case "camera": {
        if (!sub || sub === "list") {
          const res = await client.listCameras();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "move") {
          const [id, dir] = rest;
          if (!id || !dir) throw new Error("Usage: picontrol camera move <camId> <up|down|left|right|stop>");
          const res = await client.moveCamera(id, dir);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Camera ${id} move: ${dir}`);
        } else if (sub === "zoom") {
          const [id, action] = rest;
          if (!id || !action) throw new Error("Usage: picontrol camera zoom <camId> <in|out|stop>");
          const res = await client.zoomCamera(id, action);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Camera ${id} zoom: ${action}`);
        } else if (sub === "preset") {
          const [id, presetStr] = rest;
          const presetId = Number.parseInt(presetStr || "", 10);
          if (!id || Number.isNaN(presetId)) throw new Error("Usage: picontrol camera preset <camId> <presetId> [--save]");
          const isSave = rest.includes("--save");
          const res = isSave ? await client.savePreset(id, presetId) : await client.recallPreset(id, presetId);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Camera ${id} preset ${presetId} ${isSave ? "saved" : "recalled"}`);
        } else {
          throw new Error(`Unknown camera action: ${sub}`);
        }
        break;
      }

      case "rundown": {
        if (!sub || sub === "status") {
          const res = await client.getRundown();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "next") {
          const res = await client.nextRundown();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Advanced to next item");
        } else if (sub === "prev" || sub === "previous") {
          const res = await client.prevRundown();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Moved to previous item");
        } else if (sub === "reset") {
          const res = await client.resetRundown();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Reset rundown to beginning");
        } else if (sub === "fire") {
          const target = rest[0];
          if (!target) throw new Error("Usage: picontrol rundown fire <lineNum|itemId>");
          const res = await client.fireRundown(target);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Fired cue ${target}`);
        } else if (sub === "cues") {
          const state = rest[0] as "on" | "off" | "toggle" | undefined;
          const res = await client.toggleCues(state);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Cue engine: ${state || "toggle"}`);
        } else if (sub === "storage") {
          const [action, id] = rest;
          if (action === "load" && id) {
            const res = await client.loadRundownStorage(id);
            console.log(config.json ? JSON.stringify(res, null, 2) : `Loaded rundown: ${id}`);
          } else {
            const res = await client.listRundownStorage();
            console.log(config.json ? JSON.stringify(res, null, 2) : res);
          }
        } else {
          throw new Error(`Unknown rundown action: ${sub}`);
        }
        break;
      }

      case "graphics": {
        if (!sub || sub === "status") {
          const res = await client.getGraphicsStatus();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "templates") {
          const res = await client.listGraphicsTemplates();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "active") {
          const res = await client.getActiveGraphics();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "show") {
          const templateId = rest[0];
          if (!templateId) throw new Error("Usage: picontrol graphics show <templateId> [durationMs]");
          const duration = rest[1] ? Number.parseInt(rest[1], 10) : undefined;
          const res = await client.showGraphic(templateId, undefined, duration);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Triggered graphic: ${templateId}`);
        } else if (sub === "hide") {
          const instId = rest[0];
          if (!instId) throw new Error("Usage: picontrol graphics hide <instanceId>");
          const res = await client.hideGraphic(instId);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Hidden graphic: ${instId}`);
        } else if (sub === "clear") {
          const res = await client.clearGraphics();
          console.log(config.json ? JSON.stringify(res, null, 2) : "Cleared all graphics off-air");
        } else {
          throw new Error(`Unknown graphics action: ${sub}`);
        }
        break;
      }

      case "program": {
        if (!sub || sub === "status") {
          const res = await client.getProgramStatus();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "pipelines") {
          const res = await client.listPipelines();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "advance" || sub === "next") {
          const pipeId = rest[0] || "default";
          const res = await client.advanceProgramSlide(pipeId);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Advanced pipeline: ${pipeId}`);
        } else if (sub === "hymn") {
          const hymn = rest[0];
          if (!hymn) throw new Error("Usage: picontrol program hymn <number>");
          const res = await client.triggerHymn(hymn);
          console.log(config.json ? JSON.stringify(res, null, 2) : `Selected hymn: ${hymn}`);
        } else {
          throw new Error(`Unknown program action: ${sub}`);
        }
        break;
      }

      case "space": {
        if (!sub || sub === "status" || sub === "venue") {
          const res = await client.getVenue();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "state") {
          const res = await client.getSpatialState();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else {
          throw new Error(`Unknown space action: ${sub}`);
        }
        break;
      }

      case "perception": {
        if (!sub || sub === "status") {
          const res = await client.getPerceptionStatus();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else if (sub === "tracks") {
          const res = await client.getPerceptionTracks();
          console.log(config.json ? JSON.stringify(res, null, 2) : res);
        } else {
          throw new Error(`Unknown perception action: ${sub}`);
        }
        break;
      }

      case "world": {
        const res = await client.getWorldState();
        console.log(config.json ? JSON.stringify(res, null, 2) : res);
        break;
      }

      case "transcripts": {
        const res = await client.getTranscripts();
        console.log(config.json ? JSON.stringify(res, null, 2) : res);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (config.json) {
      console.error(JSON.stringify({ error: msg }));
    } else {
      console.error(`Error: ${msg}`);
    }
    process.exit(1);
  }
}

void main();
