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
