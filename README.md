# jivitesh kumar — portfolio

Hand-built static site. No framework, no build step. Open `index.html` or serve the folder.

```
index.html      all content
css/site.css    design system + layout
js/site.js      clock, ground transition, ambient field, reveals
docs/           design direction
```

## The idea — "Two Grounds"

Everything outside the work is **day**: limestone `#E9E7E1`, ink `#16171B`, editorial type.
The work and the contact block are **night**: `#0C0D10` with an ambient point-cloud behind them.
Scrolling into a `[data-night]` section fades the ground across and flips `data-ground` on `<html>`,
which swaps every token at once. That seam is the site's signature.

Disable JavaScript and the whole page still reads, in day. Turn on reduced motion and the
canvas is removed and the transition becomes instant.

## What moves

- **Storyboard (`01 — The idea`).** A pinned chapter: scroll drives four frames of the Tata
  pipeline — raw email, regex extraction, model, structured incident. Click a frame in the
  strip to jump. Without JS the frames render in their finished state, stacked.
- **Custom cursor.** Dot + trailing ring; inverts against both grounds, grows with a label over
  links, and says hello in a different language over the name. Pointer devices only.
- **Follows the visitor.** Letters of the name change weight/width near the cursor, hero layers
  parallax, buttons pull toward the pointer, tiles light up under it, and the hero knot tilts
  and repels.
- **Follows the scroll.** Name splits and the knot scatters on the way down (and reassembles on
  the way up), ticker reverses with direction and speeds with velocity, band skews with speed,
  metrics count up, headings rise word by word, case studies show a reading rail.
- **Languages.** A one-per-visit intro cycles hello through 13 languages and ends on नमस्ते; the
  contact block rotates a greeting with its language name.

### Phones

**Phones do not pin the storyboard.** The pinned stage depended on viewport-height units and
scroll maths, and a phone changes its viewport height whenever the browser toolbar slides away —
which broke frame timing and left blank bands while scrolling down. Below 900px the four frames
are simply stacked in order, each with its own copy of the artwork cropped (175%) and panned to
the object that frame is about. No sticky, no scroll maths, nothing to desync. Desktop keeps the
pinned, scroll-driven version.

The ambient canvas is switched off entirely on phones — it is decorative, drawn at half opacity
there, and repainting it each frame is what costs a mid-range phone its scroll rate.

### Motion setting

Motion follows the device's reduced-motion preference. **Windows "Animation effects" is off on
this machine**, which reads as reduced motion — so the calm version shows by default here. A
`Motion: on/off` toggle sits in the spine and the footer (stored in `localStorage`), and anyone
whose device asks for reduced motion gets a one-time note offering to turn it on.

## Run it

```bash
python -m http.server 5173
```

## Deploy

Push to GitHub and turn on Pages (branch `main`, folder `/`). No build step needed.

## Résumé

`resume/index.html` is the source; `resume/Jivitesh-Kumar-Resume.pdf` is what the site links to.
After editing the HTML, regenerate the PDF with the local server running:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="D:\my_portfolio\resume\Jivitesh-Kumar-Resume.pdf" http://localhost:5173/resume/
```

It must stay one A4 page.

## Before this goes live

Every placeholder is wrapped in `class="todo"` and renders highlighted in blue, so nothing
half-written can ship by accident. Find them with:

```bash
grep -n 'class="[^"]*todo' index.html
```

All content placeholders are filled. Two things are still worth deciding:

- **Portfolio URL** — the résumé assumes this site is deployed to your existing `jivitesh-port`
  GitHub Pages repo (`jiviteshkumar.github.io/jivitesh-port`). Change it if you deploy elsewhere.
- **CGPA** — optional, but Indian campus recruiters often filter on it. Add it to the Education
  line if it helps you.

## Content decisions worth remembering

- **Tata hours saved** is deliberately not stated. 1,000+ emails/day at 3–5 min each doesn't
  reconcile with a small weekly-hours figure, so the copy uses only numbers that agree with each
  other: 1,000+/day, 80%+ less manual time, minutes to seconds per email.
- **Leo is a two-person project.** The copy says so and describes exactly which part is yours
  (the reliability rebuild, server-side AI, provider layer). Keep it that way in interviews.

If you add a new placeholder later, mark it `class="todo"` so it shows up highlighted.
