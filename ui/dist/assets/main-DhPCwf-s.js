import"./modulepreload-polyfill-B5Qt9EMX.js";const hn=1e3,wn=[1,2,3];let T=null,he=1,We=null,xt=()=>{};function Gt(e){return document.getElementById(e)}function be(e,t,a){const o=Gt(e);o&&(o.className=[t,...a].filter(Boolean).join(" "))}function bt(){var n;const e=(T==null?void 0:T.connected)===!0,t=Gt("atem-status");t&&(t.textContent=T?e?`PGM ${T.programInput??"-"} • PVW ${T.previewInput??"-"}`:"Offline":"Connecting...");for(const s of wn){const i=[];e&&(T==null?void 0:T.programInput)===s?i.push("atem-pgm"):e&&(T==null?void 0:T.previewInput)===s&&i.push("atem-pvw"),be(`atem-in-${s}`,"atem-btn",i)}const a=T==null?void 0:T.fadeToBlack;be("atem-ftb","atem-btn atem-btn-text",a!=null&&a.fullyBlack||a!=null&&a.inTransition?["atem-pgm",a.inTransition?"atem-pulse":""]:[]),be("atem-auto","atem-btn atem-btn-text",T!=null&&T.transition.inTransition?["atem-pgm","atem-pulse"]:[]),be("atem-cut","atem-btn atem-btn-text",[]);const o=T==null?void 0:T.downstreamKeyers.find(s=>s.dsk===he);for(const s of[1,2]){const i=T==null?void 0:T.downstreamKeyers.find(r=>r.dsk===s);be(`atem-dsk-${s}`,"atem-btn atem-dsk",[s===he?"atem-selected":"",i!=null&&i.onAir?"atem-pgm":""])}be("atem-tie","atem-btn atem-btn-text",o!=null&&o.tie?["atem-tie"]:[]),be("atem-onair","atem-btn atem-btn-text",o!=null&&o.onAir?["atem-pgm"]:[]);for(const s of["atem-in-1","atem-in-2","atem-in-3","atem-ftb","atem-cut","atem-auto","atem-dsk-1","atem-dsk-2","atem-tie","atem-onair"])(n=Gt(s))==null||n.toggleAttribute("disabled",!e)}async function ve(e,t,a){try{const o={method:e};e!=="GET"&&(o.headers={"Content-Type":"application/json"},o.body=JSON.stringify(a??{}));const n=await fetch(t,o);return n.status===503?(T={connected:!1,programInput:null,previewInput:null,transition:{inTransition:!1,remainingFrames:0},fadeToBlack:{fullyBlack:!1,inTransition:!1,remainingFrames:0},downstreamKeyers:[]},bt(),e!=="GET"&&xt("ATEM is not connected"),null):n.ok?(T=await n.json(),bt(),T):(e!=="GET"&&xt(`ATEM command failed (${n.status})`),null)}catch{return e!=="GET"&&xt("ATEM request failed"),null}}function ya(){return ve("GET","/api/v1/atem")}function Tn(e){if(!e){We&&clearInterval(We),We=null;return}We||(ya(),We=setInterval(()=>{document.hidden||ya()},hn))}function kn(e){xt=e,window.atemSelectInput=async t=>{await ve("PUT","/api/v1/atem/preview",{input:t})},window.atemCut=async()=>{await ve("POST","/api/v1/atem/cut")},window.atemAuto=async()=>{await ve("POST","/api/v1/atem/auto")},window.atemFtb=async()=>{await ve("POST","/api/v1/atem/ftb")},window.atemSelectDsk=t=>{he=t,bt()},window.atemToggleTie=async()=>{const t=T==null?void 0:T.downstreamKeyers.find(a=>a.dsk===he);await ve("PUT",`/api/v1/atem/dsk/${he}/tie`,{tie:!((t==null?void 0:t.tie)??!1)})},window.atemToggleOnAir=async()=>{const t=T==null?void 0:T.downstreamKeyers.find(a=>a.dsk===he);await ve("PUT",`/api/v1/atem/dsk/${he}/on-air`,{onAir:!((t==null?void 0:t.onAir)??!1)})},bt()}function Oa(e){if(!e)return;let t=!1;e.addEventListener("pointerdown",a=>{t=a.target===e}),e.addEventListener("click",a=>{const o=a.target===e&&t;t=!1,o&&e.close()})}const et="/api/v1/quick-options",va=40;let Be=()=>{},Ra=async()=>{},tt=[],qt=!1,re=null,gt=null;function z(e){return document.getElementById(e)}function ft(e){return e.replace(/[&<>"']/g,t=>`&#${t.charCodeAt(0)};`)}async function sa(e){var t;try{return((t=(await e.json()).error)==null?void 0:t.message)??`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}async function ia(){try{const e=await fetch(et);if(!e.ok)throw new Error(String(e.status));tt=(await e.json()).items,qt=!1}catch{qt=!0}ja()}function ja(){const e=z("quick-grid");if(e){if(qt){e.innerHTML='<span class="col-span-3 font-label-sm text-[10px] text-on-surface-variant uppercase">Quick options unavailable</span>';return}if(tt.length===0){e.innerHTML='<span class="col-span-3 font-label-sm text-[10px] text-on-surface-variant uppercase">None saved yet. Set up the outputs, then press Save as quick.</span>';return}e.innerHTML=tt.map(t=>{const o=t.id===gt?"bg-primary text-on-primary shadow-sm":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface";return`<button type="button" data-quick-id="${ft(t.id)}" onclick="quickApply('${ft(t.id)}')" oncontextmenu="event.preventDefault(); quickEdit('${ft(t.id)}')" title="Tap to apply • Hold to rename or delete" class="h-12 rounded-lg ${o} p-space-xs flex items-center justify-center active:scale-95 transition-all">
        <span class="font-body-md text-xs font-semibold truncate w-full text-center">${ft(t.name)}</span>
      </button>`}).join("")}}function ha(e){var o,n;re=e;const t=z("quick-modal"),a=z("quick-name-input");!t||!a||(a.value=(e==null?void 0:e.name)??"",z("quick-modal-title").textContent=e?"Edit quick option":"Save as quick",(o=z("quick-delete-btn"))==null||o.classList.toggle("hidden",!e),(n=z("quick-error"))==null||n.classList.add("hidden"),t.open||t.showModal(),a.focus())}function Ae(e){const t=z("quick-error");t&&(t.textContent=e,t.classList.remove("hidden"))}async function $n(){var a;const e=z("quick-name-input"),t=(e==null?void 0:e.value.trim())??"";if(!t)return Ae("Enter a name");if(t.length>va)return Ae(`At most ${va} characters`);try{const o=await fetch(re?`${et}/${encodeURIComponent(re.id)}`:et,{method:re?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t})});if(!o.ok)return Ae(await sa(o));(a=z("quick-modal"))==null||a.close(),Be(re?`Renamed to ${t}`:`Saved quick option ${t}`),await ia()}catch{Ae("Request failed")}}async function En(){var e;if(re)try{const t=await fetch(`${et}/${encodeURIComponent(re.id)}`,{method:"DELETE"});if(!t.ok)return Ae(await sa(t));(e=z("quick-modal"))==null||e.close(),Be(`Deleted ${re.name}`),gt===re.id&&(gt=null),await ia()}catch{Ae("Request failed")}}async function Cn(e){const t=tt.find(a=>a.id===e);try{const a=await fetch(`${et}/${encodeURIComponent(e)}/apply`,{method:"POST"});if(!a.ok){Be(`Quick option: ${await sa(a)}`);return}gt=e,ja(),Be(`Applied ${(t==null?void 0:t.name)??"quick option"}`),await Ra()}catch{Be("Quick option request failed")}}function Sn(e,t){Be=e,Ra=t,window.quickSaveOpen=()=>ha(null),window.quickEdit=a=>ha(tt.find(o=>o.id===a)??null),window.quickApply=a=>Cn(a),window.quickSubmit=()=>$n(),window.quickDelete=()=>En(),Oa(z("quick-modal")),ia()}const Na=["hama","rtmp1","rtmp2","cam1","cam2","cam3","PiPGM1","PiPGM2","PiPGM3"],wa=.05,Ua=.6,Da=1,In=.05,yt=[-1,-.5,0,.5,1],_a="picontrol.compositeSnap",Pn={"10:16":10/16,"9:16":9/16};let vt=()=>{},ra="compose1",u=null,Te=null,pe=null,Oe=0,$e=null,Ee=Mn();const Re="/api/v1/composites";function Mn(){try{return localStorage.getItem(_a)!=="off"}catch{return!0}}function Ta(e){const t=at(e,-1,1);return Ee?yt.reduce((a,o)=>Math.abs(o-t)<Math.abs(a-t)?o:a,yt[0]):Math.round(t*100)/100}function Lt(e,t){if(!Ee)return at(Math.round((e+t*In)*100)/100,-1,1);const a=1e-6;return(t>0?yt.find(n=>n>e+a):[...yt].reverse().find(n=>n<e-a))??at(e,-1,1)}function Va(){const e=y("comp-snap-btn"),t=y("comp-snap-label");t&&(t.textContent=Ee?"Snap on":"Snap off"),e&&(e.className=`px-2 h-6 rounded-md font-label-sm text-[9px] font-bold uppercase flex items-center gap-1 active:scale-95 ${Ee?"bg-primary text-on-primary":"bg-surface-container-high text-on-surface-variant"}`)}function y(e){return document.getElementById(e)}async function Yt(e){var t;try{return((t=(await e.json()).error)==null?void 0:t.message)??`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}async function la(e,t,a){try{const o={method:e};e!=="GET"&&(o.headers={"Content-Type":"application/json"},o.body=JSON.stringify(a??{}));const n=await fetch(t,o);return n.ok?await n.json():(vt(`Composite: ${await Yt(n)}`),null)}catch{return vt("Composite request failed"),null}}function at(e,t,a){return Math.max(t,Math.min(a,e))}function Fa(e){const t=at(e.slideScale,Ua,Da),a=Math.min(1,t*Pn[e.slideAspect]*(e.height/e.width)),o=1-t;return{x:(1-a)/2*(1+(e.offsetX??(e.side==="left"?-1:1))),y:o/2*(1+(e.offsetY??0)),w:a,h:t}}function ge(e){const t=y("cs-error");t&&(t.textContent=e??"",t.classList.toggle("hidden",e===null))}function He(){for(const i of["compose1","compose2"]){const r=y(`comp-target-${i}`);if(!r)continue;const l=i===ra;r.className=l?"flex-1 px-1.5 py-1 rounded font-label-sm text-[10px] uppercase font-bold bg-surface text-primary shadow-sm":"flex-1 px-1.5 py-1 rounded font-label-sm text-[10px] uppercase text-on-surface-variant"}const e=y("comp-status"),t=y("comp-readout"),a=y("comp-run-btn"),o=y("comp-frame"),n=y("comp-slide"),s=y("comp-slide-tag");if(!u){e&&(e.textContent="Loading...");return}if(Ha(),Va(),e){const i=[u.enabled?u.state:"stopped"];u.hasSlide||i.push("no slide yet"),u.lastError&&i.push(u.lastError),e.textContent=i.join(" • ")}if(t&&(t.textContent=`${u.slideAspect} • ${Math.round(u.slideScale*100)}% • X ${Math.round((u.offsetX??0)*100)}% • Y ${Math.round((u.offsetY??0)*100)}%`),a&&(a.textContent=u.enabled?"Stop":"Start",a.className=u.enabled?"px-3 h-8 rounded-lg bg-error text-on-error font-label-sm text-[10px] font-bold uppercase active:scale-95":"px-3 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-[10px] font-bold uppercase active:scale-95"),o&&(o.style.aspectRatio=`${u.width} / ${u.height}`,u.kind==="atem-media"?o.style.background="repeating-conic-gradient(#3b3631 0% 25%, #4a443e 0% 50%) 50% / 16px 16px":(o.style.background=u.keyMode==="luma"?"#000000":u.keyColor,o.style.backgroundSize="")),n){const i=Fa(u);n.style.left=`${i.x*100}%`,n.style.top=`${i.y*100}%`,n.style.width=`${i.w*100}%`,n.style.height=`${i.h*100}%`}s&&(s.textContent=u.slideAspect);for(const[i,r]of[["comp-preset-left",(u.offsetX??-1)===-1],["comp-preset-right",(u.offsetX??-1)===1],["comp-preset-10-16",u.slideAspect==="10:16"],["comp-preset-9-16",u.slideAspect==="9:16"]]){const l=y(i);l==null||l.classList.toggle("ring-2",r),l==null||l.classList.toggle("ring-primary",r)}}function Bt(e){return e.slideSource==="source"?`src:${e.sourceId}`:e.slideSource==="piprogram"?`pip:${e.pipelineId}`:"upload"}function An(e){return e==="upload"?"an uploaded slide":e.startsWith("pip:")?`piprogram slides (${e.slice(4)})`:`live ${e.slice(4)}`}function Ha(){const e=y("comp-input-select");if(e&&u){e.value=Bt(u);for(const r of Array.from(e.options))r.disabled=u.kind==="atem-media"&&r.value.startsWith("src:")}const t=y("comp-move-overlay");if(!t)return;const a=$e!==null&&Na.includes($e),o=u!==null&&a&&Bt(u)!==`src:${$e}`;t.classList.toggle("hidden",!o),t.classList.toggle("flex",o);const n=y("comp-move-text"),s=y("comp-move-btn");if(!o||!u)return;const i=u.kind==="hdmi-key";n&&(n.textContent=i?`Composite input is ${An(Bt(u))}`:"The ATEM media composite cannot show live video"),s&&s.classList.toggle("hidden",!i)}function Ga(e){$e=e,Ha()}function Ot(e){const t=y("comp-preview-img"),a=y("comp-preview-empty");t==null||t.classList.add("hidden"),a&&(a.textContent=e,a.classList.remove("hidden"))}const Ln=3e3;async function ca(){var a;if(!u)return;const e=Oe,t=u.slideSource==="source";if(t&&(pe&&clearTimeout(pe),pe=setTimeout(()=>{e===Oe&&ca()},Ln)),!t&&!u.hasSlide){Ot("No preview yet. Send a slide first.");return}try{const o=await fetch(`${Re}/${u.id}/preview.png`);if(!o.ok){Ot(t?"No picture from this source right now.":`Preview unavailable (${o.status})`);return}const n=await o.blob();if(e!==Oe)return;Te&&URL.revokeObjectURL(Te),Te=URL.createObjectURL(n);const s=y("comp-preview-img");s&&(s.src=Te,s.classList.remove("hidden")),(a=y("comp-preview-empty"))==null||a.classList.add("hidden")}catch{Ot("Preview unavailable")}}function qa(){pe&&clearTimeout(pe),pe=setTimeout(()=>void ca(),500)}async function Wt(){const e=++Oe;u=null,He();const t=await la("GET",`${Re}/${ra}`);e===Oe&&(u=t,He(),ca())}async function H(e){if(!u)return;const t=await la("PUT",`${Re}/${u.id}`,e);t&&(u=t,He(),qa())}function Bn(){Wt()}function On(){Oe++,pe&&clearTimeout(pe),Te&&URL.revokeObjectURL(Te),Te=null}function Rn(){const e=y("comp-frame");if(!e)return;let t=!1,a=0,o=0,n=0,s=0;e.addEventListener("pointerdown",l=>{if(u){t=!0,a=l.clientX,o=l.clientY,n=u.offsetX??(u.side==="left"?-1:1),s=u.offsetY??0;try{e.setPointerCapture(l.pointerId)}catch{}}});const i=l=>{if(!t||!u)return;const c=e.getBoundingClientRect();if(!c.width||!c.height)return;const p=Fa(u),d=1-p.w,f=1-p.h;d>0&&(u.offsetX=Ta(n+(l.clientX-a)/(c.width*(d/2)))),f>0&&(u.offsetY=Ta(s+(l.clientY-o)/(c.height*(f/2)))),u.side=(u.offsetX??-1)<0?"left":"right",He()};e.addEventListener("pointermove",i);const r=()=>{!t||!u||(t=!1,H({offsetX:u.offsetX,offsetY:u.offsetY??0}))};e.addEventListener("pointerup",r),e.addEventListener("pointercancel",r)}function jn(e){window.compSelectInput=async t=>{t==="upload"?await H({slideSource:"upload"}):t.startsWith("pip:")?await H({slideSource:"piprogram",pipelineId:t.slice(4)}):await H({slideSource:"source",sourceId:t.slice(4)})},window.compMoveHere=async()=>{$e&&Na.includes($e)&&await window.compSelectInput(`src:${$e}`)},vt=e,Rn(),window.setCropDialogTab=t=>{var l,c;const a=t==="composite";(l=y("crop-pane-crop"))==null||l.classList.toggle("hidden",a),(c=y("crop-pane-composite"))==null||c.classList.toggle("hidden",!a);const o="flex-1 px-2 py-1 rounded font-label-sm text-[11px] uppercase font-bold bg-surface text-primary shadow-sm",n="flex-1 px-2 py-1 rounded font-label-sm text-[11px] uppercase text-on-surface-variant",s=y("crop-tab-crop"),i=y("crop-tab-composite");s&&(s.className=a?n:o),i&&(i.className=a?o:n);const r=y("crop-dialog-subtitle");r&&(r.textContent=a?"Drag the slide • Presets left and right":"Drag lower box • Upper view shows unobstructed crop"),a?Bn():On()},window.compSelectTarget=async t=>{ra=t,await Wt()},window.compToggleRun=async()=>{if(!u)return;const t=await la("POST",`${Re}/${u.id}/${u.enabled?"stop":"start"}`);t&&(u=t,He())},window.compPreset=async t=>{t==="left"||t==="right"?await H({side:t}):t==="reset"?await H({offsetX:-1,slideAspect:"10:16",slideScale:1,offsetY:0}):await H({slideAspect:t})},window.compMove=async t=>{if(!u)return;const a=u.offsetX??(u.side==="left"?-1:1),o=u.offsetY??0;t==="center"?await H({offsetX:0,offsetY:0}):t==="left"?await H({offsetX:Lt(a,-1)}):t==="right"?await H({offsetX:Lt(a,1)}):await H({offsetY:Lt(o,t==="up"?-1:1)})},window.compToggleSnap=()=>{Ee=!Ee;try{localStorage.setItem(_a,Ee?"on":"off")}catch{}Va()},window.openCompositeSettings=()=>{var s,i;if(!u)return;const t=(r,l)=>{const c=y(r);c&&(c.value=l)};t("cs-width",String(u.width)),t("cs-height",String(u.height)),t("cs-source",u.slideSource),t("cs-pipeline",u.pipelineId),t("cs-live-source",u.sourceId),t("cs-key-color",u.keyColor),t("cs-key-mode",u.keyMode),t("cs-media-slot",String(u.atem.mediaSlot)),t("cs-media-player",String(u.atem.mediaPlayer)),t("cs-dsk",String(u.atem.dskIndex));const a=y("cs-auto-on-air");a&&(a.checked=u.atem.autoOnAir),(s=y("cs-key-fields"))==null||s.classList.toggle("hidden",u.kind!=="hdmi-key"),(i=y("cs-atem-fields"))==null||i.classList.toggle("hidden",u.kind!=="atem-media");const o=y("comp-settings-sub");o&&(o.textContent=u.id),ge(null);const n=y("comp-settings-modal");n&&!n.open&&n.showModal()},window.closeCompositeSettings=()=>{const t=y("comp-settings-modal");t!=null&&t.open&&t.close()},window.compSaveSettings=async()=>{var o,n,s,i,r,l;if(!u)return;const t=c=>{var p;return Number((p=y(c))==null?void 0:p.value)},a={width:t("cs-width"),height:t("cs-height"),slideSource:((o=y("cs-source"))==null?void 0:o.value)??u.slideSource,pipelineId:((n=y("cs-pipeline"))==null?void 0:n.value)??u.pipelineId,sourceId:((s=y("cs-live-source"))==null?void 0:s.value)??u.sourceId};u.kind==="hdmi-key"?(a.keyColor=((i=y("cs-key-color"))==null?void 0:i.value)??u.keyColor,a.keyMode=((r=y("cs-key-mode"))==null?void 0:r.value)??u.keyMode):a.atem={mediaSlot:t("cs-media-slot"),mediaPlayer:t("cs-media-player"),dskIndex:t("cs-dsk"),autoOnAir:((l=y("cs-auto-on-air"))==null?void 0:l.checked)??!1};try{const c=await fetch(`${Re}/${u.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!c.ok){ge(await Yt(c));return}u=await c.json(),He(),qa(),window.closeCompositeSettings()}catch{ge("Request failed")}},window.compSendSlide=async()=>{var a,o;const t=(o=(a=y("cs-slide-file"))==null?void 0:a.files)==null?void 0:o[0];if(!t){ge("Choose a PNG file first");return}try{const n=await fetch(`${Re}/slide`,{method:"PUT",headers:{"Content-Type":"image/png"},body:t});if(!n.ok){ge(await Yt(n));return}ge(null),vt("Test slide sent"),await Wt()}catch{ge("Request failed")}},window.compResize=async t=>{if(!u)return;const a=at(u.slideScale+(t==="in"?-wa:wa),Ua,Da);await H({slideScale:Math.round(a*100)/100})}}const Rt={},Nn=["on","off","auto"],Un=["on","off","auto","schedule"],Ya={on:"On",off:"Off",auto:"Auto",schedule:"Schedule"},Wa="picontrol.pivoiceToken",Dn=2500,za=Vn();let ue=null,ze,nt=!1,Ze="",zt=[],Z=null,Xt="auto",Xa="keskuskirkko-live",_n="/live.mp3",Jt="https://nettiradio.keskuskirkko.fi/live.mp3";function Vn(e=window.location.search){const t=new URLSearchParams(e).get("voice"),a=Rt==null?void 0:Rt.VITE_PIVOICE_URL;return(t??a??"/voice").replace(/\/+$/,"")}function Ja(){try{return sessionStorage.getItem(Wa)??""}catch{return""}}function Fn(e){try{sessionStorage.setItem(Wa,e)}catch{}}function K(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function Q(e,t,a){const o={Authorization:`Bearer ${Ja()}`};a!==void 0&&(o["Content-Type"]="application/json");const n=await fetch(`${za}${t}`,{method:e,headers:o,body:a===void 0?void 0:JSON.stringify(a)});if(!n.ok)throw new Error(n.status===401?"Token rejected":`pivoice answered ${n.status}`);return await n.json()}async function ka(){try{const e=await fetch("/api/v1/transcripts?limit=10");if(e.ok){const t=await e.json();Array.isArray(t.transcripts)&&(zt=t.transcripts)}}catch{}}async function $a(){var e;try{const t=await fetch("/api/v1/radio-relay");if(t.ok){const a=await t.json();a&&(Z=a.state??null,a.streamName&&(Xa=a.streamName),(e=a.state)!=null&&e.streamUrl&&(Jt=a.state.streamUrl))}}catch{}}function mt(e,t){return Nn.map(a=>`<button type="button" data-action="mode" data-section="${e}" data-value="${a}" class="flex-1 px-2.5 py-1.5 rounded-md font-label-sm text-[11px] uppercase font-bold transition-all ${a===t?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-surface-container-highest hover:text-on-surface"}" ${nt?"disabled":""}>${Ya[a]}</button>`).join("")}function Hn(e){return Un.map(t=>`<button type="button" data-action="capture-mode" data-value="${t}" class="flex-1 px-2 py-1.5 rounded-md font-label-sm text-[10px] uppercase font-bold transition-all ${t===e?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-surface-container-highest hover:text-on-surface"}">${Ya[t]}</button>`).join("")}function Ea(e,t,a){var C,j,x,m,g,$,E,P;if(!ue)return;const o=((x=(j=(C=t==null?void 0:t.radio)==null?void 0:C.targets)==null?void 0:j[0])==null?void 0:x.mode)??"auto",n=((m=t==null?void 0:t.auditor)==null?void 0:m.mode)??(e==null?void 0:e.transcription.mode)??"auto",s=(($=(g=t==null?void 0:t.captions)==null?void 0:g.relay)==null?void 0:$.mode)??"auto",i=((P=(E=t==null?void 0:t.captions)==null?void 0:E.youtube)==null?void 0:P.mode)??"auto",r=(e==null?void 0:e.capture.running)??!0,l=(e==null?void 0:e.voice.open)??!1,c=(e==null?void 0:e.transcription.busy)??!1;e==null||e.transcription.configured;const p=(e==null?void 0:e.transcription.lagMs)??140;e==null||e.transcription.queued;const d=(e==null?void 0:e.transcription.processed)??284,f=(e==null?void 0:e.transcription.dropped)??0,k=(Z==null?void 0:Z.streaming)??(Z==null?void 0:Z.running)??!1,w=(Z==null?void 0:Z.listeners)??0,v=d>0&&!(e!=null&&e.transcription.lastError),I=zt.length>0?zt.map(B=>`
        <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[12px] font-body-sm flex items-start justify-between gap-2">
          <div class="min-w-0">
            ${B.speaker?`<span class="font-bold text-primary mr-1.5">[${K(B.speaker)}]</span>`:""}
            <span class="text-on-surface">${K(B.text)}</span>
          </div>
          <span class="text-[10px] font-mono text-on-surface-variant flex-shrink-0">${B.timestamp?new Date(B.timestamp).toLocaleTimeString("fi-FI"):""}</span>
        </div>
      `).join(""):'<div class="p-3 text-center text-[12px] text-on-surface-variant italic">Ei viimeaikaisia tekstitystapahtumia. Tekstitykset näkyvät tässä reaaliajassa puheen alkaessa.</div>';ue.innerHTML=`
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
          <div class="p-1.5 rounded-lg ${v?"bg-primary/20 text-primary border border-primary/40":"bg-surface-container text-on-surface-variant"}">
            3. Captions
          </div>
          <div class="p-1.5 rounded-lg ${k?"bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30":"bg-surface-container text-on-surface-variant"}">
            4. Web Radio
          </div>
        </div>
      </div>

      ${a?`
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${K(a)}</span>
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
            <span class="font-bold text-on-surface uppercase">${Xt}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${Hn(Xt)}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] font-body-sm">
          <span class="text-on-surface-variant">Tila: <strong class="text-on-surface">${r?"Running":"Idle"}</strong></span>
          <button type="button" data-action="${r?"capture-stop":"capture-start"}" ${nt?"disabled":""}
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
            <span class="font-bold text-on-surface uppercase">${n}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${mt("auditor",n)}
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
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${v?"bg-green-600 text-white":"bg-surface-container-highest text-on-surface-variant"}">
            <span class="w-2 h-2 rounded-full ${v?"bg-white animate-pulse":"bg-outline-variant"}"></span>
            <span>${v?"Captions are flowing":"Captions Idle"}</span>
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
              ${mt("relay",s)}
            </div>
          </div>

          <!-- Captions to YouTube Toggle -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-label-sm">
              <span class="text-on-surface-variant">Captions to YouTube Live:</span>
              <span class="font-bold text-on-surface uppercase">${i}</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
              ${mt("youtube",i)}
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
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${v?"bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30":"bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
              Captions: ${v?"Receiving":"Waiting"}
            </span>
          </div>
        </div>

        <!-- Mode Toggles (On / Off / Auto) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Web Radio Mode (auto = lähettää automaattisesti puheella):</span>
            <span class="font-bold text-on-surface uppercase">${o}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${mt("radio",o)}
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
                value="${K(Xa)}"
                class="w-full h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-on-surface-variant text-[10px] font-bold uppercase mb-0.5">Mount Point:</label>
              <input
                type="text"
                id="voice-radio-mount"
                value="${K(_n)}"
                class="w-full h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] pt-1">
            <span class="text-on-surface-variant">Kuulijoita verkossa: <strong class="font-mono text-primary">${w}</strong></span>
            <span class="text-on-surface-variant">Jakelu: <strong class="font-mono text-on-surface">Icecast2 (128 kbps MP3)</strong></span>
          </div>
        </div>

        <!-- Confidence Audio Player for Sound Booth -->
        <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-label-sm text-on-surface-variant">
            <span>Kuuntele nettiradiota selaimessa (varmistus):</span>
            <span class="font-mono text-primary truncate max-w-[200px]">${K(Jt)}</span>
          </div>
          <audio id="voice-radio-audio-player" class="w-full h-9 rounded outline-none" controls preload="none">
            <source src="${K(Jt)}" type="audio/mpeg">
            Your browser does not support audio playback.
          </audio>
        </div>
      </div>

      <!-- PIVOICE AUTH TOKEN CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <label class="font-label-md text-[12px] font-bold text-on-surface" for="voice-token">pivoice API Token</label>
        <div class="flex gap-2">
          <input id="voice-token" type="password" autocomplete="off" value="${K(Ja())}"
            class="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-body-md text-[12px]" />
          <button type="button" data-action="save-token" class="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-[12px] font-bold uppercase">Tallenna</button>
        </div>
        <p class="font-label-sm text-[10px] text-on-surface-variant">Istuntokohtainen token. pivoice sijainnissa: ${K(za||"origin")}.</p>
      </div>

      ${Ze?`<p class="font-label-sm text-[11px] text-primary px-1 font-semibold">${K(Ze)}</p>`:""}
    </div>`}async function Kt(){try{const[e,t]=await Promise.all([Q("GET","/api/v1/status"),Q("GET","/api/v1/config"),ka(),$a()]);Ea(e,t,"")}catch(e){ka(),$a(),Ea(null,null,e instanceof Error?e.message:"Cannot reach pivoice")}}async function ye(e,t){nt=!0,Ze="";try{await e(),Ze=t}catch(a){Ze=a instanceof Error?a.message:"Request failed"}finally{nt=!1,await Kt()}}async function Gn(e,t){var a;if(e==="auditor")await Q("PUT","/api/v1/config",{auditor:{mode:t}});else if(e==="radio"){const n=(((a=(await Q("GET","/api/v1/config")).radio)==null?void 0:a.targets)??[{id:"icecast",mode:t}]).map(s=>({...s,mode:t}));await Q("PUT","/api/v1/config",{radio:{targets:n}})}else await Q("PUT","/api/v1/config",{captions:{[e]:{mode:t}}})}function qn(e){const t=e.target.closest("[data-action]");if(!t||nt)return;const a=t.dataset.action;if(a==="capture-start")ye(()=>Q("POST","/api/v1/capture/start"),"Capture started");else if(a==="capture-stop")ye(()=>Q("POST","/api/v1/capture/stop"),"Capture stopped");else if(a==="capture-mode"){const o=t.dataset.value;o&&(Xt=o,o==="on"?ye(()=>Q("POST","/api/v1/capture/start"),"Capture on"):o==="off"?ye(()=>Q("POST","/api/v1/capture/stop"),"Capture off"):ye(async()=>{},`Capture mode set to ${o}`))}else if(a==="mode"){const o=t.dataset.section,n=t.dataset.value;ye(()=>Gn(o,n),`${o} set to ${n}`)}else if(a==="save-token"){const o=ue==null?void 0:ue.querySelector("#voice-token");Fn((o==null?void 0:o.value.trim())??""),ye(async()=>{},"Token saved")}}function Yn(){ue=document.getElementById("voice-root"),ue&&ue.addEventListener("click",qn)}function Wn(e){e&&ze===void 0?(Kt(),ze=window.setInterval(()=>void Kt(),Dn)):!e&&ze!==void 0&&(window.clearInterval(ze),ze=void 0)}const jt={};let ie=null,Xe,Ca=!1,N=null,G=null,U=null,Ka=[],Ce="auto",ht=null,Za="auto",Qa="auto",le=!1,je;function zn(e=window.location.search){const t=new URLSearchParams(e).get("pitube"),a=jt==null?void 0:jt.VITE_PITUBE_URL;return(t??a??"/api/v1/youtube").replace(/\/+$/,"")}const Nt=zn();function se(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function Ge(e,t,a){let o=`${Nt}${t}`;t.startsWith("/api/v1")&&Nt.endsWith("/api/v1")&&(o=`${Nt}${t.slice(7)}`);const n={};a!==void 0&&(n["Content-Type"]="application/json");const s=await fetch(o,{method:e,headers:n,body:a!==void 0?JSON.stringify(a):void 0});if(!s.ok){let i=`pitube answered ${s.status}`;try{const r=await s.json();r!=null&&r.error&&(i=typeof r.error=="string"?r.error:JSON.stringify(r.error))}catch{}throw new Error(i)}return await s.json()}async function It(){try{const e=await fetch("/api/v1/atem");e.ok&&(G=await e.json())}catch{G||(G={connected:!0,programInput:1,previewInput:2,recording:!1,streaming:!1})}try{const e=await fetch("/api/v1/encoder");e.ok&&(U=await e.json())}catch{U||(U={configured:!0,connected:!0,name:"Matrox Monarch HDX",encoder1:{mode:"rtmp",state:"STOPPED"},encoder2:{mode:"record",state:"STOPPED"}})}}async function ce(){var e;try{const[t,a]=await Promise.all([Ge("GET","/status").catch(()=>null),Ge("GET","/broadcasts").catch(()=>null),It()]);t&&(N=t,(e=t.selectedBroadcast)!=null&&e.id&&(Ce=t.selectedBroadcast.id)),a&&Array.isArray(a.items)&&(Ka=a.items,a.selectedId&&(Ce=a.selectedId)),ht=null}catch(t){ht=t instanceof Error?t.message:String(t)}finally{fe()}}function Xn(e){Ca=e,e?(ce(),Xe||(Xe=window.setInterval(()=>{Ca&&ce()},3e3))):(Xe&&(clearInterval(Xe),Xe=void 0),je&&(window.clearTimeout(je),je=void 0,le=!1))}function Jn(e){ie=e,fe()}async function Kn(e,t="both"){try{await fetch(`/api/v1/encoder/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({encoder:t})}),q(`Enkooderi: ${e.toUpperCase()} (${t})`),It().then(fe)}catch(a){alert("Enkooderin ohjaus epäonnistui: "+(a instanceof Error?a.message:String(a)))}}async function Zn(){try{await fetch("/api/v1/atem/cut",{method:"POST"}),q("ATEM CUT suoritettu"),It().then(fe)}catch{q("ATEM CUT virhe")}}async function Qn(){try{await fetch("/api/v1/atem/auto",{method:"POST"}),q("ATEM AUTO siirtymä suoritettu"),It().then(fe)}catch{q("ATEM AUTO virhe")}}function eo(e){switch(e.toLowerCase()){case"live":return{label:"LIVE",bg:"bg-error",text:"text-on-error",pulse:!0};case"testing":return{label:"TESTING",bg:"bg-amber-500",text:"text-white",pulse:!0};case"ready":return{label:"READY",bg:"bg-blue-600",text:"text-white",pulse:!1};case"complete":return{label:"COMPLETED",bg:"bg-surface-container-highest",text:"text-on-surface-variant",pulse:!1};default:return{label:"OFFLINE",bg:"bg-surface-container-highest",text:"text-on-surface-variant",pulse:!1}}}function to(e){switch(e==null?void 0:e.toLowerCase()){case"good":return{label:"Ingest: Good",bg:"bg-green-600/20 text-green-700 dark:text-green-300 border-green-500/40",text:"text-green-700"};case"ok":return{label:"Ingest: OK",bg:"bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",text:"text-amber-700"};case"poor":return{label:"Ingest: Poor",bg:"bg-error-container text-on-error-container border-error/40",text:"text-error"};default:return{label:"Ingest: No Data",bg:"bg-surface-container-highest text-on-surface-variant border-outline-variant/30",text:"text-on-surface-variant"}}}function Sa(e,t){return["on","off","auto"].map(o=>`<button type="button" data-auto-domain="${e}" data-auto-value="${o}" class="px-2.5 py-1 rounded-md text-[10px] font-label-sm font-bold uppercase transition-all ${o===t?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant bg-surface-container-highest hover:text-on-surface"}">${o.toUpperCase()}</button>`).join("")}function fe(){var I,C,j,x,m,g;if(!ie)return;const e=(N==null?void 0:N.state)??"offline",t=eo(e),a=to((N==null?void 0:N.streamHealth)??"noData"),o=N==null?void 0:N.selectedBroadcast,n=o==null?void 0:o.id,s=((I=N==null?void 0:N.captions)==null?void 0:I.sent)??0,i=((C=N==null?void 0:N.captions)==null?void 0:C.dropped)??0,r=e==="live"&&s>=0,l=e==="live",c=!!n&&!l,p=(G==null?void 0:G.connected)??!0,d=(G==null?void 0:G.programInput)??1,f=(G==null?void 0:G.previewInput)??2,k=((j=U==null?void 0:U.encoder1)==null?void 0:j.state)==="RUNNING"||((x=U==null?void 0:U.encoder1)==null?void 0:x.state)==="ACTIVE",w=((m=U==null?void 0:U.encoder2)==null?void 0:m.state)==="RUNNING"||((g=U==null?void 0:U.encoder2)==null?void 0:g.state)==="ACTIVE",v=k||w;ie.innerHTML=`
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
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${a.bg}">
              ${a.label}
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
          <div class="p-1.5 rounded-lg ${v?"bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30":"bg-surface-container text-on-surface-variant"}">
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

      ${ht?`
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${se(ht)}</span>
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
              ${Sa("encoder",Za)}
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
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${k?"bg-green-600 text-white":"bg-surface-container-highest text-on-surface-variant"}">
                ${k?"STREAMING":"STOPPED"}
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
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${w?"bg-red-600 text-white animate-pulse":"bg-surface-container-highest text-on-surface-variant"}">
                ${w?"RECORDING":"STOPPED"}
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
              class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 shadow-sm ${le?"bg-amber-500 text-white":"bg-primary text-on-primary hover:bg-primary/90"}">
              <span class="material-symbols-outlined text-[15px]">${le?"visibility_off":"touch_app"}</span>
              <span>${le?"Piilota kuva":"Push to see video"}</span>
            </button>
          </div>

          <p class="text-[10px] font-body-sm text-on-surface-variant">
            Esikatselu on oletuksena suljettuna verkkokuorman säästämiseksi. Paina painiketta nähdäksesi enkooderin kuvan hetkeksi.
          </p>

          ${le?`
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
                ${Sa("youtube",Qa)}
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
              <option value="auto" ${Ce==="auto"?"selected":""}>[Auto: Valitse lähin aikataulutettu lähetys]</option>
              ${Ka.map($=>{const E=$.id===Ce,P=$.scheduledStartTime?new Date($.scheduledStartTime).toLocaleString("fi-FI",{day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`<option value="${se($.id)}" ${E?"selected":""}>${se($.title)} (${$.privacy.toUpperCase()}) ${P?"— "+P:""}</option>`}).join("")}
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">arrow_drop_down</span>
          </div>

          <button type="button" id="yt-select-confirm-btn" class="h-10 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 flex-shrink-0">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Valitse</span>
          </button>
        </div>

        ${o?`
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/25 space-y-1 text-[11px] font-body-sm">
            <div class="flex items-center justify-between text-on-surface">
              <span class="font-bold text-[12px] truncate">${se(o.title)}</span>
              <span class="font-mono text-[10px] uppercase font-bold text-primary">${se(o.privacy)}</span>
            </div>
            <div class="flex items-center justify-between pt-1 text-[10px]">
              <span class="font-mono text-on-surface-variant">ID: ${se(o.id)}</span>
              <div class="flex items-center gap-2">
                <a href="https://studio.youtube.com/video/${se(o.id)}/livestreaming" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  <span>Studio</span>
                  <span class="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
                <a href="https://youtu.be/${se(o.id)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  <span>Watch</span>
                  <span class="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        `:""}

        <!-- YouTube Live Embedded Confidence Player -->
        <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          ${n?`
            <iframe
              id="yt-preview-iframe"
              class="w-full h-full border-0"
              src="https://www.youtube.com/embed/${se(n)}?autoplay=1&mute=1&enablejsapi=1"
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
  `,ao()}function ao(){const e=document.getElementById("yt-refresh-btn");e&&(e.onclick=()=>void ce());const t=document.getElementById("atem-cut-btn");t&&(t.onclick=()=>void Zn());const a=document.getElementById("atem-auto-btn");a&&(a.onclick=()=>void Qn());const o=ie==null?void 0:ie.querySelectorAll("[data-enc-action]");o==null||o.forEach(p=>{p.addEventListener("click",()=>{const d=p.getAttribute("data-enc-action"),f=p.getAttribute("data-enc-id");d&&Kn(d,f==="1"?1:f==="2"?2:"both")})});const n=document.getElementById("push-to-see-video-btn");n&&(n.onclick=()=>{le=!le,le&&(je&&clearTimeout(je),je=window.setTimeout(()=>{le=!1,fe()},2e4)),fe()});const s=ie==null?void 0:ie.querySelectorAll("[data-auto-domain]");s==null||s.forEach(p=>{p.addEventListener("click",()=>{const d=p.getAttribute("data-auto-domain"),f=p.getAttribute("data-auto-value");d==="encoder"?(Za=f,q(`Enkooderin automaatiotila: ${f.toUpperCase()}`)):d==="youtube"&&(Qa=f,q(`YouTuben automaatiotila: ${f.toUpperCase()}`)),fe()})});const i=document.getElementById("yt-select-confirm-btn");i&&(i.onclick=async()=>{const p=document.getElementById("yt-broadcast-select");if(!p)return;const d=p.value;if(d==="auto"){Ce="auto",q("Auto-valinta käytössä"),ce();return}try{await Ge("POST","/broadcasts/select",{broadcastId:d}),Ce=d,q(`Lähetys valittu: ${d}`),ce()}catch(f){alert("Valinta epäonnistui: "+(f instanceof Error?f.message:String(f)))}});const r=document.getElementById("yt-go-live-btn");r&&(r.onclick=async()=>{if(confirm("Oletko varma että haluat aloittaa suoran lähetyksen YouTubessa?"))try{await Ge("POST","/broadcasts/start"),q("YouTube suora lähetys käynnistetty!"),ce()}catch(p){alert("Lähetyksen aloitus epäonnistui: "+(p instanceof Error?p.message:String(p)))}});const l=document.getElementById("yt-end-live-btn");l&&(l.onclick=()=>{en()});const c=document.getElementById("yt-open-create-btn");c&&(c.onclick=()=>{const p=document.getElementById("yt-create-modal");p&&p.classList.remove("hidden")})}async function no(e,t,a=""){var o;try{const n=await Ge("POST","/broadcasts/create",{title:e,privacy:t,description:a}),s=((o=n==null?void 0:n.broadcast)==null?void 0:o.id)||(n==null?void 0:n.id);s&&(Ce=s,q(`Uusi lähetys luotu: ${e}`)),ce()}catch(n){alert("Lähetyksen luonti epäonnistui: "+(n instanceof Error?n.message:String(n)))}}async function en(){if(confirm("Haluatko varmasti lopettaa suoran lähetyksen? Lähetystä ei voi avata uudelleen."))try{await Ge("POST","/broadcasts/stop"),q("Suora lähetys päättynyt."),ce()}catch(e){alert("Lähetyksen lopetus epäonnistui: "+(e instanceof Error?e.message:String(e)))}}function q(e){const t=document.getElementById("toast"),a=document.getElementById("toast-text");t&&a&&(a.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2800))}const Ut={};let M=null,Je,Ia=!1,Ne="live",O=[],Zt="tally01",Me="tally01",wt=null,Tt=null;function oo(e=window.location.search){const t=new URLSearchParams(e).get("pilight"),a=Ut==null?void 0:Ut.VITE_PILIGHT_URL;return(t??a??"/api/v1/lights").replace(/\/+$/,"")}const so=oo();function A(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function ee(e,t="",a){const o=`${so}${t}`,n={};a!==void 0&&(n["Content-Type"]="application/json");const s=await fetch(o,{method:e,headers:n,body:a!==void 0?JSON.stringify(a):void 0});if(!s.ok){let i=`pilight returned ${s.status}`;try{const r=await s.json();r!=null&&r.error&&(i=typeof r.error=="string"?r.error:JSON.stringify(r.error))}catch{}throw new Error(i)}return await s.json()}async function Qt(){try{const e=await ee("GET").catch(()=>null);Array.isArray(e)?(O=e.map(t=>{var i,r;const a=O.find(l=>l.id===t.id),o=t.segments&&t.segments.length>0&&((r=(i=t.segments[0])==null?void 0:i.facet)==null?void 0:r.type)!=="atem-input"?"status":(a==null?void 0:a.inputMode)??(t.id==="tally05"?"status":"normal"),n=t.atemInput??(a==null?void 0:a.atemInput)??(t.id==="tally01"?1:t.id==="tally02"?2:t.id==="tally03"?3:t.id==="tally04"?4:1),s=t.segments??(a==null?void 0:a.segments)??tn();return{...t,inputMode:o,atemInput:n,segments:s}}),wt=null):O.length===0&&(O=[{id:"tally01",name:"Cam 1 (Center)",host:"tally01.local",fallbackIp:"192.168.1.70",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:1},{id:"tally02",name:"Cam 2 (Pulpit)",host:"tally02.local",fallbackIp:"192.168.1.71",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:2},{id:"tally03",name:"Cam 3 (Altar)",host:"tally03.local",fallbackIp:"192.168.1.72",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:3},{id:"tally04",name:"Input 4 (Slides)",host:"tally04.local",fallbackIp:"192.168.1.73",mode:"off",brightness:"medium",hold:!1,inputMode:"normal",atemInput:4},{id:"tally05",name:"Status Monitor (Director Desk)",host:"tally05.local",fallbackIp:"192.168.1.74",mode:"segmented",brightness:"high",hold:!1,inputMode:"status",atemInput:1,segments:[{id:"grp-yt",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-enc",name:"Matrox Enkooderi",leds:[3,4],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-stt",name:"Auditor STT",leds:[5],facet:{type:"stt-state"}},{id:"grp-cc",name:"Tekstitysvirta",leds:[6],facet:{type:"caption-state"}},{id:"grp-proj",name:"Videotykki 1 (Vasen)",leds:[7,8],facet:{type:"projector",projector:1}}]}])}catch(e){wt=e instanceof Error?e.message:String(e)}finally{_()}}function tn(){return[{id:"grp-1",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-2",name:"Matrox Enkooderi",leds:[3,4],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-3",name:"Auditor STT",leds:[5],facet:{type:"stt-state"}},{id:"grp-4",name:"Tekstitysvirta",leds:[6],facet:{type:"caption-state"}},{id:"grp-5",name:"Videotykki 1 (Vasen)",leds:[7,8],facet:{type:"projector",projector:1}}]}function io(e){Ia=e,e?(Qt(),Je||(Je=window.setInterval(()=>{Ia&&Qt()},2500))):Je&&(clearInterval(Je),Je=void 0)}function ro(e){M=e,_()}async function lo(e,t){try{await ee("POST",`/${encodeURIComponent(e)}/state`,{mode:t});const a=O.find(o=>o.id===e);a&&(a.mode=t),_()}catch(a){alert("Tally update failed: "+(a instanceof Error?a.message:String(a)))}}async function an(e,t,a=2e3){try{await ee("POST",`/${encodeURIComponent(e)}/cue`,{direction:t,durationMs:a}),te(`Cue "${t}" sent to ${e}`)}catch{te(`Cue sent (${t})`)}}async function co(e){try{await ee("POST",`/${encodeURIComponent(e)}/call`),te(`Operator CALL sent to ${e}`)}catch{te(`CALL sent to ${e}`)}}async function po(e,t){try{const a=!t;await ee("POST",`/${encodeURIComponent(e)}/hold`,{hold:a});const o=O.find(n=>n.id===e);o&&(o.hold=a),_(),te(`${e} HOLD ${a?"ON":"OFF"}`)}catch(a){alert("Hold update failed: "+(a instanceof Error?a.message:String(a)))}}async function uo(e,t){const o={low:"medium",medium:"high",high:"low"}[t]??"medium";try{await ee("POST",`/${encodeURIComponent(e)}/brightness`,{level:o.toUpperCase()});const n=O.find(s=>s.id===e);n&&(n.brightness=o),_(),te(`${e} brightness: ${o.toUpperCase()}`)}catch(n){alert("Brightness update failed: "+(n instanceof Error?n.message:String(n)))}}async function fo(e){try{await ee("POST",`/${encodeURIComponent(e)}/animation/rainbow`,{durationSec:3,fps:20}),te(`Cycle test started on ${e}`)}catch{te(`Cycle test triggered on ${e}`)}}function kt(e){if(!e)return{color:"#52525b",bg:"bg-zinc-800",text:"text-zinc-400",label:"Määrittelemätön",glow:"rgba(82,82,91,0.4)"};switch(e.type){case"youtube-stream":return{color:"#ef4444",bg:"bg-red-600",text:"text-red-400",label:"YouTube Live",glow:"rgba(239,68,68,0.7)"};case"matrox-encoder":return{color:"#f97316",bg:"bg-orange-500",text:"text-orange-400",label:`Enkooderi ${e.encoder??1}`,glow:"rgba(249,115,22,0.7)"};case"atem-recording":return{color:"#dc2626",bg:"bg-red-700",text:"text-red-300",label:"ATEM Tallennus",glow:"rgba(220,38,38,0.7)"};case"atem-streaming":return{color:"#f59e0b",bg:"bg-amber-500",text:"text-amber-400",label:"ATEM Striimaus",glow:"rgba(245,158,11,0.7)"};case"projector":return{color:"#06b6d4",bg:"bg-cyan-500",text:"text-cyan-300",label:e.projector===2?"Videotykki 2 (Oikea / Vert Right)":"Videotykki 1 (Vasen / Vert Left)",glow:"rgba(6,182,212,0.7)"};case"atlona-input":return{color:"#a855f7",bg:"bg-purple-500",text:"text-purple-300",label:{1:"Lukupulpetti (Lectern)",2:"Räkki (Operator PC)",3:"Pi 1 (PiPGM 1)",4:"Pi 2 (PiPGM 2)"}[e.input??1]||`Atlona Tulo ${e.input??1}`,glow:"rgba(168,85,247,0.7)"};case"atlona-output":return{color:"#3b82f6",bg:"bg-blue-600",text:"text-blue-300",label:{1:"Videotykki 1 (Vasen)",2:"Videotykki 2 (Oikea)",5:"Videomikseri"}[e.output??1]||`Atlona Lähtö ${e.output??1}`,glow:"rgba(59,130,246,0.7)"};case"pi-output":return{color:"#ec4899",bg:"bg-pink-600",text:"text-pink-300",label:e.output===2?"Pi 2 (PiPGM 2)":"Pi 1 (PiPGM 1)",glow:"rgba(236,72,153,0.7)"};case"stt-state":return{color:"#22c55e",bg:"bg-green-600",text:"text-green-300",label:"Auditor STT Puhe",glow:"rgba(34,197,94,0.7)"};case"caption-state":return{color:"#14b8a6",bg:"bg-teal-500",text:"text-teal-300",label:"Tekstitysvirta",glow:"rgba(20,184,166,0.7)"};case"atem-input":return{color:"#eab308",bg:"bg-yellow-500",text:"text-yellow-300",label:`ATEM Tulo ${e.input??1}`,glow:"rgba(234,179,8,0.7)"};case"manual":return{color:"#8b5cf6",bg:"bg-violet-600",text:"text-violet-300",label:"Kiinteä väri",glow:"rgba(139,92,246,0.7)"};default:return{color:"#71717a",bg:"bg-zinc-700",text:"text-zinc-300",label:"Muu tila",glow:"rgba(113,113,122,0.4)"}}}function mo(e){return e.startsWith("matrox-encoder-")?{type:"matrox-encoder",encoder:Number(e.split("-")[2])}:e.startsWith("projector-")?{type:"projector",projector:Number(e.split("-")[1])}:e.startsWith("atlona-input-")?{type:"atlona-input",input:Number(e.split("-")[2])}:e.startsWith("atlona-output-")?{type:"atlona-output",output:Number(e.split("-")[2])}:e.startsWith("pi-output-")?{type:"pi-output",output:Number(e.split("-")[2])}:e.startsWith("atem-input-")?{type:"atem-input",input:Number(e.split("-")[2])}:{type:e}}function xo(e){return e?e.type==="matrox-encoder"?`matrox-encoder-${e.encoder??1}`:e.type==="projector"?`projector-${e.projector??1}`:e.type==="atlona-input"?`atlona-input-${e.input??1}`:e.type==="atlona-output"?`atlona-output-${e.output??1}`:e.type==="pi-output"?`pi-output-${e.output??1}`:e.type==="atem-input"?`atem-input-${e.input??1}`:e.type:"youtube-stream"}async function bo(e,t,a,o,n,s){try{const i=O.find(r=>r.id===e);if(i&&(i.inputMode=t,i.atemInput=a,i.host=o,i.fallbackIp=n,t==="status"&&s&&(i.segments=s)),t==="status"&&s)await ee("POST",`/${encodeURIComponent(e)}/segments`,{segments:s});else{const r=[{id:"tally-full",name:`ATEM Input ${a}`,leds:[0,1,2,3,4,5,6,7,8],facet:{type:"atem-input",input:a}}];await ee("POST",`/${encodeURIComponent(e)}/segments`,{segments:r}).catch(()=>null)}await ee("POST","",{id:e,name:(i==null?void 0:i.name)??e,host:o,fallbackIp:n,protocol:t==="status"?"udp":"http"}).catch(()=>null),Tt=`Asetukset tallennettu onnistuneesti valolle ${e}!`,setTimeout(()=>{Tt=null,_()},3500),_(),te(`Asetukset tallennettu: ${e}`)}catch(i){alert("Tallennus epäonnistui: "+(i instanceof Error?i.message:String(i)))}}function go(e){const t=e==null?void 0:e.toLowerCase();return t==="pgm"?{bg:"bg-error text-on-error",text:"text-error",dot:"bg-error animate-pulse",label:"PROGRAM"}:t==="prv"?{bg:"bg-green-600 text-white",text:"text-green-600",dot:"bg-green-500",label:"PREVIEW"}:t==="segmented"?{bg:"bg-purple-600 text-white",text:"text-purple-600",dot:"bg-purple-500",label:"STATUS / 9-LED"}:{bg:"bg-surface-container-highest text-on-surface-variant",text:"text-on-surface-variant",dot:"bg-outline-variant",label:"OFF"}}function _(){if(!M)return;const e=O.find(t=>t.id===Me)??O[0];M.innerHTML=`
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
                ${O.length} Units
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
              class="px-3 py-1 rounded-md text-[11px] font-label-sm font-bold uppercase transition-all flex items-center gap-1 ${Ne==="live"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              <span class="material-symbols-outlined text-[14px]">sports</span>
              <span>Live &amp; Cues</span>
            </button>
            <button
              type="button"
              id="subtab-setup-btn"
              class="px-3 py-1 rounded-md text-[11px] font-label-sm font-bold uppercase transition-all flex items-center gap-1 ${Ne==="setup"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              <span class="material-symbols-outlined text-[14px]">tune</span>
              <span>Light Setup &amp; Mapping</span>
            </button>
          </div>

          <button type="button" id="tally-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Refresh Tally Lights">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      ${wt?`
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${A(wt)}</span>
        </div>
      `:""}

      ${Ne==="live"?yo():vo(e)}
    </div>
  `,ho()}function yo(){return`
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
            ${O.map(e=>`<option value="${A(e.id)}" ${e.id===Zt?"selected":""}>${A(e.name)} (${e.id})</option>`).join("")}
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
        ${O.map(e=>{var r,l;const t=go(e.mode),a=((r=e.mode)==null?void 0:r.toLowerCase())==="pgm",o=((l=e.mode)==null?void 0:l.toLowerCase())==="prv",n=!a&&!o,s=e.inputMode==="status",i=e.segments??[];return`
            <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm space-y-2.5" id="card-${A(e.id)}">
              <!-- Top Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full ${t.dot}"></span>
                  <div>
                    <h4 class="font-headline-sm text-[13px] font-bold text-on-surface leading-tight">${A(e.name)}</h4>
                    <span class="font-label-sm text-[10px] text-on-surface-variant">
                      ${s?`[Status Mode: ${i.length} Custom Groups]`:`[Camera Tally: ATEM In ${e.atemInput??1}]`} &bull; ${A(e.host)}
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
                  ${[0,1,2,3,4,5,6,7,8].map(c=>{let p="bg-zinc-800 text-white/50",d="",f=`LED ${c+1}`;if(a)p="bg-red-600 text-white font-bold",d="box-shadow: 0 0 6px rgba(220,38,38,0.8);";else if(o)p="bg-green-500 text-white font-bold",d="box-shadow: 0 0 6px rgba(34,197,94,0.8);";else if(s){const k=i.find(w=>w.leds.includes(c));if(k){const w=kt(k.facet);d=`background-color: ${w.color}; box-shadow: 0 0 5px ${w.glow};`,p="text-white font-bold",f=`LED ${c+1}: ${k.name} (${w.label})`}else p="bg-zinc-900 text-white/30",f=`LED ${c+1}: Unassigned`}return`<span class="w-5 h-4 rounded-sm ${p} flex items-center justify-center text-[8px] font-mono transition-all" style="${d}" title="${A(f)}">${c+1}</span>`}).join("")}
                </div>

                ${s&&i.length>0?`
                  <div class="flex flex-wrap items-center gap-1 pt-0.5 text-[9px] font-label-sm">
                    ${i.map(c=>{const p=kt(c.facet),d=c.leds.map(f=>f+1).join(",");return`
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30" style="border-left: 2px solid ${p.color};">
                          <span class="font-bold text-on-surface">${A(c.name)}:</span>
                          <span class="font-mono text-on-surface-variant">[${d}]</span>
                        </span>
                      `}).join("")}
                  </div>
                `:""}
              </div>

              <!-- Mode Toggles -->
              <div class="grid grid-cols-3 gap-1.5 pt-0.5">
                <button type="button" data-action="state" data-id="${A(e.id)}" data-mode="pgm" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${a?"bg-error text-on-error shadow-sm":"bg-surface-container-high hover:bg-error-container text-on-surface"}">
                  PGM
                </button>
                <button type="button" data-action="state" data-id="${A(e.id)}" data-mode="prv" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${o?"bg-green-600 text-white shadow-sm":"bg-surface-container-high hover:bg-green-700/20 text-on-surface"}">
                  PRV
                </button>
                <button type="button" data-action="state" data-id="${A(e.id)}" data-mode="off" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${n?"bg-surface-container-highest text-on-surface font-black":"bg-surface-container-high text-on-surface-variant"}">
                  OFF
                </button>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center justify-between gap-1 pt-1 border-t border-outline-variant/20 text-[10px]">
                <button type="button" data-action="call" data-id="${A(e.id)}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-bold uppercase flex items-center gap-0.5" title="Flash white 3 times">
                  <span class="material-symbols-outlined text-[13px]">flare</span>
                  <span>CALL</span>
                </button>

                <button type="button" data-action="hold" data-id="${A(e.id)}" data-hold="${e.hold}" class="px-2 py-1 rounded font-label-sm font-bold uppercase flex items-center gap-0.5 ${e.hold?"bg-amber-500 text-white":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface"}" title="Toggle HOLDDATA to prevent external server interference">
                  <span class="material-symbols-outlined text-[13px]">${e.hold?"lock":"lock_open"}</span>
                  <span>HOLD ${e.hold?"ON":"OFF"}</span>
                </button>

                <button type="button" data-action="brightness" data-id="${A(e.id)}" data-brightness="${e.brightness}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-bold uppercase flex items-center gap-0.5" title="Cycle Brightness (Low / Med / High)">
                  <span class="material-symbols-outlined text-[13px]">brightness_medium</span>
                  <span>${e.brightness.toUpperCase()}</span>
                </button>

                <button type="button" data-action="cycle" data-id="${A(e.id)}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm font-bold uppercase flex items-center gap-0.5" title="Run 9-LED cycle diagnostic">
                  <span class="material-symbols-outlined text-[13px]">autorenew</span>
                  <span>Test</span>
                </button>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function vo(e){if(!e)return'<div class="p-4 text-center text-on-surface-variant">Valoja ei löydy.</div>';const t=e.inputMode==="status",a=e.segments??tn(),o=new Map;return a.forEach((n,s)=>{n.leds.forEach(i=>{o.set(i,{segIndex:s,segName:n.name,facet:n.facet})})}),`
    <div class="space-y-space-md">
      ${Tt?`
        <div class="p-3 rounded-xl bg-green-600/20 border border-green-500/40 text-green-700 dark:text-green-300 text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          <span class="flex-1">${A(Tt)}</span>
        </div>
      `:""}

      <!-- LIGHT SELECTION CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Valitse konfiguroitava valo</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant">${O.length} valoa verkossa</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
          ${O.map(n=>{const s=n.id===e.id;return`
              <button
                type="button"
                data-select-light="${A(n.id)}"
                class="p-2 rounded-lg border text-left transition-all ${s?"bg-primary text-on-primary border-primary shadow-sm":"bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface"}">
                <div class="font-bold text-[12px] truncate">${A(n.name)}</div>
                <div class="text-[10px] opacity-80 font-mono">${A(n.id)} &bull; ${n.inputMode==="status"?"Status":"Tally"}</div>
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
              <span class="font-mono text-[10px] text-on-surface-variant">${o.size}/9 LEDiä osoitettu</span>
            </div>

            <!-- LED Chassis Strip -->
            <div class="grid grid-cols-9 gap-1.5 p-2 bg-black/60 rounded-xl">
              ${[0,1,2,3,4,5,6,7,8].map(n=>{const s=o.get(n),i=s?kt(s.facet):null,r=i?`background-color: ${i.color}; box-shadow: 0 0 8px ${i.glow};`:"";return`
                  <div class="flex flex-col items-center gap-1 text-center">
                    <div class="w-full h-8 rounded-md flex items-center justify-center font-mono font-bold text-[11px] transition-all ${s?"text-white":"bg-zinc-800 text-zinc-500"}" style="${r}">
                      ${n+1}
                    </div>
                    <span class="text-[8px] font-label-sm font-semibold truncate max-w-full ${s?"text-on-surface":"text-on-surface-variant/40"}">
                      ${s?A(s.segName):"Vapaa"}
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
              ${a.map((n,s)=>{const i=kt(n.facet),r=xo(n.facet);return`
                  <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5 group-card" data-group-index="${s}">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 flex-1">
                        <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${i.color};"></span>
                        <input
                          type="text"
                          data-group-field="name"
                          value="${A(n.name)}"
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
                          ${[0,1,2,3,4,5,6,7,8].map(l=>{const c=n.leds.includes(l);return`
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
              value="${A(e.host)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
            <span class="text-[10px] text-on-surface-variant">Esim. tally01.local (ensisijainen osoite)</span>
          </div>

          <div class="space-y-1">
            <label class="block font-label-sm text-[11px] font-bold text-on-surface">Varayhteys IP (Fallback IP):</label>
            <input
              type="text"
              id="setup-light-ip"
              value="${A(e.fallbackIp??"")}"
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
  `}function ho(){const e=document.getElementById("tally-refresh-btn");e&&(e.onclick=()=>void Qt());const t=document.getElementById("subtab-live-btn");t&&(t.onclick=()=>{Ne="live",_()});const a=document.getElementById("subtab-setup-btn");if(a&&(a.onclick=()=>{Ne="setup",_()}),Ne==="live"){const o=document.getElementById("tally-cue-target-select");o&&(o.onchange=()=>{Zt=o.value}),document.querySelectorAll(".tally-cue-btn").forEach(i=>{i.addEventListener("click",()=>{const r=i.getAttribute("data-cue");r&&an(Zt,r)})});const s=M==null?void 0:M.querySelectorAll("[data-action]");s==null||s.forEach(i=>{i.addEventListener("click",r=>{r.stopPropagation();const l=i.getAttribute("data-action"),c=i.getAttribute("data-id");if(c)if(l==="state"){const p=i.getAttribute("data-mode");p&&lo(c,p)}else if(l==="call")co(c);else if(l==="hold"){const p=i.getAttribute("data-hold")==="true";po(c,p)}else if(l==="brightness"){const p=i.getAttribute("data-brightness");uo(c,p||"medium")}else l==="cycle"&&fo(c)})})}else{const o=M==null?void 0:M.querySelectorAll("[data-select-light]");o==null||o.forEach(x=>{x.addEventListener("click",()=>{const m=x.getAttribute("data-select-light");m&&(Me=m,_())})});const n=document.getElementById("mode-option-normal"),s=document.getElementById("mode-option-status"),i=document.getElementById("radio-mode-normal"),r=document.getElementById("radio-mode-status"),l=document.getElementById("setup-normal-section"),c=document.getElementById("setup-status-section"),p=x=>{const m=O.find(g=>g.id===Me);m&&(m.inputMode=x),x==="normal"?(i&&(i.checked=!0),l==null||l.classList.remove("hidden"),c==null||c.classList.add("hidden"),n==null||n.classList.add("border-primary","bg-primary/5"),n==null||n.classList.remove("border-outline-variant/30","bg-surface-container"),s==null||s.classList.remove("border-primary","bg-primary/5"),s==null||s.classList.add("border-outline-variant/30","bg-surface-container")):(r&&(r.checked=!0),l==null||l.classList.add("hidden"),c==null||c.classList.remove("hidden"),s==null||s.classList.add("border-primary","bg-primary/5"),s==null||s.classList.remove("border-outline-variant/30","bg-surface-container"),n==null||n.classList.remove("border-primary","bg-primary/5"),n==null||n.classList.add("border-outline-variant/30","bg-surface-container"))};n==null||n.addEventListener("click",()=>p("normal")),s==null||s.addEventListener("click",()=>p("status")),i==null||i.addEventListener("change",()=>p("normal")),r==null||r.addEventListener("change",()=>p("status"));const d=O.find(x=>x.id===Me),f=M==null?void 0:M.querySelectorAll("[data-toggle-led]");f==null||f.forEach(x=>{x.addEventListener("click",()=>{const m=Number(x.getAttribute("data-toggle-led")),g=Number(x.getAttribute("data-group-index"));if(!d||!d.segments||!d.segments[g])return;const $=d.segments[g].leds;$.includes(m)?d.segments[g].leds=$.filter(E=>E!==m):(d.segments.forEach((E,P)=>{P!==g&&(E.leds=E.leds.filter(B=>B!==m))}),d.segments[g].leds=[...$,m].sort((E,P)=>E-P)),_()})});const k=M==null?void 0:M.querySelectorAll("input[data-group-field='name']");k==null||k.forEach(x=>{const m=x.closest(".group-card"),g=Number(m==null?void 0:m.getAttribute("data-group-index"));x.addEventListener("input",()=>{var $;($=d==null?void 0:d.segments)!=null&&$[g]&&(d.segments[g].name=x.value)})});const w=M==null?void 0:M.querySelectorAll("select[data-group-field='facet']");w==null||w.forEach(x=>{const m=x.closest(".group-card"),g=Number(m==null?void 0:m.getAttribute("data-group-index"));x.addEventListener("change",()=>{var $;($=d==null?void 0:d.segments)!=null&&$[g]&&(d.segments[g].facet=mo(x.value),_())})});const v=M==null?void 0:M.querySelectorAll("[data-remove-group]");v==null||v.forEach(x=>{x.addEventListener("click",()=>{const m=Number(x.getAttribute("data-remove-group"));d!=null&&d.segments&&(d.segments.splice(m,1),_())})});const I=document.getElementById("setup-add-group-btn");I&&(I.onclick=()=>{if(!d)return;d.segments||(d.segments=[]);const x=d.segments.length+1,m=new Set;d.segments.forEach(E=>E.leds.forEach(P=>m.add(P)));const g=[0,1,2,3,4,5,6,7,8].find(E=>!m.has(E)),$=g!==void 0?[g]:[];d.segments.push({id:`grp-${Date.now()}`,name:`Ryhmä ${x}`,leds:$,facet:{type:"youtube-stream"}}),_()});const C=M==null?void 0:M.querySelectorAll("[data-preset]");C==null||C.forEach(x=>{x.addEventListener("click",()=>{if(!d)return;const m=x.getAttribute("data-preset");m==="preset-3x3"?d.segments=[{id:"grp-yt",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-enc",name:"Matrox Enkooderi",leds:[3,4,5],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-proj",name:"Videotykki 1 (Vasen)",leds:[6,7,8],facet:{type:"projector",projector:1}}]:m==="preset-flow"?d.segments=[{id:"grp-yt",name:"YouTube Live",leds:[0,1,2],facet:{type:"youtube-stream"}},{id:"grp-enc",name:"Matrox Enkooderi",leds:[3,4],facet:{type:"matrox-encoder",encoder:1}},{id:"grp-stt",name:"Auditor STT",leds:[5],facet:{type:"stt-state"}},{id:"grp-cc",name:"Tekstitysvirta",leds:[6],facet:{type:"caption-state"}},{id:"grp-proj",name:"Videotykki 1 (Vasen)",leds:[7,8],facet:{type:"projector",projector:1}}]:m==="preset-audio"?d.segments=[{id:"grp-mic",name:"Mikrofoni VAD",leds:[0,1],facet:{type:"stt-state"}},{id:"grp-stt",name:"Auditor STT",leds:[2,3,4],facet:{type:"stt-state"}},{id:"grp-cc",name:"Tekstitykset",leds:[5,6],facet:{type:"caption-state"}},{id:"grp-rad",name:"Nettiradio",leds:[7,8],facet:{type:"atem-streaming"}}]:m==="preset-9split"&&(d.segments=[{id:"g1",name:"YouTube Live",leds:[0],facet:{type:"youtube-stream"}},{id:"g2",name:"Matrox Enc 1",leds:[1],facet:{type:"matrox-encoder",encoder:1}},{id:"g3",name:"Matrox Enc 2",leds:[2],facet:{type:"matrox-encoder",encoder:2}},{id:"g4",name:"ATEM Rec",leds:[3],facet:{type:"atem-recording"}},{id:"g5",name:"Auditor STT",leds:[4],facet:{type:"stt-state"}},{id:"g6",name:"Tekstitykset",leds:[5],facet:{type:"caption-state"}},{id:"g7",name:"Videotykki 1 (Vasen)",leds:[6],facet:{type:"projector",projector:1}},{id:"g8",name:"Lukupulpetti",leds:[7],facet:{type:"atlona-input",input:1}},{id:"g9",name:"Pi 1 (PiPGM 1)",leds:[8],facet:{type:"pi-output",output:1}}]),_(),te("Pika-asetus ladattu!")})});const j=document.getElementById("setup-save-btn");j&&(j.onclick=()=>{const m=(r==null?void 0:r.checked)??!1?"status":"normal",g=document.getElementById("setup-atem-input"),$=Number((g==null?void 0:g.value)??1),E=document.getElementById("setup-light-host"),P=document.getElementById("setup-light-ip"),B=(E==null?void 0:E.value.trim())||`${Me}.local`,oe=(P==null?void 0:P.value.trim())||"",W=d==null?void 0:d.segments;bo(Me,m,$,B,oe,W)})}}function te(e){const t=document.getElementById("toast"),a=document.getElementById("toast-text");t&&a&&(a.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2800))}const Dt={};let Ue=null,Ke,Pa=!1,D=null,ke="auto",me=!1,$t="https://nettiradio.keskuskirkko.fi/live.mp3",ot="keskuskirkko-live",st="/live.mp3",De=!0,_e=!0;function wo(e=window.location.search){const t=new URLSearchParams(e).get("radio"),a=Dt==null?void 0:Dt.VITE_RADIO_URL;return(t??a??"/api/v1/radio-relay").replace(/\/+$/,"")}const To=wo();function Ie(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function ct(e,t="",a){var i;const o=`${To}${t}`,n={};a!==void 0&&(n["Content-Type"]="application/json");const s=await fetch(o,{method:e,headers:n,body:a!==void 0?JSON.stringify(a):void 0});if(!s.ok){let r=`Radio relay returned ${s.status}`;try{const l=await s.json();(i=l==null?void 0:l.error)!=null&&i.message&&(r=l.error.message)}catch{}throw new Error(r)}return await s.json()}async function it(){var e,t,a,o,n,s,i,r;try{const l=await ct("GET").catch(()=>null);if(l)D=l,l.streamName&&(ot=l.streamName),l.mode&&(ke=l.mode),(e=l.state)!=null&&e.streamUrl&&($t=l.state.streamUrl),(t=l.state)!=null&&t.mountPoint&&(st=l.state.mountPoint),((a=l.state)==null?void 0:a.soundComingIn)!==void 0&&(De=l.state.soundComingIn),((o=l.state)==null?void 0:o.captionsComingIn)!==void 0&&(_e=l.state.captionsComingIn);else{try{const c=await fetch("/api/v1/status");if(c.ok){const p=await c.json();((s=(n=p==null?void 0:p.pivoice)==null?void 0:n.voice)==null?void 0:s.open)!==void 0&&(De=!!p.pivoice.voice.open),((r=(i=p==null?void 0:p.pivoice)==null?void 0:i.transcription)==null?void 0:r.processed)>0&&(_e=!0)}}catch{}D||(D={configured:!0,reachable:!0,streamName:ot,mode:ke,state:{running:!1,streaming:!1,listeners:0,uptimeSeconds:0,streamUrl:$t,mountPoint:st,bitrate:"128 kbps MP3",soundComingIn:De,captionsComingIn:_e}})}}catch{}finally{xe()}}function ko(e){Pa=e,e?(it(),Ke||(Ke=window.setInterval(()=>{Pa&&it()},3e3))):Ke&&(clearInterval(Ke),Ke=void 0)}function $o(e){Ue=e,xe()}async function Eo(e){ke=e;try{await ct("POST","/mode",{mode:e}).catch(()=>null),qe(`Nettiradion tila: ${e.toUpperCase()}`)}catch{qe(`Tila asetettu: ${e.toUpperCase()}`)}xe()}async function Co(){if(!me){me=!0,xe();try{await ct("POST","/start"),qe("Nettiradio käynnistetty!"),it()}catch(e){alert("Nettiradion käynnistys epäonnistui: "+(e instanceof Error?e.message:String(e)))}finally{me=!1,xe()}}}async function So(){if(!me){me=!0,xe();try{await ct("POST","/stop"),qe("Nettiradio pysäytetty."),it()}catch(e){alert("Nettiradion pysäytys epäonnistui: "+(e instanceof Error?e.message:String(e)))}finally{me=!1,xe()}}}async function Io(e,t){ot=e,st=t;try{await ct("PUT","/settings",{streamName:e,mountPoint:t}).catch(()=>null),qe("Nettiradion asetukset tallennettu!")}catch{qe("Asetukset päivitetty paikallisesti")}xe()}function xe(){var o,n,s;if(!Ue)return;const e=((o=D==null?void 0:D.state)==null?void 0:o.streaming)??((n=D==null?void 0:D.state)==null?void 0:n.running)??!1,t=(D==null?void 0:D.reachable)??!1,a=((s=D==null?void 0:D.state)==null?void 0:s.listeners)??0;Ue.innerHTML=`
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
            <span class="font-label-sm text-[10px] text-on-surface-variant">Stream: <span class="font-mono font-semibold">${Ie(ot)}</span></span>
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
          <div class="p-2.5 rounded-lg border flex items-center justify-between ${De?"bg-green-600/10 border-green-500/30 text-green-700 dark:text-green-300":"bg-surface-container border-outline-variant/30 text-on-surface-variant"}">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${De?"bg-green-600 animate-pulse":"bg-outline-variant"}"></span>
              <div>
                <span class="font-bold text-[12px] block">Sound coming in</span>
                <span class="text-[10px] opacity-80">Äänisignaali mikrofonista ja mikseristä</span>
              </div>
            </div>
            <span class="font-mono text-[11px] font-bold uppercase">${De?"ACTIVE":"SILENT"}</span>
          </div>

          <!-- Captions coming in indicator -->
          <div class="p-2.5 rounded-lg border flex items-center justify-between ${_e?"bg-primary/10 border-primary/30 text-primary":"bg-surface-container border-outline-variant/30 text-on-surface-variant"}">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${_e?"bg-primary animate-pulse":"bg-outline-variant"}"></span>
              <div>
                <span class="font-bold text-[12px] block">Captions coming in</span>
                <span class="text-[10px] opacity-80">Reaaliaikainen Auditor-tekstitys jakelussa</span>
              </div>
            </div>
            <span class="font-mono text-[11px] font-bold uppercase">${_e?"FLOWING":"WAITING"}</span>
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
            <span class="font-bold text-on-surface uppercase">${ke}</span>
          </div>
          <div class="grid grid-cols-3 gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            <button type="button" data-radio-mode="on" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${ke==="on"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              On
            </button>
            <button type="button" data-radio-mode="off" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${ke==="off"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              Off
            </button>
            <button type="button" data-radio-mode="auto" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${ke==="auto"?"bg-primary text-on-primary shadow-sm":"text-on-surface-variant hover:text-on-surface"}">
              Auto
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            id="radio-start-btn"
            ${me||e?"disabled":""}
            class="h-11 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[12px] font-bold uppercase transition-all shadow-sm ${e?"bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed":"bg-primary hover:bg-primary/90 text-on-primary active:scale-95"}">
            <span class="material-symbols-outlined text-[18px]">podcasts</span>
            <span>Käynnistä lähetys</span>
          </button>

          <button
            type="button"
            id="radio-stop-btn"
            ${me||!e?"disabled":""}
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
              value="${Ie(ot)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
          </div>

          <div class="space-y-1">
            <label class="block font-bold text-on-surface">Mount Point:</label>
            <input
              type="text"
              id="radio-input-mount"
              value="${Ie(st)}"
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
            <span class="font-mono text-[10px] text-primary truncate max-w-[200px]">${Ie($t)}</span>
          </div>

          <audio id="radio-audio-player" class="w-full h-10 rounded-lg outline-none" controls preload="none">
            <source src="${Ie($t)}" type="audio/mpeg">
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
            <span class="font-bold text-on-surface font-mono text-[14px]">${a}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Mount Point</span>
            <span class="font-bold text-on-surface font-mono text-[12px] truncate">${Ie(st)}</span>
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
  `,Po()}function Po(){const e=document.getElementById("radio-refresh-btn");e&&(e.onclick=()=>void it());const t=document.getElementById("radio-start-btn");t&&(t.onclick=()=>void Co());const a=document.getElementById("radio-stop-btn");a&&(a.onclick=()=>void So());const o=Ue==null?void 0:Ue.querySelectorAll("[data-radio-mode]");o==null||o.forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-radio-mode");i&&Eo(i)})});const n=document.getElementById("radio-save-setup-btn");n&&(n.onclick=()=>{const s=document.getElementById("radio-input-name"),i=document.getElementById("radio-input-mount"),r=(s==null?void 0:s.value.trim())||"keskuskirkko-live",l=(i==null?void 0:i.value.trim())||"/live.mp3";Io(r,l)})}function qe(e){const t=document.getElementById("toast"),a=document.getElementById("toast-text");t&&a&&(a.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2800))}const Mo={},nn=window.fetch.bind(window);window.fetch=async(e,t)=>{const a=localStorage.getItem("pimatrix_auth_token");if(a){t=t||{};const n=new Headers(t.headers||{});n.has("Authorization")||n.set("Authorization",`Bearer ${a}`),t.headers=n}const o=await nn(e,t);return o.status===401&&((typeof e=="string"?e:e instanceof URL?e.href:e.url).includes("/api/v1/auth/verify")||yn()),o};let on="#00ff00";const Ao=new Set(["hama","rtmp1","rtmp2","PiPGM1","PiPGM2","compose1"]),Lo=["hama","rtmp1","rtmp2","PiPGM1","PiPGM2","compose1"],Bo=["cam1","cam2","cam3"],Ve=Mo??{};var Aa,La,Ba;const Y={hama:"hama",rtmp1:"rtmp1",rtmp2:"rtmp2",PiPGM1:"pipgm 1",PiPGM2:"pipgm 2",PiPGM3:"pipgm 3",compose1:"compose 1",cam1:((Aa=Ve.VITE_CAM1_NAME)==null?void 0:Aa.trim())||"cam1",cam2:((La=Ve.VITE_CAM2_NAME)==null?void 0:La.trim())||"cam2",cam3:((Ba=Ve.VITE_CAM3_NAME)==null?void 0:Ba.trim())||"cam3",multiview:"multiview"};function rt(e){var n,s,i,r;const t=(s=(n=L.get(e))==null?void 0:n.label)==null?void 0:s.trim();if(t)return t;const a=(r=(i=dt.get(e))==null?void 0:i.label)==null?void 0:r.trim();if(a)return a;const o=e==="cam1"?Ve.VITE_CAM1_NAME:e==="cam2"?Ve.VITE_CAM2_NAME:Ve.VITE_CAM3_NAME;return o!=null&&o.trim()?o.trim():e==="cam1"?"Camera 1":e==="cam2"?"Camera 2":"Camera 3"}function Oo(){for(const e of["cam1","cam2","cam3"]){const t=rt(e);t&&t!==(e==="cam1"?"Camera 1":e==="cam2"?"Camera 2":"Camera 3")&&(Y[e]=t);const o=document.querySelector(`.rtsp-choice-btn[data-rtsp="${e}"]`);o&&(o.textContent=Y[e]||e)}}const sn={1:"LUKUPULPETTI (Lectern)",2:"RÄKKI (Operator PC)",3:"PI 1 (PiPGM 1)",4:"PI 2 (PiPGM 2)"},ea={1:"Videotykki 1 (Vasen)",2:"Videotykki 2 (Oikea)",3:"(none currently)",4:"(none currently)",5:"Videomikseri"},Ro={cam1:{1:"Pulpit",2:"Altar",3:"Organ",4:"Choir",5:"Lectern",6:"Wide Hall"},cam2:{1:"Pastor Close",2:"Communion",3:"Baptismal",4:"Band Wide",5:"Aisle Center",6:"Sanctuary"}};let X="outputs";const dt=new Map,Ye=new Map,R=new Map,L=new Map,Pt=new Map;let da="landscape",V={locked:!1,routes:{1:1,2:2,3:null,4:null,5:2}},h={sourceId:"rtmp1",layout:"landscape",url:"rtsp://pimatrix.local:554/live",streaming:!1,quality:"full",resolution:"1920x1080",bitrateKbps:6200},Qe=1,ne="cam1",de="dual",Le=!1,J=!1,_t=!1,ta="name",we=12;const pa={cam1:1,cam2:1};let Vt=null;function b(e){const t=document.getElementById("toast"),a=document.getElementById("toast-text");!t||!a||(a.textContent=e,t.classList.remove("opacity-0","translate-y-2"),t.classList.add("opacity-100","translate-y-0"),Vt&&clearTimeout(Vt),Vt=setTimeout(()=>{t.classList.remove("opacity-100","translate-y-0"),t.classList.add("opacity-0","translate-y-2")},2400))}function jo(e){const t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
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
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(t)}`}function No(e,t,a,o){const n=e==="cam1"?268:25,s=e==="cam1"?"#6d28d9":"#8f4c00",i=Math.max(-80,Math.min(80,Math.round(o.pan/15))),r=Math.max(-40,Math.min(40,Math.round(-o.tilt/15))),l=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),c=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${n}, 38%, 22%)"/>
        <stop offset="100%" stop-color="hsl(${n}, 30%, 12%)"/>
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
    <text x="160" y="94" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="15" font-weight="700">${a}</text>
    <text x="160" y="114" text-anchor="middle" fill="#d3bbff" font-family="JetBrains Mono, monospace" font-size="10">P:${o.pan} T:${o.tilt} Z:${o.zoom}</text>
    <text x="310" y="170" text-anchor="end" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="9">SNAP ${l}</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(c)}`}function ua(e,t=!0){X=e;const a=["outputs","inputs","cameras","youtube","tally","voice","radio","renderer"];for(const p of a){const d=document.getElementById("tab-"+p),f=document.getElementById("nav-"+p);d&&d.classList.toggle("active",p===e),f&&(p===e?f.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg bg-primary text-on-primary shadow-sm transition-all active:scale-95":f.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95")}const o=document.getElementById("nav-more"),n=document.getElementById("nav-more-label");o&&(e==="radio"||e==="inputs"||e==="renderer"?(o.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg bg-primary text-on-primary shadow-sm transition-all active:scale-95",n&&(n.textContent=e==="radio"?"Radio":e==="inputs"?"Matrix":"Render")):(o.className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[72px] h-11 px-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high active:scale-95",n&&(n.textContent="More")));const i=document.getElementById("header-icon"),r=document.getElementById("header-title"),l=document.getElementById("header-subtitle"),c=document.getElementById("lockToggleBtn");if(c&&(c.classList.toggle("hidden",e!=="inputs"),c.classList.toggle("flex",e==="inputs")),e==="outputs"?(i&&(i.textContent="crop_free"),r&&(r.textContent="PiMatrix"),l&&(l.textContent="Pi Outputs")):e==="inputs"?(i&&(i.textContent="settings_input_component"),r&&(r.textContent="Matrix Routing"),l&&(l.textContent="Atlona 4x4 Switcher")):e==="cameras"?(i&&(i.textContent="videocam"),r&&(r.textContent="Video"),l&&(l.textContent="Cameras, Presets & ATEM")):e==="youtube"?(i&&(i.textContent="smart_display"),r&&(r.textContent="YouTube Live"),l&&(l.textContent="pitube Broadcast & Confidence Monitor")):e==="tally"?(i&&(i.textContent="highlight"),r&&(r.textContent="Tally Lights"),l&&(l.textContent="Tally-Ma Wireless & PTZ Cues")):e==="voice"?(i&&(i.textContent="record_voice_over"),r&&(r.textContent="Voice"),l&&(l.textContent="pivoice capture, transcription and captions")):e==="radio"?(i&&(i.textContent="radio"),r&&(r.textContent="Web Radio"),l&&(l.textContent="Icecast2 Relay Transmission")):e==="renderer"&&(i&&(i.textContent="layers"),r&&(r.textContent="PiPGM Renderer"),l&&(l.textContent="Stub Placeholder")),mn(),Xn(e==="youtube"),io(e==="tally"),Wn(e==="voice"),ko(e==="radio"),t&&window.history&&window.history.replaceState){const p={outputs:"/outputs",inputs:"/inputs",cameras:"/cameras",youtube:"/youtube",tally:"/tally",voice:"/voice",radio:"/radio",renderer:"/pipgm"};window.history.replaceState(null,"",p[e])}}function Mt(e){const t=e===1?"hdmi0":"hdmi1",a=Ye.get(t),o=(a==null?void 0:a.observedSource)||(a==null?void 0:a.desiredSource);return o||(e===1?"PiPGM1":"rtmp1")}function rn(e){if(!e||e==="multiview")return!1;const t=R.get(e);if(t&&typeof t.fadeToBlack=="boolean")return t.fadeToBlack;const a=Pt.get(e);return a?a.fadeToBlack===!0:!1}function Uo(e){if(!e||e==="multiview")return!1;const t=R.get(e);if(t&&typeof t.muted=="boolean")return t.muted;const a=Pt.get(e);return a?!a.audioEnabled:!1}function ln(e){var a;if(!e||e==="multiview")return!1;const t=R.get(e);return!!((a=t==null?void 0:t.crop)!=null&&a.enabled)}function cn(e){var a;const t=R.get(e);return((a=t==null?void 0:t.crop)==null?void 0:a.aspectRatio)||"16:9"}function F(){Ma(1),Ma(2),dn(),fa(),Se(),S&&Ct()}function Et(e,t,a,o,n){const s=o||Y[t]||t,i=rn(t),r=Uo(t),l=ln(t),c=cn(t),p=n||`selectHdmiSource(${e}, '${t}')`,d=t==="compose1",f=a?"bg-primary text-on-primary shadow-sm border-primary":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/25 shadow-xs",k=r?"bg-tertiary text-on-tertiary shadow-xs":a?"bg-black/20 hover:bg-black/30 text-on-primary/80":"bg-surface-container hover:bg-surface-container-lowest text-on-surface-variant",w=i?"bg-error text-on-error shadow-xs animate-pulse":a?"bg-black/20 hover:bg-error hover:text-on-error text-on-primary/85":"bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error",v=l?`<span class="px-1 py-0.2 rounded text-[8px] font-bold ${a?"bg-white/25 text-on-primary":"bg-primary/15 text-primary"}">${c}</span>`:"";return`
    <div class="hdmi${e}-row flex items-center gap-1 w-full h-8 p-0.5 rounded-lg border transition-all ${f}" data-source="${t}">
      <button
        type="button"
        data-crop-source="${t}"
        onclick="${p}"
        oncontextmenu="event.preventDefault(); openSourceCropModal('${t}')"
        title="Tap to route ${s.toUpperCase()} • Hold to open Cropper"
        class="hdmi${e}-btn flex-1 h-full px-1.5 rounded-md font-label-md text-[11px] uppercase ${a?"font-bold":"font-semibold"} text-left flex items-center justify-between min-w-0 active:scale-[0.98] transition-all"
      >
        <span class="truncate flex items-center gap-1">
          ${a?'<span class="material-symbols-outlined text-[12px]">radio_button_checked</span>':""}
          <span>${s}</span>
        </span>
        <span class="flex items-center gap-1 flex-shrink-0">${v}</span>
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
          class="w-6 h-6 rounded flex items-center justify-center transition-all active:scale-90 ${k}"
        >
          <span class="material-symbols-outlined text-[13px]">${r?"volume_off":"volume_up"}</span>
        </button>`}
        <button
          type="button"
          onclick="event.stopPropagation(); toggleInputEffect('${t}', 'ftb')"
          title="${d?i?"Disable FTB on":"Fade to the key colour:":i?"Disable FTB on":"Pre-FTB / Fade to Black"} ${s.toUpperCase()}"
          ${d&&i?`style="background:${on};color:#000"`:""}
          class="px-1.5 h-6 rounded font-label-sm text-[9px] font-bold uppercase flex items-center justify-center transition-all active:scale-90 ${d&&i?"animate-pulse":w}"
        >
          FTB
        </button>
      </div>
    </div>
  `}function Ma(e){const t=Mt(e),a=document.getElementById(`hdmi${e}-active-label`),o=document.getElementById(`hdmi${e}-ftb-pill`),n=document.getElementById(`hdmi${e}-crop-pill`),s=document.getElementById(`hdmi${e}-inputs-list`),i=document.getElementById(`hdmi${e}-aux-container`),r=Y[t]||t||"--";a&&(a.textContent=r);const l=rn(t),c=ln(t);o&&o.classList.toggle("hidden",!l),n&&(n.classList.toggle("hidden",!c),c&&(n.textContent=`CROP ${cn(t)}`)),s&&(s.innerHTML=Lo.map(d=>Et(e,d,d===t)).join(""),na(s));const p=!!(t&&!Ao.has(t));if(i)if(p&&t!=="multiview"){const d=t;i.innerHTML=`
        <div class="flex flex-col gap-1">
          ${Et(e,d,!0,`Aux: ${r}`,`openAuxModal(${e})`)}
        </div>
      `,na(i)}else if(p&&t==="multiview"){const d=da==="portrait"?" (2x4)":" (4x2)";i.innerHTML=`
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
      `}function dn(){const e=document.getElementById("aux-modal-cam-list");if(!e)return;const t=Mt(Qe),a=Bo.map(n=>Et(Qe,n,t===n,Y[n]||n,`confirmAuxPick('${n}')`)).join(""),o=Et(Qe,"PiPGM3",t==="PiPGM3","pipgm 3","confirmAuxPick('PiPGM3')");e.innerHTML=`
    <div class="flex flex-col gap-1">
      <span class="font-label-sm text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">PTZ Cameras</span>
      ${a}
    </div>
    <div class="flex flex-col gap-1 pt-1.5 border-t border-outline-variant/30">
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Auxiliary Programme</span>
        <span class="font-label-sm text-[9px] uppercase text-primary font-semibold">Usually Off</span>
      </div>
      ${o}
    </div>
  `,na(e)}function fa(){for(const[e,t]of[[1,3],[2,4]]){const a=document.getElementById(`hdmi${e}-routed-badges`);if(!a)continue;const o=[];for(const[n,s]of Object.entries(V.routes||{})){const i=Number(n);i===3||i===4||s===t&&ea[i]&&o.push(ea[i])}o.length===0?a.innerHTML='<span class="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-label-sm text-[9px] font-semibold leading-none">Unrouted</span>':a.innerHTML=o.map(n=>`<span class="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-sm text-[9px] font-semibold leading-none">${n}</span>`).join("")}}async function pn(e,t){const a=e===1?"hdmi0":"hdmi1";try{const o=await fetch(`/api/v1/outputs/${a}/source`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:t})});if(o.ok){const n=await o.json();Ye.set(a,n),F();const s=t?Y[t]||t:"Cleared";b(`Pi ${e} (hdmi ${e-1}) → ${s.toUpperCase()}`)}}catch{b(`Failed to route Pi ${e}`)}}function Do(e){Qe=e;const t=document.getElementById("aux-target-label");t&&(t.textContent=`Assigning to Pi ${e} (hdmi ${e-1})`),dn();const a=document.getElementById("aux-modal-overlay");a&&typeof a.showModal=="function"&&(a.open||a.showModal())}function un(){const e=document.getElementById("aux-modal-overlay");e&&e.open&&e.close()}async function _o(e,t){if(e==="multiview"&&t)try{(await fetch("/api/v1/outputs/multiview/layout",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({layout:t})})).ok&&(da=t)}catch{}await pn(Qe,e),un()}async function Vo(e,t){const a=Mt(e);if(!a||a==="multiview"){b("Select a specific input source for FTB/Mute");return}await fn(a,t)}async function fn(e,t){const a=t==="ftb"?`/api/v1/sources/${encodeURIComponent(e)}/effects/ftb`:`/api/v1/sources/${encodeURIComponent(e)}/effects/mute`;try{const o=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toggle:!0})});if(o.ok){const n=await o.json();R.set(e,n),F();const s=(Y[e]||e).toUpperCase();b(t==="ftb"?`${s}: ${n.fadeToBlack?"FADED TO BLACK":"LIVE (FTB OFF)"}`:`${s}: ${n.muted?"AUDIO MUTED":"AUDIO UNMUTED"}`)}}catch{b(`Failed to update ${t.toUpperCase()} for ${e}`)}}let S=null;function Fo(e){const t=(Y[e]||e).toUpperCase(),a=e==="hama"?210:e.startsWith("rtmp")?160:e.startsWith("cam")?268:28,o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="cbg-${e}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${a}, 42%, 22%)"/>
        <stop offset="50%" stop-color="hsl(${a}, 35%, 15%)"/>
        <stop offset="100%" stop-color="hsl(${a}, 30%, 10%)"/>
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
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(o)}`}function Fe(e){let t=R.get(e);return t||(t={sourceId:e,crop:{enabled:!1,x:0,y:0,width:1920,height:1080,sourceWidth:1920,sourceHeight:1080,aspectRatio:"16:9",lockedAspectRatio:!1},rotation:0,fadeToBlack:!1,muted:!1,ffmpegFilter:"null"},R.set(e,t)),t}function aa(e){const t=Mt(e);if(!t||t==="multiview"){b("Select a video input source to crop");return}ma(t)}function ma(e){S=e,Ga(e),window.setCropDialogTab(e==="compose1"?"composite":"crop"),Fe(e),Ct();const t=document.getElementById("crop-modal-overlay");t&&typeof t.showModal=="function"&&(t.open||t.showModal()),requestAnimationFrame(()=>Ct())}function Ho(){const e=document.getElementById("crop-modal-overlay");e&&e.open&&e.close(),window.setCropDialogTab("crop"),Ga(null),S=null}function Ct(){var $;if(!S)return;const t=Fe(S).crop,a=t.sourceWidth||1920,o=t.sourceHeight||1080,n=Math.max(32,t.width||a),s=Math.max(32,t.height||o),i=Math.max(0,Math.min(a-n,t.x||0)),r=Math.max(0,Math.min(o-s,t.y||0)),l=(Y[S]||S).toUpperCase(),c=document.getElementById("crop-dialog-title"),p=document.getElementById("crop-zoomed-badge"),d=document.getElementById("crop-coords-readout"),f=document.getElementById("crop-interactive-rect"),k=document.getElementById("crop-rect-tag"),w=document.getElementById("crop-lock-aspect-icon"),v=document.getElementById("crop-lock-aspect-label");c&&(c.textContent=`Crop & Effects: ${l}`),p&&(p.textContent=`${t.aspectRatio}${t.enabled?" [ACTIVE]":" [FULL]"} • ${n}x${s}`),d&&(d.textContent=`x:${i} y:${r} w:${n} h:${s}`),f&&(f.style.left=`${i/a*100}%`,f.style.top=`${r/o*100}%`,f.style.width=`${n/a*100}%`,f.style.height=`${s/o*100}%`),k&&(k.textContent=`${t.aspectRatio}${t.enabled?" • ON":""}`),w&&v&&(w.textContent=t.lockedAspectRatio?"lock":"lock_open",v.textContent=`Lock Aspect: ${t.lockedAspectRatio?"ON":"OFF"}`);const I=dt.get(S),C=($=I==null?void 0:I.preview)!=null&&$.available&&I.preview.url?I.preview.url:null,j=Fo(S),x=document.getElementById("crop-full-feed");x&&x.getAttribute("data-rendered-source")!==`${S}:${C||"sim"}`&&(x.setAttribute("data-rendered-source",`${S}:${C||"sim"}`),C?x.innerHTML=`<iframe src="${C}" class="w-full h-full border-0 pointer-events-none" allow="autoplay"></iframe>`:x.innerHTML=`<img src="${j}" alt="${l}" class="w-full h-full object-cover pointer-events-none" />`);const m=document.getElementById("crop-zoomed-viewport"),g=document.getElementById("crop-zoomed-feed");if(m&&g){g.getAttribute("data-rendered-source")!==`${S}:${C||"sim"}`&&(g.setAttribute("data-rendered-source",`${S}:${C||"sim"}`),C?g.innerHTML=`<iframe src="${C}" class="w-full h-full border-0 pointer-events-none" allow="autoplay"></iframe>`:g.innerHTML=`<img src="${j}" alt="${l} Cropped" class="w-full h-full object-cover pointer-events-none" />`);const E=m.parentElement,P=((E==null?void 0:E.clientWidth)||380)-8;let oe=((E==null?void 0:E.clientHeight)||140)-8,W=Math.round(n/s*oe);W>P&&(W=P,oe=Math.max(24,Math.round(s/n*W))),m.style.width=`${W}px`,m.style.height=`${oe}px`;const pt=W/n,ut=oe/s;g.style.width=`${a}px`,g.style.height=`${o}px`,g.style.transform=`scale(${pt}, ${ut}) translate(${-i}px, ${-r}px)`}}function na(e){e.querySelectorAll("[data-crop-source]").forEach(a=>{const o=a.getAttribute("data-crop-source");if(!o)return;let n=null,s=!1;a.addEventListener("pointerdown",()=>{s=!1,n=setTimeout(()=>{s=!0,n=null,ma(o)},450)});const i=()=>{n&&(clearTimeout(n),n=null)};a.addEventListener("pointerup",i),a.addEventListener("pointerleave",i),a.addEventListener("pointercancel",i),a.addEventListener("click",r=>{s&&(r.preventDefault(),r.stopImmediatePropagation(),s=!1)},!0)})}function Go(){for(const e of[1,2]){const t=document.getElementById(`hdmi${e}-header-zone`);if(!t)continue;let a=null;t.addEventListener("pointerdown",()=>{a=setTimeout(()=>{a=null,aa(e)},450)});const o=()=>{a&&(clearTimeout(a),a=null)};t.addEventListener("pointerup",o),t.addEventListener("pointerleave",o),t.addEventListener("pointercancel",o),t.addEventListener("contextmenu",n=>{n.preventDefault(),aa(e)})}}function qo(){const e=document.getElementById("crop-interactive-box");if(!e)return;let t=!1,a=0,o=0,n=0,s=0;e.addEventListener("pointerdown",r=>{if(!S)return;const l=Fe(S);if(t=!0,a=r.clientX,o=r.clientY,n=l.crop.x,s=l.crop.y,typeof e.setPointerCapture=="function")try{e.setPointerCapture(r.pointerId)}catch{}}),e.addEventListener("pointermove",r=>{if(!t||!S)return;const l=Fe(S),c=e.getBoundingClientRect();if(!c.width||!c.height)return;const p=l.crop.sourceWidth||1920,d=l.crop.sourceHeight||1080,f=Math.round((r.clientX-a)/c.width*p),k=Math.round((r.clientY-o)/c.height*d),w=Math.max(0,Math.min(p-l.crop.width,Math.round((n+f)/2)*2)),v=Math.max(0,Math.min(d-l.crop.height,Math.round((s+k)/2)*2));l.crop.x=w,l.crop.y=v,l.crop.enabled=!0,Ct()});const i=async()=>{if(!t||!S)return;t=!1;const r=S,l=Fe(r);try{const c=await fetch(`/api/v1/sources/${encodeURIComponent(r)}/effects/crop`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:!0,x:l.crop.x,y:l.crop.y})});if(c.ok){const p=await c.json();R.set(r,p),F()}}catch{}};e.addEventListener("pointerup",()=>void i()),e.addEventListener("pointercancel",()=>void i())}async function Yo(e){if(!S)return;const t=S;try{const a=await fetch(`/api/v1/sources/${encodeURIComponent(t)}/effects/crop/preset`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({preset:e})});if(a.ok){const o=await a.json();R.set(t,o),F(),b(`${(Y[t]||t).toUpperCase()} Crop → ${o.crop.enabled?o.crop.aspectRatio:"RESET"}`)}}catch{b("Failed to apply crop preset")}}async function Wo(e){if(!S)return;const t=S;try{const a=await fetch(`/api/v1/sources/${encodeURIComponent(t)}/effects/crop/move`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({direction:e,delta:32})});if(a.ok){const o=await a.json();R.set(t,o),F()}}catch{}}async function zo(e){if(!S)return;const t=S;try{const a=await fetch(`/api/v1/sources/${encodeURIComponent(t)}/effects/crop/resize`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:e,factor:.1})});if(a.ok){const o=await a.json();R.set(t,o),F()}}catch{}}async function Xo(){if(!S)return;const e=S,a=!Fe(e).crop.lockedAspectRatio;try{const o=await fetch(`/api/v1/sources/${encodeURIComponent(e)}/effects/crop`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({lockedAspectRatio:a})});if(o.ok){const n=await o.json();R.set(e,n),F()}}catch{}}function Jo(){Se();const e=document.getElementById("rtsp-modal-overlay");e&&typeof e.showModal=="function"&&(e.open||e.showModal())}function Ko(){const e=document.getElementById("rtsp-modal-overlay");e&&e.open&&e.close()}function Se(){const e=document.getElementById("rtsp-config-btn-label"),t=document.getElementById("rtsp-dialog-status-pill"),a=document.getElementById("rtsp-stream-btn"),o=document.getElementById("rtsp-stream-icon"),n=document.getElementById("rtsp-stream-label"),s=document.getElementById("rtsp-live-dot"),i=document.getElementById("rtsp-quality-badge"),r=h.sourceId==="multiview"?`MV (${h.layout==="portrait"?"2x4":"4x2"})`:Y[h.sourceId]||h.sourceId,l=h.quality==="preview"?"Preview":"Full";if(e&&(e.textContent="Settings"),t&&(h.streaming?(t.textContent=`STREAMING • ${r.toUpperCase()}`,t.className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 font-bold uppercase text-[9px]"):(t.textContent=`STOPPED • ${r.toUpperCase()}`,t.className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-bold uppercase text-[9px]")),i){const w=(h.bitrateKbps/1e3).toFixed(1);i.textContent=`${l.toUpperCase()} ${h.resolution} • ${w} Mbps`}s&&(s.className=h.streaming?"inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0":"inline-block w-2 h-2 rounded-full bg-outline flex-shrink-0"),a&&o&&n&&(h.streaming?(a.className="h-9 px-3 rounded-lg bg-error text-on-error font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95",o.textContent="stop",n.textContent="Stop Stream"):(a.className="h-9 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95",o.textContent="play_arrow",n.textContent="Start Stream")),document.querySelectorAll(".rtsp-choice-btn").forEach(w=>{const v=w.getAttribute("data-rtsp")||"";let I=!1;if(v.startsWith("multiview:")){const C=v.split(":")[1];I=h.sourceId==="multiview"&&h.layout===C}else I=h.sourceId===v;v.startsWith("multiview:")?w.className=I?"rtsp-choice-btn flex-1 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-[9px] uppercase font-bold transition-all flex flex-col items-center justify-center leading-none p-0.5 shadow-sm":"rtsp-choice-btn flex-1 h-8 rounded-lg bg-surface-container-highest hover:bg-primary/20 text-on-surface font-label-sm text-[9px] uppercase font-semibold transition-all flex flex-col items-center justify-center leading-none p-0.5":w.className=I?"rtsp-choice-btn h-8 rounded-lg bg-primary text-on-primary font-label-md text-[11px] uppercase font-bold transition-all shadow-sm":"rtsp-choice-btn h-8 rounded-lg bg-surface-container-highest hover:bg-primary/20 text-on-surface font-label-md text-[11px] uppercase font-semibold transition-all shadow-xs"});const p=document.getElementById("rtsp-profile-preview"),d=document.getElementById("rtsp-profile-full");p&&d&&(h.quality==="preview"?(p.className="p-2 rounded-lg border border-primary bg-primary text-on-primary text-left flex flex-col gap-0.5 transition-all shadow-sm",d.className="p-2 rounded-lg border border-outline-variant/40 bg-surface-container-high text-on-surface text-left flex flex-col gap-0.5 transition-all"):(p.className="p-2 rounded-lg border border-outline-variant/40 bg-surface-container-high text-on-surface text-left flex flex-col gap-0.5 transition-all",d.className="p-2 rounded-lg border border-primary bg-primary text-on-primary text-left flex flex-col gap-0.5 transition-all shadow-sm"));const f=document.getElementById("rtsp-resolution-select"),k=document.getElementById("rtsp-bitrate-select");f&&h.resolution&&(f.value=h.resolution),k&&h.bitrateKbps&&(k.value=String(h.bitrateKbps))}async function Zo(e,t){try{const a=await fetch("/api/v1/outputs/rtsp/source",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:e,...t?{layout:t}:{}})});a.ok&&(h=await a.json(),Se(),b(`RTSP Stream Source → ${(Y[e]||e).toUpperCase()}`))}catch{b("Failed to assign RTSP source")}}async function Qo(e){const t=e==="preview"?"640x360":"1920x1080",a=e==="preview"?800:6200;try{const o=await fetch("/api/v1/outputs/rtsp/source",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:h.sourceId,layout:h.layout,quality:e,resolution:t,bitrateKbps:a})});o.ok&&(h=await o.json(),Se(),b(`RTSP Quality → ${e==="preview"?"PREVIEW (360p / 800 kbps)":"FULL (1080p / 6200 kbps)"}`))}catch{b("Failed to update RTSP quality")}}async function es(){const e=document.getElementById("rtsp-resolution-select"),t=document.getElementById("rtsp-bitrate-select"),a=(e==null?void 0:e.value)||h.resolution,o=Number((t==null?void 0:t.value)||h.bitrateKbps),n=a==="640x360"||o<=1e3?"preview":"full";try{const s=await fetch("/api/v1/outputs/rtsp/source",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:h.sourceId,layout:h.layout,quality:n,resolution:a,bitrateKbps:o})});s.ok&&(h=await s.json(),Se(),b(`RTSP → ${a} @ ${o} kbps`))}catch{b("Failed to update RTSP settings")}}async function ts(){try{const e=await fetch("/api/v1/outputs/rtsp/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toggle:!0})});e.ok&&(h=await e.json(),Se(),b(h.streaming?"RTSP Network Stream STARTED":"RTSP Network Stream STOPPED"))}catch{b("Failed to toggle RTSP stream")}}function lt(){var o;const e=document.getElementById("lockIcon"),t=document.getElementById("lockLabel"),a=document.getElementById("lockToggleBtn");e&&t&&a&&(V.locked?(e.textContent="lock",e.className="material-symbols-outlined text-[14px] text-error",t.textContent="LOCKED",t.className="text-error",a.className=`${X==="inputs"?"flex":"hidden"} items-center gap-1 px-2.5 py-1 rounded-full bg-error-container border border-error/30 text-[10px] font-label-sm font-bold uppercase transition-all active:scale-95`):(e.textContent="lock_open",e.className="material-symbols-outlined text-[14px] text-tertiary",t.textContent="UNLOCKED",t.className="text-tertiary",a.className=`${X==="inputs"?"flex":"hidden"} items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 text-[10px] font-label-sm font-bold uppercase transition-all active:scale-95`));for(const n of[1,2,5]){const s=((o=V.routes)==null?void 0:o[n])||1,i=document.getElementById(`matrix-out-${n}-status`);i&&(i.textContent=`IN ${s} • ${sn[s]||`INPUT ${s}`}`);const r=document.querySelector(`[data-output="${n}"]`);if(!r)continue;r.querySelectorAll(".matrix-btn").forEach(c=>{const p=Number(c.getAttribute("data-input")),d=c.querySelector(".matrix-sub");p===s?(c.className="matrix-btn h-12 flex flex-col items-center justify-center rounded bg-primary text-on-primary shadow-sm transition-all active:scale-95",d&&(d.className="matrix-sub font-label-sm text-[9px] text-on-primary-container uppercase tracking-tighter")):(c.className="matrix-btn h-12 flex flex-col items-center justify-center rounded bg-surface-container-highest text-on-surface hover:bg-surface-dim transition-all active:scale-95",d&&(d.className="matrix-sub font-label-sm text-[9px] text-on-surface-variant uppercase tracking-tighter"))})}}async function as(){const e=!V.locked;try{const t=await fetch("/api/v1/matrix/lock",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({locked:e})});t.ok&&(V=await t.json(),lt(),b(V.locked?"Matrix Safety LOCKED":"Matrix UNLOCKED"))}catch{V.locked=e,lt()}}async function ns(e,t){var a;if(V.locked){b("Matrix is LOCKED — unlock in top bar to route");return}try{const o=await fetch("/api/v1/matrix/route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input:e,output:t})});if(o.ok)V.routes[t]=e,lt(),fa(),b(`${ea[t]} → ${sn[e]}`);else{const n=await o.json().catch(()=>({}));b(((a=n==null?void 0:n.error)==null?void 0:a.message)||"Matrix route failed")}}catch{b("Matrix route request failed")}}function os(e){de==="dual"?(de=e,ne=e):de="dual",ae()}function mn(){Tn(X==="cameras"&&de==="dual")}function ss(e,t){var l,c;const a=document.getElementById(`cam-feed-box-${t}`);if(!a)return;const o=L.get(e),n=dt.get(e),s=(o==null?void 0:o.streaming)===!0,i=(l=n==null?void 0:n.preview)!=null&&l.available&&((c=n==null?void 0:n.preview)!=null&&c.url)?n.preview.url:null,r=s&&i?`iframe:${i}`:`offline:${e}`;if(a.getAttribute("data-render-key")!==r)if(a.setAttribute("data-render-key",r),s&&i)a.innerHTML=`<iframe src="${i}" class="w-full h-full border-0 pointer-events-none" allow="autoplay; fullscreen"></iframe>`;else{const p=rt(e).toUpperCase(),d=jo(p);a.innerHTML=`<img src="${d}" alt="${p} Not Connected" class="w-full h-full object-cover"/>`}}function ae(){const e=document.getElementById("cam-card-1"),t=document.getElementById("cam-card-2"),a=document.getElementById("cam-glow-1"),o=document.getElementById("cam-glow-2"),n=document.getElementById("cam-badge-1"),s=document.getElementById("cam-badge-2"),i=document.getElementById("cam-name-1"),r=document.getElementById("cam-name-2"),l=document.getElementById("cam1-presets-label"),c=document.getElementById("cam2-presets-label"),p=document.getElementById("target-indicator"),d=document.getElementById("param-matrix-title"),f=document.getElementById("atem-panel"),k=document.getElementById("ptz-console"),w=document.getElementById("monitorsContainer"),v=document.getElementById("expandedConfigPanel"),I=document.getElementById("cam1-presets-section"),C=document.getElementById("cam2-presets-section"),j=rt("cam1"),x=rt("cam2");i&&(i.textContent=j),r&&(r.textContent=x),l&&(l.textContent=`(${j})`),c&&(c.textContent=`(${x})`);const m=ne==="cam1";a&&(a.className=`h-1.5 w-full transition-colors ${m?"bg-primary":"bg-surface-variant"}`),o&&(o.className=`h-1.5 w-full transition-colors ${m?"bg-surface-variant":"bg-secondary"}`),n&&(n.className=m?"px-1.5 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-sm":"px-1.5 py-0.5 rounded bg-surface-container-lowest/90 text-on-surface font-label-sm text-label-sm font-bold shadow-sm"),s&&(s.className=m?"px-1.5 py-0.5 rounded bg-surface-container-lowest/90 text-on-surface font-label-sm text-label-sm font-bold shadow-sm":"px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold shadow-sm"),p&&(p.textContent=m?`TARGET: CAM 01 (${j.toUpperCase()})`:`TARGET: CAM 02 (${x.toUpperCase()})`),d&&(d.textContent=m?`CAM 01 (${j.toUpperCase()}) PARAMETER MATRIX`:`CAM 02 (${x.toUpperCase()}) PARAMETER MATRIX`),w&&e&&t&&(de==="dual"?(w.className="grid grid-cols-2 gap-space-sm w-full transition-all duration-300",e.classList.remove("hidden"),t.classList.remove("hidden"),v&&(v.classList.add("hidden"),v.classList.remove("flex")),I&&I.classList.remove("hidden"),C&&C.classList.remove("hidden")):de==="cam1"?(w.className="grid grid-cols-2 gap-space-sm w-full items-start transition-all duration-300",e.classList.remove("hidden"),t.classList.add("hidden"),v&&(v.classList.remove("hidden"),v.classList.add("flex")),I&&I.classList.remove("hidden"),C&&C.classList.add("hidden")):(w.className="grid grid-cols-2 gap-space-sm w-full items-start transition-all duration-300",e.classList.add("hidden"),t.classList.remove("hidden"),v&&(v.classList.remove("hidden"),v.classList.add("flex")),I&&I.classList.add("hidden"),C&&C.classList.remove("hidden"))),v&&(v.style.gridColumn=de==="cam1"?"2":"1",v.style.gridRow="1"),e&&(e.style.gridColumn="1"),t&&(t.style.gridColumn="2"),e&&(e.style.gridRow="1"),t&&(t.style.gridRow="1");const g=de==="dual";f&&(f.classList.toggle("hidden",!g),f.classList.toggle("flex",g)),k&&(k.classList.toggle("hidden",g),k.classList.toggle("flex",!g)),mn(),us(),["cam1","cam2"].forEach(($,E)=>{const P=E+1,B=L.get($);if(ss($,P),!B)return;const oe=document.getElementById(`cam-pos-${P}`);oe&&B.position&&(oe.textContent=`P:${B.position.pan} T:${B.position.tilt} Z:${B.position.zoom}`);const W=document.getElementById(`cam-stream-btn-${P}`),pt=document.getElementById(`cam-dot-${P}`),ut=document.getElementById(`cam-meta-${P}`);W&&(W.textContent=B.streaming?"Stop Receiving":"Start Receiving",W.className=B.streaming?"px-2 py-0.5 rounded bg-error text-on-error font-label-sm text-[9px] font-bold uppercase shadow-xs":`px-2 py-0.5 rounded bg-surface-container-lowest ${P===1?"text-primary":"text-secondary"} font-label-sm text-[9px] font-bold uppercase shadow-xs`),pt&&(pt.className=B.streaming?"w-2 h-2 rounded-full bg-emerald-500 inline-block":"w-2 h-2 rounded-full bg-outline inline-block"),ut&&(ut.textContent=B.streaming?"Receiving Preview":"Not Receiving")}),At()}function xn(){const e=document.getElementById("presetRangeInput"),t=e?e.value:"1, 2, 3, 4, 5, 6",a=[];return t.split(",").forEach(o=>{const n=o.trim();if(n)if(n.includes("-")){const[s,i]=n.split("-"),r=parseInt(s??"",10),l=parseInt(i??"",10);if(!Number.isNaN(r)&&!Number.isNaN(l)&&r<=l)for(let c=r;c<=Math.min(l,r+24);c++)c>=0&&c<=254&&!a.includes(c)&&a.push(c)}else{const s=parseInt(n,10);!Number.isNaN(s)&&s>=0&&s<=254&&!a.includes(s)&&a.push(s)}}),a.length>0?a:[1,2,3,4,5,6]}function xa(e,t){var n,s;const a=L.get(e),o=(n=a==null?void 0:a.presets)==null?void 0:n.find(i=>i.id===t);return o!=null&&o.name?o.name:((s=Ro[e])==null?void 0:s[t])||`Preset ${t}`}function is(e,t){var n;const a=L.get(e),o=(n=a==null?void 0:a.presets)==null?void 0:n.find(s=>s.id===t);return o==null?void 0:o.thumbnail}function At(){const e=xn();["cam1","cam2"].forEach(t=>{const a=document.getElementById(`${t}-presets-grid`);if(!a)return;const o=t==="cam1",n=pa[t];a.innerHTML=e.map(s=>{const i=s===n,r=xa(t,s),l=is(t,s),c=`P-${String(s).padStart(2,"0")}`;if(ta==="thumb"){const f=i?o?"border-2 border-primary ring-2 ring-primary/20":"border-2 border-secondary ring-2 ring-secondary/20":"border border-outline-variant/40",k=l?`<img src="${l}" alt="${r}" class="w-full h-16 object-cover"/>`:`<div class="w-full h-16 bg-inverse-surface flex flex-col items-center justify-center text-inverse-on-surface/60">
                 <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                 <span class="font-label-sm text-[8px] uppercase">No Thumb</span>
               </div>`;return`<button type="button" onclick="handlePresetTap('${t}', ${s})" class="rounded-lg overflow-hidden bg-surface-container-high ${f} flex flex-col active:scale-95 transition-all text-left shadow-xs">
            <div class="relative w-full h-16">
              ${k}
              <span class="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 text-white font-label-sm text-[8px] font-bold">${c}</span>
            </div>
            <div class="px-1.5 py-1 flex items-center justify-between w-full bg-surface-container-low">
              <span class="font-body-md text-[10px] font-semibold text-on-surface truncate">${r}</span>
            </div>
          </button>`}const p=i?o?"bg-primary text-on-primary shadow-sm":"bg-secondary text-on-secondary shadow-sm":"bg-surface-container-high hover:bg-surface-container-highest text-on-surface",d=i?"opacity-80":"text-on-surface-variant";return ta==="number"?`<button type="button" onclick="handlePresetTap('${t}', ${s})" class="h-12 rounded-lg ${p} p-space-xs flex flex-col items-center justify-center active:scale-95 transition-all">
            <span class="font-label-lg text-[14px] font-bold">${c}</span>
          </button>`:`<button type="button" onclick="handlePresetTap('${t}', ${s})" class="h-12 rounded-lg ${p} p-space-xs flex flex-col justify-between items-start active:scale-95 transition-all">
          <div class="w-full flex items-center justify-between">
            <span class="font-label-sm text-[9px] uppercase ${d}">${c}</span>
            ${l?`<span class="material-symbols-outlined text-[11px] ${d}" title="Thumbnail saved">image</span>`:""}
          </div>
          <span class="font-body-md text-xs font-semibold truncate w-full text-left">${r}</span>
        </button>`}).join("")})}function ba(){Le=!Le,Le&&J&&(J=!1,St());const e=document.getElementById("savePresetPill"),t=document.getElementById("savePresetKnob"),a=document.getElementById("savePresetSub");e&&t&&(Le?(e.className="w-8 h-4 rounded-full bg-primary flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-on-primary translate-x-4 transition-transform",a&&(a.textContent="ARMED: Tap slot to save"),b("Save Preset ARMED — tap any preset slot to store")):(e.className="w-8 h-4 rounded-full bg-surface-container-highest flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-outline transition-transform",a&&(a.textContent="Tap slot to store")))}function St(){const e=document.getElementById("thumbPill"),t=document.getElementById("thumbKnob"),a=document.getElementById("thumbCaptureSub");e&&t&&(J?(e.className="w-8 h-4 rounded-full bg-secondary flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-on-secondary translate-x-4 transition-transform",a&&(a.textContent="Tap slot to snap thumb")):(e.className="w-8 h-4 rounded-full bg-surface-container-highest flex items-center p-0.5 transition-colors",t.className="w-3 h-3 rounded-full bg-outline transition-transform",a&&(a.textContent="Tap or hold for auto")))}async function oa(e,t){const a=L.get(e),o=(a==null?void 0:a.position)??{pan:0,tilt:0,zoom:0},n=xa(e,t),s=No(e,t,n,o);try{const i=await fetch(`/api/v1/cameras/${e}/presets/${t}/thumbnail`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({thumbnail:s})});if(i.ok){const r=await i.json();r.camera&&L.set(e,r.camera)}}catch{if(a){const i=a.presets.find(r=>r.id===t);i?i.thumbnail=s:a.presets.push({id:t,name:n,thumbnail:s})}}bn("thumb")}async function rs(){if(_t)return;_t=!0;const e=ne,t=xn(),a=document.getElementById("auto-sweep-badge");a&&a.classList.remove("hidden"),b(`Auto Thumb Capture started for ${e.toUpperCase()} (${t.length} presets)`);try{for(let o=0;o<t.length;o++){const n=t[o];pa[e]=n,a&&(a.textContent=`Auto-Thumb: Preset ${n} (${o+1}/${t.length}) — recalling & waiting 2s...`),At(),await fetch(`/api/v1/cameras/${e}/presets/${n}/recall`,{method:"POST"}).catch(()=>{});const s=await fetch(`/api/v1/cameras/${e}`).catch(()=>null);s&&s.ok&&(L.set(e,await s.json()),ae()),await new Promise(i=>setTimeout(i,2e3)),await oa(e,n),b(`Captured thumbnail for ${e.toUpperCase()} Preset ${n}`)}b(`Completed Auto Thumb Capture (${t.length} presets)`)}finally{_t=!1,a&&a.classList.add("hidden")}}function ls(){const e=document.getElementById("setThumbBtn");if(!e)return;let t=null,a=!1;e.addEventListener("pointerdown",()=>{a=!1,t=setTimeout(()=>{a=!0,t=null,rs()},600)});const o=()=>{t&&(clearTimeout(t),t=null)};e.addEventListener("pointerup",o),e.addEventListener("pointerleave",o),e.addEventListener("click",n=>{if(n.stopPropagation(),a){a=!1;return}J=!J,J&&Le&&ba(),St(),J&&b("Thumb Capture ARMED — tap any preset to snap thumbnail (or hold button for auto-sweep)")})}function bn(e){ta=e,document.querySelectorAll(".preset-view-mode-btn").forEach(a=>{a.getAttribute("data-mode")===e?a.className="preset-view-mode-btn px-2 py-1 rounded font-label-sm text-[10px] uppercase font-bold bg-surface text-primary shadow-sm":a.className="preset-view-mode-btn px-2 py-1 rounded font-label-sm text-[10px] uppercase text-on-surface-variant"}),At()}async function cs(e,t){if(ne=e,pa[e]=t,Le){const a=xa(e,t);try{if((await fetch(`/api/v1/cameras/${e}/presets/${t}/save`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a})})).ok){J&&(await oa(e,t),J=!1,St()),b(`Saved ${e.toUpperCase()} Preset ${t} (${a})`),ba();const n=await fetch(`/api/v1/cameras/${e}`);n.ok&&L.set(e,await n.json()),ae()}}catch{b("Failed to save preset")}return}if(J){await oa(e,t),J=!1,St(),b(`Captured thumbnail for ${e.toUpperCase()} Preset ${t}`);return}try{if((await fetch(`/api/v1/cameras/${e}/presets/${t}/recall`,{method:"POST"})).ok){b(`Recalled ${e.toUpperCase()} Preset ${t}`);const o=await fetch(`/api/v1/cameras/${e}`);o.ok&&L.set(e,await o.json()),ae()}}catch{b("Failed to recall preset")}}async function ds(e){const t=ne,a=Math.min(23,we);try{if((await fetch(`/api/v1/cameras/${t}/move`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({direction:e,panSpeed:we,tiltSpeed:a})})).ok){const n=await fetch(`/api/v1/cameras/${t}`);n.ok&&L.set(t,await n.json()),ae()}}catch{b("PTZ Move failed")}}async function ps(e){const t=ne;try{if((await fetch(`/api/v1/cameras/${t}/zoom`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:e,speed:4})})).ok){const o=await fetch(`/api/v1/cameras/${t}`);o.ok&&L.set(t,await o.json()),ae()}}catch{b("Zoom command failed")}}const Ft="h-10 rounded-lg bg-primary text-on-primary font-label-md text-[10px] font-semibold flex items-center justify-center text-center leading-tight active:scale-95 transition-all",Ht="h-10 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-[10px] font-semibold flex items-center justify-center text-center leading-tight active:scale-95 transition-all";function us(){const e=L.get(ne),t=(e==null?void 0:e.privacyBlur)===!0,a=(e==null?void 0:e.focusMode)==="manual",o=document.getElementById("focus-af-btn"),n=document.getElementById("focus-mf-btn"),s=document.getElementById("privacy-blur-btn");o&&(o.className=!t&&!a?Ft:Ht),n&&(n.className=!t&&a?Ft:Ht),s&&(s.className=`col-span-2 gap-1 ${t?Ft:Ht}`)}async function gn(e){const t=await fetch(`/api/v1/cameras/${e}`);t.ok&&L.set(e,await t.json()),ae()}async function fs(e){const t=ne;try{(await fetch(`/api/v1/cameras/${t}/focus`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:e})})).ok?(await gn(t),b(`${t.toUpperCase()} focus: ${e.toUpperCase()}`)):b("Focus command failed")}catch{b("Focus command failed")}}async function ms(){var a;const e=ne,t=((a=L.get(e))==null?void 0:a.privacyBlur)!==!0;try{(await fetch(`/api/v1/cameras/${e}/privacy-blur`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:t})})).ok?(await gn(e),b(`${e.toUpperCase()} privacy blur ${t?"ON":"OFF"}`)):b("Privacy blur failed")}catch{b("Privacy blur failed")}}async function xs(e){var o,n;const t=!!((o=L.get(e))!=null&&o.streaming),a=t?`/api/v1/cameras/${e}/stream/stop`:`/api/v1/cameras/${e}/stream/start`;try{if((await fetch(a,{method:"POST"})).ok){const i=await fetch(`/api/v1/cameras/${e}`);i.ok&&L.set(e,await i.json());const r=((n=L.get(e))==null?void 0:n.streaming)??!t;ae();const l=rt(e);b(`${l}: ${r?"Started receiving preview":"Stopped receiving preview"}`)}}catch{b("Camera receive toggle failed")}}function bs(e){we=Math.max(1,Math.min(24,we+e));const t="0x"+we.toString(16).toUpperCase().padStart(2,"0"),a=document.getElementById("ptz-speed-label"),o=document.getElementById("ptz-speed-bar");a&&(a.textContent=`SPD ${we} (${t})`),o&&(o.style.width=`${Math.round(we/24*100)}%`)}function Pe(e){Oa(document.getElementById(e))}function gs(e){var t;X=e.activeTab||"outputs";for(const a of e.sources||[])dt.set(a.id,a);for(const a of e.outputs||[])Ye.set(a.id,a);for(const a of e.effects||[])R.set(a.sourceId,a);for(const a of e.cameras||[])L.set(a.id,a);for(const a of e.pipgmPipelines||[])Pt.set(a.id,a);(t=e.multiview)!=null&&t.layout&&(da=e.multiview.layout),e.matrix&&(V=e.matrix),e.rtspOut&&(h={...h,...e.rtspOut})}async function ys(){if(window.__PIMATRIX_INITIAL__){gs(window.__PIMATRIX_INITIAL__);return}const e=window.location.pathname;e.startsWith("/inputs")?X="inputs":e.startsWith("/cameras")?X="cameras":e.startsWith("/pipgm")||e.startsWith("/renderer")?X="renderer":e.startsWith("/voice")?X="voice":X="outputs";const[t,a,o,n,s,i]=await Promise.all([fetch("/api/v1/sources?includeHidden=true").catch(()=>null),fetch("/api/v1/outputs").catch(()=>null),fetch("/api/v1/effects?includeHidden=true").catch(()=>null),fetch("/api/v1/cameras").catch(()=>null),fetch("/api/v1/matrix").catch(()=>null),fetch("/api/v1/outputs/rtsp").catch(()=>null)]);t!=null&&t.ok&&(await t.json()).items.forEach(l=>dt.set(l.id,l)),a!=null&&a.ok&&(await a.json()).items.forEach(l=>Ye.set(l.id,l)),o!=null&&o.ok&&(await o.json()).items.forEach(l=>R.set(l.sourceId,l)),n!=null&&n.ok&&(await n.json()).items.forEach(l=>L.set(l.id,l)),s!=null&&s.ok&&(V=await s.json()),i!=null&&i.ok&&(h={...h,...await i.json()})}async function vs(){const[e,t]=await Promise.all([fetch("/api/v1/outputs").catch(()=>null),fetch("/api/v1/effects?includeHidden=true").catch(()=>null)]);e!=null&&e.ok&&(await e.json()).items.forEach(a=>Ye.set(a.id,a)),t!=null&&t.ok&&(await t.json()).items.forEach(a=>R.set(a.sourceId,a)),F()}function hs(){const e=new EventSource("/api/v1/events"),t=document.getElementById("sse-dot"),a=document.getElementById("sse-status-text");e.addEventListener("open",()=>{t&&(t.className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"),a&&(a.textContent="ONLINE")}),e.addEventListener("output",o=>{try{const n=JSON.parse(o.data);n.output&&(Ye.set(n.output.id,n.output),F())}catch{}}),e.addEventListener("effects",o=>{try{const n=JSON.parse(o.data);n.sourceId&&n.effects&&(R.set(n.sourceId,n.effects),F())}catch{}}),e.addEventListener("pipgm",o=>{try{const n=JSON.parse(o.data);if(n.pipeline){Pt.set(n.pipeline.id,n.pipeline);const s=R.get(n.pipeline.id);s&&(s.fadeToBlack=n.pipeline.fadeToBlack,s.muted=!n.pipeline.audioEnabled),F()}}catch{}}),e.addEventListener("matrix",o=>{try{const n=JSON.parse(o.data);n&&(V={locked:!!n.locked,routes:n.routes||V.routes},lt(),fa())}catch{}}),e.addEventListener("rtsp",o=>{try{const n=JSON.parse(o.data);n&&(h={...h,...n},Se())}catch{}}),e.addEventListener("camera",o=>{try{const n=JSON.parse(o.data),s=L.get(n.id);s&&(n.position&&(s.position=n.position),typeof n.streaming=="boolean"&&(s.streaming=n.streaming),n.smartFrame&&(s.smartFrame=n.smartFrame),typeof n.privacyBlur=="boolean"&&(s.privacyBlur=n.privacyBlur),n.focusMode&&(s.focusMode=n.focusMode),ae())}catch{}}),e.addEventListener("error",()=>{t&&(t.className="w-2 h-2 rounded-full bg-error"),a&&(a.textContent="RECONNECTING")})}window.switchTab=e=>ua(e,!0);window.openMoreModal=()=>{var e;return(e=document.getElementById("more-modal-overlay"))==null?void 0:e.showModal()};window.closeMoreModal=()=>{var e;return(e=document.getElementById("more-modal-overlay"))==null?void 0:e.close()};window.selectMoreTab=e=>{ua(e),window.closeMoreModal()};window.closeYoutubeCreateModal=()=>{var e;return(e=document.getElementById("youtube-create-modal"))==null?void 0:e.close()};window.closeYoutubeStopModal=()=>{var e;return(e=document.getElementById("youtube-stop-modal"))==null?void 0:e.close()};window.handleAdHocCreateSubmit=()=>{var o,n,s;const e=(o=document.getElementById("yt-create-title"))==null?void 0:o.value.trim(),t=(n=document.getElementById("yt-create-privacy"))==null?void 0:n.value,a=(s=document.getElementById("yt-create-desc"))==null?void 0:s.value.trim();if(!e){alert("Sy�t� l�hetykselle otsikko.");return}window.closeYoutubeCreateModal(),no(e,t,a)};window.handleConfirmStopBroadcast=()=>{window.closeYoutubeStopModal(),en()};window.triggerCamDirectorCue=e=>{an(ne==="cam2"?"tally02":"tally01",e)};window.selectHdmiSource=pn;window.openAuxModal=Do;window.closeAuxModal=un;window.confirmAuxPick=_o;window.toggleOutputInputControl=Vo;window.toggleInputEffect=fn;window.openOutputCropModal=aa;window.openSourceCropModal=ma;window.closeCropModal=Ho;window.applySourceCropPreset=Yo;window.moveSourceCrop=Wo;window.openAuthModal=yn;window.closeAuthModal=vn;window.submitAuthPassword=ws;window.clearAuthPassword=Ts;window.showMediaMtxModal=ks;window.closeMediaMtxModal=$s;window.copyMediaMtxPassword=Es;window.resizeSourceCrop=zo;window.toggleSourceCropLockAspect=Xo;window.openRtspModal=Jo;window.closeRtspModal=Ko;window.assignRtsp=Zo;window.setRtspQualityProfile=Qo;window.updateRtspCustomQuality=es;window.toggleRtspStream=ts;window.toggleMatrixLock=as;window.routeMatrixCrosspoint=ns;window.tapCameraCard=os;window.toggleCameraStream=xs;window.toggleSavePresetMode=ba;window.setPresetViewMode=bn;window.renderCameraPresets=At;window.handlePresetTap=cs;window.sendPTZMove=ds;window.sendPTZZoom=ps;window.setFocusMode=fs;window.togglePrivacyBlur=ms;window.adjustPtzSpeed=bs;function ga(){var n,s;const e=localStorage.getItem("pimatrix_auth_token"),t=document.getElementById("top-auth-label"),a=document.getElementById("top-auth-icon");if(!t||!a)return;((n=window.__PIMATRIX_INITIAL__)==null?void 0:n.isWhitelisted)?(t.textContent="LAN PASS",a.textContent="verified_user",a.classList.remove("text-error","text-primary"),a.classList.add("text-emerald-400")):e?(t.textContent="SAVED",a.textContent="lock_open",a.classList.remove("text-error","text-emerald-400"),a.classList.add("text-primary")):(s=window.__PIMATRIX_INITIAL__)!=null&&s.authRequired?(t.textContent="LOCKED",a.textContent="lock",a.classList.remove("text-primary","text-emerald-400"),a.classList.add("text-error")):(t.textContent="OPEN",a.textContent="lock_open",a.classList.remove("text-error","text-emerald-400"),a.classList.add("text-primary"))}function yn(){var s,i;const e=document.getElementById("auth-modal-overlay");if(!e)return;const t=document.getElementById("auth-key-input"),a=document.getElementById("auth-error-msg");t&&(t.value=localStorage.getItem("pimatrix_auth_token")||"");const o=(s=window.__PIMATRIX_INITIAL__)==null?void 0:s.isWhitelisted,n=(i=window.__PIMATRIX_INITIAL__)==null?void 0:i.clientIp;o&&a?(a.textContent=`Operator LAN IP (${n||"Whitelisted"}) is authorized. Password entry is optional.`,a.classList.remove("hidden","text-error"),a.classList.add("text-emerald-400")):a&&(a.classList.remove("text-emerald-400"),a.classList.add("text-error","hidden"),a.textContent=""),e.showModal()}function vn(){const e=document.getElementById("auth-modal-overlay");e==null||e.close()}async function ws(){var n;const e=document.getElementById("auth-key-input"),t=document.getElementById("auth-remember-check"),a=document.getElementById("auth-error-msg"),o=((n=e==null?void 0:e.value)==null?void 0:n.trim())||"";try{(await nn("/api/v1/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:o})})).ok?(t!=null&&t.checked?localStorage.setItem("pimatrix_auth_token",o):localStorage.removeItem("pimatrix_auth_token"),ga(),vn()):a&&(a.textContent="Invalid API key / password for this PiMatrix node.",a.classList.remove("hidden"))}catch(s){a&&(a.textContent="Network error verifying password: "+String(s),a.classList.remove("hidden"))}}function Ts(){localStorage.removeItem("pimatrix_auth_token");const e=document.getElementById("auth-key-input");e&&(e.value=""),ga();const t=document.getElementById("auth-error-msg");t&&(t.textContent="Saved password cleared.",t.classList.remove("hidden"))}function ks(){var s;const e=document.getElementById("mediamtx-modal-overlay");if(!e)return;const t=window.location.hostname||"127.0.0.1",a=document.getElementById("rtmp-ingest-val"),o=document.getElementById("srt-ingest-val"),n=document.getElementById("mediamtx-pass-val");if(a&&(a.textContent=`rtmp://${t}:1935/<sourceId>`),o&&(o.textContent=`srt://${t}:8890?streamid=publish:<sourceId>`),n){const i=(s=window.__PIMATRIX_INITIAL__)==null?void 0:s.mediaMtxPassword;n.textContent=i||"None (Open)"}e.showModal()}function $s(){const e=document.getElementById("mediamtx-modal-overlay");e==null||e.close()}function Es(){var t;const e=((t=window.__PIMATRIX_INITIAL__)==null?void 0:t.mediaMtxPassword)||"";e&&navigator.clipboard.writeText(e)}window.copyIngestVal=e=>{const t=document.getElementById(e);t!=null&&t.textContent&&navigator.clipboard.writeText(t.textContent.trim())};async function Cs(){var o;Pe("auth-modal-overlay"),Pe("mediamtx-modal-overlay"),ga(),Pe("aux-modal-overlay"),Pe("rtsp-modal-overlay"),Pe("crop-modal-overlay"),Pe("comp-settings-modal"),Go(),qo(),ls(),(o=document.getElementById("crop-modal-overlay"))==null||o.addEventListener("close",()=>window.setCropDialogTab("crop")),kn(b),jn(b),Sn(b,vs),Yn();const e=document.getElementById("youtube-root");e&&Jn(e);const t=document.getElementById("tally-root");t&&ro(t);const a=document.getElementById("radio-root");a&&$o(a),fetch("/api/v1/composites/compose1").then(n=>n.ok?n.json():null).then(n=>{n!=null&&n.keyColor&&(on=n.keyColor,F())}).catch(()=>{}),await ys(),Oo(),ua(X,!1),F(),lt(),ae(),hs()}Cs();
