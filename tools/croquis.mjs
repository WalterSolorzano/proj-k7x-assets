// tools/croquis.mjs — genera secciones/17-croquis/section.html
//
// Por qué un generador y no HTML a mano: la escena es una proyección isométrica con decenas de
// volúmenes. Escribir cada <polygon> a mano es imposible de mantener y de corregir; aquí se
// describen las cosas por su posición en el mundo y la proyección hace el resto. El resultado se
// hornea dentro de section.html (la sección es HTML estático, sin JS en el navegador).
//
// Ejes 2:1 · el mundo (x,y) se proyecta a pantalla con P().
//   x+ → abajo-derecha   ·   y+ → abajo-izquierda
// El mar está en y alto (abajo-izquierda); la estación base, tierra adentro (arriba-derecha).
//
// Dos lecciones de las pasadas anteriores, ya incorporadas:
//   1. El mundo se dimensiona para LLENAR el encuadre. La primera versión dejaba media pantalla
//      de suelo vacío y el contenido quedaba en una franja diagonal.
//   2. Los rótulos de sector van sobre la techumbre de su columna DERECHA y el bloque de lecturas
//      vive arriba a la izquierda: así el margen de anotación y el mapa no se pisan.
//
// uso: node tools/croquis.mjs
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const X0 = 560, Y0 = 60, SX = 0.68, SY = 0.34;
const r = (n) => Math.round(n * 10) / 10;
const P = (x, y) => [r(X0 + SX * (x - y)), r(Y0 + SY * (x + y))];
const pts = (a) => a.map((p) => `${p[0]},${p[1]}`).join(' ');
const up = (p, h) => [p[0], r(p[1] - h)];
const poly = (cls, a, extra = '') => `<polygon class="${cls}" points="${pts(a)}"${extra}/>`;
/** Encoge un polígono hacia su centroide: sirve para el pretil de la techumbre. */
const inset = (a, f = 0.84) => {
  const cx = a.reduce((s, p) => s + p[0], 0) / a.length;
  const cy = a.reduce((s, p) => s + p[1], 0) / a.length;
  return a.map((p) => [r(cx + (p[0] - cx) * f), r(cy + (p[1] - cy) * f)]);
};

/** Volumen isométrico: cara superior + dos caras laterales (+ pretil opcional). */
function box(x0, y0, x1, y1, h, cls, pretil = false) {
  const a = P(x0, y0), b = P(x1, y0), c = P(x1, y1), d = P(x0, y1);
  const A = up(a, h), B = up(b, h), C = up(c, h), D = up(d, h);
  return `<g class="${cls}">`
    + poly('f-l', [d, c, C, D])
    + poly('f-r', [b, c, C, B])
    + poly('f-t', [A, B, C, D])
    + (pretil ? poly('f-p', inset([A, B, C, D])) : '')
    + '</g>';
}

/** Poste vertical con dos tonos y tapa elíptica. */
const poste = (cx, y0, w, h, cls) =>
  `<g class="${cls}"><rect class="p-l" x="${r(cx - w / 2)}" y="${r(y0 - h)}" width="${r(w / 2)}" height="${r(h)}"/>`
  + `<rect class="p-r" x="${r(cx)}" y="${r(y0 - h)}" width="${r(w / 2)}" height="${r(h)}"/>`
  + `<ellipse class="p-c" cx="${r(cx)}" cy="${r(y0 - h)}" rx="${r(w / 2)}" ry="${r(w / 4)}"/></g>`;

const T = (x, y, t, cls = 'cz__rot cz__halo', anchor = 'start') =>
  `<text class="${cls}" x="${r(x)}" y="${r(y)}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${t}</text>`;

// ============================================================== el mundo
const BW = 200, GAP = 40;
const COLS = [0, 240, 480, 720];
const ROWS = [0, 240, 480];
const PROM_A = 800, PROM_B = 880;
const SEA = 940;

