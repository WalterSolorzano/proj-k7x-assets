import fs from 'fs';

const target = 'tools/build-panama-minimalist.mjs';
let content = fs.readFileSync(target, 'utf8');

// 1. Agregar widget meteorológico en la escena del croquis / edificio cenital
const oldCroquisHud = `        <!-- Indicador fotorrealista del nodo receptor en mástil -->
        <div class="puck-receiver-hud" style="position: absolute; top: 18%; right: 26%; z-index: 30; font-family: var(--font-mono); font-size: 11px; background: rgba(16, 24, 38, 0.9); color: #fff; padding: 8px 14px; border-radius: 4px; border: 1.5px solid #00f0ff; box-shadow: 0 0 15px rgba(0,240,255,0.4); pointer-events: none;">
          <div style="color: #00f0ff; font-weight: 700; margin-bottom: 2px;">RECEPTOR VIGÍA-07 (MÁSTIL ACTIVO)</div>
          <div style="font-size: 9.5px; color: #a0aec0;">Recepcionando pulsos telefónicos directos · LoRa / BLE</div>
          <div style="margin-top: 4px; display: flex; gap: 8px; font-size: 9px;">
            <span style="color: #48bb78;">● 100% PAQUETES SIN PÉRDIDA</span>
            <span style="color: #e2e8f0;">640 DISPOSITIVOS ENLACE</span>
          </div>
        </div>`;

const newCroquisHud = `        <!-- Indicador fotorrealista del nodo receptor en mástil -->
        <div class="puck-receiver-hud" style="position: absolute; top: 18%; right: 26%; z-index: 30; font-family: var(--font-mono); font-size: 11px; background: rgba(16, 24, 38, 0.9); color: #fff; padding: 8px 14px; border-radius: 4px; border: 1.5px solid #00f0ff; box-shadow: 0 0 15px rgba(0,240,255,0.4); pointer-events: none;">
          <div style="color: #00f0ff; font-weight: 700; margin-bottom: 2px;">RECEPTOR VIGÍA-07 (MÁSTIL ACTIVO)</div>
          <div style="font-size: 9.5px; color: #a0aec0;">Recepcionando pulsos telefónicos directos · LoRa / BLE</div>
          <div style="margin-top: 4px; display: flex; gap: 8px; font-size: 9px;">
            <span style="color: #48bb78;">● 100% PAQUETES SIN PÉRDIDA</span>
            <span style="color: #e2e8f0;">640 DISPOSITIVOS ENLACE</span>
          </div>
        </div>

        <!-- CONDICIONES METEOROLÓGICAS MICRO-CLIMÁTICAS EN SITIO (CROQUIS DEL INMUEBLE) -->
        <div class="croquis-meteo-pill" style="position: absolute; bottom: 24px; left: 24px; z-index: 30; font-family: var(--font-mono); font-size: 10px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); color: #fff; padding: 10px 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 24px rgba(0,0,0,0.3); pointer-events: none; display: flex; gap: 16px;">
          <div style="display:flex; align-items:center; gap:7px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1"/></svg>
            <div>
              <div style="font-size:8px; color:#94a3b8;">PRECIPITACIÓN CUBIERTA</div>
              <div style="font-weight:700; color:#38bdf8;">12.6 mm/h (Lluvia Intensa)</div>
            </div>
          </div>
          <div style="width:1px; height:26px; background:rgba(255,255,255,0.15);"></div>
          <div style="display:flex; align-items:center; gap:7px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
            <div>
              <div style="font-size:8px; color:#94a3b8;">ANEMÓMETRO EN NODO</div>
              <div style="font-weight:700; color:#ea580c;">92 km/h (Ráfagas)</div>
            </div>
          </div>
          <div style="width:1px; height:26px; background:rgba(255,255,255,0.15);"></div>
          <div style="display:flex; align-items:center; gap:7px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div>
              <div style="font-size:8px; color:#94a3b8;">ESTADO DE TECHUMBRE</div>
              <div style="font-weight:700; color:#10b981;">Refugio Estructural U2 Ok</div>
            </div>
          </div>
        </div>`;

if (!content.includes(oldCroquisHud)) {
  console.error('oldCroquisHud not found!');
  process.exit(1);
}

content = content.replace(oldCroquisHud, newCroquisHud);
fs.writeFileSync(target, content, 'utf8');
console.log('Successfully added micro-climate weather HUD to croquis!');
