import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const toBase64 = (relPath, mime) => {
  const buf = readFileSync(resolve(relPath));
  return `data:${mime};base64,${buf.toString('base64')}`;
};

const sitraLogo = toBase64('assets/sitra-logo.jpg', 'image/jpeg');
const sinapredLogo = toBase64('assets/sinapred-logo.png', 'image/png');
const ineterLogo = toBase64('assets/ineter-logo.png', 'image/png');
const cepredenacLogo = toBase64('assets/cepredenac-logo.png', 'image/png');

const odsImages = {
  1: toBase64('assets/ods/clean-ods-1.png', 'image/png'),
  2: toBase64('assets/ods/clean-ods-2.png', 'image/png'),
  9: toBase64('assets/ods/clean-ods-9.png', 'image/png'),
  11: toBase64('assets/ods/clean-ods-11.png', 'image/png'),
  13: toBase64('assets/ods/clean-ods-13.png', 'image/png'),
  15: toBase64('assets/ods/clean-ods-15.png', 'image/png')
};

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cierre Institucional - SITRA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #ffffff;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      font-family: 'Fredoka', 'Outfit', system-ui, sans-serif;
      position: relative;
    }

    .viewport {
      width: 1920px;
      height: 1080px;
      position: relative;
      background: #ffffff;
      overflow: hidden;
    }

    .scene {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.4s ease-in-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform: scale(0.98);
    }

    .scene.active {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }

    /* ==============================================================
       ESCENA 1: Plan Nacional de Lucha contra la Pobreza 2022-2026
       ============================================================== */
    .pnl-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .pnl-hero {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      margin-bottom: 70px;
    }

    .pnl-logo-shield {
      width: 260px;
      height: 260px;
      object-fit: contain;
    }

    .pnl-texts {
      text-align: left;
    }

    .pnl-heading-small {
      font-family: 'Outfit', sans-serif;
      font-size: 44px;
      font-weight: 600;
      color: #334155;
      line-height: 1.15;
    }

    .pnl-heading-big {
      font-family: 'Outfit', sans-serif;
      font-size: 72px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.05;
      margin-top: 4px;
    }

    .pnl-years {
      font-family: 'Outfit', sans-serif;
      font-size: 34px;
      font-weight: 700;
      color: #0284c7;
      margin-top: 6px;
    }

    .pnl-lineamientos {
      font-family: 'Fredoka', 'Outfit', sans-serif;
      font-size: 60px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.01em;
    }

    /* ==============================================================
       ESCENA 2: Grilla Institucional 3x2 con líneas divisorias
       ============================================================== */
    .grid-institucional {
      width: 1720px;
      height: 900px;
      display: grid;
      grid-template-columns: 1fr 1.5px 1fr 1.5px 1fr;
      grid-template-rows: 1fr 1.5px 1fr;
      align-items: center;
      justify-items: center;
    }

    .grid-v-line {
      width: 1.5px;
      height: 85%;
      background: #cbd5e1;
      justify-self: center;
    }

    .grid-h-line {
      grid-column: 1 / span 5;
      width: 90%;
      height: 1.5px;
      background: #cbd5e1;
      margin: 0 auto;
    }

    .inst-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 20px;
    }

    .inst-logo {
      height: 220px;
      width: 220px;
      object-fit: contain;
      margin-bottom: 24px;
    }

    .inst-name {
      font-family: 'Fredoka', 'Outfit', sans-serif;
      font-size: 52px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .name-sinapred { color: #02529c; }
    .name-ineter { color: #1e3a8a; }
    .name-cepredenac { color: #0f172a; }
    .name-bripred { color: #0f172a; font-size: 60px; }
    .name-colupred { color: #0f172a; font-size: 60px; }

    /* ==============================================================
       ESCENA 3: Arco ODS (1, 2, 9, 11, 13, 15) Sin estilo Cards
       ============================================================== */
    .arc-stage {
      position: relative;
      width: 1920px;
      height: 1080px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .ods-rainbow {
      position: absolute;
      top: 150px;
      width: 1700px;
      height: 850px;
    }

    .ods-rainbow-item {
      position: absolute;
      width: 240px;
      height: 240px;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
      transform-origin: center bottom;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ods-rainbow-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ==============================================================
       ESCENA 4: Logotipo Central SITRA + Tagline Final
       ============================================================== */
    .sitra-closing {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .sitra-logo-wrap {
      width: 650px;
      margin-bottom: 50px;
    }

    .sitra-logo-wrap img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }

    .sitra-tagline {
      font-family: 'Fredoka', 'Outfit', sans-serif;
      font-size: 64px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.01em;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="viewport">
    
    <!-- ESCENA 1: PLAN NACIONAL 2022-2026 -->
    <div class="scene active" id="scene-1">
      <div class="pnl-container">
        <div class="pnl-hero">
          <img class="pnl-logo-shield" src="${sitraLogo}" alt="Escudo SITRA">
          <div class="pnl-texts">
            <div class="pnl-heading-small">Plan Nacional</div>
            <div class="pnl-heading-small">de Lucha contra</div>
            <div class="pnl-heading-big">la Pobreza</div>
            <div class="pnl-years">2022-2026</div>
          </div>
        </div>
        <div class="pnl-lineamientos">Lineamientos X y XI</div>
      </div>
    </div>

    <!-- ESCENA 2: GRILLA INSTITUCIONAL 3x2 -->
    <div class="scene" id="scene-2">
      <div class="grid-institucional">
        <!-- Fila Superior -->
        <div class="inst-cell">
          <img class="inst-logo" src="${sinapredLogo}" alt="SINAPRED">
          <div class="inst-name name-sinapred">SINAPRED</div>
        </div>
        <div class="grid-v-line"></div>
        <div class="inst-cell">
          <img class="inst-logo" src="${ineterLogo}" alt="INETER">
          <div class="inst-name name-ineter">INETER</div>
        </div>
        <div class="grid-v-line"></div>
        <div class="inst-cell">
          <img class="inst-logo" src="${cepredenacLogo}" alt="CEPREDENAC">
          <div class="inst-name name-cepredenac">CEPREDENAC</div>
        </div>

        <!-- Línea Horizontal Divisoria -->
        <div class="grid-h-line"></div>

        <!-- Fila Inferior -->
        <div class="inst-cell">
          <div class="inst-name name-bripred">BRIPRED</div>
        </div>
        <div class="grid-v-line"></div>
        <div class="inst-cell">
          <!-- Centro despejado -->
        </div>
        <div class="grid-v-line"></div>
        <div class="inst-cell">
          <div class="inst-name name-colupred">COLUPRED</div>
        </div>
      </div>
    </div>

    <!-- ESCENA 3: ARCO DE LOS ODS 1, 2, 9, 11, 13, 15 -->
    <div class="scene" id="scene-3">
      <div class="arc-stage">
        <div class="ods-rainbow" id="odsRainbow"></div>
      </div>
    </div>

    <!-- ESCENA 4: CIERRE SITRA Y TAGLINE -->
    <div class="scene" id="scene-4">
      <div class="sitra-closing">
        <div class="sitra-logo-wrap">
          <img src="${sitraLogo}" alt="SITRA">
        </div>
        <div class="sitra-tagline">Decisión informada. Vidas salvadas.</div>
      </div>
    </div>

  </div>

  <script>
    const ODS_LIST = [
      { n: 1, img: '${odsImages[1]}' },
      { n: 2, img: '${odsImages[2]}' },
      { n: 9, img: '${odsImages[9]}' },
      { n: 11, img: '${odsImages[11]}' },
      { n: 13, img: '${odsImages[13]}' },
      { n: 15, img: '${odsImages[15]}' }
    ];

    const rainbow = document.getElementById('odsRainbow');
    // Geometría del arco
    const radius = 780;
    const centerX = 850;
    const centerY = 900;
    const angles = [-52, -31, -10, 10, 31, 52];

    ODS_LIST.forEach((ods, i) => {
      const angleDeg = angles[i];
      const angleRad = (angleDeg - 90) * (Math.PI / 180);
      const x = centerX + radius * Math.cos(angleRad) - 120;
      const y = centerY + radius * Math.sin(angleRad) - 120;

      const item = document.createElement('div');
      item.className = 'ods-rainbow-item';
      item.id = 'rainbow-ods-' + i;
      item.style.left = x + 'px';
      item.style.top = y + 'px';
      item.style.transform = \`rotate(\${angleDeg}deg)\`;
      item.innerHTML = \`<img src="\${ods.img}" alt="ODS \${ods.n}">\`;
      rainbow.appendChild(item);
    });

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    window.runInstitutionalSequence = async function(onComplete) {
      console.log('Iniciando secuencia de video institucional...');
      const s1 = document.getElementById('scene-1');
      const s2 = document.getElementById('scene-2');
      const s3 = document.getElementById('scene-3');
      const s4 = document.getElementById('scene-4');

      // Escena 1: Plan Nacional (2.5 segundos)
      s1.classList.add('active');
      s2.classList.remove('active');
      s3.classList.remove('active');
      s4.classList.remove('active');
      await sleep(2600);

      // Escena 2: Logos Institucionales 3x2 (2.6 segundos)
      s1.classList.remove('active');
      s2.classList.add('active');
      await sleep(2800);

      // Escena 3: Arco ODS (2.8 segundos)
      s2.classList.remove('active');
      s3.classList.add('active');
      await sleep(2800);

      // Escena 4: Cierre SITRA + Tagline (2.8 segundos)
      s3.classList.remove('active');
      s4.classList.add('active');
      await sleep(3000);

      console.log('Secuencia institucional completada.');
      if (onComplete) onComplete();
    };
  </script>
</body>
</html>`;

writeFileSync(resolve('mockups/institucional-cierre.html'), htmlContent, 'utf8');
console.log('mockups/institucional-cierre.html generado con imágenes embebidas en Base64.');
