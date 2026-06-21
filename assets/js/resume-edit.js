/* ===========================================================================
   resume-edit.js — edit your résumé's LaTeX source in the browser.
   Loads the current resume.tex, lets you edit it, and download it again.
   Compiling to PDF happens in CI (on push) or locally — not in the browser.
   =========================================================================== */
(function(){
  const ta       = document.getElementById('tex-input');
  const statusEl = document.getElementById('tex-status');
  const nameEl   = document.getElementById('tex-name');
  if (!ta) return;

  // bundled copy of resume.tex (works even over file://, where fetch is blocked)
  const baked = ((document.getElementById('tex-src')||{}).textContent || '').replace(/^\n/, '');
  function setStatus(m){ if (statusEl) statusEl.textContent = m; }
  function tryFetchLatest(onMiss){
    if (typeof fetch !== 'function'){ if (onMiss) onMiss(); return; }
    fetch('resume/resume.tex')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(t => { ta.value = t; setStatus('loaded current resume.tex'); })
      .catch(() => { if (onMiss) onMiss(); });
  }

  // 1) start with the bundled copy so there's always content
  ta.value = baked;
  setStatus('loaded bundled copy');

  // 2) wire the buttons (never gated on fetch)
  const dl = document.getElementById('tex-download');
  if (dl) dl.onclick = () => {
    const blob = new Blob([ta.value], { type:'application/x-tex;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resume.tex';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1200);
    setStatus('downloaded resume.tex — put it in resume/ and push to rebuild');
  };

  const cp = document.getElementById('tex-copy');
  if (cp) cp.onclick = async () => {
    try { await navigator.clipboard.writeText(ta.value); setStatus('copied to clipboard'); }
    catch(e){ setStatus('copy failed — select all and copy manually'); }
  };

  const rl = document.getElementById('tex-reload');
  if (rl) rl.onclick = () => tryFetchLatest(() => { ta.value = baked; setStatus('reloaded bundled copy (no server running)'); });

  const fi = document.getElementById('tex-file');
  if (fi) fi.addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    if (nameEl) nameEl.textContent = f.name;
    const r = new FileReader();
    r.onload = () => { ta.value = r.result; setStatus('loaded ' + f.name); };
    r.readAsText(f);
  });

  // 3) finally, try to pull the live file (newer, when served over http)
  tryFetchLatest();
})();
