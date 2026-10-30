import"./modulepreload-polyfill-B5Qt9EMX.js";import{r as o,a as L,b as p}from"./caption-item-CVx_m0sR.js";function S(e){const t=typeof e.size=="number"?`text-[${e.size}px]`:e.size==="xs"?"text-[14px]":e.size==="sm"?"text-[16px]":e.size==="md"?"text-[20px]":e.size==="lg"?"text-[24px]":e.size==="xl"?"text-[32px]":"text-[18px]",i=e.filled?"material-symbols-filled":"material-symbols-outlined",a=e.id?` id="${e.id}"`:"",n=e.color??"",s=e.className??"";return`<span${a} class="${i} ${t} ${n} ${s}" aria-hidden="true">${e.name}</span>`}function l(e){const t=e.type??"button",i=e.size==="xs"?"h-7 px-2 text-[10px] gap-1":e.size==="sm"?"h-8 px-2.5 text-[11px] gap-1.5":e.size==="lg"?"h-11 px-4 text-[13px] gap-2":"h-9 px-3 text-[12px] gap-1.5";let a="bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30";switch(e.variant){case"primary":a=e.active?"bg-primary-container text-on-primary shadow-sm":"bg-primary text-on-primary hover:bg-primary/90 shadow-sm";break;case"secondary":a="bg-secondary-container text-on-secondary-container hover:bg-secondary";break;case"danger":a="bg-error text-on-error hover:bg-error/90";break;case"ghost":a="bg-transparent text-on-surface hover:bg-surface-container-high";break;case"surface-high":a="bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40";break;case"atem-pgm":a="bg-red-600 text-white font-bold";break;case"atem-pvw":a="bg-green-600 text-white font-bold";break;case"atem-tie":a="bg-amber-500 text-on-surface font-bold";break;case"surface":default:a=e.active?"bg-primary text-on-primary shadow-sm":"bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30";break}const n=e.disabled?" disabled":"",s=e.id?` id="${e.id}"`:"",r=e.title?` title="${e.title}"`:"",c=e.onClickAttr?` onclick="${e.onClickAttr}"`:"",d=e.className??"";let u="";if(e.dataAttributes)for(const[h,y]of Object.entries(e.dataAttributes))u+=` data-${h}="${y}"`;const v=e.icon?S({name:e.icon,size:e.iconSize??(e.size==="xs"?14:16)}):"",b=e.label?`<span>${e.label}</span>`:"",x=e.badge?`<span class="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-black/20">${e.badge}</span>`:"";return`<button type="${t}"${s}${r}${n}${c}${u} class="inline-flex items-center justify-center rounded-lg font-label-sm font-bold uppercase transition-all select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${i} ${a} ${d}">
    ${v}
    ${b}
    ${x}
  </button>`}function m(e){let t="bg-surface-container-low border border-outline-variant/30";switch(e.variant){case"high":t="bg-surface-container-high border border-outline-variant/40";break;case"highest":t="bg-surface-container-highest border border-outline-variant/50";break;case"outlined":t="bg-surface border border-outline-variant/50";break;case"interactive":t="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 cursor-pointer transition-all";break;case"default":case"low":default:t="bg-surface-container-low border border-outline-variant/30";break}const i=e.id?` id="${e.id}"`:"",a=e.onClickAttr?` onclick="${e.onClickAttr}"`:"",n=e.className??"",r=e.title||e.icon||e.badgeHtml||e.headerActionHtml?`<div class="flex items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
        <div class="flex items-center gap-2 min-w-0">
          ${e.icon?`<div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">${S({name:e.icon,size:18})}</div>`:""}
          <div class="min-w-0">
            ${e.title?`<h3 class="font-headline-sm text-[15px] font-bold text-on-surface leading-tight truncate">${e.title}</h3>`:""}
            ${e.subtitle?`<span class="font-label-sm text-[10px] text-on-surface-variant block truncate">${e.subtitle}</span>`:""}
          </div>
          ${e.badgeHtml??""}
        </div>
        ${e.headerActionHtml?`<div class="flex items-center gap-1.5 flex-shrink-0">${e.headerActionHtml}</div>`:""}
      </div>`:"",c=e.footerHtml?`<div class="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-body-sm">
        ${e.footerHtml}
      </div>`:"";return`<div${i}${a} class="rounded-xl p-3.5 shadow-sm space-y-2.5 ${t} ${n}">
    ${r}
    <div class="card-body">
      ${e.content}
    </div>
    ${c}
  </div>`}function $(e){const t=e.step??1,i=e.disabled?" disabled":"",a=e.onInputAttr?` oninput="${e.onInputAttr}"`:"",n=e.onChangeAttr?` onchange="${e.onChangeAttr}"`:"",s=e.className??"";let r="";if(e.dataAttributes)for(const[d,u]of Object.entries(e.dataAttributes))r+=` data-${d}="${u}"`;const c=e.label||e.showValue?`<div class="flex items-center justify-between text-[11px] font-label-sm mb-1">
        ${e.label?`<span class="text-on-surface-variant">${e.label}</span>`:"<span></span>"}
        ${e.showValue!==!1?`<span class="font-mono font-bold text-on-surface" id="${e.id}-val">${e.value}${e.unit?` ${e.unit}`:""}</span>`:""}
      </div>`:"";return`<div class="w-full ${s}">
    ${c}
    <input
      type="range"
      id="${e.id}"
      min="${e.min}"
      max="${e.max}"
      step="${t}"
      value="${e.value}"
      ${i}
      ${a}
      ${n}
      ${r}
      class="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none disabled:opacity-40"
    />
  </div>`}function C(e){const t=e.size==="sm"?"p-0.5 text-[10px]":"p-1 text-[11px]",i=e.id?` id="${e.id}"`:"",a=e.className??"",n=e.options.map(s=>{const c=s.value===e.selectedValue?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-transparent hover:text-on-surface hover:bg-surface-container",d=s.icon?`<span class="material-symbols-outlined text-[13px] leading-none">${s.icon}</span>`:"",u=e.actionName?` data-action="${e.actionName}"`:"",v=e.sectionName?` data-section="${e.sectionName}"`:"",b=e.disabled?" disabled":"";return`<button
      type="button"
      data-value="${s.value}"
      ${u}
      ${v}
      ${b}
      class="flex-1 py-1 px-2 rounded-md font-label-sm uppercase font-bold transition-all inline-flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 ${c}"
    >
      ${d}
      <span>${s.label}</span>
    </button>`}).join("");return`<div${i} class="flex gap-1 bg-surface-container-highest rounded-lg ${t} ${a}">
    ${n}
  </div>`}function g(e){const t=e.size==="sm"?"p-1.5 text-[10px]":e.size==="lg"?"p-3 text-[14px]":"p-2 text-[11px]";let i="text-on-surface";e.alert||e.color==="error"?i="text-error":e.color==="success"?i="text-emerald-600 dark:text-emerald-400":e.color==="warning"?i="text-amber-600 dark:text-amber-400":e.color==="primary"&&(i="text-primary");const a=e.id?` id="${e.id}"`:"",n=e.className??"";return`<div${a} class="rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col justify-between ${t} ${n}">
    <span class="text-on-surface-variant block uppercase font-bold text-[9px] tracking-wider truncate">${e.label}</span>
    <div class="flex items-baseline gap-1 mt-0.5">
      <span class="font-bold font-mono text-[14px] leading-tight ${i}">${e.value}</span>
      ${e.unit?`<span class="text-[10px] font-mono text-on-surface-variant">${e.unit}</span>`:""}
    </div>
    ${e.sublabel?`<span class="text-[9px] text-on-surface-variant/80 mt-0.5 truncate">${e.sublabel}</span>`:""}
  </div>`}function A(e){const t=e.min??-60,i=e.max??0,a=Math.max(t,Math.min(i,e.value)),n=Math.max(0,Math.min(100,(a-t)/(i-t)*100));let s="bg-emerald-500";n>90?s="bg-red-500":n>75&&(s="bg-amber-500");const r=e.id?` id="${e.id}"`:"",c=e.className??"";return e.orientation==="vertical"?`<div class="flex flex-col items-center gap-1 ${c}">
      <div${r} class="w-2.5 h-24 bg-surface-container-highest rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-outline-variant/30">
        <div class="w-full rounded-full transition-all duration-75 ${s}" style="height: ${n}%;"></div>
      </div>
      ${e.label?`<span class="text-[9px] font-mono text-on-surface-variant">${e.label}</span>`:""}
    </div>`:`<div class="w-full ${c}">
    ${e.label?`<div class="flex justify-between text-[9px] font-mono text-on-surface-variant mb-0.5"><span>${e.label}</span><span>${Math.round(a)} dB</span></div>`:""}
    <div${r} class="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
      <div class="h-full rounded-full transition-all duration-75 ${s}" style="width: ${n}%;"></div>
    </div>
  </div>`}function B(e){const t=e.isVoiceActive,i=e.processedCount??0,a=e.droppedCount??0,n=e.lagMs??120,s=e.language??"fi",r=o({label:"Voice Detected",variant:"success",dot:"live",pulse:t,size:"xs"}),c=o({label:"STT Ready",variant:"success",dot:"online",size:"xs"}),d=l({icon:"refresh",variant:"surface-high",size:"xs",title:"Refresh Transcripts",onClickAttr:e.onRefreshClickAttr}),u=`<div class="grid grid-cols-4 gap-1.5 pt-1">
    ${g({label:"Language",value:s.toUpperCase(),size:"sm"})}
    ${g({label:"Lag",value:n,unit:"ms",size:"sm",color:n>1e3?"warning":"primary"})}
    ${g({label:"Processed",value:i,size:"sm",color:"success"})}
    ${g({label:"Dropped",value:a,size:"sm",alert:a>0,color:a>0?"error":"neutral"})}
  </div>`,v=e.maxHeight??"max-h-56",b=e.captions.length>0?`<div class="space-y-1.5 overflow-y-auto ${v} pr-0.5">
        ${e.captions.map(h=>L(h)).join("")}
      </div>`:`<div class="p-4 text-center text-[12px] text-on-surface-variant italic rounded-lg bg-surface-container/50 border border-outline-variant/20">
        No captions received yet. Live speech from Sanctuary mics will appear here with delivery flags.
      </div>`,x=`<div class="space-y-2.5">
    ${u}
    <div class="pt-1">
      <div class="flex items-center justify-between text-[11px] font-label-sm mb-1.5">
        <span class="font-bold text-on-surface uppercase">Live Transcript Stream</span>
        <span class="text-[10px] text-on-surface-variant">Real-time STT & Dispatch Flags</span>
      </div>
      ${b}
    </div>
  </div>`;return m({title:"Live Speech & Captions Flow",subtitle:"Liturgos Auditor STT -> PiVoice -> Pitube & Relay",icon:"closed_caption",badgeHtml:`<div class="flex items-center gap-1">${r}${c}</div>`,headerActionHtml:d,content:x,className:e.className})}function P(e){const t=e.state==="live",i=e.state==="testing",a=e.state==="ready";let n="neutral",s=e.state.toUpperCase();t?(n="error",s="LIVE ON AIR"):i?(n="warning",s="TESTING"):a&&(n="success",s="READY");const r=o({label:s,variant:n,dot:t?"live":i?"warning":a?"online":"offline",pulse:t||i,size:"sm"});let c="neutral";e.health==="good"?c="success":e.health==="ok"?c="warning":e.health==="poor"&&(c="error");const d=o({label:`HEALTH: ${e.health.toUpperCase()}`,variant:c,size:"xs"}),u=a||i?l({label:i?"Go Live Now":"Start Broadcast",icon:"podcasts",variant:"primary",size:"sm",onClickAttr:e.onStartClickAttr}):"",v=t||i?l({label:"End Stream",icon:"stop_circle",variant:"danger",size:"sm",onClickAttr:e.onStopClickAttr}):"",b=l({label:"New Ad-Hoc",icon:"add",variant:"surface-high",size:"sm",onClickAttr:e.onCreateClickAttr}),x=e.embedUrl?l({label:"Watch Feed",icon:"open_in_new",variant:"ghost",size:"sm",onClickAttr:e.onViewClickAttr??`window.open('${e.embedUrl}', '_blank')`}):"",h=e.broadcastTitle??"No broadcast selected (Auto-detecting next event)",y=e.privacy?e.privacy.toUpperCase():"PUBLIC",T=`<div class="grid grid-cols-3 gap-2 pt-1">
    ${g({label:"Captions Sent",value:e.captionsSent??0,size:"sm",color:"success"})}
    ${g({label:"Captions Dropped",value:e.captionsDropped??0,size:"sm",alert:(e.captionsDropped??0)>0,color:(e.captionsDropped??0)>0?"error":"neutral"})}
    ${g({label:"Gateway Link",value:e.gatewayConnected?"ACTIVE":"OFFLINE",size:"sm",color:e.gatewayConnected?"success":"neutral"})}
  </div>`,N=`<div class="space-y-3">
    <div class="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-surface-container border border-outline-variant/30">
      <div class="min-w-0">
        <span class="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold block">Selected Broadcast</span>
        <h4 class="font-headline-sm text-[14px] font-bold text-on-surface truncate">${h}</h4>
        <span class="text-[10px] font-mono text-on-surface-variant">${y} • YouTube Live</span>
      </div>
      <div class="flex flex-col items-end gap-1 flex-shrink-0">
        ${d}
      </div>
    </div>

    ${T}

    <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-outline-variant/20">
      <div class="flex items-center gap-1.5">
        ${b}
        ${x}
      </div>
      <div class="flex items-center gap-1.5">
        ${v}
        ${u}
      </div>
    </div>
  </div>`;return m({title:"YouTube Live Broadcast",subtitle:"PiTube Lifecycle Coordinator & RTMP Pipeline",icon:"smart_display",badgeHtml:r,content:N,className:e.className})}function H(e){const t=e.encoder1.state.toLowerCase()==="streaming"||e.encoder1.state.toLowerCase()==="active",i=e.encoder2.state.toLowerCase()==="recording"||e.encoder2.state.toLowerCase()==="active",a=o({label:e.encoder1.state.toUpperCase(),variant:t?"success":"neutral",dot:t?"live":"offline",pulse:t,size:"xs"}),n=o({label:e.encoder2.state.toUpperCase(),variant:i?"error":"neutral",dot:i?"live":"offline",pulse:i,size:"xs"}),s=o({label:"ONLINE",variant:"success",dot:"online",size:"xs"}),r=`<div class="space-y-2.5">
    <div class="grid grid-cols-2 gap-2">
      <!-- Encoder 1: Streaming -->
      <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-label-sm uppercase font-bold text-on-surface-variant">Enc 1: Stream (RTMP)</span>
          ${a}
        </div>
        <div class="flex items-baseline justify-between text-[11px] font-mono">
          <span class="text-on-surface-variant">Mode: ${e.encoder1.mode}</span>
          <span class="font-bold text-on-surface">${e.encoder1.bitrateKbps?`${e.encoder1.bitrateKbps} kbps`:"--"}</span>
        </div>
      </div>

      <!-- Encoder 2: Recording -->
      <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-label-sm uppercase font-bold text-on-surface-variant">Enc 2: Record (File)</span>
          ${n}
        </div>
        <div class="flex items-baseline justify-between text-[11px] font-mono">
          <span class="text-on-surface-variant">Mode: ${e.encoder2.mode}</span>
          <span class="font-bold text-on-surface">${e.encoder2.bitrateKbps?`${e.encoder2.bitrateKbps} kbps`:"--"}</span>
        </div>
      </div>
    </div>

    ${e.error?`<div class="p-2 rounded bg-error-container text-on-error-container text-[11px]">${e.error}</div>`:""}
  </div>`;return m({title:e.name??"Matrox Monarch HDX",subtitle:"Hardware H.264 Broadcast Encoder Dual Channel",icon:"memory",badgeHtml:s,content:r,className:e.className})}function k(e){const t=e.peakDbfs??-60,i=e.signalPresent??t>-45,a=e.isMuted;let n="mic";e.group==="madonna"?n="headset_mic":e.group==="wired"?n="settings_voice":e.group==="master"&&(n="volume_up");const s=i&&!a?'<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active talker"></span>':'<span class="w-2 h-2 rounded-full bg-outline/30"></span>',r=l({label:a?"MUTED":"ON",variant:a?"danger":"surface-high",size:"xs",onClickAttr:e.onMuteToggleAttr,dataAttributes:{channel:e.id,action:"toggle-mute"},className:"w-14"}),c=e.isSolo!==void 0?l({label:"SOLO",variant:e.isSolo?"primary":"ghost",size:"xs",onClickAttr:e.onSoloToggleAttr,dataAttributes:{channel:e.id,action:"toggle-solo"},className:"w-11"}):"",d=$({id:`fader-${e.id}`,min:0,max:100,value:e.volumePercent,disabled:a,onInputAttr:e.onVolumeChangeAttr,dataAttributes:{channel:e.id}}),u=A({value:a?-60:t,min:-60,max:0,className:"flex-1"}),v=e.className??"";return`<div class="p-2.5 rounded-xl bg-surface-container-low border ${i&&!a?"border-emerald-500/40":"border-outline-variant/30"} flex flex-col gap-2 transition-all ${v}">
    <div class="flex items-center justify-between gap-1.5">
      <div class="flex items-center gap-1.5 min-w-0">
        <div class="w-6 h-6 rounded-md bg-surface-container-highest text-on-surface flex items-center justify-center flex-shrink-0">
          ${S({name:n,size:15})}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1">
            ${s}
            <h4 class="font-headline-sm text-[13px] font-bold text-on-surface truncate leading-tight">${e.name}</h4>
          </div>
          <span class="text-[9px] font-label-sm text-on-surface-variant block truncate leading-tight">${e.role}</span>
        </div>
      </div>

      <div class="flex items-center gap-1 flex-shrink-0">
        ${c}
        ${r}
      </div>
    </div>

    <div class="flex items-center gap-2 pt-0.5">
      <div class="flex-1">
        ${d}
      </div>
      <span class="font-mono text-[11px] font-bold w-9 text-right text-on-surface">${e.volumePercent}%</span>
    </div>

    <div class="pt-0.5">
      ${u}
    </div>
  </div>`}function D(e){const t=e.speed??12,i=l({icon:"arrow_drop_up",iconSize:22,variant:"surface-high",size:"md",className:"w-11 h-11",dataAttributes:{cam:e.cameraId,dir:"up"}}),a=l({icon:"arrow_drop_down",iconSize:22,variant:"surface-high",size:"md",className:"w-11 h-11",dataAttributes:{cam:e.cameraId,dir:"down"}}),n=l({icon:"arrow_left",iconSize:22,variant:"surface-high",size:"md",className:"w-11 h-11",dataAttributes:{cam:e.cameraId,dir:"left"}}),s=l({icon:"arrow_right",iconSize:22,variant:"surface-high",size:"md",className:"w-11 h-11",dataAttributes:{cam:e.cameraId,dir:"right"}}),r=l({icon:"home",iconSize:18,variant:"surface",size:"sm",className:"w-11 h-11",dataAttributes:{cam:e.cameraId,dir:"home"},title:"Home Position"}),c=l({icon:"zoom_in",label:"In",variant:"surface-high",size:"sm",className:"flex-1",dataAttributes:{cam:e.cameraId,dir:"zoom-in"}}),d=l({icon:"zoom_out",label:"Out",variant:"surface-high",size:"sm",className:"flex-1",dataAttributes:{cam:e.cameraId,dir:"zoom-out"}}),u=$({id:`ptz-speed-${e.cameraId}`,min:1,max:24,value:t,label:"PTZ Speed",unit:"",onInputAttr:e.onSpeedChangeAttr,dataAttributes:{cam:e.cameraId}});return`<div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col items-center gap-2.5 ${e.className??""}">
    <!-- D-Pad Grid -->
    <div class="grid grid-cols-3 gap-1.5 items-center justify-items-center w-36">
      <div></div>
      <div>${i}</div>
      <div></div>
      <div>${n}</div>
      <div>${r}</div>
      <div>${s}</div>
      <div></div>
      <div>${a}</div>
      <div></div>
    </div>

    <!-- Zoom Controls -->
    <div class="flex items-center gap-1.5 w-full pt-1">
      ${c}
      ${d}
    </div>

    <!-- Speed Slider -->
    <div class="w-full pt-1 border-t border-outline-variant/20">
      ${u}
    </div>
  </div>`}function E(e){const t=o({label:e.targetLightName??e.targetLightId.toUpperCase(),variant:"accent",size:"xs"}),i=l({label:"Pan V",icon:"arrow_back",variant:"surface-high",size:"sm",className:"flex-1",dataAttributes:{cue:"pan-left",light:e.targetLightId},title:"Cue Operator: Pan Left"}),a=l({label:"Pan O",icon:"arrow_forward",variant:"surface-high",size:"sm",className:"flex-1",dataAttributes:{cue:"pan-right",light:e.targetLightId},title:"Cue Operator: Pan Right"}),n=l({label:"Zoom +",icon:"zoom_in",variant:"surface-high",size:"sm",className:"flex-1",dataAttributes:{cue:"zoom-in",light:e.targetLightId},title:"Cue Operator: Zoom In"}),s=l({label:"Zoom -",icon:"zoom_out",variant:"surface-high",size:"sm",className:"flex-1",dataAttributes:{cue:"zoom-out",light:e.targetLightId},title:"Cue Operator: Zoom Out"}),r=l({label:"Kutsu / Huomio",icon:"notifications_active",variant:"primary",size:"sm",className:"w-full",dataAttributes:{cue:"operator-call",light:e.targetLightId},title:"Call Camera Operator"}),c=`<div class="space-y-2">
    <div class="grid grid-cols-2 gap-1.5">
      ${i}
      ${a}
    </div>
    <div class="grid grid-cols-2 gap-1.5">
      ${n}
      ${s}
    </div>
    <div class="pt-0.5">
      ${r}
    </div>
  </div>`;return m({title:"Ohjaajan Kuvaaja-Cuet",subtitle:"Tally-Ma langaton LED-merkinanto kuvaajalle",icon:"sports_score",badgeHtml:t,content:c,className:e.className})}function z(e){const t=e.connected??!0,i=o({label:t?"ONLINE":"OFFLINE",variant:t?"success":"neutral",dot:t?"online":"offline",size:"xs"}),a=o({label:e.mode.toUpperCase(),variant:e.mode==="pgm"?"error":e.mode==="prv"?"success":"neutral",size:"xs"}),s=(e.zones??Array.from({length:9},(d,u)=>({index:u,color:e.mode==="pgm"?[255,0,0]:e.mode==="prv"?[0,255,0]:[40,40,40]}))).map((d,u)=>{const v=`rgb(${d.color[0]}, ${d.color[1]}, ${d.color[2]})`,x=d.color[0]>30||d.color[1]>30||d.color[2]>30?`box-shadow: 0 0 8px ${v};`:"";return`<div class="flex flex-col items-center gap-1">
      <div class="w-6 h-6 rounded-full border border-black/40 transition-all flex items-center justify-center text-[8px] font-mono font-bold text-white/90" style="background-color: ${v}; ${x}">
        ${u+1}
      </div>
    </div>`}).join(""),r=e.activeFacet?`<div class="flex items-center justify-between text-[11px] font-label-sm pt-1 border-t border-outline-variant/20">
        <span class="text-on-surface-variant">Active Facet:</span>
        <span class="font-bold text-primary font-mono">${e.activeFacet}</span>
      </div>`:"",c=`<div class="space-y-2.5">
    <!-- LED Matrix Grid (9 zones in a single row or 3x3) -->
    <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-1">
      ${s}
    </div>

    <div class="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
      <span>Host: ${e.host}</span>
      ${e.fallbackIp?`<span>Fallback: ${e.fallbackIp}</span>`:""}
    </div>

    ${r}
  </div>`;return m({title:e.name,subtitle:"Tally-Ma Wireless LED Controller • 9-Zone Segmented",icon:"highlight",badgeHtml:`<div class="flex items-center gap-1">${a}${i}</div>`,content:c,className:e.className})}function j(e){const t=e.inputs??[{id:1,label:"CAM 1"},{id:2,label:"CAM 2"},{id:3,label:"PIPGM"}],i=o({label:e.connected?`PGM ${e.programInput??"-"} • PVW ${e.previewInput??"-"}`:"OFFLINE",variant:e.connected?"success":"neutral",dot:e.connected?"online":"offline",size:"xs"}),a=t.map(d=>{const u=e.connected&&e.programInput===d.id,v=e.connected&&e.previewInput===d.id;let b="surface-high";return u?b="atem-pgm":v&&(b="atem-pvw"),l({label:`${d.id}: ${d.label}`,variant:b,size:"md",className:"flex-1 h-11 text-[13px]",dataAttributes:{"atem-in":d.id},onClickAttr:e.onInputSelectAttr?e.onInputSelectAttr(d.id):void 0})}).join(""),n=l({label:"CUT",variant:"surface-high",size:"sm",className:"flex-1 font-mono font-bold",onClickAttr:e.onCutClickAttr}),s=l({label:"AUTO",variant:e.isAutoActive?"atem-pgm":"surface-high",size:"sm",className:`flex-1 font-mono font-bold ${e.isAutoActive?"animate-pulse":""}`,onClickAttr:e.onAutoClickAttr}),r=l({label:"FTB",variant:e.isFtbActive?"danger":"surface-high",size:"sm",className:`flex-1 font-mono font-bold ${e.isFtbActive?"animate-pulse":""}`,onClickAttr:e.onFtbClickAttr}),c=`<div class="space-y-2.5">
    <!-- Camera / Input Selectors -->
    <div class="flex gap-2">
      ${a}
    </div>

    <!-- Transition Control Bar -->
    <div class="flex gap-2 pt-1 border-t border-outline-variant/20">
      ${n}
      ${s}
      ${r}
    </div>
  </div>`;return m({title:"ATEM Switcher Bus",subtitle:"Hardware Video Mixer • Preview / Program Transition Engine",icon:"switch_video",badgeHtml:i,content:c,className:e.className})}function w(e){const t=e.inputs??[{id:1,label:"LUKUPULPETTI"},{id:2,label:"RÄKKI"},{id:3,label:"PI 1"},{id:4,label:"PI 2"}],i=e.locked?o({label:"LOCKED",variant:"warning",icon:"lock",size:"xs"}):"",a=t.map(s=>{const r=e.activeInputId===s.id;return l({label:`${s.id}: ${s.label}`,variant:r?"primary":"surface-high",active:r,disabled:e.locked,size:"sm",className:"flex-1 text-[11px]",dataAttributes:{dest:e.destinationId,input:s.id},onClickAttr:e.onSelectRouteAttr?e.onSelectRouteAttr(e.destinationId,s.id):void 0})}).join("");return`<div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2 ${e.className??""}">
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <h4 class="font-headline-sm text-[14px] font-bold text-on-surface truncate leading-tight">${e.destinationName}</h4>
        ${e.destinationSubtitle?`<span class="text-[9px] font-label-sm text-on-surface-variant block truncate">${e.destinationSubtitle}</span>`:""}
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        ${i}
        ${o({label:`Dest ${e.destinationId}`,variant:"outline",size:"xs"})}
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
      ${a}
    </div>
  </div>`}function M(e){const t=e.sources??[{id:"hama",label:"hama (HDMI Capture)"},{id:"rtmp1",label:"rtmp1 (Main Stream)"},{id:"rtmp2",label:"rtmp2 (Backup Stream)"},{id:"PiPGM1",label:"pipgm 1 (Slides)"},{id:"PiPGM2",label:"pipgm 2 (Graphics)"},{id:"compose1",label:"compose 1 (Keyed)"}],i=e.isFtb?o({label:"FTB",variant:"ftb",size:"xs"}):"",a=e.isCropped?o({label:"CROP",variant:"crop",size:"xs"}):"",n=e.routedToLabels&&e.routedToLabels.length>0?e.routedToLabels.map(u=>o({label:u,variant:"neutral",size:"xs"})).join(""):o({label:"Standby",variant:"neutral",size:"xs"}),s=t.map(u=>{const v=e.activeSourceId===u.id;return l({label:u.label,variant:v?"primary":"surface-high",active:v,size:"sm",className:"w-full justify-start text-[11px]",dataAttributes:{output:e.outputIndex,source:u.id},onClickAttr:e.onSelectSourceAttr?e.onSelectSourceAttr(e.outputIndex,u.id):void 0})}).join(""),r=l({label:"Crop / FX",icon:"crop",variant:"ghost",size:"xs",onClickAttr:e.onOpenCropAttr?e.onOpenCropAttr(e.outputIndex):void 0}),c=l({label:e.isFtb?"FTB ON":"FTB",variant:e.isFtb?"danger":"surface-high",size:"xs",onClickAttr:e.onToggleFtbAttr?e.onToggleFtbAttr(e.outputIndex):void 0});return`<div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between shadow-sm space-y-2.5 ${e.className??""}">
    <!-- Header -->
    <div class="flex items-start justify-between gap-1 pb-1.5 border-b border-outline-variant/20">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <h3 class="font-headline-sm text-[16px] font-bold text-on-surface leading-tight">Pi ${e.outputIndex}</h3>
          ${i}
          ${a}
        </div>
        <span class="font-label-sm text-[10px] text-on-surface-variant">hdmi ${e.outputIndex-1}</span>
      </div>
      <div class="flex flex-col items-end gap-1 flex-shrink-0">
        <span class="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold leading-none">Routed To</span>
        <div class="flex flex-wrap items-center justify-end gap-1">
          ${n}
        </div>
      </div>
    </div>

    <!-- Active Source & Controls -->
    <div class="flex items-center justify-between text-[11px] font-label-sm">
      <span class="text-on-surface-variant uppercase tracking-wider text-[10px]">Select Input:</span>
      <div class="flex items-center gap-1">
        ${r}
        ${c}
      </div>
    </div>

    <!-- Source List -->
    <div class="flex flex-col gap-1.5">
      ${s}
    </div>
  </div>`}function R(e){const t=e.isStreaming,i=o({label:"ON AIR / STREAMING",variant:"success",dot:"live",pulse:t,size:"xs"}),a=o({label:"Audio: Active",variant:"success",size:"xs"}),n=o({label:"Captions: Sync",variant:"success",size:"xs"}),s=l({label:e.isPlaying?"Stop Monitor":"Play Confidence Audio",icon:e.isPlaying?"pause":"play_arrow",variant:e.isPlaying?"primary":"surface-high",size:"sm",onClickAttr:e.onPlayToggleAttr}),c=`<div class="space-y-2.5">
    ${`<div class="grid grid-cols-2 gap-2">
    ${g({label:"Listeners",value:e.listenersCount,unit:"tuntia/hlö",size:"sm",color:e.listenersCount>0?"success":"neutral"})}
    ${g({label:"Mount",value:e.mountPoint,size:"sm"})}
  </div>`}

    <div class="flex items-center justify-between text-[11px] font-mono p-2 rounded-lg bg-surface-container border border-outline-variant/30">
      <span class="text-on-surface-variant truncate mr-2">URL: ${e.streamUrl}</span>
      <div class="flex items-center gap-1 flex-shrink-0">
        ${a}
        ${n}
      </div>
    </div>

    <div class="flex justify-end pt-1 border-t border-outline-variant/20">
      ${s}
    </div>
  </div>`;return m({title:e.streamName,subtitle:"Web Radio Relay • Low-latency HLS & MP3 Broadcast Stream",icon:"radio",badgeHtml:i,content:c,className:e.className})}function F(e){const t=e.keyMode??"luma",i=o({label:"PIC VISIBLE",variant:"success",dot:"online",size:"xs"}),a=o({label:`KEY: ${t.toUpperCase()}`,variant:t!=="off"?"primary":"neutral",size:"xs"}),n=l({label:"Blackout / Pic Mute",icon:"visibility_off",variant:"surface-high",size:"sm",onClickAttr:e.onPicMuteToggleAttr}),s=l({icon:"chevron_left",label:"Prev",variant:"surface-high",size:"sm",onClickAttr:e.onPrevSlideAttr}),r=l({icon:"chevron_right",label:"Next",variant:"surface-high",size:"sm",onClickAttr:e.onNextSlideAttr}),c=e.currentSlideNumber!==void 0?`<span class="font-mono text-[12px] font-bold text-on-surface">Slide ${e.currentSlideNumber} / ${e.totalSlides??"?"}</span>`:"",u=`<div class="space-y-3">
    ${e.slideUrl?`<img src="${e.slideUrl}" alt="Current slide" class="w-full h-32 object-contain bg-black/80 rounded-lg border border-outline-variant/30" />`:`<div class="w-full h-28 bg-surface-container rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface-variant text-[12px] italic">
        No active slide image loaded (Waiting for Canva / PPTX sync)
      </div>`}

    <div class="flex items-center justify-between pt-1">
      ${c}
      <div class="flex items-center gap-1.5">
        ${s}
        ${r}
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20">
      <span class="text-[10px] font-mono text-on-surface-variant">Pipeline: ${e.pipelineId??"PiPGM1"}</span>
      ${n}
    </div>
  </div>`;return m({title:"PiPGM Slide Feed & Presenter",subtitle:"Canva App Plugin & PiProgram Graphics Layer",icon:"slideshow",badgeHtml:`<div class="flex items-center gap-1">${a}${i}</div>`,content:u,className:e.className})}function O(e){const t=e.component;let i="offline",a="neutral";switch(t.status){case"ok":i="online",a="success";break;case"degraded":i="warning",a="warning";break;case"down":i="error",a="error";break;default:i="offline",a="neutral";break}const n=o({label:t.status.toUpperCase(),variant:a,dot:i,size:"xs"}),s=`<div class="space-y-2">
    <p class="text-[12px] font-body-sm text-on-surface-variant leading-snug">${t.description}</p>
    <div class="flex items-center justify-between text-[10px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/20">
      <span>Repo: <strong>${t.repo}</strong></span>
      ${t.port?`<span>Port: :${t.port}</span>`:""}
      ${t.latencyMs!==void 0?`<span>${t.latencyMs} ms</span>`:""}
    </div>
  </div>`;return m({title:t.name,subtitle:t.version?`v${t.version}`:void 0,badgeHtml:n,content:s,className:e.className})}const V=[{id:"cap-1",seq:104,speaker:"Liturgi",text:"Herra olkoon teidän kanssanne. Niin myös sinun henkesi kanssa.",timestamp:Date.now()-45e3,lagMs:110,language:"fi",flags:{youtube:"sent",relay:"sent"}},{id:"cap-2",seq:105,speaker:"Kanttori",text:"Ylistäkää Herraa, sillä Hän on hyvä ja Hänen armonsa pysyy iankaikkisesti.",timestamp:Date.now()-22e3,lagMs:140,language:"fi",flags:{youtube:"sent",relay:"sent"}},{id:"cap-3",seq:106,speaker:"Lukija",text:"Ensimmäinen lukukappale on profeetta Jesajan kirjasta luvusta viisikymmentäviisi.",timestamp:Date.now()-5e3,lagMs:95,language:"fi",flags:{youtube:"sent",relay:"dropped"}},{id:"cap-4",seq:107,speaker:"Liturgi",text:"Kuulkaa Herran sanaa...",timestamp:Date.now()-800,lagMs:130,language:"fi",flags:{youtube:"pending",relay:"pending"}}],_=[{name:"PiTube",repo:"pitube",description:"YouTube live broadcast lifecycle, Matrox encoder sync & closed captions sender.",port:3105,status:"ok",latencyMs:12,version:"0.2.1"},{name:"PiVoice",repo:"pivoice",description:"Multi-channel audio capture, Silero VAD, STT Auditor connection & Web Radio Relay.",port:3103,status:"ok",latencyMs:18,version:"0.3.0"},{name:"PiLight",repo:"pilight",description:"Tally-Ma wireless tally lights manager, mDNS discovery, 9-zone facets & director cues.",port:3200,status:"ok",latencyMs:8,version:"0.2.0"},{name:"PiSound",repo:"pisound",description:"BSS BLU-100 DSP Soundweb client, multi-mix (Sali/Striimi) faders, VU meters & presets.",port:3104,status:"ok",latencyMs:15,version:"0.2.4"},{name:"PiMatrix",repo:"pimatrix",description:"Raspberry Pi dual HDMI routing, crop/zoom keying, RTSP streaming & Atlona matrix.",port:3100,status:"ok",latencyMs:5,version:"0.1.3"},{name:"PiSwitch",repo:"piswitch",description:"Blackmagic ATEM Mini video switcher driver, transitions, media player & tally sync.",port:3102,status:"ok",latencyMs:11,version:"0.1.8"},{name:"PiProgram",repo:"piprogram",description:"Graphics/slides presentation renderer, PPTX/Canva pipeline snapshot & frame router.",port:3101,status:"ok",latencyMs:14,version:"0.2.0"},{name:"PiCanva",repo:"picanva",description:"Canva App presenter extension for slide progression and projector picMute blackout.",port:3106,status:"ok",latencyMs:22,version:"0.1.2"},{name:"PiGateway",repo:"pigateway",description:"Central event hub, SSE transcript replay ring, unified API router & state supervisor.",port:8080,status:"ok",latencyMs:4,version:"0.4.0"}];function f(e,t,i){return`<div class="pb-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div>
      <div class="flex items-center gap-2">
        <h2 class="font-headline-md text-[20px] font-bold text-on-surface leading-tight">${e}</h2>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase bg-primary/10 text-primary border border-primary/20">${t}</span>
      </div>
      <p class="text-[12px] font-body-sm text-on-surface-variant mt-0.5">${i}</p>
    </div>
  </div>`}function U(){const e=`
    <section id="group-atoms" class="catalog-group space-y-4">
      ${f("Atoms Gallery","Design System Core","Basic, atomic UI primitives: buttons, badges, status dots, icons, cards, sliders, meters, and inputs.")}

      <!-- Row 1: Buttons & Badges -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${m({title:"Buttons (Atom: Button)",subtitle:"Standardized button variants, states and sizes",icon:"smart_button",content:`
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                ${l({label:"Primary",variant:"primary",size:"sm"})}
                ${l({label:"Secondary",variant:"secondary",size:"sm"})}
                ${l({label:"Danger",variant:"danger",size:"sm"})}
                ${l({label:"Surface High",variant:"surface-high",size:"sm"})}
                ${l({label:"Ghost",variant:"ghost",size:"sm"})}
              </div>
              <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
                ${l({label:"With Icon",icon:"play_arrow",variant:"primary",size:"sm"})}
                ${l({label:"Disabled",variant:"primary",size:"sm",disabled:!0})}
                ${l({label:"Active Toggle",variant:"primary",size:"sm",active:!0})}
                ${l({icon:"tune",variant:"surface-high",size:"sm",title:"Icon only"})}
              </div>
              <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
                ${l({label:"PGM (Cut)",variant:"atem-pgm",size:"sm"})}
                ${l({label:"PVW (Auto)",variant:"atem-pvw",size:"sm"})}
                ${l({label:"Tie (Amber)",variant:"atem-tie",size:"sm"})}
              </div>
            </div>
          `})}

        ${m({title:"Badges & Pills (Atom: Badge & StatusDot)",subtitle:"Visual indicators, facet flags, and delivery status dots",icon:"label",content:`
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-1.5">
                ${o({label:"LIVE",variant:"error",dot:"live",pulse:!0})}
                ${o({label:"READY",variant:"success",dot:"online"})}
                ${o({label:"TESTING",variant:"warning",dot:"warning",pulse:!0})}
                ${o({label:"STANDBY",variant:"neutral",dot:"standby"})}
                ${o({label:"FTB",variant:"ftb"})}
                ${o({label:"CROP",variant:"crop"})}
              </div>
              <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-outline-variant/20">
                ${o({label:"Sent to YT",variant:"success",icon:"check"})}
                ${o({label:"Dropped",variant:"error",icon:"error"})}
                ${o({label:"In Flight",variant:"warning",pulse:!0})}
                ${o({label:"fi-FI",variant:"outline"})}
                ${o({label:"1080p60",variant:"accent"})}
              </div>
              <div class="flex items-center gap-3 pt-1 border-t border-outline-variant/20">
                <span class="text-[11px] font-label-sm text-on-surface-variant">Dots:</span>
                ${p({status:"online",title:"Online"})}
                ${p({status:"live",title:"Live",pulse:!0})}
                ${p({status:"warning",title:"Warning"})}
                ${p({status:"error",title:"Error"})}
                ${p({status:"busy",title:"Busy",pulse:!0})}
                ${p({status:"offline",title:"Offline"})}
              </div>
            </div>
          `})}
      </div>

      <!-- Row 2: Sliders, Meters, Toggle Switches -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${m({title:"Sliders (Atom: Slider)",subtitle:"Fader controls & PTZ speed",icon:"linear_scale",content:`
            <div class="space-y-2.5">
              ${$({id:"demo-fader",min:0,max:100,value:75,label:"Channel Gain",unit:"%"})}
              ${$({id:"demo-ptz-speed",min:1,max:24,value:12,label:"PTZ Speed",unit:""})}
            </div>
          `})}

        ${m({title:"Audio Meters (Atom: Meter)",subtitle:"VU and peak level bars",icon:"equalizer",content:`
            <div class="space-y-3">
              ${A({value:-14,min:-60,max:0,label:"Speech Mic Level"})}
              ${A({value:-6,min:-60,max:0,label:"Master Output (Near Peak)"})}
            </div>
          `})}

        ${m({title:"Toggle Switch (Atom)",subtitle:"Segmented state selectors",icon:"toggle_on",content:`
            <div class="space-y-2.5">
              <span class="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold block">Pipeline Mode:</span>
              ${C({options:[{value:"auto",label:"Auto"},{value:"on",label:"On"},{value:"off",label:"Off"}],selectedValue:"auto"})}
              <span class="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold block pt-1">Audio Preset:</span>
              ${C({options:[{value:"messu",label:"Messu"},{value:"bandi",label:"Bändi"},{value:"all",label:"Kaikki"}],selectedValue:"messu"})}
            </div>
          `})}
      </div>
    </section>
  `,t=`
    <section id="group-pitube" class="catalog-group space-y-4">
      ${f("pitube Monitoring & Control","d:\\pitube","YouTube live stream lifecycle, Matrox Monarch HDX hardware encoder integration & live caption delivery stats.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${P({state:"live",health:"good",broadcastTitle:"Sunnuntain Jumalanpalvelus - Riihimäen Keskuskirkko",privacy:"public",embedUrl:"https://www.youtube.com/watch?v=mockLiveId",captionsSent:412,captionsDropped:2,gatewayConnected:!0})}

        <div class="space-y-4">
          ${H({name:"Matrox Monarch HDX (Räkkikaappi)",encoder1:{mode:"RTMP Stream (YouTube)",state:"streaming",bitrateKbps:6500},encoder2:{mode:"MP4 Record (USB / NAS)",state:"recording",bitrateKbps:12e3}})}

          ${P({state:"ready",health:"noData",broadcastTitle:"Keskiviikon Iltamusiikki (Scheduled)",privacy:"unlisted",captionsSent:0,captionsDropped:0,gatewayConnected:!0})}
        </div>
      </div>
    </section>
  `,i=`
    <section id="group-pivoice" class="catalog-group space-y-4">
      ${f("pivoice Speech & Audio Pipeline","d:\\pivoice","Speech-to-Text (STT Auditor), Silero VAD voice activity detection, live transcript streaming & delivery flags.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${B({captions:V,isVoiceActive:!0,processedCount:107,droppedCount:1,lagMs:125,language:"fi"})}

        <div class="space-y-4">
          ${m({title:"Auditor STT & VAD Monitor",subtitle:"Voice Activity Detection & STT Engine Health",icon:"record_voice_over",badgeHtml:o({label:"VAD ACTIVE",variant:"success",dot:"live",pulse:!0}),content:`
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-2">
                  ${g({label:"Speech Engine",value:"Auditor",size:"sm"})}
                  ${g({label:"Audio Model",value:"Whisper-FI",size:"sm"})}
                  ${g({label:"VAD Window",value:"300ms",size:"sm"})}
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
            `})}

          ${R({streamName:"Riihimäen Keskuskirkko - Nettiradio",mountPoint:"/live.mp3",streamUrl:"https://nettiradio.keskuskirkko.fi/live.mp3",isStreaming:!0,listenersCount:18})}
        </div>
      </div>
    </section>
  `,a=`
    <section id="group-pilight" class="catalog-group space-y-4">
      ${f("pilight Tally & Camera Cueing","d:\\pilight","Tally-Ma wireless tally devices, 9-zone segmented LED matrix with facet tracking & director camera operator cues.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-4">
          ${z({name:"Tally 01 (Kamera 1 / Pääkamera)",host:"tally01.local",fallbackIp:"192.168.1.70",mode:"pgm",activeFacet:"atem-input (Input 1: Program RED)",connected:!0,zones:[{index:0,color:[255,0,0]},{index:1,color:[255,0,0]},{index:2,color:[255,0,0]},{index:3,color:[255,0,0]},{index:4,color:[255,0,0]},{index:5,color:[255,0,0]},{index:6,color:[255,0,0]},{index:7,color:[255,0,0]},{index:8,color:[255,0,0]}]})}

          ${z({name:"Tally 02 (Kamera 2 / Lähikuva)",host:"tally02.local",fallbackIp:"192.168.1.89",mode:"prv",activeFacet:"atem-input (Input 2: Preview GREEN)",connected:!0,zones:[{index:0,color:[0,255,0]},{index:1,color:[0,255,0]},{index:2,color:[0,255,0]},{index:3,color:[0,255,0]},{index:4,color:[0,255,0]},{index:5,color:[0,255,0]},{index:6,color:[0,255,0]},{index:7,color:[0,255,0]},{index:8,color:[0,255,0]}]})}
        </div>

        <div class="space-y-4">
          ${E({targetLightId:"tally01",targetLightName:"Kamera 1 (Pääkamera)"})}

          ${m({title:"Tally Facets Reference (pilight)",subtitle:"System facets that drive the 9-zone segmented tally lights",icon:"hub",content:`
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
            `})}
        </div>
      </div>
    </section>
  `,n=`
    <section id="group-pisound" class="catalog-group space-y-4">
      ${f("pisound Sanctuary Audio Mixer","d:\\pisound","BSS BLU-100 DSP Soundweb integration, Sali & Striimi channel faders, peak VU meters & mute toggles.")}

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${k({id:"kapula1",name:"Kapula 1",role:"Liturgi / Pappi",group:"handheld",volumePercent:82,isMuted:!1,peakDbfs:-16,signalPresent:!0})}

        ${k({id:"madonna1",name:"Madonna 1",role:"Pappi / Liturgi",group:"madonna",volumePercent:78,isMuted:!1,peakDbfs:-22,signalPresent:!0})}

        ${k({id:"wired4",name:"Lukupulpetti",role:"Tekstinluku",group:"wired",volumePercent:65,isMuted:!0,peakDbfs:-60,signalPresent:!1})}
      </div>
    </section>
  `,s=`
    <section id="group-pimatrix" class="catalog-group space-y-4">
      ${f("pimatrix HDMI Outputs & Matrix Router","d:\\pimatrix","Pi 1 & Pi 2 HDMI hardware outputs, FTB/Crop boundaries & Atlona 44M NetLinx matrix destinations.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${M({outputIndex:1,activeSourceId:"hama",isCropped:!0,routedToLabels:["Vasen Tykki","Striimi"],sources:[{id:"hama",label:"hama (HDMI Capture)"},{id:"rtmp1",label:"rtmp1 (Main Stream)"},{id:"PiPGM1",label:"pipgm 1 (Slides)"}]})}

        ${M({outputIndex:2,activeSourceId:"PiPGM1",isFtb:!0,routedToLabels:["Oikea Tykki"],sources:[{id:"hama",label:"hama (HDMI Capture)"},{id:"PiPGM1",label:"pipgm 1 (Slides)"},{id:"compose1",label:"compose 1 (Keyed)"}]})}
      </div>

      <div class="space-y-3 pt-2">
        <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Atlona AT-UHD-PRO3-44M Video Matrix Crosspoints</h3>
        <div class="grid grid-cols-1 gap-2.5">
          ${w({destinationId:1,destinationName:"Videotykki 1 (Vasen / Vertical Left)",destinationSubtitle:"Atlona Out 1 • Epson EB-L1050U • Etuseinä",activeInputId:1,locked:!1})}

          ${w({destinationId:2,destinationName:"Videotykki 2 (Oikea / Horizontal Right)",destinationSubtitle:"Atlona Out 2 • Epson EB-L1050U • Sivuseinä",activeInputId:3,locked:!1})}

          ${w({destinationId:5,destinationName:"Videomikseri (ATEM Mini Aux In)",destinationSubtitle:"Atlona Out 5 • HDMI peilaus mikserille",activeInputId:2,locked:!1})}
        </div>
      </div>
    </section>
  `,r=`
    <section id="group-piswitch" class="catalog-group space-y-4">
      ${f("piswitch ATEM Video Mixer","d:\\piswitch","Blackmagic ATEM Mini video switcher driver, preview/program bus, transitions and downstream keyers.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${j({connected:!0,programInput:1,previewInput:2,inputs:[{id:1,label:"CAM 1 (Pää)"},{id:2,label:"CAM 2 (Lähikuva)"},{id:3,label:"PIPGM (Grafiikka)"}],isAutoActive:!1,isFtbActive:!1})}

        ${m({title:"PTZ Camera Control Pad",subtitle:"Camera 1 & 2 Pan-Tilt-Zoom with Speed Fader",icon:"videocam",content:D({cameraId:"cam1",speed:12})})}
      </div>
    </section>
  `,c=`
    <section id="group-piprogram" class="catalog-group space-y-4">
      ${f("piprogram & picanva Slide Graphics","d:\\piprogram & d:\\picanva","PiPGM slide renderer, Canva presentation synchronizer & projector picMute control.")}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${F({pipelineId:"PiPGM1",currentSlideNumber:4,totalSlides:16,keyMode:"luma"})}

        ${m({title:"Canva Integration Status (picanva)",subtitle:"Slide Deck Synced with Altar / Lectern Screens",icon:"auto_awesome",badgeHtml:o({label:"SYNCED",variant:"success",dot:"online",size:"xs"}),content:`
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
          `})}
      </div>
    </section>
  `,d=`
    <section id="group-pigateway" class="catalog-group space-y-4">
      ${f("pigateway Ecosystem Grid","d:\\pigateway","Central supervisor, SSE transcript replay ring & microservice daemon heartbeats.")}

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        ${_.map(u=>O({component:u})).join("")}
      </div>
    </section>
  `;return`
    <div class="space-y-12">
      ${e}
      ${t}
      ${i}
      ${a}
      ${n}
      ${s}
      ${r}
      ${c}
      ${d}
    </div>
  `}function G(){const e=document.querySelectorAll(".catalog-filter-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(n=>{n.classList.remove("bg-primary","text-on-primary","shadow-sm"),n.classList.add("bg-surface-container-high","text-on-surface")}),t.classList.add("bg-primary","text-on-primary","shadow-sm"),t.classList.remove("bg-surface-container-high","text-on-surface");const i=t.getAttribute("data-group");document.querySelectorAll(".catalog-group").forEach(n=>{i==="all"||n.id===`group-${i}`?n.style.display="block":n.style.display="none"})})})}function I(){const e=document.getElementById("catalog-root");e&&((!e.innerHTML.trim()||e.children.length===0)&&(e.innerHTML=U()),G())}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I();
