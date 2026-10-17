import fs from 'fs';

const targetFile = 'tools/build-panama-minimalist.mjs';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Agregar estilos CSS para tabs del panel y para capas satelitales fotorrealistas de radar SINAPRED
const cssOld = `.panel-telemetria {
      position: fixed;
      top: 76px;
      right: 28px;
      width: 340px;
      background: var(--surface);
      border: var(--hairline);
      border-radius: var(--r-md);
      padding: 16px 18px;
      box-shadow: 0 16px 36px -8px rgba(0,0,0,0.12);
      z-index: 85;
      font-family: var(--font);
      transition: all 0.3s ease;
    }`;

const cssNew = `.panel-telemetria {
      position: fixed;
      top: 76px;
      right: 28px;
      width: 340px;
      background: var(--surface);
      border: var(--hairline);
      border-radius: var(--r-md);
      padding: 14px 16px;
      box-shadow: 0 16px 36px -8px rgba(0,0,0,0.12);
      z-index: 85;
      font-family: var(--font);
      transition: all 0.3s ease;
    }

    /* PESTAÑAS (TABS) PARA ALTERNAR LIMPIAMENTE ENTRE SECTORIZACIÓN Y METEOROLOGÍA */
    .pt-tabs-bar {
      display: flex;
      gap: 4px;
      background: var(--surface-2);
      padding: 3px;
      border-radius: 6px;
      margin-bottom: 12px;
      border: var(--hairline);
    }
    .pt-tab-btn {
      flex: 1;
      padding: 6px 4px;
      border: none;
      background: transparent;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: var(--text-dim);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.2s;
    }
    .pt-tab-btn.is-active {
      background: #ffffff;
      color: var(--text);
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .pt-tab-pane {
      display: none;
    }
    .pt-tab-pane.is-active {
      display: block;
    }

    /* CAPA DE FONDO SATELITAL RADAR SINAPRED EN ESCENA LATAM */
    .latam-radar-backdrop {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
      opacity: 0.92;
      filter: saturate(1.15) contrast(1.08);
      z-index: 1;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.25);
    }

    /* CAPA DE FONDO RADAR METEOROLÓGICO LOCAL EN ESCENA PANAMÁ */
    .panama-radar-overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
      opacity: 0.88;
      z-index: 1;
      mix-blend-mode: multiply;
      filter: saturate(1.2);
    }`;

content = content.replace(cssOld, cssNew);

// 2. Modificar la duración de transición en .scene-layer para máxima suavidad sin tirones
content = content.replace(
  `transition: opacity 0.4s var(--ease), visibility 0.4s;`,
  `transition: opacity 1.2s ease, visibility 1.2s;`
);

