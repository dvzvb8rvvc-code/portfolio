// ONLY facts found on yehiel-tsubery.com / archilovers. Do not invent prices, years, awards, client names.
// Images: '/portfolio/yts/img/<id>.webp' (1800px) and '<id>-s.webp' (720px). Full list with groups: public/yts/manifest.json
export const img = (id, small) => `/portfolio/yts/img/${id}${small ? '-s' : ''}.webp`

export const T = {
  // design tokens
  paper: '#ece7df', paper2: '#e2dcd2', ink: '#151412', ochre: '#b06a35', lake: '#27414f', gold: '#c3a15e', stone: '#8c8579',
  serif: "font-['Instrument_Serif',serif]", sans: "font-['Inter_Tight',sans-serif]",
}

export const PERSON = {
  name: 'Yehiel Tsubery', role: { en: 'Architect & entrepreneur', it: 'Architetto e imprenditore' },
  edu: [
    { en: 'Architecture — Politecnico di Milano, 2008', it: 'Architettura — Politecnico di Milano, 2008' },
    { en: 'Project management — Technion, Israel Institute of Technology, 2010', it: 'Project management — Technion, Israel Institute of Technology, 2010' },
  ],
  studioSince: 2012, office: 'Ramat Gan, Israel', portraits: [1, 126], logo: 116,
  motto: { en: 'Unstoppable creativity', it: 'Creatività inarrestabile' },
  tech: ['BIM', 'VR', 'AR'],
}

export const COMPANIES = ['YTS Architects ltd', 'YTS Holdings Italia', 'YTS Como Italia ltd', 'Il Giardino di Teodolinda ltd', 'Panorama ltd', 'Piavi Epsilon ltd', 'Emevia Como ltd', 'Eneleo Lago ltd']

// The studio's own words: one integrated package from concept to interiors.
export const SERVICES = [
  { k: '01', t: { en: 'Concept design', it: 'Progetto di concept' }, d: { en: 'Early design that looks at the big picture — solutions bespoke to each client’s needs and aspirations.', it: 'Progettazione iniziale con uno sguardo d’insieme — soluzioni su misura per esigenze e aspirazioni del cliente.' } },
  { k: '02', t: { en: 'Permits & authorities', it: 'Permessi e autorità' }, d: { en: 'Taking the project through the requirements of local authorities and statutory bodies.', it: 'Accompagniamo il progetto attraverso i requisiti delle autorità locali e degli enti preposti.' } },
  { k: '03', t: { en: 'Working drawings', it: 'Progetto esecutivo' }, d: { en: 'Detailed work plans with careful control of cost and programme.', it: 'Elaborati esecutivi dettagliati con attento controllo di costi e tempi.' } },
  { k: '04', t: { en: 'Interior design', it: 'Interior design' }, d: { en: 'Interiors designed together with the building, as one complete package.', it: 'Interni progettati insieme all’edificio, in un unico pacchetto completo.' } },
  { k: '05', t: { en: 'Development & investment', it: 'Sviluppo e investimento' }, d: { en: 'Through YTS Group: acquiring, designing and delivering residences in Italy.', it: 'Con YTS Group: acquisizione, progettazione e realizzazione di residenze in Italia.' } },
]
export const SCALE = { en: ['Commercial', 'Public', 'Residential'], it: ['Commerciale', 'Pubblico', 'Residenziale'] }

