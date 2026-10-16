// tools/capture-mockups.mjs — stills de alta calidad del LOOK DE REFERENCIA de SITRE.
// Salida en presentacion/ (deviceScaleFactor 2, tema `institucional` congelado en el propio mockup):
//   10-plataforma.png → mockups/10-plataforma.html a 1440 px  (plataforma SINAPRED, escritorio)
//   11-brigadas.png   → mockups/11-brigadas.html a 390 px     (brigadas en campo, móvil)
//
// Estos stills sirven para APROBAR el look y como referencia visual para los subagentes `seccion`.
// Los stills definitivos del prototipo ensamblado salen de `npm run capture` (paginas/).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = resolve(ROOT, 'presentacion');
await mkdir(OUT, { recursive: true });

const url = (f) => pathToFileURL(join(ROOT, 'mockups', f)).href;

// Flags para PC de 8 GB: menos RAM por Chromium durante las capturas.
const browser = await chromium.launch({
  args: [
    '--disable-dev-shm-usage',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--js-flags=--max-old-space-size=1024',
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

async function shot({ file, out, width = 1440, height = 900 }) {
  await page.setViewportSize({ width, height });
  await page.goto(url(file), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, out), fullPage: true });
  console.log(`OK presentacion/${out}`);
}

await shot({ file: '10-plataforma.html', out: '10-plataforma.png' });
await shot({ file: '11-brigadas.html', out: '11-brigadas.png', width: 390, height: 844 });

await browser.close();
