# QR Studio

**QR codes for UPI payments, Wi-Fi networks and links — generated entirely in your browser.**

One HTML file. No server, no account, no build step. Your UPI ID, your Wi-Fi password and
whatever you type stay on your device, because there is nothing to send them to.

Most "free QR generator" sites are ad pages that log what you encode. A UPI QR contains
your payment handle, and a Wi-Fi QR contains your password in plain text. Those are two
things you should not be pasting into someone else's server.

---

## What it does

| Mode | Encodes | Notes |
| --- | --- | --- |
| **UPI payment** | `upi://pay?pa=…&pn=…&am=…&cu=INR&tn=…` | Amount optional, so payers choose. Payee name shows in their app. |
| **Wi-Fi** | `WIFI:T:WPA;S:ssid;P:password;H:true;;` | WPA / WEP / open, hidden networks, correct escaping of `\ ; , : "` |
| **Link** | Any URL | Optional removal of 50+ tracking parameters (`utm_*`, `fbclid`, `igshid`, `gclid`…) with a count of what went |
| **Text** | Anything | Free text, addresses, phone numbers, vCards |

Every mode gives you:

- **Live preview** as you type, drawn on a canvas — no request, no flicker
- **Download PNG** at 256 / 512 / 1024 / 2048 px
- **Download SVG** — vector, so it stays sharp on a poster
- **Copy content** — the exact string that was encoded, for your own scripts
- Error correction L / M / Q / H, adjustable quiet zone, custom foreground/background colours
- A **contrast warning** when your colours are too close to scan, and a note when you invert
  to a light code on dark
- The full encoded payload shown under the preview, so you can check what you are printing

---

## Run it

**Locally:** download `index.html` and open it. That is the whole install. It works from
`file://`, and you can save it and use it on a plane.

**As a website (GitHub Pages):**

1. Create a public repo, e.g. `qr-studio`.
2. Add `index.html` (and optionally `README.md`, `LICENSE.md`, `test/`).
3. Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`.
4. It is live at `https://s-procoder.github.io/qr-studio/`.

---

## Privacy, specifically

The page makes exactly one kind of network request: Google Fonts, for the typefaces. Nothing
else. No analytics, no QR image API, no fonts for the QR itself — the codes are drawn
locally by an encoder bundled into the file.

You do not have to take that on trust:

- Open DevTools → Network, then use the tool. You will see font files and nothing else.
- Search the source for `fetch(`, `XMLHttpRequest`, `navigator.sendBeacon` — there are none.
- The QR encoder is [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
  by Kazuhiko Arase (MIT), inlined and minified at the top of the script.

If you want zero external requests at all, delete the three `<link>` tags in `<head>`. The
page falls back to Georgia and your system sans, and everything still works.

---

## How it is tested

Not "it looked fine when I opened it". The payload builders and the encoder are verified
end to end:

```bash
npm install qrcode-generator@1.4.4
node test/test.js          # 23 assertions on the payload strings
```

The builders are extracted from the shipped `index.html` itself, so the tests exercise the
code that actually runs. Then every generated code is rasterised and **decoded back with
OpenCV**, comparing the decoded string to the original — including a Devanagari payload, to
prove UTF-8 is not mangled:

```
ok   upi           41x41 modules
ok   upi-unicode   61x61 modules
ok   wifi          29x29 modules
ok   link          25x25 modules
ok   text          33x33 modules
ok   text-long     61x61 modules
```

That round trip caught one real bug during development: the library's default byte encoder
truncates non-ASCII (`ह` became byte 57), so the UTF-8 encoder is now wired in explicitly.

---

## Honest limitations

- **UPI codes are intent links.** Scanning with a camera works on most Android phones and
  opens a UPI app chooser. On iPhone, the built-in camera usually will not open a UPI app —
  scan from inside GPay, PhonePe or Paytm instead. This is a platform behaviour, not
  something the QR can change.
- **A fixed amount is baked in.** Some UPI apps let the payer edit it, some do not. Leave the
  amount empty if you want the payer to decide.
- **Wi-Fi codes need iOS 11+ / Android 10+** for the built-in camera to offer "Join network".
  Older devices need a QR scanner app. Hidden networks sometimes still require a manual join.
- **QR capacity is finite.** Very long text produces a dense code that cheap cameras fail on.
  The tool says so rather than silently producing an unscannable image.
- **Not a payment processor.** This page cannot receive money, see payments, or verify a UPI
  ID exists. It only draws the string your UPI app would have built.
- **Colours are your risk.** High-contrast dark-on-light scans best; the warning appears when
  contrast drops below a 3:1 ratio, but printing is on you.

---

## Roadmap

- vCard and event (`.ics`) modes
- Batch export: a sheet of QR labels for printing
- Optional logo in the centre, with error correction raised automatically to compensate
- Remember last-used mode and colours in `localStorage` (local only, never transmitted)

---

## Credits and licence

QR encoding by [Kazuhiko Arase](https://github.com/kazuhikoarase/qrcode-generator), MIT.
The rest is mine.

MIT License with Commons Clause — use it, change it, share it, don't sell it.
See [LICENSE.md](LICENSE.md).

Copyright (c) 2026 Siddhant Neekhra.
