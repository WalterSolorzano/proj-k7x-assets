import fs from 'fs';

const target = 'tools/build-panama-minimalist.mjs';
let content = fs.readFileSync(target, 'utf8');

const oldLegend = `        <!-- LEYENDA INFERIOR DE RIESGO DE IMPACTO -->
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
        </div>`;

const oldPills = `        <!-- BARRA SUPERIOR DE CAPAS METEOROLÓGICAS (PRECIPITACIÓN, TEMPERATURA, VIENTO) -->
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
        </div>`;

if (content.includes(oldLegend)) content = content.replace(oldLegend, '');
if (content.includes(oldPills)) content = content.replace(oldPills, '');

// Aumentar la proporción del mapa satelital para que ocupe de manera equilibrada el centro
content = content.replace('width: 960px;', 'width: 1040px;');
content = content.replace('height: 760px;', 'height: 620px;');

fs.writeFileSync(target, content, 'utf8');
console.log('Successfully refined stage clean layout!');
