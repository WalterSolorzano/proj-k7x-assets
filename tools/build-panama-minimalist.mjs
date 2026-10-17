import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());

const latamPaths = readFileSync(join(ROOT, 'secciones', '07-latam', 'paths.html'), 'utf8');
const panPaths = readFileSync(join(ROOT, 'assets', 'geo-panama-paths.html'), 'utf8');

// Coordenadas calibradas para cada provincia de Panamá en el viewBox 0 0 1000 434
const panamaLabelsSvg = `
  <!-- ETIQUETAS DE PROVINCIAS Y COMARCAS DE PANAMÁ -->
  <g class="panama-labels" font-family="var(--font-mono)" font-size="10.5" font-weight="600" letter-spacing="0.08em" text-anchor="middle" pointer-events="none">
    <!-- BOCAS DEL TORO -->
    <text x="145" y="85" fill="var(--text-dim)">BOCAS DEL TORO</text>
    
    <!-- CHIRIQUÍ -->
    <text x="135" y="245" fill="var(--text-dim)">CHIRIQUÍ</text>
    
    <!-- NGÄBE-BUGLÉ -->
    <text x="220" y="170" fill="var(--text-dim)" font-size="9.5">NGÄBE-BUGLÉ</text>
    
    <!-- VERAGUAS -->
    <text x="305" y="275" fill="var(--text-dim)">VERAGUAS</text>
    
    <!-- HERRERA -->
    <text x="406" y="312" fill="var(--text-dim)" font-size="9.5">HERRERA</text>
    
    <!-- LOS SANTOS -->
    <text x="460" y="360" fill="var(--text-dim)" font-size="9.5">LOS SANTOS</text>
    
    <!-- COCLÉ -->
    <text x="442" y="195" fill="var(--text-dim)">COCLÉ</text>
    
    <!-- PANAMÁ OESTE -->
    <text x="532" y="165" fill="var(--text-dim)" font-size="9.5">PANAMÁ OESTE</text>
    
    <!-- PANAMÁ -->
    <text x="670" y="130" fill="var(--text-dim)">PANAMÁ</text>
    
    <!-- GUNA YALA -->
    <text x="785" y="95" fill="var(--text-dim)" font-size="9.5">GUNA YALA</text>
    
    <!-- DARIÉN -->
    <text x="870" y="270" fill="var(--text-dim)">DARIÉN</text>
    
    <!-- COLÓN - EPICENTRO EN ROJO DESTACADO -->
    <g transform="translate(518, 70)">
      <rect x="-70" y="-14" width="140" height="22" rx="3" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.4" opacity="0.96" />
      <text x="0" y="1" fill="var(--accent)" font-weight="700" font-size="11">COLÓN · EPICENTRO</text>
    </g>
  </g>
`;

