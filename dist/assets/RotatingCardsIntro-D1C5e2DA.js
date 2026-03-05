import{r as i,j as e}from"./index-CCM22ZjZ.js";function T({images:c=[],intervalMs:u=1e4,videoFor:y,onStoryline:w,onPortrait:k}){const d=i.useRef(null),[t,x]=i.useState(null),[g,h]=i.useState(0),[v,b]=i.useState(!1),p=t!==null,f=i.useMemo(()=>c.length?c.map(r=>({type:"img",src:r})):Y.map(r=>({type:"bg",bg:r})),[c]),o=Math.max(1,f.length),s=360/o;i.useEffect(()=>{const r=d.current;if(!r)return;Array.from(r.children).forEach((l,m)=>{l.style.transform=`rotateY(${m*s}deg) translateZ(var(--z-depth))`,l.style.pointerEvents="auto"})},[s,o,f.length]),i.useEffect(()=>{const r=d.current;if(!r)return;let a=0;r.style.transform="translateZ(-100px) rotateX(-8deg) rotateY(0deg)",m(a);const l=setInterval(()=>{p||(a=(a+1)%o,r.style.transform=`translateZ(-100px) rotateX(-8deg) rotateY(${-a*s}deg)`,m(a))},Math.max(500,u));return()=>clearInterval(l);function m(N){Array.from(r.children).forEach((A,R)=>{const Z=R===N;A.classList.toggle("rcg-front",Z)}),h(N)}},[o,s,u,p]);const _=r=>{const a=d.current;a&&(b(!0),h(r),a.style.transition="transform 500ms cubic-bezier(.22,.61,.36,1)",requestAnimationFrame(()=>{a.style.transform=`translateZ(-100px) rotateX(-8deg) rotateY(${-r*s}deg)`}),setTimeout(()=>{a.style.transition="",b(!1)},520))},z=()=>_((g-1+o)%o),C=()=>_((g+1)%o),S=r=>{const a=d.current;a&&(b(!0),h(r),a.style.transition="transform 600ms cubic-bezier(.22,.61,.36,1)",requestAnimationFrame(()=>{a.style.transform=`translateZ(-100px) rotateX(-8deg) rotateY(${-r*s}deg)`}),setTimeout(()=>{a.style.transition="",b(!1),x(r)},620))},$=()=>x(g),n=r=>{const a=f[r];if(!a)return`Style ${r+1}`;if(a.type==="img"&&typeof a.src=="string"){const l=a.src.split("/").pop()||`style-${r+1}`;return F(l.replace(/\.[a-z0-9]+$/i,""))}return`Style ${r+1}`},E=()=>{if(t==null)return;const r={index:t,name:n(t)};w?w(r):alert(`Storyline with: ${r.name}`)},I=()=>{if(t==null)return;const r={index:t,name:n(t)};k?k(r):alert(`Portrait with: ${r.name}`)},j=t!=null&&typeof y=="function"?y(t):null;return i.useEffect(()=>{if(!p)return;const r=document.documentElement.style.overflow;return document.documentElement.style.overflow="hidden",()=>document.documentElement.style.overflow=r},[p]),e.jsxs("main",{className:"rcg-app","aria-label":"3D card gallery",children:[e.jsxs("header",{className:"rcg-header",children:[e.jsxs("h1",{className:"rcg-title",children:[e.jsx("span",{children:"Welcome"}),e.jsx("br",{}),e.jsx("span",{children:"to"}),e.jsx("br",{}),e.jsx("span",{children:"Art Exhibit"}),e.jsxs("div",{className:"aurora","aria-hidden":"true",children:[e.jsx("div",{className:"aurora__item"}),e.jsx("div",{className:"aurora__item"}),e.jsx("div",{className:"aurora__item"}),e.jsx("div",{className:"aurora__item"})]})]}),e.jsx("p",{className:"rcg-subtitle",children:"Discover different artists and choose a painting style to transform your portrait or story into art."})]}),e.jsxs("section",{className:"rcg-stage","aria-label":"rotating gallery",children:[e.jsx("div",{className:"rcg-ring",ref:d,children:f.map((r,a)=>e.jsx("button",{type:"button",className:"rcg-card","aria-label":`Open ${n(a)} preview`,onClick:()=>S(a),children:e.jsxs("div",{className:"rcg-inner",style:r.type==="bg"?{backgroundImage:r.bg}:void 0,children:[r.type==="img"&&e.jsx("img",{src:r.src,alt:`card ${a+1}`,loading:"eager"}),e.jsx("div",{className:"label",children:n(a)})]})},a))}),e.jsxs("div",{className:"rcg-controls","aria-label":"carousel controls",children:[e.jsx("button",{className:"rcg-ctrl rcg-ctrl--icon",onClick:z,"aria-label":"Previous",disabled:v,children:"‹"}),e.jsx("button",{className:"rcg-ctrl rcg-ctrl--play",onClick:$,"aria-label":`Play ${n(g)} video`,disabled:v,title:n(g),children:"▶ Play"}),e.jsx("button",{className:"rcg-ctrl rcg-ctrl--icon",onClick:C,"aria-label":"Next",disabled:v,children:"›"})]})]}),p&&e.jsx("div",{className:"rcg-overlay",role:"dialog","aria-modal":"true","aria-label":`${n(t)} preview`,onClick:r=>{r.target===r.currentTarget&&x(null)},children:e.jsxs("div",{className:"rcg-overlay__panel",children:[e.jsxs("header",{className:"rcg-overlay__head",children:[e.jsx("div",{className:"rcg-overlay__title",children:n(t)}),e.jsx("button",{className:"rcg-overlay__close",onClick:()=>x(null),"aria-label":"Close preview",children:"✕"})]}),e.jsx("div",{className:"rcg-overlay__media",children:j?e.jsx(e.Fragment,{children:e.jsx("video",{src:j,className:"rcg-overlay__video",autoPlay:!0,playsInline:!0,loop:!0})}):e.jsxs("div",{className:"rcg-overlay__placeholder",children:[e.jsx("div",{className:"rcg-overlay__pulse"}),e.jsx("span",{children:"No video mapped for this style."})]})}),e.jsxs("div",{className:"rcg-overlay__actions",children:[e.jsx("button",{className:"rcg-btn",onClick:E,children:"Storyline in this style"}),e.jsx("button",{className:"rcg-btn",onClick:I,children:"Portrait in this style"})]})]})}),e.jsx("style",{children:P})]})}const Y=["radial-gradient(80% 60% at 30% 20%, #7dd3fc, #1e3a8a)","radial-gradient(60% 80% at 70% 30%, #c4b5fd, #4c1d95)","radial-gradient(65% 70% at 40% 40%, #fda4af, #7f1d1d)","radial-gradient(70% 70% at 60% 50%, #86efac, #064e3b)","radial-gradient(75% 75% at 50% 40%, #fde68a, #78350f)","radial-gradient(80% 60% at 40% 60%, #a5f3fc, #164e3c)","radial-gradient(60% 80% at 30% 60%, #f0abfc, #701a75)","radial-gradient(80% 80% at 50% 50%, #93c5fd, #1e3a8a)"];function F(c){return c.replace(/[_-]+/g," ").replace(/\s+/g," ").replace(/\b\w/g,u=>u.toUpperCase())}const P=`

/* On-video artist name badge */
.rcg-video-caption{
  position:absolute;
  left:12px; bottom:12px;
  padding:8px 12px;
  border-radius:10px;
  font-weight:800; letter-spacing:.2px;
  color:var(--ink);
  background:rgba(0,0,0,.45);
  border:1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(6px);
  pointer-events:none;
  user-select:none;
}
:root{
  --bg: #0b0f17;
  --ink: #e8f0ff;
  --muted:#9fb3d9;

  --ring-size: 440px;
  --card-w: 220px;
  --card-h: 300px;
  --z-depth: 380px;
}

/* Layout */
.rcg-app{
  margin:0;
  min-height:100vh;
  background:radial-gradient(1000px 800px at 70% 15%, #14233d 0%, var(--bg) 60%, #070a10 100%);
  color:var(--ink);
  font-family: Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif;
  display:grid;
  grid-template-rows: auto auto 1fr;
  gap:18px;
  padding:24px;
}

/* Heading + aurora */
.rcg-header{ text-align:center; display:grid; gap:8px; place-items:center; }
.rcg-title{
  position:relative; margin:0; line-height:1.0; letter-spacing:-0.02em;
  font-weight:800; font-size:clamp(45px, 6vw, 56px); padding:8px 12px; overflow:hidden;
}
.rcg-title span{ display:inline-block; }
.rcg-subtitle{
  max-width:860px; margin:0 auto;
  font-size:clamp(14px, 1.8vw, 18px); color:rgba(232,240,255,.85);
}
.aurora{ position:absolute; inset:0; z-index:1; pointer-events:none; mix-blend-mode:darken; }
.aurora__item{
  position:absolute; width:60vw; height:60vw; filter:blur(1rem); mix-blend-mode:overlay;
  border-radius:37% 29% 27% 27% / 28% 25% 41% 37%; opacity:.75;
}
.aurora__item:nth-of-type(1){ background:#00c2ff; top:-50%; animation: aurora-border 6s ease-in-out infinite, aurora-1 12s ease-in-out infinite alternate; }
.aurora__item:nth-of-type(2){ background:#ffc640; right:0; top:0; animation: aurora-border 6s ease-in-out infinite, aurora-2 12s ease-in-out infinite alternate; }
.aurora__item:nth-of-type(3){ background:#33ff8c; left:0; bottom:0; animation: aurora-border 6s ease-in-out infinite, aurora-3 8s ease-in-out infinite alternate; }
.aurora__item:nth-of-type(4){ background:#e54cff; right:0; bottom:-50%; animation: aurora-border 6s ease-in-out infinite, aurora-4 24s ease-in-out infinite alternate; }

/* Stage */
.rcg-stage{
  width:var(--ring-size); height:var(--ring-size);
  perspective:1200px; touch-action:pan-y; justify-self:center;
  position:relative; display:flex; align-items:center; justify-content:center;
}

/* Controls centered under the ring */
.rcg-controls{
  position:absolute; bottom:-52px; left:50%; transform:translateX(-50%);
  display:flex; gap:10px; align-items:center; z-index:35;
}
.rcg-ctrl{
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.28);
  color:var(--ink);
  padding:10px 16px; border-radius:12px;
  font-weight:700; letter-spacing:.2px;
  cursor:pointer; backdrop-filter:blur(6px);
  transition: transform .15s ease, background .15s ease, box-shadow .15s ease, opacity .15s ease;
}
.rcg-ctrl:hover{ transform:translateY(-2px); background: rgba(255,255,255,.12); box-shadow:0 10px 30px rgba(0,0,0,.35); }
.rcg-ctrl:disabled{ opacity:.55; cursor:not-allowed; }
.rcg-ctrl--icon{ width:44px; height:44px; padding:0; border-radius:50%; font-size:24px; line-height:1; display:grid; place-items:center; }
.rcg-ctrl--play{ padding:10px 18px; }

/* Ring */
.rcg-ring{
  position:relative; width:100%; height:100%;
  transform-style:preserve-3d;
  transition: transform 1s cubic-bezier(.22,.61,.36,1);
  backface-visibility:hidden; -webkit-backface-visibility:hidden;
}

/* Card (button) */
.rcg-card{
  position:absolute; top:50%; left:50%;
  width:var(--card-w); height:var(--card-h);
  transform-style:preserve-3d;
  translate:-50% -50%;
  will-change:transform;
  padding:0; border:0; background:none; cursor:pointer;
  pointer-events:auto;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

/* Make only card visuals ignore pointer events (so the button gets clicks) */
.rcg-inner, .rcg-inner *{ pointer-events:none; }

/* Card visuals */
.rcg-inner{
  position:absolute; inset:0;
  border-radius:18px; overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.06);
  background:#111825;
  display:grid; place-items:end start;
  transition: transform .25s ease, filter .25s ease, box-shadow .25s ease;
}
.rcg-card.rcg-front .rcg-inner{
  transform: scale(1.06);
  filter: brightness(1) saturate(1.05);
  box-shadow:0 26px 64px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.08);
}
.rcg-inner img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  filter:saturate(1.05) contrast(1.05);
  transform: translateZ(1px);
  backface-visibility:hidden; -webkit-backface-visibility:hidden;
}
.rcg-inner .label{
  width:100%; padding:10px 12px; font-weight:700; letter-spacing:.3px;
  background: linear-gradient(360deg, rgba(0,0,0,.0), rgba(0,0,0,.35));
  color:var(--ink); text-shadow: 0 1px 0 rgba(0,0,0,.6);
}

/* Overlay */
.rcg-overlay{
  position:fixed; inset:0; z-index:60;
  background: rgba(0,0,0,.65);
  display:flex; align-items:center; justify-content:center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  backdrop-filter: blur(6px);
}
.rcg-overlay__panel{
  width:min(1100px, 100%);
  border-radius:18px; overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(9,14,22,.92);
  box-shadow: 0 40px 120px rgba(0,0,0,.6);
  display:grid; grid-template-rows:auto 1fr auto;
}
.rcg-overlay__head{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(360deg, rgba(255,255,255,.05), rgba(255,255,255,0));
}
.rcg-overlay__title{ font-weight:800; letter-spacing:.2px; color:var(--ink); font-size: clamp(16px, 2.4vw, 22px); }
.rcg-overlay__close{ border:0; background:transparent; color:var(--ink); opacity:.8; cursor:pointer; font-size:18px; }

.rcg-overlay__media{ position:relative; min-height: 40vh; display:grid; place-items:center; background:#000; }
.rcg-overlay__video{ width:100%; height:auto; max-height:70vh; display:block; }

.rcg-overlay__actions{
  display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-end;
  padding:12px 14px; border-top:1px solid rgba(255,255,255,.08);
  background:linear-gradient(0deg, rgba(255,255,255,.05), rgba(255,255,255,0));
}

.rcg-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: var(--ink);
  backdrop-filter: blur(8px);
  font-weight: 600;
  letter-spacing: 0.4px;
  border-radius: 14px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255,255,255,0.08);
}
.rcg-btn:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-2px) scale(1.02); box-shadow: 0 0 20px rgba(255,255,255,0.15); }
.rcg-btn:active { transform: translateY(0) scale(0.98); background: rgba(255, 255, 255, 0.12); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  .rcg-ring{ transition: none; transform: translateZ(-100px) rotateX(-6deg); }
}

/* Responsive */
@media (max-width: 520px){
  :root{ --ring-size: 340px; --card-w: 150px; --card-h: 200px; --z-depth: 300px; }
  .rcg-overlay__video{ max-height: 52vh; }
  .rcg-controls{ bottom:-58px; }
  .rcg-ctrl--icon{ width:40px; height:40px; font-size:22px; }
  .rcg-ctrl--play{ padding:8px 14px; font-size:14px; }
}
`;export{T as default};