const SECTOR = {
  0: ['Puerto Norte', 'Mercado Viejo', 'Colonia El Roble'],
  1: ['Ribera del Río', 'Barrio La Curva', 'Malecón Centro'],
};
// Relleno por carga real (§4.1). Ribera del Río va en `--nodata`: su nodo está caído.
const HEAT = {
  'Malecón Centro': 'h5', 'Puerto Norte': 'h4', 'Barrio La Curva': 'h3',
  'Mercado Viejo': 'h1', 'Colonia El Roble': 'h2', 'Ribera del Río': 'hn',
};
const ALTURA = {
  'Malecón Centro': 62, 'Puerto Norte': 48, 'Barrio La Curva': 34,
  'Mercado Viejo': 26, 'Colonia El Roble': 30, 'Ribera del Río': 22,
};
const DATO = {
  'Malecón Centro': '780 PERSONAS', 'Puerto Norte': '640 PERSONAS', 'Barrio La Curva': '240 PERSONAS',
  'Mercado Viejo': '90 PERSONAS', 'Colonia El Roble': '260 PERSONAS', 'Ribera del Río': 'SIN DATO · NODOS EN SILENCIO',
};

const nodo = { x: 700, y: 840 };
const base = { x: 1230, y: 240 };
const np = P(nodo.x, nodo.y);
const PUCK_H = 190;
const puck = up(np, PUCK_H);
const bp = P(base.x, base.y);
const twr = bp[1] - 168;                     // punta de la torre de la estación base

const out = [];

// --- suelo ---------------------------------------------------------------
out.push(poly('f-suelo', [P(-300, -400), P(1600, -400), P(1600, 1700), P(-300, 1700)]));

// --- agua y oleaje -------------------------------------------------------
out.push(poly('f-agua', [P(-300, SEA), P(1600, SEA), P(1600, 1700), P(-300, 1700)]));
out.push(poly('f-marea', [P(-300, SEA), P(1600, SEA), P(1600, SEA + 58), P(-300, SEA + 58)]));
for (let i = 0; i < 3; i++) {
  const yo = SEA + 110 + i * 130;
  out.push(`<path class="ola ola--${i + 1}" d="M${pts([P(-180, yo), P(220, yo + 30), P(620, yo), P(1020, yo + 30), P(1420, yo)])}"/>`);
}

// --- paseo del malecón (cresta seca elevada) -----------------------------
out.push(box(-320, PROM_A, 1620, PROM_B, 22, 'cz__paseo'));
// hueco por el que sube el agua a la calle (Calle El Muelle)
out.push(poly('cz__brecha', [P(60, PROM_A), P(200, PROM_A), P(200, PROM_B), P(60, PROM_B)]));

// --- manzanas ------------------------------------------------------------
for (let ci = 0; ci < COLS.length; ci++) {
  for (let ri = 0; ri < ROWS.length; ri++) {
    const x0 = COLS[ci], y0 = ROWS[ri];
    const nombre = SECTOR[Math.floor(ci / 2)][ri];
    const h = ALTURA[nombre] + ((ci * 7 + ri * 5) % 9);
    out.push(box(x0, y0, x0 + BW, y0 + BW, h, `manz ${HEAT[nombre]}`, true));
  }
}
// Rótulos de sector sobre la techumbre de su columna derecha: deja libre el margen izquierdo,
// donde vive el bloque de lecturas.
for (let cp = 0; cp < 2; cp++) {
  for (let ri = 0; ri < ROWS.length; ri++) {
    const nombre = SECTOR[cp][ri];
    const c = P(COLS[cp * 2 + 1] + BW / 2, ROWS[ri] + BW / 2);
    const t = up(c, ALTURA[nombre] + 44);
    out.push(T(t[0], t[1], nombre, 'cz__rot cz__halo', 'middle'));
    out.push(T(t[0], t[1] + 19, DATO[nombre], 'cz__sub cz__halo', 'middle'));
  }
}

// --- franja verde: punto de encuentro ------------------------------------
out.push(box(980, PROM_A - 10, 1160, PROM_B + 10, 26, 'cz__verde'));
out.push(T(P(1070, 900)[0], P(1070, 900)[1] + 30, 'PUNTO DE ENCUENTRO', 'cz__rot cz__halo', 'middle'));

