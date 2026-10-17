import fs from 'fs';

const targetFile = 'tools/build-panama-minimalist.mjs';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Añadir estilos CSS para el doble logo institucional (SINAPRED + SITRA)
const cssTarget = `.brand-box {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }`;

const cssReplacement = `.brand-box {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .sinapred-logo-img {
      height: 38px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
    }
    .brand-divider {
      width: 1.5px;
      height: 32px;
      background: var(--border);
    }
    .sitra-logo-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sitra-logo-img {
      height: 36px;
      width: auto;
      object-fit: contain;
      border-radius: 4px;
    }`;

if (!content.includes(cssTarget)) {
  console.error("cssTarget not found!");
  process.exit(1);
}
content = content.replace(cssTarget, cssReplacement);

// 2. Reemplazar el header HTML con el logo oficial de SINAPRED, barra divisoria, logo de SITRA y nombres completos
const headerTarget = `    <div class="brand-box">
      <svg class="brand-mark" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <circle cx="13" cy="13" r="3.2" fill="currentColor"></circle>
        <path d="M6.4 6.4a9.4 9.4 0 0 0 0 13.2M19.6 19.6a9.4 9.4 0 0 0 0-13.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path>
        <path d="M9.4 9.4a5.1 5.1 0 0 0 0 7.2M16.6 16.6a5.1 5.1 0 0 0 0-7.2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path>
      </svg>
      <div class="brand-titles">
        <span class="brand-name">SITRE</span>
        <span class="brand-sub">SISTEMA TERRITORIAL DE RESCATE</span>
      </div>
    </div>`;

const headerReplacement = `    <div class="brand-box">
      <!-- LOGO OFICIAL SINAPRED -->
      <div style="display:flex; align-items:center; gap:8px;">
        <img class="sinapred-logo-img" src="../../assets/sinapred-logo.png" alt="Logo Oficial SINAPRED" />
        <div class="brand-titles">
          <span style="font-family:var(--font-display); font-size:13px; font-weight:800; letter-spacing:0.04em; color:#0f172a;">SINAPRED</span>
          <span style="font-family:var(--font-mono); font-size:7.5px; font-weight:600; letter-spacing:0.08em; color:var(--text-dim); text-transform:uppercase;">Prevención & Mitigación</span>
        </div>
      </div>

      <!-- BARRA DE SEPARACIÓN -->
      <div class="brand-divider"></div>

      <!-- NUESTRO LOGO Y NOMBRE: SITRA -->
      <div class="sitra-logo-wrap">
        <img class="sitra-logo-img" src="../../assets/sitra-logo.jpg" alt="Logo SITRA" />
        <div class="brand-titles">
          <span class="brand-name" style="font-size:15px; font-weight:800; letter-spacing:0.06em; color:var(--text);">SITRA</span>
          <span class="brand-sub" style="font-size:7.5px; font-weight:600; letter-spacing:0.06em; color:var(--text-dim);">SISTEMA INTERNACIONAL TERRITORIAL PARA RESCATES Y ALERTAS</span>
        </div>
      </div>
    </div>`;

if (!content.includes(headerTarget)) {
  console.error("headerTarget not found!");
  process.exit(1);
}
content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Updated build-panama-minimalist.mjs with official SINAPRED logo, divider, and SITRA logo & name!");
