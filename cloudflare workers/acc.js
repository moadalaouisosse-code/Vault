const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vault</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after {box-sizing: border-box; margin: 0; padding: 0;}
    :root {--bg-base: #0A0E1A; --bg-surface: #111827; --bg-elevated: #1A2235; --border: #1E2A3A; --border-hover: #2E4060; --accent: #3B82F6; --accent-dim: rgba(59, 130, 246, 0.12); --accent-glow: rgba(59, 130, 246, 0.25); --text-primary: #F1F5F9; --text-muted: #64748B; --text-dim: #374151; --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;}
    html, body {height: 100%; background: var(--bg-base); color: var(--text-primary); font-family: var(--sans); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased;}
    .app {min-height: 100vh; display: flex; flex-direction: column; max-width: 860px; margin: 0 auto; padding: 0 24px 60px;}
    header {display: flex; align-items: center; justify-content: space-between; padding: 32px 0 40px; border-bottom: 1px solid var(--border); margin-bottom: 40px;}
    .logo {display: flex; align-items: center; gap: 10px;}
    .logo-icon {width: 32px; height: 32px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center;}
    .logo-icon svg {width: 16px; height: 16px; fill: #fff;}
    .logo-name {font-size: 17px; font-weight: 600; letter-spacing: -0.02em; color: var(--text-primary);}
    .logo-sub {font-size: 12px; font-weight: 400; color: var(--text-muted); font-family: var(--mono);}
    .header-status {font-size: 12px; font-family: var(--mono); color: var(--text-muted); display: flex; align-items: center; gap: 6px;}
    .status-dot {width: 6px; height: 6px; border-radius: 50%; background: #10B981;}
    .search-section {margin-bottom: 32px;}
    .search-label {font-size: 11px; font-family: var(--mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; display: block;}
    .search-row {display: flex; gap: 10px;}
    .search-input-wrap {flex: 1; position: relative;}
    .search-input-wrap svg {position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; stroke: var(--text-muted); pointer-events: none;}
    .filter-row {display: flex; gap: 10px; margin-bottom: 10px;}
    .filter-wrap {position: relative; flex: 1; min-width: 0;}
    .type-wrap {flex: 0 0 160px;}
    .sort-wrap {flex: 0 0 230px;}
    .filter-wrap svg {position: absolute; top: 50%; transform: translateY(-50%); stroke: var(--text-muted); pointer-events: none;}
    .filter-wrap .icon-left {left: 14px; width: 16px; height: 16px;}
    .filter-wrap .icon-right {right: 12px; width: 14px; height: 14px;}
    .filter-select {width: 100%; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--mono); font-size: 14px; padding: 12px 34px 12px 40px; border-radius: 10px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; text-overflow: ellipsis; transition: border-color 0.15s, box-shadow 0.15s;}
    .filter-select:focus {border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);}
    .filter-select option {background: var(--bg-surface); color: var(--text-primary);}
    .filter-select optgroup {background: var(--bg-surface); color: var(--text-muted); font-style: normal;}
    .refresh-btn {display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; background: transparent; border: 1px solid var(--border); color: var(--text-muted); border-radius: 10px; padding: 12px 16px; font-family: var(--sans); font-size: 14px; font-weight: 500; cursor: pointer; transition: border-color 0.15s, color 0.15s;}
    .refresh-btn svg {width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;}
    .refresh-btn:hover:not(:disabled) {border-color: var(--border-hover); color: var(--text-primary);}
    .refresh-btn:disabled {opacity: 0.6; cursor: not-allowed;}
    .refresh-btn.spinning svg {animation: spin 1s linear infinite;}
    @keyframes spin {to {transform: rotate(360deg);}}
    input[type="text"] {width: 100%; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--mono); font-size: 14px; padding: 12px 14px 12px 40px; border-radius: 10px; outline: none; transition: border-color 0.15s, box-shadow 0.15s;}
    input[type="text"]::placeholder {color: var(--text-dim);}
    input[type="text"]:focus {border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);}
    .search-btn {background: var(--accent); color: #fff; border: none; border-radius: 10px; padding: 12px 22px; font-family: var(--sans); font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 0.15s, box-shadow 0.15s;}
    .search-btn:hover {background: #2563EB; box-shadow: 0 0 16px var(--accent-glow);}
    .search-btn:active {background: #1D4ED8;}
    .results-section {margin-bottom: 36px;}
    .results-header {display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;}
    .results-label {font-size: 11px; font-family: var(--mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;}
    .results-count {font-size: 11px; font-family: var(--mono); color: var(--text-muted);}
    .file-list {list-style: none; display: flex; flex-direction: column; gap: 2px;}
    .file-item {display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: border-color 0.15s, background 0.15s; gap: 16px;}
    .file-item:hover {border-color: var(--border-hover); background: var(--bg-elevated);}
    .file-item.active {border-color: var(--accent); background: var(--accent-dim);}
    .file-info {display: flex; flex-direction: column; gap: 3px; min-width: 0;}
    .file-name {font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
    .file-meta {font-family: var(--mono); font-size: 11px; color: var(--text-muted);}
    .file-action {flex-shrink: 0; background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-family: var(--sans); font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;}
    .file-item:hover .file-action {border-color: var(--accent); color: var(--accent);}
    .file-item.active .file-action {background: var(--accent); border-color: var(--accent); color: #fff;}
    .state-message {padding: 40px 0; text-align: center; font-family: var(--mono); font-size: 13px; color: var(--text-muted);}
    .file-item.file-doc:hover {border-color: #CA8A04 !important; background: var(--bg-elevated) !important;}
    .file-item.file-doc:hover .file-action {border-color: #CA8A04 !important; color: #CA8A04 !important;}
    .file-item.file-doc.active {border-color: #CA8A04 !important; background: rgba(202, 138, 4, 0.12) !important;}
    .file-item.file-doc.active .file-action {background: #CA8A04 !important; border-color: #CA8A04 !important; color: #fff !important;}
    .file-item.file-unidentified:hover {border-color: #16A34A !important; background: var(--bg-elevated) !important;}
    .file-item.file-unidentified:hover .file-action {border-color: #16A34A !important; color: #16A34A !important;}
    .file-item.file-unidentified.active {border-color: #16A34A !important; background: rgba(22, 163, 74, 0.12) !important;}
    .file-item.file-unidentified.active .file-action {background: #16A34A !important; border-color: #16A34A !important; color: #fff !important;}
    @media (max-width: 560px) {.app {padding: 0 16px 48px;} header {padding: 24px 0 28px; margin-bottom: 28px;} .header-status {display: none;} .filter-row {flex-wrap: wrap;} .filter-wrap {flex: 1 1 100%;} .type-wrap, .sort-wrap {flex: 1 1 0;}}
    #vaultOverlay {display: none; position: fixed; inset: 0; z-index: 100; background: rgba(5, 8, 16, 0.85); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); align-items: center; justify-content: center; padding: 24px;}
    #vaultOverlay.open {display: flex;}
    #vaultModal {position: relative; width: 100%; max-width: 960px; max-height: 90vh; background: var(--bg-surface); border: 1px solid var(--border-hover); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);}
    #vaultModalHeader {display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); flex-shrink: 0;}
    #vaultModalTitle {font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 48px);}
    #vaultClose, #vaultDownload, #vaultShare {flex-shrink: 0; width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s, color 0.15s, background 0.15s; line-height: 1;}
    #vaultDownload svg, #vaultShare svg {width: 14px; height: 14px;}
    #vaultClose:hover, #vaultDownload:hover, #vaultShare:hover {border-color: var(--border-hover); color: var(--text-primary); background: var(--bg-elevated);}
    #sharePopup {display: none; position: absolute; top: 60px; right: 18px; z-index: 5; width: 340px; max-width: calc(100% - 36px); background: var(--bg-elevated); border: 1px solid var(--border-hover); border-radius: 10px; padding: 14px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);}
    #sharePopup.open {display: block;}
    #sharePopup .share-label {display: block; font-size: 11px; font-family: var(--mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;}
    #sharePopup .share-row {display: flex; gap: 8px;}
    #shareLink {flex: 1; min-width: 0; padding: 8px 10px; font-size: 12px;}
    #shareCopy {flex-shrink: 0; background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-family: var(--sans); font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.15s;}
    #shareCopy:hover {background: #2563EB;}
    #scrollTopBtn {position: fixed; right: 24px; bottom: 24px; z-index: 50; width: 42px; height: 42px; border-radius: 10px; border: 1px solid var(--border-hover); background: var(--bg-surface); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s, border-color 0.15s, color 0.15s, box-shadow 0.15s;}
    #scrollTopBtn svg {width: 18px; height: 18px;}
    #scrollTopBtn.show {opacity: 1; pointer-events: auto; transform: translateY(0);}
    #scrollTopBtn:hover {border-color: var(--accent); color: var(--accent); box-shadow: 0 0 16px var(--accent-glow);}
    @media (max-width: 560px) {#scrollTopBtn {right: 16px; bottom: 16px;}}
    #vaultContent {flex: 1; overflow: auto; min-height: 0; background: #000; display: flex; align-items: center; justify-content: center;}
    #vaultContent video {width: 100%; height: 100%; max-height: 80vh; object-fit: contain; display: block;}
    #vaultContent iframe {width: 100%; height: 80vh; border: none; display: block; background: #fff;}
    #vaultContent img {max-width: 100%; max-height: 80vh; object-fit: contain; display: block;}
    #vaultContent .vault-download {display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 60px 24px; color: var(--text-muted); font-family: var(--mono); font-size: 13px; background: var(--bg-surface); width: 100%;}
    #vaultContent .vault-download svg {width: 40px; height: 40px; stroke: var(--border-hover);}
    #vaultContent .vault-download a {color: var(--accent); font-family: var(--sans); font-size: 14px; font-weight: 500; text-decoration: none; border: 1px solid var(--accent); padding: 10px 24px; border-radius: 8px; transition: background 0.15s, color 0.15s;}
    #vaultContent .vault-download a:hover {background: var(--accent); color: #fff;}
    /* Group headers (type / extension / folder sorts) */
    .dl-group {display: flex; align-items: center; gap: 10px; padding: 14px 4px 4px; font: 500 10px var(--mono); letter-spacing: 0.09em; text-transform: uppercase; color: var(--text-muted); user-select: none;}
    .dl-group:first-child {padding-top: 4px;}
    .dl-group::after {content: ""; flex: 1; height: 1px; background: var(--border);}
    .dl-group .count {color: var(--text-dim); letter-spacing: 0;}
    .dl-group span.label {max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: none; letter-spacing: 0.02em;}
    /* Player HUD (keyboard feedback) + fullscreen on the container so the HUD stays visible */
    #vaultContent {position: relative;}
    .hud {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); padding: 10px 18px; border-radius: 999px; background: rgba(12, 15, 26, 0.82); border: 1px solid var(--border-hover); color: var(--text-primary); font: 500 13px var(--mono); pointer-events: none; opacity: 0; transition: opacity 0.15s, transform 0.15s; z-index: 5;}
    .hud.show {opacity: 1; transform: translate(-50%, -50%) scale(1);}
    #vaultContent:fullscreen video {height: 100%; max-height: 100%;}
    #vaultContent:-webkit-full-screen video {height: 100%; max-height: 100%;}
  </style>
</head>
<body>
  <div class="app">
    <header>
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>
        </div>
        <div>
          <div class="logo-name">Vault</div>
          <div class="logo-sub">B2 Media Stream</div>
        </div>
      </div>
      <div class="header-status">
        <span class="status-dot"></span>
        connected
      </div>
    </header>
    <section class="search-section">
      <span class="search-label">Browse bucket</span>
      <div class="filter-row">
        <div class="filter-wrap">
          <svg class="icon-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          <select class="filter-select" id="folderFilter"><option value="">All files</option></select>
          <svg class="icon-right" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="filter-wrap type-wrap">
          <svg class="icon-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <select class="filter-select" id="typeFilter">
            <option value="">All types</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Images</option>
            <option value="doc">Documents</option>
            <option value="other">Other</option>
          </select>
          <svg class="icon-right" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="filter-wrap sort-wrap">
          <svg class="icon-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10M11 9h7M11 13h4"/><path d="M3 17l3 3 3-3M6 18V4"/></svg>
          <select class="filter-select" id="sortFilter" title="Sort files">
            <optgroup label="Date">
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
            </optgroup>
            <optgroup label="File name">
              <option value="name-asc">File name A &rarr; Z</option>
              <option value="name-desc">File name Z &rarr; A</option>
            </optgroup>
            <optgroup label="Path name">
              <option value="path-asc">Path A &rarr; Z</option>
              <option value="path-desc">Path Z &rarr; A</option>
            </optgroup>
            <optgroup label="Size">
              <option value="size-desc">Largest first</option>
              <option value="size-asc">Smallest first</option>
            </optgroup>
            <optgroup label="Grouped">
              <option value="type">Group by type</option>
              <option value="ext">Group by extension</option>
              <option value="folder">Group by folder</option>
            </optgroup>
          </select>
          <svg class="icon-right" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <button class="refresh-btn" id="refreshBtn"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>Refresh</button>
      </div>
      <div class="search-row">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="searchInput" placeholder="Movies/ or series/episode-01.mp4" autocomplete="off" spellcheck="false" />
        </div>
      </div>
    </section>
    <section class="results-section">
      <div class="results-header">
        <span class="results-label">Files</span>
        <span class="results-count" id="resultsCount"></span>
      </div>
      <ul class="file-list" id="fileList">
        <li class="state-message">Loading files...</li>
      </ul>
    </section>
  </div>
  <button id="scrollTopBtn" aria-label="Scroll to top" title="Back to top">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
  </button>
  <div id="vaultOverlay">
    <div id="vaultModal">
      <div id="vaultModalHeader">
        <span id="vaultModalTitle"></span>
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button id="vaultShare" title="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
          <button id="vaultDownload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg></button>
          <button id="vaultClose">&#x2715;</button>
        </div>
      </div>
      <div id="sharePopup">
        <span class="share-label">Share link</span>
        <div class="share-row">
          <input type="text" id="shareLink" readonly />
          <button id="shareCopy">Copy</button>
        </div>
      </div>
      <div id="vaultContent"></div>
    </div>
  </div>
  <script>
    const searchInput = document.getElementById("searchInput");
    const fileList = document.getElementById("fileList");
    const resultsCount = document.getElementById("resultsCount");
    const overlay = document.getElementById("vaultOverlay");
    const modalTitle = document.getElementById("vaultModalTitle");
    const vaultContent = document.getElementById("vaultContent");
    const vaultClose = document.getElementById("vaultClose");
    const vaultDownload = document.getElementById("vaultDownload");
    const vaultShare = document.getElementById("vaultShare");
    const sharePopup = document.getElementById("sharePopup");
    const shareLink = document.getElementById("shareLink");
    const shareCopy = document.getElementById("shareCopy");
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    const folderFilter = document.getElementById("folderFilter");
    const typeFilter = document.getElementById("typeFilter");
    const sortFilter = document.getElementById("sortFilter");
    const refreshBtn = document.getElementById("refreshBtn");
    let activeItem = null;
    let filesLoaded = [];
    let src = "";
    let name = "";
    const allMediaExtensions = ["mp4","m4v","mkv","webm","mov","avi","wmv","flv","mpg","mpeg","m2ts","mts","mxf","prores","3gp","3g2","swf","vob","ogv","divx","xvid","m3u8","ts","mp3","m4a","wav","flac","aac","ogg","wma","amr","aiff","aif","au","raw","mid","midi","ra","ram","m4p","m4b","m4r","opus","oga","caf","pcm"];
    const allDocAndPicExtensions = ["jpg","jpeg","png","gif","webp","svg","bmp","tiff","tif","heic","heif","avif","ico","psd","ai","eps","pdf","doc","docx","xls","xlsx","ppt","pptx","txt","rtf","odt","ods","odp","csv","pages","numbers","key"];
    const unidentifiedTypes = ["application/octet-stream","binary/octet-stream","application/x-unknown-content-type","unknown/unknown",""];
    const documentVendors = ["vnd.openxmlformats-officedocument","vnd.oasis.opendocument"];
    async function loadFiles() {
      refreshBtn.disabled = true; refreshBtn.classList.add("spinning");
      try {
        const requestFiles = await fetch("/files");
        if (!requestFiles.ok) throw new Error("status " + requestFiles.status);
        filesLoaded = await requestFiles.json();
        populateFolders(foldersFromFiles(filesLoaded));
        applyFilter();
      } catch (err) {
        fileList.innerHTML = '<li class="state-message">Could not load files (' + esc(err.message) + ')</li>';
        resultsCount.textContent = "";
      }
      refreshBtn.disabled = false; refreshBtn.classList.remove("spinning");
    }
    document.addEventListener("DOMContentLoaded", loadFiles);
    refreshBtn.addEventListener("click", loadFiles);
    // ── Folders: derived from the listed files (same logic as the desktop app) ──
    function foldersFromFiles(files) {
      const set = new Set();
      for (const f of files) {
        const parts = f.fileName.split("/"); parts.pop();
        let p = "";
        for (const seg of parts) { p += seg + "/"; set.add(p); }
      }
      const key = f => f.split("/").filter(Boolean);
      const isUpper = s => s[0] !== s[0].toLowerCase();   // starts with a capital letter
      return [...set].sort((a, b) => {
        const x = key(a), y = key(b);
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
          const ua = isUpper(x[i]), ub = isUpper(y[i]);
          if (ua !== ub) return ua ? -1 : 1;               // uppercase-first folders go first
          const c = x[i].localeCompare(y[i], undefined, { numeric:true, sensitivity:"base" });
          if (c) return c;
        }
        return x.length - y.length;
      });
    }
    const folderLabel = f => {
      const segs = (f.endsWith("/") ? f.slice(0, -1) : f).split("/");
      return "\\u00A0\\u00A0".repeat(segs.length - 1) + segs[segs.length - 1] + "/";
    };
    function populateFolders(folders) {                    // keeps the current choice across reloads
      const prev = folderFilter.value;
      folderFilter.innerHTML = '<option value="">All files</option>' +
        folders.map(f => '<option value="' + esc(f) + '">' + esc(folderLabel(f)) + '</option>').join("");
      folderFilter.value = prev;
      if (folderFilter.value !== prev) folderFilter.value = "";
    }

    // ── File type classification (same lists as the desktop app) ──
    const VIDEO_EXT = ["mp4","m4v","mkv","webm","mov","avi","wmv","flv","mpg","mpeg","m2ts","mts","3gp","ogv","ts"];
    const AUDIO_EXT = ["mp3","m4a","wav","flac","aac","ogg","wma","opus","aiff","aif"];
    const IMAGE_EXT = ["jpg","jfif","jpeg","png","gif","webp","svg","bmp","tiff","tif","heic","avif","ico"];
    const DOC_EXT   = ["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","rtf","odt","csv"];
    const baseName = n => n.split("/").pop() || n;
    function fileType(name) {
      const b = baseName(name), i = b.lastIndexOf(".");
      const ext = i > 0 ? b.slice(i + 1).toLowerCase() : "";
      if (VIDEO_EXT.includes(ext)) return "video";
      if (AUDIO_EXT.includes(ext)) return "audio";
      if (IMAGE_EXT.includes(ext)) return "image";
      if (DOC_EXT.includes(ext))   return "doc";
      return "other";
    }

    // ── Date + size helpers ──
    // B2 returns uploadTimestamp (ms since epoch) on every file. If the file was uploaded with
    // the B2 CLI / rclone / sync, fileInfo.src_last_modified_millis holds the original modified date; used as a fallback.
    function fileDate(f) {
      const t = Number(f.uploadTimestamp || f.upload_timestamp || (f.fileInfo && f.fileInfo.src_last_modified_millis) || 0);
      return isNaN(t) ? 0 : t;
    }
    function fmtDate(ts) {
      return ts ? new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
    }
    function fmtSize(n) {
      n = Number(n) || 0;
      const units = ["B", "KB", "MB", "GB", "TB"];
      let i = 0;
      while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
      return (i === 0 ? n : n.toFixed(i === 1 ? 0 : i === 2 ? 1 : 2)) + " " + units[i];
    }

    // ── Sorting: dropdown choice is remembered; grouped sorts also get header rows ──
    const SORT_DEFAULT = "date-desc";
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });   // "file2" < "file10"
    const TYPE_ORDER = ["video", "audio", "image", "doc", "other"];
    const TYPE_LABEL = { video: "Videos", audio: "Audio", image: "Images", doc: "Documents", other: "Other" };
    const extOf = n => { const b = baseName(n), i = b.lastIndexOf("."); return i > 0 ? b.slice(i + 1).toLowerCase() : ""; };
    const dirPart = n => n.includes("/") ? n.slice(0, n.lastIndexOf("/") + 1) : "";
    const byName = (a, b) => collator.compare(baseName(a.fileName), baseName(b.fileName)) || collator.compare(a.fileName, b.fileName);
    const byPath = (a, b) => {                              // segment by segment, so folders stay together
      const x = a.fileName.split("/"), y = b.fileName.split("/");
      for (let i = 0; i < Math.min(x.length, y.length); i++) {
        const lastX = i === x.length - 1, lastY = i === y.length - 1;
        if (lastX !== lastY) return lastX ? -1 : 1;         // a file sorts before sibling folders
        const c = collator.compare(x[i], y[i]);
        if (c) return c;
      }
      return x.length - y.length;
    };
    const byDate = (a, b) => fileDate(a) - fileDate(b);
    const bySize = (a, b) => (a.contentLength || 0) - (b.contentLength || 0);
    const SORTS = {
      "date-desc": { cmp: (a, b) => byDate(b, a) || byName(a, b) },
      "date-asc":  { cmp: (a, b) => byDate(a, b) || byName(a, b) },
      "name-asc":  { cmp: (a, b) => byName(a, b) },
      "name-desc": { cmp: (a, b) => byName(b, a) },
      "path-asc":  { cmp: (a, b) => byPath(a, b) },
      "path-desc": { cmp: (a, b) => byPath(b, a) },
      "size-desc": { cmp: (a, b) => bySize(b, a) || byName(a, b) },
      "size-asc":  { cmp: (a, b) => bySize(a, b) || byName(a, b) },
      "type":   { cmp: (a, b) => TYPE_ORDER.indexOf(fileType(a.fileName)) - TYPE_ORDER.indexOf(fileType(b.fileName)) || byDate(b, a) || byName(a, b),
                  group: f => TYPE_LABEL[fileType(f.fileName)] },
      "ext":    { cmp: (a, b) => collator.compare(extOf(a.fileName), extOf(b.fileName)) || byName(a, b),
                  group: f => extOf(f.fileName) ? "." + extOf(f.fileName) : "No extension" },
      "folder": { cmp: (a, b) => collator.compare(dirPart(a.fileName), dirPart(b.fileName)) || byName(a, b),
                  group: f => dirPart(f.fileName) || "Bucket root" }
    };
    let sortKey = SORT_DEFAULT;
    try { const k = localStorage.getItem("vault.sort"); if (k && SORTS[k]) sortKey = k; } catch (_) {}
    sortFilter.value = sortKey;
    const groupOf = f => { const g = SORTS[sortKey].group; return g ? g(f) : null; };

    // ── Filtering + sorting: folder + type + search text, then order ──
    function applyFilter() {
      const folder = folderFilter.value;
      const type = typeFilter.value;
      const query = searchInput.value.trim().toLowerCase();
      try {
        const filtered = filesLoaded.filter(function(f) {
          return (!folder || f.fileName.startsWith(folder)) &&
                 (!type || fileType(f.fileName) === type) &&
                 (!query || f.fileName.toLowerCase().includes(query));
        });
        filtered.sort(SORTS[sortKey].cmp);               // filter() already returns a new array, so filesLoaded keeps its original order
        renderResults(filtered);
      } catch(err) {
        fileList.innerHTML = '<li class="state-message">Error: ' + esc(err.message) + "</li>";
      }
    }
    folderFilter.addEventListener("change", applyFilter);
    typeFilter.addEventListener("change", applyFilter);
    sortFilter.addEventListener("change", function() {
      sortKey = sortFilter.value;
      try { localStorage.setItem("vault.sort", sortKey); } catch (_) {}
      applyFilter();
    });
    let searchTimer = null;                                // wait 150 ms after the last keystroke, so big lists don't re-render on every key
    searchInput.addEventListener("input", function() { clearTimeout(searchTimer); searchTimer = setTimeout(applyFilter, 150); });
    function esc(text) { return String(text).replace(/[&<>"']/g, function(c) { return "&#" + c.charCodeAt(0) + ";"; }); }
    function renderResults(files) {
      if (!files.length) { fileList.innerHTML = '<li class="state-message">No files found</li>'; resultsCount.textContent = ""; return; }
      resultsCount.textContent = files.length + " file" + (files.length !== 1 ? "s" : "");
      fileList.innerHTML = "";
      const groupCount = new Map();
      files.forEach(function(f) { const g = groupOf(f); if (g !== null) groupCount.set(g, (groupCount.get(g) || 0) + 1); });
      files.forEach(function(file, i) {
        const grp = groupOf(file);
        if (grp !== null && (i === 0 || groupOf(files[i - 1]) !== grp)) {
          const h = document.createElement("li");
          h.className = "dl-group"; h.setAttribute("aria-hidden", "true");
          h.innerHTML = '<span class="label">' + esc(grp) + '</span><span class="count">' + groupCount.get(grp).toLocaleString() + '</span>';
          fileList.appendChild(h);
        }
        const date = fmtDate(fileDate(file));
        const meta = fmtSize(file.contentLength) + (date ? " \\u00B7 " + date : "");
        const info = '<div class="file-info"><span class="file-name">' + esc(file.fileName) + '</span><span class="file-meta">' + meta + '</span></div>';
        const btn = function(label) { return '<button class="file-action">' + label + '</button>'; };
        const li = document.createElement("li");
        li.className = "file-item";
        li.dataset.fileId = file.fileId;
        li.dataset.fileName = file.fileName;
        const b2Type = (file.contentType || "").toLowerCase().trim();
        const extension = file.fileName.split(".").pop().toLowerCase();
        if (b2Type.startsWith("video") || b2Type.startsWith("audio")) {
          li.classList.add("file-media");
          li.innerHTML = info + btn("Play");
        } else if (b2Type.startsWith("image") || documentVendors.some(function(d) { return b2Type.includes(d); }) || b2Type.includes("pdf")) {
          li.classList.add("file-doc");
          li.innerHTML = info + btn("Open");
        } else if (unidentifiedTypes.includes(b2Type)) {
          li.classList.add("file-unidentified");
          if (allMediaExtensions.includes(extension)) {
            li.innerHTML = info + btn("Play");
          } else if (allDocAndPicExtensions.includes(extension)) {
            li.innerHTML = info + btn("Open");
          } else {
            li.innerHTML = info + btn("Download");
          }
        } else {
          li.classList.add("file-unidentified");
          li.innerHTML = info + btn("Download");
        }
        li.addEventListener("click", function() { openFile(li, file); });
        fileList.appendChild(li);
      });
    }
    function openFile(li, file) {
      if (activeItem) activeItem.classList.remove("active");
      li.classList.add("active");
      activeItem = li;
      const b2Type = (file.contentType || "").toLowerCase().trim();
      const extension = file.fileName.split(".").pop().toLowerCase();
      src = "/file/" + file.fileId;
      name = file.fileName.split("/").pop() || file.fileName;
      const videoExtensions = ["mp4","m4v","mkv","webm","mov","avi","wmv","flv","mpg","mpeg","m2ts","mts","mxf","prores","3gp","3g2","swf","vob","ogv","divx","xvid","m3u8","ts"];
      const audioExtensions = ["mp3","m4a","wav","flac","aac","ogg","wma","amr","aiff","aif","au","raw","mid","midi","ra","ram","m4p","m4b","m4r","opus","oga","caf","pcm"];
      const imageExtensions = ["jpg","jpeg","png","gif","webp","svg","bmp","tiff","tif","heic","heif","avif","ico"];
      const docExtensions = ["pdf","docx","doc","xls","xlsx","ppt","pptx","txt","rtf","odt","ods","odp","csv","pages","numbers","key"];
      modalTitle.textContent = name;
      vaultContent.innerHTML = "";
      if (b2Type.startsWith("video") || (unidentifiedTypes.includes(b2Type) && videoExtensions.includes(extension))) {
        const video = document.createElement("video"); video.controls = true; video.autoplay = true; video.preload = "metadata"; video.src = src; vaultContent.appendChild(video);
      } else if (b2Type.startsWith("audio") || (unidentifiedTypes.includes(b2Type) && audioExtensions.includes(extension))) {
        const audio = document.createElement("audio"); audio.controls = true; audio.autoplay = true; audio.preload = "metadata"; audio.src = src; vaultContent.appendChild(audio);
      } else if (b2Type.startsWith("image") || (unidentifiedTypes.includes(b2Type) && imageExtensions.includes(extension))) {
        const img = document.createElement("img"); img.src = src; img.alt = name; vaultContent.appendChild(img);
      } else if (b2Type.includes("pdf") || documentVendors.some(function(d) { return b2Type.includes(d); }) || (unidentifiedTypes.includes(b2Type) && docExtensions.includes(extension))) {
        const iframe = document.createElement("iframe"); iframe.src = src; vaultContent.appendChild(iframe);
      } else {
        vaultContent.innerHTML = '<div class="vault-download"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>No preview available</span><a href="' + src + '" download="' + esc(name) + '">Download file</a></div>';
      }
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeOverlay() {
      if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
      const m = vaultContent.querySelector("video, audio");
      if (m) { m.pause(); m.removeAttribute("src"); m.load(); }   // actually drops the connection
      overlay.classList.remove("open");
      sharePopup.classList.remove("open");
      document.body.style.overflow = "";
      vaultContent.innerHTML = "";
      if (activeItem) activeItem.classList.remove("active");
      activeItem = null;
    }
    vaultDownload.addEventListener("click", function() {
      const link = document.createElement("a");
      link.href = src;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    vaultShare.addEventListener("click", async function() {
      if (sharePopup.classList.contains("open")) { sharePopup.classList.remove("open"); return; }
      shareLink.value = "Creating link...";
      sharePopup.classList.add("open");
      try {
        const res = await fetch("/createLink", { method: "POST", body: JSON.stringify({ ID: src.split("/").pop() }) });
        if (!res.ok) throw new Error("createLink failed");
        shareLink.value = (await res.json()).link;
        shareLink.select();
      } catch (e) {
        shareLink.value = "Could not create link";
      }
    });
    shareCopy.addEventListener("click", async function() {
      if (!shareLink.value.startsWith("http")) return;
      try { await navigator.clipboard.writeText(shareLink.value); } catch (e) { shareLink.select(); document.execCommand("copy"); }
      shareCopy.textContent = "Copied";
      setTimeout(function() { shareCopy.textContent = "Copy"; }, 1500);
    });
    vaultClose.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closeOverlay(); });
    document.addEventListener("keydown", function(e) {
      if (e.key !== "Escape") return;
      if (document.fullscreenElement) return;   // Escape only leaves fullscreen; the viewer stays open
      closeOverlay();
    });
    // ── Player shortcuts: F fullscreen · M mute · Space play/pause ──
    // Capture phase so the native <video> controls never also react (which would double-toggle).
    let hudTimer = null;
    function hud(text) {                                   // small on-screen confirmation
      let h = vaultContent.querySelector(".hud");
      if (!h) { h = document.createElement("div"); h.className = "hud"; vaultContent.appendChild(h); }
      h.textContent = text; h.classList.add("show");
      clearTimeout(hudTimer); hudTimer = setTimeout(function() { h.classList.remove("show"); }, 900);
    }
    function viewerMedia() {
      return overlay.classList.contains("open") ? vaultContent.querySelector("video, audio") : null;
    }
    function isShortcut(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return null;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return null;
      return e.key === " " ? "space" : (e.key.length === 1 && "fm".includes(e.key.toLowerCase())) ? e.key.toLowerCase() : null;
    }
    document.addEventListener("keydown", function(e) {
      const key = isShortcut(e), m = key && viewerMedia();
      if (!m) return;
      e.preventDefault(); e.stopPropagation();
      if (e.repeat) return;
      if (key === "space") {
        if (m.paused) { m.play().catch(function() {}); hud("Play"); } else { m.pause(); hud("Paused"); }
      } else if (key === "m") {
        m.muted = !m.muted; hud(m.muted ? "Muted" : "Unmuted");
      } else if (key === "f" && m.tagName === "VIDEO") {
        if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else if (vaultContent.requestFullscreen) vaultContent.requestFullscreen().catch(function() {});
        else if (vaultContent.webkitRequestFullscreen) vaultContent.webkitRequestFullscreen();
      }
    }, true);
    // A focused button (close / download / share) would otherwise "click" on Space keyup
    document.addEventListener("keyup", function(e) {
      if (isShortcut(e) === "space" && viewerMedia()) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    function updateScrollTopBtn() {
      const y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      scrollTopBtn.classList.toggle("show", y > 300);
    }
    window.addEventListener("scroll", updateScrollTopBtn, { passive: true });
    scrollTopBtn.addEventListener("click", function() { window.scrollTo({ top: 0, behavior: "smooth" }); });
    updateScrollTopBtn();
  </script>
</body>
</html>
`;


const LOGIN = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vault</title><style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#0A0E1A;color:#F1F5F9;font-family:system-ui,sans-serif}body{display:flex;align-items:center;justify-content:center;padding:24px}form{width:100%;max-width:340px;background:#111827;border:1px solid #1E2A3A;border-radius:14px;padding:28px;display:flex;flex-direction:column;gap:14px}h1{font-size:17px;font-weight:600}input[type=password],input[type=text]{background:#0A0E1A;border:1px solid #1E2A3A;color:#F1F5F9;font-size:14px;padding:12px 14px;border-radius:10px;outline:none}input[type=password]:focus,input[type=text]:focus{border-color:#3B82F6}label{display:flex;align-items:center;gap:8px;font-size:12px;color:#64748B;cursor:pointer;user-select:none}button{background:#3B82F6;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:500;cursor:pointer}button:hover{background:#2563EB}#msg{font-size:12px;color:#F87171;min-height:16px}</style></head><body><form id="f"><h1>Vault</h1><input type="password" id="p" placeholder="Password" autocomplete="current-password" autofocus /><label><input type="checkbox" id="s" />Show password</label><button type="submit">Unlock</button><div id="msg"></div></form><script>document.getElementById("s").addEventListener("change", function(e){ document.getElementById("p").type = e.target.checked ? "text" : "password"; }); document.getElementById("f").addEventListener("submit", async function(e){ e.preventDefault(); const msg = document.getElementById("msg"); msg.textContent = ""; try { const r = await fetch("/login", { method: "POST", body: JSON.stringify({ password: document.getElementById("p").value }) }); if (r.ok) { location.href = "/"; } else if (r.status === 429) { msg.textContent = "Too many attempts, try again later"; } else { msg.textContent = "Wrong password"; } } catch (err) { msg.textContent = "Network error"; } });</script></body></html>`


export default {
  async fetch(request, env) {
    
    let url = new URL(request.url)
    let path = url.pathname.replace(/^\/+/, "")
    let parts = path.split('/')

    const getIP = request.headers.get("CF-Connecting-IP")

    // token generator
    async function sign(fileId, expiry, secret){
      const enc = new TextEncoder()
      const key = await crypto.subtle.importKey(
        "raw", enc.encode(secret),
        {name: "HMAC", hash: "SHA-256"}, false, ["sign"]
      )
      const mac = await crypto.subtle.sign("HMAC", key, enc.encode(fileId + "." + expiry + "."))

      return [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("")
    }

    function safeEqual (a, b){
      if(a.length !== b.length) return false
      let diff = 0
      for(let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
      return diff === 0
    }

    async function hasSession(){
      const match = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)session=([^;]+)/)
      if(!match) return false
      const [exp, sig] = match[1].split('.')
      if(!exp || !sig) return false
      return safeEqual(sig, await sign("admin", exp, env.SESSION_SECRET)) && Number(exp) > Date.now() / 1000
    }


    //gate lock
    if (!(path === "login" && request.method === 'POST') && !(await hasSession())){
      if(path === ""){
        return new Response(LOGIN, {
          headers: {"content-type": "text/html; charset=utf-8"}
        })
      }
      return new Response('Access denied: Unauthorized access!!', {
          status: 401,
          headers: {'content-type': 'text/plain'}
      })
    }


    try {

      if(path === "login" && request.method === 'POST'){
        const failKey = "fail:" + getIP
        const fails = Number(await env.LOGIN_KV.get(failKey)) || 0
        if(fails >= 5){
          return new Response("too many attempts", {status: 429})
        }

        const {password} = await request.json()
        const good = password
          && safeEqual(await sign("login", "check", password), await sign("login", "check", env.ADMIN_PASSWORD))
        if (!good){
          await env.LOGIN_KV.put(failKey, String(fails + 1), {expirationTtl: 900})
          return new Response("Wrong password", {status: 401})
        }

        await env.LOGIN_KV.delete(failKey)
        const expiry = Math.floor(Date.now() / 1000) + 2 * 86400
        const cookie = expiry + "." + await sign("admin", expiry, env.SESSION_SECRET)
        return new Response("ok", {
          headers: {"set-Cookie": "session=" + cookie + "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + 2 * 86400}
        })
      }

      if(path === "createLink" && request.method === 'POST'){
        const {ID} = await request.json()
        if(!ID){
          return new Response("Id not available", {status: 500})
        }

        const expiry = Math.floor(Date.now() / 1000) + 2 * 86400
        const secret = env.SIGNING_SECRET
        const token = expiry + "." + await sign(ID, expiry, secret)
        const payload = {id: ID, token: token}
        const searchURL = new URL("/share", env.SHARE_URL)


        searchURL.search = new URLSearchParams(payload).toString()

        return new Response(JSON.stringify({link: searchURL.href}), {
          headers: {"content-type" : "application/json"}
        })
      }

        const authHeader = "Basic " + btoa(`${env.B2_KEY_ID}:${env.B2_APP_KEY}`)
        const authResponse = await fetch("https://api.backblazeb2.com/b2api/v4/b2_authorize_account", {
          headers: { Authorization: authHeader }
        })

        if (!authResponse.ok) {
          const err = await authResponse.text()
          return new Response("B2 auth failed: " + err, { status: authResponse.status })
        }

        const authData = await authResponse.json()

        if (path === "") {
          const expiry = Math.floor(Date.now() / 1000) + 2*86400
          const cookie = expiry + "." + await sign("admin", expiry, env.SESSION_SECRET)
          return new Response(HTML, {
            headers: { 
              "Content-Type": "text/html; charset=utf-8",
              "Set-Cookie": "session=" + cookie + "; HttpOnly; Secure; SameSite=Strict; path=/; Max-Age=172800"
             }
          })
        }

        if (path === "files") {
          const listResponse = await fetch(authData.apiInfo.storageApi.apiUrl + "/b2api/v1/b2_list_file_names", {
            method: "POST",
            headers: { Authorization: authData.authorizationToken, "Content-Type": "application/json" },
            body: JSON.stringify({ bucketId: env.BUCKET_ID, maxFileCount: 10000})
          })
          if (!listResponse.ok) {
            const errorMessage = await listResponse.text()
            return new Response(errorMessage, { status: listResponse.status })
          }
          const data = await listResponse.json()
          return new Response(JSON.stringify(data.files), {
            headers: { "Content-Type": "application/json" }
          })
        }

        const parts = path.split("/")
        if (parts.length === 2 && parts[0] === "file") {
          const fileId = parts[1]
          const downloadUrl = `${authData.apiInfo.storageApi.downloadUrl}/b2api/v1/b2_download_file_by_id?fileId=${fileId}`
          const headers = { Authorization: authData.authorizationToken }
          let range = request.headers.get("range")
          if (range) {
            const rangeParts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(rangeParts[0], 10)
            const end = start + 20 * 1024 * 1024
            headers["Range"] = `bytes=${start}-${end}`
          }
          const b2Response = await fetch(downloadUrl, { headers })
          if (!b2Response.ok && b2Response.status !== 206) {
            const text = await b2Response.text()
            return new Response("B2 fetch error: " + text, { status: b2Response.status })
          }
          return new Response(b2Response.body, {
            status: b2Response.status,
            headers: {
              "Content-Type": b2Response.headers.get("Content-Type") || "application/octet-stream",
              "Content-Length": b2Response.headers.get("Content-Length") || "",
              "Accept-Ranges": "bytes",
              "Content-Range": b2Response.headers.get("Content-Range") || "",
              "Cache-Control": "public, max-age=3600",
              "X-Content-Type-Options": "nosniff"
            }
          })
        }

        return new Response("Not found", { status: 404 })

      } catch (err) {
        return new Response("Worker exception: " + err.message, { status: 500 })
     }
  }
}