// --- estación base sobre su loma -----------------------------------------
out.push(box(1130, 140, 1330, 340, 44, 'cz__loma'));
out.push(poste(bp[0], bp[1], 13, 168, 'cz__torre'));
out.push(`<line class="cz__rizo" x1="${r(bp[0] - 52)}" y1="${r(bp[1] - 82)}" x2="${r(bp[0])}" y2="${twr}"/>`);
out.push(`<line class="cz__rizo" x1="${r(bp[0] + 52)}" y1="${r(bp[1] - 82)}" x2="${r(bp[0])}" y2="${twr}"/>`);
out.push(`<ellipse class="cz__base-led" cx="${r(bp[0])}" cy="${r(bp[1] - 176)}" rx="10" ry="5.5"/>`);
out.push(T(bp[0], bp[1] + 46, 'ESTACIÓN BASE', 'cz__rot cz__halo', 'middle'));
out.push(T(bp[0], bp[1] + 65, '1 246 registros en cola', 'cz__sub cz__halo', 'middle'));

// --- el enlace LoRa: del nodo a la base, por el aire ---------------------
const curva = `M${r(puck[0])} ${r(puck[1])} Q${r((puck[0] + bp[0]) / 2)} ${r(Math.min(puck[1], twr) - 150)} ${r(bp[0])} ${r(twr - 4)}`;
out.push(`<path class="cz__enlace" d="${curva}"/>`);
out.push(`<path class="cz__paquete" d="${curva}"/>`);
// y de la base hacia SINAPRED: sale por arriba a la derecha, dentro de encuadre
out.push(`<path class="cz__sinapred" d="M${r(bp[0] + 6)} ${r(twr - 10)} Q${r(bp[0] + 110)} ${r(twr - 130)} ${r(bp[0] + 196)} ${r(twr - 200)}"/>`);
out.push(T(bp[0] + 202, twr - 206, 'SINAPRED', 'cz__rot cz__halo', 'end'));
out.push(T(bp[0] + 202, twr - 187, 'vía satélite', 'cz__sub cz__halo', 'end'));

// --- Nodo 07: la pieza ----------------------------------------------------
out.push(poly('cz__plinto', [P(nodo.x - 52, nodo.y - 52), P(nodo.x + 52, nodo.y - 52), P(nodo.x + 52, nodo.y + 52), P(nodo.x - 52, nodo.y + 52)]));
out.push(poste(np[0], np[1], 17, PUCK_H, 'cz__poste'));
for (let i = 1; i <= 3; i++) out.push(`<circle class="onda onda--${i}" cx="${r(puck[0])}" cy="${r(puck[1])}" r="30"/>`);
out.push(`<circle class="cz__puck" cx="${r(puck[0])}" cy="${r(puck[1])}" r="24"/>`);
out.push(`<path class="cz__antena" d="M${r(puck[0] - 4)} ${r(puck[1] - 20)} L${r(puck[0] - 26)} ${r(puck[1] - 62)}"/>`);
out.push(`<circle class="cz__led" cx="${r(puck[0] + 15)}" cy="${r(puck[1] - 11)}" r="5.5"/>`);
out.push(T(np[0] + 30, np[1] + 26, 'NODO 07', 'cz__rot cz__halo'));

// --- lecturas en vivo, en el margen de anotación -------------------------
const lx = 24, ly = 78;
[
  ['OCUPACIÓN ESTIMADA', '780 personas'],
  ['NODO 07 · BATERÍA', '71 %'],
  ['ÚLTIMA LECTURA', '04:28 · confianza alta'],
  ['ESTADO DEL ENLACE', 'LoRa · modo apagón'],
].forEach(([k, v], i) => {
  out.push(T(lx, ly + i * 29, k, 'cz__k'));
  out.push(T(lx + 222, ly + i * 29, v, 'cz__v'));
});

// --- quién responde -------------------------------------------------------
const bgv = P(340, 842);
out.push(`<g class="cz__brigada"><rect class="cz__veh" x="${r(bgv[0] - 17)}" y="${r(bgv[1] - 14)}" width="34" height="19" rx="3"/>`
  + `<rect class="cz__veh-cab" x="${r(bgv[0] - 17)}" y="${r(bgv[1] - 14)}" width="12" height="19" rx="3"/>`
  + `<circle class="cz__rueda" cx="${r(bgv[0] - 8)}" cy="${r(bgv[1] + 7)}" r="4.5"/>`
  + `<circle class="cz__rueda" cx="${r(bgv[0] + 9)}" cy="${r(bgv[1] + 7)}" r="4.5"/></g>`);
