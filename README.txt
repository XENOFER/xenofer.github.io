XENOFER — portfolio
===================

PREVIEW LOCALLY
---------------
Double-click  serve.command  (macOS) and your browser opens at
http://localhost:8000 with everything working.

Or run this in Terminal, inside this folder:
    python3 -m http.server 8000
then open http://localhost:8000

Why a server? When you open a page by double-clicking it (file://),
Safari refuses to follow links from a post in blog/ or research/ back
up to pages like about.html. Over http://localhost it all works — and
so does GitHub Pages. (Chrome/Firefox are more lenient with file://,
but the server is the reliable way to preview.)

EDIT YOUR CONTENT
-----------------
Everything about you lives in one file:
    assets/js/config.js
Change your name, role, links, projects, skills, certs, and the
blog/research lists there.

ADD A BLOG / RESEARCH POST
--------------------------
1. Open  convert.html  (the "✎ md → html" link is in the footer bar).
2. Paste your Markdown (or upload a .md file).
3. Output = "site page", pick the folder (blog/ or research/), Download.
   The file is self-contained, so it looks right anywhere.
4. Move the downloaded file into that folder, e.g. blog/your-post.html
5. Copy the config.js line the tool shows you into the blog or research
   list in assets/js/config.js. A card will link to your post.

PUBLISH (GitHub Pages)
----------------------
Put the CONTENTS of this folder in your XENOFER.github.io repository
(so index.html is at the repo root), then enable Pages in the repo
Settings. Your site will be live at https://xenofer.github.io

Still to do before sharing:
- Fill in your email + resume link in assets/js/config.js
- Replace the two example posts with your real writeups

RÉSUMÉ (auto-compiled from LaTeX)
---------------------------------
Your résumé page is  resume.html  (the "résumé" button on the site opens it).
It embeds assets/resume/manik-das-resume.pdf with download / open-in-new-tab,
and a small maintainer link to download the LaTeX source (resume/resume.tex).

The PDF is built automatically from your LaTeX by GitHub Actions:
    source:   resume/resume.tex  + your icons (067-phone.pdf, 070-envelop.pdf,
              072-location.pdf), all already in resume/
    workflow: .github/workflows/build-resume.yml
    output:   assets/resume/manik-das-resume.pdf  (committed by the action)

To update your résumé: edit resume/resume.tex (or download it from the résumé
page, edit, and put it back), then push. Every push that touches resume/**
recompiles it with a full TeX Live and commits the new PDF — the live site
updates within a minute.

ONE-TIME in the repo:
    Settings -> Actions -> General -> Workflow permissions ->
    enable "Read and write permissions", or the action can't commit the PDF.

Notes:
- The icons are wired with \IfFileExists, so the build still works even if an
  icon is missing; they simply appear when present (they are, now).
- The unused biblatex/bibliography setup was removed (no citations were shown),
  so no citations.bib or biber is needed.
- Editing in Overleaf? Overleaf won't push by itself. Either connect the
  project to this GitHub repo (Overleaf "GitHub Sync", paid) and sync, or paste
  the updated .tex into resume/resume.tex. The push triggers the rebuild.
