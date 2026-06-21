/* ===========================================================================
   convert.js — the Markdown → HTML tool (loaded only on convert.html)
   Paste or drop a .md file, see a themed live preview, download an .html file.
   Everything runs in your browser; your notes never leave the page.
   Requires: marked.umd.js (loaded before this) and config.js (for your name).
   =========================================================================== */
(function(){
  const CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};   // config.js declares `const CONFIG` (a lexical global, not on window)
  const input    = document.getElementById('md-input');
  const preview  = document.getElementById('md-preview');
  const nameTag  = document.getElementById('md-name');
  const fileIn   = document.getElementById('md-file');
  const editor   = document.getElementById('md-editor');
  let outputType = 'site';         // 'standalone' | 'site'  (default: a page for your site)
  let dest       = 'blog';         // 'root' | 'blog' | 'research'  (which folder the page lives in)
  let sourceName = 'note';         // base filename, sans extension

  if (window.marked && marked.setOptions) marked.setOptions({ gfm:true, breaks:false });

  /* ---- helpers ---- */
  function splitFrontMatter(text){
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { meta:{}, body:text };
    const meta = {};
    m[1].split('\n').forEach(line=>{
      const i = line.indexOf(':');
      if (i>0) meta[line.slice(0,i).trim().toLowerCase()] = line.slice(i+1).trim().replace(/^["']|["']$/g,'');
    });
    return { meta, body: text.slice(m[0].length) };
  }
  function firstHeading(body){
    const m = body.match(/^#{1,6}\s+(.+)$/m);
    return m ? m[1].trim() : '';
  }
  function docTitle(meta, body){
    return (meta.title && meta.title.trim()) || firstHeading(body) || sourceName || 'note';
  }
  function slug(s){ return (s||'note').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'note'; }
  function escapeHtml(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  /* ---- live preview ---- */
  function render(){
    const raw = input.value;
    if (!raw.trim()){ preview.innerHTML = `<div class="md-empty">Your rendered note shows up here. Paste markdown on the left, or drop a .md file onto it.</div>`; updateHint(); return; }
    const { body } = splitFrontMatter(raw);
    preview.innerHTML = `<article class="md-content">${marked.parse(body)}</article>`;
    updateHint();
  }

  /* ---- export: self-contained document (theme baked in, opens anywhere) ---- */
  const THEME_CSS = `
:root{--bg:#07100c;--bg-1:#0a1712;--bg-2:#0e201a;--bg-3:#123026;--border:#1b3a2d;--border-2:#265141;--green:#5af78e;--green-dim:#3a8a5e;--green-br:#aeffc8;--amber:#ffce6a;--cyan:#5ad4e6;--text:#cdf5dc;--text-dim:#6f9a85;--muted:#45685a;--mono:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;--disp:'Space Mono','JetBrains Mono',monospace;}
*{box-sizing:border-box}html,body{margin:0}
body{background:radial-gradient(1100px 650px at 80% -10%,rgba(90,247,142,0.06),transparent 60%),var(--bg);color:var(--text);font-family:var(--mono);line-height:1.7;-webkit-font-smoothing:antialiased;}
::selection{background:rgba(90,247,142,0.28);color:#fff}
.doc{max-width:760px;margin:0 auto;padding:56px 22px 96px}
.md-content{font-size:16px}
.md-content>*:first-child{margin-top:0}
.md-content h1,.md-content h2,.md-content h3,.md-content h4{font-family:var(--disp);color:var(--green-br);line-height:1.2;margin:1.6em 0 .5em}
.md-content h1{font-size:1.9em;border-bottom:1px solid var(--border-2);padding-bottom:.3em;text-shadow:0 0 22px rgba(90,247,142,.25)}
.md-content h2{font-size:1.45em}.md-content h3{font-size:1.2em}.md-content h4{font-size:1.05em;color:var(--amber)}
.md-content p{margin:0 0 1em}
.md-content a{color:var(--cyan);text-decoration:underline;text-underline-offset:2px}
.md-content a:hover{color:var(--green-br)}
.md-content strong{color:var(--green-br);font-weight:700}
.md-content ul,.md-content ol{margin:0 0 1em;padding-left:1.5em}
.md-content li{margin:.25em 0}.md-content li::marker{color:var(--green-dim)}
.md-content blockquote{margin:0 0 1em;padding:.4em 1em;border-left:3px solid var(--green);background:var(--bg-2);color:var(--text-dim)}
.md-content blockquote p{margin:.3em 0}
.md-content code{font-family:var(--mono);font-size:.9em;color:var(--amber);background:var(--bg-2);border:1px solid var(--border);padding:.08em .4em;border-radius:3px}
.md-content pre{background:#06100b;border:1px solid var(--border-2);border-left:2px solid var(--green-dim);padding:14px 16px;overflow-x:auto;margin:0 0 1em;border-radius:2px}
.md-content pre code{background:none;border:0;padding:0;color:var(--text);font-size:.88em;line-height:1.6}
.md-content hr{border:0;border-top:1px solid var(--border-2);margin:1.6em 0}
.md-content img{max-width:100%;height:auto;border:1px solid var(--border)}
.md-content table{border-collapse:collapse;width:100%;margin:0 0 1em;font-size:.92em;display:block;overflow-x:auto}
.md-content th,.md-content td{border:1px solid var(--border-2);padding:7px 11px;text-align:left}
.md-content th{background:var(--bg-2);color:var(--amber)}
.md-foot{margin-top:48px;padding-top:18px;border-top:1px solid var(--border);color:var(--muted);font-size:13px}`;

  const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">`;

  function buildStandalone(title, contentHtml){
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="color-scheme" content="dark" />
${FONTS}
<style>${THEME_CSS}</style>
</head>
<body>
  <main class="doc">
    <article class="md-content">
${contentHtml}    </article>
    <div class="md-foot">Generated from Markdown · ${escapeHtml(CFG.realName||CFG.name||'')}</div>
  </main>
</body>
</html>`;
  }

  /* ---- export: site page — SELF-CONTAINED so it renders anywhere ---- */
  const POST_EXTRA = `
.post-bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:10px clamp(14px,4vw,24px);background:linear-gradient(var(--bg),rgba(7,16,12,.92));backdrop-filter:blur(6px);border-bottom:1px solid var(--border)}
.post-bar .brand{font-family:var(--disp);color:var(--green-br);font-weight:700;letter-spacing:1.5px;text-decoration:none;font-size:15px}
.post-bar nav{display:flex;gap:2px;overflow-x:auto}
.post-bar nav a{color:var(--text-dim);padding:6px 12px;text-decoration:none;font-size:13.5px;border-bottom:2px solid transparent;white-space:nowrap}
.post-bar nav a:hover{color:var(--green-br)}
.post-bar nav a.active{color:var(--green-br);border-bottom-color:var(--green)}
.post-bar .spacer{flex:1}
.post-bar .back{color:var(--text-dim);text-decoration:none;font-size:12.5px;border:1px solid var(--border-2);padding:6px 10px;border-radius:2px}
.post-bar .back:hover{color:var(--green-br);border-color:var(--green-dim)}
.post-wrap{max-width:780px;margin:0 auto;padding:42px clamp(16px,5vw,24px) 90px}
.post-foot{margin-top:48px;padding-top:18px;border-top:1px solid var(--border);color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.post-foot a{color:var(--green-br);text-decoration:none}
.post-foot a:hover{color:var(--accent-br)}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:5;background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.22) 3px,rgba(0,0,0,0) 4px),radial-gradient(125% 125% at 50% 50%,transparent 60%,rgba(0,0,0,.5) 100%)}
@media(max-width:600px){.post-bar .brand{display:none}}`;

  function buildSitePage(title, contentHtml, dest){
    const brand = CFG.name || 'XENOFER';
    const pre = (dest === 'root') ? '' : '../';   // posts in blog/ or research/ sit one level deep
    const section = (dest === 'research') ? 'research' : (dest === 'blog' ? 'blog' : '');
    const where = (dest === 'root') ? 'the project root (next to index.html)' : `the "${dest}/" folder`;
    const items = [['index','home'],['about','about'],['projects','projects'],['blog','blog'],['research','research'],['contact','contact']];
    const nav = items.map(([f,l])=>`<a href="${pre}${f}.html"${(l===section)?' class="active"':''}>${l}</a>`).join('');
    const back = section ? `${pre}${section}.html` : `${pre}index.html`;
    const backLabel = section ? `↩ back to ${section}` : `↩ back to site`;
    const who = CFG.realName || CFG.name || '';
    return `<!DOCTYPE html>
<!-- Self-contained: this renders correctly anywhere (the theme is baked in).
     Put it in ${where} so the nav links above resolve to your other pages. -->
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)} — ${escapeHtml(brand)}</title>
<meta name="description" content="${escapeHtml(title)}" />
<meta name="color-scheme" content="dark" />
${FONTS}
<style>${THEME_CSS}${POST_EXTRA}</style>
</head>
<body>
  <header class="post-bar">
    <a class="brand" href="${pre}index.html">${escapeHtml(brand)}</a>
    <nav>${nav}</nav>
    <span class="spacer"></span>
    <a class="back" href="${back}">${backLabel}</a>
  </header>
  <main class="post-wrap">
    <article class="md-content">
${contentHtml}    </article>
    <div class="post-foot"><span>${escapeHtml(who)} · 🔒 generated from markdown</span><a href="${pre}convert.html">✎ md → html</a></div>
  </main>
</body>
</html>`;
  }

  function download(){
    const raw = input.value;
    if (!raw.trim()){ flash('nothing to convert — add some markdown first'); return; }
    const { meta, body } = splitFrontMatter(raw);
    const contentHtml = marked.parse(body);
    const title = docTitle(meta, body);
    const doc = outputType === 'standalone' ? buildStandalone(title, contentHtml) : buildSitePage(title, contentHtml, dest);
    const blob = new Blob([doc], { type:'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = slug(title) + '.html';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  }

  /* ---- "where does this go + config line" helper ---- */
  function updateHint(){
    const pathEl = document.getElementById('md-path');
    const cfgBox = document.getElementById('md-config');
    const cfgCode = cfgBox ? cfgBox.querySelector('code') : null;
    const { meta, body } = splitFrontMatter(input.value);
    const title = docTitle(meta, body);
    const s = slug(title);
    if (outputType === 'standalone'){
      if (pathEl) pathEl.textContent = `→ downloads as ${s}.html · self-contained, opens anywhere`;
      if (cfgBox) cfgBox.style.display = 'none';
      return;
    }
    const folder = dest === 'root' ? '' : dest + '/';
    if (pathEl) pathEl.textContent = `→ downloads as ${s}.html · put it in ${folder || 'the project root'} so it becomes ${folder}${s}.html`;
    if (cfgBox && cfgCode){
      cfgBox.style.display = '';
      const arr = dest === 'research' ? 'research' : 'blog';
      cfgCode.textContent =
`// paste into assets/js/config.js, in the "${arr}" list:
{ title:"${String(meta.title||title).replace(/"/g,'\\"')}", date:"${meta.date||'2026'}",
  summary:"one-line teaser shown on the card",
  link:"${folder}${s}.html" },`;
    }
  }

  /* ---- file input + drag/drop ---- */
  function loadFile(file){
    if (!file) return;
    sourceName = file.name.replace(/\.(md|markdown|txt|text)$/i,'') || 'note';
    if (nameTag) nameTag.textContent = file.name;
    const r = new FileReader();
    r.onload = () => { input.value = r.result; render(); };
    r.readAsText(file);
  }
  if (fileIn) fileIn.addEventListener('change', e => loadFile(e.target.files[0]));
  if (editor){
    ['dragenter','dragover'].forEach(ev => editor.addEventListener(ev, e => { e.preventDefault(); editor.classList.add('drag'); }));
    ['dragleave','drop'].forEach(ev => editor.addEventListener(ev, e => { e.preventDefault(); editor.classList.remove('drag'); }));
    editor.addEventListener('drop', e => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f); });
  }

  /* ---- toolbar buttons ---- */
  const byId = id => document.getElementById(id);
  const dl = byId('md-download'); if (dl) dl.onclick = download;
  const clr = byId('md-clear'); if (clr) clr.onclick = () => { input.value=''; sourceName='note'; if(nameTag) nameTag.textContent='note.md'; render(); input.focus(); };
  const smp = byId('md-sample'); if (smp) smp.onclick = () => { input.value = SAMPLE; sourceName='sample-note'; if(nameTag) nameTag.textContent='sample-note.md'; render(); };
  $$('#md-out button').forEach(b => b.onclick = () => { outputType = b.dataset.out; $$('#md-out button').forEach(x=>x.setAttribute('aria-pressed', x===b)); const ds=byId('md-dest'); if(ds) ds.style.opacity = (outputType==='site')?'1':'.4'; updateHint(); });
  $$('#md-dest button').forEach(b => b.onclick = () => { dest = b.dataset.dest; $$('#md-dest button').forEach(x=>x.setAttribute('aria-pressed', x===b)); updateHint(); });
  const cfgCopy = byId('md-config-copy');
  if (cfgCopy) cfgCopy.onclick = async () => { const code = byId('md-config').querySelector('code').textContent; try{ await navigator.clipboard.writeText(code); cfgCopy.textContent='copied ✓'; setTimeout(()=>cfgCopy.textContent='copy',1200);}catch(e){} };

  function $$(s){ return Array.from(document.querySelectorAll(s)); }
  function flash(msg){ const d=byId('md-download'); if(!d) return; const t=d.textContent; d.textContent=msg; setTimeout(()=>d.textContent=t,1600); }

  /* ---- sample note ---- */
  const SAMPLE = `---
title: Recon Notes — example.com
date: 2026
---

# Recon Notes — example.com

A quick **example** of how your markdown notes render. Paste your own over this.

## Findings

- Open ports: \`80\`, \`443\`, \`8080\`
- Tech stack: nginx, Node.js
- Interesting endpoint: [/api/v1/users](https://example.com/api/v1/users)

> Note: the \`/admin\` panel returns 403 but leaks a version header.

## Payload

\`\`\`bash
ffuf -w wordlist.txt -u https://example.com/FUZZ -mc 200,403
\`\`\`

## Severity

| Issue | Severity | Status |
|-------|----------|--------|
| Verbose headers | Low | open |
| Missing CSP | Medium | open |

---

*End of note.*`;

  /* ---- go ---- */
  input.addEventListener('input', render);
  render();
})();
