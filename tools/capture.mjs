// tools/capture.mjs — Capturas de todas las pantallas a presentacion/
// Uso: npm run capture [-- --dir paginas --out presentacion --width 1440 --height 900 --mobile]
//      npm run capture -- --url http://localhost:3000,http://localhost:3000/precios
import { chromium } from 'playwright';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const val = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
};
const flag = (name) => process.argv.includes(`--${name}`);

function pickDir() {
  const explicit = val('dir', null);
  if (explicit) return explicit;
  for (const d of ['paginas', 'mockups']) {
    const p = resolve(ROOT, d);
    if (existsSync(p) && readdirSync(p).some((f) => f.endsWith('.html'))) return d;
  }
  return 'mockups';
}

const PRESETS = { '16x9': [1920, 1080], '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], wide: [2560, 1080] };
const PRESET = val('preset', null);
const [dw, dh] = (PRESET && PRESETS[PRESET]) || [1440, 900];

const OUT = val('out', 'presentacion');
const WIDTH = Number(val('width', dw));
const HEIGHT = Number(val('height', dh));
const SCALE = Number(val('scale', 1)); // 2 => stills retina (3840x2160) para hacer zoom en edición
const FIT = val('fit', 'page'); // page = pantalla completa | viewport = recorte 16:9
const MOBILE = flag('mobile');
const URL_ARG = val('url', null);

async function walk(dir, base = '') {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(join(dir, e.name), rel)));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const slug = (s) => s.replace(/\.html$/, '').replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

let targets = [];
if (URL_ARG) {
  targets = String(URL_ARG)
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) => ({ name: slug(u), url: u, ref: u }));
} else {
  const DIR = pickDir();
  const files = (await walk(resolve(ROOT, DIR))).sort();
  if (!files.length) {
    console.error(`No hay .html en ${DIR}/ ni en paginas/. Nada que capturar.`);
    process.exit(1);
  }
  targets = files.map((f) => ({ name: f.replace(/\.html$/, '').replace(/[\\/]/g, '-'), url: pathToFileURL(join(ROOT, DIR, f)).href, ref: `${DIR}/${f}` }));
}

const outDir = resolve(ROOT, OUT);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: SCALE });

const made = [];
const shoot = async (t, suffix = '') => {
  const name = `${t.name}${suffix}`;
  await page.goto(t.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: FIT === 'page' });
  made.push({ name: `${name}.png`, ref: t.ref });
  console.log(`✓ ${OUT}/${name}.png`);
};

for (const [i, t] of targets.entries()) {
  await shoot({ ...t, name: `${String(i + 1).padStart(2, '0')}-${t.name}` });
}

if (MOBILE) {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [i, t] of targets.entries()) {
    await shoot({ ...t, name: `${String(i + 1).padStart(2, '0')}-${t.name}` }, '-movil');
  }
}

await browser.close();

const title = 'Rallylatam';
const md = [
  `# ${title} — presentación`,
  '',
  `${made.length} capturas generadas automáticamente. Vista local: \`npm run serve\`.`,
  '',
  ...made.map((m) => `- ![${m.ref}](./${OUT}/${m.name})  \`${m.ref}\``),
  '',
].join('\n');
await writeFile(join(ROOT, 'presentacion.md'), md, 'utf8');
console.log(`\n${made.length} capturas → ${OUT}/  ·  galería → presentacion.md`);
