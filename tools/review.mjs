// tools/review.mjs — captura por franjas una página ENSAMBLADA (paginas/) para revisar el ensamblado.
// Uso: node tools/review.mjs 01-plataforma 1440 1400
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const [page, w, chunk] = [process.argv[2] || '01-plataforma', Number(process.argv[3] || 1440), Number(process.argv[4] || 1400)];
const OUT = join(ROOT, 'presentacion', '_review', page);
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const p = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(join(ROOT, 'paginas', `${page}.html`)).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts?.ready);
await p.waitForTimeout(600);

const h = await p.evaluate(() => document.documentElement.scrollHeight);
console.log(`${page}: ${w}x${h}  → ${Math.ceil(h / chunk)} franjas`);

for (let i = 0, y = 0; y < h; i++, y += chunk) {
  await p.screenshot({
    path: join(OUT, `${i + 1}.png`),
    fullPage: true,
    clip: { x: 0, y, width: w, height: Math.min(chunk, h - y) },
  });
}
await browser.close();
