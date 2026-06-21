/* ===========================================================================
   site.js — shared engine for every page (loaded after config.js)
   Renders the chrome (top bar, nav, status bar) and the page content from
   CONFIG, plus the theme cycling, CRT toggle, and (on terminal.html) the
   interactive terminal. You normally edit CONFIG in config.js, not this file.
   =========================================================================== */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduceMotion = (typeof matchMedia === 'function') && matchMedia('(prefers-reduced-motion: reduce)').matches;
let BASE = '';   // '' at site root; '../' for post pages inside blog/ or research/

/* ----------------------------- the cipher --------------------------------- */
function caesar(text, key, decrypt){
  const k = ((((decrypt ? -key : key) % 26) + 26) % 26);
  let out = '';
  for (const ch of text){
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90)       out += String.fromCharCode((c - 65 + k) % 26 + 65);
    else if (c >= 97 && c <= 122) out += String.fromCharCode((c - 97 + k) % 26 + 97);
    else                          out += ch;
  }
  return out;
}

/* ---------------------- decode / "decrypt" text effect -------------------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}=+*#%01";
function decodeText(node, finalText, speed=1){
  if (reduceMotion){ node.textContent = finalText; return; }
  const chars = finalText.split('');
  let frame = 0;
  const settle = chars.map((_,i)=> 6 + Math.floor(Math.random()*16) + i*1.2);
  node.classList.add('decoding');
  const tick = () => {
    let done = true, out = '';
    for (let i=0;i<chars.length;i++){
      if (chars[i] === ' '){ out += ' '; continue; }
      if (frame >= settle[i]) out += chars[i];
      else { out += GLYPHS[Math.floor(Math.random()*GLYPHS.length)]; done = false; }
    }
    node.textContent = out;
    frame += speed;
    if (!done) requestAnimationFrame(tick);
    else node.classList.remove('decoding');
  };
  tick();
}

/* ---------------------------- cipher widget ------------------------------- */
let cipherSeq = 0;
function cipherWidget(){
  const id = 'cw'+(++cipherSeq);
  return `
  <div class="cipher" id="${id}">
    <div class="ttl">cipher // live demo</div>
    <div class="sub">The Caesar tool, running right here in your browser. No data leaves the page.</div>
    <label for="${id}-t">plaintext</label>
    <textarea id="${id}-t" placeholder="type something secret...">attack at dawn</textarea>
    <div class="controls">
      <div><label for="${id}-k">shift key</label>
        <input id="${id}-k" type="number" value="3" min="-1000" max="1000" style="width:110px" /></div>
      <div class="modes" role="group" aria-label="mode">
        <button data-m="enc" aria-pressed="true">encrypt</button>
        <button data-m="dec" aria-pressed="false">decrypt</button>
      </div>
      <button class="run">run ▸</button>
    </div>
    <div class="result"><div class="lab">output</div><div class="val" id="${id}-o"></div>
      <button class="copy">copy</button></div>
  </div>`;
}
function wireCiphers(scope){
  $$('.cipher', scope).forEach(w => {
    if (w.dataset.wired) return; w.dataset.wired = '1';
    const t=$('textarea',w), k=$('input[type=number]',w), o=$('.val',w);
    let mode='enc';
    const run = () => { o.textContent = caesar(t.value, parseInt(k.value||'0',10), mode==='dec'); };
    $$('.modes button',w).forEach(b => b.onclick = () => { mode=b.dataset.m; $$('.modes button',w).forEach(x=>x.setAttribute('aria-pressed', x===b)); run(); });
    $('.run',w).onclick = run; t.addEventListener('input',run); k.addEventListener('input',run);
    $('.copy',w).onclick = async () => { try{ await navigator.clipboard.writeText(o.textContent); const c=$('.copy',w); c.textContent='copied ✓'; setTimeout(()=>c.textContent='copy',1200);}catch(e){} };
    run();
  });
}

