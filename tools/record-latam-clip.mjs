// tools/record-latam-clip.mjs
import { chromium } from 'playwright';
import { resolve, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const ROOT = resolve(process.cwd());
const OUT = join(ROOT, 'presentacion', 'video');
const TARGET_URL = 'http://localhost:5173/paginas/01-plataforma.html';

async function main() {
  console.log('Iniciando captura de video para la sección LATAM / Panamá...');
  const browser = await chromium.launch({
    args: [
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--js-flags=--max-old-space-size=1024',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    recordVideo: { dir: join(ROOT, '.tmp-video'), size: { width: 1920, height: 1080 } },
  });

  const page = await context.newPage();
  const video = page.video();

  await page.goto(TARGET_URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Ocultar barra superior fija durante el zoom para encuadre cinematográfico
  await page.addStyleTag({ content: '.sec-10-bar { display: none !important; }' });

  // Centrar en el mapa de LATAM y hacer zoom suave sobre el evento de Panamá
  await page.evaluate(async () => {
    const el = document.querySelector('.sec-07-latam');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
    
    // Zoom in cinematográfico hacia el Istmo de Panamá
    const body = document.body;
    body.style.transformOrigin = '45% 28%';
    const t0 = performance.now();
    const duration = 7500;
    await new Promise((res) => {
      const step = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        body.style.transform = `scale(${1 + 0.35 * e})`;
        t < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
  });

  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, 't0-latam-panama.png') });
  await page.close();

  const webmPath = join(OUT, 't0-latam-panama.webm');
  await video.saveAs(webmPath);
  await context.close();
  await browser.close();

  console.log('✓ t0-latam-panama.webm guardado. Convirtiendo a mp4...');
  const mp4Path = join(OUT, 't0-latam-panama.mp4');
  await execFileAsync(ffmpegStatic, [
    '-y', '-i', webmPath,
    '-r', '30',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    mp4Path
  ]);
  console.log(`✓ ${mp4Path} completado exitosamente.`);
}

main().catch(console.error);
