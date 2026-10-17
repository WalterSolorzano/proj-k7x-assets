// tools/record-cinematic-panama.mjs
// Captura la secuencia cinematográfica continua e ininterrumpida de LATAM -> Panamá -> Interfaces -> Epicentro
import { chromium } from 'playwright';
import { resolve, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, 'presentacion', 'video');
const TMP_DIR = join(ROOT, `.tmp-video-panama-${Date.now()}`);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

async function main() {
  console.log('Iniciando captura cinematográfica continua en Playwright (1920x1080)...');
  const browser = await chromium.launch({
    args: [
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--js-flags=--max-old-space-size=4096'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: TMP_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  const video = page.video();

  const fileUrl = 'http://localhost:5173/mockups/panama/experiencia-continua.html';
  console.log(`Navegando a: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });

  // Esperar a que Vite se estabilice sin recargas
  await page.waitForTimeout(2000);

  // Marcar timestamp de inicio de secuencia
  console.log('Ejecutando coreografía continua (LATAM -> Zoom Panamá -> Interfaces -> Epicentro)...');
  
  await page.evaluate(() => {
    return new Promise((resolve) => {
      window.runCinematicSequence(() => {
        resolve();
      });
    });
  });

  // Pausa de 800ms antes de cerrar
  await page.waitForTimeout(800);

  console.log('Finalizando grabación y cerrando navegador...');
  await page.close();
  await context.close();
  await browser.close();

  const videoPath = await video.path();
  console.log(`Video temporal generado en: ${videoPath}`);

  // Transcodificar con ffmpeg a MP4 1080p limpio, eliminando cualquier fotograma blanco inicial
  const ffmpegStatic = (await import('ffmpeg-static')).default;
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execFileAsync = promisify(execFile);

  const finalMp4 = join(OUT_DIR, 'pitch-recurso-latam-panama-innovador.mp4');
  console.log(`Procesando archivo final MP4 de alta calidad en: ${finalMp4}`);

  // Recortar exactamente con -ss 00:00:04.180 para asegurar que el primer fotograma sea 100% visible
  await execFileAsync(ffmpegStatic, [
    '-ss', '00:00:04.180',
    '-i', videoPath,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-preset', 'slow',
    '-crf', '17',
    '-y',
    finalMp4
  ]);

  console.log('¡Éxito! Video cinematográfico final completado con éxito.');
}

main().catch((err) => {
  console.error('Error durante la grabación cinematográfica:', err);
  process.exit(1);
});
