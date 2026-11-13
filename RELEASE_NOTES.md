# Release notes — QR Studio 1.1

Paste into GitHub Releases. Tag: `v1.1`.

---

**Title:** QR Studio 1.1 — contact cards and calendar events

**Body:**

```markdown
Two new modes, both generated on your device like everything else: **Contact** (vCard 3.0)
and **Event** (`.ics`).

Scan a contact code and the phone offers "Add contact". Scan an event code and it offers to
put the meetup in the calendar. No app, no account, no upload.

### What is new
- **Contact mode** — first and last name, phone, email, organisation, job title, website,
  address, note. Emits vCard 3.0 with correct escaping of `\ ; ,` and newlines, so a name
  like `A;B,C` survives the round trip intact.
- **Event mode** — title, start, optional end, location, description. Emits
  `BEGIN:VCALENDAR` / `VEVENT` with a stable UID (the same input always produces the same
  code) and floating local time, so the event lands in the scanner's own timezone rather
  than being shifted by yours.
- End-before-start is caught in the form instead of producing a broken calendar file.
- The "what gets encoded" box now shows the real line breaks in multi-line payloads.

### Verified
41 assertions on the payload builders, plus every mode rasterised and decoded back with
OpenCV — nine cases now, including a Devanagari contact card:

```
ok   upi             41x41 modules
ok   upi-unicode     61x61 modules
ok   wifi            29x29 modules
ok   link            25x25 modules
ok   text            33x33 modules
ok   text-long       61x61 modules
ok   vcard           65x65 modules
ok   vcard-unicode   57x57 modules
ok   event           65x65 modules
```

`node test/test.js` reproduces all of it.

### Known limitations
- A full vCard or a described event is a dense code (60-65 modules). Readable on modern
  phones; print it larger rather than smaller.
- No photo in the contact card and no `VTIMEZONE` block in the event — both would multiply
  the payload size and break cheap scanners.
- UPI codes remain intent links: an iPhone's built-in camera will not open a UPI app.

MIT License with Commons Clause. QR encoding by Kazuhiko Arase (MIT).
```

---

## Commands

```bash
git tag -a v1.1 -m "QR Studio 1.1 - contact cards and calendar events"
git push origin v1.1

gh release create v1.1 index.html \
  --title "QR Studio 1.1 — contact cards and calendar events" \
  --notes "Contact (vCard) and Event (.ics) modes, verified with 41 assertions and a decode round trip."
```

Pages rebuilds on its own after the push.

---

## 1.0 — for the record

Tag `v1.0`. UPI, Wi-Fi, Link and Text modes; PNG/SVG export; error correction levels;
contrast warnings. Asset: `index.html`.
