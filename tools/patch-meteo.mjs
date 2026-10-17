import fs from 'fs';

const targetFile = 'tools/build-panama-minimalist.mjs';
let content = fs.readFileSync(targetFile, 'utf8');

const targetStr = `    <!-- DATOS GENERALES DE TELEMETRÍA AMBIENTAL -->
    <div class="pt-general">
      <div class="pt-row">
        <span>Total Pronosticado:</span>
        <b style="color:var(--accent);" id="lbl-pt-total">640 personas en inmueble</b>
      </div>
      <div class="pt-row">
        <span>Viento Exterior:</span>
        <b id="lbl-wind">92 km/h (Anemómetro)</b>
      </div>
      <div class="pt-row">
        <span>Telemetría:</span>
        <b id="lbl-battery">Batería 89% · Panel Solar 22°</b>
      </div>
    </div>`;

const replacementStr = `    <!-- DATOS GENERALES DE TELEMETRÍA AMBIENTAL & METEOROLOGÍA ESTILO SINAPRED -->
    <div class="meteo-section">
      <div class="meteo-title">
        <span>ESTACIÓN METEOROLÓGICA & RADAR</span>
        <b>SINAPROC / SINAPRED</b>
      </div>
      <div class="meteo-grid">
        <!-- HUMEDAD -->
        <div class="meteo-card">
          <div class="meteo-card-top">
            <span class="meteo-card-label">HUMEDAD REL.</span>
            <svg class="meteo-sparkline" viewBox="0 0 40 16">
              <path d="M2,12 Q10,4 20,9 T38,5" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="meteo-card-val" style="color:#0284c7;">78<span class="meteo-card-unit">%</span></div>
          <span style="font-size:8px; color:var(--text-dim);">Sat. Humedad Alta</span>
        </div>

        <!-- VIENTO / RÁFAGAS -->
        <div class="meteo-card">
          <div class="meteo-card-top">
            <span class="meteo-card-label">VIENTO / RÁFAGA</span>
            <svg class="meteo-sparkline" viewBox="0 0 40 16">
              <path d="M2,13 L12,8 L22,14 L32,3 L38,6" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="meteo-card-val" id="lbl-wind" style="color:#ea580c;">92<span class="meteo-card-unit">km/h</span></div>
          <span style="font-size:8px; color:var(--text-dim);">Anemómetro NE</span>
        </div>

        <!-- LLUVIA ACUMULADA -->
        <div class="meteo-card">
          <div class="meteo-card-top">
            <span class="meteo-card-label">PRECIPITACIÓN</span>
            <svg class="meteo-sparkline" viewBox="0 0 40 16">
              <rect x="3" y="9" width="4" height="7" fill="#2563eb" rx="1"/>
              <rect x="11" y="6" width="4" height="10" fill="#2563eb" rx="1"/>
              <rect x="19" y="4" width="4" height="12" fill="#2563eb" rx="1"/>
              <rect x="27" y="2" width="4" height="14" fill="#2563eb" rx="1"/>
              <rect x="35" y="1" width="4" height="15" fill="#0284c7" rx="1"/>
            </svg>
          </div>
          <div class="meteo-card-val" style="color:#2563eb;">12.6<span class="meteo-card-unit">mm/h</span></div>
          <span style="font-size:8px; color:var(--text-dim);">Radar Acumulado</span>
        </div>

        <!-- PRESIÓN ATMOSFÉRICA -->
        <div class="meteo-card">
          <div class="meteo-card-top">
            <span class="meteo-card-label">PRESIÓN BAROM.</span>
            <svg class="meteo-sparkline" viewBox="0 0 40 16">
              <path d="M2,6 Q12,12 24,11 T38,15" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="meteo-card-val" style="color:#7c3aed;">1012<span class="meteo-card-unit">hPa</span></div>
          <span style="font-size:8px; color:var(--text-dim);">Barómetro Estable</span>
        </div>
      </div>

      <div class="pt-row" style="margin-top:6px; border-top:1px dashed var(--border); padding-top:5px;">
        <span>Pronóstico Ocupación:</span>
        <b style="color:var(--accent); font-family:var(--font-mono); font-size:11px;" id="lbl-pt-total">640 personas en inmueble</b>
      </div>
      <div class="pt-row">
        <span>Telemetría LoRaWAN:</span>
        <b id="lbl-battery" style="color:var(--text-dim); font-size:9.5px;">Batería 89% · Panel Solar 22°</b>
      </div>
    </div>`;

if (!content.includes(targetStr)) {
  console.error("targetStr not found in file!");
  process.exit(1);
}

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully updated build-panama-minimalist.mjs with SINAPRED meteorological widgets!");
