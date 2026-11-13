# Release notes — QR Studio 1.0

Paste into GitHub Releases. Tag: `v1.0`.

---

**Title:** QR Studio 1.0 — UPI, Wi-Fi and link QR codes that never leave your browser

**Body:**

```markdown
QR codes for the three things people actually make QR codes for: getting paid over UPI,
joining a Wi-Fi network, and sharing a link. One HTML file, no server, no account.

Your UPI ID and Wi-Fi password are encoded on your device. There is no backend to send
them to — the page makes no network requests except Google Fonts.

### Download
- **`index.html`** — that is the entire app. Open it, or host it anywhere.

### What is in it
- **UPI** — `upi://pay` intent with payee ID, name, optional amount and note; UPI ID
  validation with a message that explains the expected format
- **Wi-Fi** — WPA / WEP / open, hidden networks, correct escaping of `\ ; , : "` in SSIDs
  and passwords
- **Link** — strips 50+ tracking parameters (`utm_*`, `fbclid`, `igshid`, `gclid`…) and
  tells you how many it removed
- **Text** — anything, with a character count and a density warning
- PNG export at 256–2048 px, SVG export, copy-payload
- Error correction L/M/Q/H, adjustable quiet zone, custom colours
- Contrast warning when your colours will not scan, and a warning when inverted

### Verified, not assumed
23 assertions on the payload builders, plus every generated code rasterised and decoded
back with OpenCV to confirm it returns the exact original string — including a Devanagari
payload. Run it yourself: `node test/test.js`.

That round trip caught a real bug: the bundled encoder's default byte mode truncates
non-ASCII text (`ह` → byte 57). The UTF-8 encoder is now wired in explicitly.

### Known limitations
- UPI codes are intent links: iPhone's built-in camera will not open a UPI app. Scan from
  inside GPay / PhonePe / Paytm instead.
- A fixed amount may not be editable in every UPI app.
- Wi-Fi QR needs iOS 11+ / Android 10+ for camera support.
- Not code-signed, no server, no analytics — there is nothing to sign.

MIT License with Commons Clause. QR encoding by Kazuhiko Arase (MIT).
```

---

## Commands

```bash
git init && git add . && git commit -m "QR Studio 1.0 - UPI, Wi-Fi and link QR codes, fully client-side"
git branch -M main
git remote add origin https://github.com/S-procoder/qr-studio.git
git push -u origin main

git tag -a v1.0 -m "QR Studio 1.0"
git push origin v1.0

gh release create v1.0 index.html \
  --title "QR Studio 1.0 — UPI, Wi-Fi and link QR codes that never leave your browser" \
  --notes "Client-side QR generator. UPI, Wi-Fi, link and text modes. PNG/SVG export. No server, no tracking."
```

Then Settings → Pages → deploy from `main` / root, and the live URL is
`https://s-procoder.github.io/qr-studio/`.