out.push(T(bgv[0] - 98, bgv[1] + 4, 'BRIGADA 1', 'cz__rot cz__halo', 'end'));
out.push(T(bgv[0] - 98, bgv[1] + 23, '2.4 km · ETA 12 min', 'cz__sub cz__halo', 'end'));
[[1020, 820], [1064, 850], [1112, 824]].forEach(([vx, vy]) => {
  const v = P(vx, vy);
  out.push(`<circle class="cz__vecino" cx="${r(v[0])}" cy="${r(v[1] - 7)}" r="5.5"/>`);
  out.push(`<line class="cz__vecino-p" x1="${r(v[0])}" y1="${r(v[1] - 2)}" x2="${r(v[0])}" y2="${r(v[1] + 11)}"/>`);
});

// --- la lancha de reconocimiento, cruzando el agua hacia Ribera del Río ---
out.push(poly('cz__lancha', [P(1020, 1256), P(900, 1212), P(780, 1256), P(900, 1300)]));
out.push(`<path class="cz__lancha-q" d="M${pts([P(790, 1256), P(1010, 1256)])}"/>`);
out.push(box(830, 1232, 890, 1280, 15, 'cz__lancha-cab'));
out.push(`<path class="cz__estela" d="M${pts([P(775, 1252), P(660, 1226)])}"/>`);
out.push(`<path class="cz__estela" d="M${pts([P(775, 1260), P(660, 1288)])}"/>`);
out.push(T(P(900, 1330)[0], P(900, 1330)[1] + 26, 'LANCHA · RIBERA DEL RÍO', 'cz__rot cz__halo', 'middle'));

// --- rosa de los vientos --------------------------------------------------
out.push(`<g class="cz__norte"><path d="M1400 946 L1400 892 L1415 908 L1385 908 Z"/><path d="M1400 892 L1400 946 L1385 908 L1415 908 Z" opacity=".4"/>${T(1400, 968, 'N', 'cz__rot cz__halo', 'middle')}</g>`);

const svg = `<figure class="sec-17-croquis__escena">
      <svg class="sec-17-croquis__svg" viewBox="-40 40 1520 960" role="img" aria-label="Croquis isométrico del sector Malecón Centro: el Nodo 07 emitiendo por radio, el paquete viajando hasta la estación base y de allí a SINAPRED, y las brigadas moviéndose hacia el punto crítico">
${out.map((s) => '        ' + s).join('\n')}
      </svg>
      <figcaption class="sec-17-croquis__pie">Reconstrucción del sector a partir de las últimas lecturas recibidas. Las posiciones son aproximadas; las cifras, las del corte de las 04:30.</figcaption>
    </figure>`;

const html = `<section class="sec sec-17-croquis">
  <div class="wrap wrap--wide">
    <div class="sec-17-croquis__head">
      <p class="sec-17-croquis__scale">SECTOR · MALECÓN CENTRO</p>
      <h2 class="sec-17-croquis__title">El nodo en el terreno · Malecón Centro</h2>
      <p class="sec-17-croquis__lede">Lo que el resto del tablero resume en cifras, aquí se ve funcionando: un nodo que mide sin preguntar a nadie, un enlace que viaja por radio, y las brigadas moviéndose hacia donde el índice dice.</p>
    </div>

    ${svg}

    <ul class="sec-17-croquis__leyenda">
      <li class="cz-l"><i class="cz-l__m cz-l__m--nodo"></i>Nodo SITRE emitiendo</li>
      <li class="cz-l"><i class="cz-l__m cz-l__m--enlace"></i>Enlace LoRa · 915 MHz</li>
      <li class="cz-l"><i class="cz-l__m cz-l__m--brigada"></i>Equipo de respuesta</li>
      <li class="cz-l"><i class="cz-l__m cz-l__m--agua"></i>Agua · 0.9 m sobre la vía</li>
    </ul>
  </div>
</section>
`;

writeFileSync(resolve(ROOT, 'secciones/17-croquis/section.html'), html, 'utf8');
console.log(`secciones/17-croquis/section.html · ${out.length} elementos · ${Math.round(html.length / 1024)} KB`);
