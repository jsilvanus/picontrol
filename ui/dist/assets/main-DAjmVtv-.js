import"./modulepreload-polyfill-B5Qt9EMX.js";const Ja=1e3,Za=[1,2,3];let T=null,Ee=1,at=null,It=()=>{};function cn(e){return document.getElementById(e)}function we(e,t,n){const a=cn(e);a&&(a.className=[t,...n].filter(Boolean).join(" "))}function Mt(){var o;const e=(T==null?void 0:T.connected)===!0,t=cn("atem-status");t&&(t.textContent=T?e?`PGM ${T.programInput??"-"} • PVW ${T.previewInput??"-"}`:"Offline":"Connecting...");for(const s of Za){const i=[];e&&(T==null?void 0:T.programInput)===s?i.push("atem-pgm"):e&&(T==null?void 0:T.previewInput)===s&&i.push("atem-pvw"),we(`atem-in-${s}`,"atem-btn",i)}const n=T==null?void 0:T.fadeToBlack;we("atem-ftb","atem-btn atem-btn-text",n!=null&&n.fullyBlack||n!=null&&n.inTransition?["atem-pgm",n.inTransition?"atem-pulse":""]:[]),we("atem-auto","atem-btn atem-btn-text",T!=null&&T.transition.inTransition?["atem-pgm","atem-pulse"]:[]),we("atem-cut","atem-btn atem-btn-text",[]);const a=T==null?void 0:T.downstreamKeyers.find(s=>s.dsk===Ee);for(const s of[1,2]){const i=T==null?void 0:T.downstreamKeyers.find(r=>r.dsk===s);we(`atem-dsk-${s}`,"atem-btn atem-dsk",[s===Ee?"atem-selected":"",i!=null&&i.onAir?"atem-pgm":""])}we("atem-tie","atem-btn atem-btn-text",a!=null&&a.tie?["atem-tie"]:[]),we("atem-onair","atem-btn atem-btn-text",a!=null&&a.onAir?["atem-pgm"]:[]);for(const s of["atem-in-1","atem-in-2","atem-in-3","atem-ftb","atem-cut","atem-auto","atem-dsk-1","atem-dsk-2","atem-tie","atem-onair"])(o=cn(s))==null||o.toggleAttribute("disabled",!e)}async function $e(e,t,n){try{const a={method:e};e!=="GET"&&(a.headers={"Content-Type":"application/json"},a.body=JSON.stringify(n??{}));const o=await fetch(t,a);return o.status===503?(T={connected:!1,programInput:null,previewInput:null,transition:{inTransition:!1,remainingFrames:0},fadeToBlack:{fullyBlack:!1,inTransition:!1,remainingFrames:0},downstreamKeyers:[]},Mt(),e!=="GET"&&It("ATEM is not connected"),null):o.ok?(T=await o.json(),Mt(),T):(e!=="GET"&&It(`ATEM command failed (${o.status})`),null)}catch{return e!=="GET"&&It("ATEM request failed"),null}}function Vn(){return $e("GET","/api/v1/atem")}function Qa(e){if(!e){at&&clearInterval(at),at=null;return}at||(Vn(),at=setInterval(()=>{document.hidden||Vn()},Ja))}function eo(e){It=e,window.atemSelectInput=async t=>{await $e("PUT","/api/v1/atem/preview",{input:t})},window.atemCut=async()=>{await $e("POST","/api/v1/atem/cut")},window.atemAuto=async()=>{await $e("POST","/api/v1/atem/auto")},window.atemFtb=async()=>{await $e("POST","/api/v1/atem/ftb")},window.atemSelectDsk=t=>{Ee=t,Mt()},window.atemToggleTie=async()=>{const t=T==null?void 0:T.downstreamKeyers.find(n=>n.dsk===Ee);await $e("PUT",`/api/v1/atem/dsk/${Ee}/tie`,{tie:!((t==null?void 0:t.tie)??!1)})},window.atemToggleOnAir=async()=>{const t=T==null?void 0:T.downstreamKeyers.find(n=>n.dsk===Ee);await $e("PUT",`/api/v1/atem/dsk/${Ee}/on-air`,{onAir:!((t==null?void 0:t.onAir)??!1)})},Mt()}function oa(e){if(!e)return;let t=!1;e.addEventListener("pointerdown",n=>{t=n.target===e}),e.addEventListener("click",n=>{const a=n.target===e&&t;t=!1,a&&e.close()})}const dt="/api/v1/quick-options",Hn=40;let De=()=>{},sa=async()=>{},pt=[],dn=!1,pe=null,Pt=null;function Z(e){return document.getElementById(e)}function Et(e){return e.replace(/[&<>"']/g,t=>`&#${t.charCodeAt(0)};`)}async function Cn(e){var t;try{return((t=(await e.json()).error)==null?void 0:t.message)??`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}async function In(){try{const e=await fetch(dt);if(!e.ok)throw new Error(String(e.status));pt=(await e.json()).items,dn=!1}catch{dn=!0}ia()}function ia(){const e=Z("quick-grid");if(e){if(dn){e.innerHTML='<span class="col-span-3 font-label-sm text-[10px] text-on-surface-variant uppercase">Quick options unavailable</span>';return}if(pt.length===0){e.innerHTML='<span class="col-span-3 font-label-sm text-[10px] text-on-surface-variant uppercase">None saved yet. Set up the outputs, then press Save as quick.</span>';return}e.innerHTML=pt.map(t=>{const a=t.id===Pt?"bg-primary text-on-primary shadow-sm":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface";return`<button type="button" data-quick-id="${Et(t.id)}" onclick="quickApply('${Et(t.id)}')" oncontextmenu="event.preventDefault(); quickEdit('${Et(t.id)}')" title="Tap to apply • Hold to rename or delete" class="h-12 rounded-lg ${a} p-space-xs flex items-center justify-center active:scale-95 transition-all">
        <span class="font-body-md text-xs font-semibold truncate w-full text-center">${Et(t.name)}</span>
      </button>`}).join("")}}function Fn(e){var a,o;pe=e;const t=Z("quick-modal"),n=Z("quick-name-input");!t||!n||(n.value=(e==null?void 0:e.name)??"",Z("quick-modal-title").textContent=e?"Edit quick option":"Save as quick",(a=Z("quick-delete-btn"))==null||a.classList.toggle("hidden",!e),(o=Z("quick-error"))==null||o.classList.add("hidden"),t.open||t.showModal(),n.focus())}function je(e){const t=Z("quick-error");t&&(t.textContent=e,t.classList.remove("hidden"))}async function to(){var n;const e=Z("quick-name-input"),t=(e==null?void 0:e.value.trim())??"";if(!t)return je("Enter a name");if(t.length>Hn)return je(`At most ${Hn} characters`);try{const a=await fetch(pe?`${dt}/${encodeURIComponent(pe.id)}`:dt,{method:pe?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t})});if(!a.ok)return je(await Cn(a));(n=Z("quick-modal"))==null||n.close(),De(pe?`Renamed to ${t}`:`Saved quick option ${t}`),await In()}catch{je("Request failed")}}async function no(){var e;if(pe)try{const t=await fetch(`${dt}/${encodeURIComponent(pe.id)}`,{method:"DELETE"});if(!t.ok)return je(await Cn(t));(e=Z("quick-modal"))==null||e.close(),De(`Deleted ${pe.name}`),Pt===pe.id&&(Pt=null),await In()}catch{je("Request failed")}}async function ao(e){const t=pt.find(n=>n.id===e);try{const n=await fetch(`${dt}/${encodeURIComponent(e)}/apply`,{method:"POST"});if(!n.ok){De(`Quick option: ${await Cn(n)}`);return}Pt=e,ia(),De(`Applied ${(t==null?void 0:t.name)??"quick option"}`),await sa()}catch{De("Quick option request failed")}}function oo(e,t){De=e,sa=t,window.quickSaveOpen=()=>Fn(null),window.quickEdit=n=>Fn(pt.find(a=>a.id===n)??null),window.quickApply=n=>ao(n),window.quickSubmit=()=>to(),window.quickDelete=()=>no(),oa(Z("quick-modal")),In()}const ra=["hama","rtmp1","rtmp2","cam1","cam2","cam3","PiPGM1","PiPGM2","PiPGM3"],Gn=.05,la=.6,ca=1,so=.05,At=[-1,-.5,0,.5,1],da="picontrol.compositeSnap",io={"10:16":10/16,"9:16":9/16};let Lt=()=>{},Mn="compose1",u=null,Ce=null,be=null,_e=0,Me=null,Pe=ro();const Ve="/api/v1/composites";function ro(){try{return localStorage.getItem(da)!=="off"}catch{return!0}}function Wn(e){const t=ut(e,-1,1);return Pe?At.reduce((n,a)=>Math.abs(a-t)<Math.abs(n-t)?a:n,At[0]):Math.round(t*100)/100}function Yt(e,t){if(!Pe)return ut(Math.round((e+t*so)*100)/100,-1,1);const n=1e-6;return(t>0?At.find(o=>o>e+n):[...At].reverse().find(o=>o<e-n))??ut(e,-1,1)}function pa(){const e=v("comp-snap-btn"),t=v("comp-snap-label");t&&(t.textContent=Pe?"Snap on":"Snap off"),e&&(e.className=`px-2 h-6 rounded-md font-label-sm text-[9px] font-bold uppercase flex items-center gap-1 active:scale-95 ${Pe?"bg-primary text-on-primary":"bg-surface-container-high text-on-surface-variant"}`)}function v(e){return document.getElementById(e)}async function pn(e){var t;try{return((t=(await e.json()).error)==null?void 0:t.message)??`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}async function Pn(e,t,n){try{const a={method:e};e!=="GET"&&(a.headers={"Content-Type":"application/json"},a.body=JSON.stringify(n??{}));const o=await fetch(t,a);return o.ok?await o.json():(Lt(`Composite: ${await pn(o)}`),null)}catch{return Lt("Composite request failed"),null}}function ut(e,t,n){return Math.max(t,Math.min(n,e))}function ua(e){const t=ut(e.slideScale,la,ca),n=Math.min(1,t*io[e.slideAspect]*(e.height/e.width)),a=1-t;return{x:(1-n)/2*(1+(e.offsetX??(e.side==="left"?-1:1))),y:a/2*(1+(e.offsetY??0)),w:n,h:t}}function ke(e){const t=v("cs-error");t&&(t.textContent=e??"",t.classList.toggle("hidden",e===null))}function Je(){for(const i of["compose1","compose2"]){const r=v(`comp-target-${i}`);if(!r)continue;const l=i===Mn;r.className=l?"flex-1 px-1.5 py-1 rounded font-label-sm text-[10px] uppercase font-bold bg-surface text-primary shadow-sm":"flex-1 px-1.5 py-1 rounded font-label-sm text-[10px] uppercase text-on-surface-variant"}const e=v("comp-status"),t=v("comp-readout"),n=v("comp-run-btn"),a=v("comp-frame"),o=v("comp-slide"),s=v("comp-slide-tag");if(!u){e&&(e.textContent="Loading...");return}if(fa(),pa(),e){const i=[u.enabled?u.state:"stopped"];u.hasSlide||i.push("no slide yet"),u.lastError&&i.push(u.lastError),e.textContent=i.join(" • ")}if(t&&(t.textContent=`${u.slideAspect} • ${Math.round(u.slideScale*100)}% • X ${Math.round((u.offsetX??0)*100)}% • Y ${Math.round((u.offsetY??0)*100)}%`),n&&(n.textContent=u.enabled?"Stop":"Start",n.className=u.enabled?"px-3 h-8 rounded-lg bg-error text-on-error font-label-sm text-[10px] font-bold uppercase active:scale-95":"px-3 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-[10px] font-bold uppercase active:scale-95"),a&&(a.style.aspectRatio=`${u.width} / ${u.height}`,u.kind==="atem-media"?a.style.background="repeating-conic-gradient(#3b3631 0% 25%, #4a443e 0% 50%) 50% / 16px 16px":(a.style.background=u.keyMode==="luma"?"#000000":u.keyColor,a.style.backgroundSize="")),o){const i=ua(u);o.style.left=`${i.x*100}%`,o.style.top=`${i.y*100}%`,o.style.width=`${i.w*100}%`,o.style.height=`${i.h*100}%`}s&&(s.textContent=u.slideAspect);for(const[i,r]of[["comp-preset-left",(u.offsetX??-1)===-1],["comp-preset-right",(u.offsetX??-1)===1],["comp-preset-10-16",u.slideAspect==="10:16"],["comp-preset-9-16",u.slideAspect==="9:16"]]){const l=v(i);l==null||l.classList.toggle("ring-2",r),l==null||l.classList.toggle("ring-primary",r)}}function qt(e){return e.slideSource==="source"?`src:${e.sourceId}`:e.slideSource==="piprogram"?`pip:${e.pipelineId}`:"upload"}function lo(e){return e==="upload"?"an uploaded slide":e.startsWith("pip:")?`piprogram slides (${e.slice(4)})`:`live ${e.slice(4)}`}function fa(){const e=v("comp-input-select");if(e&&u){e.value=qt(u);for(const r of Array.from(e.options))r.disabled=u.kind==="atem-media"&&r.value.startsWith("src:")}const t=v("comp-move-overlay");if(!t)return;const n=Me!==null&&ra.includes(Me),a=u!==null&&n&&qt(u)!==`src:${Me}`;t.classList.toggle("hidden",!a),t.classList.toggle("flex",a);const o=v("comp-move-text"),s=v("comp-move-btn");if(!a||!u)return;const i=u.kind==="hdmi-key";o&&(o.textContent=i?`Composite input is ${lo(qt(u))}`:"The ATEM media composite cannot show live video"),s&&s.classList.toggle("hidden",!i)}function ma(e){Me=e,fa()}function zt(e){const t=v("comp-preview-img"),n=v("comp-preview-empty");t==null||t.classList.add("hidden"),n&&(n.textContent=e,n.classList.remove("hidden"))}const co=3e3;async function An(){var n;if(!u)return;const e=_e,t=u.slideSource==="source";if(t&&(be&&clearTimeout(be),be=setTimeout(()=>{e===_e&&An()},co)),!t&&!u.hasSlide){zt("No preview yet. Send a slide first.");return}try{const a=await fetch(`${Ve}/${u.id}/preview.png`);if(!a.ok){zt(t?"No picture from this source right now.":`Preview unavailable (${a.status})`);return}const o=await a.blob();if(e!==_e)return;Ce&&URL.revokeObjectURL(Ce),Ce=URL.createObjectURL(o);const s=v("comp-preview-img");s&&(s.src=Ce,s.classList.remove("hidden")),(n=v("comp-preview-empty"))==null||n.classList.add("hidden")}catch{zt("Preview unavailable")}}function ba(){be&&clearTimeout(be),be=setTimeout(()=>void An(),500)}async function un(){const e=++_e;u=null,Je();const t=await Pn("GET",`${Ve}/${Mn}`);e===_e&&(u=t,Je(),An())}async function Y(e){if(!u)return;const t=await Pn("PUT",`${Ve}/${u.id}`,e);t&&(u=t,Je(),ba())}function po(){un()}function uo(){_e++,be&&clearTimeout(be),Ce&&URL.revokeObjectURL(Ce),Ce=null}function fo(){const e=v("comp-frame");if(!e)return;let t=!1,n=0,a=0,o=0,s=0;e.addEventListener("pointerdown",l=>{if(u){t=!0,n=l.clientX,a=l.clientY,o=u.offsetX??(u.side==="left"?-1:1),s=u.offsetY??0;try{e.setPointerCapture(l.pointerId)}catch{}}});const i=l=>{if(!t||!u)return;const c=e.getBoundingClientRect();if(!c.width||!c.height)return;const p=ua(u),d=1-p.w,f=1-p.h;d>0&&(u.offsetX=Wn(o+(l.clientX-n)/(c.width*(d/2)))),f>0&&(u.offsetY=Wn(s+(l.clientY-a)/(c.height*(f/2)))),u.side=(u.offsetX??-1)<0?"left":"right",Je()};e.addEventListener("pointermove",i);const r=()=>{!t||!u||(t=!1,Y({offsetX:u.offsetX,offsetY:u.offsetY??0}))};e.addEventListener("pointerup",r),e.addEventListener("pointercancel",r)}function mo(e){window.compSelectInput=async t=>{t==="upload"?await Y({slideSource:"upload"}):t.startsWith("pip:")?await Y({slideSource:"piprogram",pipelineId:t.slice(4)}):await Y({slideSource:"source",sourceId:t.slice(4)})},window.compMoveHere=async()=>{Me&&ra.includes(Me)&&await window.compSelectInput(`src:${Me}`)},Lt=e,fo(),window.setCropDialogTab=t=>{var l,c;const n=t==="composite";(l=v("crop-pane-crop"))==null||l.classList.toggle("hidden",n),(c=v("crop-pane-composite"))==null||c.classList.toggle("hidden",!n);const a="flex-1 px-2 py-1 rounded font-label-sm text-[11px] uppercase font-bold bg-surface text-primary shadow-sm",o="flex-1 px-2 py-1 rounded font-label-sm text-[11px] uppercase text-on-surface-variant",s=v("crop-tab-crop"),i=v("crop-tab-composite");s&&(s.className=n?o:a),i&&(i.className=n?a:o);const r=v("crop-dialog-subtitle");r&&(r.textContent=n?"Drag the slide • Presets left and right":"Drag lower box • Upper view shows unobstructed crop"),n?po():uo()},window.compSelectTarget=async t=>{Mn=t,await un()},window.compToggleRun=async()=>{if(!u)return;const t=await Pn("POST",`${Ve}/${u.id}/${u.enabled?"stop":"start"}`);t&&(u=t,Je())},window.compPreset=async t=>{t==="left"||t==="right"?await Y({side:t}):t==="reset"?await Y({offsetX:-1,slideAspect:"10:16",slideScale:1,offsetY:0}):await Y({slideAspect:t})},window.compMove=async t=>{if(!u)return;const n=u.offsetX??(u.side==="left"?-1:1),a=u.offsetY??0;t==="center"?await Y({offsetX:0,offsetY:0}):t==="left"?await Y({offsetX:Yt(n,-1)}):t==="right"?await Y({offsetX:Yt(n,1)}):await Y({offsetY:Yt(a,t==="up"?-1:1)})},window.compToggleSnap=()=>{Pe=!Pe;try{localStorage.setItem(da,Pe?"on":"off")}catch{}pa()},window.openCompositeSettings=()=>{var s,i;if(!u)return;const t=(r,l)=>{const c=v(r);c&&(c.value=l)};t("cs-width",String(u.width)),t("cs-height",String(u.height)),t("cs-source",u.slideSource),t("cs-pipeline",u.pipelineId),t("cs-live-source",u.sourceId),t("cs-key-color",u.keyColor),t("cs-key-mode",u.keyMode),t("cs-media-slot",String(u.atem.mediaSlot)),t("cs-media-player",String(u.atem.mediaPlayer)),t("cs-dsk",String(u.atem.dskIndex));const n=v("cs-auto-on-air");n&&(n.checked=u.atem.autoOnAir),(s=v("cs-key-fields"))==null||s.classList.toggle("hidden",u.kind!=="hdmi-key"),(i=v("cs-atem-fields"))==null||i.classList.toggle("hidden",u.kind!=="atem-media");const a=v("comp-settings-sub");a&&(a.textContent=u.id),ke(null);const o=v("comp-settings-modal");o&&!o.open&&o.showModal()},window.closeCompositeSettings=()=>{const t=v("comp-settings-modal");t!=null&&t.open&&t.close()},window.compSaveSettings=async()=>{var a,o,s,i,r,l;if(!u)return;const t=c=>{var p;return Number((p=v(c))==null?void 0:p.value)},n={width:t("cs-width"),height:t("cs-height"),slideSource:((a=v("cs-source"))==null?void 0:a.value)??u.slideSource,pipelineId:((o=v("cs-pipeline"))==null?void 0:o.value)??u.pipelineId,sourceId:((s=v("cs-live-source"))==null?void 0:s.value)??u.sourceId};u.kind==="hdmi-key"?(n.keyColor=((i=v("cs-key-color"))==null?void 0:i.value)??u.keyColor,n.keyMode=((r=v("cs-key-mode"))==null?void 0:r.value)??u.keyMode):n.atem={mediaSlot:t("cs-media-slot"),mediaPlayer:t("cs-media-player"),dskIndex:t("cs-dsk"),autoOnAir:((l=v("cs-auto-on-air"))==null?void 0:l.checked)??!1};try{const c=await fetch(`${Ve}/${u.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!c.ok){ke(await pn(c));return}u=await c.json(),Je(),ba(),window.closeCompositeSettings()}catch{ke("Request failed")}},window.compSendSlide=async()=>{var n,a;const t=(a=(n=v("cs-slide-file"))==null?void 0:n.files)==null?void 0:a[0];if(!t){ke("Choose a PNG file first");return}try{const o=await fetch(`${Ve}/slide`,{method:"PUT",headers:{"Content-Type":"image/png"},body:t});if(!o.ok){ke(await pn(o));return}ke(null),Lt("Test slide sent"),await un()}catch{ke("Request failed")}},window.compResize=async t=>{if(!u)return;const n=ut(u.slideScale+(t==="in"?-Gn:Gn),la,ca);await Y({slideScale:Math.round(n*100)/100})}}const Xt={},bo=["on","off","auto"],xo=["on","off","auto","schedule"],xa={on:"On",off:"Off",auto:"Auto",schedule:"Schedule"},ga="picontrol.pivoiceToken",go=2500,va=yo();let xe=null,ot,ft=!1,lt="",fn=[],ne=null,mn="auto",ya="keskuskirkko-live",vo="/live.mp3",bn="https://nettiradio.keskuskirkko.fi/live.mp3";function yo(e=window.location.search){const t=new URLSearchParams(e).get("voice"),n=Xt==null?void 0:Xt.VITE_PIVOICE_URL;return(t??n??"/voice").replace(/\/+$/,"")}function ha(){try{return sessionStorage.getItem(ga)??""}catch{return""}}function ho(e){try{sessionStorage.setItem(ga,e)}catch{}}function te(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function ae(e,t,n){const a={Authorization:`Bearer ${ha()}`};n!==void 0&&(a["Content-Type"]="application/json");const o=await fetch(`${va}${t}`,{method:e,headers:a,body:n===void 0?void 0:JSON.stringify(n)});if(!o.ok)throw new Error(o.status===401?"Token rejected":`pivoice answered ${o.status}`);return await o.json()}async function Kn(){try{const e=await fetch("/api/v1/transcripts?limit=10");if(e.ok){const t=await e.json();Array.isArray(t.transcripts)&&(fn=t.transcripts)}}catch{}}async function Yn(){var e;try{const t=await fetch("/api/v1/radio-relay");if(t.ok){const n=await t.json();n&&(ne=n.state??null,n.streamName&&(ya=n.streamName),(e=n.state)!=null&&e.streamUrl&&(bn=n.state.streamUrl))}}catch{}}function St(e,t){return bo.map(n=>`<button type="button" data-action="mode" data-section="${e}" data-value="${n}" class="flex-1 px-2.5 py-1.5 rounded-md font-label-sm text-[11px] uppercase font-bold transition-all ${n===t?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-surface-container-highest hover:text-on-surface"}" ${ft?"disabled":""}>${xa[n]}</button>`).join("")}function wo(e){return xo.map(t=>`<button type="button" data-action="capture-mode" data-value="${t}" class="flex-1 px-2 py-1.5 rounded-md font-label-sm text-[10px] uppercase font-bold transition-all ${t===e?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-surface-container-highest hover:text-on-surface"}">${xa[t]}</button>`).join("")}function qn(e,t,n){var S,D,x,b,g,$,E,M;if(!xe)return;const a=((x=(D=(S=t==null?void 0:t.radio)==null?void 0:S.targets)==null?void 0:D[0])==null?void 0:x.mode)??"auto",o=((b=t==null?void 0:t.auditor)==null?void 0:b.mode)??(e==null?void 0:e.transcription.mode)??"auto",s=(($=(g=t==null?void 0:t.captions)==null?void 0:g.relay)==null?void 0:$.mode)??"auto",i=((M=(E=t==null?void 0:t.captions)==null?void 0:E.youtube)==null?void 0:M.mode)??"auto",r=(e==null?void 0:e.capture.running)??!0,l=(e==null?void 0:e.voice.open)??!1,c=(e==null?void 0:e.transcription.busy)??!1;e==null||e.transcription.configured;const p=(e==null?void 0:e.transcription.lagMs)??140;e==null||e.transcription.queued;const d=(e==null?void 0:e.transcription.processed)??284,f=(e==null?void 0:e.transcription.dropped)??0,h=(ne==null?void 0:ne.streaming)??(ne==null?void 0:ne.running)??!1,y=(ne==null?void 0:ne.listeners)??0,w=d>0&&!(e!=null&&e.transcription.lastError),I=fn.length>0?fn.map(R=>`
        <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[12px] font-body-sm flex items-start justify-between gap-2">
          <div class="min-w-0">
            ${R.speaker?`<span class="font-bold text-primary mr-1.5">[${te(R.speaker)}]</span>`:""}
            <span class="text-on-surface">${te(R.text)}</span>
          </div>
          <span class="text-[10px] font-mono text-on-surface-variant flex-shrink-0">${R.timestamp?new Date(R.timestamp).toLocaleTimeString("fi-FI"):""}</span>
        </div>
      `).join(""):'<div class="p-3 text-center text-[12px] text-on-surface-variant italic">Ei viimeaikaisia tekstitystapahtumia. Tekstitykset näkyvät tässä reaaliajassa puheen alkaessa.</div>';xe.innerHTML=`
    <div class="space-y-space-md">
      <!-- PIPELINE FLOW BREADCRUMB / HEADER -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Voice &amp; Audio Flow</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${r?"bg-green-600 text-white":"bg-surface-container-highest text-on-surface-variant"}">
                  <span class="w-1.5 h-1.5 rounded-full bg-current ${r?"animate-pulse":""}"></span>
                  <span>${r?"Pipeline Active":"Stopped"}</span>
                </span>
              </div>
              <span class="font-label-sm text-[10px] text-on-surface-variant">Reaaliaikainen äänenkäsittely-, puheentunnistus- ja nettiradioketju</span>
            </div>
          </div>

          <button type="button" id="voice-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä tila">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>

        <!-- Visual Step Pipeline Bar -->
        <div class="grid grid-cols-4 gap-1 pt-1 text-center font-label-sm text-[10px] font-bold">
          <div class="p-1.5 rounded-lg ${r?"bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30":"bg-surface-container text-on-surface-variant"}">
            1. Capture
          </div>
          <div class="p-1.5 rounded-lg ${c?"bg-primary/20 text-primary border border-primary/40":"bg-surface-container text-on-surface-variant"}">
            2. STT (Auditor)
          </div>
          <div class="p-1.5 rounded-lg ${w?"bg-primary/20 text-primary border border-primary/40":"bg-surface-container text-on-surface-variant"}">
            3. Captions
          </div>
          <div class="p-1.5 rounded-lg ${h?"bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30":"bg-surface-container text-on-surface-variant"}">
            4. Web Radio
          </div>
        </div>
      </div>

      ${n?`
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${te(n)}</span>
        </div>
      `:""}

      <!-- STEP 1: AUDIO CAPTURE CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">mic</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 1: Audio Capture</h3>
          </div>
          <!-- Live Sound Detected / Voice Activity Indicator -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${l?"bg-green-600 text-white animate-pulse":"bg-surface-container-highest text-on-surface-variant"}">
            <span class="w-2 h-2 rounded-full ${l?"bg-white":"bg-outline-variant"}"></span>
            <span>${l?"Sound coming in (VAD)":"No sound / Silent"}</span>
          </span>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Capture Mode:</span>
            <span class="font-bold text-on-surface uppercase">${mn}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${wo(mn)}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] font-body-sm">
          <span class="text-on-surface-variant">Tila: <strong class="text-on-surface">${r?"Running":"Idle"}</strong></span>
          <button type="button" data-action="${r?"capture-stop":"capture-start"}" ${ft?"disabled":""}
            class="px-3 py-1 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${r?"bg-error-container text-on-error-container hover:bg-error hover:text-white":"bg-primary text-on-primary hover:bg-primary/90"}">
            ${r?"Stop Capture":"Start Capture"}
          </button>
        </div>
      </div>

      <!-- STEP 2: SPEECH-TO-TEXT (STT AUDITOR) STATUS & LIVE TRANSCRIPT -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">record_voice_over</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 2: Speech-to-Text (Auditor STT)</h3>
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${c?"bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30":"bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30"}">
            ${c?"Transcribing…":"STT Idle / Ready"}
          </span>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">STT Mode (auto = vain puhetta sisältävät lohkot):</span>
            <span class="font-bold text-on-surface uppercase">${o}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${St("auditor",o)}
          </div>
        </div>

        <!-- STT Telemetry Counters -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Language</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">fi (Finnish)</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Lag</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">${p} ms</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Processed</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">${d}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Dropped</span>
            <span class="font-bold font-mono text-[13px] ${f>0?"text-error":"text-on-surface"}">${f}</span>
          </div>
        </div>

        <!-- Live Transcripts Feed -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="font-bold text-on-surface">Live Auditor Transcripts</span>
            <span class="text-[10px] text-on-surface-variant">Reaaliaikainen tekstitysvirta</span>
          </div>
          <div class="space-y-1.5 max-h-40 overflow-y-auto">
            ${I}
          </div>
        </div>
      </div>

      <!-- STEP 3: CAPTIONS FLOWING STATUS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">closed_caption</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 3: Closed Captions Pipeline</h3>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${w?"bg-green-600 text-white":"bg-surface-container-highest text-on-surface-variant"}">
            <span class="w-2 h-2 rounded-full ${w?"bg-white animate-pulse":"bg-outline-variant"}"></span>
            <span>${w?"Captions are flowing":"Captions Idle"}</span>
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <!-- Captions to Relay Toggle -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-label-sm">
              <span class="text-on-surface-variant">Captions to Web Radio Relay:</span>
              <span class="font-bold text-on-surface uppercase">${s}</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
              ${St("relay",s)}
            </div>
          </div>

          <!-- Captions to YouTube Toggle -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-label-sm">
              <span class="text-on-surface-variant">Captions to YouTube Live:</span>
              <span class="font-bold text-on-surface uppercase">${i}</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
              ${St("youtube",i)}
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: WEB RADIO SETTINGS & TOGGLES -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">radio</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 4: Web Radio Relay &amp; Setup</h3>
          </div>
          <div class="flex items-center gap-1.5">
            <!-- Sound coming in indicator for radio -->
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${l?"bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30":"bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
              Sound: ${l?"Active":"Silent"}
            </span>
            <!-- Captions coming in indicator for radio -->
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${w?"bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30":"bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
              Captions: ${w?"Receiving":"Waiting"}
            </span>
          </div>
        </div>

        <!-- Mode Toggles (On / Off / Auto) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Web Radio Mode (auto = lähettää automaattisesti puheella):</span>
            <span class="font-bold text-on-surface uppercase">${a}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${St("radio",a)}
          </div>
        </div>

        <!-- Radio Setup & Configuration Fields -->
        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2.5">
          <h4 class="font-label-sm text-[11px] font-bold text-on-surface uppercase">Nettiradion määritykset</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-body-sm">
            <div>
              <label class="block text-on-surface-variant text-[10px] font-bold uppercase mb-0.5">Lähetyksen nimi (Stream Name):</label>
              <input
                type="text"
                id="voice-radio-streamname"
                value="${te(ya)}"
                class="w-full h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-on-surface-variant text-[10px] font-bold uppercase mb-0.5">Mount Point:</label>
              <input
                type="text"
                id="voice-radio-mount"
                value="${te(vo)}"
                class="w-full h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] pt-1">
            <span class="text-on-surface-variant">Kuulijoita verkossa: <strong class="font-mono text-primary">${y}</strong></span>
            <span class="text-on-surface-variant">Jakelu: <strong class="font-mono text-on-surface">Icecast2 (128 kbps MP3)</strong></span>
          </div>
        </div>

        <!-- Confidence Audio Player for Sound Booth -->
        <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-label-sm text-on-surface-variant">
            <span>Kuuntele nettiradiota selaimessa (varmistus):</span>
            <span class="font-mono text-primary truncate max-w-[200px]">${te(bn)}</span>
          </div>
          <audio id="voice-radio-audio-player" class="w-full h-9 rounded outline-none" controls preload="none">
            <source src="${te(bn)}" type="audio/mpeg">
            Your browser does not support audio playback.
          </audio>
        </div>
      </div>

      <!-- PIVOICE AUTH TOKEN CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <label class="font-label-md text-[12px] font-bold text-on-surface" for="voice-token">pivoice API Token</label>
        <div class="flex gap-2">
          <input id="voice-token" type="password" autocomplete="off" value="${te(ha())}"
            class="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-body-md text-[12px]" />
          <button type="button" data-action="save-token" class="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-[12px] font-bold uppercase">Tallenna</button>
        </div>
        <p class="font-label-sm text-[10px] text-on-surface-variant">Istuntokohtainen token. pivoice sijainnissa: ${te(va||"origin")}.</p>
      </div>

      ${lt?`<p class="font-label-sm text-[11px] text-primary px-1 font-semibold">${te(lt)}</p>`:""}
    </div>`}async function xn(){try{const[e,t]=await Promise.all([ae("GET","/api/v1/status"),ae("GET","/api/v1/config"),Kn(),Yn()]);qn(e,t,"")}catch(e){Kn(),Yn(),qn(null,null,e instanceof Error?e.message:"Cannot reach pivoice")}}async function Te(e,t){ft=!0,lt="";try{await e(),lt=t}catch(n){lt=n instanceof Error?n.message:"Request failed"}finally{ft=!1,await xn()}}async function ko(e,t){var n;if(e==="auditor")await ae("PUT","/api/v1/config",{auditor:{mode:t}});else if(e==="radio"){const o=(((n=(await ae("GET","/api/v1/config")).radio)==null?void 0:n.targets)??[{id:"icecast",mode:t}]).map(s=>({...s,mode:t}));await ae("PUT","/api/v1/config",{radio:{targets:o}})}else await ae("PUT","/api/v1/config",{captions:{[e]:{mode:t}}})}function To(e){const t=e.target.closest("[data-action]");if(!t||ft)return;const n=t.dataset.action;if(n==="capture-start")Te(()=>ae("POST","/api/v1/capture/start"),"Capture started");else if(n==="capture-stop")Te(()=>ae("POST","/api/v1/capture/stop"),"Capture stopped");else if(n==="capture-mode"){const a=t.dataset.value;a&&(mn=a,a==="on"?Te(()=>ae("POST","/api/v1/capture/start"),"Capture on"):a==="off"?Te(()=>ae("POST","/api/v1/capture/stop"),"Capture off"):Te(async()=>{},`Capture mode set to ${a}`))}else if(n==="mode"){const a=t.dataset.section,o=t.dataset.value;Te(()=>ko(a,o),`${a} set to ${o}`)}else if(n==="save-token"){const a=xe==null?void 0:xe.querySelector("#voice-token");ho((a==null?void 0:a.value.trim())??""),Te(async()=>{},"Token saved")}}function $o(){xe=document.getElementById("voice-root"),xe&&xe.addEventListener("click",To)}function Eo(e){e&&ot===void 0?(xn(),ot=window.setInterval(()=>void xn(),go)):!e&&ot!==void 0&&(window.clearInterval(ot),ot=void 0)}const Jt={};let de=null,st,zn=!1,_=null,q=null,V=null,wa=[],Le="auto",Bt=null,ka="auto",Ta="auto",ue=!1,He;function So(e=window.location.search){const t=new URLSearchParams(e).get("pitube"),n=Jt==null?void 0:Jt.VITE_PITUBE_URL;return(t??n??"/api/v1/youtube").replace(/\/+$/,"")}const Zt=So();function ce(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function Ze(e,t,n){let a=`${Zt}${t}`;t.startsWith("/api/v1")&&Zt.endsWith("/api/v1")&&(a=`${Zt}${t.slice(7)}`);const o={};n!==void 0&&(o["Content-Type"]="application/json");const s=await fetch(a,{method:e,headers:o,body:n!==void 0?JSON.stringify(n):void 0});if(!s.ok){let i=`pitube answered ${s.status}`;try{const r=await s.json();r!=null&&r.error&&(i=typeof r.error=="string"?r.error:JSON.stringify(r.error))}catch{}throw new Error(i)}return await s.json()}async function Vt(){try{const e=await fetch("/api/v1/atem");e.ok&&(q=await e.json())}catch{q||(q={connected:!0,programInput:1,previewInput:2,recording:!1,streaming:!1})}try{const e=await fetch("/api/v1/encoder");e.ok&&(V=await e.json())}catch{V||(V={configured:!0,connected:!0,name:"Matrox Monarch HDX",encoder1:{mode:"rtmp",state:"STOPPED"},encoder2:{mode:"record",state:"STOPPED"}})}}async function fe(){var e;try{const[t,n]=await Promise.all([Ze("GET","/status").catch(()=>null),Ze("GET","/broadcasts").catch(()=>null),Vt()]);t&&(_=t,(e=t.selectedBroadcast)!=null&&e.id&&(Le=t.selectedBroadcast.id)),n&&Array.isArray(n.items)&&(wa=n.items,n.selectedId&&(Le=n.selectedId)),Bt=null}catch(t){Bt=t instanceof Error?t.message:String(t)}finally{ge()}}function Co(e){zn=e,e?(fe(),st||(st=window.setInterval(()=>{zn&&fe()},3e3))):(st&&(clearInterval(st),st=void 0),He&&(window.clearTimeout(He),He=void 0,ue=!1))}function Io(e){de=e,ge()}async function Mo(e,t="both"){try{await fetch(`/api/v1/encoder/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({encoder:t})}),z(`Enkooderi: ${e.toUpperCase()} (${t})`),Vt().then(ge)}catch(n){alert("Enkooderin ohjaus epäonnistui: "+(n instanceof Error?n.message:String(n)))}}async function Po(){try{await fetch("/api/v1/atem/cut",{method:"POST"}),z("ATEM CUT suoritettu"),Vt().then(ge)}catch{z("ATEM CUT virhe")}}async function Ao(){try{await fetch("/api/v1/atem/auto",{method:"POST"}),z("ATEM AUTO siirtymä suoritettu"),Vt().then(ge)}catch{z("ATEM AUTO virhe")}}function Lo(e){switch(e.toLowerCase()){case"live":return{label:"LIVE",bg:"bg-error",text:"text-on-error",pulse:!0};case"testing":return{label:"TESTING",bg:"bg-amber-500",text:"text-white",pulse:!0};case"ready":return{label:"READY",bg:"bg-blue-600",text:"text-white",pulse:!1};case"complete":return{label:"COMPLETED",bg:"bg-surface-container-highest",text:"text-on-surface-variant",pulse:!1};default:return{label:"OFFLINE",bg:"bg-surface-container-highest",text:"text-on-surface-variant",pulse:!1}}}function Bo(e){switch(e==null?void 0:e.toLowerCase()){case"good":return{label:"Ingest: Good",bg:"bg-green-600/20 text-green-700 dark:text-green-300 border-green-500/40",text:"text-green-700"};case"ok":return{label:"Ingest: OK",bg:"bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",text:"text-amber-700"};case"poor":return{label:"Ingest: Poor",bg:"bg-error-container text-on-error-container border-error/40",text:"text-error"};default:return{label:"Ingest: No Data",bg:"bg-surface-container-highest text-on-surface-variant border-outline-variant/30",text:"text-on-surface-variant"}}}function Xn(e,t){return["on","off","auto"].map(a=>`<button type="button" data-auto-domain="${e}" data-auto-value="${a}" class="px-2.5 py-1 rounded-md text-[10px] font-label-sm font-bold uppercase transition-all ${a===t?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-surface-container-highest hover:text-on-surface"}">${a.toUpperCase()}</button>`).join("")}function ge(){var I,S,D,x,b,g;if(!de)return;const e=(_==null?void 0:_.state)??"offline",t=Lo(e),n=Bo((_==null?void 0:_.streamHealth)??"noData"),a=_==null?void 0:_.selectedBroadcast,o=a==null?void 0:a.id,s=((I=_==null?void 0:_.captions)==null?void 0:I.sent)??0,i=((S=_==null?void 0:_.captions)==null?void 0:S.dropped)??0,r=e==="live"&&s>=0,l=e==="live",c=!!o&&!l,p=(q==null?void 0:q.connected)??!0,d=(q==null?void 0:q.programInput)??1,f=(q==null?void 0:q.previewInput)??2,h=((D=V==null?void 0:V.encoder1)==null?void 0:D.state)==="RUNNING"||((x=V==null?void 0:V.encoder1)==null?void 0:x.state)==="ACTIVE",y=((b=V==null?void 0:V.encoder2)==null?void 0:b.state)==="RUNNING"||((g=V==null?void 0:V.encoder2)==null?void 0:g.state)==="ACTIVE",w=h||y;de.innerHTML=`
    <div class="space-y-space-md">
      <!-- PIPELINE HEADER WITH BREADCRUMB -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-red-600/15 text-red-600 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">smart_display</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Video Stream Flow</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${t.bg} ${t.text} ${t.pulse?"animate-pulse":""}">
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>${t.label}</span>
                </span>
              </div>
              <span class="font-label-sm text-[10px] text-on-surface-variant">ATEM &rarr; Matrox Monarch HDX &rarr; YouTube Live &rarr; Captions</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${n.bg}">
              ${n.label}
            </span>
            <button type="button" id="yt-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä tila">
              <span class="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        <!-- 4-Step Pipeline Flow Strip -->
        <div class="grid grid-cols-4 gap-1 pt-1 text-center font-label-sm text-[10px] font-bold">
          <div class="p-1.5 rounded-lg ${p?"bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30":"bg-surface-container text-on-surface-variant"}">
            1. ATEM Switcher
          </div>
          <div class="p-1.5 rounded-lg ${w?"bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30":"bg-surface-container text-on-surface-variant"}">
            2. Matrox Encoder
          </div>
          <div class="p-1.5 rounded-lg ${l?"bg-red-600/15 text-red-700 dark:text-red-300 border border-red-500/30":"bg-surface-container text-on-surface-variant"}">
            3. YouTube Live
          </div>
          <div class="p-1.5 rounded-lg ${r?"bg-primary/20 text-primary border border-primary/40":"bg-surface-container text-on-surface-variant"}">
            4. Closed Captions
          </div>
        </div>
      </div>

      ${Bt?`
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${ce(Bt)}</span>
        </div>
      `:""}

      <!-- STEP 1: ATEM SWITCHER STATUS CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">view_carousel</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 1: ATEM Switcher</h3>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${p?"bg-green-600 text-white":"bg-error text-white"}">
            ${p?"ATEM Online":"ATEM Offline"}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
            <span class="text-on-surface-variant font-bold text-[10px] uppercase">Program (On Air):</span>
            <span class="px-2 py-0.5 rounded bg-error text-on-error font-mono font-bold text-[11px]">Input ${d}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
            <span class="text-on-surface-variant font-bold text-[10px] uppercase">Preview (Next):</span>
            <span class="px-2 py-0.5 rounded bg-green-600 text-white font-mono font-bold text-[11px]">Input ${f}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
          <button type="button" id="atem-cut-btn" class="flex-1 h-9 rounded-lg bg-surface-container-high hover:bg-error hover:text-white text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all shadow-sm">
            CUT Leikkaus
          </button>
          <button type="button" id="atem-auto-btn" class="flex-1 h-9 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all shadow-sm">
            AUTO Siirtymä
          </button>
        </div>
      </div>

      <!-- STEP 2: VIDEO ENCODER (MATROX MONARCH HDX) + PUSH-TO-SEE-VIDEO PREVIEW -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">videocam</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 2: Video Encoder (Matrox Monarch HDX)</h3>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-label-sm text-on-surface-variant">Auto:</span>
            <div class="flex gap-0.5 p-0.5 bg-surface-container-highest rounded-md">
              ${Xn("encoder",ka)}
            </div>
          </div>
        </div>

        <!-- Encoder 1 & Encoder 2 Toggles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Encoder 1: RTMP Stream -->
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-[12px] block text-on-surface">Encoder 1 (Stream RTMP)</span>
                <span class="text-[10px] text-on-surface-variant font-mono">1080p50 @ 6000 kbps</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${h?"bg-green-600 text-white":"bg-surface-container-highest text-on-surface-variant"}">
                ${h?"STREAMING":"STOPPED"}
              </span>
            </div>
            <div class="flex gap-1.5">
              <button type="button" data-enc-action="start" data-enc-id="1" class="flex-1 h-8 rounded-md bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-[10px] font-bold uppercase transition-all">
                Käynnistä
              </button>
              <button type="button" data-enc-action="stop" data-enc-id="1" class="flex-1 h-8 rounded-md bg-surface-container-high hover:bg-error hover:text-white text-on-surface font-label-sm text-[10px] font-bold uppercase transition-all">
                Pysäytä
              </button>
            </div>
          </div>

          <!-- Encoder 2: MP4 Record -->
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-[12px] block text-on-surface">Encoder 2 (Tallennus MP4)</span>
                <span class="text-[10px] text-on-surface-variant font-mono">USB / SD Master</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${y?"bg-red-600 text-white animate-pulse":"bg-surface-container-highest text-on-surface-variant"}">
                ${y?"RECORDING":"STOPPED"}
              </span>
            </div>
            <div class="flex gap-1.5">
              <button type="button" data-enc-action="start" data-enc-id="2" class="flex-1 h-8 rounded-md bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-[10px] font-bold uppercase transition-all">
                Käynnistä
              </button>
              <button type="button" data-enc-action="stop" data-enc-id="2" class="flex-1 h-8 rounded-md bg-surface-container-high hover:bg-error hover:text-white text-on-surface font-label-sm text-[10px] font-bold uppercase transition-all">
                Pysäytä
              </button>
            </div>
          </div>
        </div>

        <!-- PUSH-TO-SEE-VIDEO CONFIDENCE PREVIEW -->
        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">visibility</span>
              <span class="font-bold text-[12px] text-on-surface">Enkooderin videokuvan esikatselu</span>
            </div>
            <button
              type="button"
              id="push-to-see-video-btn"
              class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 shadow-sm ${ue?"bg-amber-500 text-white":"bg-primary text-on-primary hover:bg-primary/90"}">
              <span class="material-symbols-outlined text-[15px]">${ue?"visibility_off":"touch_app"}</span>
              <span>${ue?"Piilota kuva":"Push to see video"}</span>
            </button>
          </div>

          <p class="text-[10px] font-body-sm text-on-surface-variant">
            Esikatselu on oletuksena suljettuna verkkokuorman säästämiseksi. Paina painiketta nähdäksesi enkooderin kuvan hetkeksi.
          </p>

          ${ue?`
            <div class="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-outline-variant/40 shadow-inner flex items-center justify-center animate-fadeIn">
              <img
                src="/api/v1/snapshot?t=${Date.now()}"
                alt="Encoder Preview"
                class="w-full h-full object-cover"
                onerror="this.style.display='none'; document.getElementById('snapshot-fallback').classList.remove('hidden');" />
              <div id="snapshot-fallback" class="hidden flex flex-col items-center justify-center gap-2 p-4 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[36px] text-primary animate-spin">refresh</span>
                <span class="text-[11px] font-mono">Haetaan suoraa videokuvaa enkooderilta…</span>
              </div>
              <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                Auto-closing in 20s
              </div>
            </div>
          `:""}
        </div>
      </div>

      <!-- STEP 3: YOUTUBE LIVE STATUS & CONTROLS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">event</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 3: YouTube Live Broadcast</h3>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <span class="text-[10px] font-label-sm text-on-surface-variant">Auto:</span>
              <div class="flex gap-0.5 p-0.5 bg-surface-container-highest rounded-md">
                ${Xn("youtube",Ta)}
              </div>
            </div>
            <button type="button" id="yt-open-create-btn" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-[11px] font-bold uppercase transition-all hover:bg-primary/90 active:scale-95 shadow-sm">
              <span class="material-symbols-outlined text-[15px]">add_circle</span>
              <span>+ Uusi lähetys</span>
            </button>
          </div>
        </div>

        <!-- Target Broadcast Selector -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="relative flex-1">
            <select id="yt-broadcast-select" class="w-full h-10 px-3 bg-surface-container rounded-lg border border-outline-variant/50 text-on-surface font-body-sm text-[13px] focus:outline-none focus:border-primary appearance-none pr-8">
              <option value="auto" ${Le==="auto"?"selected":""}>[Auto: Valitse lähin aikataulutettu lähetys]</option>
              ${wa.map($=>{const E=$.id===Le,M=$.scheduledStartTime?new Date($.scheduledStartTime).toLocaleString("fi-FI",{day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`<option value="${ce($.id)}" ${E?"selected":""}>${ce($.title)} (${$.privacy.toUpperCase()}) ${M?"— "+M:""}</option>`}).join("")}
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">arrow_drop_down</span>
          </div>

          <button type="button" id="yt-select-confirm-btn" class="h-10 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 flex-shrink-0">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Valitse</span>
          </button>
        </div>

        ${a?`
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/25 space-y-1 text-[11px] font-body-sm">
            <div class="flex items-center justify-between text-on-surface">
              <span class="font-bold text-[12px] truncate">${ce(a.title)}</span>
              <span class="font-mono text-[10px] uppercase font-bold text-primary">${ce(a.privacy)}</span>
            </div>
            <div class="flex items-center justify-between pt-1 text-[10px]">
              <span class="font-mono text-on-surface-variant">ID: ${ce(a.id)}</span>
              <div class="flex items-center gap-2">
                <a href="https://studio.youtube.com/video/${ce(a.id)}/livestreaming" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  <span>Studio</span>
                  <span class="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
                <a href="https://youtu.be/${ce(a.id)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  <span>Watch</span>
                  <span class="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        `:""}

        <!-- YouTube Live Embedded Confidence Player -->
        <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          ${o?`
            <iframe
              id="yt-preview-iframe"
              class="w-full h-full border-0"
              src="https://www.youtube.com/embed/${ce(o)}?autoplay=1&mute=1&enablejsapi=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          `:`
            <div class="flex flex-col items-center justify-center gap-2 p-6 text-center text-on-surface-variant/60">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant/40">tv_off</span>
              <p class="font-body-sm text-[12px]">Ei aktiivista esikatselua. Valitse lähetys nähdäksesi kuvan.</p>
            </div>
          `}
        </div>

        <!-- Controls: Go Live / End -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            id="yt-go-live-btn"
            ${c?"":"disabled"}
            class="h-12 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[13px] font-bold uppercase transition-all shadow-sm ${c?"bg-primary hover:bg-primary/90 text-on-primary active:scale-95":"bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[20px]">podcasts</span>
            <span>Aloita lähetys / Go Live</span>
          </button>

          <button
            type="button"
            id="yt-end-live-btn"
            ${l?"":"disabled"}
            class="h-12 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[13px] font-bold uppercase transition-all shadow-sm ${l?"bg-error hover:bg-error/90 text-on-error active:scale-95":"bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[20px]">stop_circle</span>
            <span>Lopeta lähetys / End</span>
          </button>
        </div>
      </div>

      <!-- STEP 4: CLOSED CAPTIONS INGESTION INFO -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">closed_caption</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 4: YouTube Closed Captions Telemetry</h3>
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${r?"bg-primary/15 text-primary border-primary/30":"bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
            ${r?`Streaming (${s} pkt)`:"Waiting"}
          </span>
        </div>

        <!-- Explanatory Banner regarding unidirectional HTTP chunked captions -->
        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-[11px] font-body-sm space-y-1.5">
          <div class="flex items-start gap-2">
            <span class="material-symbols-outlined text-[16px] text-amber-500 flex-shrink-0 mt-0.5">info</span>
            <div class="space-y-1 text-on-surface-variant">
              <p>
                <strong>Huomio tekstityksen tilasta:</strong> Tekstitykset lähetetään YouTubeen yksisuuntaisella HTTP chunked POST -siirrolla 30 sekunnin aikaoffsetilla. YouTube Data API ei tarjoa kuittausta (ack/readback) tekstityksen vastaanotosta.
              </p>
              <p class="text-primary font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">touch_app</span>
                <span>Varmista tekstityksen toimivuus soittimen omalla <strong>[CC]</strong> -painikkeella yllä olevassa YouTube-esikatselussa.</span>
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Captions Sent</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">${s}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Dropped</span>
            <span class="font-bold text-on-surface font-mono text-[13px] ${i>0?"text-error":""}">${i}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Delay Offset</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">30 s</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Protocol</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">HTTP POST</span>
          </div>
        </div>
      </div>
    </div>
  `,Oo()}function Oo(){const e=document.getElementById("yt-refresh-btn");e&&(e.onclick=()=>void fe());const t=document.getElementById("atem-cut-btn");t&&(t.onclick=()=>void Po());const n=document.getElementById("atem-auto-btn");n&&(n.onclick=()=>void Ao());const a=de==null?void 0:de.querySelectorAll("[data-enc-action]");a==null||a.forEach(p=>{p.addEventListener("click",()=>{const d=p.getAttribute("data-enc-action"),f=p.getAttribute("data-enc-id");d&&Mo(d,f==="1"?1:f==="2"?2:"both")})});const o=document.getElementById("push-to-see-video-btn");o&&(o.onclick=()=>{ue=!ue,ue&&(He&&clearTimeout(He),He=window.setTimeout(()=>{ue=!1,ge()},2e4)),ge()});const s=de==null?void 0:de.querySelectorAll("[data-auto-domain]");s==null||s.forEach(p=>{p.addEventListener("click",()=>{const d=p.getAttribute("data-auto-domain"),f=p.getAttribute("data-auto-value");d==="encoder"?(ka=f,z(`Enkooderin automaatiotila: ${f.toUpperCase()}`)):d==="youtube"&&(Ta=f,z(`YouTuben automaatiotila: ${f.toUpperCase()}`)),ge()})});const i=document.getElementById("yt-select-confirm-btn");i&&(i.onclick=async()=>{const p=document.getElementById("yt-broadcast-select");if(!p)return;const d=p.value;if(d==="auto"){Le="auto",z("Auto-valinta käytössä"),fe();return}try{await Ze("POST","/broadcasts/select",{broadcastId:d}),Le=d,z(`Lähetys valittu: ${d}`),fe()}catch(f){alert("Valinta epäonnistui: "+(f instanceof Error?f.message:String(f)))}});const r=document.getElementById("yt-go-live-btn");r&&(r.onclick=async()=>{if(confirm("Oletko varma että haluat aloittaa suoran lähetyksen YouTubessa?"))try{await Ze("POST","/broadcasts/start"),z("YouTube suora lähetys käynnistetty!"),fe()}catch(p){alert("Lähetyksen aloitus epäonnistui: "+(p instanceof Error?p.message:String(p)))}});const l=document.getElementById("yt-end-live-btn");l&&(l.onclick=()=>{$a()});const c=document.getElementById("yt-open-create-btn");c&&(c.onclick=()=>{const p=document.getElementById("yt-create-modal");p&&p.classList.remove("hidden")})}async function Ro(e,t,n=""){var a;try{const o=await Ze("POST","/broadcasts/create",{title:e,privacy:t,description:n}),s=((a=o==null?void 0:o.broadcast)==null?void 0:a.id)||(o==null?void 0:o.id);s&&(Le=s,z(`Uusi lähetys luotu: ${e}`)),fe()}catch(o){alert("Lähetyksen luonti epäonnistui: "+(o instanceof Error?o.message:String(o)))}}async function $a(){if(confirm("Haluatko varmasti lopettaa suoran lähetyksen? Lähetystä ei voi avata uudelleen."))try{await Ze("POST","/broadcasts/stop"),z("Suora lähetys päättynyt."),fe()}catch(e){alert("Lähetyksen lopetus epäonnistui: "+(e instanceof Error?e.message:String(e)))}}function z(e){const t=document.getElementById("toast"),n=document.getElementById("toast-text");t&&n&&(n.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2800))}const Qt={};let A=null,it,Jn=!1,Fe="live",j=[],gn="tally01",Ne="tally01",Ot=null,Rt=null;function No(e=window.location.search){const t=new URLSearchParams(e).get("pilight"),n=Qt==null?void 0:Qt.VITE_PILIGHT_URL;return(t??n??"/api/v1/lights").replace(/\/+$/,"")}const jo=No();function L(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function oe(e,t="",n){const a=`${jo}${t}`,o={};n!==void 0&&(o["Content-Type"]="application/json");const s=await fetch(a,{method:e,headers:o,body:n!==void 0?JSON.stringify(n):void 0});if(!s.ok){let i=`pilight returned ${s.status}`;try{const r=await s.json();r!=null&&r.error&&(i=typeof r.error=="string"?r.error:JSON.stringify(r.error))}catch{}throw new Error(i)}return await s.json()}async function vn(){try{const e=await oe("GET").catch(()=>null);Array.isArray(e)?(j=e.map(t=>{var i,r;const n=j.find(l=>l.id===t.id),a=t.segments&&t.segments.length>0&&((r=(i=t.segments[0])==null?void 0:i.facet)==null?void 0:r.type)!=="atem-input"?"status":(n==null?void 0:n.inputMode)??(t.id==="tally05"?"status":"normal"),o=t.atemInput??(n==null?void 0:n.atemInput)??(t.id==="tally01"?1:t.id==="tally02"?2:t.id==="tally03"?3:t.id==="tally04"?4:1),s=t.segments??(n==null?void 0:n.segments)??Ea();return{...t,inputMode:a,atemInput:o,segments:s}}),Ot=null):j.length===0&&(j=[{id:"tally01",name:"Cam 1 (Center)",host:"tally01.local",fallbackIp:"192.168.1.70",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:1},{id:"tally02",name:"Cam 2 (Pulpit)",host:"tally02.local",fallbackIp:"192.168.1.71",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:2},{id:"tally03",name:"Cam 3 (Altar)",host:"tally03.local",fallbackIp:"192.168.1.72",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:3},{id:"tally04",name:"Input 4 (Slides)",host:"tally04.local",fallbackIp:"192.168.1.73",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:4},{id:"tally05",name:"Status Monitor (Director Desk)",host:"tally05.local",fallbackIp:"192.168.1.74",mode:"segmented",brightness:"high",hold:!1,inputMode:"status",atemInput:1,segments:[{id:"grp-yt",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-enc",name:"Matrox Enkooderi",leds:[3,4],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-stt",name:"Auditor STT",leds:[5],facet:{type:"stt-state"}},{id:"grp-cc",name:"Tekstitysvirta",leds:[6],facet:{type:"caption-state"}},{id:"grp-proj",name:"Videotykki 1 (Vasen)",leds:[7,8],facet:{type:"projector",projector:1}}]}])}catch(e){Ot=e instanceof Error?e.message:String(e)}finally{F()}}function Ea(){return[{id:"grp-1",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-2",name:"Matrox Enkooderi",leds:[3,4],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-3",name:"Auditor STT",leds:[5],facet:{type:"stt-state"}},{id:"grp-4",name:"Tekstitysvirta",leds:[6],facet:{type:"caption-state"}},{id:"grp-5",name:"Videotykki 1 (Vasen)",leds:[7,8],facet:{type:"projector",projector:1}}]}function Uo(e){Jn=e,e?(vn(),it||(it=window.setInterval(()=>{Jn&&vn()},2500))):it&&(clearInterval(it),it=void 0)}function Do(e){A=e,F()}async function _o(e,t){try{await oe("POST",`/${encodeURIComponent(e)}/state`,{mode:t});const n=j.find(a=>a.id===e);n&&(n.mode=t),F()}catch(n){alert("Tally update failed: "+(n instanceof Error?n.message:String(n)))}}async function Sa(e,t,n=2e3){try{await oe("POST",`/${encodeURIComponent(e)}/cue`,{direction:t,durationMs:n}),se(`Cue "${t}" sent to ${e}`)}catch{se(`Cue sent (${t})`)}}async function Vo(e){try{await oe("POST",`/${encodeURIComponent(e)}/call`),se(`Operator CALL sent to ${e}`)}catch{se(`CALL sent to ${e}`)}}async function Ho(e,t){try{const n=!t;await oe("POST",`/${encodeURIComponent(e)}/hold`,{hold:n});const a=j.find(o=>o.id===e);a&&(a.hold=n),F(),se(`${e} HOLD ${n?"ON":"OFF"}`)}catch(n){alert("Hold update failed: "+(n instanceof Error?n.message:String(n)))}}async function Fo(e,t){const a={low:"medium",medium:"high",high:"low"}[t]??"medium";try{await oe("POST",`/${encodeURIComponent(e)}/brightness`,{level:a.toUpperCase()});const o=j.find(s=>s.id===e);o&&(o.brightness=a),F(),se(`${e} brightness: ${a.toUpperCase()}`)}catch(o){alert("Brightness update failed: "+(o instanceof Error?o.message:String(o)))}}async function Go(e){try{await oe("POST",`/${encodeURIComponent(e)}/animation/rainbow`,{durationSec:3,fps:20}),se(`Cycle test started on ${e}`)}catch{se(`Cycle test triggered on ${e}`)}}function Nt(e){if(!e)return{color:"#52525b",bg:"bg-zinc-800",text:"text-zinc-400",label:"Määrittelemätön",glow:"rgba(82,82,91,0.4)"};switch(e.type){case"youtube-stream":return{color:"#ef4444",bg:"bg-red-600",text:"text-red-400",label:"YouTube Live",glow:"rgba(239,68,68,0.7)"};case"matrox-encoder":return{color:"#f97316",bg:"bg-orange-500",text:"text-orange-400",label:`Enkooderi ${e.encoder??1}`,glow:"rgba(249,115,22,0.7)"};case"atem-recording":return{color:"#dc2626",bg:"bg-red-700",text:"text-red-300",label:"ATEM Tallennus",glow:"rgba(220,38,38,0.7)"};case"atem-streaming":return{color:"#f59e0b",bg:"bg-amber-500",text:"text-amber-400",label:"ATEM Striimaus",glow:"rgba(245,158,11,0.7)"};case"projector":return{color:"#06b6d4",bg:"bg-cyan-500",text:"text-cyan-300",label:e.projector===2?"Videotykki 2 (Oikea / Vert Right)":"Videotykki 1 (Vasen / Vert Left)",glow:"rgba(6,182,212,0.7)"};case"atlona-input":return{color:"#a855f7",bg:"bg-purple-500",text:"text-purple-300",label:{1:"Lukupulpetti (Lectern)",2:"Räkki (Operator PC)",3:"Pi 1 (PiPGM 1)",4:"Pi 2 (PiPGM 2)"}[e.input??1]||`Atlona Tulo ${e.input??1}`,glow:"rgba(168,85,247,0.7)"};case"atlona-output":return{color:"#3b82f6",bg:"bg-blue-600",text:"text-blue-300",label:{1:"Videotykki 1 (Vasen)",2:"Videotykki 2 (Oikea)",5:"Videomikseri"}[e.output??1]||`Atlona Lähtö ${e.output??1}`,glow:"rgba(59,130,246,0.7)"};case"pi-output":return{color:"#ec4899",bg:"bg-pink-600",text:"text-pink-300",label:e.output===2?"Pi 2 (PiPGM 2)":"Pi 1 (PiPGM 1)",glow:"rgba(236,72,153,0.7)"};case"stt-state":return{color:"#22c55e",bg:"bg-green-600",text:"text-green-300",label:"Auditor STT Puhe",glow:"rgba(34,197,94,0.7)"};case"caption-state":return{color:"#14b8a6",bg:"bg-teal-500",text:"text-teal-300",label:"Tekstitysvirta",glow:"rgba(20,184,166,0.7)"};case"atem-input":return{color:"#eab308",bg:"bg-yellow-500",text:"text-yellow-300",label:`ATEM Tulo ${e.input??1}`,glow:"rgba(234,179,8,0.7)"};case"manual":return{color:"#8b5cf6",bg:"bg-violet-600",text:"text-violet-300",label:"Kiinteä väri",glow:"rgba(139,92,246,0.7)"};default:return{color:"#71717a",bg:"bg-zinc-700",text:"text-zinc-300",label:"Muu tila",glow:"rgba(113,113,122,0.4)"}}}function Wo(e){return e.startsWith("matrox-encoder-")?{type:"matrox-encoder",encoder:Number(e.split("-")[2])}:e.startsWith("projector-")?{type:"projector",projector:Number(e.split("-")[1])}:e.startsWith("atlona-input-")?{type:"atlona-input",input:Number(e.split("-")[2])}:e.startsWith("atlona-output-")?{type:"atlona-output",output:Number(e.split("-")[2])}:e.startsWith("pi-output-")?{type:"pi-output",output:Number(e.split("-")[2])}:e.startsWith("atem-input-")?{type:"atem-input",input:Number(e.split("-")[2])}:{type:e}}function Ko(e){return e?e.type==="matrox-encoder"?`matrox-encoder-${e.encoder??1}`:e.type==="projector"?`projector-${e.projector??1}`:e.type==="atlona-input"?`atlona-input-${e.input??1}`:e.type==="atlona-output"?`atlona-output-${e.output??1}`:e.type==="pi-output"?`pi-output-${e.output??1}`:e.type==="atem-input"?`atem-input-${e.input??1}`:e.type:"youtube-stream"}async function Yo(e,t,n,a,o,s){try{const i=j.find(r=>r.id===e);if(i&&(i.inputMode=t,i.atemInput=n,i.host=a,i.fallbackIp=o,t==="status"&&s&&(i.segments=s)),t==="status"&&s)await oe("POST",`/${encodeURIComponent(e)}/segments`,{segments:s});else{const r=[{id:"tally-full",name:`ATEM Input ${n}`,leds:[0,1,2,3,4,5,6,7,8],facet:{type:"atem-input",input:n}}];await oe("POST",`/${encodeURIComponent(e)}/segments`,{segments:r}).catch(()=>null)}await oe("POST","",{id:e,name:(i==null?void 0:i.name)??e,host:a,fallbackIp:o,protocol:t==="status"?"udp":"http"}).catch(()=>null),Rt=`Asetukset tallennettu onnistuneesti valolle ${e}!`,setTimeout(()=>{Rt=null,F()},3500),F(),se(`Asetukset tallennettu: ${e}`)}catch(i){alert("Tallennus epäonnistui: "+(i instanceof Error?i.message:String(i)))}}function qo(e){const t=e==null?void 0:e.toLowerCase();return t==="pgm"?{bg:"bg-error text-on-error",text:"text-error",dot:"bg-error animate-pulse",label:"PROGRAM"}:t==="prv"?{bg:"bg-green-600 text-white",text:"text-green-600",dot:"bg-green-500",label:"PREVIEW"}:t==="segmented"?{bg:"bg-purple-600 text-white",text:"text-purple-600",dot:"bg-purple-500",label:"STATUS / 9-LED"}:{bg:"bg-surface-container-highest text-on-surface-variant",text:"text-on-surface-variant",dot:"bg-outline-variant",label:"OFF"}}function F(){if(!A)return;const e=j.find(t=>t.id===Ne)??j[0];A.innerHTML=`
    <div class="space-y-space-md">
      <!-- HEADER CARD WITH SUB-PAGE NAVIGATION -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">highlight</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Tally Lights</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold bg-primary/10 text-primary uppercase">
                ${j.length} Units
              </span>
            </div>
            <span class="font-label-sm text-[10px] text-on-surface-variant">Tally-Ma wireless controller &amp; customizable 9-LED status lights</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- SUB-PAGE SWITCHER BUTTONS -->
          <div class="flex items-center p-0.5 rounded-lg bg-surface-container-high border border-outline-variant/30">
            <button
              type="button"
              id="subtab-live-btn"
              class="px-3 py-1 rounded-md text-[11px] font-label-sm font-bold uppercase transition-all flex items-center gap-1 ${Fe==="live"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              <span class="material-symbols-outlined text-[14px]">sports</span>
              <span>Live &amp; Cues</span>
            </button>
            <button
              type="button"
              id="subtab-setup-btn"
              class="px-3 py-1 rounded-md text-[11px] font-label-sm font-bold uppercase transition-all flex items-center gap-1 ${Fe==="setup"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              <span class="material-symbols-outlined text-[14px]">tune</span>
              <span>Light Setup &amp; Mapping</span>
            </button>
          </div>

          <button type="button" id="tally-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Refresh Tally Lights">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      ${Ot?`
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${L(Ot)}</span>
        </div>
      `:""}

      ${Fe==="live"?zo():Xo(e)}
    </div>
  `,Jo()}function zo(){return`
    <!-- CAMERA DIRECTOR PTZ CUES -->
    <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px] text-primary">sports</span>
          <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Camera Director PTZ Cues</h3>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-label-sm text-[10px] text-on-surface-variant">Target:</span>
          <select id="tally-cue-target-select" class="h-7 px-2 rounded-md bg-surface-container border border-outline-variant/40 text-on-surface text-[11px] font-label-sm font-bold focus:outline-none">
            ${j.map(e=>`<option value="${L(e.id)}" ${e.id===gn?"selected":""}>${L(e.name)} (${e.id})</option>`).join("")}
          </select>
        </div>
      </div>

      <p class="font-body-sm text-[11px] text-on-surface-variant">
        Lähetä ohjaajan visuaalisia animaatiomerkkejä kuvaajan tally-valoon kameran suuntaamiseksi:
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button type="button" data-cue="pan-left" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Pan Left</span>
        </button>

        <button type="button" data-cue="pan-right" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span>Pan Right</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>

        <button type="button" data-cue="zoom-in" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">zoom_in</span>
          <span>Zoom In</span>
        </button>

        <button type="button" data-cue="zoom-out" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">zoom_out</span>
          <span>Zoom Out</span>
        </button>

        <button type="button" data-cue="operator-call" class="tally-cue-btn col-span-2 sm:col-span-1 h-10 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-800 dark:text-amber-200 hover:text-white font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">notifications</span>
          <span>Cue Operator</span>
        </button>
      </div>
    </div>

    <!-- TALLY UNITS MONITOR STRIP -->
    <div class="space-y-2.5">
      <div class="flex items-center justify-between px-1">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Configured Tally Lights</h3>
        <span class="font-label-sm text-[10px] text-on-surface-variant">mDNS &amp; UDP 21324</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        ${j.map(e=>{var r,l;const t=qo(e.mode),n=((r=e.mode)==null?void 0:r.toLowerCase())==="pgm",a=((l=e.mode)==null?void 0:l.toLowerCase())==="prv",o=!n&&!a,s=e.inputMode==="status",i=e.segments??[];return`
            <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm space-y-2.5" id="card-${L(e.id)}">
              <!-- Top Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full ${t.dot}"></span>
                  <div>
                    <h4 class="font-headline-sm text-[13px] font-bold text-on-surface leading-tight">${L(e.name)}</h4>
                    <span class="font-label-sm text-[10px] text-on-surface-variant">
                      ${s?`[Status Mode: ${i.length} Custom Groups]`:`[Camera Tally: ATEM In ${e.atemInput??1}]`} &bull; ${L(e.host)}
                    </span>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase ${t.bg}">
                  ${t.label}
                </span>
              </div>

              <!-- 9-LED Mini Segment Strip -->
              <div class="p-1.5 bg-black/50 rounded-lg space-y-1">
                <div class="flex items-center gap-1 justify-between">
                  ${[0,1,2,3,4,5,6,7,8].map(c=>{let p="bg-zinc-800 text-white/50",d="",f=`LED ${c+1}`;if(n)p="bg-red-600 text-white font-bold",d="box-shadow: 0 0 6px rgba(220,38,38,0.8);";else if(a)p="bg-green-500 text-white font-bold",d="box-shadow: 0 0 6px rgba(34,197,94,0.8);";else if(s){const h=i.find(y=>y.leds.includes(c));if(h){const y=Nt(h.facet);d=`background-color: ${y.color}; box-shadow: 0 0 5px ${y.glow};`,p="text-white font-bold",f=`LED ${c+1}: ${h.name} (${y.label})`}else p="bg-zinc-900 text-white/30",f=`LED ${c+1}: Unassigned`}return`<span class="w-5 h-4 rounded-sm ${p} flex items-center justify-center text-[8px] font-mono transition-all" style="${d}" title="${L(f)}">${c+1}</span>`}).join("")}
                </div>

                ${s&&i.length>0?`
                  <div class="flex flex-wrap items-center gap-1 pt-0.5 text-[9px] font-label-sm">
                    ${i.map(c=>{const p=Nt(c.facet),d=c.leds.map(f=>f+1).join(",");return`
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30" style="border-left: 2px solid ${p.color};">
                          <span class="font-bold text-on-surface">${L(c.name)}:</span>
                          <span class="font-mono text-on-surface-variant">[${d}]</span>
                        </span>
                      `}).join("")}
                  </div>
                `:""}
              </div>

              <!-- Mode Toggles -->
              <div class="grid grid-cols-3 gap-1.5 pt-0.5">
                <button type="button" data-action="state" data-id="${L(e.id)}" data-mode="pgm" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${n?"bg-error text-on-error shadow-sm":"bg-surface-container-high hover:bg-error-container text-on-surface"}">
                  PGM
                </button>
                <button type="button" data-action="state" data-id="${L(e.id)}" data-mode="prv" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${a?"bg-green-600 text-white shadow-sm":"bg-surface-container-high hover:bg-green-700/20 text-on-surface"}">
                  PRV
                </button>
                <button type="button" data-action="state" data-id="${L(e.id)}" data-mode="off" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${o?"bg-surface-container-highest text-on-surface font-black":"bg-surface-container-high text-on-surface-variant"}">
                  OFF
                </button>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center justify-between gap-1 pt-1 border-t border-outline-variant/20 text-[10px]">
                <button type="button" data-action="call" data-id="${L(e.id)}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-bold uppercase flex items-center gap-0.5" title="Flash white 3 times">
                  <span class="material-symbols-outlined text-[13px]">flare</span>
                  <span>CALL</span>
                </button>

                <button type="button" data-action="hold" data-id="${L(e.id)}" data-hold="${e.hold}" class="px-2 py-1 rounded font-label-sm font-bold uppercase flex items-center gap-0.5 ${e.hold?"bg-amber-500 text-white":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface"}" title="Toggle HOLDDATA to prevent external server interference">
                  <span class="material-symbols-outlined text-[13px]">${e.hold?"lock":"lock_open"}</span>
                  <span>HOLD ${e.hold?"ON":"OFF"}</span>
                </button>

                <button type="button" data-action="brightness" data-id="${L(e.id)}" data-brightness="${e.brightness}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-bold uppercase flex items-center gap-0.5" title="Cycle Brightness (Low / Med / High)">
                  <span class="material-symbols-outlined text-[13px]">brightness_medium</span>
                  <span>${e.brightness.toUpperCase()}</span>
                </button>

                <button type="button" data-action="cycle" data-id="${L(e.id)}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm font-bold uppercase flex items-center gap-0.5" title="Run 9-LED cycle diagnostic">
                  <span class="material-symbols-outlined text-[13px]">autorenew</span>
                  <span>Test</span>
                </button>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function Xo(e){if(!e)return'<div class="p-4 text-center text-on-surface-variant">Valoja ei löydy.</div>';const t=e.inputMode==="status",n=e.segments??Ea(),a=new Map;return n.forEach((o,s)=>{o.leds.forEach(i=>{a.set(i,{segIndex:s,segName:o.name,facet:o.facet})})}),`
    <div class="space-y-space-md">
      ${Rt?`
        <div class="p-3 rounded-xl bg-green-600/20 border border-green-500/40 text-green-700 dark:text-green-300 text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          <span class="flex-1">${L(Rt)}</span>
        </div>
      `:""}

      <!-- LIGHT SELECTION CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Valitse konfiguroitava valo</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant">${j.length} valoa verkossa</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
          ${j.map(o=>{const s=o.id===e.id;return`
              <button
                type="button"
                data-select-light="${L(o.id)}"
                class="p-2 rounded-lg border text-left transition-all ${s?"bg-primary text-on-primary border-primary shadow-sm":"bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface"}">
                <div class="font-bold text-[12px] truncate">${L(o.name)}</div>
                <div class="text-[10px] opacity-80 font-mono">${L(o.id)} &bull; ${o.inputMode==="status"?"Status":"Tally"}</div>
              </button>
            `}).join("")}
        </div>
      </div>

      <!-- INPUT MODE SELECTOR: NORMAL CAMERA TALLY vs STATUS LIGHTS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">toggle_on</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Input Mode</h3>
          </div>
          <span class="font-label-sm text-[10px] uppercase font-bold text-primary">
            ${t?"Vapaa 9-LED Statusjako":"Kameran ATEM-tally"}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Option A: Normal Camera Tally -->
          <div
            id="mode-option-normal"
            class="p-3 rounded-xl border-2 cursor-pointer transition-all ${t?"border-outline-variant/30 bg-surface-container hover:border-outline-variant/60":"border-primary bg-primary/5 shadow-sm"}">
            <div class="flex items-center gap-2 mb-1">
              <input type="radio" name="inputMode" value="normal" id="radio-mode-normal" ${t?"":"checked"} class="text-primary focus:ring-primary" />
              <label for="radio-mode-normal" class="font-bold text-[13px] text-on-surface cursor-pointer">Normal Camera Tally</label>
            </div>
            <p class="text-[11px] font-body-sm text-on-surface-variant pl-5">
              Valo on sidottu videosekoittimen (ATEM) tuloon. Kaikki 9 LEDiä näyttävät yhtenäisen PGM (punainen) ja PRV (vihreä) tilan leikkausten mukana.
            </p>
          </div>

          <!-- Option B: Status Lights -->
          <div
            id="mode-option-status"
            class="p-3 rounded-xl border-2 cursor-pointer transition-all ${t?"border-primary bg-primary/5 shadow-sm":"border-outline-variant/30 bg-surface-container hover:border-outline-variant/60"}">
            <div class="flex items-center gap-2 mb-1">
              <input type="radio" name="inputMode" value="status" id="radio-mode-status" ${t?"checked":""} class="text-primary focus:ring-primary" />
              <label for="radio-mode-status" class="font-bold text-[13px] text-on-surface cursor-pointer">Status Lights (Vapaa 9-LED ryhmittely)</label>
            </div>
            <p class="text-[11px] font-body-sm text-on-surface-variant pl-5">
              Voit vapaasti valita ja ryhmitellä kaikki 9 valoa haluamallasi tavalla (esim. LEDit 1–3 YouTube, 4–5 Enkooderi, 6 STT, 7 Tekstitys, 8–9 Videotykki jne.).
            </p>
          </div>
        </div>

        <!-- CONDITIONAL FORM: NORMAL CAMERA TALLY MAPPING -->
        <div id="setup-normal-section" class="${t?"hidden":""} space-y-3 pt-2 border-t border-outline-variant/20">
          <div class="space-y-1.5">
            <label class="block font-label-md text-[12px] font-bold text-on-surface">
              ATEM Video Mixer Input Switching Mapping:
            </label>
            <select id="setup-atem-input" class="w-full sm:w-80 h-10 px-3 rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface font-body-sm text-[12px] focus:outline-none focus:border-primary">
              <option value="1" ${(e.atemInput??1)===1?"selected":""}>Input 1 — Cam 1 (Center)</option>
              <option value="2" ${(e.atemInput??1)===2?"selected":""}>Input 2 — Cam 2 (Pulpit)</option>
              <option value="3" ${(e.atemInput??1)===3?"selected":""}>Input 3 — Cam 3 (Altar)</option>
              <option value="4" ${(e.atemInput??1)===4?"selected":""}>Input 4 — Input 4 (Slides / PC)</option>
              <option value="5" ${(e.atemInput??1)===5?"selected":""}>Input 5 — Cam 4 (Choir)</option>
              <option value="6" ${(e.atemInput??1)===6?"selected":""}>Input 6 — Aux / Guest Input</option>
              <option value="7" ${(e.atemInput??1)===7?"selected":""}>Input 7 — Media Player 1</option>
              <option value="8" ${(e.atemInput??1)===8?"selected":""}>Input 8 — Media Player 2</option>
            </select>
            <p class="text-[11px] font-body-sm text-on-surface-variant">
              Tämä valo vaihtaa tilaansa automaattisesti ATEM Program/Preview -kytkentöjen mukaisesti.
            </p>
          </div>
        </div>

        <!-- CONDITIONAL FORM: CUSTOM 9-LED STATUS LIGHTS ALLOCATION & GROUPS -->
        <div id="setup-status-section" class="${t?"":"hidden"} space-y-4 pt-2 border-t border-outline-variant/20">
          <!-- 9-LED Visual Allocation Strip -->
          <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-label-md text-[12px] font-bold text-on-surface">9-LED Allokaatiopalkki (Visuaalinen jako):</span>
              <span class="font-mono text-[10px] text-on-surface-variant">${a.size}/9 LEDiä osoitettu</span>
            </div>

            <!-- LED Chassis Strip -->
            <div class="grid grid-cols-9 gap-1.5 p-2 bg-black/60 rounded-xl">
              ${[0,1,2,3,4,5,6,7,8].map(o=>{const s=a.get(o),i=s?Nt(s.facet):null,r=i?`background-color: ${i.color}; box-shadow: 0 0 8px ${i.glow};`:"";return`
                  <div class="flex flex-col items-center gap-1 text-center">
                    <div class="w-full h-8 rounded-md flex items-center justify-center font-mono font-bold text-[11px] transition-all ${s?"text-white":"bg-zinc-800 text-zinc-500"}" style="${r}">
                      ${o+1}
                    </div>
                    <span class="text-[8px] font-label-sm font-semibold truncate max-w-full ${s?"text-on-surface":"text-on-surface-variant/40"}">
                      ${s?L(s.segName):"Vapaa"}
                    </span>
                  </div>
                `}).join("")}
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="space-y-1.5">
            <span class="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase">Pika-asetukset (Valmiit ryhmittelyt):</span>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" data-preset="preset-3x3" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                3x3 (1–3 YouTube, 4–6 Enkooderi, 7–9 Tykki)
              </button>
              <button type="button" data-preset="preset-flow" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                Striimi &amp; Tekstitys (1–3 YT, 4–5 Enc, 6 STT, 7 CC, 8–9 Tykki)
              </button>
              <button type="button" data-preset="preset-audio" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                Ääni &amp; Radio (1–2 Mic, 3–5 STT, 6–7 CC, 8–9 Radio)
              </button>
              <button type="button" data-preset="preset-9split" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                9 Erillistä Tilalediä (1 LED / tila)
              </button>
            </div>
          </div>

          <!-- Custom Groups List -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h4 class="font-label-md text-[12px] font-bold text-on-surface">Mukautetut tilaryhmät:</h4>
              <button type="button" id="setup-add-group-btn" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-[10px] font-bold uppercase transition-all">
                <span class="material-symbols-outlined text-[14px]">add</span>
                <span>+ Lisää uusi ryhmä</span>
              </button>
            </div>

            <div id="status-groups-container" class="space-y-2.5">
              ${n.map((o,s)=>{const i=Nt(o.facet),r=Ko(o.facet);return`
                  <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5 group-card" data-group-index="${s}">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 flex-1">
                        <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${i.color};"></span>
                        <input
                          type="text"
                          data-group-field="name"
                          value="${L(o.name)}"
                          placeholder="Ryhmän nimi"
                          class="w-full sm:w-60 h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface text-[12px] font-bold focus:outline-none focus:border-primary" />
                      </div>

                      <button
                        type="button"
                        data-remove-group="${s}"
                        class="w-7 h-7 rounded bg-surface-container-high hover:bg-error hover:text-white text-on-surface-variant flex items-center justify-center transition-all"
                        title="Poista ryhmä">
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <!-- LED Selector Checkboxes (1 to 9) -->
                      <div class="space-y-1">
                        <label class="block text-[10px] font-label-sm font-bold text-on-surface-variant uppercase">
                          Valitut LEDit (Paina numeroa valitaksesi ryhmään):
                        </label>
                        <div class="flex items-center gap-1 flex-wrap">
                          ${[0,1,2,3,4,5,6,7,8].map(l=>{const c=o.leds.includes(l);return`
                              <button
                                type="button"
                                data-toggle-led="${l}"
                                data-group-index="${s}"
                                class="w-7 h-7 rounded-md font-mono text-[10px] font-bold uppercase transition-all ${c?"text-white shadow-sm font-black":"bg-surface-container-high text-on-surface-variant hover:text-on-surface"}"
                                style="${c?`background-color: ${i.color};`:""}">
                                ${l+1}
                              </button>
                            `}).join("")}
                        </div>
                      </div>

                      <!-- Status Facet Selector -->
                      <div class="space-y-1">
                        <label class="block text-[10px] font-label-sm font-bold text-on-surface-variant uppercase">
                          Seurattava tila (Facet):
                        </label>
                        <select data-group-field="facet" class="w-full h-8 px-2 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface text-[11px] font-body-sm focus:outline-none focus:border-primary">
                          <optgroup label="Striimaus &amp; Lähetys">
                            <option value="youtube-stream" ${r==="youtube-stream"?"selected":""}>YouTube Live (Punainen: Live, Keltainen: Buffering)</option>
                            <option value="matrox-encoder-1" ${r==="matrox-encoder-1"?"selected":""}>Matrox Enkooderi 1 (Stream RTMP)</option>
                            <option value="matrox-encoder-2" ${r==="matrox-encoder-2"?"selected":""}>Matrox Enkooderi 2 (Tallennus MP4 Master)</option>
                            <option value="atem-streaming" ${r==="atem-streaming"?"selected":""}>ATEM Striimausmoottori</option>
                            <option value="atem-recording" ${r==="atem-recording"?"selected":""}>ATEM Tallennus</option>
                          </optgroup>
                          <optgroup label="Ääni &amp; Tekstitys">
                            <option value="stt-state" ${r==="stt-state"?"selected":""}>Auditor STT (Puhe: Vihreä, Muunnos: Keltainen)</option>
                            <option value="caption-state" ${r==="caption-state"?"selected":""}>Tekstitysvirta (Captions flowing: Syaani)</option>
                          </optgroup>
                          <optgroup label="Saliesitys &amp; Projektorit">
                            <option value="projector-1" ${r==="projector-1"?"selected":""}>Videotykki 1 — Etuseinä vasen (Vertical Left • Lamp On)</option>
                            <option value="projector-2" ${r==="projector-2"?"selected":""}>Videotykki 2 — Etuseinä oikea (Vertical Right • Lamp On)</option>
                            <option value="pi-output-1" ${r==="pi-output-1"?"selected":""}>Pi 1 (PiPGM 1) — Pysty tai vaaka</option>
                            <option value="pi-output-2" ${r==="pi-output-2"?"selected":""}>Pi 2 (PiPGM 2) — Pysty tai vaaka</option>
                          </optgroup>
                          <optgroup label="Atlona 4x4 Kuvareititin Tulot &amp; Lähdöt">
                            <option value="atlona-input-1" ${r==="atlona-input-1"?"selected":""}>Atlona Tulo 1: Lukupulpetti (Lectern)</option>
                            <option value="atlona-input-2" ${r==="atlona-input-2"?"selected":""}>Atlona Tulo 2: Räkki (Ohjaajan PC / Operator PC)</option>
                            <option value="atlona-input-3" ${r==="atlona-input-3"?"selected":""}>Atlona Tulo 3: Pi 1 (PiPGM 1)</option>
                            <option value="atlona-input-4" ${r==="atlona-input-4"?"selected":""}>Atlona Tulo 4: Pi 2 (PiPGM 2)</option>
                            <option value="atlona-output-1" ${r==="atlona-output-1"?"selected":""}>Atlona Lähtö 1: Videotykki 1 (Vasen / Vertical Left)</option>
                            <option value="atlona-output-2" ${r==="atlona-output-2"?"selected":""}>Atlona Lähtö 2: Videotykki 2 (Oikea / Vertical Right)</option>
                            <option value="atlona-output-5" ${r==="atlona-output-5"?"selected":""}>Atlona Lähtö 5: Videomikseri (Roland / ATEM)</option>
                          </optgroup>
                          <optgroup label="ATEM Kameratulot">
                            <option value="atem-input-1" ${r==="atem-input-1"?"selected":""}>ATEM Tulo 1 (Cam 1 Center)</option>
                            <option value="atem-input-2" ${r==="atem-input-2"?"selected":""}>ATEM Tulo 2 (Cam 2 Pulpit)</option>
                            <option value="atem-input-3" ${r==="atem-input-3"?"selected":""}>ATEM Tulo 3 (Cam 3 Altar)</option>
                            <option value="atem-input-4" ${r==="atem-input-4"?"selected":""}>ATEM Tulo 4 (Input 4 Slides)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- NETWORK & TARGET MAPPING -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Verkko- ja laitemääritykset</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block font-label-sm text-[11px] font-bold text-on-surface">mDNS Isäntänimi (Hostname):</label>
            <input
              type="text"
              id="setup-light-host"
              value="${L(e.host)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
            <span class="text-[10px] text-on-surface-variant">Esim. tally01.local (ensisijainen osoite)</span>
          </div>

          <div class="space-y-1">
            <label class="block font-label-sm text-[11px] font-bold text-on-surface">Varayhteys IP (Fallback IP):</label>
            <input
              type="text"
              id="setup-light-ip"
              value="${L(e.fallbackIp??"")}"
              placeholder="192.168.1.70"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
            <span class="text-[10px] text-on-surface-variant">Käytetään jos mDNS-haku ei vastaa verkossa</span>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="button"
            id="setup-save-btn"
            class="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[12px] font-bold uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">save</span>
            <span>Tallenna ja ota käyttöön</span>
          </button>
        </div>
      </div>
    </div>
  `}function Jo(){const e=document.getElementById("tally-refresh-btn");e&&(e.onclick=()=>void vn());const t=document.getElementById("subtab-live-btn");t&&(t.onclick=()=>{Fe="live",F()});const n=document.getElementById("subtab-setup-btn");if(n&&(n.onclick=()=>{Fe="setup",F()}),Fe==="live"){const a=document.getElementById("tally-cue-target-select");a&&(a.onchange=()=>{gn=a.value}),document.querySelectorAll(".tally-cue-btn").forEach(i=>{i.addEventListener("click",()=>{const r=i.getAttribute("data-cue");r&&Sa(gn,r)})});const s=A==null?void 0:A.querySelectorAll("[data-action]");s==null||s.forEach(i=>{i.addEventListener("click",r=>{r.stopPropagation();const l=i.getAttribute("data-action"),c=i.getAttribute("data-id");if(c)if(l==="state"){const p=i.getAttribute("data-mode");p&&_o(c,p)}else if(l==="call")Vo(c);else if(l==="hold"){const p=i.getAttribute("data-hold")==="true";Ho(c,p)}else if(l==="brightness"){const p=i.getAttribute("data-brightness");Fo(c,p||"medium")}else l==="cycle"&&Go(c)})})}else{const a=A==null?void 0:A.querySelectorAll("[data-select-light]");a==null||a.forEach(x=>{x.addEventListener("click",()=>{const b=x.getAttribute("data-select-light");b&&(Ne=b,F())})});const o=document.getElementById("mode-option-normal"),s=document.getElementById("mode-option-status"),i=document.getElementById("radio-mode-normal"),r=document.getElementById("radio-mode-status"),l=document.getElementById("setup-normal-section"),c=document.getElementById("setup-status-section"),p=x=>{const b=j.find(g=>g.id===Ne);b&&(b.inputMode=x),x==="normal"?(i&&(i.checked=!0),l==null||l.classList.remove("hidden"),c==null||c.classList.add("hidden"),o==null||o.classList.add("border-primary","bg-primary/5"),o==null||o.classList.remove("border-outline-variant/30","bg-surface-container"),s==null||s.classList.remove("border-primary","bg-primary/5"),s==null||s.classList.add("border-outline-variant/30","bg-surface-container")):(r&&(r.checked=!0),l==null||l.classList.add("hidden"),c==null||c.classList.remove("hidden"),s==null||s.classList.add("border-primary","bg-primary/5"),s==null||s.classList.remove("border-outline-variant/30","bg-surface-container"),o==null||o.classList.remove("border-primary","bg-primary/5"),o==null||o.classList.add("border-outline-variant/30","bg-surface-container"))};o==null||o.addEventListener("click",()=>p("normal")),s==null||s.addEventListener("click",()=>p("status")),i==null||i.addEventListener("change",()=>p("normal")),r==null||r.addEventListener("change",()=>p("status"));const d=j.find(x=>x.id===Ne),f=A==null?void 0:A.querySelectorAll("[data-toggle-led]");f==null||f.forEach(x=>{x.addEventListener("click",()=>{const b=Number(x.getAttribute("data-toggle-led")),g=Number(x.getAttribute("data-group-index"));if(!d||!d.segments||!d.segments[g])return;const $=d.segments[g].leds;$.includes(b)?d.segments[g].leds=$.filter(E=>E!==b):(d.segments.forEach((E,M)=>{M!==g&&(E.leds=E.leds.filter(R=>R!==b))}),d.segments[g].leds=[...$,b].sort((E,M)=>E-M)),F()})});const h=A==null?void 0:A.querySelectorAll("input[data-group-field='name']");h==null||h.forEach(x=>{const b=x.closest(".group-card"),g=Number(b==null?void 0:b.getAttribute("data-group-index"));x.addEventListener("input",()=>{var $;($=d==null?void 0:d.segments)!=null&&$[g]&&(d.segments[g].name=x.value)})});const y=A==null?void 0:A.querySelectorAll("select[data-group-field='facet']");y==null||y.forEach(x=>{const b=x.closest(".group-card"),g=Number(b==null?void 0:b.getAttribute("data-group-index"));x.addEventListener("change",()=>{var $;($=d==null?void 0:d.segments)!=null&&$[g]&&(d.segments[g].facet=Wo(x.value),F())})});const w=A==null?void 0:A.querySelectorAll("[data-remove-group]");w==null||w.forEach(x=>{x.addEventListener("click",()=>{const b=Number(x.getAttribute("data-remove-group"));d!=null&&d.segments&&(d.segments.splice(b,1),F())})});const I=document.getElementById("setup-add-group-btn");I&&(I.onclick=()=>{if(!d)return;d.segments||(d.segments=[]);const x=d.segments.length+1,b=new Set;d.segments.forEach(E=>E.leds.forEach(M=>b.add(M)));const g=[0,1,2,3,4,5,6,7,8].find(E=>!b.has(E)),$=g!==void 0?[g]:[];d.segments.push({id:`grp-${Date.now()}`,name:`Ryhmä ${x}`,leds:$,facet:{type:"youtube-stream"}}),F()});const S=A==null?void 0:A.querySelectorAll("[data-preset]");S==null||S.forEach(x=>{x.addEventListener("click",()=>{if(!d)return;const b=x.getAttribute("data-preset");b==="preset-3x3"?d.segments=[{id:"grp-yt",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-enc",name:"Matrox Enkooderi",leds:[3,4,5],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-proj",name:"Videotykki 1 (Vasen)",leds:[6,7,8],facet:{type:"projector",projector:1}}]:b==="preset-flow"?d.segments=[{id:"grp-yt",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-enc",name:"Matrox Enkooderi",leds:[3,4],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-stt",name:"Auditor STT",leds:[5],facet:{type:"stt-state"}},{id:"grp-cc",name:"Tekstitysvirta",leds:[6],facet:{type:"caption-state"}},{id:"grp-proj",name:"Videotykki 1 (Vasen)",leds:[7,8],facet:{type:"projector",projector:1}}]:b==="preset-audio"?d.segments=[{id:"grp-mic",name:"Mikrofoni VAD",leds:[0,1],facet:{type:"stt-state"}},{id:"grp-stt",name:"Auditor STT",leds:[2,3,4],facet:{type:"stt-state"}},{id:"grp-cc",name:"Tekstitykset",leds:[5,6],facet:{type:"caption-state"}},{id:"grp-rad",name:"Nettiradio",leds:[7,8],facet:{type:"atem-streaming"}}]:b==="preset-9split"&&(d.segments=[{id:"g1",name:"YouTube Live",leds:[0],facet:{type:"youtube-stream"}},{id:"g2",name:"Matrox Enc 1",leds:[1],facet:{type:"matrox-encoder",encoder:1}},{id:"g3",name:"Matrox Enc 2",leds:[2],facet:{type:"matrox-encoder",encoder:2}},{id:"g4",name:"ATEM Rec",leds:[3],facet:{type:"atem-recording"}},{id:"g5",name:"Auditor STT",leds:[4],facet:{type:"stt-state"}},{id:"g6",name:"Tekstitykset",leds:[5],facet:{type:"caption-state"}},{id:"g7",name:"Videotykki 1 (Vasen)",leds:[6],facet:{type:"projector",projector:1}},{id:"g8",name:"Lukupulpetti",leds:[7],facet:{type:"atlona-input",input:1}},{id:"g9",name:"Pi 1 (PiPGM 1)",leds:[8],facet:{type:"pi-output",output:1}}]),F(),se("Pika-asetus ladattu!")})});const D=document.getElementById("setup-save-btn");D&&(D.onclick=()=>{const b=(r==null?void 0:r.checked)??!1?"status":"normal",g=document.getElementById("setup-atem-input"),$=Number((g==null?void 0:g.value)??1),E=document.getElementById("setup-light-host"),M=document.getElementById("setup-light-ip"),R=(E==null?void 0:E.value.trim())||`${Ne}.local`,le=(M==null?void 0:M.value.trim())||"",J=d==null?void 0:d.segments;Yo(Ne,b,$,R,le,J)})}}function se(e){const t=document.getElementById("toast"),n=document.getElementById("toast-text");t&&n&&(n.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2800))}const en={};let Ge=null,rt,Zn=!1,H=null,Ie="auto",ve=!1,jt="https://nettiradio.keskuskirkko.fi/live.mp3",mt="keskuskirkko-live",bt="/live.mp3",We=!0,Ke=!0;function Zo(e=window.location.search){const t=new URLSearchParams(e).get("radio"),n=en==null?void 0:en.VITE_RADIO_URL;return(t??n??"/api/v1/radio-relay").replace(/\/+$/,"")}const Qo=Zo();function Oe(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function ht(e,t="",n){var i;const a=`${Qo}${t}`,o={};n!==void 0&&(o["Content-Type"]="application/json");const s=await fetch(a,{method:e,headers:o,body:n!==void 0?JSON.stringify(n):void 0});if(!s.ok){let r=`Radio relay returned ${s.status}`;try{const l=await s.json();(i=l==null?void 0:l.error)!=null&&i.message&&(r=l.error.message)}catch{}throw new Error(r)}return await s.json()}async function xt(){var e,t,n,a,o,s,i,r;try{const l=await ht("GET").catch(()=>null);if(l)H=l,l.streamName&&(mt=l.streamName),l.mode&&(Ie=l.mode),(e=l.state)!=null&&e.streamUrl&&(jt=l.state.streamUrl),(t=l.state)!=null&&t.mountPoint&&(bt=l.state.mountPoint),((n=l.state)==null?void 0:n.soundComingIn)!==void 0&&(We=l.state.soundComingIn),((a=l.state)==null?void 0:a.captionsComingIn)!==void 0&&(Ke=l.state.captionsComingIn);else{try{const c=await fetch("/api/v1/status");if(c.ok){const p=await c.json();((s=(o=p==null?void 0:p.pivoice)==null?void 0:o.voice)==null?void 0:s.open)!==void 0&&(We=!!p.pivoice.voice.open),((r=(i=p==null?void 0:p.pivoice)==null?void 0:i.transcription)==null?void 0:r.processed)>0&&(Ke=!0)}}catch{}H||(H={configured:!0,reachable:!0,streamName:mt,mode:Ie,state:{running:!1,streaming:!1,listeners:0,uptimeSeconds:0,streamUrl:jt,mountPoint:bt,bitrate:"128 kbps MP3",soundComingIn:We,captionsComingIn:Ke}})}}catch{}finally{he()}}function es(e){Zn=e,e?(xt(),rt||(rt=window.setInterval(()=>{Zn&&xt()},3e3))):rt&&(clearInterval(rt),rt=void 0)}function ts(e){Ge=e,he()}async function ns(e){Ie=e;try{await ht("POST","/mode",{mode:e}).catch(()=>null),Qe(`Nettiradion tila: ${e.toUpperCase()}`)}catch{Qe(`Tila asetettu: ${e.toUpperCase()}`)}he()}async function as(){if(!ve){ve=!0,he();try{await ht("POST","/start"),Qe("Nettiradio käynnistetty!"),xt()}catch(e){alert("Nettiradion käynnistys epäonnistui: "+(e instanceof Error?e.message:String(e)))}finally{ve=!1,he()}}}async function os(){if(!ve){ve=!0,he();try{await ht("POST","/stop"),Qe("Nettiradio pysäytetty."),xt()}catch(e){alert("Nettiradion pysäytys epäonnistui: "+(e instanceof Error?e.message:String(e)))}finally{ve=!1,he()}}}async function ss(e,t){mt=e,bt=t;try{await ht("PUT","/settings",{streamName:e,mountPoint:t}).catch(()=>null),Qe("Nettiradion asetukset tallennettu!")}catch{Qe("Asetukset päivitetty paikallisesti")}he()}function he(){var a,o,s;if(!Ge)return;const e=((a=H==null?void 0:H.state)==null?void 0:a.streaming)??((o=H==null?void 0:H.state)==null?void 0:o.running)??!1,t=(H==null?void 0:H.reachable)??!1,n=((s=H==null?void 0:H.state)==null?void 0:s.listeners)??0;Ge.innerHTML=`
    <div class="space-y-space-md">
      <!-- TOP STATUS STRIP -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">radio</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Web Radio Relay &amp; Setup</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${e?"bg-green-600 text-white animate-pulse":"bg-surface-container-highest text-on-surface-variant"}">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>${e?"ON AIR / STREAMING":"STANDBY"}</span>
              </span>
            </div>
            <span class="font-label-sm text-[10px] text-on-surface-variant">Stream: <span class="font-mono font-semibold">${Oe(mt)}</span></span>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${t?"bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30":"bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
            ${t?"Relay Online":"Relay Standby"}
          </span>
          <button type="button" id="radio-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä radio">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      <!-- INGEST & PIPELINE TELEMETRY BADGES (Sound coming in, Captions coming in) -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Live Ingest Status</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Sound coming in indicator -->
          <div class="p-2.5 rounded-lg border flex items-center justify-between ${We?"bg-green-600/10 border-green-500/30 text-green-700 dark:text-green-300":"bg-surface-container border-outline-variant/30 text-on-surface-variant"}">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${We?"bg-green-600 animate-pulse":"bg-outline-variant"}"></span>
              <div>
                <span class="font-bold text-[12px] block">Sound coming in</span>
                <span class="text-[10px] opacity-80">Äänisignaali mikrofonista ja mikseristä</span>
              </div>
            </div>
            <span class="font-mono text-[11px] font-bold uppercase">${We?"ACTIVE":"SILENT"}</span>
          </div>

          <!-- Captions coming in indicator -->
          <div class="p-2.5 rounded-lg border flex items-center justify-between ${Ke?"bg-primary/10 border-primary/30 text-primary":"bg-surface-container border-outline-variant/30 text-on-surface-variant"}">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${Ke?"bg-primary animate-pulse":"bg-outline-variant"}"></span>
              <div>
                <span class="font-bold text-[12px] block">Captions coming in</span>
                <span class="text-[10px] opacity-80">Reaaliaikainen Auditor-tekstitys jakelussa</span>
              </div>
            </div>
            <span class="font-mono text-[11px] font-bold uppercase">${Ke?"FLOWING":"WAITING"}</span>
          </div>
        </div>
      </div>

      <!-- BROADCAST TRANSMISSION & AUTO MODES -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Lähetyksen tila ja ohjaus</h3>

        <!-- Mode Toggles: On / Off / Auto -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Lähetystila (Auto = lähettää automaattisesti puheella):</span>
            <span class="font-bold text-on-surface uppercase">${Ie}</span>
          </div>
          <div class="grid grid-cols-3 gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            <button type="button" data-radio-mode="on" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${Ie==="on"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              On
            </button>
            <button type="button" data-radio-mode="off" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${Ie==="off"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              Off
            </button>
            <button type="button" data-radio-mode="auto" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${Ie==="auto"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              Auto
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            id="radio-start-btn"
            ${ve||e?"disabled":""}
            class="h-11 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[12px] font-bold uppercase transition-all shadow-sm ${e?"bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed":"bg-primary hover:bg-primary/90 text-on-primary active:scale-95"}">
            <span class="material-symbols-outlined text-[18px]">podcasts</span>
            <span>Käynnistä lähetys</span>
          </button>

          <button
            type="button"
            id="radio-stop-btn"
            ${ve||!e?"disabled":""}
            class="h-11 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[12px] font-bold uppercase transition-all shadow-sm ${e?"bg-error hover:bg-error/90 text-on-error active:scale-95":"bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[18px]">stop_circle</span>
            <span>Pysäytä lähetys</span>
          </button>
        </div>
      </div>

      <!-- STREAM CONFIGURATION & SETUP -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">settings</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Web Radio Setup</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant">Icecast / Shoutcast Relay</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-body-sm">
          <div class="space-y-1">
            <label class="block font-bold text-on-surface">Lähetyksen nimi (Stream Name):</label>
            <input
              type="text"
              id="radio-input-name"
              value="${Oe(mt)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
          </div>

          <div class="space-y-1">
            <label class="block font-bold text-on-surface">Mount Point:</label>
            <input
              type="text"
              id="radio-input-mount"
              value="${Oe(bt)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="button"
            id="radio-save-setup-btn"
            class="h-9 px-4 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">save</span>
            <span>Tallenna määritykset</span>
          </button>
        </div>
      </div>

      <!-- CONFIDENCE AUDIO MONITOR (AUDIO PLAYER) -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">headphones</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Audio Confidence Monitor</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Live Feed</span>
        </div>

        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
          <div class="flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant">
            <span>Kuuntele lähetystä selaimessa (varmistus):</span>
            <span class="font-mono text-[10px] text-primary truncate max-w-[200px]">${Oe(jt)}</span>
          </div>

          <audio id="radio-audio-player" class="w-full h-10 rounded-lg outline-none" controls preload="none">
            <source src="${Oe(jt)}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        </div>

        <div class="flex items-center justify-between text-[10px] font-label-sm text-on-surface-variant">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-primary">volume_up</span>
            <span>Pidä kuulokkeet kytkettynä mikseripöydässä</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-primary">speed</span>
            <span>Bitrate: 128 kbps CBR</span>
          </span>
        </div>
      </div>

      <!-- STREAM TELEMETRY METRICS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Stream Statistics</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Listeners</span>
            <span class="font-bold text-on-surface font-mono text-[14px]">${n}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Mount Point</span>
            <span class="font-bold text-on-surface font-mono text-[12px] truncate">${Oe(bt)}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Server Format</span>
            <span class="font-bold text-on-surface font-mono text-[12px]">Icecast2 / MP3</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Status</span>
            <span class="font-bold font-mono text-[12px] ${e?"text-green-600":"text-on-surface-variant"}">
              ${e?"TRANSMITTING":"IDLE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,is()}function is(){const e=document.getElementById("radio-refresh-btn");e&&(e.onclick=()=>void xt());const t=document.getElementById("radio-start-btn");t&&(t.onclick=()=>void as());const n=document.getElementById("radio-stop-btn");n&&(n.onclick=()=>void os());const a=Ge==null?void 0:Ge.querySelectorAll("[data-radio-mode]");a==null||a.forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-radio-mode");i&&ns(i)})});const o=document.getElementById("radio-save-setup-btn");o&&(o.onclick=()=>{const s=document.getElementById("radio-input-name"),i=document.getElementById("radio-input-mount"),r=(s==null?void 0:s.value.trim())||"keskuskirkko-live",l=(i==null?void 0:i.value.trim())||"/live.mp3";ss(r,l)})}function Qe(e){const t=document.getElementById("toast"),n=document.getElementById("toast-text");t&&n&&(n.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2800))}const tn={},Q=[{id:"kapula1",name:"Kapula 1",role:"Liturgi / Pappi",group:"handheld",channelIndex:0,profile:"speech"},{id:"kapula2",name:"Kapula 2",role:"Kanttori / Avustaja",group:"handheld",channelIndex:1,profile:"speech"},{id:"kapula3",name:"Kapula 3",role:"Lukija / Tekstinlukija",group:"handheld",channelIndex:2,profile:"speech"},{id:"kapula4",name:"Kapula 4",role:"Vierailija / Varakapula",group:"handheld",channelIndex:3,profile:"speech"},{id:"madonna1",name:"Madonna 1",role:"Pappi / Liturgi",group:"madonna",channelIndex:4,profile:"speech"},{id:"madonna2",name:"Madonna 2",role:"Avustava pappi",group:"madonna",channelIndex:5,profile:"speech"},{id:"madonna3",name:"Madonna 3",role:"Kanttori",group:"madonna",channelIndex:6,profile:"speech"},{id:"madonna4",name:"Madonna 4",role:"Nuorisotyöntekijä",group:"madonna",channelIndex:7,profile:"speech"},{id:"madonna5",name:"Madonna 5",role:"Varamadonna 5",group:"madonna",channelIndex:8,profile:"speech"},{id:"madonna6",name:"Madonna 6",role:"Varamadonna 6",group:"madonna",channelIndex:9,profile:"speech"},{id:"madonna7",name:"Madonna 7",role:"Varamadonna 7",group:"madonna",channelIndex:10,profile:"speech"},{id:"madonna8",name:"Madonna 8",role:"Varamadonna 8",group:"madonna",channelIndex:11,profile:"speech"},{id:"madonna9",name:"Madonna 9",role:"Varamadonna 9",group:"madonna",channelIndex:12,profile:"speech"},{id:"madonna10",name:"Madonna 10",role:"Varamadonna 10",group:"madonna",channelIndex:13,profile:"speech"},{id:"wired1",name:"Saarnatuoli",role:"Kiinteä saarnamikki",group:"wired",channelIndex:14,profile:"speech"},{id:"wired2",name:"Alttari Vasen",role:"Alttarimikki V",group:"wired",channelIndex:15,profile:"speech"},{id:"wired3",name:"Alttari Oikea",role:"Alttarimikki O",group:"wired",channelIndex:16,profile:"speech"},{id:"wired4",name:"Lukupulpetti",role:"Tekstinlukupulpetti",group:"wired",channelIndex:17,profile:"speech"},{id:"wired5",name:"Kuoro Vasen",role:"Kuoromikki V",group:"wired",channelIndex:18,profile:"choir"},{id:"wired6",name:"Kuoro Oikea",role:"Kuoromikki O",group:"wired",channelIndex:19,profile:"choir"},{id:"wired7",name:"AV09 Vasen",role:"Lattiarasia 1 (piano)",group:"wired",channelIndex:20,profile:"piano"},{id:"wired8",name:"AV09 Oikea",role:"Lattiarasia 2 (kitara)",group:"wired",channelIndex:21,profile:"guitar"},{id:"wired9",name:"AV10 Vasen",role:"Lattiarasia 3 (rummut)",group:"wired",channelIndex:22,profile:"drums"},{id:"wired10",name:"AV10 Oikea",role:"Lattiarasia 4 (bändi)",group:"wired",channelIndex:23,profile:"custom"},{id:"wired11",name:"Urut",role:"Pääurut / parvi",group:"wired",channelIndex:24,profile:"organ"},{id:"wired12",name:"Parvi Ambient",role:"Tilaääni (vain striimi/radio)",group:"wired",channelIndex:25,profile:"ambient"}],Ca=["kapula1","kapula2","madonna1","wired1","wired2","wired3","wired4","wired11","wired12"],rs=["kapula1","kapula2","kapula3","kapula4","madonna1","madonna2","wired7","wired8","wired9","wired10","wired11","wired12"],Ia="picontrol_visible_mics",Ma="picontrol_sound_active_mix";let yn=null,N=localStorage.getItem(Ma)||"sali",et=cs(),ls=ps(),P=null;const tt=new Map,B={sali:{volumePercent:80,isMuted:!1},striimi:{volumePercent:75,isMuted:!1},webradio:{volumePercent:85,isMuted:!1}};let gt=!1,Ye=!0;function cs(){try{const e=localStorage.getItem(Ia);if(e){const t=JSON.parse(e);if(Array.isArray(t)&&t.length>0)return new Set(t)}}catch{}return new Set(Ca)}function ds(e){et=e,localStorage.setItem(Ia,JSON.stringify([...e]))}function ps(e=window.location.search){const t=new URLSearchParams(e).get("sound"),n=tn==null?void 0:tn.VITE_PISOUND_API_URL;return t?t.replace(/\/+$/,""):n?n.replace(/\/+$/,""):`http://${typeof window<"u"&&window.location?window.location.hostname:"127.0.0.1"}:3300`}function qe(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function ye(e,t,n){const a=`${ls}${t}`;try{const o=await fetch(a,{method:e,headers:n!==void 0?{"Content-Type":"application/json"}:{},body:n!==void 0?JSON.stringify(n):void 0});return o.ok?await o.json():(console.warn(`[SoundTab] API call ${e} ${t} failed with ${o.status}`),null)}catch(o){return console.warn(`[SoundTab] API call ${e} ${t} error:`,o),null}}function us(e,t){yn=e,t&&(P=t);for(const n of Q)tt.set(n.id,{id:n.id,name:n.name,role:n.role,profile:n.profile,volumePercent:n.id==="wired12"&&N==="sali"?0:75,isOn:n.id==="wired12"&&N==="sali"?!1:n.id==="kapula1"||n.id==="wired1"||n.id==="wired3",peakDbfs:-60,signalPresent:!1,isSolo:!1});Aa(),wt()}function fs(e){e&&wt()}async function wt(){const e=await ye("GET","/api/v1/mixes");if(e!=null&&e.masterStates)for(const n of e.masterStates)B[n.id]&&(B[n.id]={volumePercent:n.volumePercent,isMuted:n.isMuted});const t=await ye("GET",`/api/v1/mixes/${N}`);if(t!=null&&t.channels)for(const[n,a]of Object.entries(t.channels)){const o=tt.get(n);o&&(o.isOn=a.enabled,o.volumePercent=a.volumePercent)}gt=!0,Ye=!1,Ln(),Ba()}function ms(e){if(!e)return;gt=!!e.connected,Ye=!!e.stale;const t=document.getElementById("sound-conn-pill");if(t&&(gt&&!Ye?(t.className="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1",t.innerHTML='<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Live DSP</span>'):(t.className="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1",t.innerHTML=`<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span><span>${Ye?"Stale":"Offline"}</span>`)),Array.isArray(e.mixes))for(const n of e.mixes)B[n.id]&&(B[n.id].volumePercent=n.masterVolume,B[n.id].isMuted=n.masterMuted,Pa(n.id));if(Array.isArray(e.channels)){const n=typeof e.activeTalkersMask=="number"?e.activeTalkersMask:0;for(const a of e.channels){const o=a.channelIndex,i=(typeof a.peakMilliDbfs=="number"?a.peakMilliDbfs:-6e4)/1e3,r=!!a.signalPresent||(n&1<<o)!==0,l=Q[o];if(l){const f=tt.get(l.id);f&&(f.peakDbfs=i,f.signalPresent=r,a.mixSends&&a.mixSends[N]&&(f.isOn=a.mixSends[N].enabled,f.volumePercent=a.mixSends[N].volumePercent))}const c=document.getElementById(`sound-vu-bar-${o}`),p=document.getElementById(`sound-vu-text-${o}`),d=document.getElementById(`sound-talker-${o}`);if(c){const f=Math.max(0,Math.min(100,Math.round((i+60)/60*100)));c.style.width=`${f}%`,i>=-6?c.className="h-full bg-red-500 transition-all duration-75":i>=-18?c.className="h-full bg-amber-400 transition-all duration-75":c.className="h-full bg-emerald-500 transition-all duration-75"}p&&(p.textContent=i<=-58?"–∞":`${i.toFixed(1)} dB`),d&&(r?d.className="w-2 h-2 rounded-full bg-emerald-500 animate-ping":d.className="w-2 h-2 rounded-full bg-outline-variant/40")}}}function Pa(e){const t=B[e];if(!t)return;const n=document.getElementById(`sound-master-fader-${e}`),a=document.getElementById(`sound-master-val-${e}`),o=document.getElementById(`sound-master-mute-${e}`);n&&document.activeElement!==n&&(n.value=String(t.volumePercent)),a&&(a.textContent=`${t.volumePercent}%`),o&&(t.isMuted?(o.className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-label-sm text-[11px] font-bold uppercase shadow-sm flex items-center gap-1",o.innerHTML='<span class="material-symbols-outlined text-[15px]">volume_off</span><span>MUTED</span>'):(o.className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase flex items-center gap-1",o.innerHTML='<span class="material-symbols-outlined text-[15px]">volume_up</span><span>UNMUTED</span>'))}function Aa(){yn&&(yn.innerHTML=`
    <div class="space-y-space-md select-none">
      <!-- 1. TOP MIXER HEADER STRIP -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">tune</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Äänimikseri</span>
              <span id="sound-conn-pill" class="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${gt&&!Ye?"bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1":"bg-surface-container-highest text-on-surface-variant flex items-center gap-1"}">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>${gt&&!Ye?"Live DSP":"Standby"}</span>
              </span>
            </div>
            <span class="font-label-sm text-[10px] text-on-surface-variant">BSS London BLU-100 &bull; Multi-Mix</span>
          </div>
        </div>

        <!-- MIX TOGGLE PILLS -->
        <div class="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/30">
          <button type="button" id="sound-mix-sali-btn" class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${N==="sali"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:bg-surface-container-highest"}">
            <span class="material-symbols-outlined text-[16px]">church</span>
            <span>Sali (PA)</span>
          </button>
          <button type="button" id="sound-mix-striimi-btn" class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${N==="striimi"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:bg-surface-container-highest"}">
            <span class="material-symbols-outlined text-[16px]">smart_display</span>
            <span>Striimi</span>
          </button>
        </div>

        <!-- CHANNEL VISIBILITY CONFIG BUTTON & RESET BUTTON -->
        <div class="flex items-center gap-1.5">
          <button type="button" id="sound-reset-btn" class="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 text-on-surface border border-outline-variant/40 font-label-sm text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all active:scale-95" title="Palauta kirkon oletusasetukset">
            <span class="material-symbols-outlined text-[16px] text-amber-500">restart_alt</span>
            <span>Palauta oletukset</span>
          </button>
          <button type="button" id="sound-config-channels-btn" class="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 font-label-sm text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all active:scale-95">
            <span class="material-symbols-outlined text-[16px] text-primary">view_column</span>
            <span>Kanavat (${et.size}/${Q.length})</span>
          </button>
          <button type="button" id="sound-refresh-btn" class="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä mikseri">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      <!-- ACTIVE MIX NOTICE BANNER -->
      <div class="px-3 py-2 rounded-lg ${N==="sali"?"bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200":"bg-primary/10 border border-primary/20 text-primary"} flex items-center justify-between text-[11px]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">${N==="sali"?"campaign":"podcasts"}</span>
          <span>Säädetään miksausta: <strong>${N==="sali"?"Kirkkosali (PA-kaiuttimet)":"Striimi (YouTube Broadcast)"}</strong></span>
        </div>
        <span class="text-[10px] opacity-80">${N==="sali"?"Parvi Ambient lukittu 0% kiertovaaran vuoksi":"Parvi Ambient aktiivinen taustaäänenä"}</span>
      </div>

      <!-- 2. MASTER OUTPUTS BAR -->
      <div id="sound-master-section"></div>

      <!-- 3. CHANNEL STRIPS CONTAINER -->
      <div id="sound-channel-grid"></div>
    </div>

    <!-- 4. CHANNEL VISIBILITY CONFIGURATION MODAL -->
    <dialog id="sound-channels-modal" class="broadcast-dialog" closedby="closerequest" aria-labelledby="sound-config-modal-title">
      <div class="bg-surface-container-low rounded-2xl w-full max-w-lg p-4 shadow-xl border border-outline-variant/40 space-y-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant/30">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">checklist</span>
            </div>
            <div>
              <h4 class="font-headline-sm text-[15px] font-bold text-on-surface leading-none" id="sound-config-modal-title">Valitse näkyvät kanavat</h4>
              <span class="font-label-sm text-[10px] text-on-surface-variant uppercase">Miksausnäkymän räätälöinti</span>
            </div>
          </div>
          <button type="button" class="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center" id="sound-modal-close-x">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- QUICK PRESET BUTTONS -->
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-surface-container border border-outline-variant/20">
          <span class="text-[10px] font-bold uppercase text-on-surface-variant mr-1">Pikavalinnat:</span>
          <button type="button" id="sound-preset-messu-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-[11px] font-bold transition-all">
            Messu (9)
          </button>
          <button type="button" id="sound-preset-bandi-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-[11px] font-bold transition-all">
            Bändi / Musiikki (12)
          </button>
          <button type="button" id="sound-preset-all-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-[11px] font-bold transition-all">
            Kaikki (26)
          </button>
          <button type="button" id="sound-preset-clear-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-error-container hover:text-on-error text-on-surface-variant text-[11px] font-bold transition-all ml-auto">
            Tyhjennä
          </button>
        </div>

        <!-- CHECKBOXES GROUPED -->
        <div class="max-h-[60vh] overflow-y-auto pr-1 space-y-3" id="sound-modal-checkboxes"></div>

        <div class="flex justify-between items-center pt-2 border-t border-outline-variant/20">
          <span class="text-[11px] text-on-surface-variant" id="sound-modal-count-label"></span>
          <div class="flex gap-2">
            <button type="button" id="sound-modal-cancel-btn" class="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-[11px] font-bold uppercase">Peruuta</button>
            <button type="button" id="sound-modal-save-btn" class="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold uppercase shadow-sm">Tallenna ja ota käyttöön</button>
          </div>
        </div>
      </div>
    </dialog>

    <!-- 5. RESET CONFIRMATION MODAL -->
    <dialog id="sound-reset-modal" class="broadcast-dialog" closedby="closerequest" aria-labelledby="sound-reset-modal-title">
      <div class="bg-surface-container-low rounded-2xl w-full max-w-md p-5 shadow-xl border border-outline-variant/40 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">restart_alt</span>
          </div>
          <div>
            <h4 class="font-headline-sm text-[16px] font-bold text-on-surface" id="sound-reset-modal-title">Palautetaanko oletukset?</h4>
            <span class="font-label-sm text-[11px] text-on-surface-variant">BSS BLU-100 & pisound -oletustilat</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-[12px] text-on-surface-variant space-y-2 leading-relaxed">
          <p>Tämä toiminto palauttaa kaikki 26 mikrofoni- ja instrumenttikanavaa sekä master-lähdöt kirkon kalibroituihin oletusarvoihin:</p>
          <ul class="list-disc list-inside space-y-0.5 text-[11px] text-on-surface">
            <li>Kutsuu <strong>BLU-100 Preset 2</strong>:n (langattomien mikien turvallinen -10 dB referenssitaso).</li>
            <li>Palauttaa Sali-, Striimi- ja Nettiradio-masterit oletuksiin.</li>
            <li>Asettaa puhemikit (Saarna, Alttari, Kapulat) oletustiloihin.</li>
          </ul>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button type="button" id="sound-reset-cancel-btn" class="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[11px] font-bold uppercase transition-all">
            Peruuta
          </button>
          <button type="button" id="sound-reset-confirm-btn" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase shadow-sm transition-all flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Kyllä, palauta oletukset</span>
          </button>
        </div>
      </div>
    </dialog>
  `,bs(),Ba(),Ln())}function bs(){var e,t,n,a,o,s,i,r,l,c,p,d,f,h;(e=document.getElementById("sound-mix-sali-btn"))==null||e.addEventListener("click",()=>Qn("sali")),(t=document.getElementById("sound-mix-striimi-btn"))==null||t.addEventListener("click",()=>Qn("striimi")),(n=document.getElementById("sound-config-channels-btn"))==null||n.addEventListener("click",hs),(a=document.getElementById("sound-reset-btn"))==null||a.addEventListener("click",xs),(o=document.getElementById("sound-refresh-btn"))==null||o.addEventListener("click",()=>{wt(),P==null||P("Mikserin tila päivitetty")}),(s=document.getElementById("sound-modal-close-x"))==null||s.addEventListener("click",hn),(i=document.getElementById("sound-modal-cancel-btn"))==null||i.addEventListener("click",hn),(r=document.getElementById("sound-modal-save-btn"))==null||r.addEventListener("click",ws),(l=document.getElementById("sound-reset-cancel-btn"))==null||l.addEventListener("click",La),(c=document.getElementById("sound-reset-confirm-btn"))==null||c.addEventListener("click",()=>{gs()}),(p=document.getElementById("sound-preset-messu-btn"))==null||p.addEventListener("click",()=>Ct(new Set(Ca))),(d=document.getElementById("sound-preset-bandi-btn"))==null||d.addEventListener("click",()=>Ct(new Set(rs))),(f=document.getElementById("sound-preset-all-btn"))==null||f.addEventListener("click",()=>Ct(new Set(Q.map(y=>y.id)))),(h=document.getElementById("sound-preset-clear-btn"))==null||h.addEventListener("click",()=>Ct(new Set))}function xs(){const e=document.getElementById("sound-reset-modal");e==null||e.showModal()}function La(){const e=document.getElementById("sound-reset-modal");e==null||e.close()}async function gs(){La();const e=await ye("POST","/api/v1/reset");e&&e.ok!==!1?P==null||P("Oletustilat palautettu (BLU-100 Preset 2 -10 dB)"):P==null||P("Oletusten palautus epäonnistui"),await wt()}function Qn(e){N=e,localStorage.setItem(Ma,e),Aa(),wt(),P==null||P(`Valittu miksaus: ${e==="sali"?"Sali (PA)":"Striimi"}`)}function Ba(){var t,n,a,o,s,i,r,l,c,p,d,f;const e=document.getElementById("sound-master-section");e&&(e.innerHTML=`
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <!-- 1. SALI MASTER -->
      <div class="p-3 rounded-xl bg-surface-container-low border ${N==="sali"?"border-primary/50 shadow-sm":"border-outline-variant/30"} space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">church</span>
            <span class="font-bold text-[13px] text-on-surface">Sali Master (PA)</span>
          </div>
          <span class="font-mono text-[12px] font-bold text-primary" id="sound-master-val-sali">${((t=B.sali)==null?void 0:t.volumePercent)??80}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="range" id="sound-master-fader-sali" min="0" max="100" value="${((n=B.sali)==null?void 0:n.volumePercent)??80}" class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer">
          <button type="button" id="sound-master-mute-sali" class="px-2.5 py-1 rounded-lg ${(a=B.sali)!=null&&a.isMuted?"bg-red-600 text-white":"bg-surface-container-high text-on-surface"} font-label-sm text-[10px] font-bold uppercase shrink-0">
            ${(o=B.sali)!=null&&o.isMuted?"MUTED":"ON"}
          </button>
        </div>
      </div>

      <!-- 2. STRIIMI MASTER -->
      <div class="p-3 rounded-xl bg-surface-container-low border ${N==="striimi"?"border-primary/50 shadow-sm":"border-outline-variant/30"} space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">smart_display</span>
            <span class="font-bold text-[13px] text-on-surface">Striimi Master</span>
          </div>
          <span class="font-mono text-[12px] font-bold text-primary" id="sound-master-val-striimi">${((s=B.striimi)==null?void 0:s.volumePercent)??75}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="range" id="sound-master-fader-striimi" min="0" max="100" value="${((i=B.striimi)==null?void 0:i.volumePercent)??75}" class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer">
          <button type="button" id="sound-master-mute-striimi" class="px-2.5 py-1 rounded-lg ${(r=B.striimi)!=null&&r.isMuted?"bg-red-600 text-white":"bg-surface-container-high text-on-surface"} font-label-sm text-[10px] font-bold uppercase shrink-0">
            ${(l=B.striimi)!=null&&l.isMuted?"MUTED":"ON"}
          </button>
        </div>
      </div>

      <!-- 3. WEB RADIO MASTER (RADIO VOL, Obj 360) -->
      <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">radio</span>
            <span class="font-bold text-[13px] text-on-surface">Nettiradio Master</span>
          </div>
          <span class="font-mono text-[12px] font-bold text-primary" id="sound-master-val-webradio">${((c=B.webradio)==null?void 0:c.volumePercent)??85}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="range" id="sound-master-fader-webradio" min="0" max="100" value="${((p=B.webradio)==null?void 0:p.volumePercent)??85}" class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer">
          <button type="button" id="sound-master-mute-webradio" class="px-2.5 py-1 rounded-lg ${(d=B.webradio)!=null&&d.isMuted?"bg-red-600 text-white":"bg-surface-container-high text-on-surface"} font-label-sm text-[10px] font-bold uppercase shrink-0">
            ${(f=B.webradio)!=null&&f.isMuted?"MUTED":"ON"}
          </button>
        </div>
      </div>
    </div>
  `,nn("sali"),nn("striimi"),nn("webradio"))}function nn(e){const t=document.getElementById(`sound-master-fader-${e}`),n=document.getElementById(`sound-master-val-${e}`),a=document.getElementById(`sound-master-mute-${e}`);t==null||t.addEventListener("input",()=>{const o=Number(t.value);n&&(n.textContent=`${o}%`),B[e]&&(B[e].volumePercent=o)}),t==null||t.addEventListener("change",()=>{const o=Number(t.value);ye("POST",`/api/v1/mixes/${e}/master/volume`,{volumePercent:o})}),a==null||a.addEventListener("click",()=>{var i;const s=!(((i=B[e])==null?void 0:i.isMuted)??!1);B[e]&&(B[e].isMuted=s),Pa(e),ye("POST",`/api/v1/mixes/${e}/master/mute`,{muted:s}),P==null||P(`${e.toUpperCase()} Master ${s?"mykistetty":"avattu"}`)})}function Ln(){const e=document.getElementById("sound-channel-grid");if(!e)return;const t=Q.filter(n=>et.has(n.id));if(t.length===0){e.innerHTML=`
      <div class="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <span class="material-symbols-outlined text-[36px] text-on-surface-variant/50">view_column</span>
        <h4 class="font-headline-sm text-[15px] font-bold text-on-surface">Ei valittuja kanavia</h4>
        <p class="text-[12px] text-on-surface-variant max-w-sm mx-auto">Valitse mikserinäkymässä näytettävät mikrofonit ja instrumenttikanavat painamalla ylhäältä <strong>"Kanavat"</strong>.</p>
        <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase shadow-sm" onclick="document.getElementById('sound-config-channels-btn').click()">
          Valitse kanavat
        </button>
      </div>
    `;return}e.innerHTML=`
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      ${t.map(n=>vs(n)).join("")}
    </div>
  `;for(const n of t)ys(n)}function vs(e){const t=tt.get(e.id),n=(t==null?void 0:t.isOn)??!1,a=(t==null?void 0:t.volumePercent)??75,o=e.id==="wired12"&&N==="sali";return`
    <div class="p-3 rounded-xl bg-surface-container-low border ${n?"border-outline-variant/50 shadow-sm":"border-outline-variant/20 opacity-80"} flex flex-col justify-between space-y-2 relative" id="sound-strip-${e.id}">
      <!-- HEADER -->
      <div class="flex items-start justify-between gap-1">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="w-2 h-2 rounded-full bg-outline-variant/40 shrink-0" id="sound-talker-${e.channelIndex}"></span>
          <div class="min-w-0">
            <span class="font-bold text-[13px] text-on-surface truncate block leading-tight">${qe(e.name)}</span>
            <span class="text-[10px] text-on-surface-variant truncate block">${qe(e.role)}</span>
          </div>
        </div>

        <span class="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-surface-container-high text-on-surface-variant shrink-0">
          ${qe(e.profile)}
        </span>
      </div>

      <!-- AMBIENT FEEDBACK LOCK NOTICE FOR SALI -->
      ${o?`
        <div class="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-medium leading-tight">
          🚫 Estetty kirkkosaliin (kiertoeste)
        </div>
      `:""}

      <!-- VU METER BAR -->
      <div class="space-y-1">
        <div class="flex justify-between text-[10px] font-mono text-on-surface-variant">
          <span>VU</span>
          <span id="sound-vu-text-${e.channelIndex}">–∞</span>
        </div>
        <div class="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <div id="sound-vu-bar-${e.channelIndex}" class="h-full bg-emerald-500 transition-all duration-75" style="width: 0%"></div>
        </div>
      </div>

      <!-- FADER SLIDER (0 - 100%) -->
      <div class="space-y-1 pt-1">
        <div class="flex justify-between items-center text-[11px]">
          <span class="font-label-sm text-[10px] text-on-surface-variant uppercase">Taso</span>
          <span class="font-mono font-bold text-on-surface" id="sound-fader-val-${e.id}">${a}%</span>
        </div>
        <input type="range" id="sound-fader-${e.id}" min="0" max="100" value="${a}" ${o?"disabled":""} class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer disabled:opacity-40">
      </div>

      <!-- ACTION BUTTONS: ON/MUTE & SOLO -->
      <div class="grid grid-cols-2 gap-1.5 pt-1">
        <button type="button" id="sound-mute-btn-${e.id}" ${o?"disabled":""} class="h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-30 ${n?"bg-emerald-600 text-white":"bg-surface-container-high text-on-surface-variant"}">
          <span class="material-symbols-outlined text-[16px]">${n?"mic":"mic_off"}</span>
          <span>${n?"ON":"MUTE"}</span>
        </button>

        <button type="button" id="sound-solo-btn-${e.id}" class="h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 bg-surface-container-high text-on-surface hover:bg-surface-container-highest">
          <span class="material-symbols-outlined text-[15px]">headphones</span>
          <span>SOLO</span>
        </button>
      </div>
    </div>
  `}function ys(e){const t=document.getElementById(`sound-fader-${e.id}`),n=document.getElementById(`sound-fader-val-${e.id}`),a=document.getElementById(`sound-mute-btn-${e.id}`),o=document.getElementById(`sound-solo-btn-${e.id}`);t==null||t.addEventListener("input",()=>{const s=Number(t.value);n&&(n.textContent=`${s}%`);const i=tt.get(e.id);i&&(i.volumePercent=s)}),t==null||t.addEventListener("change",()=>{const s=Number(t.value);ye("POST",`/api/v1/mixes/${N}/channels/${e.id}`,{volumePercent:s})}),a==null||a.addEventListener("click",()=>{const s=tt.get(e.id);if(!s)return;const i=!s.isOn;s.isOn=i,i?(a.className="h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-xs bg-emerald-600 text-white",a.innerHTML='<span class="material-symbols-outlined text-[16px]">mic</span><span>ON</span>'):(a.className="h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-xs bg-surface-container-high text-on-surface-variant",a.innerHTML='<span class="material-symbols-outlined text-[16px]">mic_off</span><span>MUTE</span>'),ye("POST",`/api/v1/mixes/${N}/channels/${e.id}/toggle`),P==null||P(`${e.name} (${N==="sali"?"Sali":"Striimi"}) ${i?"avattu":"mykistetty"}`)}),o==null||o.addEventListener("click",()=>{ye("POST",`/api/v1/mics/${e.id}/solo`),P==null||P(`Solo aktivoitu: ${e.name}`)})}let Ae=new Set;function hs(){const e=document.getElementById("sound-channels-modal");e&&(Ae=new Set(et),Oa(),Bn(),e.showModal())}function hn(){const e=document.getElementById("sound-channels-modal");e==null||e.close()}function ws(){ds(Ae),hn(),Ln();const e=document.getElementById("sound-config-channels-btn");e&&(e.innerHTML=`
      <span class="material-symbols-outlined text-[16px] text-primary">view_column</span>
      <span>Kanavat (${et.size}/${Q.length})</span>
    `),P==null||P(`Valittu ${et.size} kanavaa näkymään`)}function Ct(e){Ae=e,Oa(),Bn()}function Bn(){const e=document.getElementById("sound-modal-count-label");e&&(e.textContent=`Valittuna ${Ae.size} / ${Q.length} kanavaa`)}function Oa(){const e=document.getElementById("sound-modal-checkboxes");if(!e)return;const t=[{key:"handheld",title:"Langattomat kapulat (1-4)",icon:"mic",channels:Q.filter(n=>n.group==="handheld")},{key:"madonna",title:"Langattomat madonnat (1-10)",icon:"headset_mic",channels:Q.filter(n=>n.group==="madonna")},{key:"sanctuary",title:"Kiinteät salimikit (Saarna, Alttari, Lukupulpetti, Kuoro)",icon:"church",channels:Q.filter(n=>n.group==="wired"&&n.channelIndex<=19)},{key:"drops",title:"Lattiarasiat & Urut / Parvi (AV09, AV10, Urut, Ambient)",icon:"piano",channels:Q.filter(n=>n.group==="wired"&&n.channelIndex>=20)}];e.innerHTML=t.map(n=>`
      <div class="space-y-1.5 p-2 rounded-xl bg-surface-container/50 border border-outline-variant/20">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-on-surface uppercase tracking-wide px-1">
          <span class="material-symbols-outlined text-[15px] text-primary">${n.icon}</span>
          <span>${n.title}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${n.channels.map(a=>{const o=Ae.has(a.id);return`
              <label class="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer border ${o?"border-primary/40 bg-primary/5":"border-outline-variant/20"}">
                <input type="checkbox" data-channel-id="${a.id}" ${o?"checked":""} class="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4">
                <div class="min-w-0 flex-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-[12px] text-on-surface block leading-tight truncate">${qe(a.name)}</span>
                    <span class="text-[9px] font-mono uppercase opacity-70">${qe(a.profile)}</span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant block truncate">${qe(a.role)}</span>
                </div>
              </label>
            `}).join("")}
        </div>
      </div>
    `).join(""),e.querySelectorAll("input[type='checkbox']").forEach(n=>{n.addEventListener("change",()=>{const a=n.dataset.channelId;a&&(n.checked?Ae.add(a):Ae.delete(a),Bn())})})}const ks={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1};function an(e){if(!e)return"";const t=e.trim();return t===""||t==="same-origin"||t==="origin"||t==="/"?"":t.replace(/\/+$/,"")}function Ts(e){const t=typeof window<"u"&&window.location?window.location.search:"";if(t)try{const n=new URLSearchParams(t),a=n.get("gateway")||n.get("api");if(a)return an(a)}catch{}if(typeof window<"u"){const n=window.__PICONTROL_GATEWAY_URL__;if(n)return an(n)}try{const n=ks,a=(n==null?void 0:n.VITE_GATEWAY_URL)??(n==null?void 0:n.VITE_PIGATEWAY_URL);if(a)return an(a)}catch{}return""}function wn(e,t){const n=Ts(),a=e.startsWith("/")?e:`/${e}`;return n?`${n}${a}`:a}const $s={},Ra=window.fetch.bind(window);window.fetch=async(e,t)=>{let n=e;typeof e=="string"?(e.startsWith("/api/")||e.startsWith("/multiview")||e.startsWith("/pipgm"))&&(n=wn(e)):e instanceof URL&&(e.pathname.startsWith("/api/")||e.pathname.startsWith("/multiview")||e.pathname.startsWith("/pipgm"))&&(n=wn(e.pathname+e.search+e.hash));const a=localStorage.getItem("pimatrix_auth_token");if(a){t=t||{};const s=new Headers(t.headers||{});s.has("Authorization")||s.set("Authorization",`Bearer ${a}`),t.headers=s}const o=await Ra(n,t);return o.status===401&&((typeof n=="string"?n:n instanceof URL?n.href:n.url).includes("/api/v1/auth/verify")||za()),o};let Na="#00ff00";const Es=new Set(["hama","rtmp1","rtmp2","PiPGM1","PiPGM2","compose1"]),Ss=["hama","rtmp1","rtmp2","PiPGM1","PiPGM2","compose1"],Cs=["cam1","cam2","cam3"],ze=$s??{};var ta,na,aa;const X={hama:"hama",rtmp1:"rtmp1",rtmp2:"rtmp2",PiPGM1:"pipgm 1",PiPGM2:"pipgm 2",PiPGM3:"pipgm 3",compose1:"compose 1",cam1:((ta=ze.VITE_CAM1_NAME)==null?void 0:ta.trim())||"cam1",cam2:((na=ze.VITE_CAM2_NAME)==null?void 0:na.trim())||"cam2",cam3:((aa=ze.VITE_CAM3_NAME)==null?void 0:aa.trim())||"cam3",multiview:"multiview"};function vt(e){var o,s,i,r;const t=(s=(o=O.get(e))==null?void 0:o.label)==null?void 0:s.trim();if(t)return t;const n=(r=(i=kt.get(e))==null?void 0:i.label)==null?void 0:r.trim();if(n)return n;const a=e==="cam1"?ze.VITE_CAM1_NAME:e==="cam2"?ze.VITE_CAM2_NAME:ze.VITE_CAM3_NAME;return a!=null&&a.trim()?a.trim():e==="cam1"?"Camera 1":e==="cam2"?"Camera 2":"Camera 3"}function Is(){for(const e of["cam1","cam2","cam3"]){const t=vt(e);t&&t!==(e==="cam1"?"Camera 1":e==="cam2"?"Camera 2":"Camera 3")&&(X[e]=t);const a=document.querySelector(`.rtsp-choice-btn[data-rtsp="${e}"]`);a&&(a.textContent=X[e]||e)}}const ja={1:"LUKUPULPETTI (Lectern)",2:"RÄKKI (Operator PC)",3:"PI 1 (PiPGM 1)",4:"PI 2 (PiPGM 2)"},kn={1:"Videotykki 1 (Vasen)",2:"Videotykki 2 (Oikea)",3:"(none currently)",4:"(none currently)",5:"Videomikseri"},Ms={cam1:{1:"Pulpit",2:"Altar",3:"Organ",4:"Choir",5:"Lectern",6:"Wide Hall"},cam2:{1:"Pastor Close",2:"Communion",3:"Baptismal",4:"Band Wide",5:"Aisle Center",6:"Sanctuary"}};let G="outputs";const kt=new Map,nt=new Map,U=new Map,O=new Map,Ht=new Map;let On="landscape",W={locked:!1,routes:{1:1,2:2,3:null,4:null,5:2}},k={sourceId:"rtmp1",layout:"landscape",url:"rtsp://pimatrix.local:554/live",streaming:!1,quality:"full",resolution:"1920x1080",bitrateKbps:6200},ct=1,re="cam1",me="dual",Ue=!1,ee=!1,on=!1,Tn="name",Se=12;const Rn={cam1:1,cam2:1};let sn=null;function m(e){const t=document.getElementById("toast"),n=document.getElementById("toast-text");!t||!n||(n.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),sn&&clearTimeout(sn),sn=setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2400))}function Ps(e){const t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#221e1b"/>
        <stop offset="100%" stop-color="#14110f"/>
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#bg)"/>
    <g stroke="#38322e" stroke-width="1" opacity="0.4">
      <line x1="0" y1="120" x2="640" y2="120"/>
      <line x1="0" y1="240" x2="640" y2="240"/>
      <line x1="213" y1="0" x2="213" y2="360"/>
      <line x1="426" y1="0" x2="426" y2="360"/>
    </g>
    <circle cx="320" cy="145" r="42" fill="#2c2623" stroke="#534b45" stroke-width="2"/>
    <path d="M302 133 h24 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 v-16 a4 4 0 0 1 4 -4 z M330 140 l12 -7 v24 l-12 -7 z" fill="none" stroke="#9c928b" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="294" y1="122" x2="346" y2="168" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <text x="320" y="218" text-anchor="middle" fill="#e7ded8" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" letter-spacing="2">${e} • NOT CONNECTED</text>
    <text x="320" y="242" text-anchor="middle" fill="#9c928b" font-family="Inter, sans-serif" font-size="12">MediaMTX preview feed offline — press Start Receiving</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(t)}`}function As(e,t,n,a){const o=e==="cam1"?268:25,s=e==="cam1"?"#6d28d9":"#8f4c00",i=Math.max(-80,Math.min(80,Math.round(a.pan/15))),r=Math.max(-40,Math.min(40,Math.round(-a.tilt/15))),l=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),c=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${o}, 38%, 22%)"/>
        <stop offset="100%" stop-color="hsl(${o}, 30%, 12%)"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#g)"/>
    <g transform="translate(${i}, ${r})" opacity="0.35">
      <rect x="80" y="35" width="160" height="100" rx="8" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="160" cy="85" r="24" fill="none" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="160" y1="50" x2="160" y2="120" stroke="#ffffff" stroke-width="1"/>
      <line x1="125" y1="85" x2="195" y2="85" stroke="#ffffff" stroke-width="1"/>
    </g>
    <rect x="8" y="8" width="64" height="20" rx="4" fill="${s}"/>
    <text x="40" y="22" text-anchor="middle" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">${e.toUpperCase()} #${t}</text>
    <text x="160" y="94" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="15" font-weight="700">${n}</text>
    <text x="160" y="114" text-anchor="middle" fill="#d3bbff" font-family="JetBrains Mono, monospace" font-size="10">P:${a.pan} T:${a.tilt} Z:${a.zoom}</text>
    <text x="310" y="170" text-anchor="end" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="9">SNAP ${l}</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(c)}`}function Ft(e){var r,l;const t=["sound","inputs","cameras","youtube","tally","voice","radio","renderer"];for(const c of t){const p=document.getElementById("nav-"+c);if(!p)continue;const d=e.inUseTabs.includes(c);p.classList.toggle("hidden",!d),p.classList.toggle("flex",d)}const n=document.getElementById("top-sound-btn");if(n){const c=e.inUseTabs.includes("sound");n.classList.toggle("hidden",!c),n.classList.toggle("inline-flex",c)}const a=document.getElementById("ecosystem-dot"),o=document.getElementById("ecosystem-status-text"),s=((r=e.activePlugins)==null?void 0:r.length)??0;o&&(o.textContent=`${s} Active`),a&&(a.className="w-2 h-2 rounded-full "+(s>0?"bg-emerald-500 animate-pulse":"bg-amber-500"));const i={sound:"pisound",radio:"radioRelay",youtube:"pitube",tally:"pilight",inputs:"pimatrix",cameras:"cameras",voice:"pivoice",renderer:"piprogram"};for(const[c,p]of Object.entries(i)){const d=(l=e.components)==null?void 0:l[p],f=(d==null?void 0:d.inUse)??e.inUseTabs.includes(c),h=document.getElementById("more-badge-"+c);h&&(h.className="w-2 h-2 rounded-full absolute top-2.5 right-2.5 "+(f?"bg-emerald-500":"bg-slate-400"),h.title=f?`${(d==null?void 0:d.name)||c}: Active / In Use`:`${(d==null?void 0:d.name)||c}: Standby / Inactive`);const y=document.getElementById("more-tile-"+c);y&&y.classList.toggle("opacity-60",!f)}G!=="outputs"&&!e.inUseTabs.includes(G)&&(Gt("outputs",!0),m(`Navigated to Outputs (${G} is currently not in use)`))}async function Ls(){const e=document.getElementById("more-probe-btn");e&&e.classList.add("opacity-50");try{const t=await fetch("/api/v1/ecosystem/probe",{method:"POST"});if(!t.ok)throw new Error(`HTTP ${t.status}`);const n=await t.json();Ft(n),m(`Ecosystem probed: ${n.activePlugins.length} services active`)}catch(t){const n=t instanceof Error?t.message:String(t);m(`Probe failed: ${n}`)}finally{e&&e.classList.remove("opacity-50")}}function Gt(e,t=!0){G=e;const n=["outputs","inputs","cameras","youtube","tally","voice","radio","renderer","sound"];for(const p of n){const d=document.getElementById("tab-"+p),f=document.getElementById("nav-"+p);d&&d.classList.toggle("active",p===e),f&&(p===e?f.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg bg-primary text-on-primary shadow-sm transition-all active:scale-95":f.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95")}const a=document.getElementById("nav-more"),o=document.getElementById("nav-more-label");a&&(e==="radio"||e==="inputs"||e==="renderer"||e==="sound"?(a.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg bg-primary text-on-primary shadow-sm transition-all active:scale-95",o&&(o.textContent=e==="radio"?"Radio":e==="inputs"?"Matrix":"Render")):(a.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high active:scale-95",o&&(o.textContent="More")));const i=document.getElementById("header-icon"),r=document.getElementById("header-title"),l=document.getElementById("header-subtitle"),c=document.getElementById("lockToggleBtn");if(c&&(c.classList.toggle("hidden",e!=="inputs"),c.classList.toggle("flex",e==="inputs")),e==="outputs"?(i&&(i.textContent="crop_free"),r&&(r.textContent="PiMatrix"),l&&(l.textContent="Pi Outputs")):e==="inputs"?(i&&(i.textContent="settings_input_component"),r&&(r.textContent="Matrix Routing"),l&&(l.textContent="Atlona 4x4 Switcher")):e==="cameras"?(i&&(i.textContent="videocam"),r&&(r.textContent="Video"),l&&(l.textContent="Cameras, Presets & ATEM")):e==="youtube"?(i&&(i.textContent="smart_display"),r&&(r.textContent="YouTube Live"),l&&(l.textContent="pitube Broadcast & Confidence Monitor")):e==="tally"?(i&&(i.textContent="highlight"),r&&(r.textContent="Tally Lights"),l&&(l.textContent="Tally-Ma Wireless & PTZ Cues")):e==="voice"?(i&&(i.textContent="record_voice_over"),r&&(r.textContent="Voice"),l&&(l.textContent="pivoice capture, transcription and captions")):e==="radio"?(i&&(i.textContent="radio"),r&&(r.textContent="Web Radio"),l&&(l.textContent="Icecast2 Relay Transmission")):e==="renderer"?(i&&(i.textContent="layers"),r&&(r.textContent="PiPGM Renderer"),l&&(l.textContent="Stub Placeholder")):e==="sound"&&(i&&(i.textContent="tune"),r&&(r.textContent="Äänimikseri"),l&&(l.textContent="Sali & Striimi Mikseri (London BLU-100)")),Wa(),Co(e==="youtube"),Uo(e==="tally"),Eo(e==="voice"),es(e==="radio"),fs(e==="sound"),t&&window.history&&window.history.replaceState){const p={outputs:"/outputs",inputs:"/inputs",cameras:"/cameras",youtube:"/youtube",tally:"/tally",voice:"/voice",radio:"/radio",renderer:"/pipgm",sound:"/sound"};window.history.replaceState(null,"",p[e])}}function Wt(e){const t=e===1?"hdmi0":"hdmi1",n=nt.get(t),a=(n==null?void 0:n.observedSource)||(n==null?void 0:n.desiredSource);return a||(e===1?"PiPGM1":"rtmp1")}function Ua(e){if(!e||e==="multiview")return!1;const t=U.get(e);if(t&&typeof t.fadeToBlack=="boolean")return t.fadeToBlack;const n=Ht.get(e);return n?n.fadeToBlack===!0:!1}function Bs(e){if(!e||e==="multiview")return!1;const t=U.get(e);if(t&&typeof t.muted=="boolean")return t.muted;const n=Ht.get(e);return n?!n.audioEnabled:!1}function Da(e){var n;if(!e||e==="multiview")return!1;const t=U.get(e);return!!((n=t==null?void 0:t.crop)!=null&&n.enabled)}function _a(e){var n;const t=U.get(e);return((n=t==null?void 0:t.crop)==null?void 0:n.aspectRatio)||"16:9"}function K(){ea(1),ea(2),Va(),Nn(),Be(),C&&Dt()}function Ut(e,t,n,a,o){const s=a||X[t]||t,i=Ua(t),r=Bs(t),l=Da(t),c=_a(t),p=o||`selectHdmiSource(${e}, '${t}')`,d=t==="compose1",f=n?"bg-primary text-on-primary shadow-sm border-primary":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/25 shadow-xs",h=r?"bg-tertiary text-on-tertiary shadow-xs":n?"bg-black/20 hover:bg-black/30 text-on-primary/80":"bg-surface-container hover:bg-surface-container-lowest text-on-surface-variant",y=i?"bg-error text-on-error shadow-xs animate-pulse":n?"bg-black/20 hover:bg-error hover:text-on-error text-on-primary/85":"bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error",w=l?`<span class="px-1 py-0.2 rounded text-[8px] font-bold ${n?"bg-white/25 text-on-primary":"bg-primary/15 text-primary"}">${c}</span>`:"";return`
    <div class="hdmi${e}-row flex items-center gap-1 w-full h-8 p-0.5 rounded-lg border transition-all ${f}" data-source="${t}">
      <button
        type="button"
        data-crop-source="${t}"
        onclick="${p}"
        oncontextmenu="event.preventDefault(); openSourceCropModal('${t}')"
        title="Tap to route ${s.toUpperCase()} • Hold to open Cropper"
        class="hdmi${e}-btn flex-1 h-full px-1.5 rounded-md font-label-md text-[11px] uppercase ${n?"font-bold":"font-semibold"} text-left flex items-center justify-between min-w-0 active:scale-[0.98] transition-all"
      >
        <span class="truncate flex items-center gap-1">
          ${n?'<span class="material-symbols-outlined text-[12px]">radio_button_checked</span>':""}
          <span>${s}</span>
        </span>
        <span class="flex items-center gap-1 flex-shrink-0">${w}</span>
      </button>
      <div class="flex items-center gap-0.5 pr-0.5 flex-shrink-0">
        ${d?`<button
          type="button"
          disabled
          title="COMPOSE 1 is always muted (slide only, no audio)"
          class="w-6 h-6 rounded flex items-center justify-center bg-tertiary text-on-tertiary opacity-70 cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-[13px]">volume_off</span>
        </button>`:`<button
          type="button"
          onclick="event.stopPropagation(); toggleInputEffect('${t}', 'mute')"
          title="${r?"Unmute":"Mute"} ${s.toUpperCase()} (can pre-mute before activating)"
          class="w-6 h-6 rounded flex items-center justify-center transition-all active:scale-90 ${h}"
        >
          <span class="material-symbols-outlined text-[13px]">${r?"volume_off":"volume_up"}</span>
        </button>`}
        <button
          type="button"
          onclick="event.stopPropagation(); toggleInputEffect('${t}', 'ftb')"
          title="${d?i?"Disable FTB on":"Fade to the key colour:":i?"Disable FTB on":"Pre-FTB / Fade to Black"} ${s.toUpperCase()}"
          ${d&&i?`style="background:${Na};color:#000"`:""}
          class="px-1.5 h-6 rounded font-label-sm text-[9px] font-bold uppercase flex items-center justify-center transition-all active:scale-90 ${d&&i?"animate-pulse":y}"
        >
          FTB
        </button>
      </div>
    </div>
  `}function ea(e){const t=Wt(e),n=document.getElementById(`hdmi${e}-active-label`),a=document.getElementById(`hdmi${e}-ftb-pill`),o=document.getElementById(`hdmi${e}-crop-pill`),s=document.getElementById(`hdmi${e}-inputs-list`),i=document.getElementById(`hdmi${e}-aux-container`),r=X[t]||t||"--";n&&(n.textContent=r);const l=Ua(t),c=Da(t);a&&a.classList.toggle("hidden",!l),o&&(o.classList.toggle("hidden",!c),c&&(o.textContent=`CROP ${_a(t)}`)),s&&(s.innerHTML=Ss.map(d=>Ut(e,d,d===t)).join(""),En(s));const p=!!(t&&!Es.has(t));if(i)if(p&&t!=="multiview"){const d=t;i.innerHTML=`
        <div class="flex flex-col gap-1">
          ${Ut(e,d,!0,`Aux: ${r}`,`openAuxModal(${e})`)}
        </div>
      `,En(i)}else if(p&&t==="multiview"){const d=On==="portrait"?" (2x4)":" (4x2)";i.innerHTML=`
        <button type="button" id="hdmi${e}-aux-btn" class="w-full p-1.5 rounded-lg border border-primary bg-primary text-on-primary text-left active:scale-[0.98] transition-all flex flex-col gap-0.5 shadow-sm" onclick="openAuxModal(${e})">
          <div class="flex items-center justify-between w-full">
            <span class="font-label-md text-[11px] font-bold text-on-primary uppercase flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">grid_view</span>Aux: ${r}${d}
            </span>
            <span class="material-symbols-outlined text-[14px] text-on-primary">verified</span>
          </div>
          <span class="font-label-sm text-[9px] text-on-primary/80 leading-none">cam 1-3 • pipgm 3 • multiview</span>
        </button>
      `}else i.innerHTML=`
        <button type="button" id="hdmi${e}-aux-btn" class="w-full p-1.5 rounded-lg border border-dashed border-primary/40 bg-surface-container hover:bg-surface-container-high text-left active:scale-[0.98] transition-all flex flex-col gap-0.5" onclick="openAuxModal(${e})">
          <div class="flex items-center justify-between w-full">
            <span class="font-label-md text-[11px] font-bold text-primary uppercase flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">tune</span>Auxiliary
            </span>
            <span class="material-symbols-outlined text-[14px] text-primary">touch_app</span>
          </div>
          <span class="font-label-sm text-[9px] text-on-surface-variant leading-none">cam 1-3 • pipgm 3 • multiview</span>
        </button>
      `}function Va(){const e=document.getElementById("aux-modal-cam-list");if(!e)return;const t=Wt(ct),n=Cs.map(o=>Ut(ct,o,t===o,X[o]||o,`confirmAuxPick('${o}')`)).join(""),a=Ut(ct,"PiPGM3",t==="PiPGM3","pipgm 3","confirmAuxPick('PiPGM3')");e.innerHTML=`
    <div class="flex flex-col gap-1">
      <span class="font-label-sm text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">PTZ Cameras</span>
      ${n}
    </div>
    <div class="flex flex-col gap-1 pt-1.5 border-t border-outline-variant/30">
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Auxiliary Programme</span>
        <span class="font-label-sm text-[9px] uppercase text-primary font-semibold">Usually Off</span>
      </div>
      ${a}
    </div>
  `,En(e)}function Nn(){for(const[e,t]of[[1,3],[2,4]]){const n=document.getElementById(`hdmi${e}-routed-badges`);if(!n)continue;const a=[];for(const[o,s]of Object.entries(W.routes||{})){const i=Number(o);i===3||i===4||s===t&&kn[i]&&a.push(kn[i])}a.length===0?n.innerHTML='<span class="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-label-sm text-[9px] font-semibold leading-none">Unrouted</span>':n.innerHTML=a.map(o=>`<span class="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-sm text-[9px] font-semibold leading-none">${o}</span>`).join("")}}async function Ha(e,t){const n=e===1?"hdmi0":"hdmi1";try{const a=await fetch(`/api/v1/outputs/${n}/source`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:t})});if(a.ok){const o=await a.json();nt.set(n,o),K();const s=t?X[t]||t:"Cleared";m(`Pi ${e} (hdmi ${e-1}) → ${s.toUpperCase()}`)}}catch{m(`Failed to route Pi ${e}`)}}function Os(e){ct=e;const t=document.getElementById("aux-target-label");t&&(t.textContent=`Assigning to Pi ${e} (hdmi ${e-1})`),Va();const n=document.getElementById("aux-modal-overlay");n&&typeof n.showModal=="function"&&(n.open||n.showModal())}function Fa(){const e=document.getElementById("aux-modal-overlay");e&&e.open&&e.close()}async function Rs(e,t){if(e==="multiview"&&t)try{(await fetch("/api/v1/outputs/multiview/layout",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({layout:t})})).ok&&(On=t)}catch{}await Ha(ct,e),Fa()}async function Ns(e,t){const n=Wt(e);if(!n||n==="multiview"){m("Select a specific input source for FTB/Mute");return}await Ga(n,t)}async function Ga(e,t){const n=t==="ftb"?`/api/v1/sources/${encodeURIComponent(e)}/effects/ftb`:`/api/v1/sources/${encodeURIComponent(e)}/effects/mute`;try{const a=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toggle:!0})});if(a.ok){const o=await a.json();U.set(e,o),K();const s=(X[e]||e).toUpperCase();m(t==="ftb"?`${s}: ${o.fadeToBlack?"FADED TO BLACK":"LIVE (FTB OFF)"}`:`${s}: ${o.muted?"AUDIO MUTED":"AUDIO UNMUTED"}`)}}catch{m(`Failed to update ${t.toUpperCase()} for ${e}`)}}let C=null;function js(e){const t=(X[e]||e).toUpperCase(),n=e==="hama"?210:e.startsWith("rtmp")?160:e.startsWith("cam")?268:28,a=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="cbg-${e}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${n}, 42%, 22%)"/>
        <stop offset="50%" stop-color="hsl(${n}, 35%, 15%)"/>
        <stop offset="100%" stop-color="hsl(${n}, 30%, 10%)"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#cbg-${e})"/>
    <g stroke="rgba(255,255,255,0.14)" stroke-width="3">
      <line x1="640" y1="0" x2="640" y2="1080"/>
      <line x1="1280" y1="0" x2="1280" y2="1080"/>
      <line x1="0" y1="360" x2="1920" y2="360"/>
      <line x1="0" y1="720" x2="1920" y2="720"/>
      <rect x="240" y="135" width="1440" height="810" fill="none" stroke-dasharray="16 12"/>
      <circle cx="960" cy="540" r="220" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="4"/>
      <line x1="960" y1="260" x2="960" y2="820"/>
      <line x1="680" y1="540" x2="1240" y2="540"/>
    </g>
    <!-- Reference subject markers so user can clearly see what is inside the cropped region -->
    <rect x="700" y="210" width="520" height="660" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>
    <circle cx="960" cy="390" r="85" fill="rgba(255,255,255,0.2)"/>
    <path d="M810 680 C810 545 1110 545 1110 680 Z" fill="rgba(255,255,255,0.2)"/>
    <text x="960" y="810" text-anchor="middle" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="64" font-weight="800" letter-spacing="6">${t} FEED</text>
    <text x="120" y="110" fill="rgba(255,255,255,0.5)" font-family="JetBrains Mono, monospace" font-size="40">NW (0,0)</text>
    <text x="1800" y="110" text-anchor="end" fill="rgba(255,255,255,0.5)" font-family="JetBrains Mono, monospace" font-size="40">NE (1920,0)</text>
    <text x="120" y="1010" fill="rgba(255,255,255,0.5)" font-family="JetBrains Mono, monospace" font-size="40">SW (0,1080)</text>
    <text x="1800" y="1010" text-anchor="end" fill="rgba(255,255,255,0.5)" font-family="JetBrains Mono, monospace" font-size="40">SE (1920,1080)</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(a)}`}function Xe(e){let t=U.get(e);return t||(t={sourceId:e,crop:{enabled:!1,x:0,y:0,width:1920,height:1080,sourceWidth:1920,sourceHeight:1080,aspectRatio:"16:9",lockedAspectRatio:!1},rotation:0,fadeToBlack:!1,muted:!1,ffmpegFilter:"null"},U.set(e,t)),t}function $n(e){const t=Wt(e);if(!t||t==="multiview"){m("Select a video input source to crop");return}jn(t)}function jn(e){C=e,ma(e),window.setCropDialogTab(e==="compose1"?"composite":"crop"),Xe(e),Dt();const t=document.getElementById("crop-modal-overlay");t&&typeof t.showModal=="function"&&(t.open||t.showModal()),requestAnimationFrame(()=>Dt())}function Us(){const e=document.getElementById("crop-modal-overlay");e&&e.open&&e.close(),window.setCropDialogTab("crop"),ma(null),C=null}function Dt(){var $;if(!C)return;const t=Xe(C).crop,n=t.sourceWidth||1920,a=t.sourceHeight||1080,o=Math.max(32,t.width||n),s=Math.max(32,t.height||a),i=Math.max(0,Math.min(n-o,t.x||0)),r=Math.max(0,Math.min(a-s,t.y||0)),l=(X[C]||C).toUpperCase(),c=document.getElementById("crop-dialog-title"),p=document.getElementById("crop-zoomed-badge"),d=document.getElementById("crop-coords-readout"),f=document.getElementById("crop-interactive-rect"),h=document.getElementById("crop-rect-tag"),y=document.getElementById("crop-lock-aspect-icon"),w=document.getElementById("crop-lock-aspect-label");c&&(c.textContent=`Crop & Effects: ${l}`),p&&(p.textContent=`${t.aspectRatio}${t.enabled?" [ACTIVE]":" [FULL]"} • ${o}x${s}`),d&&(d.textContent=`x:${i} y:${r} w:${o} h:${s}`),f&&(f.style.left=`${i/n*100}%`,f.style.top=`${r/a*100}%`,f.style.width=`${o/n*100}%`,f.style.height=`${s/a*100}%`),h&&(h.textContent=`${t.aspectRatio}${t.enabled?" • ON":""}`),y&&w&&(y.textContent=t.lockedAspectRatio?"lock":"lock_open",w.textContent=`Lock Aspect: ${t.lockedAspectRatio?"ON":"OFF"}`);const I=kt.get(C),S=($=I==null?void 0:I.preview)!=null&&$.available&&I.preview.url?I.preview.url:null,D=js(C),x=document.getElementById("crop-full-feed");x&&x.getAttribute("data-rendered-source")!==`${C}:${S||"sim"}`&&(x.setAttribute("data-rendered-source",`${C}:${S||"sim"}`),S?x.innerHTML=`<iframe src="${S}" class="w-full h-full border-0 pointer-events-none" allow="autoplay"></iframe>`:x.innerHTML=`<img src="${D}" alt="${l}" class="w-full h-full object-cover pointer-events-none" />`);const b=document.getElementById("crop-zoomed-viewport"),g=document.getElementById("crop-zoomed-feed");if(b&&g){g.getAttribute("data-rendered-source")!==`${C}:${S||"sim"}`&&(g.setAttribute("data-rendered-source",`${C}:${S||"sim"}`),S?g.innerHTML=`<iframe src="${S}" class="w-full h-full border-0 pointer-events-none" allow="autoplay"></iframe>`:g.innerHTML=`<img src="${D}" alt="${l} Cropped" class="w-full h-full object-cover pointer-events-none" />`);const E=b.parentElement,M=((E==null?void 0:E.clientWidth)||380)-8;let le=((E==null?void 0:E.clientHeight)||140)-8,J=Math.round(o/s*le);J>M&&(J=M,le=Math.max(24,Math.round(s/o*J))),b.style.width=`${J}px`,b.style.height=`${le}px`;const Tt=J/o,$t=le/s;g.style.width=`${n}px`,g.style.height=`${a}px`,g.style.transform=`scale(${Tt}, ${$t}) translate(${-i}px, ${-r}px)`}}function En(e){e.querySelectorAll("[data-crop-source]").forEach(n=>{const a=n.getAttribute("data-crop-source");if(!a)return;let o=null,s=!1;n.addEventListener("pointerdown",()=>{s=!1,o=setTimeout(()=>{s=!0,o=null,jn(a)},450)});const i=()=>{o&&(clearTimeout(o),o=null)};n.addEventListener("pointerup",i),n.addEventListener("pointerleave",i),n.addEventListener("pointercancel",i),n.addEventListener("click",r=>{s&&(r.preventDefault(),r.stopImmediatePropagation(),s=!1)},!0)})}function Ds(){for(const e of[1,2]){const t=document.getElementById(`hdmi${e}-header-zone`);if(!t)continue;let n=null;t.addEventListener("pointerdown",()=>{n=setTimeout(()=>{n=null,$n(e)},450)});const a=()=>{n&&(clearTimeout(n),n=null)};t.addEventListener("pointerup",a),t.addEventListener("pointerleave",a),t.addEventListener("pointercancel",a),t.addEventListener("contextmenu",o=>{o.preventDefault(),$n(e)})}}function _s(){const e=document.getElementById("crop-interactive-box");if(!e)return;let t=!1,n=0,a=0,o=0,s=0;e.addEventListener("pointerdown",r=>{if(!C)return;const l=Xe(C);if(t=!0,n=r.clientX,a=r.clientY,o=l.crop.x,s=l.crop.y,typeof e.setPointerCapture=="function")try{e.setPointerCapture(r.pointerId)}catch{}}),e.addEventListener("pointermove",r=>{if(!t||!C)return;const l=Xe(C),c=e.getBoundingClientRect();if(!c.width||!c.height)return;const p=l.crop.sourceWidth||1920,d=l.crop.sourceHeight||1080,f=Math.round((r.clientX-n)/c.width*p),h=Math.round((r.clientY-a)/c.height*d),y=Math.max(0,Math.min(p-l.crop.width,Math.round((o+f)/2)*2)),w=Math.max(0,Math.min(d-l.crop.height,Math.round((s+h)/2)*2));l.crop.x=y,l.crop.y=w,l.crop.enabled=!0,Dt()});const i=async()=>{if(!t||!C)return;t=!1;const r=C,l=Xe(r);try{const c=await fetch(`/api/v1/sources/${encodeURIComponent(r)}/effects/crop`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:!0,x:l.crop.x,y:l.crop.y})});if(c.ok){const p=await c.json();U.set(r,p),K()}}catch{}};e.addEventListener("pointerup",()=>void i()),e.addEventListener("pointercancel",()=>void i())}async function Vs(e){if(!C)return;const t=C;try{const n=await fetch(`/api/v1/sources/${encodeURIComponent(t)}/effects/crop/preset`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({preset:e})});if(n.ok){const a=await n.json();U.set(t,a),K(),m(`${(X[t]||t).toUpperCase()} Crop → ${a.crop.enabled?a.crop.aspectRatio:"RESET"}`)}}catch{m("Failed to apply crop preset")}}async function Hs(e){if(!C)return;const t=C;try{const n=await fetch(`/api/v1/sources/${encodeURIComponent(t)}/effects/crop/move`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({direction:e,delta:32})});if(n.ok){const a=await n.json();U.set(t,a),K()}}catch{}}async function Fs(e){if(!C)return;const t=C;try{const n=await fetch(`/api/v1/sources/${encodeURIComponent(t)}/effects/crop/resize`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:e,factor:.1})});if(n.ok){const a=await n.json();U.set(t,a),K()}}catch{}}async function Gs(){if(!C)return;const e=C,n=!Xe(e).crop.lockedAspectRatio;try{const a=await fetch(`/api/v1/sources/${encodeURIComponent(e)}/effects/crop`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({lockedAspectRatio:n})});if(a.ok){const o=await a.json();U.set(e,o),K()}}catch{}}function Ws(){Be();const e=document.getElementById("rtsp-modal-overlay");e&&typeof e.showModal=="function"&&(e.open||e.showModal())}function Ks(){const e=document.getElementById("rtsp-modal-overlay");e&&e.open&&e.close()}function Be(){const e=document.getElementById("rtsp-config-btn-label"),t=document.getElementById("rtsp-dialog-status-pill"),n=document.getElementById("rtsp-stream-btn"),a=document.getElementById("rtsp-stream-icon"),o=document.getElementById("rtsp-stream-label"),s=document.getElementById("rtsp-live-dot"),i=document.getElementById("rtsp-quality-badge"),r=k.sourceId==="multiview"?`MV (${k.layout==="portrait"?"2x4":"4x2"})`:X[k.sourceId]||k.sourceId,l=k.quality==="preview"?"Preview":"Full";if(e&&(e.textContent="Settings"),t&&(k.streaming?(t.textContent=`STREAMING • ${r.toUpperCase()}`,t.className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 font-bold uppercase text-[9px]"):(t.textContent=`STOPPED • ${r.toUpperCase()}`,t.className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-bold uppercase text-[9px]")),i){const y=(k.bitrateKbps/1e3).toFixed(1);i.textContent=`${l.toUpperCase()} ${k.resolution} • ${y} Mbps`}s&&(s.className=k.streaming?"inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0":"inline-block w-2 h-2 rounded-full bg-outline flex-shrink-0"),n&&a&&o&&(k.streaming?(n.className="h-9 px-3 rounded-lg bg-error text-on-error font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95",a.textContent="stop",o.textContent="Stop Stream"):(n.className="h-9 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95",a.textContent="play_arrow",o.textContent="Start Stream")),document.querySelectorAll(".rtsp-choice-btn").forEach(y=>{const w=y.getAttribute("data-rtsp")||"";let I=!1;if(w.startsWith("multiview:")){const S=w.split(":")[1];I=k.sourceId==="multiview"&&k.layout===S}else I=k.sourceId===w;w.startsWith("multiview:")?y.className=I?"rtsp-choice-btn flex-1 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-[9px] uppercase font-bold transition-all flex flex-col items-center justify-center leading-none p-0.5 shadow-sm":"rtsp-choice-btn flex-1 h-8 rounded-lg bg-surface-container-highest hover:bg-primary/20 text-on-surface font-label-sm text-[9px] uppercase font-semibold transition-all flex flex-col items-center justify-center leading-none p-0.5":y.className=I?"rtsp-choice-btn h-8 rounded-lg bg-primary text-on-primary font-label-md text-[11px] uppercase font-bold transition-all shadow-sm":"rtsp-choice-btn h-8 rounded-lg bg-surface-container-highest hover:bg-primary/20 text-on-surface font-label-md text-[11px] uppercase font-semibold transition-all shadow-xs"});const p=document.getElementById("rtsp-profile-preview"),d=document.getElementById("rtsp-profile-full");p&&d&&(k.quality==="preview"?(p.className="p-2 rounded-lg border border-primary bg-primary text-on-primary text-left flex flex-col gap-0.5 transition-all shadow-sm",d.className="p-2 rounded-lg border border-outline-variant/40 bg-surface-container-high text-on-surface text-left flex flex-col gap-0.5 transition-all"):(p.className="p-2 rounded-lg border border-outline-variant/40 bg-surface-container-high text-on-surface text-left flex flex-col gap-0.5 transition-all",d.className="p-2 rounded-lg border border-primary bg-primary text-on-primary text-left flex flex-col gap-0.5 transition-all shadow-sm"));const f=document.getElementById("rtsp-resolution-select"),h=document.getElementById("rtsp-bitrate-select");f&&k.resolution&&(f.value=k.resolution),h&&k.bitrateKbps&&(h.value=String(k.bitrateKbps))}async function Ys(e,t){try{const n=await fetch("/api/v1/outputs/rtsp/source",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:e,...t?{layout:t}:{}})});n.ok&&(k=await n.json(),Be(),m(`RTSP Stream Source → ${(X[e]||e).toUpperCase()}`))}catch{m("Failed to assign RTSP source")}}async function qs(e){const t=e==="preview"?"640x360":"1920x1080",n=e==="preview"?800:6200;try{const a=await fetch("/api/v1/outputs/rtsp/source",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:k.sourceId,layout:k.layout,quality:e,resolution:t,bitrateKbps:n})});a.ok&&(k=await a.json(),Be(),m(`RTSP Quality → ${e==="preview"?"PREVIEW (360p / 800 kbps)":"FULL (1080p / 6200 kbps)"}`))}catch{m("Failed to update RTSP quality")}}async function zs(){const e=document.getElementById("rtsp-resolution-select"),t=document.getElementById("rtsp-bitrate-select"),n=(e==null?void 0:e.value)||k.resolution,a=Number((t==null?void 0:t.value)||k.bitrateKbps),o=n==="640x360"||a<=1e3?"preview":"full";try{const s=await fetch("/api/v1/outputs/rtsp/source",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:k.sourceId,layout:k.layout,quality:o,resolution:n,bitrateKbps:a})});s.ok&&(k=await s.json(),Be(),m(`RTSP → ${n} @ ${a} kbps`))}catch{m("Failed to update RTSP settings")}}async function Xs(){try{const e=await fetch("/api/v1/outputs/rtsp/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toggle:!0})});e.ok&&(k=await e.json(),Be(),m(k.streaming?"RTSP Network Stream STARTED":"RTSP Network Stream STOPPED"))}catch{m("Failed to toggle RTSP stream")}}function yt(){var a;const e=document.getElementById("lockIcon"),t=document.getElementById("lockLabel"),n=document.getElementById("lockToggleBtn");e&&t&&n&&(W.locked?(e.textContent="lock",e.className="material-symbols-outlined text-[14px] text-error",t.textContent="LOCKED",t.className="text-error",n.className=`${G==="inputs"?"flex":"hidden"} items-center gap-1 px-2.5 py-1 rounded-full bg-error-container border border-error/30 text-[10px] font-label-sm font-bold uppercase transition-all active:scale-95`):(e.textContent="lock_open",e.className="material-symbols-outlined text-[14px] text-tertiary",t.textContent="UNLOCKED",t.className="text-tertiary",n.className=`${G==="inputs"?"flex":"hidden"} items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 text-[10px] font-label-sm font-bold uppercase transition-all active:scale-95`));for(const o of[1,2,5]){const s=((a=W.routes)==null?void 0:a[o])||1,i=document.getElementById(`matrix-out-${o}-status`);i&&(i.textContent=`IN ${s} • ${ja[s]||`INPUT ${s}`}`);const r=document.querySelector(`[data-output="${o}"]`);if(!r)continue;r.querySelectorAll(".matrix-btn").forEach(c=>{const p=Number(c.getAttribute("data-input")),d=c.querySelector(".matrix-sub");p===s?(c.className="matrix-btn h-12 flex flex-col items-center justify-center rounded bg-primary text-on-primary shadow-sm transition-all active:scale-95",d&&(d.className="matrix-sub font-label-sm text-[9px] text-on-primary-container uppercase tracking-tighter")):(c.className="matrix-btn h-12 flex flex-col items-center justify-center rounded bg-surface-container-highest text-on-surface hover:bg-surface-dim transition-all active:scale-95",d&&(d.className="matrix-sub font-label-sm text-[9px] text-on-surface-variant uppercase tracking-tighter"))})}}async function Js(){const e=!W.locked;try{const t=await fetch("/api/v1/matrix/lock",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({locked:e})});t.ok&&(W=await t.json(),yt(),m(W.locked?"Matrix Safety LOCKED":"Matrix UNLOCKED"))}catch{W.locked=e,yt()}}async function Zs(e,t){var n;if(W.locked){m("Matrix is LOCKED — unlock in top bar to route");return}try{const a=await fetch("/api/v1/matrix/route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input:e,output:t})});if(a.ok)W.routes[t]=e,yt(),Nn(),m(`${kn[t]} → ${ja[e]}`);else{const o=await a.json().catch(()=>({}));m(((n=o==null?void 0:o.error)==null?void 0:n.message)||"Matrix route failed")}}catch{m("Matrix route request failed")}}function Qs(e){me==="dual"?(me=e,re=e):me="dual",ie()}function Wa(){Qa(G==="cameras"&&me==="dual")}function ei(e,t){var l,c;const n=document.getElementById(`cam-feed-box-${t}`);if(!n)return;const a=O.get(e),o=kt.get(e),s=(a==null?void 0:a.streaming)===!0,i=(l=o==null?void 0:o.preview)!=null&&l.available&&((c=o==null?void 0:o.preview)!=null&&c.url)?o.preview.url:null,r=s&&i?`iframe:${i}`:`offline:${e}`;if(n.getAttribute("data-render-key")!==r)if(n.setAttribute("data-render-key",r),s&&i)n.innerHTML=`<iframe src="${i}" class="w-full h-full border-0 pointer-events-none" allow="autoplay; fullscreen"></iframe>`;else{const p=vt(e).toUpperCase(),d=Ps(p);n.innerHTML=`<img src="${d}" alt="${p} Not Connected" class="w-full h-full object-cover"/>`}}function ie(){const e=document.getElementById("cam-card-1"),t=document.getElementById("cam-card-2"),n=document.getElementById("cam-glow-1"),a=document.getElementById("cam-glow-2"),o=document.getElementById("cam-badge-1"),s=document.getElementById("cam-badge-2"),i=document.getElementById("cam-name-1"),r=document.getElementById("cam-name-2"),l=document.getElementById("cam1-presets-label"),c=document.getElementById("cam2-presets-label"),p=document.getElementById("target-indicator"),d=document.getElementById("param-matrix-title"),f=document.getElementById("atem-panel"),h=document.getElementById("ptz-console"),y=document.getElementById("monitorsContainer"),w=document.getElementById("expandedConfigPanel"),I=document.getElementById("cam1-presets-section"),S=document.getElementById("cam2-presets-section"),D=vt("cam1"),x=vt("cam2");i&&(i.textContent=D),r&&(r.textContent=x),l&&(l.textContent=`(${D})`),c&&(c.textContent=`(${x})`);const b=re==="cam1";n&&(n.className=`h-1.5 w-full transition-colors ${b?"bg-primary":"bg-surface-variant"}`),a&&(a.className=`h-1.5 w-full transition-colors ${b?"bg-surface-variant":"bg-secondary"}`),o&&(o.className=b?"px-1.5 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-sm":"px-1.5 py-0.5 rounded bg-surface-container-lowest/90 text-on-surface font-label-sm text-label-sm font-bold shadow-sm"),s&&(s.className=b?"px-1.5 py-0.5 rounded bg-surface-container-lowest/90 text-on-surface font-label-sm text-label-sm font-bold shadow-sm":"px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold shadow-sm"),p&&(p.textContent=b?`TARGET: CAM 01 (${D.toUpperCase()})`:`TARGET: CAM 02 (${x.toUpperCase()})`),d&&(d.textContent=b?`CAM 01 (${D.toUpperCase()}) PARAMETER MATRIX`:`CAM 02 (${x.toUpperCase()}) PARAMETER MATRIX`),y&&e&&t&&(me==="dual"?(y.className="grid grid-cols-2 gap-space-sm w-full transition-all duration-300",e.classList.remove("hidden"),t.classList.remove("hidden"),w&&(w.classList.add("hidden"),w.classList.remove("flex")),I&&I.classList.remove("hidden"),S&&S.classList.remove("hidden")):me==="cam1"?(y.className="grid grid-cols-2 gap-space-sm w-full items-start transition-all duration-300",e.classList.remove("hidden"),t.classList.add("hidden"),w&&(w.classList.remove("hidden"),w.classList.add("flex")),I&&I.classList.remove("hidden"),S&&S.classList.add("hidden")):(y.className="grid grid-cols-2 gap-space-sm w-full items-start transition-all duration-300",e.classList.add("hidden"),t.classList.remove("hidden"),w&&(w.classList.remove("hidden"),w.classList.add("flex")),I&&I.classList.add("hidden"),S&&S.classList.remove("hidden"))),w&&(w.style.gridColumn=me==="cam1"?"2":"1",w.style.gridRow="1"),e&&(e.style.gridColumn="1"),t&&(t.style.gridColumn="2"),e&&(e.style.gridRow="1"),t&&(t.style.gridRow="1");const g=me==="dual";f&&(f.classList.toggle("hidden",!g),f.classList.toggle("flex",g)),h&&(h.classList.toggle("hidden",g),h.classList.toggle("flex",!g)),Wa(),ri(),["cam1","cam2"].forEach(($,E)=>{const M=E+1,R=O.get($);if(ei($,M),!R)return;const le=document.getElementById(`cam-pos-${M}`);le&&R.position&&(le.textContent=`P:${R.position.pan} T:${R.position.tilt} Z:${R.position.zoom}`);const J=document.getElementById(`cam-stream-btn-${M}`),Tt=document.getElementById(`cam-dot-${M}`),$t=document.getElementById(`cam-meta-${M}`);J&&(J.textContent=R.streaming?"Stop Receiving":"Start Receiving",J.className=R.streaming?"px-2 py-0.5 rounded bg-error text-on-error font-label-sm text-[9px] font-bold uppercase shadow-xs":`px-2 py-0.5 rounded bg-surface-container-lowest ${M===1?"text-primary":"text-secondary"} font-label-sm text-[9px] font-bold uppercase shadow-xs`),Tt&&(Tt.className=R.streaming?"w-2 h-2 rounded-full bg-emerald-500 inline-block":"w-2 h-2 rounded-full bg-outline inline-block"),$t&&($t.textContent=R.streaming?"Receiving Preview":"Not Receiving")}),Kt()}function Ka(){const e=document.getElementById("presetRangeInput"),t=e?e.value:"1, 2, 3, 4, 5, 6",n=[];return t.split(",").forEach(a=>{const o=a.trim();if(o)if(o.includes("-")){const[s,i]=o.split("-"),r=parseInt(s??"",10),l=parseInt(i??"",10);if(!Number.isNaN(r)&&!Number.isNaN(l)&&r<=l)for(let c=r;c<=Math.min(l,r+24);c++)c>=0&&c<=254&&!n.includes(c)&&n.push(c)}else{const s=parseInt(o,10);!Number.isNaN(s)&&s>=0&&s<=254&&!n.includes(s)&&n.push(s)}}),n.length>0?n:[1,2,3,4,5,6]}function Un(e,t){var o,s;const n=O.get(e),a=(o=n==null?void 0:n.presets)==null?void 0:o.find(i=>i.id===t);return a!=null&&a.name?a.name:((s=Ms[e])==null?void 0:s[t])||`Preset ${t}`}function ti(e,t){var o;const n=O.get(e),a=(o=n==null?void 0:n.presets)==null?void 0:o.find(s=>s.id===t);return a==null?void 0:a.thumbnail}function Kt(){const e=Ka();["cam1","cam2"].forEach(t=>{const n=document.getElementById(`${t}-presets-grid`);if(!n)return;const a=t==="cam1",o=Rn[t];n.innerHTML=e.map(s=>{const i=s===o,r=Un(t,s),l=ti(t,s),c=`P-${String(s).padStart(2,"0")}`;if(Tn==="thumb"){const f=i?a?"border-2 border-primary ring-2 ring-primary/20":"border-2 border-secondary ring-2 ring-secondary/20":"border border-outline-variant/40",h=l?`<img src="${l}" alt="${r}" class="w-full h-16 object-cover"/>`:`<div class="w-full h-16 bg-inverse-surface flex flex-col items-center justify-center text-inverse-on-surface/60">
                 <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                 <span class="font-label-sm text-[8px] uppercase">No Thumb</span>
               </div>`;return`<button type="button" onclick="handlePresetTap('${t}', ${s})" class="rounded-lg overflow-hidden bg-surface-container-high ${f} flex flex-col active:scale-95 transition-all text-left shadow-xs">
            <div class="relative w-full h-16">
              ${h}
              <span class="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 text-white font-label-sm text-[8px] font-bold">${c}</span>
            </div>
            <div class="px-1.5 py-1 flex items-center justify-between w-full bg-surface-container-low">
              <span class="font-body-md text-[10px] font-semibold text-on-surface truncate">${r}</span>
            </div>
          </button>`}const p=i?a?"bg-primary text-on-primary shadow-sm":"bg-secondary text-on-secondary shadow-sm":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface",d=i?"opacity-80":"text-on-surface-variant";return Tn==="number"?`<button type="button" onclick="handlePresetTap('${t}', ${s})" class="h-12 rounded-lg ${p} p-space-xs flex flex-col items-center justify-center active:scale-95 transition-all">
            <span class="font-label-lg text-[14px] font-bold">${c}</span>
          </button>`:`<button type="button" onclick="handlePresetTap('${t}', ${s})" class="h-12 rounded-lg ${p} p-space-xs flex flex-col justify-between items-start active:scale-95 transition-all">
          <div class="w-full flex items-center justify-between">
            <span class="font-label-sm text-[9px] uppercase ${d}">${c}</span>
            ${l?`<span class="material-symbols-outlined text-[11px] ${d}" title="Thumbnail saved">image</span>`:""}
          </div>
          <span class="font-body-md text-xs font-semibold truncate w-full text-left">${r}</span>
        </button>`}).join("")})}function Dn(){Ue=!Ue,Ue&&ee&&(ee=!1,_t());const e=document.getElementById("savePresetPill"),t=document.getElementById("savePresetKnob"),n=document.getElementById("savePresetSub");e&&t&&(Ue?(e.className="w-8 h-4 rounded-full bg-primary flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-on-primary translate-x-4 transition-transform",n&&(n.textContent="ARMED: Tap slot to save"),m("Save Preset ARMED — tap any preset slot to store")):(e.className="w-8 h-4 rounded-full bg-surface-container-highest flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-outline transition-transform",n&&(n.textContent="Tap slot to store")))}function _t(){const e=document.getElementById("thumbPill"),t=document.getElementById("thumbKnob"),n=document.getElementById("thumbCaptureSub");e&&t&&(ee?(e.className="w-8 h-4 rounded-full bg-secondary flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-on-secondary translate-x-4 transition-transform",n&&(n.textContent="Tap slot to snap thumb")):(e.className="w-8 h-4 rounded-full bg-surface-container-highest flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-outline transition-transform",n&&(n.textContent="Tap or hold for auto")))}async function Sn(e,t){const n=O.get(e),a=(n==null?void 0:n.position)??{pan:0,tilt:0,zoom:0},o=Un(e,t),s=As(e,t,o,a);try{const i=await fetch(`/api/v1/cameras/${e}/presets/${t}/thumbnail`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({thumbnail:s})});if(i.ok){const r=await i.json();r.camera&&O.set(e,r.camera)}}catch{if(n){const i=n.presets.find(r=>r.id===t);i?i.thumbnail=s:n.presets.push({id:t,name:o,thumbnail:s})}}Ya("thumb")}async function ni(){if(on)return;on=!0;const e=re,t=Ka(),n=document.getElementById("auto-sweep-badge");n&&n.classList.remove("hidden"),m(`Auto Thumb Capture started for ${e.toUpperCase()} (${t.length} presets)`);try{for(let a=0;a<t.length;a++){const o=t[a];Rn[e]=o,n&&(n.textContent=`Auto-Thumb: Preset ${o} (${a+1}/${t.length}) — recalling & waiting 2s...`),Kt(),await fetch(`/api/v1/cameras/${e}/presets/${o}/recall`,{method:"POST"}).catch(()=>{});const s=await fetch(`/api/v1/cameras/${e}`).catch(()=>null);s&&s.ok&&(O.set(e,await s.json()),ie()),await new Promise(i=>setTimeout(i,2e3)),await Sn(e,o),m(`Captured thumbnail for ${e.toUpperCase()} Preset ${o}`)}m(`Completed Auto Thumb Capture (${t.length} presets)`)}finally{on=!1,n&&n.classList.add("hidden")}}function ai(){const e=document.getElementById("setThumbBtn");if(!e)return;let t=null,n=!1;e.addEventListener("pointerdown",()=>{n=!1,t=setTimeout(()=>{n=!0,t=null,ni()},600)});const a=()=>{t&&(clearTimeout(t),t=null)};e.addEventListener("pointerup",a),e.addEventListener("pointerleave",a),e.addEventListener("click",o=>{if(o.stopPropagation(),n){n=!1;return}ee=!ee,ee&&Ue&&Dn(),_t(),ee&&m("Thumb Capture ARMED — tap any preset to snap thumbnail (or hold button for auto-sweep)")})}function Ya(e){Tn=e,document.querySelectorAll(".preset-view-mode-btn").forEach(n=>{n.getAttribute("data-mode")===e?n.className="preset-view-mode-btn px-2 py-1 rounded font-label-sm text-[10px] uppercase font-bold bg-surface text-primary shadow-sm":n.className="preset-view-mode-btn px-2 py-1 rounded font-label-sm text-[10px] uppercase text-on-surface-variant"}),Kt()}async function oi(e,t){if(re=e,Rn[e]=t,Ue){const n=Un(e,t);try{if((await fetch(`/api/v1/cameras/${e}/presets/${t}/save`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n})})).ok){ee&&(await Sn(e,t),ee=!1,_t()),m(`Saved ${e.toUpperCase()} Preset ${t} (${n})`),Dn();const o=await fetch(`/api/v1/cameras/${e}`);o.ok&&O.set(e,await o.json()),ie()}}catch{m("Failed to save preset")}return}if(ee){await Sn(e,t),ee=!1,_t(),m(`Captured thumbnail for ${e.toUpperCase()} Preset ${t}`);return}try{if((await fetch(`/api/v1/cameras/${e}/presets/${t}/recall`,{method:"POST"})).ok){m(`Recalled ${e.toUpperCase()} Preset ${t}`);const a=await fetch(`/api/v1/cameras/${e}`);a.ok&&O.set(e,await a.json()),ie()}}catch{m("Failed to recall preset")}}async function si(e){const t=re,n=Math.min(23,Se);try{if((await fetch(`/api/v1/cameras/${t}/move`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({direction:e,panSpeed:Se,tiltSpeed:n})})).ok){const o=await fetch(`/api/v1/cameras/${t}`);o.ok&&O.set(t,await o.json()),ie()}}catch{m("PTZ Move failed")}}async function ii(e){const t=re;try{if((await fetch(`/api/v1/cameras/${t}/zoom`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:e,speed:4})})).ok){const a=await fetch(`/api/v1/cameras/${t}`);a.ok&&O.set(t,await a.json()),ie()}}catch{m("Zoom command failed")}}const rn="h-10 rounded-lg bg-primary text-on-primary font-label-md text-[10px] font-semibold flex items-center justify-center text-center leading-tight active:scale-95 transition-all",ln="h-10 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-[10px] font-semibold flex items-center justify-center text-center leading-tight active:scale-95 transition-all";function ri(){const e=O.get(re),t=(e==null?void 0:e.privacyBlur)===!0,n=(e==null?void 0:e.focusMode)==="manual",a=document.getElementById("focus-af-btn"),o=document.getElementById("focus-mf-btn"),s=document.getElementById("privacy-blur-btn");a&&(a.className=!t&&!n?rn:ln),o&&(o.className=!t&&n?rn:ln),s&&(s.className=`col-span-2 gap-1 ${t?rn:ln}`)}async function qa(e){const t=await fetch(`/api/v1/cameras/${e}`);t.ok&&O.set(e,await t.json()),ie()}async function li(e){const t=re;try{(await fetch(`/api/v1/cameras/${t}/focus`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:e})})).ok?(await qa(t),m(`${t.toUpperCase()} focus: ${e.toUpperCase()}`)):m("Focus command failed")}catch{m("Focus command failed")}}async function ci(){var n;const e=re,t=((n=O.get(e))==null?void 0:n.privacyBlur)!==!0;try{(await fetch(`/api/v1/cameras/${e}/privacy-blur`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:t})})).ok?(await qa(e),m(`${e.toUpperCase()} privacy blur ${t?"ON":"OFF"}`)):m("Privacy blur failed")}catch{m("Privacy blur failed")}}async function di(e){var a,o;const t=!!((a=O.get(e))!=null&&a.streaming),n=t?`/api/v1/cameras/${e}/stream/stop`:`/api/v1/cameras/${e}/stream/start`;try{if((await fetch(n,{method:"POST"})).ok){const i=await fetch(`/api/v1/cameras/${e}`);i.ok&&O.set(e,await i.json());const r=((o=O.get(e))==null?void 0:o.streaming)??!t;ie();const l=vt(e);m(`${l}: ${r?"Started receiving preview":"Stopped receiving preview"}`)}}catch{m("Camera receive toggle failed")}}function pi(e){Se=Math.max(1,Math.min(24,Se+e));const t="0x"+Se.toString(16).toUpperCase().padStart(2,"0"),n=document.getElementById("ptz-speed-label"),a=document.getElementById("ptz-speed-bar");n&&(n.textContent=`SPD ${Se} (${t})`),a&&(a.style.width=`${Math.round(Se/24*100)}%`)}function Re(e){oa(document.getElementById(e))}function ui(e){var t;G=e.activeTab||"outputs";for(const n of e.sources||[])kt.set(n.id,n);for(const n of e.outputs||[])nt.set(n.id,n);for(const n of e.effects||[])U.set(n.sourceId,n);for(const n of e.cameras||[])O.set(n.id,n);for(const n of e.pipgmPipelines||[])Ht.set(n.id,n);(t=e.multiview)!=null&&t.layout&&(On=e.multiview.layout),e.matrix&&(W=e.matrix),e.rtspOut&&(k={...k,...e.rtspOut})}async function fi(){if(window.__PIMATRIX_INITIAL__){ui(window.__PIMATRIX_INITIAL__);return}const e=window.location.pathname;e.startsWith("/inputs")?G="inputs":e.startsWith("/cameras")?G="cameras":e.startsWith("/pipgm")||e.startsWith("/renderer")?G="renderer":e.startsWith("/voice")?G="voice":G="outputs";const[t,n,a,o,s,i]=await Promise.all([fetch("/api/v1/sources?includeHidden=true").catch(()=>null),fetch("/api/v1/outputs").catch(()=>null),fetch("/api/v1/effects?includeHidden=true").catch(()=>null),fetch("/api/v1/cameras").catch(()=>null),fetch("/api/v1/matrix").catch(()=>null),fetch("/api/v1/outputs/rtsp").catch(()=>null)]);t!=null&&t.ok&&(await t.json()).items.forEach(l=>kt.set(l.id,l)),n!=null&&n.ok&&(await n.json()).items.forEach(l=>nt.set(l.id,l)),a!=null&&a.ok&&(await a.json()).items.forEach(l=>U.set(l.sourceId,l)),o!=null&&o.ok&&(await o.json()).items.forEach(l=>O.set(l.id,l)),s!=null&&s.ok&&(W=await s.json()),i!=null&&i.ok&&(k={...k,...await i.json()})}async function mi(){const[e,t]=await Promise.all([fetch("/api/v1/outputs").catch(()=>null),fetch("/api/v1/effects?includeHidden=true").catch(()=>null)]);e!=null&&e.ok&&(await e.json()).items.forEach(n=>nt.set(n.id,n)),t!=null&&t.ok&&(await t.json()).items.forEach(n=>U.set(n.sourceId,n)),K()}function bi(){const e=new EventSource(wn("/api/v1/events?client=picontrol")),t=document.getElementById("sse-dot"),n=document.getElementById("sse-status-text");e.addEventListener("open",()=>{t&&(t.className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"),n&&(n.textContent="ONLINE")}),e.addEventListener("ecosystem",a=>{try{const o=JSON.parse(a.data);o&&Array.isArray(o.inUseTabs)&&Ft(o)}catch{}}),e.addEventListener("output",a=>{try{const o=JSON.parse(a.data);o.output&&(nt.set(o.output.id,o.output),K())}catch{}}),e.addEventListener("effects",a=>{try{const o=JSON.parse(a.data);o.sourceId&&o.effects&&(U.set(o.sourceId,o.effects),K())}catch{}}),e.addEventListener("pipgm",a=>{try{const o=JSON.parse(a.data);if(o.pipeline){Ht.set(o.pipeline.id,o.pipeline);const s=U.get(o.pipeline.id);s&&(s.fadeToBlack=o.pipeline.fadeToBlack,s.muted=!o.pipeline.audioEnabled),K()}}catch{}}),e.addEventListener("matrix",a=>{try{const o=JSON.parse(a.data);o&&(W={locked:!!o.locked,routes:o.routes||W.routes},yt(),Nn())}catch{}}),e.addEventListener("rtsp",a=>{try{const o=JSON.parse(a.data);o&&(k={...k,...o},Be())}catch{}}),e.addEventListener("pisound",a=>{try{const o=JSON.parse(a.data);ms(o)}catch{}}),e.addEventListener("camera",a=>{try{const o=JSON.parse(a.data),s=O.get(o.id);s&&(o.position&&(s.position=o.position),typeof o.streaming=="boolean"&&(s.streaming=o.streaming),o.smartFrame&&(s.smartFrame=o.smartFrame),typeof o.privacyBlur=="boolean"&&(s.privacyBlur=o.privacyBlur),o.focusMode&&(s.focusMode=o.focusMode),ie())}catch{}}),e.addEventListener("error",()=>{t&&(t.className="w-2 h-2 rounded-full bg-error"),n&&(n.textContent="RECONNECTING")})}window.switchTab=e=>Gt(e,!0);window.openMoreModal=()=>{var e;return(e=document.getElementById("more-modal-overlay"))==null?void 0:e.showModal()};window.closeMoreModal=()=>{var e;return(e=document.getElementById("more-modal-overlay"))==null?void 0:e.close()};window.selectMoreTab=e=>{Gt(e),window.closeMoreModal()};window.triggerEcosystemProbe=()=>void Ls();window.applyEcosystemVisibility=e=>Ft(e);window.closeYoutubeCreateModal=()=>{var e;return(e=document.getElementById("youtube-create-modal"))==null?void 0:e.close()};window.closeYoutubeStopModal=()=>{var e;return(e=document.getElementById("youtube-stop-modal"))==null?void 0:e.close()};window.handleAdHocCreateSubmit=()=>{var a,o,s;const e=(a=document.getElementById("yt-create-title"))==null?void 0:a.value.trim(),t=(o=document.getElementById("yt-create-privacy"))==null?void 0:o.value,n=(s=document.getElementById("yt-create-desc"))==null?void 0:s.value.trim();if(!e){alert("Sy�t� l�hetykselle otsikko.");return}window.closeYoutubeCreateModal(),Ro(e,t,n)};window.handleConfirmStopBroadcast=()=>{window.closeYoutubeStopModal(),$a()};window.triggerCamDirectorCue=e=>{Sa(re==="cam2"?"tally02":"tally01",e)};window.selectHdmiSource=Ha;window.openAuxModal=Os;window.closeAuxModal=Fa;window.confirmAuxPick=Rs;window.toggleOutputInputControl=Ns;window.toggleInputEffect=Ga;window.openOutputCropModal=$n;window.openSourceCropModal=jn;window.closeCropModal=Us;window.applySourceCropPreset=Vs;window.moveSourceCrop=Hs;window.openAuthModal=za;window.closeAuthModal=Xa;window.submitAuthPassword=xi;window.clearAuthPassword=gi;window.showMediaMtxModal=vi;window.closeMediaMtxModal=yi;window.copyMediaMtxPassword=hi;window.resizeSourceCrop=Fs;window.toggleSourceCropLockAspect=Gs;window.openRtspModal=Ws;window.closeRtspModal=Ks;window.assignRtsp=Ys;window.setRtspQualityProfile=qs;window.updateRtspCustomQuality=zs;window.toggleRtspStream=Xs;window.toggleMatrixLock=Js;window.routeMatrixCrosspoint=Zs;window.tapCameraCard=Qs;window.toggleCameraStream=di;window.toggleSavePresetMode=Dn;window.setPresetViewMode=Ya;window.renderCameraPresets=Kt;window.handlePresetTap=oi;window.sendPTZMove=si;window.sendPTZZoom=ii;window.setFocusMode=li;window.togglePrivacyBlur=ci;window.adjustPtzSpeed=pi;function _n(){var o,s;const e=localStorage.getItem("pimatrix_auth_token"),t=document.getElementById("top-auth-label"),n=document.getElementById("top-auth-icon");if(!t||!n)return;((o=window.__PIMATRIX_INITIAL__)==null?void 0:o.isWhitelisted)?(t.textContent="LAN PASS",n.textContent="verified_user",n.classList.remove("text-error","text-primary"),n.classList.add("text-emerald-400")):e?(t.textContent="SAVED",n.textContent="lock_open",n.classList.remove("text-error","text-emerald-400"),n.classList.add("text-primary")):(s=window.__PIMATRIX_INITIAL__)!=null&&s.authRequired?(t.textContent="LOCKED",n.textContent="lock",n.classList.remove("text-primary","text-emerald-400"),n.classList.add("text-error")):(t.textContent="OPEN",n.textContent="lock_open",n.classList.remove("text-error","text-emerald-400"),n.classList.add("text-primary"))}function za(){var s,i;const e=document.getElementById("auth-modal-overlay");if(!e)return;const t=document.getElementById("auth-key-input"),n=document.getElementById("auth-error-msg");t&&(t.value=localStorage.getItem("pimatrix_auth_token")||"");const a=(s=window.__PIMATRIX_INITIAL__)==null?void 0:s.isWhitelisted,o=(i=window.__PIMATRIX_INITIAL__)==null?void 0:i.clientIp;a&&n?(n.textContent=`Operator LAN IP (${o||"Whitelisted"}) is authorized. Password entry is optional.`,n.classList.remove("hidden","text-error"),n.classList.add("text-emerald-400")):n&&(n.classList.remove("text-emerald-400"),n.classList.add("text-error","hidden"),n.textContent=""),e.showModal()}function Xa(){const e=document.getElementById("auth-modal-overlay");e==null||e.close()}async function xi(){var o;const e=document.getElementById("auth-key-input"),t=document.getElementById("auth-remember-check"),n=document.getElementById("auth-error-msg"),a=((o=e==null?void 0:e.value)==null?void 0:o.trim())||"";try{(await Ra("/api/v1/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:a})})).ok?(t!=null&&t.checked?localStorage.setItem("pimatrix_auth_token",a):localStorage.removeItem("pimatrix_auth_token"),_n(),Xa()):n&&(n.textContent="Invalid API key / password for this PiMatrix node.",n.classList.remove("hidden"))}catch(s){n&&(n.textContent="Network error verifying password: "+String(s),n.classList.remove("hidden"))}}function gi(){localStorage.removeItem("pimatrix_auth_token");const e=document.getElementById("auth-key-input");e&&(e.value=""),_n();const t=document.getElementById("auth-error-msg");t&&(t.textContent="Saved password cleared.",t.classList.remove("hidden"))}function vi(){var s;const e=document.getElementById("mediamtx-modal-overlay");if(!e)return;const t=window.location.hostname||"127.0.0.1",n=document.getElementById("rtmp-ingest-val"),a=document.getElementById("srt-ingest-val"),o=document.getElementById("mediamtx-pass-val");if(n&&(n.textContent=`rtmp://${t}:1935/<sourceId>`),a&&(a.textContent=`srt://${t}:8890?streamid=publish:<sourceId>`),o){const i=(s=window.__PIMATRIX_INITIAL__)==null?void 0:s.mediaMtxPassword;o.textContent=i||"None (Open)"}e.showModal()}function yi(){const e=document.getElementById("mediamtx-modal-overlay");e==null||e.close()}function hi(){var t;const e=((t=window.__PIMATRIX_INITIAL__)==null?void 0:t.mediaMtxPassword)||"";e&&navigator.clipboard.writeText(e)}window.copyIngestVal=e=>{const t=document.getElementById(e);t!=null&&t.textContent&&navigator.clipboard.writeText(t.textContent.trim())};async function wi(){var o;Re("auth-modal-overlay"),Re("mediamtx-modal-overlay"),_n(),Re("aux-modal-overlay"),Re("rtsp-modal-overlay"),Re("crop-modal-overlay"),Re("comp-settings-modal"),Ds(),_s(),ai(),(o=document.getElementById("crop-modal-overlay"))==null||o.addEventListener("close",()=>window.setCropDialogTab("crop")),eo(m),mo(m),oo(m,mi),$o();const e=document.getElementById("youtube-root");e&&Io(e);const t=document.getElementById("tally-root");t&&Do(t);const n=document.getElementById("radio-root");n&&ts(n);const a=document.getElementById("sound-root");a&&us(a,m),fetch("/api/v1/composites/compose1").then(s=>s.ok?s.json():null).then(s=>{s!=null&&s.keyColor&&(Na=s.keyColor,K())}).catch(()=>{}),await fi(),Is(),fetch("/api/v1/ecosystem").then(s=>s.ok?s.json():null).then(s=>{s!=null&&s.inUseTabs&&Ft(s)}).catch(()=>{}),Gt(G,!1),K(),yt(),ie(),bi()}wi();