// 3. Reemplazar la ESCENA 1 (Continental LATAM) para embeber la mancha meteorológica de radar Doppler real de SINAPRED
const oldScene1 = `<!-- ESCENA 1: CONTINENTAL LATAM -->
    <div class="scene-layer is-active" id="scene-latam">
      <div class="latam-stage">
        <svg viewBox="0 0 1000 900">
          <!-- CAPA OCEÁNICA Y RADAR METEOROLÓGICO (ESTILO SINAPRED) -->
          <!-- Océano Pacífico y Atlántico rotulados -->
          <g font-family="var(--font-mono)" font-size="12" font-weight="700" fill="#a0aec0" letter-spacing="0.15em" opacity="0.65" pointer-events="none">
            <text x="140" y="520">OCÉANO PACÍFICO</text>
            <text x="660" y="160">MAR CARIBE</text>
            <text x="820" y="240">OCÉANO ATLÁNTICO</text>
          </g>

          <!-- FRENTE TROPICAL Y ESPIRAL DE HURACÁN (RADAR DOPPLER EN EL PACÍFICO / CENTROAMÉRICA) -->
          <g class="meteo-radar-group" opacity="0.78" pointer-events="none">
            <!-- Espiral concéntrica del huracán -->
            <circle cx="160" cy="380" r="110" fill="none" stroke="rgba(237, 137, 54, 0.25)" stroke-width="12" stroke-dasharray="14 8" />
            <circle cx="160" cy="380" r="75" fill="rgba(229, 62, 62, 0.28)" stroke="rgba(229, 62, 62, 0.6)" stroke-width="4" />
            <circle cx="160" cy="380" r="35" fill="rgba(197, 48, 48, 0.75)">
              <animate attributeName="r" values="35;42;35" dur="3s" repeatCount="indefinite" />
            </animate>
            <circle cx="160" cy="380" r="6" fill="#ffffff" />
            <text x="160" y="340" fill="#c53030" font-family="var(--font-mono)" font-size="10" font-weight="800" text-anchor="middle">SISTEMA HURACÁN · CAT 4</text>
          </g>

          <!-- Manchas térmicas de precipitación intensa sobre el istmo y Sudamérica -->
          <g opacity="0.45" pointer-events="none">
            <ellipse cx="460" cy="250" rx="45" ry="25" fill="#e53e3e" filter="blur(8px)" />
            <ellipse cx="560" cy="280" rx="70" ry="40" fill="#ed8936" filter="blur(12px)" />
            <ellipse cx="640" cy="360" rx="110" ry="70" fill="#ecc94b" filter="blur(18px)" />
          </g>

          <g class="sec-07-latam__countries">
            \${latamPaths}
          </g>
          <!-- Enlaces de telecomunicaciones regionales con pulsos -->
          <g stroke="#b03d0c" stroke-width="1.8" stroke-dasharray="6 4" fill="none" opacity="0.85">
            <line x1="448" y1="248" x2="393" y2="201" />
            <line x1="448" y1="248" x2="539" y2="288" />
            <line x1="448" y1="248" x2="350" y2="175" />
            <line x1="539" y1="288" x2="580" y2="250" />
            <line x1="539" y1="288" x2="510" y2="400" />
            <line x1="510" y1="400" x2="640" y2="650" />
          </g>
          <!-- Rótulos de países de la red regional para alta legibilidad -->
          <g font-family="var(--font-mono)" font-size="11" font-weight="700" fill="#2d3748" pointer-events="none">
            <text x="210" y="105">MÉXICO</text>
            <text x="548" y="278">COLOMBIA</text>
            <text x="690" y="420">BRASIL</text>
            <text x="515" y="490">PERÚ</text>
            <text x="645" y="730">ARGENTINA</text>
            <!-- PANAMÁ EPICENTRO DESTACADO -->
            <g transform="translate(448, 222)">
              <rect x="-56" y="-14" width="112" height="22" rx="3" fill="#ffffff" stroke="#b03d0c" stroke-width="1.6" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"/>
              <text x="0" y="2" fill="#b03d0c" font-size="11" font-weight="800" text-anchor="middle">PANAMÁ (HUB)</text>
            </g>
          </g>
          <!-- Nodos y repetidores satelitales -->
          <circle cx="393" cy="201" r="5" fill="#4a5568" />
          <circle cx="539" cy="288" r="5" fill="#4a5568" />
          <circle cx="580" cy="250" r="5" fill="#4a5568" />
          <circle cx="510" cy="400" r="5" fill="#4a5568" />
          <circle cx="448" cy="248" r="7" fill="#b03d0c" />
          <circle cx="448" cy="248" r="16" fill="none" stroke="#b03d0c" stroke-width="2">
            <animate attributeName="r" values="7;30" dur="1.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/>
          </circle>
        </svg>

        <!-- BARRA SUPERIOR DE CAPAS METEOROLÓGICAS (PRECIPITACIÓN, TEMPERATURA, VIENTO) -->
        <div class="weather-pill-bar">
          <button class="w-pill is-active">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1"/></svg>
            Precipitación
          </button>
          <button class="w-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>
            Temperatura
          </button>
          <button class="w-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
            Viento
          </button>
        </div>

        <!-- LEYENDA INFERIOR DE RIESGO DE IMPACTO -->
        <div class="meteo-legend-box">
          <div style="display:flex; justify-content:space-between; color:var(--text); font-weight:700;">
            <span>NIVEL DE PRECIPITACIÓN</span>
            <span style="color:var(--accent);">EXTREMO</span>
          </div>
          <div class="meteo-legend-bar"></div>
          <div class="meteo-legend-labels">
            <span>Bajo</span>
            <span>Moderado</span>
            <span>Alto</span>
            <span>Muy Alto</span>
          </div>
        </div>
      </div>
    </div>`;

