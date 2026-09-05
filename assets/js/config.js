/* ============================================================
   CONFIG — edit everything about you here (one place).
   ============================================================ */
const CONFIG = {
  name:    "XENOFER",                 // your handle — shown big in the hero
  realName:"Manik Das",               // your real name (recruiters look for it). "" to hide.
  handle:  "xenofer",                 // used in the shell prompt  guest@<handle>

  defaultView: "readable",            // "readable" (recruiter-friendly) or "terminal"
  showBoot:    true,                  // set false to skip the terminal boot intro on load

  role:    "Offensive Security Researcher",
  tagline: "I break things to understand them.",
  blurb:   "I am Offensive security researcher with 1.8 years of hands-on penetration testing experience across web, network, mobile (Android), and AI/LLM targets. Currently performing web application security testing on a red team at TCS. eJPT certified and an active CTF player, with a strong foundation in vulnerability assessment, Linux, and digital forensics.",
  location:"India // remote-friendly",        // EDIT ME
  status:  "Open to Work",       // EDIT ME
  email:   "manik07012003@gmail.com",

  // EDIT ME — links. Use "" to hide a row. github is already correct.
  links: {
    github:    "https://github.com/XENOFER",
    linkedin:  "https://www.linkedin.com/in/manik-das-38ba41243/",
    tryhackme: "https://tryhackme.com/p/XENOFER",
    hackthebox:"https://app.hackthebox.com/profile/1195849",
    twitter:   "https://twitter.com/Xenofer01",
    bugcrowd:  "https://bugcrowd.com/h/xenofer",
    resume:    "resume.html"                  // résumé viewer page (PDF auto-built from resume/resume.tex)
  },

  // skills — group title -> list. Add/rename groups freely.
  skills: {
    "Offensive / AppSec":   ["Web app security testing", "SQL injection", "JWT / auth attacks", "Bug bounty recon", "Vulnerability discovery", "Privilege escalation (Windows)"],
    "Languages":            ["C++", "Python", "JavaScript", "Bash", "HTML / CSS"],
    "Tools & Frameworks":   ["Nmap", "Sqlmap", "Metasploit", "Postman", "Jadx", "Apktools", "Nuclei", "Burp Suite", "Git & GitHub"],
    "Currently learning":   ["Race-condition exploitation", "AV / Windows internals", "Advanced web exploitation"]
  },

  // projects — your real repos, strongest first. Edit freely.
  // flags:  private:true (shows a lock instead of a 404 link) · fork:true + forkedFrom
  //         status: "live" | "prog" (in progress) | "planned" · stars: <number>
  projects: [
    {
      title: "websec-toolkit",
      year:  "2025", status:"prog", private:true, stars:2,
      desc:  "A web application security testing toolkit — an open-source Burp Suite alternative. A native desktop app with a Rust core and a Tauri v2 + React front end, built for a fast, modern workflow for intercepting, inspecting, and tampering with HTTP traffic.",
      tags:  ["Rust", "Tauri v2", "React", "Web Security"],
      repo:  "https://github.com/XENOFER/websec-toolkit", demo:""
    },
    {
      title: "xenstrike",
      year:  "2025", status:"live", stars:1,
      desc:  "A modular bug-bounty recon and vulnerability-discovery tool. Chains industry-standard tools into an automated 14-step pipeline — subdomain enumeration through vuln scanning — taking you from a domain to actionable findings in one command. Adds batch scanning, continuous monitoring, diff reports, WAF detection/bypass, an encrypted API keystore, plugins, and report generation.",
      tags:  ["Bash", "Recon", "Bug Bounty", "Nuclei"],
      repo:  "https://github.com/XENOFER/xenstrike", demo:""
    },
    {
      title: "CipherToken — JWT Security Academy",
      year:  "2025", status:"live",
      desc:  "An interactive academy for learning JSON Web Tokens end to end — structure, signing cryptography, the attacks that break them, and the defenses that stop them. Ships a real in-browser JWT engine on the Web Crypto API: HS256/384/512 sign & verify, claim validation, and sandboxed attack demos (alg:none forgery, weak-secret brute force, payload tampering, expired tokens). Plain HTML/CSS/JS, all crypto client-side.",
      tags:  ["JavaScript", "Web Crypto", "JWT", "AppSec"],
      repo:  "https://github.com/XENOFER/JWT_token_web",
      demo:  ""   // ← if it's live on GitHub Pages, paste the URL here for a live-demo button
    },
    {
      title: "SQL Injection Learning Lab",
      year:  "2025", status:"prog", private:true,
      desc:  "A hands-on lab for practicing SQL injection — from classic UNION-based extraction to blind and error-based payloads — against deliberately vulnerable endpoints, with notes on detection and remediation.",
      tags:  ["SQL Injection", "AppSec", "Lab"],
      repo:  "https://github.com/XENOFER/SQL_injection_learning_Lab", demo:""
    },
    {
      title: "RoguePlanet — LPE study",
      year:  "2025", status:"live", fork:true, forkedFrom:"MSNightmare/RoguePlanet",
      desc:  "A Windows Defender local privilege-escalation PoC (a race condition that spawns a SYSTEM shell). Forked to study AV internals, race-condition exploitation, and Windows EoP techniques — analysis and notes, not my own discovery.",
      tags:  ["C++", "Windows", "Privilege Escalation"],
      repo:  "https://github.com/XENOFER/RoguePlanet", demo:""
    },
    {
      title: "Shift / Caesar Cipher",
      year:  "2022", status:"live",
      desc:  "Where it started — a command-line tool to encrypt and decrypt text with a Caesar (shift) cipher and colorized output. Try the cleaned-up browser version right here → run `cipher`.",
      tags:  ["Python", "Cryptography", "CLI"],
      repo:  "https://github.com/XENOFER/Shift_Or_Caesar_Cipher",
      demo:  "cipher"
    }
  ],

  // blog — short posts can live in `body`. For long ones, set `link` instead.
  blog: [
     {
        title:"Understand JSON Web Tokens — inside and out.",date:"Sep 2026",
        summary:"JSON Web Token, commonly called JWT, is a compact and secure way to transmit information between two parties. It is often used in web applications to authenticate users after they log in. Instead of sending login details with every request, the server gives the user a token that can be used to prove their identity.",
        body:"When a user logs in, the server creates and sends a JWT to the client. The client then includes this token in future requests, usually in the authorization header. The server checks the token’s signature and, if it is valid, allows the user to access protected resources.",
        link:"https://xenofer.github.io/JWT_token_web/"
     },
     // Android part will add here later
     { title:"SSL Pinning Bypass Report — Flutter developed Mobile App (Android)", date:"2026",
      summary:"SSL pinning helps Flutter Android apps verify that they are communicating with the legitimate server. This article explains how SSL pinning bypass works in authorized testing environments and how developers can use those insights to improve app security.",
      body:"SSL pinning adds an extra layer of protection by allowing an app to trust only a specific certificate or public key. While this helps prevent man-in-the-middle attacks, it can also make debugging and security testing more difficult. In Flutter-based Android applications, testers may need to bypass pinning in a controlled environment to inspect network behavior and identify security weaknesses. Understanding these techniques can help developers build stronger implementations and ensure that sensitive app communication remains protected in production.",
      link:"blog/ssl-pinning-bypass-report-osl-mobile-app-android.html" },
     // later add here new things
    { title:"Breaking JWTs: alg:none and weak-secret attacks", date:"2026",
      summary:"How the classic JWT attacks actually work, demonstrated with the in-browser engine from CipherToken.",
      body:"Placeholder seed — you already built the demos for this in JWT_token_web, so the writeup is half-done. Walk through alg:none forgery and dictionary attacks on weak HMAC secrets. Or set a `link` to a published version.",
      link:"blog/breaking-jwts.html" },
    { title:"Building a Burp Suite alternative in Rust", date:"2026",
      summary:"Why I'm building websec-toolkit on a Rust core with Tauri v2 + React, and what an intercepting proxy actually has to do.",
      body:"Placeholder seed tied to your flagship project. Notes on the architecture, the HTTP interception model, and the Rust/Tauri trade-offs would make a great post that doubles as proof of depth.",
      link:"" }
  ],

  // research — deeper material. Use `link` for PDFs/external write-ups.
  research: [
    { title:"Race conditions in Windows privilege escalation", date:"ongoing",
      summary:"Notes from studying the RoguePlanet PoC — how the TOCTOU window is won, and why success rates vary by machine.",
      body:"Placeholder seed from your LPE study. A clear write-up of the race-condition mechanics (and what would make the exploit deterministic) shows real low-level depth.",
      link:"research/race-conditions-in-windows-lpe.html" },
    { title:"Recon methodology: from domain to findings", date:"in progress",
      summary:"The 14-stage pipeline behind xenstrike — what each stage does and why the ordering matters.",
      body:"Placeholder seed tied to xenstrike. Documenting your recon methodology is exactly the kind of thinking bug-bounty and AppSec teams want to see.",
      link:"" }
  ],

  // certifications / courses. status: done | prog
  certs: [
    { name:"CNPen", org:"Secops", status:"prog", note:"targeting — in progress" },
    { name:"eJPT", org:"INE Security", status:"done", note:"targeting — Completed",link:"https://certs.ine.com/5f7e812e-9035-4f44-80f0-6de56e378adc" },
    { name:"Intro to Cyber Security", org:"TryHackMe", status:"done", note:"foundational path" }
  ]
};