export const COMO = {
  name: 'Il Giardino di Teodolinda', place: 'Perledo · Lake Como · Italy',
  lead: { en: 'Hilltop holiday residences above Varenna, on the panoramic “Scenic Route” SP65 — every home with its own garden facing the lake.', it: 'Residenze per le vacanze sulla collina sopra Varenna, lungo la panoramica SP65 — ogni casa con il proprio giardino affacciato sul lago.' },
  facts: [
    { v: '35–95', u: 'm²', l: { en: 'built area per unit', it: 'superficie costruita per unità' } },
    { v: '25–160', u: 'm²', l: { en: 'private garden', it: 'giardino privato' } },
    { v: '7–10', u: 'min', l: { en: 'to Varenna centre', it: 'dal centro di Varenna' } },
    { v: '2', u: '', l: { en: 'complexes — A and B', it: 'complessi — A e B' } },
  ],
  every: { en: ['Lake-view garden on a separate lot', 'Heating & cooling', 'Private parking space', 'Prepared for a hot tub / jacuzzi', 'Shared pool, BBQ area and lounge'], it: ['Giardino vista lago su lotto separato', 'Riscaldamento e raffrescamento', 'Posto auto privato', 'Predisposizione per vasca idromassaggio', 'Piscina, area barbecue e lounge in comune'] },
  views: { en: 'Views of the Golden Triangle — Castello di Vezio, Bellagio, Menaggio, Cadenabbia.', it: 'Vista sul Triangolo d’Oro — Castello di Vezio, Bellagio, Menaggio, Cadenabbia.' },
  model: { en: 'A holiday home in one of Italy’s most sought-after lake districts, designed for families and for short-term rental, managed by a company owned by the unit owners.', it: 'Una casa vacanze in uno dei distretti lacustri più richiesti d’Italia, pensata per le famiglie e per l’affitto breve, gestita da una società di proprietà dei condomini.' },
  phases: { en: ['Reservation', 'Permit', 'Structure', 'Walls', 'Interior finishes', 'Facade', 'Completion'], it: ['Prenotazione', 'Permesso', 'Struttura', 'Muri', 'Finiture interne', 'Facciata', 'Consegna'] },
  phasesNote: { en: 'Payments are staged along construction phases. Unit prices depend on home size, garden and parking — on request.', it: 'I pagamenti seguono le fasi del cantiere. I prezzi dipendono da superficie, giardino e parcheggio — su richiesta.' },
  sport: { en: 'Cycling, hiking, tennis, golf, ski, sailing, windsurf, canoe', it: 'Ciclismo, trekking, tennis, golf, sci, vela, windsurf, canoa' },
  imgs: { render: [5, 140, 95, 7, 38], view: [129, 131, 141, 142], site: [130, 134, 135, 138, 139, 132], founderOnSite: 104, sketch: [30, 85] },
}

export const PALAZZO = {
  name: 'Palazzo Campani', place: 'Volterra · Tuscany · Italy',
  lead: { en: 'A 17th-century noble residence on medieval foundations, in the heart of Volterra — six private residences with original frescoes, vaulted ceilings and alabaster.', it: 'Una dimora nobiliare del Seicento su fondamenta medievali, nel cuore di Volterra — sei residenze private con affreschi originali, volte e alabastro.' },
  credit: { en: 'Restoration & interiors: architect and designer Emanuele Colombi', it: 'Restauro e interni: architetto e designer Emanuele Colombi' },
  // floors bottom → top, for the exploded 3D model
  floors: [
    { id: 'cellar', t: { en: 'Cellars & spa', it: 'Cantine e spa' }, d: { en: 'Private wine cellars, spa suites', it: 'Cantine private, suite spa' }, units: [] },
    { id: 'ground', t: { en: 'Ground floor', it: 'Piano terra' }, d: { en: 'Entrance salon, meeting & working lounge', it: 'Salone d’ingresso, lounge per riunioni e lavoro' }, units: [{ n: 1, m2: 83, r: { en: 'three rooms', it: 'trilocale' } }, { n: 2, m2: 84, r: { en: 'two rooms', it: 'bilocale' } }] },
    { id: 'nobile', t: { en: 'Piano nobile', it: 'Piano nobile' }, d: { en: 'Frescoed halls, art salon', it: 'Sale affrescate, salotto d’arte' }, units: [{ n: 3, m2: 68 }, { n: 4, m2: 58 }, { n: 5, m2: 79 }] },
    { id: 'attic', t: { en: 'Attic loft', it: 'Loft mansardato' }, d: { en: 'Cigar lounge', it: 'Cigar lounge' }, units: [{ n: 6, m2: 102, r: { en: 'three rooms, two bedrooms', it: 'trilocale, due camere' } }] },
  ],
  total: 474, // 83+84+68+58+79+102
  extras: { en: ['Spa suites', 'Private wine cellars', 'Entrance salon', 'Meeting & working lounge', 'Cigar lounge', 'Art salon', 'Six residences, adults only'], it: ['Suite spa', 'Cantine private', 'Salone d’ingresso', 'Lounge per riunioni e lavoro', 'Cigar lounge', 'Salotto d’arte', 'Sei residenze, solo adulti'] },
  archive: { en: 'Technical archive — restoration plans, material dossiers, heritage certifications — available on request.', it: 'Archivio tecnico — piani di restauro, dossier dei materiali, certificazioni — disponibile su richiesta.' },
  imgs: [148, 154, 158, 152, 156, 157, 143, 151, 144, 145, 147, 149, 150, 153, 155, 146],
}

