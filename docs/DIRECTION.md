# Two Grounds — portfolio design direction v0.1

Pitch page (live): https://claude.ai/code/artifact/7cb3174c-9ded-4495-8318-16e2c6277b21

## The idea
A light editorial site that **turns the lights off when you enter the work**, and back on when
you leave. Everything outside the work is "day" (limestone paper, tight type, real numbers —
Radeski's clarity). The work is "night" (dark ground, ambient canvas, glowing metrics — Yadav's
atmosphere, but standing behind evidence instead of standing in for it). The seam between the
two grounds is the site's signature, rather than a copied 3D object.

## Tokens
| role            | value    |
|-----------------|----------|
| limestone (day) | #E9E7E1  |
| chalk (raised)  | #F4F2EE  |
| ink (type)      | #16171B  |
| night (work)    | #0C0D10  |
| accent, day     | #1B3BE8  |
| accent, night   | #6D87FF  |

Display: Bricolage Grotesque 800, -0.05em tracking, 0.85 line-height.
Body: Archivo 400/600, measure ~66ch.
Data: JetBrains Mono — commit hashes, versions, latencies, live clock, tabular-nums.

## Page order
00 Opening · 01 Proof strip · 02 Selected work (night) · 03 Lights come back ·
04 Track record · 05 Toolkit · 06 Writing & craft · 07 The ask (night) · 08 Colophon (night)
Target height ~9–11k px (Yadav is 5.7k, Radeski is 17.9k).

## Stack
Next.js App Router (static export) · Tailwind + CSS custom properties · GSAP ScrollTrigger +
Lenis · React Three Fiber lazy-loaded, capped, paused off-screen.
Budget: LCP < 1.8s on 4G, Lighthouse >= 95 x4, < 120KB gz JS before the work section,
full read with JS off and with reduced motion.

## Reference teardown (measured live, not guessed)
- **yadavaman.com** — Next.js + Three.js + GSAP, #000, single face Outfit, H1 45px/500,
  5,760px over 6 pinned panels, 1 canvas 1794x1125, Bootstrap scrollspy leftovers,
  no evidence attached to any project.
- **nikolaradeski.com** (his favourite) — WordPress + Avada + Lenis 1.3.26, 17,907px,
  Clash Display SB 86.4px, General Sans 16/-0.5px, tracking -2.5px @36px, ink #333,
  body #6D6D6D, muted #A5A5A5, accent #E27500, 9 marquees, 0 WebGL. All the polish is
  typographic and editorial.
- **wallofportfolios.in/portfolios/ryan-walter** — an aggregator profile, not a portfolio.
  Useful only as a control for what the other two buy with all that effort.

## Blocking unknowns (see section 07 of the pitch)
Audience · which four projects + real numbers · stack and level · portrait/screenshots ·
accent approval · how far the motion should go.
