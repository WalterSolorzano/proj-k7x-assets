# PROYECTO — estado

Memoria barata del proyecto. Actualízala en cada hito (o con `/checkpoint`) para poder
compactar o reiniciar la sesión sin perder contexto.

- **Proyecto:** **SITRE — Sistema de Inteligencia Territorial para Rescates** (Rallylatam)
- **Fase actual:** Video y Material de Rodaje Cinematográfico Concluido
- **Stack:** web (HTML/CSS) + Blender para el objeto y entorno 3D + Playwright + FFmpeg
- **Entregable:** `presentacion/video/pitch-recurso-latam-panama-innovador.mp4` (1080p, 17s fluido sin blanco inicial, nombres de provincias de Panamá, vista dron dinámica de 3 unidades y telemetría en vivo).

## Fase 0 — cerrada (brief + contrato)

- **Producto:** plataforma de inteligencia territorial para **SINAPRED**. Cruza **ocupación estimada
  (Wi-Fi/BT sin apps) + amenaza ambiental (nivel de agua y lluvia) + confianza del dato** → **Índice de
  Prioridad de Rescate (IPR)** por sector. No cuenta personas: **ordena la cola de rescate**. Detalle: `brief.md`.
- **Alcance decidido por el usuario:** solo **2 vistas** — `01-plataforma` (SINAPRED, escritorio) y
  `02-brigadas` (versión portable, móvil 390 px). **El video se graba cuando el usuario lo pida.**
- **Tema congelado:** nuevo tema **`institucional`** en `assets/tokens.css` = mezcla pedida de
  `light-min` (limpieza) + `natural` (papel cálido, verde terreno). Contrastes verificados:
  `--text` 15.8:1 · `--text-dim` 5.8:1 · `--accent` 4.7:1 sobre `--bg`.
- **Escalas de datos nuevas y compartidas:** `--heat-1…5` (ocupación, cálido), `--risk-1…5` (amenaza,
  azul), `--nodata` (sin dato, gris frío), confianza = `--ok/--warn/--bad`. **Solo relleno, nunca texto.**
  Ocupación y amenaza nunca comparten color. Nuevo `--maxw-wide` (1400) + `.wrap--wide` para tableros.
- **`build.mjs` + `_shell.html`:** el tema por página se declara en `_sections.json` y se inyecta en
  `<html data-theme>`; `color-scheme` se ajusta a `light`. Antes las páginas salían siempre oscuras.
- **Inventario:** 12 secciones, 2 páginas → 2 lotes de 6 subagentes. Tabla en `CONTRATO.md` §4.
- **Retiradas:** `00-nav`, `01-hero`, `99-footer` (landing de la plantilla). En disco, no se ensamblan.

## Decisiones
- **El desafío se conoce el día 1 → nada se decide antes por contenido.** Se prepara el SISTEMA, no el tema.
- **Sistema de temas conmutables** en `assets/tokens.css`: `dark-tech` (defecto), `light-min`, `blueprint`, `natural`.
  Elegir el look el día 1 = una línea. Las secciones se escriben tema-agnósticas (regla dura en `CONTRATO.md` §2).
- Tipografías por CDN en `tokens.css`: Space Grotesk (títulos) + Inter (cuerpo) + JetBrains Mono (datos).
- Kit reutilizable y checklist de preparación: `preparacion-dia0.md` (bloques A/B/C).
- **Anti-patrones IA prohibidos** → `CONTRATO.md` §2.1. Detector `impeccable` una vez por lote.
  Ya purgado: gradiente en texto, botones con gradiente decorativo, cards anidadas, eyebrow chip,
  tracking ancho en cuerpo. Excepción registrada: la rejilla del bloque del render (es el lienzo del 3D).
- **Tipografías cambiadas por ser sobreusadas** (Inter y Space Grotesk son el look IA):
  display = **Bricolage Grotesque**, cuerpo = **Archivo**, datos = **Azeret Mono**. Todas por CDN en `tokens.css`.
