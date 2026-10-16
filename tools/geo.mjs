// tools/geo.mjs — trae la geografía REAL de Nicaragua (geoBoundaries) y la convierte en SVG
// listo para pegar dentro de una sección.
//
// Por qué existe: un mapa nacional inventado se nota. Con los límites reales de los 15
// departamentos y las 2 regiones autónomas, el prototipo pasa de "maqueta" a "esto ya existe".
// Las secciones son HTML estático sin JavaScript, así que no pueden cargar GeoJSON: hay que
// hornear los `d` de los <path> en el marcado. Eso es lo que hace este script.
//
// Salida (todo en assets/):
//   geo-nicaragua.json           viewBox + 17 unidades con d, centro y bbox  (para consultar)
//   geo-nicaragua-paths.html     fragmento <path> listo para pegar
//   geo-puerto-cabezas.json      el municipio del evento + vecinos, ampliado
//   geo-puerto-cabezas-paths.html
//
// Uso: node tools/geo.mjs [epsilon]      (epsilon grande = menos puntos = más ligero)
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const CACHE = join(ROOT, 'tools', 'cache');
const API = 'https://www.geoboundaries.org/api/current/gbOpen/NIC';
const EPS = Number(process.argv[2] || 0.7); // en unidades del viewBox (1000 de ancho)
const W = 1000;

async function geo(level) {
  const f = join(CACHE, `NIC-${level}.json`);
  if (existsSync(f)) return JSON.parse(await readFile(f, 'utf8'));
  const meta = await (await fetch(`${API}/${level}/`)).json();
  const url = meta.simplifiedGeometryGeoJSON || meta.gjDownloadURL;
  const gj = await (await fetch(url)).json();
  await mkdir(CACHE, { recursive: true });
  await writeFile(f, JSON.stringify(gj), 'utf8');
  console.log(`  bajado ${level}: ${gj.features.length} features`);
  return gj;
}

// --- Ramer–Douglas–Peucker: quita puntos que no cambian la silueta ---
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1e-9;
  let idx = -1;
  let max = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [a, b];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

const rings = (geom) =>
  geom.type === 'Polygon' ? geom.coordinates : geom.coordinates.flat(1);

