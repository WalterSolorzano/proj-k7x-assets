// tools/video.mjs — Graba material de rodaje (footage) de un recurso visual.
// No es "un video final": son clips de movimiento + stills para editar dentro del video del pitch.
//
// Uso:
//   npm run video                                   # scroll suave de cada pantalla
//   npm run video -- --preset 9x16 --motion zoom     # vertical, con zoom cinematográfico
//   npm run video -- --guion guion.json              # varias tomas definidas a mano
//   npm run video -- --stills                        # además un PNG por toma
//
// Tomas: scroll | zoom | pan | static
// Presets: 16x9 (1920x1080) | 9x16 (1080x1920) | 4x5 | 1x1 | wide (2560x1080)
import { chromium } from 'playwright';
import { mkdir, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const PRESETS = {
  '16x9': [1920, 1080],
  '9x16': [1080, 1920],
  '4x5': [1080, 1350],
  '1x1': [1080, 1080],
  wide: [2560, 1080],
};
const MOTIONS = ['scroll', 'zoom', 'pan', 'static'];

const val = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
};
const flag = (name) => process.argv.includes(`--${name}`);

const OUT = val('out', 'presentacion/video');
const PRESET = val('preset', '16x9');
const [pw, ph] = PRESETS[PRESET] || PRESETS['16x9'];
const WIDTH = Number(val('width', pw));
const HEIGHT = Number(val('height', ph));
const DURATION = Number(val('duration', 8)) * 1000;
const PAUSE_TOP = Number(val('pause-top', 1.2)) * 1000;
const PAUSE_BOTTOM = Number(val('pause-bottom', 1.6)) * 1000;
const MOTION = val('motion', 'scroll');
const ANIM = !flag('no-anim');
const STILLS = flag('stills');
const MP4 = flag('mp4');
const GUION = val('guion', null);
const URL_ARG = val('url', null);

if (!MOTIONS.includes(MOTION)) {
  console.error(`Toma inválida: ${MOTION}. Opciones: ${MOTIONS.join(', ')}`);
  process.exit(1);
}

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

function pickDir() {
  const explicit = val('dir', null);
  if (explicit) return explicit;
  for (const d of ['paginas', 'mockups']) {
    const p = resolve(ROOT, d);
    if (existsSync(p) && readdirSync(p).some((f) => f.endsWith('.html'))) return d;
  }
  return 'mockups';
}

const slug = (s) =>
  s.replace(/\.html$/, '').replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

/** Convierte un target (ruta relativa o URL) en algo cargable por Playwright. */
const asUrl = (t) => (/^https?:\/\//.test(t) ? t : pathToFileURL(resolve(ROOT, t)).href);

// --- lista de tomas -------------------------------------------------------
let shots = [];

if (GUION) {
  const g = JSON.parse(await readFile(resolve(ROOT, GUION), 'utf8'));
  shots = (g.shots || []).map((s, i) => ({
    name: s.name || `${String(i + 1).padStart(2, '0')}-toma`,
    url: asUrl(s.target),
    ref: s.target,
    motion: s.motion || 'scroll',
    duration: (s.duration ?? Number(val('duration', 8))) * 1000,
    pauseTop: (s.pauseTop ?? 1.2) * 1000,
    pauseBottom: (s.pauseBottom ?? 1.6) * 1000,
  }));
} else if (URL_ARG) {
  shots = String(URL_ARG)
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u, i) => ({ name: `${String(i + 1).padStart(2, '0')}-${slug(u)}`, url: u, ref: u, motion: MOTION, duration: DURATION, pauseTop: PAUSE_TOP, pauseBottom: PAUSE_BOTTOM }));
} else {
  const DIR = pickDir();
  const files = (await walk(resolve(ROOT, DIR))).sort();
  if (!files.length) {
    console.error(`No hay .html en ${DIR}/ ni en paginas/. Nada que grabar.`);
    process.exit(1);
  }
  shots = files.map((f, i) => ({
    name: `${String(i + 1).padStart(2, '0')}-${f.replace(/\.html$/, '').replace(/[\\/]/g, '-')}`,
    url: asUrl(`${DIR}/${f}`),
    ref: `${DIR}/${f}`,
    motion: MOTION,
    duration: DURATION,
    pauseTop: PAUSE_TOP,
    pauseBottom: PAUSE_BOTTOM,
  }));
}

if (!shots.length) {
  console.error('No hay tomas que grabar.');
  process.exit(1);
}