- `--text-dim` oscurecido en los temas claros: daba 4.0–4.4:1 de contraste, por debajo de 4.5:1.
- `tools/video.mjs` ahora respeta `SCALE`/`FPS` (estaban declarados sin usar) y las tomas aceptan
  `focus`, `hide` y `hover`. Antes `focus` se ignoraba en silencio.
- **Alcance cerrado: prototipo visual, NO app funcional.** Sin backend, login, base de datos ni persistencia.
- Rally Latinoamericano de Innovación 2026: 28 h (16-17 oct). El jurado premia la **calidad de la presentación**.
- Entregables oficiales del Rally: video ≤2 min en YouTube + reporte pautado PDF + video de interacción internacional ≤1 min en TikTok.
- Entrega propia = **material de rodaje** (clips + stills) para insertar en el video. No hacemos el video.
- Vista local en http://localhost:5173 con galería de mockups/capturas/videos.
- Plantilla visual base: `mockups/00-demo.html` + `mockups/tokens.css`.

## Herramientas
- `npm run serve` — galería local con recarga en vivo.
- `npm run capture` — capturas + `presentacion.md`.
- `npm run video` — **material de rodaje**. Flags reales: `--guion <archivo>` `--preset 16x9|9x16|4x5|1x1|wide`
  `--scale 2` (nitidez) `--fps 30` (rate constante) `--mp4` `--stills` `--motion scroll|zoom|pan|static`.
- Campos por toma en el guion: `name` `target` `motion` `duration` `pauseTop` `pauseBottom`
  `focus` (selector: centra el movimiento) `zoom` `hide` (oculta elementos, p. ej. la barra fija al hacer zoom)
  `hover` (deja el cursor encima a propósito; sin él no marca nada).
- Detector de anti-patrones: `.\.opencode\skills\impeccable\scripts\impeccable.cmd detect mockups secciones`
  → **una vez por lote**, antes de capturar. Va con `Select-Object -First/-Last` porque imprime mucho.
- Captura de mockups: `node tools/capture-mockups.mjs` (PNG a `presentacion/`, 1440 px, escala 2; une los 4 temas).
- `mockups/01-paletas.html` embebe la pantalla con `<iframe>`: sirve para **mirar en el navegador**, pero
  **no se captura** — Chromium no pinta iframes fuera de pantalla en una captura fullPage y salen vacíos.
  `01-look-4-temas.png` se compone uniendo las 4 capturas de `00-demo.html` con ffmpeg.

## Rodaje — cómo se regraba el día 1
1. Sustituir contenido (textos + render 3D en `figure.d-media`).
2. `npm run video -- --guion guion.json --preset 16x9 --scale 2 --mp4 --stills --fps 30`
3. Los clips salen en `presentacion/video/` en `.webm` + `.mp4` (mp4 para CapCut/Premiere) y los stills en PNG.
- Los clips arrancan con unos segundos de carga de página en reposo: es normal en material crudo, se recorta al editar.
- Blender 4.5 LTS + MCP `blender` — modelos/renders 3D. Ver `BLENDER.md`.
  Requiere Blender abierto con la pestaña **MCP for Blender** conectada (puerto 9876).

## Archivos clave
- `brief.md` — brief del producto. Dos carriles: **A** plataforma SITRE (§1–§4 del contrato) y
  **B** prototipo 3D del equipo de campo (§7–§8). BOM del hardware en su §5.
- `mockups/` — mockups HTML/CSS estáticos
- `presentacion/` — capturas y videos finales
- `tools/` — serve, capture, video, anim

## Siguiente paso
- **Fase 4 — material de rodaje: HECHA** para el carril interfaz. Incluye el video unificado continuo `recorrido-institucional-sinapred.mp4` (37 s, multicámara con transiciones fluidas de lo nacional a lo específico), más las 9 tomas independientes de la plataforma (1920×1080) y 4 de la brigada (540×1170), en `.webm` + `.mp4`. Índice maestro en `presentacion/video/material.md`.
- **Espera decisión del usuario:** (a) el visto bueno al croquis `17-croquis` — es el pico visual y lo
  hice yo; (b) qué hacer con `3d-04-llegada-centro-comercial` (48 bytes, export fallida);
  (c) si los renders `ref-*` siguen o no en la carpeta de entrega (ver "Carril 3D", abajo).
