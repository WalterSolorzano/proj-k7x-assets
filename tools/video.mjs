// tools/video.mjs — Graba un video de la UI desplazándose, con animaciones.
// Uso: npm run video [-- --dir mockups --out presentacion/video --duration 8 --mp4]
import { chromium } from 'playwright';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
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

const DIR = pickDir();
const OUT = val('out', 'presentacion/video');
const WIDTH = Number(val('width', 1440));
const HEIGHT = Number(val('height', 900));
const DURATION = Number(val('duration', 8)) * 1000; // ms de desplazamiento por pantalla
const PAUSE_TOP = Number(val('pause-top', 1.2)) * 1000;
const PAUSE_BOTTOM = Number(val('pause-bottom', 1.6)) * 1000;
const ANIM = !flag('no-anim');
const MP4 = flag('mp4');

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

const URL_ARG = val('url', null);
let targets = [];
if (URL_ARG) {
  targets = String(URL_ARG)
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) => ({ name: slug(u), url: u, ref: u }));
} else {
  const files = (await walk(resolve(ROOT, DIR))).sort();
  if (!files.length) {
    console.error(`No hay .html en ${DIR}/ ni en paginas/. Nada que grabar.`);
    process.exit(1);
  }
  targets = files.map((f) => ({ name: f.replace(/\.html$/, '').replace(/[\\/]/g, '-'), url: pathToFileURL(join(ROOT, DIR, f)).href, ref: `${DIR}/${f}` }));
}

const outDir = resolve(ROOT, OUT);
const tmpDir = resolve(ROOT, '.tmp-video');
await mkdir(outDir, { recursive: true });
await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });

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

const smoothScroll = (page, ms) =>
  page.evaluate(async (ms) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 4) {
      await new Promise((r) => setTimeout(r, ms));
      return;
    }
    const t0 = performance.now();
    await new Promise((res) => {
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        window.scrollTo(0, max * e);
        t < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
  }, ms);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  recordVideo: { dir: tmpDir, size: { width: WIDTH, height: HEIGHT } },
});

const made = [];
for (const [i, t] of targets.entries()) {
  const name = `${String(i + 1).padStart(2, '0')}-${t.name}`;
  const page = await context.newPage();
  const video = page.video();

  await page.goto(t.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
  if (ANIM) {
    await page.addStyleTag({ path: join(ROOT, 'tools', 'anim.css') });
    await page.addScriptTag({ content: revealScript });
  }
  await page.waitForTimeout(PAUSE_TOP);
  await page.mouse.move(WIDTH * 0.5, HEIGHT * 0.45, { steps: 14 });
  await page.waitForTimeout(300);
  await smoothScroll(page, DURATION);
  await page.waitForTimeout(PAUSE_BOTTOM);

  await page.close();
  const dest = join(outDir, `${name}.webm`);
  await video.saveAs(dest);
  made.push(`${name}.webm`);
  console.log(`✓ ${OUT}/${name}.webm`);
}

await context.close();
await browser.close();
await rm(tmpDir, { recursive: true, force: true });

if (MP4) {
  let ffmpeg;
  try {
    ffmpeg = (await import('ffmpeg-static')).default;
  } catch {
    ffmpeg = 'ffmpeg';
  }
  for (const f of made) {
    const src = join(outDir, f);
    const dst = src.replace(/\.webm$/, '.mp4');
    try {
      await execFileAsync(ffmpeg, ['-y', '-i', src, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst]);
      console.log(`✓ ${OUT}/${f.replace(/\.webm$/, '.mp4')}`);
    } catch (e) {
      console.warn(`  ! No se pudo convertir a mp4 (${f}): falta ffmpeg. Deja el .webm o instala ffmpeg-static.`);
    }
  }
}

console.log(`\n${made.length} videos → ${OUT}/`);
