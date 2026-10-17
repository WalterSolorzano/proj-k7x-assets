// tools/geo-latam.mjs
import { writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const cacheFile = join(ROOT, 'tools', 'cache', 'countries-latam.json');

async function main() {
  const gj = JSON.parse(await readFile(cacheFile, 'utf8'));

  const minLon = -118, maxLon = -34;
  const minLat = -56, maxLat = 33;
  const W = 1000, H = 900;

  function project(lon, lat) {
    const x = ((lon - minLon) / (maxLon - minLon)) * W;
    const y = ((maxLat - lat) / (maxLat - minLat)) * H;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }

  const paths = [];
  const centers = {};

  for (const feat of gj.features) {
    const id = feat.id;
    const name = feat.properties.name;
    const geom = feat.geometry;

    let rawRings = [];
    if (geom.type === 'Polygon') {
      rawRings = geom.coordinates;
    } else if (geom.type === 'MultiPolygon') {
      for (const p of geom.coordinates) {
        for (const r of p) {
          rawRings.push(r);
        }
      }
    }

    let d = '';
    let sumX = 0, sumY = 0, count = 0;

    for (const ring of rawRings) {
      if (!Array.isArray(ring) || ring.length < 3) continue;
      const proj = ring.map(pt => project(pt[0], pt[1]));
      d += `M${proj[0][0]} ${proj[0][1]}` + proj.slice(1).map(p => `L${p[0]} ${p[1]}`).join('') + 'Z ';
      for (const p of proj) {
        sumX += p[0];
        sumY += p[1];
        count++;
      }
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

  console.log(`✓ assets/geo-latam.json creado con éxito (${paths.length} países)`);
  console.log('Centros calculados:', { PAN: centers['PAN'], NIC: centers['NIC'], COL: centers['COL'], MEX: centers['MEX'] });
}

main().catch(console.error);
