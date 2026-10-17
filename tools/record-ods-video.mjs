// tools/record-ods-video.mjs
// Graba el video horizontal 1920x1080 del recurso visual ODS 1, 2, 9, 11, 13 y 15
import { chromium } from 'playwright';
import { resolve, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, 'presentacion', 'video');
const TMP_DIR = join(ROOT, `.tmp-video-ods-${Date.now()}`);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

async function main() {
  console.log('Iniciando grabación en Playwright para video ODS (1920x1080)...');
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

  const fileUrl = 'http://localhost:5173/mockups/ods-video.html';
  console.log(`Navegando a: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });

  // Pausa para estabilización
  await page.waitForTimeout(1500);

  // Ejecutar secuencia coreografiada (cada ODS dura 3.8s en grande antes de viajar al dock)
  console.log('Ejecutando secuencia coreografiada de ODS 1, 2, 9, 11, 13 y 15...');
  await page.evaluate(() => {
    return new Promise((resolve) => {
      window.runODSSequence(() => {
        resolve();
      }, 3.8); // 3.8 segundos por ODS para permitir locución completa y fluida
    });
  });

  // Mantener vista final con todos los ODS organizados durante 3 segundos
  await page.waitForTimeout(3000);

  console.log('Finalizando grabación y cerrando navegador...');
  await page.close();
  await context.close();
  await browser.close();

  const videoPath = await video.path();
  console.log(`Video temporal generado en: ${videoPath}`);

  // Transcodificar con ffmpeg-static a MP4 H.264 limpio
  const ffmpegStatic = (await import('ffmpeg-static')).default;
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execFileAsync = promisify(execFile);

  const finalMp4 = join(OUT_DIR, 'ods-alineacion-estrategica.mp4');
  console.log(`Procesando archivo final MP4 en: ${finalMp4}`);

  await execFileAsync(ffmpegStatic, [
    '-ss', '00:00:01.200',
    '-i', videoPath,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-preset', 'veryfast',
    '-crf', '17',
    '-y',
    finalMp4
  ]);

  console.log(`¡Éxito total! Video ODS generado en: ${finalMp4}`);
}

main().catch((err) => {
  console.error('Error durante la grabación del video ODS:', err);
  process.exit(1);
});
