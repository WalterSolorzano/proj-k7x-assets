// tools/build-panama-experience.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());

const latamPaths = readFileSync(join(ROOT, 'secciones', '07-latam', 'paths.html'), 'utf8');
const panPaths = readFileSync(join(ROOT, 'assets', 'geo-panama-paths.html'), 'utf8');
const s17 = readFileSync(join(ROOT, 'secciones', '17-croquis', 'section.html'), 'utf8');
const i1 = s17.indexOf('<svg class="sec-17-croquis__svg"');
const i2 = s17.indexOf('</svg>', i1) + 6;
const croquisSvg = s17.slice(i1, i2);

const tokensCss = readFileSync(join(ROOT, 'assets', 'tokens.css'), 'utf8');
const croquisCss = readFileSync(join(ROOT, 'secciones', '17-croquis', 'section.css'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SITRE · Experiencia Cinematográfica Continua LATAM -> Panamá</title>
  <style>
    ${tokensCss}
    ${croquisCss}

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060b13;
      color: #f1f5f9;
      font-family: var(--font-sans, system-ui, sans-serif);
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
    }

    /* ESCENARIO CONTINUO DE CÁMARA (TRANSLACIONES Y ZOOM NATURALES) */
    #stage {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      transform-origin: 50% 50%;
      will-change: transform;
    }

    .view-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* 1. CAPA LATAM CONTINENTAL */
    #layer-latam {
      z-index: 10;
      opacity: 1;
    }
    .latam-map-box {
      width: 860px;
      height: 780px;
      position: relative;
    }
    .latam-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.15));
    }
    .latam-country {
      fill: #162032;
      stroke: #334155;
      stroke-width: 0.9;
      transition: fill 0.3s;
    }
    .latam-country.is-active {
      fill: #1e3a5f;
      stroke: #38bdf8;
      stroke-width: 1.4;
    }
    .latam-country.is-alert {
      fill: #450a0a;
      stroke: #ef4444;
      stroke-width: 2.2;
    }
    .sec-07-latam__country {
      fill: #162032;
      stroke: #334155;
      stroke-width: 0.9;
    }
    .sec-07-latam__country.is-active {
      fill: #1e3a5f;
      stroke: #38bdf8;
      stroke-width: 1.4;
    }
    .sec-07-latam__country#latam-pan {
      fill: #450a0a;
      stroke: #ef4444;
      stroke-width: 2.4;
      filter: drop-shadow(0 0 10px #ef4444);
    }

    /* 2. CAPA PANAMÁ PROVINCIAL (ADM1) */
    #layer-panama {
      z-index: 20;
      opacity: 0;
      pointer-events: none;
    }
    .panama-map-box {
      width: 1300px;
      height: 560px;
      position: relative;
    }
    .panama-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 40px rgba(239, 68, 68, 0.25));
    }
    .pan-provincia {
      fill: #111b2b;
      stroke: #1e3a5f;
      stroke-width: 1.2;
    }
    .pan-provincia[data-alerta="amarilla"] {
      fill: #271f11;
      stroke: #f59e0b;
      stroke-width: 1.6;
    }
    .pan-provincia[data-alerta="roja"] {
      fill: #3e0c0c;
      stroke: #ef4444;
      stroke-width: 2.6;
      filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.6));
    }

    /* 3. CAPA EPICENTRO CON CROQUIS TERRITORIAL */
    #layer-epicentro {
      z-index: 30;
      opacity: 0;
      pointer-events: none;
    }
    .epicentro-box {
      width: 1350px;
      height: 750px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .epicentro-box .sec-17-croquis__svg {
      width: 100%;
      height: 100%;
      max-height: 720px;
    }

    /* ONDAS Y PULSOS EN EL MAPA */
    @keyframes pulse-ring {
      0% { transform: scale(0.6); opacity: 0.95; }
      100% { transform: scale(3.0); opacity: 0; }
    }
    .pulse-emitter {
      position: absolute;
      width: 28px;
      height: 28px;
      margin-left: -14px;
      margin-top: -14px;
      pointer-events: none;
    }
    .pulse-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #ef4444;
      animation: pulse-ring 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
    .pulse-circle:nth-child(2) { animation-delay: 0.7s; }
    .pulse-circle:nth-child(3) { animation-delay: 1.4s; }
    .pulse-dot {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 16px #ef4444;
    }

    /* HUD OVERLAY CINEMATOGRÁFICO */
    .hud-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 100;
    }

    /* BARRA DE MANDO SUPERIOR */
    .hud-bar {
      position: absolute;
      top: 24px;
      left: 32px;
      right: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(10, 17, 30, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 8px;
      padding: 12px 24px;
      backdrop-filter: blur(20px);
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
    }
    .hud-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .hud-brand-tag {
      background: #ef4444;
      color: #fff;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 9px;
      border-radius: 4px;
      letter-spacing: 0.06em;
    }
    .hud-brand-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #f8fafc;
    }
    .hud-brand-sub {
      font-size: 12px;
      color: #94a3b8;
    }
    .hud-metrics {
      display: flex;
      gap: 32px;
    }
    .hud-metric-item {
      display: flex;
      flex-direction: column;
    }
    .hud-metric-lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .hud-metric-val {
      font-size: 15px;
      font-weight: 700;
      color: #38bdf8;
      font-family: var(--font-mono, monospace);
    }
    .hud-metric-val.is-alert { color: #ef4444; }

    /* TARJETAS FLOTANTES DE DATOS */
    .telemetry-card {
      position: absolute;
      background: rgba(10, 16, 26, 0.92);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 8px;
      padding: 18px 22px;
      backdrop-filter: blur(16px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      transform: translateY(24px) scale(0.96);
    }
    .telemetry-card.is-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .tc-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38bdf8;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tc-title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #38bdf8;
      border-radius: 50%;
    }
    .tc-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 6px;
      font-size: 13px;
    }
    .tc-label { color: #94a3b8; }
    .tc-value { font-family: var(--font-mono, monospace); font-weight: 600; color: #f1f5f9; }
    .tc-value.alert { color: #ef4444; font-weight: 700; }

    /* MODELO 3D PROCEDURAL EN ROTACIÓN VIVA */
    .hardware-3d-box {
      position: absolute;
      bottom: 32px;
      right: 32px;
      width: 320px;
      height: 200px;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.4);
      background: #000;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0,0,0,0.65);
      opacity: 0;
      transform: scale(0.9);
      transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hardware-3d-box.is-visible {
      opacity: 1;
      transform: scale(1);
    }
    .hardware-3d-box video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hardware-3d-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(10, 17, 30, 0.88);
      border: 1px solid rgba(56, 189, 248, 0.35);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      color: #38bdf8;
      font-family: var(--font-mono, monospace);
    }

    /* BANNER CINEMATOGRÁFICO INFERIOR */
    .cinema-banner {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 17, 30, 0.92);
      border: 1px solid rgba(239, 68, 68, 0.45);
      border-radius: 30px;
      padding: 10px 28px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 13px;
      letter-spacing: 0.05em;
      box-shadow: 0 10px 32px rgba(239, 68, 68, 0.3);
    }
    .banner-dot {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 12px #ef4444;
    }
  </style>
</head>
<body>

  <!-- ESCENARIO PRINCIPAL -->
  <div id="stage">

    <!-- 1. LATAM MACRO REGIONAL -->
    <div id="layer-latam" class="view-layer">
      <div class="latam-map-box">
        <svg class="latam-svg" viewBox="0 0 1000 900">
          <g class="sec-07-latam__countries">
            ${latamPaths}
          </g>
          
          <!-- Enlaces satelitales entre nodos SITRE -->
          <g stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.8" stroke-dasharray="5 5" fill="none">
            <line x1="448" y1="248" x2="393" y2="201" />
            <line x1="448" y1="248" x2="539" y2="288" />
            <line x1="448" y1="248" x2="350" y2="175" />
            <line x1="539" y1="288" x2="580" y2="250" />
            <line x1="539" y1="288" x2="510" y2="400" />
            <line x1="510" y1="400" x2="640" y2="650" />
          </g>

          <!-- Nodos regionales activos -->
          <circle cx="393" cy="201" r="5" fill="#38bdf8" />
          <circle cx="539" cy="288" r="5" fill="#38bdf8" />
          <circle cx="580" cy="250" r="5" fill="#38bdf8" />
          <circle cx="510" cy="400" r="5" fill="#38bdf8" />
          <circle cx="640" cy="650" r="5" fill="#38bdf8" />

          <!-- Epicentro Panamá con pulso rojo -->
          <circle cx="448" cy="248" r="7" fill="#ef4444" />
        </svg>

        <!-- Pulso CSS animado en Panamá (x: 44.8%, y: 27.5%) -->
        <div class="pulse-emitter" style="left: 44.8%; top: 27.5%;">
          <div class="pulse-circle"></div>
          <div class="pulse-circle"></div>
          <div class="pulse-dot"></div>
        </div>
      </div>
    </div>

    <!-- 2. PANAMÁ NACIONAL ADM1 -->
    <div id="layer-panama" class="view-layer">
      <div class="panama-map-box">
        <svg class="panama-svg" viewBox="0 0 1000 434">
          <g>
            ${panPaths}
          </g>
          <!-- Foco en Colón -->
          <circle cx="518.6" cy="99.3" r="8" fill="#ef4444" />
        </svg>

        <!-- Pulso animado en Colón -->
        <div class="pulse-emitter" style="left: 51.8%; top: 22.8%;">
          <div class="pulse-circle"></div>
          <div class="pulse-circle"></div>
          <div class="pulse-dot"></div>
        </div>
      </div>
    </div>

    <!-- 3. EPICENTRO SECTOR COLÓN / CANAL (CROQUIS EN VIVO) -->
    <div id="layer-epicentro" class="view-layer">
      <div class="epicentro-box">
        ${croquisSvg}
      </div>
    </div>

  </div>

  <!-- HUD E INTERFACES FLOTANTES -->
  <div class="hud-overlay">
    <div class="hud-bar">
      <div class="hud-brand">
        <span class="hud-brand-tag">SITRE · VIGÍA</span>
        <div>
          <h1 class="hud-brand-title">RED REGIONAL AMÉRICA LATINA & EL CARIBE</h1>
          <p class="hud-brand-sub" id="hud-subtitle">MONITOREO DE EVENTO CRÍTICO · ISTMO DE PANAMÁ</p>
        </div>
      </div>
      <div class="hud-metrics">
        <div class="hud-metric-item">
          <span class="hud-metric-lbl">Jurisdicción</span>
          <span class="hud-metric-val" id="metric-jurisdiccion">LATAM / CEPREDENAC</span>
        </div>
        <div class="hud-metric-item">
          <span class="hud-metric-lbl">Estado de Alerta</span>
          <span class="hud-metric-val is-alert" id="metric-alerta">ROJA · MAREJADA / VIENTO</span>
        </div>
        <div class="hud-metric-item">
          <span class="hud-metric-lbl">Personas Mapeadas</span>
          <span class="hud-metric-val" id="metric-personas">1 420 est.</span>
        </div>
        <div class="hud-metric-item">
          <span class="hud-metric-lbl">Telemetría Viento</span>
          <span class="hud-metric-val" id="metric-viento">92 km/h</span>
        </div>
        <div class="hud-metric-item">
          <span class="hud-metric-lbl">Red LoRa 915 MHz</span>
          <span class="hud-metric-val">38/42 Nodos Activos</span>
        </div>
      </div>
    </div>

    <!-- TARJETA 1: Telemetría Ambiental -->
    <div class="telemetry-card" id="card-telemetry" style="top: 110px; left: 32px; width: 350px;">
      <div class="tc-title">Estación VIGÍA-07 · Colón Costa Arriba</div>
      <div class="tc-row">
        <span class="tc-label">Anemómetro de Cazoletas:</span>
        <span class="tc-value alert">92 km/h (Ráfagas 118 km/h)</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Pluviómetro Balancín:</span>
        <span class="tc-value">160 mm / 6 h acumulado</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Sensor Nivel Marejada:</span>
        <span class="tc-value alert">+1.45 m (Cresta crítica)</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Panel Solar Inclinado 22°:</span>
        <span class="tc-value">Autónomo · Batería 89%</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Enlace de Emergencia:</span>
        <span class="tc-value">LoRa 915 MHz + SINAPROC</span>
      </div>
    </div>

    <!-- TARJETA 2: Mapeo de Personas por Sectores (IPR) -->
    <div class="telemetry-card" id="card-sectors" style="top: 110px; right: 32px; width: 380px;">
      <div class="tc-title" style="color: #ef4444;">Índice Prioridad Rescate (IPR) · Canal / Colón</div>
      <div class="tc-row">
        <span class="tc-label">Sector 01 · Puerto Cristóbal:</span>
        <span class="tc-value alert">640 pers. · IPR 0.94 (Crítico)</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Sector 02 · Casco Colón:</span>
        <span class="tc-value alert">510 pers. · IPR 0.88 (Alto)</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Sector 03 · Cuatro Altos:</span>
        <span class="tc-value">270 pers. · IPR 0.42 (Medio)</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Provincias Enlazadas:</span>
        <span class="tc-value">Bocas del Toro, Guna Yala, Colón</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">Respaldo Satelital:</span>
        <span class="tc-value">Activo sin red celular comercial</span>
      </div>
    </div>

    <!-- MODELO 3D DEL HARDWARE EN ROTACIÓN -->
    <div class="hardware-3d-box" id="box-3d">
      <video src="../../presentacion/video/3d-01-turntable0001-0193.mp4" autoplay loop muted playsinline></video>
      <div class="hardware-3d-tag">NODO HARDWARE VIGÍA-07 (RX 360°)</div>
    </div>

    <!-- BANNER DINÁMICO INFERIOR -->
    <div class="cinema-banner" id="cinema-banner">
      <div class="banner-dot"></div>
      <span id="banner-text">MONITOREO CONTINENTAL LATAM · DETECCIÓN DE AMENAZA METEOROLÓGICA EN PANAMÁ</span>
    </div>
  </div>

  <script>
    window.runCinematicSequence = function(onComplete) {
      const stage = document.getElementById('stage');
      const layerLatam = document.getElementById('layer-latam');
      const layerPanama = document.getElementById('layer-panama');
      const layerEpicentro = document.getElementById('layer-epicentro');

      const cardTelemetry = document.getElementById('card-telemetry');
      const cardSectors = document.getElementById('card-sectors');
      const box3D = document.getElementById('box-3d');
      const bannerText = document.getElementById('banner-text');
      const hudSubtitle = document.getElementById('hud-subtitle');
      const metricJurisdiccion = document.getElementById('metric-jurisdiccion');

      const totalDuration = 20000;
      const startTime = performance.now();

      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / totalDuration);

        // FASE 1: (0s - 4.5s) MACRO CONTINENTAL LATAM -> Zoom hacia el Istmo de Panamá
        if (progress < 0.22) {
          const p1 = progress / 0.22;
          const scale = 1.0 + 0.6 * p1;
          const tx = -30 * p1;
          const ty = -10 * p1;
          stage.style.transform = \`scale(\${scale}) translate(\${tx}px, \${ty}px)\`;
          layerLatam.style.opacity = '1';
          layerPanama.style.opacity = '0';
          layerEpicentro.style.opacity = '0';

          bannerText.innerText = 'RED REGIONAL LATAM · DETECCIÓN Y SINCRONIZACIÓN DE ALERTA ROJA EN PANAMÁ';
        }
        // FASE 2: (4.5s - 9.0s) VISTA NACIONAL PANAMÁ (PROVINCIAS REALES ADM1)
        else if (progress < 0.45) {
          const p2 = (progress - 0.22) / 0.23;
          const scale = 1.6 + 1.2 * p2;
          stage.style.transform = \`scale(\${scale})\`;

          layerLatam.style.opacity = \`\${Math.max(0, 1 - p2 * 2)}\`;
          layerPanama.style.opacity = \`\${Math.min(1, p2 * 1.8)}\`;
          layerEpicentro.style.opacity = '0';

          hudSubtitle.innerText = 'SISTEMA NACIONAL DE PROTECCIÓN CIVIL · SINAPROC PANAMÁ';
          metricJurisdiccion.innerText = 'PANAMÁ · COLÓN & CANAL';
          bannerText.innerText = 'DESPLIEGUE NACIONAL PANAMÁ: COLÓN Y CANAL EN ALERTA MÁXIMA';

          if (p2 > 0.3) {
            cardTelemetry.classList.add('is-visible');
            box3D.classList.add('is-visible');
          }
        }
        // FASE 3: (9.0s - 14.5s) ZOOM PROFUNDO A LA ZONA DE IMPACTO (COLÓN / CANAL)
        else if (progress < 0.72) {
          const p3 = (progress - 0.45) / 0.27;
          const scale = 1.6 + 0.4 * p3;
          stage.style.transformOrigin = '50% 50%';
          stage.style.transform = \`scale(\${scale})\`;

          layerPanama.style.opacity = \`\${Math.max(0, 1 - p3 * 1.5)}\`;
          layerEpicentro.style.opacity = \`\${Math.min(1, p3 * 1.5)}\`;

          cardSectors.classList.add('is-visible');
          bannerText.innerText = 'EPICENTRO COLÓN: 1 420 PERSONAS MAPEADAS EN TIEMPO REAL · IPR CRÍTICO 0.94';
        }
        // FASE 4: (14.5s - 20s) ENTORNO EN VIVO ISOMÉTRICO (VIENTO, LLUVIA, BRIGADAS)
        else {
          stage.style.transformOrigin = '50% 50%';
          stage.style.transform = 'scale(0.88) translateY(24px)';
          
          layerPanama.style.opacity = '0';
          layerEpicentro.style.opacity = '1';

          bannerText.innerText = 'RESPUESTA ACTIVA: CONEXIÓN SATÉLITE + LoRa SIN INTERNET NI RED MÓVIL';
        }

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          if (onComplete) onComplete();
        }
      }

      requestAnimationFrame(frame);
    };
  </script>
</body>
</html>
`;

writeFileSync(join(ROOT, 'mockups', 'panama', 'experiencia-continua.html'), html, 'utf8');
console.log('Built completely inlined experiencia-continua.html successfully.');
