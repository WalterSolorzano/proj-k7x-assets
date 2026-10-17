// tools/gen-latam-paths.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const d = JSON.parse(readFileSync('assets/geo-latam.json', 'utf8'));
const svgPaths = d.paths
  .map(
    (p) =>
      `            <path id="latam-${p.id.toLowerCase()}" class="sec-07-latam__country ${
        ['PAN', 'NIC', 'COL', 'CRI', 'HND'].includes(p.id) ? 'is-active' : ''
      }" d="${p.d}" data-name="${p.name}"></path>`,
  )
  .join('\n');

writeFileSync('secciones/07-latam/paths.html', svgPaths, 'utf8');
console.log('paths.html generado');
