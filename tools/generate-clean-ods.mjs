// tools/generate-clean-ods.mjs
import { chromium } from 'playwright';
import { resolve, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const OUT_DIR = resolve('assets/ods');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const CARDS = [
  {
    n: 1,
    title: 'FIN DE LA<br>POBREZA',
    color: '#e5243b',
    num: '1',
    svg: 'assets/ods/vector-1.svg',
    // Position adjustments for icon
    cropTop: '25%',
    scale: '1.0'
  },
  {
    n: 2,
    title: 'HAMBRE<br>CERO',
    color: '#dda63a',
    num: '2',
    svg: 'assets/ods/vector-2.svg',
    cropTop: '24%',
    scale: '1.0'
  },
  {
    n: 9,
    title: 'INDUSTRIA,<br>INNOVACIÓN E<br>INFRAESTRUCTURA',
    color: '#fd6925',
    num: '9',
    svg: 'assets/ods/vector-9.svg',
    cropTop: '28%',
    scale: '0.98'
  },
  {
    n: 11,
    title: 'CIUDADES Y<br>COMUNIDADES<br>SOSTENIBLES',
    color: '#fd9d24',
    num: '11',
    svg: 'assets/ods/vector-11.svg',
    cropTop: '28%',
    scale: '0.98'
  },
  {
    n: 13,
    title: 'ACCIÓN POR<br>EL CLIMA',
    color: '#3f7e44',
    num: '13',
    svg: null,
    png: 'assets/ods/raster-13.png',
    cropTop: '25%',
    scale: '1.0'
  },
  {
    n: 15,
    title: 'VIDA DE<br>ECOSISTEMAS<br>TERRESTRES',
    color: '#56c02b',
    num: '15',
    svg: 'assets/ods/vector-15.svg',
    cropTop: '28%',
    scale: '0.98'
  }
];

async function main() {
  console.log('Generando tarjetas oficiales recortadas de los ODS en español...');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });

  for (const c of CARDS) {
    const imgSrc = c.svg ? 'http://localhost:5173/' + c.svg : 'http://localhost:5173/' + c.png;
    const isDoubleDigit = c.num.length > 1;
    const numLeft = isDoubleDigit ? '28px' : '40px';
    const numSize = isDoubleDigit ? '118px' : '136px';
    const titleLeft = isDoubleDigit ? '180px' : '150px';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap" rel="stylesheet">
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body {
            width: 800px;
            height: 800px;
            background: ${c.color};
            font-family: 'Oswald', -apple-system, sans-serif;
            position: relative;
            overflow: hidden;
          }
          .num {
            position: absolute;
            left: ${numLeft};
            top: 24px;
            font-size: ${numSize};
            line-height: 0.85;
            color: #ffffff;
            font-weight: 700;
            letter-spacing: -0.04em;
          }
          .title {
            position: absolute;
            left: ${titleLeft};
            top: 30px;
            right: 32px;
            font-size: 38px;
            line-height: 1.02;
            color: #ffffff;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.01em;
          }
          /* Container that clips only the illustration icon from the bottom 70% */
          .icon-crop {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 560px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          /* Masking the top 26% of the source SVG/PNG to remove English text and show only pure white icon */
          .icon-crop img {
            width: 800px;
            height: 800px;
            position: absolute;
            top: -240px; /* shifts up to hide the English text */
            left: 0;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="num">${c.num}</div>
        <div class="title">${c.title}</div>
        <div class="icon-crop">
          <img src="${imgSrc}">
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForTimeout(400);
    const dest = join(OUT_DIR, `clean-ods-${c.n}.png`);
    await page.screenshot({ path: dest });
    console.log(`Generado ODS ${c.n} en: ${dest}`);
  }

  await browser.close();
  console.log('¡Todas las imágenes oficiales recortadas y estilizadas en español se generaron!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