/* --------------------------- shared builders ------------------------------ */
function linkList(){
  const L = CONFIG.links, out = [];
  //                 [ label,        url,          icon file in assets/icons/ ]
  if (L.github)    out.push(['github',     L.github,     'github']);
  if (L.linkedin)  out.push(['linkedin',   L.linkedin,   'linkedin']);
  if (L.tryhackme) out.push(['tryhackme',  L.tryhackme,  'tryhackme']);
  if (L.hackthebox)out.push(['hackthebox', L.hackthebox, 'hackthebox']);
  if (L.twitter)   out.push(['x',          L.twitter,    'x']);
  // bug-bounty platforms: add the URL in config.js, then a line here + an SVG in assets/icons/
  if (L.hackerone) out.push(['hackerone',  L.hackerone,  'hackerone']);
  if (L.bugcrowd)  out.push(['bugcrowd',   L.bugcrowd,   'bugcrowd']);
  return out;
}
// home page link add socialAnchors
function socialAnchors(){
  const L = CONFIG.links, a = [];
  if (L.github)    a.push(`<a href="${esc(L.github)}" target="_blank" rel="noopener">GitHub</a>`);
  if (L.linkedin)  a.push(`<a href="${esc(L.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
  if (L.tryhackme) a.push(`<a href="${esc(L.tryhackme)}" target="_blank" rel="noopener">TryHackMe</a>`);
  if (L.hackthebox)a.push(`<a href="${esc(L.hackthebox)}" target="_blank" rel="noopener">HackTheBox</a>`);
  if (L.twitter)   a.push(`<a href="${esc(L.twitter)}" target="_blank" rel="noopener">X</a>`);
  if (L.bugcrowd)  a.push(`<a href="${esc(L.bugcrowd)}" target="_blank" rel="noopener">Bugcrowd</a>`);
  return a;
}
function projBadges(p){
  let b='';
  if (p.status==='live') b+=`<span class="badge live">LIVE</span> `;
  else if (p.status==='prog') b+=`<span class="badge prog">IN PROGRESS</span> `;
  else if (p.status==='planned'||p.status==='soon') b+=`<span class="badge soon">PLANNED</span> `;
  if (p.private) b+=`<span class="badge priv">PRIVATE</span> `;
  if (p.fork) b+=`<span class="badge fork">FORK</span> `;
  return b;
}
function projMeta(p){
  const bits=[];
  if (p.year) bits.push(esc(p.year));
  if (p.stars) bits.push(`★ ${p.stars}`);
  if (p.fork && p.forkedFrom) bits.push(`forked from ${esc(p.forkedFrom)}`);
  return bits.join('&nbsp; · &nbsp;');
}
function projCard(p, cipherInPage){
  const links=[];
  if (p.private) links.push(`<span class="priv-note">🔒 private repo</span>`);
  else if (p.repo) links.push(`<a href="${esc(p.repo)}" target="_blank" rel="noopener">› source ↗</a>`);
  if (p.demo === 'cipher') links.push(cipherInPage ? `<a href="#" data-scroll="cipher-live">› live demo ↓</a>` : `<a href="#" data-run="cipher">› live demo</a>`);
  else if (p.demo) links.push(`<a href="${esc(p.demo)}" target="_blank" rel="noopener">› live demo ↗</a>`);
  return `<div class="row">
    <div class="t">${esc(p.title)} ${projBadges(p)}</div>
    <div class="meta">${projMeta(p)}</div>
    <div class="d">${esc(p.desc)}</div>
    <div class="tags">${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${links.length?`<div class="links">${links.join('')}</div>`:''}
  </div>`;
}
function postCards(items){
  if (!items.length) return `<p class="dim">empty. add entries in config.js.</p>`;
  return items.map(p=>{
    const hasLink = p.link && p.link.length;
    const tail = hasLink
      ? `<div class="links"><a href="${esc(p.link)}" target="_blank" rel="noopener">› read full post ↗</a></div>`
      : (p.body ? `<div class="d" style="margin-top:8px">${esc(p.body)}</div>` : '');
    return `<div class="row"><div class="meta">${esc(p.date)}</div><div class="t">${esc(p.title)}</div><div class="d">${esc(p.summary)}</div>${tail}</div>`;
  }).join('');
}
function skillsGrid(){
  return Object.entries(CONFIG.skills).map(([g,items])=>
    `<div class="skill-card"><h3>${esc(g)}</h3><ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
}
function certsRows(){
  return CONFIG.certs.map(c=>{
    const b = c.status==='done' ? `<span class="badge live">DONE</span>` : `<span class="badge prog">IN PROGRESS</span>`;
    return `<div class="row"><div class="t">${esc(c.name)} ${b}</div><div class="meta">${esc(c.org)} — ${esc(c.note)}</div></div>`;
  }).join('');
}
/* inline brand SVGs for the contact page (theme-colored via currentColor) */
const ICONS = {"github": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/></svg>", "linkedin": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z\"/></svg>", "x": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/></svg>", "tryhackme": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M10.705 0C7.54 0 4.902 2.285 4.349 5.291a4.525 4.525 0 0 0-4.107 4.5 4.525 4.525 0 0 0 4.52 4.52h6.761a.625.625 0 1 0 0-1.25H4.761a3.273 3.273 0 0 1-3.27-3.27A3.273 3.273 0 0 1 6.59 7.08a.625.625 0 0 0 .7-1.035 4.488 4.488 0 0 0-1.68-.69 5.223 5.223 0 0 1 5.096-4.104 5.221 5.221 0 0 1 5.174 4.57 4.489 4.489 0 0 0-.488.305.625.625 0 1 0 .731 1.013 3.245 3.245 0 0 1 1.912-.616 3.278 3.278 0 0 1 3.203 2.61.625.625 0 0 0 1.225-.251 4.533 4.533 0 0 0-4.428-3.61 4.54 4.54 0 0 0-.958.105C16.556 2.328 13.9 0 10.705 0zm5.192 10.64a.925.925 0 0 0-.462.108.913.913 0 0 0-.313.29 1.27 1.27 0 0 0-.175.427 2.39 2.39 0 0 0-.054.514c0 .181.018.353.054.517.036.164.095.307.175.43a.899.899 0 0 0 .313.297c.127.073.281.11.462.11.18 0 .334-.037.46-.11a.897.897 0 0 0 .309-.296c.08-.124.137-.267.173-.431.036-.164.054-.336.054-.517 0-.18-.018-.352-.054-.514a1.271 1.271 0 0 0-.173-.426.901.901 0 0 0-.309-.291.917.917 0 0 0-.46-.108zm6.486 0a.925.925 0 0 0-.462.108.913.913 0 0 0-.313.29 1.27 1.27 0 0 0-.175.427 2.39 2.39 0 0 0-.053.514c0 .181.017.353.053.517.036.164.095.307.175.43a.899.899 0 0 0 .313.297c.127.073.281.11.462.11.18 0 .334-.037.46-.11a.897.897 0 0 0 .31-.296c.078-.124.136-.267.172-.431.036-.164.054-.336.054-.517 0-.18-.018-.352-.054-.514a1.271 1.271 0 0 0-.173-.426.901.901 0 0 0-.308-.291.916.916 0 0 0-.461-.108zm-8.537.068l-.84.618.313.43.476-.368v1.877h.603v-2.557zm6.486 0l-.841.618.314.43.477-.368v1.877h.603v-2.557zm-4.435.445c.08 0 .143.028.193.084.05.057.087.127.114.21.026.083.044.173.054.269a2.541 2.541 0 0 1 0 .533c-.01.097-.028.187-.054.27a.584.584 0 0 1-.114.21.243.243 0 0 1-.193.085.248.248 0 0 1-.195-.086.584.584 0 0 1-.118-.209 1.245 1.245 0 0 1-.056-.27 2.645 2.645 0 0 1 0-.533c.01-.096.029-.186.056-.27a.583.583 0 0 1 .118-.209.25.25 0 0 1 .195-.084zm6.486 0c.08 0 .144.028.193.084.05.057.087.127.114.21.027.083.044.173.054.269a2.541 2.541 0 0 1 0 .533c-.01.097-.027.187-.054.27a.584.584 0 0 1-.114.21.243.243 0 0 1-.193.085.249.249 0 0 1-.195-.086.581.581 0 0 1-.117-.209 1.245 1.245 0 0 1-.056-.27 2.642 2.642 0 0 1 0-.533c.01-.096.028-.186.056-.27a.58.58 0 0 1 .117-.209.25.25 0 0 1 .195-.084zm-2.191 3.51a.93.93 0 0 0-.463.109.908.908 0 0 0-.312.291c-.08.122-.139.263-.175.426a2.383 2.383 0 0 0-.054.514c0 .18.018.353.054.516.036.164.094.308.175.432a.91.91 0 0 0 .312.296.92.92 0 0 0 .463.11c.18 0 .333-.037.46-.11a.892.892 0 0 0 .308-.296 1.32 1.32 0 0 0 .174-.432c.036-.163.054-.335.054-.516 0-.18-.018-.352-.054-.514a1.274 1.274 0 0 0-.174-.426.89.89 0 0 0-.309-.291.918.918 0 0 0-.46-.108zm-6.402.07l-.841.617.314.43.476-.369v1.878h.604v-2.557zm2.125 0l-.841.617.314.43.477-.369v1.878h.603v-2.557zm2.116 0l-.84.617.313.43.477-.369v1.878h.603v-2.557zm2.16.443c.08 0 .144.028.194.085a.605.605 0 0 1 .114.21c.026.083.044.172.053.269a2.639 2.639 0 0 1 0 .532 1.28 1.28 0 0 1-.053.27.585.585 0 0 1-.114.21.244.244 0 0 1-.193.085.25.25 0 0 1-.196-.085.589.589 0 0 1-.117-.21 1.245 1.245 0 0 1-.056-.27 2.597 2.597 0 0 1 0-.532c.01-.097.028-.186.056-.27a.589.589 0 0 1 .117-.209.249.249 0 0 1 .196-.085zm-6.729 3.073a.676.676 0 0 0-.335.078.661.661 0 0 0-.227.211.91.91 0 0 0-.127.31c-.027.118-.04.242-.04.373s.013.256.04.375a.93.93 0 0 0 .127.313.65.65 0 0 0 .227.215c.092.053.204.08.335.08a.655.655 0 0 0 .334-.08.65.65 0 0 0 .225-.215c.057-.09.1-.194.125-.313a1.75 1.75 0 0 0 .04-.375c0-.13-.014-.255-.04-.373a.931.931 0 0 0-.125-.31.658.658 0 0 0-.225-.21.667.667 0 0 0-.334-.08zm3.086 0a.675.675 0 0 0-.336.078.661.661 0 0 0-.226.211.907.907 0 0 0-.127.31 1.69 1.69 0 0 0-.04.373c0 .131.013.256.04.375a.928.928 0 0 0 .127.313c.058.09.134.162.226.215.093.053.205.08.336.08a.655.655 0 0 0 .334-.08.65.65 0 0 0 .224-.215c.058-.09.1-.194.126-.313a1.752 1.752 0 0 0 0-.748.94.94 0 0 0-.126-.31.657.657 0 0 0-.224-.21.667.667 0 0 0-.334-.08zm5.108 0a.675.675 0 0 0-.336.078.661.661 0 0 0-.226.211.91.91 0 0 0-.127.31c-.027.118-.04.242-.04.373s.013.256.04.375a.931.931 0 0 0 .127.313c.058.09.134.162.226.215.093.053.205.08.336.08.13 0 .243-.027.334-.08a.65.65 0 0 0 .224-.215c.058-.09.1-.194.126-.313a1.75 1.75 0 0 0 .04-.375c0-.13-.014-.255-.04-.373a.943.943 0 0 0-.126-.31.657.657 0 0 0-.224-.21.668.668 0 0 0-.334-.08zm-6.658.05l-.61.448.227.311.346-.266v1.362h.438v-1.856zm3.068 0l-.61.448.227.311.346-.266v1.362h.438v-1.856zm5.108 0l-.611.448.228.311.346-.266v1.362h.438v-1.856zm-9.712.322c.058 0 .105.02.14.062a.421.421 0 0 1 .083.151.96.96 0 0 1 .04.196 1.932 1.932 0 0 1 0 .386.954.954 0 0 1-.04.197.421.421 0 0 1-.083.152.176.176 0 0 1-.14.061.18.18 0 0 1-.141-.06.427.427 0 0 1-.085-.153.887.887 0 0 1-.041-.197 1.96 1.96 0 0 1 0-.386.893.893 0 0 1 .04-.196.42.42 0 0 1 .086-.151.181.181 0 0 1 .141-.062zm3.086 0c.058 0 .104.02.14.062a.421.421 0 0 1 .082.151.94.94 0 0 1 .04.196 1.906 1.906 0 0 1 0 .386.93.93 0 0 1-.04.197.421.421 0 0 1-.082.152.176.176 0 0 1-.14.061.18.18 0 0 1-.141-.06.42.42 0 0 1-.086-.153.846.846 0 0 1-.04-.197 1.965 1.965 0 0 1-.011-.195c0-.057.004-.121.01-.191a.849.849 0 0 1 .041-.196.42.42 0 0 1 .086-.151.182.182 0 0 1 .141-.062zm5.108 0c.058 0 .104.02.14.062a.421.421 0 0 1 .082.151.92.92 0 0 1 .04.196 1.963 1.963 0 0 1 0 .386.943.943 0 0 1-.04.197.421.421 0 0 1-.082.152.177.177 0 0 1-.14.061.18.18 0 0 1-.142-.06.437.437 0 0 1-.085-.153.95.95 0 0 1-.04-.197 1.965 1.965 0 0 1-.011-.195c0-.057.004-.121.01-.191a.959.959 0 0 1 .04-.196.47.47 0 0 1 .086-.151.181.181 0 0 1 .142-.062zm-1.684 1.814a.675.675 0 0 0-.336.079.66.66 0 0 0-.227.21.91.91 0 0 0-.127.31 1.731 1.731 0 0 0 0 .748.939.939 0 0 0 .127.314c.059.09.134.162.227.215.093.053.205.08.336.08a.66.66 0 0 0 .334-.08.648.648 0 0 0 .224-.215c.058-.09.1-.195.126-.314a1.737 1.737 0 0 0-.001-.747.928.928 0 0 0-.125-.31.65.65 0 0 0-.224-.211.668.668 0 0 0-.334-.079zm3.063 0a.676.676 0 0 0-.336.079.664.664 0 0 0-.227.21.906.906 0 0 0-.127.31 1.74 1.74 0 0 0 0 .748.936.936 0 0 0 .127.314.66.66 0 0 0 .227.215c.092.053.204.08.336.08a.654.654 0 0 0 .334-.08.648.648 0 0 0 .223-.215c.058-.09.1-.195.126-.314a1.74 1.74 0 0 0 0-.747.928.928 0 0 0-.126-.31.65.65 0 0 0-.223-.211.666.666 0 0 0-.334-.079zm-1.545.05l-.611.448.228.312.346-.267v1.363h.438v-1.856zm-1.518.323c.057 0 .104.02.14.061a.42.42 0 0 1 .082.152.91.91 0 0 1 .04.195 1.966 1.966 0 0 1 0 .387.951.951 0 0 1-.04.197.421.421 0 0 1-.082.152.177.177 0 0 1-.14.06.18.18 0 0 1-.142-.06.428.428 0 0 1-.085-.152.914.914 0 0 1-.04-.197 1.96 1.96 0 0 1-.011-.195c0-.058.003-.122.01-.192a.923.923 0 0 1 .041-.195c.02-.06.048-.11.085-.152a.181.181 0 0 1 .142-.061zm3.063 0c.057 0 .104.02.14.061a.42.42 0 0 1 .082.152.94.94 0 0 1 .04.195 1.91 1.91 0 0 1 0 .387.93.93 0 0 1-.04.197.422.422 0 0 1-.083.152.175.175 0 0 1-.14.06.18.18 0 0 1-.141-.06.423.423 0 0 1-.085-.152.907.907 0 0 1-.04-.197 1.95 1.95 0 0 1 0-.387.915.915 0 0 1 .04-.195c.02-.06.048-.11.085-.152a.182.182 0 0 1 .142-.061zm-9.713.185a.465.465 0 0 0-.232.055.456.456 0 0 0-.157.146.627.627 0 0 0-.089.215 1.168 1.168 0 0 0-.027.259c0 .09.009.177.027.26a.648.648 0 0 0 .089.216c.04.063.093.112.157.149a.459.459 0 0 0 .232.056c.09 0 .168-.02.231-.056a.45.45 0 0 0 .156-.149.67.67 0 0 0 .087-.217 1.218 1.218 0 0 0 0-.518.647.647 0 0 0-.087-.215.448.448 0 0 0-.156-.146.458.458 0 0 0-.23-.055zm1.052.035l-.423.31.158.217.24-.185v.944h.303v-1.286zm-1.052.224c.04 0 .073.014.097.042a.284.284 0 0 1 .057.105.69.69 0 0 1 .028.136c.004.049.007.092.007.133 0 .04-.003.086-.007.135a.684.684 0 0 1-.028.136.285.285 0 0 1-.057.105.123.123 0 0 1-.097.043.125.125 0 0 1-.098-.043.298.298 0 0 1-.059-.105.612.612 0 0 1-.028-.136 1.39 1.39 0 0 1 0-.268.62.62 0 0 1 .028-.136.297.297 0 0 1 .06-.105.125.125 0 0 1 .097-.042zm3.775 1.394a.463.463 0 0 0-.232.054.452.452 0 0 0-.157.146.621.621 0 0 0-.088.214 1.19 1.19 0 0 0 0 .519.641.641 0 0 0 .088.217.46.46 0 0 0 .157.15.458.458 0 0 0 .232.054.454.454 0 0 0 .232-.055.45.45 0 0 0 .155-.149.664.664 0 0 0 .087-.217 1.189 1.189 0 0 0 0-.519.642.642 0 0 0-.087-.214.446.446 0 0 0-.155-.146.459.459 0 0 0-.232-.054zm1.052.034l-.423.31.158.216.24-.185v.945h.303V22.68zm-1.052.223c.04 0 .073.014.098.043a.3.3 0 0 1 .057.105.643.643 0 0 1 .027.135 1.31 1.31 0 0 1 0 .268.654.654 0 0 1-.027.137.307.307 0 0 1-.057.105.124.124 0 0 1-.098.042.125.125 0 0 1-.098-.042.293.293 0 0 1-.059-.105.618.618 0 0 1-.028-.137 1.364 1.364 0 0 1 0-.268.612.612 0 0 1 .028-.135.287.287 0 0 1 .06-.105.123.123 0 0 1 .097-.043z\"/></svg>", "hackthebox": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m22.5106 6.4566.0008-.0123a.888.888 0 0 0-.2717-.6384c-.0084-.0084-.018-.0155-.0267-.0235-.0186-.0166-.0371-.0333-.0572-.0484-.0193-.0147-.04-.0276-.0607-.0406-.0096-.006-.0182-.0131-.0281-.0188L12.4576.1266a.891.891 0 0 0-.9223.0043L1.933 5.6744c-.0107.0062-.0203.014-.0307.0205-.0073.0047-.015.008-.0223.0128-.007.0047-.013.0106-.02.0155a.8769.8769 0 0 0-.147.1333l-.0026.003a.8872.8872 0 0 0-.2218.5847l.0009.014c-.0002.0088-.0015.0176-.0015.0264v11.0708c0 .3277.1802.6288.469.7836l9.5986 5.5417c.0076.0044.0158.0075.0236.0117a.8754.8754 0 0 0 .166.0687c.0134.004.0266.0083.0401.0117a.8793.8793 0 0 0 .072.0142c.0117.0019.0232.0045.0349.006a.835.835 0 0 0 .2157 0c.0117-.0015.0232-.0041.0348-.006a.9.9 0 0 0 .072-.0142c.0135-.0034.0267-.0077.04-.0117a.895.895 0 0 0 .0646-.0217.9134.9134 0 0 0 .1015-.047c.0078-.0042.016-.0072.0236-.0117l9.5986-5.5417a.8888.8888 0 0 0 .469-.7836V6.4779c0-.0071-.0012-.0142-.0014-.0213zM5.2543 6.0822l6.5367-3.774a.4182.4182 0 0 1 .4182 0l6.5366 3.774a.4182.4182 0 0 1 0 .7243l-6.5367 3.774a.4182.4182 0 0 1-.4182 0l-6.5366-3.774a.4182.4182 0 0 1 0-.7243zm5.6134 14.3449a.4172.4172 0 0 1-.626.3613L3.718 17.0218a.4173.4173 0 0 1-.2086-.3613V9.1279a.4172.4172 0 0 1 .6258-.3613l6.524 3.7666a.4172.4172 0 0 1 .2086.3614v7.5325zm9.623-3.7666a.4173.4173 0 0 1-.2086.3613l-6.5239 3.7666a.4172.4172 0 0 1-.6259-.3613v-7.5325c0-.149.0796-.2868.2087-.3614l6.5239-3.7666a.4172.4172 0 0 1 .6258.3613v7.5326z\"/></svg>", "email": "<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/></svg>", "hackerone": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7.207 0c-.4836 0-.8774.1018-1.1823.3002-.3044.2003-.4592.4627-.4592.7798v21.809c0 .2766.1581.5277.4752.7609.315.2335.7031.3501 1.1664.3501.4427 0 .8306-.1166 1.1678-.3501.3352-.231.5058-.4843.5058-.761V1.0815c0-.319-.1623-.5769-.4893-.7813C8.0644.1018 7.6702 0 7.207 0zm9.5234 8.662c-.4836 0-.8717.0981-1.1683.3007l-4.439 2.7822c-.1988.1861-.2841.4687-.2473.855.0342.3826.2108.747.5238 1.0907.3145.346.6662.5626 1.0684.6547.3963.0899.6973.041.8962-.143l1.7551-1.0951v9.7817c0 .2767.1522.5278.4607.761.3007.2335.6873.3501 1.1504.3501.463 0 .863-.1166 1.1983-.3501.3371-.2332.5058-.4843.5058-.761V9.7381c0-.3193-.165-.577-.4898-.7754-.3252-.2026-.7288-.3007-1.2143-.3007z\"/></svg>", "bugcrowd": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M24 12L18 1.387H6L0 12l6 10.613h12zm-5.782 1.658c-.003.825-.122 1.569-.354 2.231a5.05 5.05 0 0 1-.99 1.708 4.316 4.316 0 0 1-1.503 1.093 4.69 4.69 0 0 1-1.896.385 4.158 4.158 0 0 1-1.145-.152 3.754 3.754 0 0 1-.868-.36 3.792 3.792 0 0 1-.601-.435 3.023 3.023 0 0 1-.466-.514h-.04l.02.193c.011.166.018.331.02.497v.528H7.961V7.062c0-.151-.04-.263-.114-.337-.077-.074-.19-.109-.33-.109h-.811V4.425h2.452c.473-.003.824.108 1.048.331.222.223.333.576.33 1.049v3.003c-.003.258-.01.467-.02.626l-.02.247h.04a2.898 2.898 0 0 1 .463-.507c.156-.143.354-.284.6-.426.245-.142.538-.261.876-.36.38-.1.77-.15 1.162-.148.702.003 1.334.135 1.894.395a4.118 4.118 0 0 1 1.446 1.11c.4.48.707 1.052.92 1.715.212.658.317 1.392.32 2.198m-2.803 1.406c.138-.399.206-.852.209-1.366-.003-.659-.112-1.231-.328-1.718-.216-.484-.517-.859-.902-1.125a2.347 2.347 0 0 0-1.344-.404 2.57 2.57 0 0 0-.969.186 2.372 2.372 0 0 0-.83.589 2.839 2.839 0 0 0-.579 1.015c-.141.413-.212.906-.216 1.477 0 .397.053.792.159 1.174.101.366.265.712.483 1.02.211.3.486.548.805.722.32.176.698.267 1.127.27.343.002.683-.07.997-.213a2.43 2.43 0 0 0 .824-.623c.24-.273.428-.607.564-1.004Z\"/></svg>"};
function contactCards(){
  const ic = (k)=> (typeof ICONS!=='undefined' && ICONS[k]) ? `<span class="ci">${ICONS[k]}</span>` : '';
  const cards = [];
  // email — logo + label
  cards.push(`<a class="contact-card cic" href="mailto:${esc(CONFIG.email)}" title="Email">${ic('email')}<span>Email</span></a>`);
  // platforms — logo + name, links out (the full URL is not shown)
  linkList().forEach(([label,url,icon])=> cards.push(
    `<a class="contact-card cic" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(label)}">${ic(icon)}<span>${esc(label)}</span></a>`));
  return cards.join('');
}
function resumeBtn(){
  return CONFIG.links.resume
    ? `<a class="btn" href="${esc(CONFIG.links.resume)}" target="_blank" rel="noopener">↓ résumé</a>`
    : `<a class="btn ghost" href="mailto:${esc(CONFIG.email)}">✉ request résumé</a>`;
}
function pageHead(no, title){ return `<div class="sec-head"><span class="no">${no}</span><h2 data-decode="${esc(title)}">${esc(title)}</h2><span class="rule"></span></div>`; }

/* --------------------------- readable pages ------------------------------- */
function homeHTML(){
  const social = socialAnchors();
  const featured = CONFIG.projects.slice(0,3).map(p=>projCard(p,false)).join('');
  return `
    <div class="hero">
      <div class="eyebrow">${esc(CONFIG.role)}</div>
      <h1 data-decode="${esc(CONFIG.name)}">${esc(CONFIG.name)}</h1>
      ${CONFIG.realName?`<div class="realname">${esc(CONFIG.realName)}</div>`:''}
      <div class="tagline">${esc(CONFIG.tagline)}</div>
      <div class="sub">${esc(CONFIG.blurb)}</div>
      <div class="cta">
        ${resumeBtn()}
        ${CONFIG.links.github?`<a class="btn ghost" href="${esc(CONFIG.links.github)}" target="_blank" rel="noopener">⌥ GitHub</a>`:''}
        <a class="btn ghost" href="projects.html">view projects →</a>
        <a class="btn ghost" href="terminal.html">⌘ open terminal</a>
      </div>
      ${social.length?`<div class="sub" style="margin-top:18px">${social.join(' &nbsp;·&nbsp; ')}</div>`:''}
    </div>
    <div class="sec-head" style="margin-top:8px"><span class="no">→</span><h2 data-decode="featured work">featured work</h2><span class="rule"></span></div>
    <div class="grid-cards">${featured}</div>
    <p class="sub" style="margin-top:20px"><a href="projects.html">see all projects →</a></p>`;
}
function aboutHTML(){
  return `
    ${pageHead('01','about')}
    <div class="about-grid">
      <div><p>${esc(CONFIG.blurb)}</p><p>I care about the <em>why</em> behind a bug, not just the fix — and I like turning what I learn into tools other people can actually use.</p></div>
      <div class="card"><h3>// status</h3>
        <div class="line"><span>name</span><span>${esc(CONFIG.realName||CONFIG.name)}</span></div>
        <div class="line"><span>role</span><span>${esc(CONFIG.role)}</span></div>
        <div class="line"><span>location</span><span>${esc(CONFIG.location)}</span></div>
        <div class="line"><span>availability</span><span style="color:var(--green)">${esc(CONFIG.status)}</span></div>
      </div>
    </div>
    <div class="sec-head" style="margin-top:48px"><span class="no">02</span><h2 data-decode="skills">skills</h2><span class="rule"></span></div>
    <div class="skill-grid">${skillsGrid()}</div>
    <div class="sec-head" style="margin-top:48px"><span class="no">03</span><h2 data-decode="certifications">certifications</h2><span class="rule"></span></div>
    <div class="rows">${certsRows()}</div>`;
}
function projectsHTML(){
  return `
    ${pageHead('→','projects')}
    <div class="grid-cards">${CONFIG.projects.map(p=>projCard(p,true)).join('')}</div>
    <div id="cipher-live" style="margin-top:36px">
      <div class="sec-head" style="margin-bottom:12px"><h2 style="font-size:18px" data-decode="live demo">live demo</h2><span class="rule"></span></div>
      ${cipherWidget()}
    </div>`;
}
function blogHTML(){
  return `${pageHead('→','blog')}
    <p class="sub" style="margin:-6px 0 20px">Writeups, walkthroughs, and notes on what I'm building and breaking.</p>
    <div class="grid-cards">${postCards(CONFIG.blog)}</div>`;
}
function researchHTML(){
  return `${pageHead('→','research')}
    <p class="sub" style="margin:-6px 0 20px">Deeper dives — exploit internals, methodology, and reading.</p>
    <div class="grid-cards">${postCards(CONFIG.research)}</div>`;
}
function contactHTML(){
  return `${pageHead('→','contact')}
    <p class="sub" style="margin:0 0 14px">Hiring, collaborating, or looking for penetration testing services? I'm around.</p>
    <div class="contact-grid">${contactCards()}</div>
    <footer class="foot"><span>© <span id="yr"></span> ${esc(CONFIG.realName||CONFIG.name)} — built from scratch, no template.</span><span>${esc(CONFIG.handle)} · 🔒 encrypted</span></footer>`;
}
function renderReadablePage(page){
  switch(page){
    case 'about':    return aboutHTML();
    case 'projects': return projectsHTML();
    case 'blog':     return blogHTML();
    case 'research': return researchHTML();
    case 'contact':  return contactHTML();
    default:         return homeHTML();
  }
}

/* ----------------------------- chrome ------------------------------------- */
const DOTS = `<div class="dots" aria-hidden="true"><i class="d-r"></i><i class="d-y"></i><i class="d-g"></i></div>`;
const THEME_CRT = `
  <button class="iconbtn" id="theme-btn" title="cycle color theme"><span class="ic">◐</span><span class="lbl"> theme</span></button>
  <button class="iconbtn" id="crt-btn" title="toggle CRT scanlines" aria-pressed="true"><span class="ic">▦</span><span class="lbl"> crt</span></button>`;

function topbarReadable(){
  return `<header id="topbar">
    <div class="bar-row">
      ${DOTS}
      <a class="brand" href="${BASE}index.html" id="brand">XENOFER</a>
      <div class="spacer"></div>
      <a class="iconbtn" href="${BASE}terminal.html" title="open the interactive terminal"><span class="ic">⌘</span><span class="lbl"> terminal</span></a>
      ${THEME_CRT}
    </div>
    <nav id="rnav" aria-label="Pages"><div class="rnav-links">
      <a href="${BASE}index.html"    data-page="home">home</a>
      <a href="${BASE}about.html"    data-page="about">about</a>
      <a href="${BASE}projects.html" data-page="projects">projects</a>
      <a href="${BASE}blog.html"     data-page="blog">blog</a>
      <a href="${BASE}research.html" data-page="research">research</a>
      <a href="${BASE}contact.html"  data-page="contact">contact</a>
    </div></nav>
  </header>`;
}
function topbarTerminal(){
  return `<header id="topbar"><div class="bar-row">
    ${DOTS}
    <div class="path"><b>guest</b>@${esc(CONFIG.handle)}:<span style="color:var(--cyan)">~</span>$</div>
    <div class="spacer"></div>
    <a class="iconbtn" href="index.html" title="back to the site"><span class="ic">↩</span><span class="lbl"> exit to site</span></a>
    ${THEME_CRT}
  </div></header>`;
}
function statusbar(modeLabel, hintHTML, showConvert){
  return `<footer id="statusbar">
    <div class="cell mode" id="sb-mode">${esc(modeLabel)}</div>
    <div class="cell hide-sm"><span class="dotpulse"></span> guest@${esc(CONFIG.handle)}</div>
    <div class="cell grow hide-sm" id="sb-hint">${hintHTML}</div>
    ${showConvert ? `<a class="cell sb-link" href="${BASE}convert.html" title="Markdown → HTML converter"><span class="fi">✎</span> md → html</a>` : ''}
    <div class="cell enc hide-sm">🔒 ENCRYPTED</div>
    <div class="cell" id="sb-clock">--:--:--</div>
  </footer>`;
}
function setBrand(){ const b=$('#brand'); if(b) b.textContent = CONFIG.name; }
function setNavActive(page){ $$('#rnav a[data-page]').forEach(a=> a.classList.toggle('active', a.dataset.page===page)); }

/* --------------------------- theme + crt + clock -------------------------- */
const THEMES = [
  { name:'matrix', green:'#5af78e', br:'#aeffc8', dim:'#3a8a5e', glow:'rgba(90,247,142,0.30)' },
  { name:'amber',  green:'#ffc657', br:'#ffe6a8', dim:'#9a7b30', glow:'rgba(255,198,87,0.28)'  },
  { name:'ice',    green:'#5ad4e6', br:'#b7f4ff', dim:'#357f8c', glow:'rgba(90,212,230,0.28)'  },
  { name:'synth',  green:'#ff86c8', br:'#ffc4e6', dim:'#9a4f7a', glow:'rgba(255,134,200,0.30)' }
];
let themeIdx = 0;
function applyTheme(t){
  const r = document.documentElement.style;
  r.setProperty('--accent',t.green);   r.setProperty('--accent-br',t.br);
  r.setProperty('--green',t.green);     r.setProperty('--green-br',t.br);
  r.setProperty('--green-dim',t.dim);   r.setProperty('--glow',t.glow);
}
function cycleTheme(){ themeIdx=(themeIdx+1)%THEMES.length; applyTheme(THEMES[themeIdx]); return THEMES[themeIdx].name; }
function setupTheme(){ const b=$('#theme-btn'); if(b) b.onclick=cycleTheme; if(!reduceMotion) setInterval(cycleTheme, 8000); }
function setCrt(on){ document.body.classList.toggle('no-crt', !on); const b=$('#crt-btn'); if(b) b.setAttribute('aria-pressed', String(on)); }
function setupCrt(){ const b=$('#crt-btn'); if(b) b.onclick = ()=> setCrt(document.body.classList.contains('no-crt')); }
function startClock(){ const c=$('#sb-clock'); if(!c) return; const t=()=>c.textContent=new Date().toLocaleTimeString('en-GB'); t(); setInterval(t,1000); }
function wireScrollLinks(){
  document.addEventListener('click', e=>{
    const s=e.target.closest('[data-scroll]');
    if(s){ e.preventDefault(); const el=document.getElementById(s.getAttribute('data-scroll')); if(el) el.scrollIntoView({behavior: reduceMotion?'auto':'smooth', block:'start'}); }
  });
}

/* ============================== TERMINAL ================================== */
function ps1(){ return `<span class="u">${esc(CONFIG.handle)}</span><span class="at" style="color:var(--green-dim)">@</span><span class="h">portfolio</span><span class="p">:~$</span> `; }
const BANNER = String.raw`
#   # ##### #   #  ###  ##### ##### #### 
 # # #     ##  # #   # #     #     #   #
  #   #### # # # #   # #### #### #### 
 # # #     #  ## #   # #     #     # #  
#   # ##### #   #  ###  #     ##### #  ##`;

const COMMANDS = {
  help: { desc:"list every command", run(){
    const keys = Object.keys(COMMANDS).filter(k=>!COMMANDS[k].hidden);
    const rows = keys.map(k=>`<div class="cmdrow" data-run="${k}"><span class="k">${k}</span><span class="v">${esc(COMMANDS[k].desc)}</span></div>`).join('');
    return `<p class="dim">available commands — <span class="cyan">click any to run</span>:</p><div class="cmds">${rows}</div>
      <p class="dim" style="margin-top:10px">tip: <span class="ok">cipher</span> opens a live tool · <span class="ok">site</span> returns to the main pages.</p>`;
  }},
  whoami: { desc:"who is this", run(){
    return `<pre class="banner">${esc(BANNER)}</pre>
      <p><span class="h-accent">${esc(CONFIG.name)}</span>${CONFIG.realName?` <span class="dim">(${esc(CONFIG.realName)})</span>`:''} · <span class="amber">${esc(CONFIG.role)}</span></p>
      <p>${esc(CONFIG.tagline)}</p>
      <p class="dim">${esc(CONFIG.status)} — try <span class="ok">about</span>, <span class="ok">projects</span>, <span class="ok">contact</span>.</p>`;
  }},
  about: { desc:"the short version", run(){
    return `<p>${esc(CONFIG.blurb)}</p>
      <dl class="kv">
        <dt>name</dt><dd>${esc(CONFIG.realName||CONFIG.name)}</dd>
        <dt>focus</dt><dd>web app security · offensive tooling · recon</dd>
        <dt>location</dt><dd>${esc(CONFIG.location)}</dd>
        <dt>status</dt><dd class="ok">${esc(CONFIG.status)}</dd>
        <dt>email</dt><dd><a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a></dd>
      </dl>`;
  }},
  skills: { desc:"what's in the toolkit", run(){
    let out=''; for (const [g,items] of Object.entries(CONFIG.skills)){
      out += `<p class="amber" style="margin-top:8px">${esc(g)}</p><p>${items.map(i=>`<span class="cyan">›</span> ${esc(i)}`).join('&nbsp;&nbsp; ')}</p>`;
    } return out;
  }},
  projects: { desc:"things I've built", run(){ return `<div class="rows">${CONFIG.projects.map(p=>projCard(p,false)).join('')}</div>`; }},
  cipher: { desc:"open the live Caesar cipher", run(args){
    if (args.length>=3 && /^(e|d|enc|dec|encrypt|decrypt)$/i.test(args[0]) && /^-?\d+$/.test(args[1])){
      const dec=/^d/i.test(args[0]); const key=parseInt(args[1],10); const text=args.slice(2).join(' ');
      return `<p class="dim">${dec?'decrypt':'encrypt'} (key ${key}):</p><p class="ok" style="word-break:break-word">${esc(caesar(text,key,dec))}</p>`;
    }
    return cipherWidget();
  }},
  blog: { desc:"writeups & posts", run(){ return `<p class="dim">$ ls ~/blog — ${CONFIG.blog.length} item(s)</p><div class="rows">${postCards(CONFIG.blog)}</div>`; }},
  research: { desc:"research & deep dives", run(){ return `<p class="dim">$ ls ~/research — ${CONFIG.research.length} item(s)</p><div class="rows">${postCards(CONFIG.research)}</div>`; }},
  certs: { desc:"certifications & courses", run(){ return `<div class="rows">${certsRows()}</div>`; }},
  contact: { desc:"how to reach me", run(){
    let rows = `<dl class="kv"><dt>email</dt><dd><a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a></dd>`;
    linkList().forEach(([k,v])=> rows += `<dt>${esc(k)}</dt><dd><a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a></dd>`);
    rows += `</dl>`;
    const resume = CONFIG.links.resume
      ? `<p style="margin-top:10px"><a href="${esc(CONFIG.links.resume)}" target="_blank" rel="noopener">› download résumé (PDF)</a></p>`
      : `<p class="dim" style="margin-top:10px">› résumé: add a PDF link in config.js (links.resume)</p>`;
    return rows + resume;
  }},
  socials: { desc:"quick links", run(){
    const l=linkList(); if(!l.length) return `<p class="dim">no links set yet — add them in config.js.</p>`;
    return `<p>${l.map(([k,v])=>`<a href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join('&nbsp;&nbsp;·&nbsp;&nbsp; ')}</p>`;
  }},
  site: { desc:"return to the main site", run(){ location.href='index.html'; return `<p class="ok">→ opening the site…</p>`; }},
  convert: { desc:"open the markdown→html tool", run(){ location.href='convert.html'; return `<p class="ok">→ opening the markdown converter…</p>`; }},
  readable: { desc:"alias of site", hidden:true, run(){ return COMMANDS.site.run(); }},
  gui: { desc:"alias of site", hidden:true, run(){ return COMMANDS.site.run(); }},
  banner: { desc:"redraw the banner", run(){ return `<pre class="banner">${esc(BANNER)}</pre>`; }},
  clear: { desc:"clear the screen", run(){ $('#term-out').innerHTML=''; return null; }},
  cls: { desc:"alias of clear", hidden:true, run(){ return COMMANDS.clear.run(); }},
  theme: { desc:"cycle the color theme", run(){ return `<p class="ok">theme → ${cycleTheme()}</p>`; }},
  date: { desc:"current date/time", run(){ return `<p>${new Date().toString()}</p>`; }},
  echo: { desc:"echo text", hidden:true, run(a){ return `<p>${esc(a.join(' '))}</p>`; }},
  ls: { desc:"list sections", hidden:true, run(){ return `<p>about  skills  projects  blog  research  certs  contact  <span class="cyan">cipher</span></p>`; }},
  pwd: { desc:"print path", hidden:true, run(){ return `<p>/home/${esc(CONFIG.handle)}</p>`; }},
  sudo: { desc:"", hidden:true, run(){ return `<p class="err">[sudo] password for guest: </p><p class="dim">nice try. you don't have root here — but I appreciate the ambition.</p>`; }},
  "rm": { desc:"", hidden:true, run(a){ if (a.join(' ').includes('-rf')) return `<p class="err">rm: cannot remove '/': Permission denied</p><p class="dim">this portfolio is immutable. like a well-set password policy.</p>`; return `<p class="dim">rm: nothing to remove.</p>`; }},
  matrix: { desc:"", hidden:true, run(){ toggleMatrix(true); return `<p class="ok">entering the matrix… (press Esc or click to exit)</p>`; }},
  exit: { desc:"", hidden:true, run(){ location.href='index.html'; return `<p class="dim">leaving the terminal…</p>`; }}
};

let history = [], hIdx = -1, out, input;
function printBlock(cmdText, html){
  const block = document.createElement('div'); block.className='block';
  let inner='';
  if (cmdText !== null) inner += `<div class="prompt">${ps1()}<span class="cmd">${esc(cmdText)}</span></div>`;
  if (html) inner += `<div class="out">${html}</div>`;
  block.innerHTML = inner; out.appendChild(block);
  wireCiphers(block);
  $$('[data-run]', block).forEach(elm => elm.addEventListener('click', e=>{ e.preventDefault(); exec(elm.getAttribute('data-run')); }));
  window.scrollTo({ top: document.body.scrollHeight, behavior: reduceMotion?'auto':'smooth' });
}
function exec(raw){
  const line = raw.trim();
  if (!line){ printBlock('', null); return; }
  history.push(line); hIdx = history.length;
  const [name, ...args] = line.split(/\s+/);
  const cmd = COMMANDS[name.toLowerCase()];
  if (!cmd){ printBlock(line, `<p class="err">command not found: ${esc(name)}</p><p class="dim">type <span class="ok">help</span> to see what's available.</p>`); return; }
  printBlock(line, cmd.run(args));
}

let matrixOn=false, matrixRAF=null;
function toggleMatrix(on){
  const c=$('#matrix'); if(!c) return; matrixOn=on;
  if(!on){ c.style.display='none'; cancelAnimationFrame(matrixRAF); return; }
  c.style.display='block';
  const ctx=c.getContext('2d'); let W,H,drops;
  const resize=()=>{ W=c.width=innerWidth; H=c.height=innerHeight; drops=Array(Math.floor(W/14)).fill(1); };
  resize(); window.addEventListener('resize', resize);
  const chars='アイウエオカキクケコ01XENOFER#%<>'.split('');
  const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#5af78e';
  const draw=()=>{ ctx.fillStyle='rgba(7,16,12,0.08)'; ctx.fillRect(0,0,W,H); ctx.fillStyle=accent; ctx.font='14px monospace';
    for(let i=0;i<drops.length;i++){ ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*14, drops[i]*14); if(drops[i]*14>H && Math.random()>0.975) drops[i]=0; drops[i]++; }
    matrixRAF=requestAnimationFrame(draw); };
  draw();
}

function runBoot(done){
  const log=$('#boot-log'); if(!log){ done(); return; }
  const lines=[
    `<span class="lbl">[ BOOT ]</span> ${CONFIG.name.toLowerCase()}@portfolio — secure shell`,
    `<span class="ok">[  OK  ]</span> mounting /home/${CONFIG.handle}`,
    `<span class="ok">[  OK  ]</span> loading modules: <span class="ok">recon</span> <span class="ok">web</span> <span class="ok">crypto</span>`,
    `<span class="ok">[  OK  ]</span> decrypting profile … <span class="ok">done</span>`,
    `<span class="lbl">[ AUTH ]</span> guest session granted`, ``,
    `type <span class="ok">help</span> to list commands · <span class="ok">site</span> for the main pages.`
  ];
  const finish=()=>{ const b=$('#boot'); b.style.transition='opacity .4s'; b.style.opacity='0'; setTimeout(()=>{ b.style.display='none'; done(); },420); };
  if (reduceMotion){ finish(); return; }
  let i=0; const next=()=>{ if(i>=lines.length){ setTimeout(finish,260); return; } log.innerHTML += lines[i]+'\n'; i++; setTimeout(next,150); }; next();
  const skip=()=>{ const b=$('#boot'); b.style.display='none'; done(); };
  const sb=$('#boot-skip'); if(sb) sb.onclick=skip;
  addEventListener('keydown', function once(ev){ if(ev.key==='Enter'){ removeEventListener('keydown',once); skip(); } });
}

function initTerminal(){
  document.body.insertAdjacentHTML('afterbegin',
    `<div id="boot" role="status" aria-live="polite"><pre id="boot-log"></pre><button class="skip" id="boot-skip">skip ↵</button></div>` +
    topbarTerminal() +
    `<main id="terminal-view"><div id="term-out" aria-live="polite"></div>
       <div id="inputline"><span class="ps1"><span class="u">guest</span><span class="at">@</span><span class="h">${esc(CONFIG.handle)}</span><span class="p">:~$</span></span>
       <input id="cmd" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="terminal command input" placeholder="type a command — try: help" /></div>
       <div class="chips" id="chips"></div></main>` +
    statusbar('TERMINAL', `type <span style="color:var(--green)">help</span> · ↑↓ history · Tab to complete`));
  document.body.insertAdjacentHTML('beforeend', `<canvas id="matrix"></canvas>`);
  $('#matrix').style.display='none';

  out = $('#term-out'); input = $('#cmd');
  input.addEventListener('keydown', e=>{
    if (e.key==='Enter'){ exec(input.value); input.value=''; }
    else if (e.key==='ArrowUp'){ if(history.length){ hIdx=Math.max(0,hIdx-1); input.value=history[hIdx]||''; setTimeout(()=>input.setSelectionRange(input.value.length,input.value.length),0);} e.preventDefault(); }
    else if (e.key==='ArrowDown'){ if(history.length){ hIdx=Math.min(history.length,hIdx+1); input.value=history[hIdx]||''; } e.preventDefault(); }
    else if (e.key==='Tab'){ e.preventDefault(); const cur=input.value.trim().toLowerCase(); if(!cur) return;
      const m=Object.keys(COMMANDS).filter(k=>!COMMANDS[k].hidden && k.startsWith(cur));
      if(m.length===1) input.value=m[0]+' ';
      else if(m.length>1){ let pre=m[0]; for(const x of m){ while(!x.startsWith(pre)) pre=pre.slice(0,-1);} input.value=pre; printBlock(input.value, `<p class="dim">${m.join('&nbsp;&nbsp;')}</p>`); }
    }
  });
  $('#terminal-view').addEventListener('click', e=>{ if(e.target.closest('a,button,input,textarea,[data-run]')) return; if(window.getSelection().toString()) return; input.focus(); });
  const chips=[['help','help'],['whoami','whoami'],['projects','projects'],['cipher','cipher'],['blog','blog'],['contact','contact'],['site','site']];
  $('#chips').innerHTML = chips.map(([l,c])=>`<button class="chip" data-run="${c}"><b>$</b> ${l}</button>`).join('');
  $$('#chips .chip').forEach(c=> c.addEventListener('click', ()=>exec(c.getAttribute('data-run'))));

  runBoot(()=>{
    printBlock(null, COMMANDS.whoami.run());
    printBlock(null, `<p class="dim">─ try <span class="ok">help</span>, <span class="ok">projects</span>, or <span class="ok">cipher</span>. <span class="ok">site</span> or ↩ exit to leave.</p>`);
    input.focus();
  });
}

/* ============================== INIT ===================================== */
(function init(){
  const PAGE = document.body.dataset.page || 'home';
  BASE = document.body.dataset.base || '';   // '../' for posts inside blog/ or research/
  // CRT overlay on every page
  document.body.insertAdjacentHTML('beforeend', `<div id="crt"></div>`);

  if (PAGE === 'terminal'){
    initTerminal();
    setupTheme(); setupCrt(); startClock();
    return;
  }

  if (PAGE === 'convert'){
    // markdown→html tool page: inject the shared chrome; convert.js wires the tool UI (already in the page)
    const hint = `<a href="${BASE}index.html" style="color:var(--green)">↩ back to site</a> · paste markdown → download HTML`;
    document.body.insertAdjacentHTML('afterbegin', topbarReadable() + statusbar('CONVERT', hint));
    setBrand(); setNavActive('convert'); setupTheme(); setupCrt(); startClock();
    const ct = document.querySelector('.wrap [data-decode]'); if (ct && !reduceMotion) decodeText(ct, ct.dataset.decode, 2);
    return;
  }

  if (PAGE === 'resume'){
    // résumé viewer page: chrome only; the PDF embed + buttons are static in the page
    const hint = `<a href="${BASE}index.html" style="color:var(--green)">↩ back to site</a> · compiled from LaTeX`;
    document.body.insertAdjacentHTML('afterbegin', topbarReadable() + statusbar('RESUME', hint, true));
    setBrand(); setNavActive('resume'); setupTheme(); setupCrt(); startClock();
    const rt = document.querySelector('.wrap [data-decode]'); if (rt && !reduceMotion) decodeText(rt, rt.dataset.decode, 2);
    return;
  }

  if (PAGE === 'resume-edit'){
    // in-browser LaTeX editor for the résumé; resume-edit.js wires the textarea + buttons
    const hint = `<a href="${BASE}resume.html" style="color:var(--green)">↩ back to résumé</a> · edit the LaTeX source`;
    document.body.insertAdjacentHTML('afterbegin', topbarReadable() + statusbar('EDIT RÉSUMÉ', hint, true));
    setBrand(); setNavActive('resume-edit'); setupTheme(); setupCrt(); startClock();
    const et = document.querySelector('.wrap [data-decode]'); if (et && !reduceMotion) decodeText(et, et.dataset.decode, 2);
    return;
  }

  if (PAGE === 'post'){
    // a converted blog/research post living one level deep; content is already in the page
    const section = document.body.dataset.section || '';
    const hint = `<a href="${BASE}${section||'index'}.html" style="color:var(--green)">↩ back to ${section||'site'}</a> · ${esc((CONFIG.realName||CONFIG.name))}`;
    document.body.insertAdjacentHTML('afterbegin', topbarReadable() + statusbar((section||'post').toUpperCase(), hint));
    setBrand(); setNavActive(section); setupTheme(); setupCrt(); startClock();
    const h = document.querySelector('.md-content h1'); if (h && !reduceMotion) decodeText(h, h.textContent, 2);
    return;
  }

  // readable page
  const hint = `secure portfolio · use the nav above · <a href="${BASE}terminal.html" style="color:var(--green)">⌘ terminal</a>`;
  document.body.insertAdjacentHTML('afterbegin', topbarReadable() + `<main id="page" class="wrap page"></main>` + statusbar(PAGE.toUpperCase(), hint, true));
  const mount = $('#page');
  mount.innerHTML = renderReadablePage(PAGE);
  wireCiphers(mount);
  setBrand();
  setNavActive(PAGE);
  setupTheme(); setupCrt(); startClock(); wireScrollLinks();
  const yr=$('#yr'); if(yr) yr.textContent=new Date().getFullYear();
  const t=$('#page [data-decode]'); if(t && !reduceMotion) decodeText(t, t.dataset.decode, 2);
})();