function project(geoJson, { pad = 8, zoom = null, eps = EPS } = {}) {
  const lat0 = 12.9;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const raw = geoJson.features.map((f) => ({
    name: f.properties.shapeName,
    geom: f.geometry,
  }));

  let pts = raw.flatMap((r) => rings(r.geom).flat());
  if (zoom) pts = pts.filter(([x, y]) => x >= zoom[0] && x <= zoom[2] && y >= zoom[1] && y <= zoom[3]);
  const xs = pts.map(([x]) => x * k);
  const ys = pts.map(([, y]) => y);
  const bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const scale = (W - pad * 2) / (bb[2] - bb[0]);
  const H = Math.round((bb[3] - bb[1]) * scale + pad * 2);
  const px = (x) => +( (x * k - bb[0]) * scale + pad ).toFixed(1);
  const py = (y) => +( (bb[3] - y) * scale + pad ).toFixed(1);

  const out = [];
  for (const r of raw) {
    let d = '';
    let n = 0;
    for (const ring of rings(r.geom)) {
      let pts = ring.map(([x, y]) => [px(x), py(y)]);
      // Los anillos GeoJSON vienen cerrados (el primer punto repite el último). Eso hace que la
      // "cuerda" del RDP sea un punto y todas las distancias den 0: la silueta colapsaba a 2 puntos.
      // Se abre el anillo y se cierra con Z.
      if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
        pts = pts.slice(0, -1);
      }
      // Un trazo casi recto puede legítimamente quedar en 2 puntos; se reintenta más fino antes
      // de darlo por perdido (islas pequeñas, cayos).
      let simplified = pts;
      for (const e of [eps, eps / 4, eps / 16, 0]) {
        const s = e === 0 ? pts : rdp(pts, e);
        if (s.length >= 3) { simplified = s; break; }
      }
      if (simplified.length < 3) continue;
      d += `M${simplified.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
      n += simplified.length;
    }
    if (!d) continue;
    const all = rings(r.geom).flat().map(([x, y]) => [px(x), py(y)]);
    const xsa = all.map((p) => p[0]);
    const ysa = all.map((p) => p[1]);
    const x0 = Math.min(...xsa), x1 = Math.max(...xsa);
    const y0 = Math.min(...ysa), y1 = Math.max(...ysa);
    out.push({
      name: fixName(r.name),
      id: 'ni-' + fixName(r.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      d,
      cx: +((x0 + x1) / 2).toFixed(1),
      cy: +((y0 + y1) / 2).toFixed(1),
      box: [x0, y0, x1, y1].map((v) => +v.toFixed(1)),
      pts: n,
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return { viewBox: `0 0 ${W} ${H}`, units: out, project: (lon, lat) => [px(lon), py(lat)] };
}

const frag = (geo, stroke = 'currentColor') =>
  geo.units
    .map((u) => `      <path class="d" id="${u.id}" d="${u.d}"/>`)
    .join('\n');

// geoBoundaries es un dataset académico: mezcla inglés, erratas y sufijos. El prototipo se
// muestra al jurado, así que se corrige al nombre oficial en español.
const NIC_NAMES = {
  'North Carribean Coast Autonomous Region': 'RACCN',
  'South Atlantic Autonomous Region': 'RACCS',
  Leon: 'León',
  'Rio San Juan': 'Río San Juan',
  'Jinotega (Departamento)': 'Jinotega',
  'Matagalpa (Departemento)': 'Matagalpa',
};
const fixName = (n) =>
  NIC_NAMES[n] || n.replace(/^Municipio\s+/i, '').trim();

// ---------------------------------------------------------------- nacional
console.log('Nicaragua · ADM1 (departamentos + regiones autónomas)');
const adm1 = await geo('ADM1');
const nat = project(adm1);
const places = {
  managua: nat.project(-86.2514, 12.1364).map((v) => +v.toFixed(1)),
  bilwi: nat.project(-83.3864, 14.0283).map((v) => +v.toFixed(1)),
  bluefields: nat.project(-83.7635, 12.0137).map((v) => +v.toFixed(1)),
  leon: nat.project(-86.8780, 12.4349).map((v) => +v.toFixed(1)),
};
const natJson = { viewBox: nat.viewBox, places, units: nat.units.map(({ d, ...r }) => r) };
await writeFile(join(ROOT, 'assets', 'geo-nicaragua.json'), JSON.stringify(natJson, null, 1), 'utf8');
await writeFile(
  join(ROOT, 'assets', 'geo-nicaragua-paths.html'),
  `<!-- Generado por tools/geo.mjs · límites reales geoBoundaries (gbOpen NIC ADM1) ·\n     viewBox="${nat.viewBox}" · ${nat.units.length} unidades · no editar a mano -->\n    <g class="ni">\n${frag(nat)}\n    </g>\n`,
  'utf8',
);
console.log(
  `  viewBox ${nat.viewBox} · ${nat.units.length} unidades · ` +
    `${nat.units.reduce((s, u) => s + u.pts, 0)} puntos`,
);
console.log('  ' + nat.units.map((u) => u.name).join(' · '));

// La escalera de escalas dibuja el país cuatro veces a tamaños distintos. A 160 px de ancho,
// 26 KB de detalle son invisibles: se genera una silueta gruesa solo para las miniaturas.
const coarse = project(adm1, { eps: 3.4 });
await writeFile(
  join(ROOT, 'assets', 'geo-nicaragua-coarse.html'),
  `<!-- Generado por tools/geo.mjs · silueta gruesa para miniaturas (eps 3.4) ·\n     viewBox="${coarse.viewBox}" · no editar a mano -->\n    <g class="ni ni--coarse">\n${frag(coarse)}\n    </g>\n`,
  'utf8',
);
console.log(
  `  silueta gruesa: ${coarse.units.reduce((s, u) => s + u.pts, 0)} puntos · viewBox ${coarse.viewBox}`,
);

// Región y departamento sueltos, para el nivel intermedio de la escalera.
const single = {};
for (const u of nat.units) {
  single[u.id] = { name: u.name, d: u.d, box: u.box, cx: u.cx, cy: u.cy };
}
await writeFile(join(ROOT, 'assets', 'geo-unidades.json'), JSON.stringify(single), 'utf8');
const raccn = nat.units.find((u) => u.name === 'RACCN');
console.log(
  `  RACCN sola: ${raccn.pts} puntos · bbox ${raccn.box.map((v) => Math.round(v)).join(',')}`,
);

// ------------------------------------------------------- municipio del evento
console.log('\nPuerto Cabezas · ADM2 (el municipio del evento + vecinos)');
const adm2 = await geo('ADM2');
const bbox = [-85.6, 13.0, -82.6, 15.1]; // costa caribe norte
const sub = {
  type: 'FeatureCollection',
  features: adm2.features.filter((f) => {
    const ring = rings(f.geometry).flat();
    const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
    const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    return cx >= bbox[0] && cx <= bbox[2] && cy >= bbox[1] && cy <= bbox[3];
  }),
};
const mun = project(sub);
const prio = mun.units.find((u) => /puerto cabezas|bilwi/i.test(u.name));
const munJson = {
  viewBox: mun.viewBox,
  priority: prio ? prio.id : null,
  units: mun.units.map(({ d, ...r }) => r),
};
await writeFile(join(ROOT, 'assets', 'geo-puerto-cabezas.json'), JSON.stringify(munJson, null, 1), 'utf8');
await writeFile(
  join(ROOT, 'assets', 'geo-puerto-cabezas-paths.html'),
  `<!-- Generado por tools/geo.mjs · geoBoundaries gbOpen NIC ADM2 (recorte costa caribe norte) ·\n     viewBox="${mun.viewBox}" · municipio del evento: ${prio ? prio.name : '?'} (id="${prio ? prio.id : '?'}") -->\n    <g class="mun">\n${frag(mun)}\n    </g>\n`,
  'utf8',
);
console.log(`  viewBox ${mun.viewBox} · ${mun.units.length} municipios`);
console.log('  ' + mun.units.map((u) => u.name).join(' · '));
