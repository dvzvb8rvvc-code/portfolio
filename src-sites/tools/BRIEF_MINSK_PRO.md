# Brief: Minsk demo sites — PRO level (batch 4)

Goal: sites that feel like apple.com product pages, Stripe, Linear, Vercel, Nike, Rivian, Awwwards SOTD — **directed, restrained, cinematic**. Not a pile of effects. Every site must feel like a different studio made it.

## Read first
- `src/lib/kit.jsx` (helpers), `tools/BRIEF_UK.md` (file rules, build & self-check — same rules apply), and ONE previous site for the file pattern, e.g. `src/sites/lynails.jsx`.
- Russian-language sites (Minsk). `<Ribbon name=... />` (ru), `<CallBar ... />` (ru), phone prefix `phoneFocus(bk)` (+375), Yandex map `<MapFrame oid="<yandex id>" />` (id from the yandex_url).

## What made previous sites look samey — DO NOT repeat by default
Every earlier site used: intro loader curtain, custom cursor with labels, velocity marquee, stat counters row, magnetic buttons, film grain, glowing neon text. **Allowed: at most ONE of these per site, and only if it serves the concept.** No emoji in UI.

## Pro principles (all mandatory)
1. **One big idea, told as a story.** Structure like a product launch page: hero statement → pinned cinematic chapter → proof → offer → booking.
2. **Pinned scroll film (≥ 300vh).** A 3D object/scene scrubbed by scroll like Apple's AirPods/iPhone pages: it rotates, assembles/explodes, changes material or camera angle, while 3–5 short captions fade in/out in sequence. Smooth (spring/lerp), no jank.
3. **Typography first.** Huge confident headlines, tight tracking, max 2 typefaces, clear hierarchy, lots of whitespace, short copy. Text that reveals by mask/line, not letter-confetti.
4. **Bento grid** section (Apple/Linear style) with mixed card sizes, each card a small live detail (mini 3D, animated SVG, gradient glow border on hover, number, quote).
5. **Real materials & light.** Physical materials, soft contact shadows (ContactShadows), studio Lightformers, subtle depth-of-field feel (blurred background layers). Restrained palette: 1 base, 1 ink, 1 accent.
6. **One business-value interaction** (not a toy for its own sake): configurator / estimator without prices / plan builder / before-after / slot picker — tied to what the client sells, feeding the booking form.
7. **Premium booking flow:** 2–3 steps with progress indicator, validation, keyboard-friendly, elegant success state ("В готовом сайте заявка сразу придёт вам в Telegram").
8. **Transitions with intent:** page-level colour shifts between chapters, clip-path/mask reveals, sticky split layouts, horizontal snap gallery. Max 3 transition types, used consistently.
9. **Performance:** lazy 3D, pause rendering offscreen (`frameloop="demand"` + invalidate, or IntersectionObserver), dpr ≤ 1.6, `useLite()` fallback. 60fps feel.
10. **Mobile is designed, not shrunk:** separate composition for < 768px, 3D never covers text, thumb-friendly CTAs.

## Content rules
- Natural Russian, short and confident. No invented prices, awards, years, staff names, guarantees. Real rating & ratings count only. Services = generic for the niche.
- Must include: Ribbon, header, contacts (phone tel:, messengers/Instagram if given), Yandex map, footer "© 2026 <Название> · Концепт сайта — Артём", CallBar, noindex.
- Never write "Claude", "AI" on the site.

## Previously used concepts — avoid
bubbles/foam, rain+wipers, x-ray car, nail-shape builder, fade builder, waterfall, flowing hair, liquid paint, tyre decoder, dirt wiping, stickers, scanner, film-colour car, gemstones, marble, paint-on-nail, vines, Bauhaus physics, lo-fi city, silk cloth, polish bottles, before/after split car, water beading, infinite zoom, van route, showroom torch, crystal polish, bees, steam seat, race lap.

## Build & self-check
Same commands as BRIEF_UK.md (`ONLY=<slug> OUT=<scratchpad>/<slug> npx vite build`, `node tools/shot.cjs`, `python3 tools/sheet.py`, then LOOK at the sheet). Max 2 fix rounds per site. Don't edit kit.jsx / data.js / vite.config.js / other sites.

## Report (short)
slug, big idea, pinned film description, value interaction, build OK, overflowX, errors, open issues.