const newScene1 = `<!-- ESCENA 1: CONTINENTAL LATAM CON RADAR DOPPLER REAL SINAPRED -->
    <div class="scene-layer is-active" id="scene-latam">
      <div class="latam-stage" style="position:relative; overflow:hidden; border-radius:12px; border:var(--hairline); box-shadow:0 20px 48px -12px rgba(0,0,0,0.22);">
        <!-- CAPA REAL DE RADAR METEOROLÓGICO Y FRENTE DE TORMENTA SINAPRED -->
        <img class="latam-radar-backdrop" src="../../assets/radar-sinapred-latam-clean.jpg" alt="Radar Meteorológico SINAPRED LATAM" />

        <svg viewBox="0 0 1000 900" style="position:relative; z-index:5;">
          <!-- Enlaces de telecomunicaciones regionales SITRA superpuestos al radar -->
          <g stroke="#ffffff" stroke-width="2.2" stroke-dasharray="7 5" fill="none" opacity="0.95" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
            <line x1="448" y1="248" x2="330" y2="160" />
            <line x1="448" y1="248" x2="520" y2="280" />
            <line x1="448" y1="248" x2="380" y2="210" />
            <line x1="520" y1="280" x2="580" y2="240" />
            <line x1="520" y1="280" x2="510" y2="400" />
            <line x1="510" y1="400" x2="640" y2="650" />
          </g>

          <!-- Rótulos de telemetría interconectada SITRA -->
          <g font-family="var(--font-mono)" font-size="11" font-weight="800" fill="#ffffff" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.9))" pointer-events="none">
            <!-- PANAMÁ EPICENTRO / HUB DESTACADO -->
            <g transform="translate(448, 222)">
              <rect x="-60" y="-14" width="120" height="24" rx="4" fill="#ea580c" stroke="#ffffff" stroke-width="1.8" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.4))"/>
              <text x="0" y="3" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">PANAMÁ (HUB SITRA)</text>
            </g>
          </g>

          <!-- Nodos y pulsos de sincronización LoRaWAN -->
          <circle cx="330" cy="160" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="520" cy="280" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="580" cy="240" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="510" cy="400" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="640" cy="650" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="448" cy="248" r="8" fill="#ea580c" stroke="#ffffff" stroke-width="2" />
          <circle cx="448" cy="248" r="18" fill="none" stroke="#ea580c" stroke-width="2.5">
            <animate attributeName="r" values="8;36" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </svg>

        <!-- BARRA SUPERIOR DE CAPAS METEOROLÓGICAS (PRECIPITACIÓN, TEMPERATURA, VIENTO) -->
        <div class="weather-pill-bar">
          <button class="w-pill is-active">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1"/></svg>
            Precipitación Radar
          </button>
          <button class="w-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>
            Temperatura
          </button>
          <button class="w-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
            Viento 92 km/h
          </button>
        </div>

        <!-- LEYENDA INFERIOR DE RIESGO DE IMPACTO -->
        <div class="meteo-legend-box" style="z-index:10; background:rgba(255,255,255,0.94);">
          <div style="display:flex; justify-content:space-between; color:var(--text); font-weight:700;">
            <span>NIVEL DE PRECIPITACIÓN</span>
            <span style="color:var(--accent);">EXTREMO</span>
          </div>
          <div class="meteo-legend-bar"></div>
          <div class="meteo-legend-labels">
            <span>Bajo</span>
            <span>Moderado</span>
            <span>Alto</span>
            <span>Muy Alto</span>
          </div>
        </div>
      </div>
    </div>`;

content = content.replace(oldScene1, newScene1);

// 4. Modificar ESCENA 2 (Panamá) para que también tenga la mancha de radar térmico
const oldScene2 = `<!-- ESCENA 2: DESPLIEGUE PANAMÁ CON TODAS LAS PROVINCIAS ROTULADAS -->
    <div class="scene-layer" id="scene-panama">
      <div class="panama-stage">
        <svg viewBox="0 0 1000 434">
          <g>
            \${panPaths}
          </g>
          \${panamaLabelsSvg}
          <circle cx="518.6" cy="99.3" r="7" fill="var(--accent)" />
          <circle cx="518.6" cy="99.3" r="18" fill="none" stroke="var(--accent)" stroke-width="2">
            <animate attributeName="r" values="7;32" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </div>`;

