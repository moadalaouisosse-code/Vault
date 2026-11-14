const SHARE = (file) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Shared file</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />\n  <style>\n    *, *::before, *::after {box-sizing: border-box; margin: 0; padding: 0;}\n    :root {--bg-base: #0A0E1A; --bg-surface: #111827; --border: #1E2A3A; --accent: #3B82F6; --text-primary: #F1F5F9; --text-muted: #64748B; --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;}\n    html, body {height: 100%; background: var(--bg-base); color: var(--text-primary); font-family: var(--sans); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased;}\n    .wrap {min-height: 100%; display: flex; flex-direction: column; max-width: 960px; margin: 0 auto; padding: 0 24px 40px;}\n    .bar {display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 0; border-bottom: 1px solid var(--border); margin-bottom: 24px;}\n    #fileName {font-family: var(--mono); font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;}\n    .btn {flex-shrink: 0; color: #fff; background: var(--accent); border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 500; text-decoration: none; transition: background 0.15s;}\n    .btn:hover {background: #2563EB;}\n    #player {flex: 1; display: flex; align-items: center; justify-content: center; background: #000; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; min-height: 200px;}\n    #player video, #player img {width: 100%; max-height: 80vh; object-fit: contain; display: block;}\n    #player audio {width: 100%; padding: 24px;}\n    #player iframe {width: 100%; height: 80vh; border: none; display: block; background: #fff;}\n    .no-preview {width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 24px; background: var(--bg-surface); font-family: var(--mono); font-size: 13px; color: var(--text-muted);}\n    @media (max-width: 560px) {.wrap {padding: 0 16px 24px;} .bar {padding: 16px 0;}}\n  </style>\n</head>\n<body>\n  <div class="wrap">\n    <header class="bar">\n      <span id="fileName"></span>\n      <a id="download" class="btn">Download</a>\n    </header>\n    <main id="player"></main>\n  </div>\n  <script>\n    const FILE = ` + JSON.stringify(file).replace(/</g, "\\u003c") + `;\n    const name = FILE.name.split("/").pop() || FILE.name;\n    const type = (FILE.type || "").toLowerCase().trim();\n    const extension = FILE.name.split(".").pop().toLowerCase();\n    const unidentifiedTypes = ["application/octet-stream","binary/octet-stream","application/x-unknown-content-type","unknown/unknown",""];\n    const videoExtensions = ["mp4","m4v","mkv","webm","mov","avi","wmv","flv","mpg","mpeg","m2ts","mts","3gp","3g2","ogv","m3u8","ts"];\n    const audioExtensions = ["mp3","m4a","wav","flac","aac","ogg","wma","amr","aiff","aif","opus","oga"];\n    const imageExtensions = ["jpg","jpeg","png","gif","webp","svg","bmp","avif","ico"];\n    const unidentified = unidentifiedTypes.includes(type);\n    const player = document.getElementById("player");\n    const download = document.getElementById("download");\n    document.title = name;\n    document.getElementById("fileName").textContent = name;\n    download.href = FILE.raw;\n    download.download = name;\n    let el = null;\n    if (type.startsWith("video") || (unidentified && videoExtensions.includes(extension))) {\n      el = document.createElement("video"); el.controls = true; el.preload = "metadata";\n    } else if (type.startsWith("audio") || (unidentified && audioExtensions.includes(extension))) {\n      el = document.createElement("audio"); el.controls = true; el.preload = "metadata";\n    } else if (type.startsWith("image") || (unidentified && imageExtensions.includes(extension))) {\n      el = document.createElement("img"); el.alt = name;\n    } else if (type.includes("pdf") || type === "text/plain" || (unidentified && (extension === "pdf" || extension === "txt"))) {\n      el = document.createElement("iframe");\n    }\n    if (el) {\n      el.src = FILE.raw;\n      player.appendChild(el);\n    } else {\n      const box = document.createElement("div");\n      box.className = "no-preview";\n      const msg = document.createElement("span");\n      msg.textContent = "No preview available";\n      const link = document.createElement("a");\n      link.className = "btn";\n      link.href = FILE.raw;\n      link.download = name;\n      link.textContent = "Download file";\n      box.appendChild(msg);\n      box.appendChild(link);\n      player.appendChild(box);\n    }\n  </script>\n</body>\n</html>\n`;


export default {
  async fetch(request, env) {
    
    let url = new URL(request.url)
    let path = url.pathname.replace(/^\/+/, "")
    let parts = path.split('/')
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

	function safeEqual(a, b){
		if(a.length !== b.length) return false
		let diff = 0
		for(let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
		return diff === 0
	}

    if(parts[0] === "share"){

      // gate lock
      const fileId = url.searchParams.get('id')
      const returnToken = url.searchParams.get('token')
	  const deny = () => new Response('Access denied: Unauthorized access!!', {
		  status: 401,
		  headers: {'Content-Type': 'text/plain'}
	  })
	  
	  if (!fileId || !returnToken) return deny()
		  
      const [exp, tok] = returnToken.split(".")
      const token = await sign(fileId, exp, env.SIGNING_SECRET)

      if (!exp || !tok || !safeEqual(token, tok) || !(Number(exp) > Date.now() / 1000)){
        return new Response('', {
          status: 401,
          headers: {'content-type': 'text/plain'}
        })
      }

      try {

        const authHeader = "Basic " + btoa(`${env.B2_KEY_ID}:${env.B2_APP_KEY}`)
        const authResponse = await fetch("https://api.backblazeb2.com/b2api/v4/b2_authorize_account", {
          headers: {Authorization: authHeader}
        })

        if (!authResponse.ok){
          return new Response("Unable to authenticate: " + await authResponse.text(), 
          {status: authResponse.status})
        }

        const authData = await authResponse.json()

        if (!url.searchParams.get('raw')) {
          const infoResponse = await fetch(authData.apiInfo.storageApi.apiUrl + "/b2api/v1/b2_get_file_info", {
            method: "POST",
            headers: { Authorization: authData.authorizationToken, "Content-Type": "application/json" },
            body: JSON.stringify({ fileId })
          })
          if (!infoResponse.ok) return new Response("File not found", { status: 404 })
          const info = await infoResponse.json()
          if (info.bucketId !== env.BUCKET_ID) return new Response("Access denied", { status: 403 })
          const raw = "/share?id=" + encodeURIComponent(fileId) + "&token=" + encodeURIComponent(returnToken) + "&raw=1"
          return new Response(SHARE({ name: info.fileName, type: info.contentType, raw: raw }), {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          })
        }

        const downloadUrl = `${authData.apiInfo.storageApi.downloadUrl}/b2api/v1/b2_download_file_by_id?fileId=${encodeURIComponent(fileId)}`
        const headers = {Authorization: authData.authorizationToken}
        const range = request.headers.get("range")
          if (range) {
            const rangeParts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(rangeParts[0], 10)
            const end = start + 20 * 1024 * 1024
            headers["Range"] = `bytes=${start}-${end}`
          }
        const b2Response = await fetch(downloadUrl, { headers })

        if (!b2Response.ok){
          return new Response("unable to load the file: " + await b2Response.text(),
        {status: b2Response.status})
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

      } catch (error) {
        return new Response("Unexpected error" + error.message, {status: 500})
      } 
    }

    else{
      return new Response("Not found", {status: 404})
    }
  }
}