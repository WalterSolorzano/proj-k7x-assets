// tools/shot.mjs — captura rápida de una URL para revisar de un vistazo.
//
// Existe porque `tools/review.mjs` es para páginas ensambladas (las corta en franjas) y
// `npm run capture` es para el entregable final. Esto es para el bucle corto: "¿cómo quedó esta
// sección ahora mismo?". Sirve para el preview aislado y para la URL publicada.
//
// uso:  node tools/shot.mjs <url> [ancho=1440] [salida=shot.png] [--viewport]
//       (sin --viewport captura la página completa; con él, solo la ventana)
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args[0];
const num = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split('=')[1]) : def;
};
const width = Number(args[1] || 1440);
const out = args[2] || 'shot.png';
const viewportOnly = args.includes('--viewport');
// --scale=N  renderiza a Nx (para leer detalles finos)
// --clip=x,y,w,h  captura solo esa región: con --scale da un zoom real de una etiqueta o un rótulo
const scale = num('scale', 1);
const clipArg = args.find((x) => x.startsWith('--clip='));
const clip = clipArg
  ? (([x, y, w, h]) => ({ x, y, width: w, height: h }))(clipArg.split('=')[1].split(',').map(Number))
  : undefined;

if (!url) {
  console.error('uso: node tools/shot.mjs <url> [ancho] [salida] [--viewport]');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: 950 },
  deviceScaleFactor: scale,
});
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await page.evaluate(() => document.fonts?.ready).catch(() => {});
await page.waitForTimeout(700);

const info = await page.evaluate(() => ({
  theme: document.documentElement.getAttribute('data-theme'),
  alto: document.documentElement.scrollHeight,
  desborde_horizontal: document.documentElement.scrollWidth - window.innerWidth,
}));
console.log(JSON.stringify(info));

await page.screenshot({ path: out, fullPage: clip ? false : !viewportOnly, ...(clip ? { clip } : {}) });
await browser.close();