// --- animaciones inyectadas ----------------------------------------------
const revealScript = `(() => {
  const sel = 'section, article, .card, .reveal, [data-anim], header, footer, h1, h2, h3, li, .hero';
  const nodes = [...new Set([...document.querySelectorAll(sel)])]
    .filter(n => n.getBoundingClientRect().height > 36 && !n.closest('.no-anim'));
  nodes.forEach((n, i) => {
    n.setAttribute('data-rally-anim', '');
    n.style.transitionDelay = ((i % 6) * 70) + 'ms';
  });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  nodes.forEach(n => io.observe(n));
})();`;

const EASE = 'const e = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;';

const MOVES = {
  scroll: (page, ms) =>
    page.evaluate(
      async (ms) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 4) { await new Promise((r) => setTimeout(r, ms)); return; }
        const t0 = performance.now();
        await new Promise((res) => {
          const step = (now) => {
            const t = Math.min(1, (now - t0) / ms);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            window.scrollTo(0, max * e);
            t < 1 ? requestAnimationFrame(step) : res();
          };
          requestAnimationFrame(step);
        });
      },
      ms,
    ),
  zoom: (page, ms) =>
    page.evaluate(
      async (ms) => {
        const el = document.body;
        el.style.transformOrigin = '50% 38%';
        const t0 = performance.now();
        await new Promise((res) => {
          const step = (now) => {
            const t = Math.min(1, (now - t0) / ms);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            el.style.transform = `scale(${1 + 0.14 * e})`;
            t < 1 ? requestAnimationFrame(step) : res();
          };
          requestAnimationFrame(step);
        });
      },
      ms,
    ),
  pan: (page, ms) =>
    page.evaluate(
      async (ms) => {
        const el = document.body;
        el.style.transformOrigin = '50% 50%';
        const t0 = performance.now();
        await new Promise((res) => {
          const step = (now) => {
            const t = Math.min(1, (now - t0) / ms);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            el.style.transform = `translateX(${-5 * e}vw) scale(1.08)`;
            t < 1 ? requestAnimationFrame(step) : res();
          };
          requestAnimationFrame(step);
        });
      },
      ms,
    ),
  static: (page, ms) => page.waitForTimeout(ms),
};

// --- grabación ------------------------------------------------------------
const outDir = resolve(ROOT, OUT);
const tmpDir = resolve(ROOT, '.tmp-video');
await mkdir(outDir, { recursive: true });
await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  recordVideo: { dir: tmpDir, size: { width: WIDTH, height: HEIGHT } },
});

const made = [];
for (const shot of shots) {
  const page = await context.newPage();
  const video = page.video();

  await page.goto(shot.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
  if (ANIM) {
    await page.addStyleTag({ path: join(ROOT, 'tools', 'anim.css') });
    await page.addScriptTag({ content: revealScript });
  }
  await page.waitForTimeout(shot.pauseTop);

  if (STILLS) {
    await page.screenshot({ path: join(outDir, `${shot.name}.png`) });
  }

  await page.mouse.move(WIDTH * 0.5, HEIGHT * 0.45, { steps: 14 });
  await page.waitForTimeout(250);
  await MOVES[shot.motion](page, shot.duration);
  await page.waitForTimeout(shot.pauseBottom);

  await page.close();
  await video.saveAs(join(outDir, `${shot.name}.webm`));
  made.push({ name: `${shot.name}.webm`, motion: shot.motion, ref: shot.ref });
  console.log(`✓ ${OUT}/${shot.name}.webm  (${shot.motion})`);
}

await context.close();
await browser.close();
await rm(tmpDir, { recursive: true, force: true });

// --- conversión a mp4 (opcional) -----------------------------------------
if (MP4) {
  let ffmpeg;
  try {
    ffmpeg = (await import('ffmpeg-static')).default;
  } catch {
    ffmpeg = 'ffmpeg';
  }
  for (const f of made) {
    const src = join(outDir, f.name);
    const dst = src.replace(/\.webm$/, '.mp4');
    try {
      await execFileAsync(ffmpeg, ['-y', '-i', src, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst]);
      console.log(`✓ ${OUT}/${f.name.replace(/\.webm$/, '.mp4')}`);
    } catch {
      console.warn(`  ! No se pudo convertir ${f.name}: falta ffmpeg.`);
    }
  }
}

// --- índice de material ---------------------------------------------------
const md = [
  '# Material de rodaje',
  '',
  `${made.length} tomas · preset ${PRESET} (${WIDTH}x${HEIGHT}) · ${MP4 ? 'webm + mp4' : 'webm'}${STILLS ? ' + stills' : ''}`,
  '',
  ...made.map((m) => `- \`${OUT}/${m.name}\` — toma **${m.motion}** de \`${m.ref}\``),
  '',
].join('\n');
await writeFile(join(outDir, 'material.md'), md, 'utf8');

console.log(`\n${made.length} tomas → ${OUT}/  ·  índice → ${OUT}/material.md`);
