// tools/geo-panama.mjs — Proyecta las 13 provincias y comarcas de Panamá a SVG con RDP robusto
import { writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const CACHE = join(ROOT, 'tools', 'cache');
const EPS = 0.6;
const W = 1000;

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0;
  let index = 0;
  const end = pts.length - 1;
  const a = pts[0];
  const b = pts[end];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;

  for (let i = 1; i < end; i++) {
    const p = pts[i];
    let d;
    if (lenSq === 0) {
      d = Math.hypot(p[0] - a[0], p[1] - a[1]);
    } else {
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq));
      const projX = a[0] + t * dx;
      const projY = a[1] + t * dy;
      d = Math.hypot(p[0] - projX, p[1] - projY);
    }
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > eps) {
    const rec1 = rdp(pts.slice(0, index + 1), eps);
    const rec2 = rdp(pts.slice(index), eps);
    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [a, b];
  }
}

function extractRings(geom) {
  if (geom.type === 'Polygon') return geom.coordinates;
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat(1);
  return [];
}

async function main() {
  const geoJson = JSON.parse(await readFile(join(CACHE, 'PAN-ADM1.json'), 'utf8'));
  const lat0 = 8.5;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const pad = 16;

  const raw = geoJson.features.map((f) => ({
    name: f.properties.shapeName,
    geom: f.geometry,
  }));

  const allPts = [];
  for (const r of raw) {
    for (const ring of extractRings(r.geom)) {
      for (const pt of ring) {
        allPts.push(pt);
      }
    }
  }

  const xs = allPts.map(([x]) => x * k);
  const ys = allPts.map(([, y]) => y);
  const bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const scale = (W - pad * 2) / (bb[2] - bb[0]);
  const H = Math.round((bb[3] - bb[1]) * scale + pad * 2);
  const px = (x) => +((x * k - bb[0]) * scale + pad).toFixed(1);
  const py = (y) => +((bb[3] - y) * scale + pad).toFixed(1);

  const units = [];
  let pathsHtml = '';

  for (const r of raw) {
    let d = '';
    const allUnitPts = [];
    const rings = extractRings(r.geom);

    for (const ring of rings) {
      const projected = ring.map(([x, y]) => [px(x), py(y)]);
      const s = rdp(projected, EPS);
      if (s.length < 3) continue;
      allUnitPts.push(...s);
      d += `M${s[0][0]} ${s[0][1]}` + s.slice(1).map((p) => `L${p[0]} ${p[1]}`).join('') + 'Z ';
    }
    if (!d.trim()) continue;

    const uxs = allUnitPts.map(([x]) => x);
    const uys = allUnitPts.map(([, y]) => y);
    const center = [
      +((Math.min(...uxs) + Math.max(...uxs)) / 2).toFixed(1),
      +((Math.min(...uys) + Math.max(...uys)) / 2).toFixed(1),
    ];

    const slug = r.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const isColon = slug.includes('colon');
    const isPanama = slug === 'provincia-de-panama' || slug.includes('panama-oeste');
    const alertAttr = isColon ? ' data-alerta="roja"' : isPanama ? ' data-alerta="amarilla"' : '';

    units.push({ name: r.name, slug, center, d: d.trim(), alert: isColon ? 'roja' : (isPanama ? 'amarilla' : 'normal') });
    pathsHtml += `  <path id="pan-${slug}" class="pan-provincia" d="${d.trim()}" data-nombre="${r.name}"${alertAttr}/>\n`;
  }

  const outJson = { viewBox: `0 0 ${W} ${H}`, width: W, height: H, units };
  await writeFile(join(ROOT, 'assets', 'geo-panama.json'), JSON.stringify(outJson, null, 2), 'utf8');
  await writeFile(join(ROOT, 'assets', 'geo-panama-paths.html'), pathsHtml, 'utf8');

  console.log(`Panamá generado con éxito: viewBox 0 0 ${W} ${H}, ${units.length} provincias/comarcas.`);
}

main().catch(console.error);