- **Pulido menor:** en `11-mapa`, se ajustó el espaciado vertical de la etiqueta Ribera del Río con su subtexto. Build y `dist/` sincronizados.

## Fases 2 y 3 - construido y ensamblado

**13 secciones, 2 páginas, 8/8 y 5/5 en el build.** Reparto: 2 lotes de 6 subagentes `seccion` en
paralelo, una carpeta por dueño, más `29-pie` escrito por el orquestador.

- `01-plataforma` (1440 px): `10-bar`, `11-mapa`, `12-prioridad`, `13-comparar`, `14-red`,
  `15-detalle`, `16-recursos`, `19-privacidad`.
- `02-brigadas` (390 px): `20-bar`, `21-tarea`, `22-mapa`, `23-reporte`, `29-pie`.

### Lo que se arregló al ensamblar (nadie lo ve sección por sección)
- **Títulos desproporcionados:** `14-red` y `19-privacidad` usaban `clamp(…, 3vw, --fs-2xl)` = 44 px a
  1440 px, mientras el resto usa `--fs-xl` (28 px). Unificados.
- **`--sec-pad` 48 → 32 px:** la densidad era de landing, no de sala de crisis.
- **Regla huérfana en `10-bar`:** una línea verde al 81 % bajo la barra leía como fallo de render, no
  como dato. Eliminada (el dato ya está en `34 / 42 nodos en línea`).
- **`16-recursos` tenía un error de datos:** decía «4 de 6 sectores cubiertos» pero la brigada 3 está
  en reserva → son **3 de 6**, y los descubiertos son **tres**, no dos. Corregido el número, la lista
  y las marcas tramadas.
- **Etiquetas pisadas** en la regla de cobertura ("94Ribera", "86Mercado"): nombre e IPR ahora se
  apilan en columna dentro de cada marca.
- **`13-comparar` era la única cabecera con el lede a la derecha** en vez de debajo. Unificada.
- **Leyenda del mini-mapa** (`22-mapa`): 3 estados en una fila envolvían en 3 líneas → rejilla 2×2.
- **Residuo de la plantilla:** `paginas/01-home.html` seguía existiendo y entraba en `npm run capture`.
  Borrado: la captura ahora lista exactamente las páginas de `_sections.json`.