const html = `<!DOCTYPE html>
<html lang="es" data-theme="institucional">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SITRE — Sistema de Inteligencia Territorial para Rescates</title>
  <link rel="stylesheet" href="../../assets/tokens.css">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* FRANJA DE MANDO SUPERIOR PERMANENTE (INSTITUCIONAL CLARA) */
    .command-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--surface);
      border-bottom: var(--hairline);
      z-index: 100;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      padding: 0 var(--s-5);
      column-gap: var(--s-4);
      box-shadow: var(--shadow-soft);
    }

    .brand-box {
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
    }
    .brand-mark {
      color: var(--accent);
      flex: 0 0 auto;
    }
    .brand-titles {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: var(--fs-lg);
      font-weight: 700;
      letter-spacing: .06em;
      color: var(--text);
    }
    .brand-sub {
      font-family: var(--font-mono);
      font-size: var(--fs-xs);
      font-weight: 500;
      letter-spacing: .12em;
      color: var(--text-dim);
    }

    /* TELEMETRÍA EN FRANJA */
    .header-flow {
      display: flex;
      align-items: center;
      padding-left: var(--s-4);
      border-left: var(--hairline);
      gap: var(--s-4);
      font-family: var(--font-mono);
      font-size: var(--fs-xs);
      color: var(--text-dim);
    }
    .header-flow b {
      color: var(--text);
      font-weight: 600;
      font-size: var(--fs-sm);
    }
    .flow-item {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      white-space: nowrap;
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--r-pill);
      background: var(--ok);
      box-shadow: 0 0 6px var(--ok);
      animation: pulse-live 1.8s infinite;
    }
    .live-dot.alert {
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
    }
    @keyframes pulse-live {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      font-family: var(--font-mono);
      font-size: var(--fs-xs);
      color: var(--text-dim);
    }
    .header-right b {
      color: var(--text);
    }
    .badge-alert {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: var(--r-pill);
      font-weight: 600;
      letter-spacing: .04em;
    }

    /* ESCENARIO PRINCIPAL */
    #viewport {
      position: absolute;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 40px;
      overflow: hidden;
      background: var(--bg);
    }

    /* MATRIZ SUTIL DE RETÍCULA DE INGENIERÍA */
    .canvas-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, color-mix(in srgb, var(--line) 40%, transparent) 1px, transparent 1px),
        linear-gradient(to bottom, color-mix(in srgb, var(--line) 40%, transparent) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 1;
    }

    .scene-layer {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.4s var(--ease), visibility 0.4s;
      z-index: 10;
    }
    .scene-layer.is-active {
      opacity: 1;
      visibility: visible;
    }

    /* -------------------------------------------------------------
       CAPA 1: CONTINENTAL LATAM
       ------------------------------------------------------------- */
    .latam-stage {
      width: 960px;
      height: 760px;
      position: relative;
    }
    .latam-stage svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 14px 28px rgba(0,0,0,0.12));
    }
    .sec-07-latam__country {
      fill: #e9ecef;
      stroke: #718096;
      stroke-width: 1.6;
      transition: all 0.3s;
    }
    .sec-07-latam__country.is-active {
      fill: #cbd5e0;
      stroke: #4a5568;
      stroke-width: 2.0;
    }
    .sec-07-latam__country#latam-pan {
      fill: #e53e3e;
      stroke: #9b2c2c;
      stroke-width: 3.0;
      filter: drop-shadow(0 0 8px rgba(229, 62, 62, 0.6));
    }

    /* -------------------------------------------------------------
       CAPA 2: PROVINCIAL PANAMÁ
       ------------------------------------------------------------- */
    .panama-stage {
      width: 1140px;
      height: 520px;
      position: relative;
    }
    .panama-stage svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 14px 28px rgba(0,0,0,0.06));
    }
    .pan-provincia {
      fill: var(--surface);
      stroke: var(--line);
      stroke-width: 1.4;
      transition: fill 0.3s;
    }
    .pan-provincia[data-alerta="amarilla"] {
      fill: color-mix(in srgb, var(--warn) 15%, var(--surface));
      stroke: var(--warn);
      stroke-width: 1.8;
    }
    .pan-provincia[data-alerta="roja"] {
      fill: color-mix(in srgb, var(--accent) 24%, var(--surface));
      stroke: var(--accent);
      stroke-width: 2.8;
    }

    /* -------------------------------------------------------------
       CONTENEDOR DE EDIFICIO 3D
       ------------------------------------------------------------- */
    .mall-wrapper {
      position: relative;
      width: 1140px;
      height: 640px;
      background: #000000;
      border: 1px solid var(--line);
      border-radius: var(--r-md);
      overflow: hidden;
      box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.25);
    }
    .mall-render {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(105%) brightness(0.92);
      transition: transform 0.6s var(--ease);
    }

    /* EFECTO SOBREVUELO DRON (MOVIMIENTO DE CÁMARA DINÁMICO EN PLANO SUPERIOR) */
    .mall-render-drone {
      animation: drone-orbit 7s ease-in-out infinite alternate;
      transform-origin: center center;
    }
    @keyframes drone-orbit {
      0% {
        transform: scale(1.02) translate(0px, 0px) rotate(0deg);
      }
      50% {
        transform: scale(1.08) translate(-15px, -10px) rotate(-0.5deg);
      }
      100% {
        transform: scale(1.12) translate(12px, -18px) rotate(0.8deg);
      }
    }

    .view-tag {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(0,0,0,0.80);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: var(--r-sm);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: .1em;
      border: 1px solid rgba(255,255,255,0.25);
      z-index: 25;
      backdrop-filter: blur(8px);
    }
    .view-tag b { color: var(--accent); }

    /* -------------------------------------------------------------
       CAPA 3: VISTA FRONTAL / PERFIL
       ------------------------------------------------------------- */
    .people-cloud {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 20;
    }

    .human-cluster {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(176, 61, 12, 0.45) 0%, rgba(221, 106, 48, 0.25) 50%, transparent 80%);
      filter: blur(12px);
      transform: translate(-50%, -50%);
    }

    .person-pin {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      border: 1.5px solid #ffffff;
      box-shadow: 0 0 8px rgba(176, 61, 12, 0.9);
      transform: translate(-50%, -50%);
      animation: person-blink 2s infinite ease-in-out alternate;
    }
    @keyframes person-blink {
      0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
    }

    .mall-target-box {
      position: absolute;
      top: 24%;
      left: 45%;
      transform: translate(-50%, -50%);
      border: 1.5px solid var(--accent);
      padding: 10px 16px;
      background: var(--surface);
      color: var(--text);
      border-radius: var(--r-sm);
      box-shadow: var(--shadow);
      font-family: var(--font-mono);
      font-size: var(--fs-xs);
      display: flex;
      flex-direction: column;
      gap: 3px;
      z-index: 30;
      white-space: nowrap;
    }
    .mall-target-box::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 8px 6px 0;
      border-style: solid;
      border-color: var(--accent) transparent transparent;
    }
    .mall-target-box b {
      font-size: var(--fs-sm);
      color: var(--accent);
    }

    /* -------------------------------------------------------------
       CAPA 4: VISTA SUPERIOR / CENITAL (LAS 3 UNIDADES SECTORIZADAS)
       ------------------------------------------------------------- */
    .roof-zone-box {
      position: absolute;
      border: 2px dashed rgba(255, 255, 255, 0.85);
      background: rgba(176, 61, 12, 0.22);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8px 12px;
      box-shadow: inset 0 0 20px rgba(176, 61, 12, 0.35);
      transition: all 0.3s;
      z-index: 22;
      backdrop-filter: blur(2px);
    }
    .roof-zone-box.u-alta {
      border-color: var(--accent);
      background: rgba(176, 61, 12, 0.38);
    }
    .zone-badge {
      background: rgba(0,0,0,0.85);
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 2px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      align-self: flex-start;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .zone-stats {
      font-family: var(--font-mono);
      font-size: 10px;
      color: #ffffff;
      text-shadow: 0 1px 3px rgba(0,0,0,0.9);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .zone-stats b {
      font-size: 12px;
      color: #ffc977;
    }

    /* -------------------------------------------------------------
       DIAGRAMA DE FLUJO EN VIVO: TRANSMISIÓN LOCAL -> REGIONAL -> NACIONAL
       ------------------------------------------------------------- */
    .sync-pipeline {
      position: fixed;
      bottom: 50px;
      left: 36px;
      right: 36px;
      background: var(--surface);
      border: var(--hairline);
      border-radius: var(--r-md);
      padding: 10px 18px;
      box-shadow: 0 10px 25px -8px rgba(0,0,0,0.12);
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      align-items: center;
      gap: var(--s-4);
      z-index: 80;
    }

    .pipeline-node {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pipeline-tier {
      font-family: var(--font-mono);
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: var(--text-dim);
    }
    .pipeline-name {
      font-family: var(--font-display);
      font-size: var(--fs-sm);
      font-weight: 700;
      color: var(--text);
    }
    .pipeline-meta {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-dim);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .pipeline-meta b {
      color: var(--text);
    }
    .pipeline-meta .status-ok {
      color: var(--ok);
      font-weight: 600;
    }

    .pipeline-arrow {
      position: relative;
      width: 70px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pipe-line {
      width: 100%;
      height: 2px;
      background: var(--line);
      position: relative;
    }
    .pipe-packet {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
      animation: packet-travel 1.4s infinite linear;
    }
    @keyframes packet-travel {
      0% { left: 0%; opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }
    .pipe-label {
      position: absolute;
      top: -13px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--accent);
      white-space: nowrap;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    /* BARRA INFERIOR DE ESTADO / NARRATIVA */
    .status-bar-bottom {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 38px;
      background: var(--surface-2);
      border-top: var(--hairline);
      padding: 0 var(--s-5);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: var(--fs-xs);
      color: var(--text-dim);
      z-index: 90;
    }
    .status-step {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-step b {
      color: var(--text);
    }
    .status-step .step-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }

    /* TARJETA LATERAL DE TELEMETRÍA (DERECHA) - MUESTRA ESTADO DE CADA UNIDAD CON VALORES EN VIVO */
    .panel-telemetria {
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
    }
    .pt-head {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: var(--text-dim);
      border-bottom: var(--hairline);
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pt-head b { color: var(--accent); }
    .pt-badge-view {
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 3px;
      background: var(--surface-2);
      border: var(--hairline);
      color: var(--text);
    }

    /* VISTA GENERAL VS VISTA ESPECÍFICA */
    .ui-view-block {
      display: none;
    }
    .ui-view-block.is-visible {
      display: block;
    }

    /* Iconos SVG legibles */
    .ico-svg {
      display: inline-block;
      vertical-align: middle;
      width: 14px;
      height: 14px;
      margin-right: 5px;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
    }

    .unit-card {
      background: var(--surface-2);
      border: var(--hairline);
      border-radius: var(--r-sm);
      padding: 10px 12px;
      margin-bottom: 8px;
      font-family: var(--font-mono);
      font-size: 10.5px;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .unit-card.active-focus {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, var(--surface));
    }
    .uc-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
      font-weight: 700;
    }
    .uc-top .u-title {
      color: var(--text);
      display: flex;
      align-items: center;
      font-size: 11px;
    }
    .uc-top .u-count {
      color: var(--accent);
      font-size: 12px;
      font-weight: 800;
    }
    .uc-sub {
      display: flex;
      justify-content: space-between;
      color: var(--text-dim);
      font-size: 9.5px;
      line-height: 1.4;
    }
    .uc-sub .st-ok { color: var(--ok); font-weight: 600; }
    .uc-sub .st-alert { color: var(--accent); font-weight: 600; }

    /* ESTILOS DE LA VISTA ESPECÍFICA DETALLADA */
    .spec-header-card {
      background: color-mix(in srgb, var(--accent) 8%, var(--surface));
      border: 1.5px solid var(--accent);
      border-radius: var(--r-sm);
      padding: 12px 14px;
      margin-bottom: 12px;
    }
    .spec-people-big {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-top: 6px;
    }
    .spec-people-val {
      font-family: var(--font-mono);
      font-size: 26px;
      font-weight: 800;
      color: var(--accent);
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .spec-people-tag {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-dim);
      margin-top: 2px;
    }

    /* Gráfica de flujo Antes vs Después */
    .flow-chart-box {
      background: var(--surface-2);
      border: var(--hairline);
      border-radius: var(--r-sm);
      padding: 11px 13px;
      margin-bottom: 12px;
    }
    .flow-chart-title {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flow-bars-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }
    .flow-bar-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-mono);
      font-size: 10px;
    }
    .flow-bar-label {
      width: 82px;
      color: var(--text-dim);
      flex-shrink: 0;
    }
    .flow-bar-track {
      flex: 1;
      height: 9px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    .flow-bar-fill {
      height: 100%;
      border-radius: 4px;
    }
    .flow-bar-fill.before {
      background: #718096;
      width: 88%;
    }
    .flow-bar-fill.after {
      background: var(--accent);
      width: 38%;
    }
    .flow-bar-val {
      width: 50px;
      text-align: right;
      font-weight: 700;
      color: var(--text);
    }

    /* Desglose de salud y estado en 2 filas limpias */
    .spec-health-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .health-pill {
      background: var(--surface-2);
      border: var(--hairline);
      border-radius: var(--r-sm);
      padding: 8px 10px;
      font-family: var(--font-mono);
      font-size: 10px;
    }
    .health-pill-title {
      color: var(--text-dim);
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      font-size: 9.5px;
    }
    .health-pill-val {
      font-weight: 700;
      font-size: 11.5px;
    }
    .health-pill-val.alert { color: var(--accent); }
    .health-pill-val.ok { color: var(--ok); }

    /* TARJETA DE DATOS METEOROLÓGICOS EN VIVO (ESTILO SINAPRED) */
    .meteo-section {
      margin-top: 10px;
      border-top: var(--hairline);
      padding-top: 10px;
    }
    .meteo-title {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--text-dim);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meteo-title b { color: var(--accent); }
    .meteo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 8px;
    }
    .meteo-card {
      background: var(--surface-2);
      border: var(--hairline);
      border-radius: var(--r-sm);
      padding: 7px 9px;
      font-family: var(--font-mono);
    }
    .meteo-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-dim);
      font-size: 9px;
      margin-bottom: 3px;
    }
    .meteo-card-val {
      font-size: 13px;
      font-weight: 800;
      color: var(--text);
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .meteo-spark {
      width: 36px;
      height: 12px;
    }
    .meteo-card-val small {
      font-size: 9px;
      font-weight: 500;
      color: var(--text-dim);
    }

    /* BARRA DE CAPAS METEOROLÓGICAS (SUPERIOR EN MAPA) */
    .weather-pill-bar {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      padding: 4px 6px;
      border-radius: 20px;
      border: var(--hairline);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      z-index: 25;
      font-family: var(--font-mono);
      font-size: 10px;
    }
    .w-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      font-weight: 600;
    }
    .w-pill.is-active {
      background: var(--accent);
      color: #fff;
    }

    /* LEYENDA TÉRMICA / RIESGO EN ESQUINA INFERIOR */
    .meteo-legend-box {
      position: absolute;
      bottom: 16px;
      left: 28px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      padding: 8px 12px;
      border-radius: var(--r-sm);
      border: var(--hairline);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      z-index: 25;
      font-family: var(--font-mono);
      font-size: 9.5px;
      width: 220px;
    }
    .meteo-legend-bar {
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(to right, #48bb78, #ecc94b, #ed8936, #e53e3e, #9b2c2c);
      margin: 5px 0 3px;
    }
    .meteo-legend-labels {
      display: flex;
      justify-content: space-between;
      color: var(--text-dim);
      font-size: 8.5px;
    }

    .pt-general {
      border-top: var(--hairline);
      padding-top: 10px;
      margin-top: 4px;
      font-size: 10.5px;
    }
    .pt-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 3px 0;
      color: var(--text-dim);
    }
    .pt-row b { color: var(--text); font-family: var(--font-mono); }

    /* NODO VIGÍA 3D FLOTANTE (IZQUIERDA) */
    .nodo-monitor-box {
      position: fixed;
      top: 76px;
      left: 28px;
      width: 200px;
      background: var(--surface);
      border: var(--hairline);
      border-radius: var(--r-md);
      overflow: hidden;
      box-shadow: 0 16px 36px -8px rgba(0,0,0,0.14);
      z-index: 85;
      font-family: var(--font-mono);
    }
    .nodo-monitor-head {
      padding: 6px 10px;
      background: var(--surface-2);
      border-bottom: var(--hairline);
      font-size: 10px;
      letter-spacing: .1em;
      color: var(--text-dim);
      display: flex;
      justify-content: space-between;
    }
    .nodo-monitor-head b { color: var(--text); }
    .nodo-video-wrap {
      width: 100%;
      height: 110px;
      background: #000;
    }
    .nodo-video-wrap video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>

  <!-- FRANJA DE MANDO INSTITUCIONAL SITRE -->
  <header class="command-header">
    <div class="brand-box">
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
    </div>

    <div class="header-flow">
      <div class="flow-item">
        <span class="live-dot"></span>
        <span>Red LoRa: <b id="lbl-nodos">34/42 Nodos en línea</b></span>
      </div>
      <div class="flow-item">
        <span>Sincronización: <b id="lbl-sync">En vivo (0.4s)</b></span>
      </div>
      <div class="flow-item">
        <span>Carga Inmueble: <b id="lbl-multitud">640 personas</b></span>
      </div>
    </div>

    <div class="header-right">
      <span class="badge-alert" id="lbl-badge-alert">
        <span class="live-dot alert"></span>
        Prioridad 1 · Impacto Inminente
      </span>
      <span>Corte: <b>17 Oct · 04:30</b></span>
    </div>
  </header>

  <!-- ESCENARIO DINÁMICO DE NAVEGACIÓN -->
  <main id="viewport">
    <div class="canvas-grid"></div>

    <!-- ESCENA 1: CONTINENTAL LATAM -->
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
            ${latamPaths}
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
    </div>

    <!-- ESCENA 2: DESPLIEGUE PANAMÁ CON TODAS LAS PROVINCIAS ROTULADAS -->
    <div class="scene-layer" id="scene-panama">
      <div class="panama-stage">
        <svg viewBox="0 0 1000 434">
          <g>
            ${panPaths}
          </g>
          ${panamaLabelsSvg}
          <circle cx="518.6" cy="99.3" r="7" fill="var(--accent)" />
          <circle cx="518.6" cy="99.3" r="18" fill="none" stroke="var(--accent)" stroke-width="2">
            <animate attributeName="r" values="7;32" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </div>

    <!-- ESCENA 3: EDIFICIO 3D VISTA DE PERFIL (FRONTAL CON DETECCIÓN) -->
    <div class="scene-layer" id="scene-mall-perfil">
      <div class="mall-wrapper">
        <span class="view-tag">VISTA 3D: <b>PERFIL FRONTAL · ACCESO Y FACHADA</b></span>
        <img src="../../presentacion/3d/ref-40-centro-comercial.png" class="mall-render" alt="Centro Comercial Perfil">

        <div class="people-cloud">
          <div class="human-cluster" style="top: 58%; left: 42%; width: 260px; height: 110px;"></div>
          <div class="human-cluster" style="top: 56%; left: 32%; width: 140px; height: 80px;"></div>
          <div class="human-cluster" style="top: 60%; left: 52%; width: 120px; height: 70px;"></div>

          <span class="person-pin" style="top: 57%; left: 36%;"></span>
          <span class="person-pin" style="top: 59%; left: 38%; animation-delay: 0.2s;"></span>
          <span class="person-pin" style="top: 56%; left: 40%; animation-delay: 0.4s;"></span>
          <span class="person-pin" style="top: 61%; left: 41%; animation-delay: 0.6s;"></span>
          <span class="person-pin" style="top: 58%; left: 43%; animation-delay: 0.1s;"></span>
          <span class="person-pin" style="top: 56%; left: 45%; animation-delay: 0.3s;"></span>
          <span class="person-pin" style="top: 60%; left: 47%; animation-delay: 0.5s;"></span>
          <span class="person-pin" style="top: 57%; left: 48%; animation-delay: 0.7s;"></span>
          <span class="person-pin" style="top: 59%; left: 51%; animation-delay: 0.3s;"></span>
          <span class="person-pin" style="top: 62%; left: 35%; animation-delay: 0.8s;"></span>
          <span class="person-pin" style="top: 55%; left: 33%; animation-delay: 0.2s;"></span>
        </div>

        <div class="mall-target-box">
          <span>UNIDAD 1 · ACCESO PRINCIPAL (CRÍTICO)</span>
          <b id="lbl-box-pers">380 PERSONAS DETECTADAS</b>
          <span style="color: var(--text-dim); font-size: 10px;">Afluencia en marquesina y salida de evacuación</span>
        </div>
      </div>
    </div>

    <!-- ESCENA 4: EDIFICIO 3D VISTA SUPERIOR / CENITAL (DESPIECE DE TECHO Y RECEPCIÓN DE DATOS TELEFÓNICOS EN VIGÍA-07) -->
    <div class="scene-layer" id="scene-mall-superior">
      <div class="mall-wrapper">
        <span class="view-tag">VISTA 3D BLENDER: <b>DESPIECE DE CUBIERTA · TELÉFONOS ENVIANDO DATOS AL NODO VIGÍA-07</b></span>
        <img src="../../presentacion/3d/ref-44-interior-senales.png" class="mall-render mall-render-drone" alt="Centro Comercial Interior Señales Receptor">

        <!-- Indicador fotorrealista del nodo receptor en mástil -->
        <div class="puck-receiver-hud" style="position: absolute; top: 18%; right: 26%; z-index: 30; font-family: var(--font-mono); font-size: 11px; background: rgba(16, 24, 38, 0.9); color: #fff; padding: 8px 14px; border-radius: 4px; border: 1.5px solid #00f0ff; box-shadow: 0 0 15px rgba(0,240,255,0.4); pointer-events: none;">
          <div style="color: #00f0ff; font-weight: 700; margin-bottom: 2px;">RECEPTOR VIGÍA-07 (MÁSTIL ACTIVO)</div>
          <div style="font-size: 9.5px; color: #a0aec0;">Recepcionando pulsos telefónicos directos · LoRa / BLE</div>
          <div style="margin-top: 4px; display: flex; gap: 8px; font-size: 9px;">
            <span style="color: #48bb78;">● 100% PAQUETES SIN PÉRDIDA</span>
            <span style="color: #e2e8f0;">640 DISPOSITIVOS ENLACE</span>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- PANEL DE TRANSMISIÓN DE INFORMACIÓN EN VIVO (LOCAL -> REGIONAL -> NACIONAL) -->
  <div class="sync-pipeline" id="sync-pipeline">
    <div class="pipeline-node">
      <span class="pipeline-tier">1. Nivel Local</span>
      <span class="pipeline-name">Nodo Vigía 07</span>
      <div class="pipeline-meta">
        <span>Inmueble: <b>Centro Comercial</b></span>
        <span class="status-ok">● Emisión RF</span>
      </div>
    </div>

    <div class="pipeline-arrow">
      <div class="pipe-line">
        <div class="pipe-packet"></div>
      </div>
      <span class="pipe-label">LoRa 915 MHz</span>
    </div>

    <div class="pipeline-node">
      <span class="pipeline-tier">2. Nivel Regional</span>
      <span class="pipeline-name" id="pipe-reg-name">Estación Colón</span>
      <div class="pipeline-meta">
        <span>Store & Forward: <b id="pipe-queue">1 246 en cola</b></span>
        <span class="status-ok">● RX 100%</span>
      </div>
    </div>

    <div class="pipeline-arrow">
      <div class="pipe-line">
        <div class="pipe-packet" style="animation-delay: 0.7s;"></div>
      </div>
      <span class="pipe-label">Enlace Satelital</span>
    </div>

    <div class="pipeline-node">
      <span class="pipeline-tier">3. Nivel Nacional</span>
      <span class="pipeline-name">Centro SINAPROC</span>
      <div class="pipeline-meta">
        <span>SITRE Central: <b>Prioridad 1 (IPR 0.94)</b></span>
        <span class="status-ok">● Sincronizado</span>
      </div>
    </div>
  </div>

  <!-- TARJETA LATERAL DE TELEMETRÍA (DERECHA) - ESTADO DINÁMICO GENERAL / ESPECÍFICO -->
  <aside class="panel-telemetria" id="panel-telemetria">
    <div class="pt-head">
      <span id="pt-title-mode">Sectorización Inmueble</span>
      <span class="pt-badge-view" id="pt-badge-view">VISTA GENERAL</span>
    </div>

    <!-- MODO 1: VISTA GENERAL (RESUMEN POR SECTOR) -->
    <div class="ui-view-block is-visible" id="view-mode-general">
      <!-- TARJETA UNIDAD 1 -->
      <div class="unit-card active-focus" id="card-u1">
        <div class="uc-top">
          <span class="u-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M6 11h3M6 15h3M15 11h3M15 15h3M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M12 3l9 4M12 3 3 7"/></svg>
            U1: Acceso / Fachada
          </span>
          <span class="u-count" id="uc-count-u1">380 pers.</span>
        </div>
        <div class="uc-sub">
          <span><svg class="ico-svg" style="stroke:var(--accent);" viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 4 heridos leves · Salida bloqueada</span>
        </div>
        <div class="uc-sub" style="margin-top:2px;">
          <span>Operatividad: <b>Prioridad Rescate 1 (IPR 0.94)</b></span>
        </div>
      </div>

      <!-- TARJETA UNIDAD 2 -->
      <div class="unit-card" id="card-u2">
        <div class="uc-top">
          <span class="u-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            U2: Nave Central
          </span>
          <span class="u-count" id="uc-count-u2">190 pers.</span>
        </div>
        <div class="uc-sub">
          <span><svg class="ico-svg" style="stroke:var(--ok);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> <b class="st-ok">Estables</b> · Segundo piso</span>
        </div>
        <div class="uc-sub" style="margin-top:2px;">
          <span>Agua: <b id="uc-water">+0.40 m · Refugio seguro</b></span>
        </div>
      </div>

      <!-- TARJETA UNIDAD 3 -->
      <div class="unit-card" id="card-u3">
        <div class="uc-top">
          <span class="u-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            U3: Carga / Logística
          </span>
          <span class="u-count" id="uc-count-u3">70 pers.</span>
        </div>
        <div class="uc-sub">
          <span><svg class="ico-svg" style="stroke:var(--ok);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> <b class="st-ok">Sin lesionados</b></span>
        </div>
        <div class="uc-sub" style="margin-top:2px;">
          <span>Evacuación: <b class="st-ok">Vía libre hacia Punto Seguro</b></span>
        </div>
      </div>
    </div>

    <!-- MODO 2: VISTA ESPECÍFICA DETALLADA (GRAFICAS DE FLUJO Y DETECCIÓN AL ENTRAR AL EDIFICIO) -->
    <div class="ui-view-block" id="view-mode-specific">
      <!-- TARJETA PRINCIPAL DEL SECTOR ACTIVO -->
      <div class="spec-header-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:.08em;">
            <svg class="ico-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ZONA CRÍTICA: ACCESO SUR
          </span>
          <span style="font-family:var(--font-mono); font-size:9px; background:var(--accent); color:#fff; padding:1px 5px; border-radius:3px; font-weight:700;">ALTA PRIORIDAD</span>
        </div>
        
        <div class="spec-people-big">
          <div>
            <div class="spec-people-val" id="spec-people-count">380</div>
            <div class="spec-people-tag">PERSONAS LOCALIZADAS</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--accent);">IPR: 0.94</div>
            <div class="spec-people-tag">ÍNDICE PRIORIDAD</div>
          </div>
        </div>
      </div>

      <!-- GRÁFICA: EVOLUCIÓN DEL FLUJO DE PERSONAS (ANTES VS DESPUÉS DEL COLAPSO) -->
      <div class="flow-chart-box">
        <div class="flow-chart-title">
          <span>
            <svg class="ico-svg" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Dinámica de Flujo Peatonal
          </span>
          <b style="color:var(--accent);">Δ -62% ÉXODO</b>
        </div>
        
        <div class="flow-bars-container">
          <div class="flow-bar-row">
            <span class="flow-bar-label">Antes impacto:</span>
            <div class="flow-bar-track">
              <div class="flow-bar-fill before" style="width: 88%;"></div>
            </div>
            <span class="flow-bar-val">1 000/h</span>
          </div>
          <div class="flow-bar-row">
            <span class="flow-bar-label">Tras colapso:</span>
            <div class="flow-bar-track">
              <div class="flow-bar-fill after" id="bar-fill-after" style="width: 38%;"></div>
            </div>
            <span class="flow-bar-val" style="color:var(--accent);" id="lbl-val-after">380/h</span>
          </div>
        </div>
      </div>

      <!-- ESTADO DE SALUD Y OPERATIVIDAD (ICONOS LEGIBLES) -->
      <div class="spec-health-grid">
        <div class="health-pill">
          <div class="health-pill-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Salud / Triage
          </div>
          <div class="health-pill-val alert">4 Heridos Leves</div>
        </div>

        <div class="health-pill">
          <div class="health-pill-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Acceso Físico
          </div>
          <div class="health-pill-val alert">Salida Bloqueada</div>
        </div>

        <div class="health-pill">
          <div class="health-pill-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
            Pulsos RF
          </div>
          <div class="health-pill-val ok">100% Enlace BLE</div>
        </div>

        <div class="health-pill">
          <div class="health-pill-title">
            <svg class="ico-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            Ventana Rescate
          </div>
          <div class="health-pill-val ok">&lt; 45 Minutos</div>
        </div>
      </div>
    </div>

    <!-- DATOS GENERALES DE TELEMETRÍA AMBIENTAL & METEOROLOGÍA ESTILO SINAPRED -->
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
    </div>
  </aside>

  <!-- NODO HARDWARE 3D EN ESQUINA IZQUIERDA -->
  <div class="nodo-monitor-box" id="nodo-box">
    <div class="nodo-monitor-head">
      <span>NODO CUBIERTA</span>
      <b>VIGÍA-07 (360°)</b>
    </div>
    <div class="nodo-video-wrap">
      <video src="../../presentacion/video/3d-01-turntable0001-0193.mp4" autoplay loop muted playsinline></video>
    </div>
  </div>

  <!-- BARRA INFERIOR DE NARRATIVA Y FASES -->
  <footer class="status-bar-bottom">
    <div class="status-step">
      <span class="step-dot"></span>
      <span id="txt-narrative">FASE 1: <b>RED REGIONAL LATAM</b> · MONITOREO CONTINENTAL Y ALERTA TEMPRANA</span>
    </div>
    <div>
      <span>PROTOCOLO: <b>STORE-AND-FORWARD RESILIENTE A CORTES</b></span>
    </div>
  </footer>

  <script>
    window.runCinematicSequence = function(onComplete) {
      const sLatam = document.getElementById('scene-latam');
      const sPanama = document.getElementById('scene-panama');
      const sMallPerfil = document.getElementById('scene-mall-perfil');
      const sMallSuperior = document.getElementById('scene-mall-superior');
      const txtNarrative = document.getElementById('txt-narrative');
      const lblMultitud = document.getElementById('lbl-multitud');
      const lblSync = document.getElementById('lbl-sync');
      const pipeQueue = document.getElementById('pipe-queue');
      const lblWind = document.getElementById('lbl-wind');
      const cardU1 = document.getElementById('card-u1');
      const cardU2 = document.getElementById('card-u2');
      const cardU3 = document.getElementById('card-u3');

      // Actualización en vivo periódica para menús y datos
      let countSec = 0;
      const liveInterval = setInterval(() => {
        countSec++;
        // Variación sutil en telemetría de viento y cola de paquetes
        const windSpeed = 90 + Math.floor(Math.random() * 6);
        if (lblWind) lblWind.textContent = windSpeed + ' km/h (Anemómetro)';
        if (pipeQueue) {
          const packets = 1246 + (countSec * 4);
          pipeQueue.textContent = packets.toLocaleString() + ' en cola';
        }
      }, 1200);

      // Duración cinematográfica extendida: 28 segundos en total
      // FASE 1: 0s - 5.0s LATAM Continental con red de telemetría visible
      // FASE 2: 5.0s - 11.0s Zoom territorial Panamá con nombres de provincias y foco en Colón
      // FASE 3: 11.0s - 19.0s Edificio 3D de Perfil · Conmutación a Vista Específica con gráfica e iconos
      // FASE 4: 19.0s - 28.0s Edificio 3D Cenital (Blender) · Despiece de cubierta y señales a receptor

      // Referencias a los bloques de modo general y específico
      const vGeneral = document.getElementById('view-mode-general');
      const vSpecific = document.getElementById('view-mode-specific');
      const ptBadgeView = document.getElementById('pt-badge-view');
      const ptTitleMode = document.getElementById('pt-title-mode');

      setTimeout(() => {
        sLatam.classList.remove('is-active');
        sPanama.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 2: <b>DESPLIEGUE TERRITORIAL PANAMÁ</b> · LOCALIZACIÓN DEL EPICENTRO EN COLÓN';
        lblMultitud.innerHTML = '1 420 en Colón';
        lblSync.innerHTML = 'En vivo (0.2s)';
      }, 5000);

      setTimeout(() => {
        sPanama.classList.remove('is-active');
        sMallPerfil.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 3: <b>VISTA ESPECÍFICA EDIFICIO</b> · PRONÓSTICO DE FLUJO Y DETECCIÓN EN ACCESO';
        lblMultitud.innerHTML = '640 en Centro Comercial';

        // TRANSICIÓN AUTOMÁTICA A LA UI ESPECÍFICA CON GRÁFICA DE FLUJO E ICONOS
        if (vGeneral && vSpecific) {
          vGeneral.classList.remove('is-visible');
          vSpecific.classList.add('is-visible');
          if (ptBadgeView) {
            ptBadgeView.textContent = 'VISTA ESPECÍFICA';
            ptBadgeView.style.background = 'var(--accent)';
            ptBadgeView.style.color = '#fff';
          }
          if (ptTitleMode) ptTitleMode.textContent = 'Análisis Específico de Flujo';
        }
      }, 11000);

      setTimeout(() => {
        sMallPerfil.classList.remove('is-active');
        sMallSuperior.classList.add('is-active');
        txtNarrative.innerHTML = 'FASE 4: <b>VISTA CENITAL SUPERIOR (BLENDER 3D)</b> · DESPIECE DE CUBIERTA Y SECTORIZACIÓN';

        // Regresar a la sectorización de las 3 unidades con sus tarjetas activas
        if (vGeneral && vSpecific) {
          vSpecific.classList.remove('is-visible');
          vGeneral.classList.add('is-visible');
          if (ptBadgeView) {
            ptBadgeView.textContent = '3 UNIDADES';
            ptBadgeView.style.background = 'var(--surface-2)';
            ptBadgeView.style.color = 'var(--text)';
          }
          if (ptTitleMode) ptTitleMode.textContent = 'Sectorización Inmueble';
        }

        // Efecto dinámico de foco alternado entre las unidades con ritmo pausado
        setTimeout(() => {
          if (cardU1 && cardU2) {
            cardU1.classList.remove('active-focus');
            cardU2.classList.add('active-focus');
          }
        }, 2800);

        setTimeout(() => {
          if (cardU2 && cardU3) {
            cardU2.classList.remove('active-focus');
            cardU3.classList.add('active-focus');
          }
        }, 5600);

      }, 19000);

      setTimeout(() => {
        clearInterval(liveInterval);
        if (onComplete) onComplete();
      }, 28000);
    };
  </script>
</body>
</html>
`;

writeFileSync(join(ROOT, 'mockups', 'panama', 'experiencia-continua.html'), html, 'utf8');
console.log('Actualizado experiencia-continua.html con cajas de unidades 100% calibradas.');
