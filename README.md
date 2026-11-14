# 🔐 Vault

A private desktop app for storing, browsing and streaming your files in your own [Backblaze B2](https://www.backblaze.com/cloud-storage) bucket, without needing a command line.

Vault is a graphical wrapper around [rclone](https://rclone.org/). You bring your own B2 bucket and an application key, and Vault handles uploading, browsing, previewing, downloading, renaming and deleting. Your files go straight from your computer to your bucket. The desktop app has no Vault server in between. (The optional web add-on, described [below](#-optional-web-access-and-share-links-advanced), runs on Cloudflare Workers that you deploy yourself.)

> [!NOTE]
> **Platform:** Windows today. Linux support is planned.

---

## ✨ Features

- **Multiple buckets**: save several B2 buckets and switch between them.
- **Optional password per bucket**: a lock for shared or unattended computers (see [Security](#-security-and-what-is-encrypted) for exactly what it does).
- **Upload** files or whole folders to the bucket root, an existing folder, or a new subfolder, with a progress bar and an abort button.
- **File browser** with folder filter, type filter (video / audio / image / document / other), search, **sorting** (by date, file name, path or size, ascending or descending, or grouped by type, extension or folder), and multi-select (click, shift-click range, select all). Large buckets stay responsive because the list is rendered in batches.
- **In-app preview** for videos, audio, images and PDFs, streamed from your bucket without downloading first.
- **External player fallback**: videos your system can't decode in the app open in VLC (or mpv / any player you choose).
- **Download** one or many files with progress and cancel. Name collisions are never overwritten (`file.mp4` becomes `file(1).mp4`).
- **Rename or move** a file. Changing the path moves it to another "folder".
- **Delete** one or many files, protected by a typed `DELETE` confirmation.
- **Close protection**: if you close the window during an upload, download or rename, Vault warns you first and cleans up unfinished uploads.
- **Optional web access and share links**: browse and stream your bucket from any browser and send expiring share links, using two free Cloudflare Workers you deploy yourself (advanced, see [below](#-optional-web-access-and-share-links-advanced)).

---

## 🚀 Getting started

1. Download the latest **`Vault.exe`** from the [Releases](../../releases) page.
2. Double-click it. There is nothing to install and nothing else to download. Vault includes everything it needs.
3. Set up a private Backblaze B2 bucket and an application key (step-by-step guide below).
4. In Vault, open the **Connect** tab, add your bucket, and start using it.

On first launch Vault creates its own private storage area on your computer and keeps your saved credentials encrypted there automatically. You don't have to set anything up.

**Good to know**
- **Windows only for now.** Linux support is planned. Vault needs the Microsoft Edge WebView2 runtime, which comes preinstalled on current versions of Windows 10 and 11.
- Because the app is a new, independent project, Windows SmartScreen or your antivirus may show a warning the first time you run it. This is common for small unsigned apps. The full source code is in this repository if you want to check what it does.
- Optional but recommended: install [VLC](https://www.videolan.org/vlc/) for videos the built-in preview can't play (see [Videos that won't play](#-videos-that-wont-play-get-vlc)).

---

## ☁️ Setting up Backblaze B2

### 1. Create a Backblaze account

Sign up at <https://www.backblaze.com/cloud-storage>. B2 has its own pricing (storage, downloads, API calls). Check Backblaze's pricing page before you store a lot of data.

### 2. Create a private bucket

1. Log in and open **B2 Cloud Storage → Buckets**.
2. Click **Create a Bucket**.
3. **Bucket name**: pick a unique name (bucket names are globally unique across all of Backblaze).
4. **Files in Bucket are: Private.** This is the important one. A private bucket means nobody can read your files without credentials. Never choose *Public* for personal data.
5. **Default Encryption**: enable it. This turns on Backblaze's server-side encryption for data at rest. (Backblaze manages those keys. This is not end-to-end encryption, see [below](#-security-and-what-is-encrypted).)
6. **Object Lock**: leave it **disabled**. Object Lock prevents deleting or renaming files, which would break Vault's delete and rename features.
7. Click **Create a Bucket**.

> Backblaze occasionally rearranges its web console. If a label above doesn't match exactly, look for the equivalent option.

### 3. Recommended: limit old file versions

By default B2 keeps every version of a file. Overwriting a file can leave hidden old versions that you keep paying for. In your bucket's settings, set the lifecycle rule to **Keep only the last version of the file**.

### 4. Create an application key (best practices)

Go to **Application Keys → Add a New Application Key**.

| Setting | Recommendation |
|---|---|
| **Name** | Something descriptive, e.g. `vault-laptop`. Use one key per device. |
| **Allow access to Bucket(s)** | **Select only the one bucket** Vault will use. Never use "All". |
| **Type of access** | **Read and Write**. Vault needs write access to upload, rename and delete. |
| **Allow List All Bucket Names** | Leave off. If connecting fails with a restricted key, turn it on as a fallback. |
| **File name prefix / Duration** | Leave empty. A duration makes the key expire, and Vault would stop working on that date. |

Then:

> [!IMPORTANT]
> Backblaze shows the application key **only once**. Copy the **keyID** and the **applicationKey** immediately and store them in a password manager.

- **Do not use your Master Application Key.** It has access to your entire account. Always create a dedicated, bucket-restricted key.
- **One key per device.** If a laptop is lost or stolen, delete that one key under *Application Keys* and everything else keeps working.
- **Rotate keys** if you suspect a leak: create a new key, add it to Vault, delete the old one in Backblaze.
- Never paste your key into chats, screenshots, issues or commits.

### 5. Add the bucket in Vault

On the **Connect** tab, click **Add a bucket** and fill in:

- **Account ID**: the *keyID* of the application key you just created
- **Application key**: the *applicationKey* (shown once)
- **Bucket name**: the exact name of your bucket
- **Password** (optional): a local lock for this bucket in Vault

Vault checks the credentials by contacting your bucket before saving them. If the check fails, nothing is stored.

---

## 🖥️ Using Vault

**Connect**: Saved buckets appear as a list. Click *Connect* to use one. A lock icon means the bucket has a password. Deleting a saved bucket here removes it from Vault only. Your data in B2 is untouched.

**Upload**: Choose a location (bucket root or an existing folder), optionally type a new subfolder name, then select files or a folder. Review the confirmation, then upload. Note that B2 has a flat structure: "folders" are just path prefixes in file names.

**Download**: Browse, filter and search your files. Click a file to preview it, or use the row buttons to download, rename/move or delete. Select several files for bulk download or bulk delete.

**Keyboard**: `Esc` closes the preview or the open dialog, or clears the current selection. While a video or audio file is open in the preview, `Space` plays or pauses, `M` mutes or unmutes, and `F` enters or leaves fullscreen (video only).

---

## 🎞️ Videos that won't play (get VLC)

Vault previews video using your system's built-in web engine (Microsoft Edge WebView2). It plays common formats such as H.264 (AVC) in MP4 and WebM, but many files won't play there, for example:

- HEVC / H.265 (depending on installed codecs)
- 10-bit or 12-bit video
- Some MKV, AVI, WMV or FLV files

When that happens, the preview shows an **Open in external player** button. Vault streams the file to a local player without downloading it first.

**Install [VLC](https://www.videolan.org/vlc/)**, which plays practically everything. Vault finds VLC (or mpv) automatically. If you use another player, click **Choose player** when prompted and pick its executable. It must accept a URL as an argument. Vault remembers your choice.

---

## 🔒 Security and what is encrypted

Please read this section. It describes what Vault protects and what it does not.

### What is encrypted

| Item | Protection |
|---|---|
| **Saved bucket names and application keys** (`vault.dat`) | Encrypted on disk with **AES-256-GCM**. The encryption key is generated on first run and stored in the **Windows Credential Manager** (entry `encryption-key@Vault`), not in the file. |
| **App settings** (`settings.dat`, e.g. your chosen video player) | Encrypted the same way. |
| **Bucket passwords** | Never stored. Only a salted **scrypt** hash is kept, in Credential Manager. |
| **Traffic to Backblaze** | Sent over HTTPS by rclone. |
| **Your files at rest on Backblaze** | Only if you enabled *Default Encryption* on the bucket (server-side). Backblaze holds those keys. |

### What is NOT encrypted

> [!WARNING]
> **Your files are not encrypted by Vault.** They are uploaded exactly as they are, using plain `rclone copy`. Anyone who gains access to your Backblaze account or your application key can read them. Protect your Backblaze account with a strong unique password and two-factor authentication.

- **File names** are stored as-is in the bucket.

### Limits of the local protections

- The encryption key for `vault.dat` lives in your Windows Credential Manager. This protects the file if it is copied elsewhere (a backup, a synced folder, a USB stick). It does **not** protect against someone who is logged into your Windows account, or malware running as you.
- The **bucket password is a convenience lock** in the app's interface, meant for shared or unattended computers. It does not encrypt anything, and it is not a defense against someone with access to your Windows user account. If you forget it, remove the bucket in Vault and add it again. Your B2 data is unaffected.
- Credentials are passed to rclone through environment variables for each operation, and no rclone config file with credentials is written to disk.

### Other behavior worth knowing

- **Deletes are permanent** 🗑️. Vault runs rclone with B2 hard-delete enabled, so deleted files are removed, not hidden. Before deleting, Vault validates the file list and does a dry run, and refuses to proceed if the counts don't match.
- **Streaming/previews** use a temporary local rclone server bound to `127.0.0.1` (this computer only), on a random port, with a random token in the URL, in read-only mode. It stops when you disconnect or close the app.
- **Aborted uploads** are cleaned up with `rclone cleanup`, which removes unfinished partial uploads from the bucket.
- **Rename/move** never overwrites an existing file.

---

## 📂 Where Vault stores its data

| Location | Contents |
|---|---|
| `%APPDATA%\Vault\vault.dat` | Encrypted saved buckets |
| `%APPDATA%\Vault\settings.dat` | Encrypted settings |
| `%APPDATA%\Vault\empty.conf` | Empty rclone config (credentials are never written here) |
| Windows Credential Manager → `encryption-key@Vault` | The key that decrypts the two files above |
| Windows Credential Manager → `<bucket>_password@Vault` | Password hash (only if you set a bucket password) |

**Full reset:** close Vault, delete the `%APPDATA%\Vault` folder, and remove the `@Vault` entries in Credential Manager (Control Panel → Credential Manager → Windows Credentials). Your files in B2 are not affected.

---

## 🧰 Troubleshooting

**"Config could not be decrypted (wrong key or file changed)"**: The encryption key in Credential Manager no longer matches `vault.dat` (for example the credential was removed, or you moved to a new Windows profile). Do a full reset as described above and re-add your buckets.

**"Could not connect, check your credentials"**: Check the keyID, application key and exact bucket name. Make sure the key has access to that bucket. If you restricted it to a single bucket and it still fails, try enabling *Allow List All Bucket Names* on the key.

**"No video player found"**: Install VLC, or click *Choose player* and select your player.

**Video shows audio but no picture, or says it can't be displayed**: The codec isn't supported by the built-in preview. Use *Open in external player*.

**Backblaze charges for stored old versions**: See [limit old file versions](#3-recommended-limit-old-file-versions).

---

## 🌐 Optional: web access and share links (advanced)

The desktop app works fine on its own. This add-on is for people who also want to:

- 🌍 browse and stream their bucket from **any browser**, behind a password
- 🔗 send a **share link** to one file that expires automatically

It uses two small [Cloudflare Workers](https://workers.cloudflare.com/) that you deploy to your own Cloudflare account. The free plan is enough for personal use (check Cloudflare's current limits). You don't need a custom domain, because the free `workers.dev` addresses work.

```
 You ──(password)──▶  vault Worker  ──▶  your B2 bucket
                          │
                          └─ creates a signed, expiring link
 Friend ──(link)────▶  share Worker  ──▶  that one file only
```

| Worker | Who can reach it | What it does |
|---|---|---|
| **`vault`** | You, after logging in with your password | Browse, search, stream and download files; create share links |
| **`share`** | Anyone with a valid link | Shows or downloads **one** file until the link expires |

> [!NOTE]
> Cloudflare rearranges its dashboard from time to time. If a menu is named slightly differently from what's written below, look for the equivalent option.

### Step 1: Create a read-only B2 key

Both Workers only list and download files, so give them a key that **can't delete anything**. If a Worker is ever compromised, your files stay safe.

1. In Backblaze go to **Application Keys → Add a New Application Key**.
2. Name it something like `vault-web-readonly`.
3. **Allow access to Bucket(s)**: select only your bucket.
4. **Type of access**: **Read Only**.
5. Copy the **keyID** and **applicationKey** right away (Backblaze shows the key once).
6. Also note your **Bucket ID**. It's shown in your bucket's details on the **Buckets** page. (It's different from the bucket *name*.)

> [!TIP]
> Keep this separate from the read/write key you use in the desktop app.

### Step 2: Create the two Workers

Each Worker is just **one JavaScript file** that you paste into Cloudflare's online editor. There is nothing to install, no project to set up and no command line. This repository contains the two files: `worker/vault.js` and `worker/share.js`.

Do the following twice, once per Worker:

1. Log in at <https://dash.cloudflare.com/> and open **Workers & Pages**.
2. Click **Create** and choose to create a Worker, starting from the **"Hello World"** template.
3. Give it a name: **`vault`** for the first one, **`share`** for the second. Click **Deploy**.
4. Click **Edit code**. Select everything in the editor (`Ctrl+A`), delete it, and paste the **entire contents** of the matching file (`vault.js` into `vault`, `share.js` into `share`). Click **Deploy**.

When you're done, each Worker has an address like `https://share.<your-subdomain>.workers.dev`. **Write down the `share` Worker's address.** The `vault` Worker needs it in step 5.

### Step 3: Create the KV namespace (for login lockout)

The `vault` Worker uses a small key-value store to count failed login attempts, so that someone guessing passwords gets blocked.

1. In the dashboard open **Storage & Databases → KV** and click **Create a namespace**. Name it `LOGIN_KV`.
2. Open the **`vault`** Worker → **Settings → Bindings → Add → KV namespace**.
3. **Variable name:** type exactly `LOGIN_KV` (capital letters, underscore). The code looks for this exact name.
4. **KV namespace:** choose the one you just created, then save and deploy.

> [!IMPORTANT]
> Bind the namespace to the **`vault`** Worker only. The `share` Worker doesn't use it.

### Step 4: Generate your secrets

You need three random values: `ADMIN_PASSWORD`, `SESSION_SECRET` and `SIGNING_SECRET`. Each one should be at least 32 random bytes (64 characters). Use a **different** value for each.

Pick whichever method is easiest for you:

**Option A: a password manager (easiest, no commands).** Open the password generator in any password manager (for example Bitwarden, which is free), set the length to **64**, include letters and numbers, and copy the result. Store each secret in your password manager as well, since you'll need `ADMIN_PASSWORD` every time you log in.

**Option B: Windows PowerShell (nothing to install).** Press the Windows key, type `PowerShell`, open it, paste this line and press Enter. Run it once per secret:

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); -join ($b | ForEach-Object { $_.ToString('x2') })
```

**Option C: macOS or Linux terminal:**

```bash
openssl rand -hex 32
```

**Option D: Python** (if you already have it):

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Each method gives you a 64-character value like `9f2c…`. Copy it somewhere safe.

> [!WARNING]
> Avoid random "free token generator" websites for secrets. You can't verify what they do with what they generate. The methods above all run on your own computer.

`ADMIN_PASSWORD` is the one you'll type at the login page, so a long random one from a password manager (with copy and paste) is the practical choice.

### Step 5: Add the variables and secrets

For each Worker go to **Settings → Variables and Secrets → Add**. Use type **Secret** for anything sensitive (Cloudflare hides it after saving) and type **Text** for the rest. Deploy after saving.

**`vault` Worker**

| Name | Type | Value |
|---|---|---|
| `ADMIN_PASSWORD` | Secret | The password you'll use to log in |
| `SESSION_SECRET` | Secret | A random 64-character value (**different** from `SIGNING_SECRET`) |
| `SIGNING_SECRET` | Secret | A random 64-character value (**identical** to the `share` Worker's) |
| `B2_KEY_ID` | Secret | keyID of your read-only key |
| `B2_APP_KEY` | Secret | applicationKey of your read-only key |
| `BUCKET_ID` | Text | Your bucket's ID |
| `SHARE_URL` | Text | The `share` Worker's address, e.g. `https://share.<your-subdomain>.workers.dev` |

Plus the `LOGIN_KV` binding from step 3.

**`share` Worker**

| Name | Type | Value |
|---|---|---|
| `SIGNING_SECRET` | Secret | **Exactly the same** value as in the `vault` Worker |
| `B2_KEY_ID` | Secret | keyID of your read-only key |
| `B2_APP_KEY` | Secret | applicationKey of your read-only key |
| `BUCKET_ID` | Text | **Exactly the same** value as in the `vault` Worker |

**What must match between the two Workers**

| Value | Rule |
|---|---|
| `SIGNING_SECRET` | **Identical** in both. The `vault` Worker signs share links with it and the `share` Worker checks them. If they differ, every link shows "Access denied". |
| `BUCKET_ID` | **Identical** in both. The `share` Worker refuses files from any other bucket. |
| `B2_KEY_ID` / `B2_APP_KEY` | Can be the same read-only key in both, or two separate keys. Both need access to the bucket. |
| `SHARE_URL` | Only in `vault`. It must point to the `share` Worker. |
| `ADMIN_PASSWORD`, `SESSION_SECRET`, `LOGIN_KV` | Only in `vault`. |

### Step 6: Test it

1. Open your `vault` Worker address. You should see a password prompt.
2. Log in. Your files should appear.
3. Open a file, click the link icon to create a share link, and copy it.
4. Paste the link in a private/incognito window. The file should load without a login.

### How it behaves

- 🔓 **Sessions** last 2 days (and are renewed each time you open the page). 🔗 **Share links** expire after 2 days.
- 🚫 After **5 wrong password attempts** from the same IP address, login is blocked for about 15 minutes.
- 🔁 **Revoking access:** change `SIGNING_SECRET` in both Workers to kill every share link. Change `SESSION_SECRET` in the `vault` Worker to log out every session. Links can't be revoked one at a time.
- 👀 Anyone holding a share link can view or download **that one file** until it expires. Share links only to people you trust.
- 📏 The file list shows up to **10,000 files**.
- 🔐 The `vault` address is reachable from the internet, so your password is its only lock. Use a long random one.
- 🗑️ The Workers are **read-only**. They can't upload, rename or delete anything, so these actions remain desktop-app-only.

### Web troubleshooting

| Problem | Likely cause |
|---|---|
| Share link says "Access denied" | `SIGNING_SECRET` differs between the Workers, or the link is older than 2 days |
| "Too many attempts, try again later" | Too many wrong passwords. Wait about 15 minutes |
| Page shows a Worker error (like "Error 1101") when logging in | The `LOGIN_KV` binding is missing from the `vault` Worker, or its name isn't exactly `LOGIN_KV` |
| "B2 auth failed" | Wrong `B2_KEY_ID` or `B2_APP_KEY`. Re-copy them with no spaces |
| Empty file list or "Access denied" on a file | Wrong `BUCKET_ID`, or the key doesn't have access to that bucket |
| Share button says "Could not create link" | `SHARE_URL` or `SIGNING_SECRET` is missing in the `vault` Worker |

---

## 💡 Open source

Vault is open source so anyone can read how it works, audit what it does with their credentials, or reuse the code. You don't need to touch the code to use the app.

For the curious: it's built with Python and [PyWebView](https://pywebview.flowrl.com/), with the interface in a single `index.html`. [rclone](https://rclone.org/) does the actual transfers.

---

## 🗺️ Roadmap

- Linux support

---

## Credits and license

Vault includes [rclone](https://rclone.org/) (MIT license) to handle transfers and uses [PyWebView](https://pywebview.flowrl.com/). [VLC](https://www.videolan.org/) is optional and is not bundled.

Vault is an independent project and is not affiliated with or endorsed by Backblaze.

Vault is released under the [MIT License](LICENSE). Third-party components keep their own licenses, listed in [THIRD_PARTY_LICENSES.txt](THIRD_PARTY_LICENSES.txt).