### Paleta: una colisión real que importa para el video
`--accent` (#b03d0c, terracota) y `--heat-5` (#b8341f) son casi el mismo color. En el ranking, la barra
de **IPR** y el cuadro de **ocupación** se veían idénticos; en el mapa, el anillo de prioridad se perdía
sobre las manzanas críticas. **Decisión de paleta (nueva ley):**
- **Ocupación** → rampa `--heat-*` cálida. Solo relleno.
- **Amenaza** → rampa `--risk-*` azul. Solo relleno.
- **Decisión del sistema** (IPR) → **tinta** (`--text`). El veredicto no compite con la densidad.
- **Anillo de prioridad del mapa** → **`--bg` discontinuo**: un recorte, legible sobre cualquier paso
  de la escala.
- **`--accent` queda reservado a alerta e intervención** (modo apagón, `Iniciar ruta`, `ENVIAR BRIGADA`,
  línea de impacto). Al escasear, significa más.

### Movimiento: el momento que dice "esto funciona"
Una sola idea continua, no efectos dispersos: en `14-red` los enlaces en línea llevan **paquetes
viajando del nodo hacia la estación base** (`stroke-dasharray` + `dashoffset`), dibujados como cuentas
de 2 px al 72 % de `--accent-2` para no perder peso. Todo con corte en `prefers-reduced-motion`.
Se suman a los que ya traían los subagentes: el **historial 24 h que se dibuja solo** (`15-detalle`,
`pathLength="1"`), las **barras de IPR que crecen escalonadas** (`12-prioridad`) y los **pulsos de nodo**.

### Capturas
`presentacion/01-01-plataforma.png` y `presentacion/02-02-brigadas.png` (full page). Galería en
`presentacion.md`. Regenerar con `npm run capture`.

## Fase 3.5 — escala nacional (hecho)

**Corrección de fondo del usuario:** *"este es un sistema que deberá ser aplicado a nivel nacional
por instituciones; el dashboard debe ser más general, y desde ahí bajar a lo específico; usar mejor el
espacio, más mapas, más animaciones; que se vea lo general como un mapeo nacional y lo específico como
el mapa de ese lugar; y un croquis semirealista donde está la pieza, cómo está emitiendo y quiénes
responden, en vivo."*

Hasta aquí el prototipo abría en un municipio de 148 000 habitantes: se veía como un tablero local, no
como un sistema del Estado. **El scroll ahora es el zoom**, y el orden de las secciones es la narrativa
(§2.3): país → región → municipio → sector → nodo.

### Geografía real, no dibujada
`tools/geo.mjs` baja los límites oficiales de **geoBoundaries** (gbOpen NIC ADM1/ADM2), los proyecta,
los simplifica con Ramer–Douglas–Peucker y hornea el SVG. Las secciones son HTML estático sin JS, así
que no pueden cargar GeoJSON en el navegador: los `d` de los `<path>` van dentro del marcado.

| archivo | contenido |
| --- | --- |
| `assets/geo-nicaragua-paths.html` | 17 unidades reales (15 departamentos + RACCN + RACCS), 2 210 puntos, 25.8 KB, `viewBox="0 0 1000 896"` |
| `assets/geo-nicaragua-coarse.html` | la misma silueta con 701 puntos (8.8 KB), para las miniaturas de `09-escala` |
| `assets/geo-puerto-cabezas-paths.html` | 14 municipios de la costa caribe norte, 20.5 KB |
| `assets/geo-nicaragua.json` / `geo-puerto-cabezas.json` | `viewBox`, centros, bbox y `places` (managua, bilwi, bluefields, león) ya proyectados |

Dos trampas que costaron tiempo y quedan resueltas en el script:
- Los anillos GeoJSON vienen **cerrados** (el primer punto repite el último). Eso degenera la cuerda
  del RDP y la silueta entera colapsaba a 2 puntos: el mapa salía vacío. Se abre el anillo y se cierra
  con `Z`.
- geoBoundaries es un dataset académico: traía `North Carribean Coast Autonomous Region`,
  `Matagalpa (Departemento)` y `Leon` sin tilde. Normalizado al nombre oficial en español.

### Datos nacionales nuevos (§4.1)
**17 unidades · 153 municipios (132 con cobertura) · 1 276 nodos, 1 138 en línea (89 %) · 96 brigadas ·
480 000 personas bajo alerta · 3 eventos activos** (Celeste en RACCN/alerta roja, Río Coco en
RACCN+Jinotega/amarilla, enjambre sísmico en Rivas/verde). El municipio del evento pasa a estar
nombrado: **Puerto Cabezas (Bilwi), RACCN** — que es donde un huracán toca tierra de verdad en
Nicaragua, y donde tienen sentido un Malecón, un Puerto Norte y un río desbordado.

### La escena nueva: `17-croquis`
El pico visual del prototipo. Croquis **semirealista en isométrico** con el nodo montado en su poste,
**emitiendo** (ondas + paquete LoRa viajando a la estación base + salto a SINAPRED), y **quién
responde**: Brigada 1 por Av. Costanera, lancha de reconocimiento a Ribera del Río, vecinos en el punto
de encuentro. Es la respuesta literal a "que se vea que está emitiendo y quiénes responden en vivo".

### Resultado del lote 3

Las once secciones están **montadas y desplegadas** (`paginas/01-plataforma.html`, 10 419 px de alto,
11/11). Verificado en vivo: tema `institucional`, el croquis presente, 3 apariciones del mapa nacional,
**0 desborde horizontal**.

**Cómo se repartió, y qué falló.** Cuatro subagentes en paralelo. Tres agotaron su presupuesto de
pasos: `08-nacional` entregó el HTML con un placeholder sin resolver y sin CSS; `09-escala` salió con
el marco capado a 480 px dentro de una columna de 715 (255 px muertos) y el marcador pisando el primer
dígito de cada cifra; y `17-croquis` **falló dos veces seguidas** (dos subagentes distintos, ninguno
entregó nada). Lo que salvó el lote fue lo de siempre: **mirar la captura**. Al verlas, los tres
problemas eran evidentes en un segundo.

Reparto final: `08` y `09` volvieron al **mismo** subagente con feedback numerado; el bloque de
etiquetas de escala lo lancé aparte; y `17-croquis` **la hice yo** con un generador
(`tools/croquis.mjs`), porque era el pico visual y no podía quedar fuera.

**Lección para el próximo rally:** una sección con una escena SVG grande no se le da a un subagente
que además tiene que explorar el repo. O se le da el encargo ya acotado a escribir CSS, o se hace
directo. Los tres que funcionaron a la primera fueron los de encargo estrecho.

### Herramientas que quedaron

| herramienta | para qué |
| --- | --- |
| `tools/shot.mjs <url> [ancho] [salida] [--viewport] [--scale=N] [--clip=x,y,w,h]` | el bucle corto: "¿cómo quedó esto?". Con `--scale` y `--clip` da zoom real de una etiqueta. |
| `tools/geo.mjs` | baja y hornea la geografía real de Nicaragua en `assets/`. |
| `tools/croquis.mjs` | genera el marcado de `17-croquis`. Las cosas se describen por su posición en el mundo; la proyección isométrica hace el resto. |

**Dos bugs de herramienta corregidos, de los que conviene acordarse:**
- `tools/serve.mjs` **no sustituía `{{themeAttr}}` ni `{{colorScheme}}`**: el preview aislado caía al
  tema por defecto (`dark-tech`). Los subagentes estaban aprobando su trabajo en un tema que el
  prototipo no usa. Ahora el tema sale de la página a la que pertenece la sección, y `?theme=natural`
  lo fuerza.
- **`Set-Content -NoNewline` sobre un array de PowerShell colapsa el archivo en una sola línea.** Me
  destrozó `17-croquis/section.css`. Para reemplazos en archivos, usar la herramienta de edición, no
  un `-replace | Set-Content` por shell.

## Publicado en Netlify

**https://sitre-rallylatam.netlify.app** — sitio propio (`sitre-rallylatam`), creado nuevo para no
pisar los otros 5 sitios de la cuenta. Índice en `/`, pantallas en `/paginas/<id>.html`.

- `tools/dist.mjs` arma `dist/` (162 KB, 17 archivos): solo `paginas/`, `assets/` y los
  `section.css` de las 13 secciones, conservando la estructura relativa para que las rutas resuelvan.
  Publicar la raíz del repo también funcionaría, pero subiría `node_modules` y todo el histórico.
- `tools/deploy.ps1 -Token <nfp_…>` (o `$env:NETLIFY_AUTH_TOKEN`) hace build → dist → zip → deploy.
  El id del sitio queda en `.netlify-site-id` (ignorado por git).
- **Trampa documentada:** `Compress-Archive` de PowerShell escribe las entradas del zip con barras
  invertidas (`assets\tokens.css`). Netlify corre en Linux y lo lee como un nombre de archivo, no como
  ruta → el sitio da 200 en `/` y **404 en todo lo demás**. `deploy.ps1` usa `ZipArchive` y fuerza `/`.
- Verificado en vivo: 200 en `/`, ambas páginas, `tokens.css` y las hojas de sección; tema
  `institucional`, Plex Sans Condensed cargando, 8 secciones, 0 desborde horizontal.
- **Para el video, grabar en local (http://localhost:5173), no en la URL pública:** el plan Free
  inyecta la insignia *Powered by Netlify* en la esquina inferior derecha de todas las páginas.

## Fase 1 — hecho (pasada 2: aplanado y tipografía, pendiente de aprobación)

**Feedback del usuario:** *abuso de cards, falta estandarización de fuentes, espaciado sin estandarizar,
usa fuentes más profesionales; los diagramas gustaron; la vista móvil no debe verse sobrecargada.*
Se aplicó con la skill `impeccable` (modo **Operate**), en dos frentes: sistema de diseño y marcado.

### Sistema de diseño (`assets/tokens.css` + `CONTRATO.md` §2)
- **Tipografía: UNA superfamilia, tres cortes.** Fuera Bricolage Grotesque / Archivo / Azeret Mono
  (look IA). Entra **IBM Plex**: `--font` Plex Sans, `--font-display` Plex Sans Condensed,
  `--font-mono` Plex Mono. Un solo sistema tipográfico, no tres fuentes sueltas.
- **Ritmo vertical tokenizado:** `--sec-pad`, `--gap-block`, `--gap-row`, `--pad-block`, `--hairline`.
  Todas las secciones usan los mismos; en ≤700 px `--sec-pad` baja un escalón (390 px no puede gastar
  96 px entre bloques).
- **Radios contenidos:** `--r-sm|md|lg` pasan de 8/14/22 a **3/5/8**. Un tablero institucional no es
  una app de consumo.
- **Superficies del navegador tematizadas** (selección, foco, scrollbar): la señal más barata de que
  algo está construido y no ensamblado.
- **Contraste corregido:** `--accent` #c1440e → **#b03d0c** (daba 4.4:1 sobre el tinte de fila),
  `--warn` #a96f12 → **#8a5a0c** (daba 3.9:1 como texto).

### Reglas nuevas en `CONTRATO.md`
- **§2.0 Aplanado** (la causa del feedback): un contenedor con borde **nunca** contiene otro;
  separar con **hairline o espacio**, nunca con una tarjeta; `--surface` para **una sola** capa
  funcional por vista; chips **solo** para estado; **sin eyebrows decorativos** (la skill los marca
  como prohibición absoluta); sin sombras dentro del flujo.
- **§2.2 Móvil:** una sola acción primaria, **máximo 4 bloques**, sin rejillas de más de 2 columnas,
  un bloque de texto explicativo por pantalla.

### Marcado
- `mockups/10-plataforma.html`: eliminados los contenedores de ranking, contadores, ficha técnica,
  comparativa y red. Las acciones del ranking pasan de chip con caja a **texto mono coloreado**.
  El mapa pierde el marco: **es el lienzo de la página**, no una imagen enmarcada.
- `mockups/11-brigadas.html`: checklist, nota y aviso de envío sin caja. Checklist 5 → **4 ítems**,
  leyenda del mini-mapa 4 → **2**, subtextos recortados a la cifra y su unidad, eyebrows duplicados
  fusionados. Los 3 botones de reporte **conservan** borde: son controles.
- **Detector `impeccable`: 0 anti-patrones y 0 advisories.** Dos ignores documentados en
  `.impeccable/config.json` (scope `mockups/11-brigadas.html`): `cramped-padding` (los bloques ya no
  tienen borde, así que no hay inset que dar) y `tiny-text` (etiquetas cartográficas del mini-mapa).

### Stills
`presentacion/10-plataforma.png` (1440 px) y `presentacion/11-brigadas.png` (390 px), escala 2.
Regenerar con `node tools/capture-mockups.mjs`.

## Dudas pendientes
- ¿Se aprueba el look de `institucional` tal cual, o se ajusta la temperatura del papel / el rojo?
- `15-detalle` y `14-red` son las dos secciones prescindibles si el tiempo aprieta.

## Hecho y verificado
- **Detector `impeccable`: 48 → 0 anti-patrones** contables. Queda 1 advisory (la rejilla del lienzo del
  render), registrada como excepción en `.impeccable/config.json` por `CONTRATO.md` §2.1 línea 46.
- **Material de rodaje listo:** 5 clips `.webm` + `.mp4` (1920×1080, 30 fps) y 5 stills a 3840×2160.
  Índice y guía de regrabado en `presentacion/video/material.md`.
- Pantalla de referencia en los 4 temas, capturada y verificada a 1440 px y 390 px.

## Carril 3D — prototipo del equipo de campo (`CONTRATO.md` §7–§8)

Decisión del usuario (16 oct, 11:5x): **no se diseña el sistema/software como pieza visual; se diseña el
prototipo de lo que estará en el campo real, en 3D.** Es un **carril aparte** del web: escribe solo en
`blender/` y `presentacion/3d/`, **nunca** en `secciones/`. Fase: **2 en curso — modelado listo, esperando
aprobación visual del usuario antes de re-renderizar producto y clips.**

- **Regla de oro del carril (aprobada):** el nodo **no debe parecer una farola**. Se descartaron dos
  diseños por eso: (1) caja IP65 colgada de un costado (no recibe de todos lados) y (2) "corona"
  cilíndrica con cono arriba + banda de vidrio luminosa = silueta de lámpara de alumbrado público.
  Prohibido volver a sombrero cónico + banda de vidrio sobre un poste.
- **Diseño vigente del nodo = PUCK 360°** (`nodo_puck` en `blender/sirt.py`): disco ancho y bajo
  (Ø 0.28 × 0.115 m) de aluminio anodizado oscuro sobre la punta del mástil, 8 costillas verticales,
  4 **ventanas RF ahumadas a 90°**, **módulo PV inclinado 22°** (el panel tiene que ver el sol; nunca
  plano), tapa ciega con venteo, brida con bulones, LEDs de estado, placas inox `VIGÍA-07 / SITRE ·
  SINAPRED` y `LoRa 915 MHz / RX 360`, caja de conexiones abrazada al poste, cable, puerto de antena
  externa tapado, sonda de nivel y pluviómetro de balancín en brazo aparte.
- **Edificio monitoreado = CENTRO COMERCIAL** (no casa/escuela, pedido del usuario): planta 32 × 20 m,
  7.6 m, **techo plano** con pretil, **huerto solar de 10 paneles inclinados 18°**, equipos de A/A,
  ductos, tanque, caseta de escalera, antena parabólica, **mástil con el puck**; fachada con vidriera
  de dos niveles + base oscura + alero partido + volumen de vidrio de acceso doble altura + tótem
  luminoso con banda cian; estacionamiento con líneas y 2 autos; 4 árboles lejanos.
- **Sensores de la torre (pedido del usuario):** **anemómetro de cazoletas** (velocidad del viento) en
  brazo aparte 0.66 m bajo el puck y **abrigo de radiación** (humedad/temperatura) en el brazo opuesto a
  1.26 m, más pluviómetro de balancín y sonda de nivel. Cada sensor en su brazo para que no se estorben.
- **Materiales:** kit Poly Haven (`concrete`, `worn_corrugated_iron`, `dirt`, `asphalt_03`,
  `concrete_pavement_03`, `brick_wall_13`, HDRIs `photo_studio_01` y `kiara_8_sunset`) + `retext()` que
  fuerza proyección **BOX en coordenadas de objeto** (sin UVs), con `tinte` (pared pintada), `alias`
  (materiales distintos del mismo set) y `bump` (control de relieve).
- **Presupuesto de render (pedido del usuario, PC de bajo rendimiento): EEVEE Next, 24 muestras,
  1600×900 / 1920×1080, máximo 1–2 imágenes por pasada.** Nada de Cycles.
- **Imágenes vigentes para aprobación:** `rev-01-centro-moderno.png` (fachada), `rev-02-cubierta-nodo.png`
  (cubierta + nodo), `ref-25-puck-hero.png`, `ref-21-puck-macro.png`, `ref-22-poste-completo.png`,
  `ref-40..43` (set anterior del centro comercial). Se borraron los stills de los diseños obsoletos.
- **Modelado 3D en 3 ubicaciones TERMINADO y CONGELADO:**
  1. **Ubicación 1 — Producto / Nodo Puck 360° aislado:** Stills transparentes RGBA listos (`rev-03-puck-hero.png`, `rev-04-puck-macro.png`, `rev-05-puck-detalle.png`).
  2. **Ubicación 2 — Terreno / Ribera de Campo (instalación con sensores):** Mástil con bandas de alerta/crítico, anemómetro de cazoletas, abrigo de humedad, pluviómetro, sonda de nivel y caja LoRa con montañas al fondo (`rev-08-sensores.png`, `rev-09-instalacion.png`, `rev-06-poste-vertical.png`).
  3. **Ubicación 3 — Techo del Centro Comercial (zona de concentración):** Cubierta plana con huerto solar inclinado 18°, equipos de climatización, caseta técnica y mástil con el nodo VIGÍA-07 (`rev-01-centro-moderno.png`, `rev-02-cubierta-nodo.png`).
- **Renderizado de clips de video CANCELADO/DETENIDO:** la PC va al tope de rendimiento (8 GB RAM / CPU ocupada). No se lanzan nuevos renders de video clips en Blender; se dan por definitivos los stills y los clips existentes. Carril 3D cerrado con éxito.

## Equipo y contexto del Rally
- ¿Equipo asignado del otro país? Disparar el pareo internacional al minuto cero del día 1.

## Entorno / PC (preparado)
Hardware: Lenovo L16L2PB3 · Win11 Home · **8 GB RAM** · 4 vCPU · disco C: 105 GB libres.
**Cuello de botella = RAM** (8 GB es el límite real; cierra pestañas antes de capturar grabar).
Aplicado:
- Plan de energía **Alto rendimiento** (`8c5e7fda…`): CPU 100 % en AC, refrigeración activa.
- Sin suspensión/hibernación ni apagado de pantalla en AC (renders y video largos no se cortan).
- `%TEMP%` limpio (179 → 11 MB).
- Verificado: `npm run build` OK, Playwright chromium-1248 + ffmpeg-static presentes, serve en :5173.
### Detalle aplicado (sesión de preparación)
- Arranques desactivados: OneDrive, LenovoVantage, GoogleDriveFS, Discord, Microsoft.Lists,
  RobloxPlayerBeta, BlueStacks Services, MicrosoftEdgeAutoLaunch → **HKCU Run quedó vacío**.
  Backup reversible: `.pc-backup/HKCU-Run.reg` (doble clic para restaurar).
- Defender (confirmado activo): ExclusionPath = `Rallylatam`, `ms-playwright`, `Temp\opencode`;
  ExclusionProcess = `node.exe`. Se quitan con `Remove-MpPreference` en PowerShell admin.
- Flags de bajo consumo en `tools/capture.mjs`, `tools/video.mjs`, `tools/capture-mockups.mjs`
  (`--disable-dev-shm-usage`, sin throttling de fondo, heap V8 1 GB). `node --check` OK.

**Pendiente:** reiniciar (avisar cuando acabe la inauguración). Plan de energía, arranques y
exclusiones **persisten** tras el reinicio.

Regla operativa: **capture/video con Chrome reducido**; cada Chromium headless ≈ 0.4–0.6 GB.

---

## Skill `impeccable` instalada (anti-look-IA)

- Instalada con `npx impeccable install --providers=opencode --scope=project --no-hooks`.
- Ubicación: `.opencode/skills/impeccable/` (skill + 24 comandos) y `.opencode/commands/impeccable.md`.
- Motor: `.opencode/skills/impeccable/scripts/bin/windows-x64/impeccable.exe` (v0.1.15) + launcher `impeccable.cmd`.
- Detector determinista (59 reglas, sin LLM, sin API key): `impeccable.cmd detect <archivo|dir|url>`.
- Reglas del repo: `AGENTS.md` sección *Calidad visual* + `CONTRATO.md` §2.1 (anti-patrones prohibidos)
  y §5/§6 (detector una vez por lote, nunca en bucle).
- `.gitignore` incluye el bloque imperativo de `.impeccable/` de la propia herramienta.
- Smoke check: `detect mockups/01-paletas.html` → 39 hallazgos primary + 5 advisory (la demo tenía cards
  anidadas, texto con gradiente, contraste bajo...). El binario funciona.
- Pendiente opcional: `/impeccable init` en el chat (escribe `PRODUCT.md` / `DESIGN.md`) cuando el producto esté
  fijado. `CONTRATO.md` sigue siendo la fuente única de verdad; los archivos de impeccable son contexto extra.