const newScene2 = `<!-- ESCENA 2: DESPLIEGUE PANAMÁ CON RADAR TÉRMICO Y PROVINCIAS ROTULADAS -->
    <div class="scene-layer" id="scene-panama">
      <div class="panama-stage" style="position:relative; overflow:hidden; border-radius:12px; border:var(--hairline); background:var(--surface); box-shadow:0 18px 40px -10px rgba(0,0,0,0.12);">
        <!-- Manchas térmicas de radar meteorológico sobre Colón y zona metropolitana -->
        <div style="position:absolute; inset:0; pointer-events:none; z-index:2; opacity:0.82;">
          <div style="position:absolute; top:12%; left:45%; width:240px; height:130px; background:radial-gradient(ellipse at center, rgba(234,88,12,0.65) 0%, rgba(245,158,11,0.45) 45%, rgba(16,185,129,0.2) 75%, transparent 100%); filter:blur(14px);"></div>
          <div style="position:absolute; top:20%; left:52%; width:160px; height:100px; background:radial-gradient(ellipse at center, rgba(220,38,38,0.7) 0%, rgba(234,88,12,0.4) 50%, transparent 100%); filter:blur(10px);"></div>
        </div>

        <svg viewBox="0 0 1000 434" style="position:relative; z-index:5;">
          <g>
            \${panPaths}
          </g>
          \${panamaLabelsSvg}
          <circle cx="518.6" cy="99.3" r="7" fill="var(--accent)" />
          <circle cx="518.6" cy="99.3" r="18" fill="none" stroke="var(--accent)" stroke-width="2">
            <animate attributeName="r" values="7;32" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </svg>

        <!-- Rótulo de radar meteorológico en Panamá -->
        <div style="position:absolute; top:16px; left:20px; z-index:10; background:rgba(255,255,255,0.94); border:var(--hairline); padding:6px 12px; border-radius:6px; font-family:var(--font-mono); font-size:10px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <div style="color:var(--accent); font-weight:700;">RADAR PRECIPITACIÓN LOCAL</div>
          <div style="color:var(--text-dim); font-size:8.5px;">ESTACIÓN RADAR COLÓN · 12.6 mm/h</div>
        </div>
      </div>
    </div>`;

content = content.replace(oldScene2, newScene2);

// 5. Reemplazar la barra de tabs y reestructurar panel-telemetria para evitar amontonamiento
const oldAsideStart = `  <aside class="panel-telemetria" id="panel-telemetria">
    <div class="pt-head">
      <span id="pt-title-mode">Sectorización Inmueble</span>
      <span class="pt-badge-view" id="pt-badge-view">VISTA GENERAL</span>
    </div>

    <!-- MODO 1: VISTA GENERAL (RESUMEN POR SECTOR) -->
    <div class="ui-view-block is-visible" id="view-mode-general">`;

const newAsideStart = `  <aside class="panel-telemetria" id="panel-telemetria">
    <!-- PESTAÑAS PRINCIPALES DEL PANEL (EVITA SOBRECARGA VISUAL) -->
    <div class="pt-tabs-bar">
      <button class="pt-tab-btn is-active" id="tab-btn-unidades" onclick="switchPtTab('unidades')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Sectorización
      </button>
      <button class="pt-tab-btn" id="tab-btn-meteo" onclick="switchPtTab('meteo')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1"/></svg>
        Meteorología (Radar)
      </button>
    </div>

    <!-- PANE 1: SECTORIZACIÓN & TRIAGE -->
    <div class="pt-tab-pane is-active" id="pane-unidades">
      <div class="pt-head">
        <span id="pt-title-mode">Sectorización Inmueble</span>
        <span class="pt-badge-view" id="pt-badge-view">VISTA GENERAL</span>
      </div>

      <!-- MODO 1: VISTA GENERAL (RESUMEN POR SECTOR) -->
      <div class="ui-view-block is-visible" id="view-mode-general">`;

content = content.replace(oldAsideStart, newAsideStart);

// Cerrar pane-unidades y abrir pane-meteo antes de la sección meteorológica
const oldMeteoSection = `    <!-- DATOS GENERALES DE TELEMETRÍA AMBIENTAL & METEOROLOGÍA ESTILO SINAPRED -->
    <div class="meteo-section">`;

const newMeteoSection = `    </div><!-- /pane-unidades -->

    <!-- PANE 2: METEOROLOGÍA & TELEMETRÍA SINAPRED / SINAPROC -->
    <div class="pt-tab-pane" id="pane-meteo">
      <div class="meteo-section" style="margin-top:0; border-top:none; padding-top:0;">`;

content = content.replace(oldMeteoSection, newMeteoSection);

