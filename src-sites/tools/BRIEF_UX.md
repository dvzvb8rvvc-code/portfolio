# Brief: batch 6 — beautiful AND usable

Previous batches looked amazing, but some were "show first, explain later". This batch: a client opens the site and within 5 seconds understands WHAT the business does, WHERE it is, and HOW to book — while the design still feels world-class and unique. Read also: STYLE_REFERENCES.md, BRIEF_MINSK_PRO.md, file/build rules in BRIEF_UK.md.

## Usability rules (mandatory)
1. **First screen answers 3 questions**: what (clear headline in plain Russian, e.g. «Ремонт Toyota и Lexus на Уручье»), proof (rating + ratings count from Yandex), action (primary CTA «Записаться» + phone visible). Address/district visible in hero or header.
2. **Sticky header** with clear section links (Услуги · Как мы работаем · Отзывы/Рейтинг · Контакты) + phone + CTA. Active section highlighted. Mobile: compact header + bottom CallBar.
3. **Services section that's actually useful**: list/cards with plain names, 1-line description, typical duration where sensible, «цена — уточнит мастер» or «от … — уточняйте» (no invented prices). Each service has a «Записаться» that pre-fills the form. Optional search/filter if > 8 services.
4. **"Как это работает"** in 3–4 numbered steps (e.g. записались → приехали → диагностика → согласовали → готово).
5. **FAQ** (5–6 real-life questions for the niche: сколько по времени, можно ли с ребёнком/питомцем, как оплатить, есть ли парковка — answer generically and safely, no false promises), accordion.
6. **Contacts block**: address, how to get there (landmark text like «вход со двора» only if known — otherwise skip), working hours placeholder «уточняйте по телефону», phone (tel:), messengers, Yandex map.
7. **Booking**: max 3 steps, big tap targets, inline validation, clear success state. Accessible labels, focus states, contrast AA, font ≥ 16px on mobile.
8. **Motion serves comprehension**: the pinned 3D film max ~300vh, every chapter has a clear caption; provide a «Пропустить →» link to services. No scroll-jacking. Respect reduced motion.
9. **Performance**: 3D lazy, paused offscreen, lite fallback; first content visible immediately (no intro curtain).

## Uniqueness
- Each site gets its own concept, layout system and reference style (given in assignment). No shared template feel: different hero composition, section order adapted to the niche, different typography & palette.
- Avoid all previously used concepts (list in BRIEF_MINSK_PRO.md plus batch 5: car exploded into systems, kitchen assembling from panels, paint stages on panel, pastel living UI board, winter→summer sun journey, layered 3D nail in app UI, Tesla slides, gold keycaps command bar, dot-matrix capsule, toy tanning device, prism→nail, rising sun sphere, Swiss beam of light).

## Report
slug, concept, reference style, how first screen answers what/where/how, value interaction, build OK, overflowX, errors, open issues.
