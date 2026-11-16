# Brief: UK demo sites (batch 3)

You build 3 demo websites in `/home/user/portfolio/src-sites`. Quality bar: Awwwards "Site of the Day". Not just pretty — a real WOW: 3D, cinematic section transitions, kinetic type, one signature interactive toy per site.

## Read first (5 min)
- `src/lib/kit.jsx` — shared helpers. Use: useSmooth, Ribbon (lang="en"), SplitText, LineReveal (for gradient text — SplitText breaks bg-clip-text), ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, Tilt, useBooking, phoneFocus(bk, '+44 '), CheckDraw, GMap (Google map iframe: `<GMap q="Name, full address" />`), messengerLinks, CallBar (lang="en"), Progress, Intro, useLite, Grain, Scramble, WA icon, waLink(phone).
- 2 existing sites for level/style: `src/sites/pena.jsx` + `pena3d.jsx`, `src/sites/geometria.jsx` + `geometria3d.jsx`, `src/sites/rnk.jsx`.

## Files you may create (ONLY these — never edit kit.jsx, data.js, vite.config.js or other sites)
- `src-sites/<slug>/index.html` (copy pattern from `pena/index.html`: lang="en", noindex meta, theme-color, Google Fonts link, `<script type="module" src="/src/sites/<slug>.jsx">`)
- `src-sites/src/sites/<slug>.jsx` and optional `src-sites/src/sites/<slug>3d.jsx` (lazy-loaded) and other `<slug>-*.jsx` helpers.
- Put business data as a const at the top of `<slug>.jsx` (do not touch data.js).

## Content rules
- ALL text in natural British English. Prices in £ only if given (they are not — so no prices). No invented awards, years, staff names, guarantees. Real rating and review count only (given below).
- Must include: `<Ribbon lang="en" name=... />`, header, hero, services (generic for the niche, 4–6), signature interactive section, reviews-count stat, booking form (useBooking; on submit show success "In the finished site this request goes straight to your phone/Telegram"), contact section with phone (tel:), WhatsApp button for UK mobiles (+44 7…) via waLink, Instagram/Facebook link if given, `<GMap q="<name>, <address>" />`, footer "© 2026 <name> · Website concept by Artem", `<CallBar lang="en" ...>` on mobile.
- Never write "Claude", "Claude Code", "AI" anywhere on the site.

## WOW requirements (each site)
1. A 3D hero (@react-three/fiber + drei) or custom WebGL shader that fits the business concept — built from primitives/lathe/extrude/instancing/shaders (no external model downloads). Reacts to pointer and scroll.
2. Cinematic transitions between sections: e.g. clip-path curtain wipes, sticky scroll scenes with pinned 3D, section colour morphs, scale/rotate reveals, horizontal scroll chapters. At least 3 distinct transition types per site.
3. One signature interactive toy (given in your assignment). Must actually work on mouse AND touch.
4. Intro loader (Intro), custom cursor, magnetic CTAs, kinetic headline.
5. Each site has its own palette, fonts and layout — no two sites look alike.

## Technical rules (learned the hard way)
- Tailwind font classes with quotes: `font-['Oswald',sans-serif]`.
- Never define a component inside another component's body (breaks inputs/sliders).
- 3D light: no MeshTransmissionMaterial, spheres ≤ 48 segments, `dpr={[1, 1.6]}`, lighting via `<Environment><Lightformer/></Environment>` (no HDR downloads). Mobile: shrink/move 3D (`useThree().size.width < 768`) so it never covers headline text. Use `useLite()` to swap heavy WebGL for a CSS fallback.
- Long headlines: don't `whitespace-nowrap` on mobile; use clamp() with a small min.
- `MotionConfig reducedMotion="user"`. No horizontal overflow (check overflowX = 0).
- Canvas elements over text: `pointer-events-none` unless interactive.

## Build & self-check (mandatory for each site)
```
cd /home/user/portfolio/src-sites
ONLY=<slug> OUT=/tmp/claude-0/-home-user-portfolio/5182b9e2-57d0-5b3f-8476-74d26dcbb617/scratchpad/<slug> npx vite build
node tools/shot.cjs /tmp/claude-0/-home-user-portfolio/5182b9e2-57d0-5b3f-8476-74d26dcbb617/scratchpad/<slug> <slug> /tmp/claude-0/-home-user-portfolio/5182b9e2-57d0-5b3f-8476-74d26dcbb617/scratchpad/<slug>/s
python3 tools/sheet.py /tmp/claude-0/-home-user-portfolio/5182b9e2-57d0-5b3f-8476-74d26dcbb617/scratchpad/<slug>/s
```
Then LOOK at `<...>/s-sheet.png` with the Read tool. Fix: errors, overflowX ≠ 0, clipped headlines on mobile, 3D covering text, empty gradient headlines, unreadable contrast. Iterate until clean (max 3 rounds).

## Report back (short)
Per site: slug, concept in one line, signature toy, build OK, overflowX, errors, anything unfinished.
