// tools/geo-latam.mjs
import { writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const cacheFile = join(ROOT, 'tools', 'cache', 'countries-latam.json');

async function main() {
  const gj = JSON.parse(await readFile(cacheFile, 'utf8'));

  // Bounding box LatAm:
  // Lon: -118 a -34
  // Lat: -56 a 33
  const minLon = -118, maxLon = -34;
  const minLat = -56, maxLat = 33;
  const W = 1000, H = 900;

  function project(lon, lat) {
    const x = ((lon - minLon) / (maxLon - minLon)) * W;
    const y = ((maxLat - lat) / (maxLat - minLat)) * H;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }

  function rdp(pts, eps = 0.8) {
    if (pts.length < 3) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1e-9;
    let idx = -1, max = -1;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max <= eps) return [a, b];
    return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
  }

  const paths = [];
  const centers = {};

  for (const feat of gj.features) {
    const id = feat.id;
    const name = feat.properties.name;
    const geom = feat.geometry;

    let rings = [];
    if (geom.type === 'Polygon') {
      // coordinates es [ [ [lon, lat], ... ] ]
      rings = geom.coordinates;
    } else if (geom.type === 'MultiPolygon') {
      // coordinates es [ [ [ [lon, lat], ... ] ] ]
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          rings.push(ring);
        }
      }
    }

    let d = '';
    let sumX = 0, sumY = 0, count = 0;

    for (const ring of rings) {
      if (!Array.isArray(ring) || ring.length < 3) continue;
      // Comprobar que ring[0] es un par [lon, lat]
      if (typeof ring[0][0] !== 'number') continue;
      const proj = ring.map(([lon, lat]) => project(lon, lat));
      const simp = rdp(proj, 0.9);
      if (simp.length < 3) continue;
      d += `M${simp[0][0]} ${simp[0][1]}` + simp.slice(1).map(p => `L${p[0]} ${p[1]}`).join('') + 'Z ';
      for (const pt of simp) { sumX += pt[0]; sumY += pt[1]; count++; }
    }

    if (count > 0) {
      centers[id] = [Math.round(sumX / count), Math.round(sumY / count)];
    }
    paths.push({ id, name, d: d.trim() });
  }

  await writeFile(
    join(ROOT, 'assets', 'geo-latam.json'),
    JSON.stringify({ viewBox: `0 0 ${W} ${H}`, centers, paths }, null, 2),
    'utf8'
  );

  console.log(`✓ assets/geo-latam.json generado con ${paths.length} países.`);
  console.log('Centros clave:', { PAN: centers['PAN'], NIC: centers['NIC'], COL: centers['COL'], MEX: centers['MEX'] });
}

main().catch(console.error);