export const SARDEGNA = { name: 'Waterfront Sardegna', place: 'Sardinia · Italy', note: { en: 'In preparation', it: 'In preparazione' } }

// Same project at different stages — verified visually from his photos.
export const PAIRS = [
  { a: 30, b: 5, t: { en: 'Hillside terraces — sketch to render', it: 'Terrazze in collina — dallo schizzo al render' } },
  { a: 33, b: 82, t: { en: 'Curved building — site to render', it: 'Edificio curvo — dal cantiere al render' } },
  { a: 26, b: 128, t: { en: 'Atrium — render to reality', it: 'Atrio — dal render alla realtà' } },
  { a: 17, b: 127, t: { en: 'Tensile canopy — construction to built', it: 'Copertura tesa — dal cantiere all’opera' } },
]

// Gallery groups (ids). Captions must stay generic — the site gives no names/years for these.
export const WORKS = {
  render: [4, 3, 84, 40, 112, 78, 82, 101, 102, 111, 103, 98, 89, 83, 107, 124, 125, 90, 91, 97, 99, 108, 113, 8, 10, 11, 12, 13, 18, 20, 24, 25, 26, 34, 42, 43, 45, 46, 47, 49, 50, 53, 57, 62, 65, 73, 88, 136].filter(Boolean),
  sketch: [6, 21, 23, 29, 31, 32, 35, 36, 37, 39, 59, 64, 79, 80, 86, 87, 93, 100, 106, 110, 44],
  build: [16, 17, 19, 22, 27, 33, 51, 66, 67, 71, 74, 75, 81, 94, 96, 105, 127, 128],
  israel: [{ t: { en: 'Modern Israeli living space', it: 'Spazio abitativo israeliano moderno' }, p: 'Savyon, Israel' }, { t: { en: 'Modern “dream house”', it: '“Casa dei sogni” moderna' }, p: 'Savyon, Israel' }, { t: { en: 'Conceptual residential project', it: 'Progetto residenziale concettuale' }, p: 'Zikhron Ya’akov, Israel' }],
}

export const CLUB = {
  lead: { en: 'YTS Group connects people around architecture and Italy — sailing, wine & business evenings and real-estate conferences.', it: 'YTS Group riunisce persone attorno all’architettura e all’Italia — vela, serate wine & business e conferenze immobiliari.' },
  items: [
    { t: { en: 'Business sailing', it: 'Business sailing' }, p: 'Marina Herzliya' },
    { t: { en: 'Wine & business', it: 'Wine & business' }, p: 'Modi’in' },
    { t: { en: 'Real-estate conference', it: 'Conferenza immobiliare' }, p: 'Rome' },
    { t: { en: 'Flotilla in Sardinia', it: 'Flottiglia in Sardegna' }, p: 'Olbia' },
  ],
}