// Cerrar pane-meteo antes del cierre de aside
const oldAsideEnd = `      <div class="pt-row">
        <span>Telemetría LoRaWAN:</span>
        <b id="lbl-battery" style="color:var(--text-dim); font-size:9.5px;">Batería 89% · Panel Solar 22°</b>
      </div>
    </div>
  </aside>`;

const newAsideEnd = `      <div class="pt-row">
        <span>Telemetría LoRaWAN:</span>
        <b id="lbl-battery" style="color:var(--text-dim); font-size:9.5px;">Batería 89% · Panel Solar 22°</b>
      </div>
    </div>
    </div><!-- /pane-meteo -->
  </aside>`;

content = content.replace(oldAsideEnd, newAsideEnd);

// 6. Actualizar el script cliente de animación (función switchPtTab y alternancia suave entre fases)
const scriptOld = `window.runCinematicSequence = function(onComplete) {`;
const scriptNew = `window.switchPtTab = function(tabName) {
      const btnUnidades = document.getElementById('tab-btn-unidades');
      const btnMeteo = document.getElementById('tab-btn-meteo');
      const paneUnidades = document.getElementById('pane-unidades');
      const paneMeteo = document.getElementById('pane-meteo');

      if (tabName === 'unidades') {
        if (btnUnidades) btnUnidades.classList.add('is-active');
        if (btnMeteo) btnMeteo.classList.remove('is-active');
        if (paneUnidades) paneUnidades.classList.add('is-active');
        if (paneMeteo) paneMeteo.classList.remove('is-active');
      } else {
        if (btnMeteo) btnMeteo.classList.add('is-active');
        if (btnUnidades) btnUnidades.classList.remove('is-active');
        if (paneMeteo) paneMeteo.classList.add('is-active');
        if (paneUnidades) paneUnidades.classList.remove('is-active');
      }
    };

    window.runCinematicSequence = function(onComplete) {`;

content = content.replace(scriptOld, scriptNew);

// Modificar los timeouts de la secuencia para dar tiempos de lectura amplios y activar la pestaña de meteorología durante la fase de mapa y zoom
const timeoutOld = `setTimeout(() => {
        sLatam.classList.remove('is-active');
        sPanama.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 2: <b>DESPLIEGUE TERRITORIAL PANAMÁ</b> · LOCALIZACIÓN DEL EPICENTRO EN COLÓN';
        lblMultitud.innerHTML = '1 420 en Colón';
        lblSync.innerHTML = 'En vivo (0.2s)';
      }, 5000);`;

const timeoutNew = `// Durante Fase 1: Mostrar datos meteorológicos en el panel lateral
      setTimeout(() => {
        window.switchPtTab('meteo');
      }, 600);

      // FASE 2: 7.5s - 15.0s Zoom territorial Panamá
      setTimeout(() => {
        sLatam.classList.remove('is-active');
        sPanama.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 2: <b>DESPLIEGUE TERRITORIAL PANAMÁ</b> · LOCALIZACIÓN DEL EPICENTRO EN COLÓN (ZONA DE IMPACTO)';
        lblMultitud.innerHTML = '1 420 en Colón';
        lblSync.innerHTML = 'En vivo (0.2s)';
      }, 7500);`;

content = content.replace(timeoutOld, timeoutNew);

// Ajustar el timeout de la Fase 3 a 15000ms y cambiar tab a unidades
const timeoutFase3Old = `setTimeout(() => {
        sPanama.classList.remove('is-active');
        sMallPerfil.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 3: <b>VISTA ESPECÍFICA EDIFICIO</b> · PRONÓSTICO DE FLUJO Y DETECCIÓN EN ACCESO';
        lblMultitud.innerHTML = '640 en Centro Comercial';`;

const timeoutFase3New = `setTimeout(() => {
        window.switchPtTab('unidades');
        sPanama.classList.remove('is-active');
        sMallPerfil.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 3: <b>VISTA ESPECÍFICA EDIFICIO</b> · PRONÓSTICO DE FLUJO Y DETECCIÓN EN ACCESO';
        lblMultitud.innerHTML = '640 en Centro Comercial';`;

content = content.replace(timeoutFase3Old, timeoutFase3New);

// Ajustar los tiempos de Fase 3 y 4: 15s y 23s, cierre a 33s
content = content.replace(`}, 11000);`, `}, 15000);`);
content = content.replace(`}, 19000);`, `}, 23500);`);
content = content.replace(`}, 28000);`, `}, 33500);`);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully re-architected build-panama-minimalist.mjs with real SINAPRED radar layers and tabbed panel!');
