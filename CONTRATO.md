# CONTRATO — fuente única de verdad del trabajo en paralelo

Todo subagente `seccion` lee este archivo antes de escribir código. El orquestador (`rally`)
lo mantiene actualizado y es el único que lo edita.

> Estado: **plantilla**. El orquestador lo rellena en el kickoff con la información de `brief.md`.
>
> **Alcance:** somos el **recurso que va dentro del video del pitch**, no el video. Rally de 24 h:
> prototipo visual, sin app funcional, backend, login, base de datos ni persistencia.
> Entregamos **material de rodaje**: clips con movimiento + stills de alta calidad.

## 1. Producto — SITRE
- **Nombre en pantalla:** **SITRE — Sistema de Inteligencia Territorial para Rescates**.
- **Qué es:** plataforma de **inteligencia territorial** para SINAPRED. Cruza **ocupación estimada
  (Wi-Fi/BT, sin apps) + amenaza ambiental (nivel de agua y lluvia) + confianza del dato** y emite un
  **Índice de Prioridad de Rescate (IPR)** por sector. No cuenta personas: **ordena la cola de rescate**.
- **Para quién:** (a) **SINAPRED**, sala de crisis, escritorio; (b) **brigadas en campo**, móvil.
- **Tono visual:** **institucional claro y humano** (herramienta de emergencia, no panel de marketing).
  Tema **`institucional` congelado** = mezcla de `light-min` (limpieza) + `natural` (calor de papel,
  verde de terreno). Ver §2.
- **Copy:** la fuente es `brief.md`. Las secciones lo citan literal; no se inventa copy nuevo.
- **Páginas a construir:** 2.
  - `01-plataforma` — Plataforma SINAPRED (escritorio, ancho).
  - `02-brigadas` — Brigadas en campo (móvil, 390 px).
- **Fuera de alcance:** landing de pitch, pantalla de hardware/red como página propia, el video
  (se graba cuando el usuario lo pida). Las secciones `00-nav`, `01-hero` y `99-footer` quedan
  **retiradas** (eran de la landing de la plantilla); no se borran, no se ensamblan.
- **Alcance duro:** prototipo visual. Sin backend, login, base de datos, persistencia ni JS de lógica.
- **Segundo carril de este mismo material de rodaje: el PROTOTIPO 3D DEL EQUIPO DE CAMPO** (el nodo
  físico que se instala en los puntos elevados, la estación receptora y su escena real de despliegue).
  No es una pantalla ni una página: son **renders y clips en Blender** → **§7 y §8**.
  Carril aislado: escribe solo en `blender/` y `presentacion/3d/`; **no toca `secciones/`**.

## 2. Diseño (no inventar fuera de esto)
- Tokens en `assets/tokens.css`: usar siempre `var(--...)` para color, tipografía, espacio, radios y sombras.
- **Temas (leer antes de escribir una sección).** El sistema trae 5 temas con **los mismos nombres de variable**:
  **`institucional` (ELEGIDO y congelado para SITRE)**, `dark-tech` (por defecto en `:root`), `light-min`, `blueprint`, `natural`.
  Se activan con `data-theme="..."` en `<html>`; las páginas generadas ya lo llevan puesto (§3).
  - **Regla dura: ninguna sección se escribe para un tema concreto.** Nunca `#fff`, `#000`, `rgba(255,255,255,.1)`
    ni `color: white`. Si necesitas un velo o un borde translúcido, usa `color-mix(in srgb, var(--text) 12%, transparent)`.
  - Prohibido asumir que el fondo es oscuro: **`institucional` es claro**. Para elevación usa `var(--surface)`,
    líneas y espaciado; **no** sombras grandes dentro de contenedores.
  - Etiquetas, cifras y datos → `var(--font-mono)`. Títulos → `var(--font-display)`. Cuerpo → `var(--font)`.
  - Si un tema se ve mal, se arregla en `assets/tokens.css` (solo el orquestador), **nunca** en la sección.
- **Escalas de datos (nuevas en `tokens.css`, compartidas por todas las secciones).** Son el lenguaje
  visual del sistema: si dos secciones usan escalas distintas, el prototipo se cae.
  - `--heat-1 … --heat-5` (cálido) → **ocupación estimada**. 1 baja → 5 crítica.
  - `--risk-1 … --risk-5` (azul) → **amenaza ambiental confirmada**. 1 nula → 5 peligro.
  - `--nodata` (gris frío) → **sin dato**. Es un estado, no un valor bajo: nunca lo pintes como "ocupación baja".
  - **Confianza del dato:** sin escala propia, usa `var(--ok)` / `var(--warn)` / `var(--bad)`.
  - **REGLA:** estas escalas son **solo relleno** de mapa, barra, chip o serie. **Nunca** color de texto.
  - Ocupación y amenaza **jamás comparten color**: son dos mapas de calor distintos.
- Paleta: `--accent` (alerta terrosa), `--accent-2` (verde terreno), `--accent-3` (azul agua); `--glow` para halos; `--text` / `--text-dim` para texto.
- **Tipografía: UNA superfamilia, tres cortes.** IBM Plex. `--font` = Plex Sans (cuerpo y UI),
  `--font-display` = Plex Sans Condensed (títulos), `--font-mono` = Plex Mono (cifras, datos, medición).
  No se añade ninguna otra fuente. Escala: `--fs-xs` … `--fs-4xl`.
  - El mono **solo** para dato, medida o etiqueta de dato. Nunca como disfraz de "técnico" en prosa.
- **Espaciado: usar los tokens de ritmo, no números sueltos.** `--sec-pad` (aire de la sección),
  `--gap-block` (entre bloques hermanos), `--gap-row` (entre filas), `--pad-block` (relleno interno).
  - **Más espacio ARRIBA de un título que DEBAJO.** Grupos apretados, separación generosa.
  - Todas las secciones usan el mismo `--sec-pad`: el ritmo vertical es idéntico de arriba abajo.
- Layout: contenedor `.wrap` (max `--maxw`), `.wrap--wide` (`--maxw-wide`) para secciones de datos.
- Bordes: `--line`. Radios: `--r-sm|md|lg|pill` (contenidos: 3/5/8 px). Sombras: `--shadow` /
  `--shadow-soft`, **solo para capas flotantes**. Estas vistas no tienen ninguna → no se usa sombra.
- Movimiento: `transition: … var(--dur) var(--ease)`.
- Regla de oro: **nada de valores mágicos** si existe un token.

### 2.0 Aplanado: prohibido abusar de contenedores (skill `impeccable`)

El detector no lo caza, pero es el patrón que más delata un diseño generado. **Reglas duras:**

1. **Un contenedor con borde NUNCA contiene otro contenedor con borde.** Ni anidado, ni disfrazado
   de "grupo". Si necesitas agrupar dentro de una caja, agrupas con espacio y tipografía.
2. **Para separar bloques:** una **regla horizontal** (`border-top: var(--hairline)`) o espacio.
   **Nunca** una caja redondeada por bloque. Si una sección se lee como una pila de tarjetas, está mal.
3. **`--surface` (fondo distinto) se usa para UNA sola capa funcional por vista.** En `01-plataforma`
   esa capa es la **franja de mando**. El resto de la página va sobre `--bg`.
4. **Chips y píldoras: solo para estado**, y solo donde el estado *es* el dato (confianza, enlace,
   acción sugerida). Prohibido el chip decorativo, el chip-eyebrow y la píldora de adorno.
5. **Sin eyebrows decorativos.** La skill los marca como prohibición absoluta. Una etiqueta pequeña
   encima de un título **solo** si es wayfinding de panel y **una sola**. Nunca dos etiquetas seguidas.
6. **Sin sombras dentro del flujo.** La profundidad se gana con jerarquía tipográfica y hairlines.
7. **Jerarquía por tamaño y peso, no por cajas.** Si dudas entre encerrar o separar: separa.
8. **Máximo 1 nivel de contenedor con borde por bloque.** Tabla = hairlines entre filas, no una caja
   con bordes por celda.

#### 2.0.1 Gramática permitida (esto es lo que SÍ se hace)

| Permitido | Prohibido |
| --- | --- |
| Filas de datos separadas por **hairline** | Cada fila dentro de su propia caja |
| Cifra **dentro** de la tabla, el mapa o el diagrama que la explica | Rejilla de cajas con cifra grande + etiqueta pequeña + subtexto |
| **Una** capa `--surface` por página | `--surface` en cada bloque |
| Borde **solo** en controles (botón, pestaña, casilla) | Borde en bloques de solo lectura |
| Blanco/negro y hairlines para separar | Chips, píldoras y badges como decoración |
| Estados (confianza, enlace) como texto mono coloreado | Estados dentro de un chip con borde |
| Diagrama propio del dominio (mapa, topología, serie) | Cajas genéricas "icono + título + texto" |

9. **Prohibido el "hero-metric template":** cifra enorme + etiqueta pequeña + dato de apoyo, repetido
   en rejilla. Es la plantilla que más grita "generado". Si hay cuatro cifras, van **en una tabla**,
   **en una frase** o **en el diagrama**; no en cuatro cajas iguales.
10. **Prohibido repetir la misma forma N veces seguidas.** Si seis bloques hermanos comparten la misma
    silueta, el diseño no está decidiendo. Rompe el ritmo o cambia el registro (tabla → serie → mapa →
    frase).

### 2.2 Vista móvil: no se sobrecarga

La vista de brigadas se lee **en campo, con una mano, bajo presión**. Por eso:
- **Una sola acción primaria** por pantalla (el botón de la tarea / el reporte).
- **Máximo 4 bloques** visibles. Si algo es contexto secundario, se corta.
- Nada de tablas ni rejillas de más de 2 columnas en 390 px.
- El detalle largo (subtextos de cada dato) se recorta a lo mínimo: la cifra y su unidad.
- Un bloque de texto explicativo por pantalla, como máximo.

### 2.3 La plataforma es un DESCENSO de escala (ley de composición)

SITRE es un sistema **nacional** para decidir dónde mandar gente. El tablero no puede abrir con un
municipio: abre con el país, y **el scroll es el zoom**.

**El orden de las secciones ES la narrativa.** Nadie lo cambia sin cambiar este apartado:

| escala | secciones | qué se ve |
| --- | --- | --- |
| **País** | `10-bar` → `08-nacional` | Nicaragua entera: 17 unidades, eventos activos, carga nacional |
| **Descenso** | `09-escala` | la misma geografía en 4 marcos: país → RACCN → Puerto Cabezas → Malecón Centro |
| **Municipio** | `11-mapa` → `12-prioridad` → `13-comparar` | Puerto Cabezas: calor por sector, ranking IPR, antes/después |
| **Sector** | `15-detalle` → `17-croquis` | Malecón Centro: la ficha y el nodo emitiendo en el terreno |
| **Red y respuesta** | `14-red` → `16-recursos` | cómo viaja el dato y quién responde |
| **Cierre** | `19-privacidad` | por qué esto no es vigilancia |

Reglas duras:
- **Toda sección declara su escala** en la etiqueta superior. El lector nunca debe dudar si está
  viendo el país o una calle.
- **Los mapas y diagramas usan `.wrap--wide`** (1400 px), nunca la columna de texto. Esto es un centro
  de mando: un mapa de 700 px en una pantalla de 1440 px se ve vacío.
- **Prohibido repetir el mismo mapa con el mismo encuadre.** Si la geografía vuelve, es porque cambió
  la escala, la capa o el momento.
- **Geografía real, no inventada.** Los límites ya están horneados en `assets/` y se copian tal cual:
  - `geo-nicaragua-paths.html` — 17 unidades, `viewBox="0 0 1000 896"`, paths con `id="ni-<nombre>"`.
  - `geo-nicaragua-coarse.html` — la misma silueta con 701 puntos, para miniaturas.
  - `geo-puerto-cabezas-paths.html` — 14 municipios de la costa caribe norte (el del evento es
    `id="ni-puerto-cabezas"`).
  - `geo-nicaragua.json` / `geo-puerto-cabezas.json` — `viewBox`, centros (`cx`,`cy`) y bbox por unidad.
  Vienen de geoBoundaries (gbOpen NIC ADM1/ADM2). El `<g>` trae su propio comentario de origen; **no
  se editan los `d` a mano.**

### 2.4 Movimiento — solo si significa algo

El destino es un **video de pitch**: el movimiento no es adorno, es la prueba de que el sistema está
vivo. Pero el ruido también se nota.
- **Un movimiento continuo por sección, como máximo.** Lo demás son entradas que ocurren una vez.
- **El movimiento TIENE que ser el dato.** Un enlace que lleva paquetes = hay enlace. Un nodo que late
  = el nodo está vivo. Si un pulso no significa nada, es decoración y se corta.
- Duraciones y curvas **solo de tokens**: `var(--dur)`, `var(--ease)`. Nunca `cubic-bezier` propio,
  nunca rebote ni elástico.
- **`@media (prefers-reduced-motion: reduce)` corta todo.** Obligatorio en cada sección que anima.
- El techo de movimiento es `17-croquis`: es el pico y el argumento del video. Las demás secciones no
  compiten con él.

### 2.1 Anti-patrones IA — prohibidos (skill `impeccable`)
El detector (`.\.opencode\skills\impeccable\scripts\impeccable.cmd detect <ruta>`) es la prueba objetiva.
Estos son los que más delatan un diseño generado; **ninguno entra** en este repo:
- Fuentes sobreusadas: Inter, Arial, Roboto, system-ui para todo. Usa `var(--font-display)` / `var(--font-mono)` del sistema de tokens.
- Gradiente morado→azul como color de marca, o cualquier gradiente decorativo sin función.
- **Texto con gradiente** (`background-clip: text`): prohibido, incluso en cifras grandes.
- **Cards dentro de cards** y contenedor anidado para "profundidad": aplana con espaciado, tipografía y `--line`.
- Negro o gris puro sin teñir: siempre `var(--text)` / `var(--text-dim)` / `color-mix(...)`.
- Texto gris sobre fondo de color (contraste < 4.5:1).
- Bordes de acento de 2–4 px en un solo lado ("side-tab border") como decoración.
- Fondos con rejilla de líneas de un píxel (`codex-grid-background`) salvo que sea un lienzo o plano real.
- Halos/glow oscuros alrededor de cualquier elemento.
- `cubic-bezier` con rebote/elástico: solo `var(--ease)`.
- Icono cuadrado redondeado con degradado encima de cada título.
- Sombra dura y plana fuera de `--shadow` / `--shadow-soft`.
- Em-dashes saturados en el copy (≥8) y exceso de signos decorativos.
- `border-radius` grande en todo y emojis como iconos.

**Cómo se aplica:** estos patrones aplican a los 4 temas. Si el detector marca algo que `CONTRATO.md`
exige (ej. un gradiente de marca), gana el contrato y se documenta la excepción:
`.\.opencode\skills\impeccable\scripts\impeccable.cmd ignores add-value <valor> --reason "CONTRATO.md §2"`.

## 3. Convenciones de composición
- Cada sección = una carpeta en `secciones/<slug>/` con `section.html` (fragmento) + `section.css`.
- El fragmento es solo `<section class="sec sec-<slug>">…</section>`. Sin `<html>`, `<head>` ni `<body>`.
- CSS con prefijo propio: `.sec-<slug>__bloque`. Nunca estilos globales de etiqueta.
- El orden y la composición de páginas se define **solo** en `secciones/_sections.json`.
- `paginas/` es generado por `npm run build`. Nadie lo edita a mano.
- Cada subagente edita **una sola carpeta**. Nadie más la toca → cero conflictos.
- **Tema por página:** se declara en `secciones/_sections.json` (`"theme": "institucional"`) y `build.mjs`
  lo inyecta en `<html data-theme=...>` del shell. Ninguna sección pone el tema.
- **Ancho del contenedor:** `.wrap` = 1160 px (contenido normal). `.wrap--wide` = `--maxw-wide` (1400 px),
  para las secciones de datos anchas (mapa, ranking, red). Ambos existen en `assets/tokens.css`.
- **Cada sección es autónoma:** no depende del HTML ni el CSS de otra. Si dos secciones necesitan el
  mismo componente, se decide aquí, no en el chat.
- **Densidad:** esto es un tablero de emergencia, no una landing. Bloques apretados y alineados a una
  retícula; el aire se gana con `--s-5` entre bloques, no con secciones de 200 px de alto.
- **Título de sección:** siempre `var(--fs-xl)`, **sin `clamp()` y sin `--fs-2xl`**. La jerarquía se gana
  con `--font-display` y el peso, no con un título de 44 px que descuadra la retícula vertical.
  (Desajuste real: al ensamblar, dos secciones iban a 44 px y las otras seis a 28 px.)
- **Diagramas en móvil:** si un mapa o una red se vuelve ilegible al encoger, **se desplaza en
  horizontal** (`overflow-x: auto`) en vez de reducirse a un borrón.

## 4. Inventario de secciones

Dos páginas. La de plataforma pasó de 8 a **11 secciones** (§2.3): se suman `08-nacional`,
`09-escala` y `17-croquis`, que son las que dan la escala nacional y el pico visual.
Las 8 previas (`10-bar`…`19-privacidad`) están **listas**; las tres nuevas, `pendiente`.

**El orden de composición vive en `secciones/_sections.json`, no en esta tabla** (§2.3).

### Página `01-plataforma` (escritorio · `institucional` · 1440 px)

| slug | dueño | estado | interfaz / notas |
| --- | --- | --- | --- |
| `08-nacional` | seccion-N1 | pendiente | **La vista general: Nicaragua entera.** Mapa real de las 17 unidades territoriales, paths ya horneados en `assets/geo-nicaragua-paths.html` (copiar el `<g class="ni">` tal cual). Cada unidad se rellena por **carga de red** (nodos, escala `--heat-*`) y las que tienen evento activo llevan marca. Encima: los **3 eventos activos** con su nivel de alerta (roja/amarilla/verde), la traza de *Celeste* entrando por la costa caribe, y la franja de KPIs nacionales (**17 unidades · 1 276 nodos · 1 138 en línea (89 %) · 132 de 153 municipios · 480 000 bajo alerta**). `.wrap--wide`; el mapa manda: **mínimo 900×700 px**. |
| `09-escala` | seccion-N2 | pendiente | **El descenso.** Cuatro marcos con la misma geografía a cuatro escalas —**Nicaragua → RACCN → Puerto Cabezas → Malecón Centro**— unidos por una línea de foco, cada uno con su dato rey. Los tres primeros usan geografía real (`geo-nicaragua-coarse.html`, la unidad `ni-raccn` de `geo-unidades.json`, y `geo-puerto-cabezas-paths.html`); el cuarto es el croquis de manzanas. Un indicador continuo **"estás aquí"** recorre la escalera: es el momento de zoom del video. |
| `10-bar` | seccion-A1 | listo | Franja de mando fija. Marca SITRE, evento activo (`Huracán Celeste`), **nodos 34/42 en línea**, última sincronización `04:30`, y el indicador **modo apagón** (LoRa, sin internet). Densidad: barra de 64 px, mono para cifras. **`REHACER` a escala nacional**: hoy muestra solo el municipio; debe abrir con el país (3 eventos, 1 276 nodos) y **bajar** al municipio del evento. |
| `11-mapa` | seccion-A2 | pendiente | **Pieza central.** Mapa de calor con rejilla territorial abstracta (SVG/CSS, sin librerías). Capas conmutables: **ocupación** (`--heat-*`), **amenaza** (`--risk-*`), **confianza** (`--ok/--warn/--bad`), **sin dato** (`--nodata`). Marcadores de nodos, estación base, leyenda de escalas y contador de sectores. Ancho completo (`.wrap--wide`). |
| `12-prioridad` | seccion-A3 | pendiente | Ranking de los 6 sectores por **IPR**. Cada fila: barra de IPR, ocupación estimada, amenaza, confianza, y **acción sugerida** (`Prioridad 1 · enviar brigada`). El sector #1 con tratamiento destacado. Es la respuesta a "¿a dónde voy primero?". |
| `13-comparar` | seccion-A4 | pendiente | **Antes / después.** Barrido temporal de 3 estados: `línea base habitual` → `último dato pre-evento` → `post-evento (hora 7)`, con scrubber visual y delta por sector. Distingue **evacuación** de **nodo caído**. La sección que da el clip con movimiento. |
| `14-red` | seccion-A5 | pendiente | Red **LoRa store-and-forward**: topología de nodos con estado (en línea / último dato / silencio), **8 nodos en silencio**, antigüedad del dato, batería, y la **cola de sincronización pendiente** hacia SINAPRED. Explica por qué el sistema sobrevive el apagón. |
| `15-detalle` | seccion-A6 | listo | Ficha del sector priorizado (`Malecón Centro`): ocupación estimada, última lectura, accesos y vías, brigada asignada, **sensores ambientales** (nivel de agua, lluvia) e historial de 24 h con el momento del impacto. Da profundidad de "inteligencia". **Sin rejilla de cajas**: es una ficha, hairlines entre datos. |
| `17-croquis` | seccion-N3 | pendiente | **El pico visual de todo el prototipo.** Croquis **semirealista en isométrico** de la escena real: el terreno, las manzanas anegadas, el **nodo SITRE montado en su poste, emitiendo** (ondas concéntricas saliendo del equipo, latido del LED), el paquete LoRa **viajando por el aire hasta la estación base**, y **quién responde**: la Brigada 1 avanzando por `Av. Costanera`, la lancha de reconocimiento a Ribera del Río, los vecinos en el punto de encuentro. Todo **en vivo**: cada cifra de la escena proviene de un nodo que late. Aquí se ve que el sistema *funciona*, no que existe. SVG propio, sin librerías. Ver §2.4. |
| `16-recursos` | seccion-A7 | pendiente | **Coordinación de brigadas y recursos**: las 4 brigadas con su asignación, sector, ETA y estado; el reparto de insumos (lanchas, agua, botiquines) y **qué sectores quedan sin cubrir**. Cierra el ciclo: el IPR ordena la cola, esto la ejecuta. Sin cards: tabla + barra de cobertura. |
| `19-privacidad` | seccion-A8 | pendiente | Cierre del sistema: **privacidad por diseño** como argumento, no como letra chica. Conteo agregado, sin apps en el teléfono, sin identificadores, sin localizar individuos. Más fuente del dato y corte del reporte. Es la sección que responde la pregunta incómoda del jurado. |

### Página `02-brigadas` (móvil · `institucional` · 390 px)

| slug | dueño | estado | interfaz / notas |
| --- | --- | --- | --- |
| `20-bar` | seccion-B1 | pendiente | Cabecera de brigada: SITRE, **`Brigada 1 · Malecón`**, estado de enlace (LoRa, último sync hace 12 min), batería. Elementos de 48 px mínimo. |
| `21-tarea` | seccion-B2 | pendiente | Tarea asignada, en este orden: sector, **IPR y prioridad**, personas estimadas, checklist de equipo, tiempo estimado de llegada. Botón primario grande `Iniciar ruta`. |
| `22-mapa` | seccion-B3 | pendiente | Mini-mapa del sector: manzana objetivo, rutas de acceso, **zona segura / punto de encuentro**, nodos SITRE cercanos y su confianza. Solo lectura, sin interacción. |
| `23-reporte` | seccion-B4 | pendiente | Reporte en campo: botones grandes `Rescatados` / `Sin hallazgos` / `Requiere apoyo`, nota corta, y estado de envío **en cola por LoRa** → `se enviará al recuperar enlace`. Cierra el ciclo del sistema en campo. |

### 4.2 Cobertura del sistema — cada capacidad tiene su sección

Prueba de que el prototipo representa **todo** lo que el sistema hace. Si algo de esta tabla no
aparece en pantalla, falta una sección.

| Capacidad del sistema | Sección que la muestra |
| --- | --- |
| Detección de ocupación por Wi-Fi/BT **sin apps** | `11-mapa`, `15-detalle`, `19-privacidad` |
| Estimación repetida y validada (no conteo exacto) | `12-prioridad`, `13-comparar`, `15-detalle` |
| Nodos en puntos elevados y estratégicos | `11-mapa` (marcadores), `14-red`, `17-croquis` |
| Red **LoRa** de bajo consumo | `14-red` |
| Estación base **store-and-forward** | `14-red`, `10-bar` |
| **Modo apagón** (sigue midiendo sin internet) | `10-bar`, `14-red` |
| **Baterías de respaldo** y autonomía | `14-red`, `20-bar` |
| **Sensores ambientales** (nivel de agua, lluvia) | `11-mapa` (capa amenaza), `15-detalle`, `14-red` |
| **Mapa de calor** de distribución de personas | `11-mapa` |
| **Comparar** ocupación habitual vs. pre vs. post-evento | `13-comparar` |
| **Priorizar** sectores para el rescate (IPR) | `12-prioridad` |
| **Nivel de confianza** y datos desactualizados | `12-prioridad`, `14-red`, `15-detalle` |
| **Coordinar brigadas y distribuir recursos** | `16-recursos` |
| **Privacidad**: agregado y sin identificar personas | `19-privacidad` |
| **Escala nacional**: 17 unidades territoriales, multi-evento, niveles de alerta | `08-nacional`, `09-escala`, `10-bar` |
| **Descenso de escala** país → región → municipio → sector | `09-escala` |
| **El nodo emitiendo y quién responde, en vivo** | `17-croquis` |
| Versión **portable** para brigadas en campo | `20-bar`…`23-reporte` |

### Retiradas (no se ensamblan)

| slug | motivo |
| --- | --- |
| `00-nav`, `01-hero`, `99-footer` | Eran la landing de la plantilla. Fuera de alcance (§1). Se conservan en disco. |

Estados: `pendiente` → `en curso` → `listo`. Las filas `seccion-A*` y `seccion-B*` ya están **listas**;
las `seccion-N*` (nuevas de §2.3) van `pendiente`.

### 4.1 Datos ficticios canónicos — usar EXACTAMENTE estos

Toda sección usa estas cifras. Si una sección necesita un dato que no está aquí, lo deriva de estos
(o avisa al orquestador); **no se inventa otro número que contradiga el cuadro.**

#### Escala nacional (Nicaragua) — el techo del sistema

**17 unidades territoriales:** 15 departamentos + **RACCN** (costa caribe norte) y **RACCS** (costa
caribe sur). **153 municipios**, **132 con cobertura SITRE**.

**Red nacional:** **1 276 nodos** desplegados · **1 138 en línea (89 %)** · **96 brigadas** municipales
· **480 000 personas** en zonas bajo alerta.

Nodos por unidad — usar **exactamente** estos números para el relleno del mapa nacional:

| unidad | nodos | unidad | nodos | unidad | nodos |
| --- | --- | --- | --- | --- | --- |
| Managua | 210 | Chinandega | 74 | Rivas | 44 |
| **RACCN** | **186** | Estelí | 62 | Carazo | 40 |
| Matagalpa | 96 | Nueva Segovia | 58 | Boaco | 38 |
| Jinotega | 88 | Chontales | 54 | Río San Juan | 36 |
| RACCS | 82 | Masaya | 52 | Madriz | 34 |
| León | 76 | Granada | 46 | | |

**3 eventos activos en el país:**

| # | evento | unidades | alerta | detalle |
| --- | --- | --- | --- | --- |
| 1 | **Huracán *Celeste*** (cat. 2) | RACCN | **ROJA** | Toca tierra **16 oct 21:30**. Es el evento que baja de escala en todo el prototipo. |
| 2 | **Crecida del Río Coco** | RACCN, Jinotega | **AMARILLA** | **+2.1 m** sobre el umbral desde el 15 oct 18:00. |
| 3 | **Enjambre sísmico** | Rivas | **VERDE** | Volcán Concepción, **34 sismos en 24 h**. En seguimiento. |

**La cadena de escala** (`09-escala`): estos cuatro peldaños, en este orden.

| nivel | nombre | dato rey |
| --- | --- | --- |
| País | Nicaragua | 17 unidades · 1 276 nodos · 3 eventos |
| Región | **RACCN** | 8 municipios · 186 nodos · 2 eventos |
| Municipio | **Puerto Cabezas** (Bilwi) | 148 000 hab · 42 nodos · 6 sectores |
| Sector | **Malecón Centro** | 780 personas · IPR 94 |

#### Escala municipal — el evento del prototipo

**Evento.** Huracán *Celeste*, categoría 2. Toca tierra el **16 oct 21:30**. Corte del reporte:
**17 oct 04:30** = **hora 7 post-impacto**. **Puerto Cabezas (Bilwi), RACCN** — municipio costero,
148 000 hab., **6 sectores**, **42 nodos**.

**Definición del IPR (el corazón del sistema).**
`IPR = ocupación estimada × factor de amenaza × factor de confianza`, **donde la baja confianza
SUBEN el IPR**: un dato viejo o un sector en silencio no se ignora, **se manda a verificar**.
Por eso la acción sugerida no siempre es "rescate": a veces es "reconocimiento" o "actualizar dato".

| # | Sector | Base habitual | Pre-evento (21:15) | Post-evento (04:30) | Amenaza | Confianza | IPR | Acción sugerida |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Malecón Centro** | 320 | 410 | **780** | 4 · inundación costera | Alta · fresco 04:28 | **94** | **Enviar brigada** (rescate) |
| 2 | **Ribera del Río** | 140 | 300 | **sin dato** | 5 · río +3.2 m sobre umbral | Sin dato · nodos en silencio | **91** | **Enviar reconocimiento** |
| 3 | **Barrio La Curva** | 550 | 610 | **240** | 4 · quebrada desbordada | Media · 2 de 5 nodos en silencio | **88** | **Verificar** (posible subregistro) |
| 4 | **Puerto Norte** | 180 | 240 | **640** | 3 · agua en muelles | Media · fresco 04:10 | **86** | **Enviar brigada** |
| 5 | **Mercado Viejo** | 480 | 430 | **90** | 3 · acumulación pluvial | Baja · dato de hace 5 h | **61** | **Actualizar dato** |
| 6 | **Colonia El Roble** | 210 | 190 | **260** | 1 · sin afectación | Alta · fresco 04:29 | **42** | **Monitorear** |

**Los tres estados del comparador** (`13-comparar`), y por qué son comparables:
- **Base habitual** = promedio de las últimas **8 semanas**, **mismo día y hora** (martes 21:30). Es la
  única forma de que la comparación valga: se compara contra lo que esa zona *suele* tener a esa hora.
- **Pre-evento** = último registro antes del corte de energía (16 oct 21:15).
- **Post-evento** = último registro recibido (17 oct 04:30).

**Red LoRa.** **42 nodos**, **34 en línea**, **8 en silencio**. Estación base con **enlace parcial**.
Última sincronización con SINAPRED: **04:30** (hace 40 min). **Cola de sincronización: 1 246 registros
pendientes.** Sin internet: los datos siguen guardándose en local (modo apagón).

**Sensores ambientales.** Ribera del Río: río **+3.2 m** sobre el umbral de desborde, lluvia 84 mm/24 h.
Malecón Centro: marea y oleaje, 0.9 m de inundación en la vía. Barrio La Curva: quebrada desbordada.
Puerto Norte: agua en los muelles. Mercado Viejo: acumulación pluvial. Colonia El Roble: sin afectación.

**Brigadas.** 4 brigadas disponibles. **Brigada 1 → Malecón Centro** (es la de la vista móvil).
Brigada 2 → Puerto Norte. Brigada 3 → reserva. Brigada 4 → reconocimiento a Ribera del Río.

**Privacidad (texto literal del sello).** `Conteo agregado · sin identificar personas`.

**Nodos citados (usar estos, no inventar otros).** Antigüedad media del dato en la red: **6 min**.

| Nodo | Sector | Estado | Dato | Batería |
| --- | --- | --- | --- | --- |
| Nodo 07 | Malecón Centro | en línea | lectura 04:28 · confianza alta | 71 % |
| Nodo 31 | Malecón Centro | en línea | confianza alta | — |
| Nodo 14 | Ribera del Río | en silencio hace 7 h 15 min | último dato 300 | 62 % |
| Nodo 22 | Mercado Viejo | último dato | 23:40 | 34 % |

**Accesos de Malecón Centro.** `Av. Costanera` · acceso oeste · libre · · `Calle El Muelle` · acceso sur ·
anegada 0.9 m · · `Paseo del Malecón` · bloqueado por escombros. Ruta de Brigada 1: 2.4 km · ETA 12 min.


## 5. Definición de terminado (por sección)
- [ ] `section.html` y `section.css` existen y siguen el formato.
- [ ] Usa tokens; sin valores mágicos nuevos.
- [ ] Se ve bien a 1440 px y 390 px.
- [ ] Se ve bien en los **4 temas** (probarla con cada `data-theme` antes de entregar).
- [ ] Preview en `/secciones/<slug>/` sin desbordes ni solapamientos.
- [ ] Sin JS ni lógica. Datos realistas en español.
- [ ] `impeccable detect secciones/<slug>` sin hallazgos *primary* (los *advisory* son consejo).

## 6. Flujo de paralelización
1. Orquestador rellena este contrato y `secciones/_sections.json`.
2. Lanza **un subagente `seccion` por carpeta**, en paralelo (en segundo plano).
3. Los subagentes trabajan aislados; no se esperan entre sí.
4. Al terminar todos: detector impeccable sobre `secciones/` **una vez** (un tirón, no en bucle) → corregir lo *primary*.
5. `npm run build` → `paginas/`.
6. Revisión visual, capturas (`npm run capture`) y video (`npm run video`).

Sesiones separadas de OpenCode: usar worktrees (`tools.opencode.worktree_create`), una por
sección, y luego merge. Requiere que el repo sea git.

## 7. Carril 3D — Prototipo del equipo de campo (VIGÍA-07)

> **Qué es.** Lo que se instala en el cerro, el poste o el techo: el **equipo real**, en 3D. Los renders
> son material de rodaje del video, no una pantalla. Este carril **no toca `secciones/`** ni `paginas/`:
> escribe solo en `blender/` (escenas y scripts) y `presentacion/3d/` (renders). Herramientas:
> MCP `blender` + Blender 4.5 (`BLENDER.md`). **Requiere Blender abierto y el addon MCP conectado** en
> el puerto 9876; si no, las llamadas fallan con "Could not connect to Blender".

### 7.1 Criterio visual

Equipo **real**, no render de catálogo. La credibilidad la dan los detalles: tornillos allen, prensaestopas,
bridas UV, junta de la tapa, etiqueta inox grabada, polvo y salpicaduras de barro, cantos biselados y
desgastados. **Escala real en metros** en todo el modelo. Nada flota: cada pieza tiene su soporte, brida
o abrazadera visible.

### 7.2 Inventario de objetos (dimensiones reales)

**Nodo de campo (héroe) — diseño vigente: PUCK 360°**

> **REGLA VISUAL APROBADA: no debe parecer una farola.** Se descartaron dos diseños por eso:
> (1) caja IP65 colgada de un costado del poste (no recibe de todos lados), y (2) "corona" de
> cuerpo cilíndrico con cono arriba y banda de vidrio que brilla = silueta exacta de lámpara de
> alumbrado público. Prohibido volver a sombrero cónico + banda de vidrio luminosa sobre un poste.

| objeto | dim. reales | notas de modelado |
| --- | --- | --- |
| `POSTE` | Ø 0.14 m × 6.00 m, hincado | Concreto con poro y manchas de humedad (textura real, `span` de grano fino para que no parezca piedra pómez). **Marcas de umbral pintadas**: banda ámbar a 1.20 m (`NIVEL DE ALERTA`) y banda roja a 2.00 m (`CRÍTICO`), más regla hidrométrica con ticks. Es el riesgo ambiental contado en el mundo físico, sin UI. |
| `PUCK` | Ø 0.28 m × 0.115 m | **Disco ancho y bajo** de aluminio anodizado **oscuro**, montado sobre la punta del mástil. Es simétrico → recibe de todos lados. 8 **costillas verticales** de disipación asomando del costado (tiene que leerse como equipo). Aros claros arriba y abajo. |
| `TAPA_SOLAR` | Ø 0.262 m, octogonal | Techo **plano** de celdas solares que sobresale del cuerpo (sin cono), con juntas de celda claras y aro de aluminio. Genera 360° de captación sin parecer sombrero. |
| `VENTANAS_RF` | 0.084 × 0.052 m × 4 | **4 ventanas de RF ahumadas a 90°**, montadas en bolsillos fresados. No son vidrio transparente: son paneles dieléctricos por los que sale y entra la señal. Una por cada antena. |
| `LED_ESTADO` | Ø 0.011 × 2 | Dos lentes laterales (verde enlace · ámbar guardando local) en un bisel oscuro. **Sin anillo luminoso**: es el error que convertía el equipo en lámpara. |
| `ELECTRONICA` | torre de 3 PCB de 0.116 m | Interna, visible solo en la toma de corte/explosión: PCB superior con **4 chip-antennas a 90°** (esto es lo que da los 360°), ESP32-S3 con su blindaje, módulo LoRa **SX1276 `915 MHz`** (banda ISM de Latinoamérica, no 868), coil de cobre, borneras, protecciones. |
| `PLACAS` | 0.086 × 0.030 m | Inox grabado, dos: `VIGÍA-07 / SIRT · SINAPRED` y `LoRa 915 MHz / RX 360 · SIN APP`. Es el dato que da credibilidad en un primer plano. |
| `INSTALACION` | caja 0.17 × 0.115 × 0.075 m | Caja de conexiones abrazada al poste 1.00 m bajo el puck, prensaestopas, cable encamisado que baja, venteo Gore (membrana de presión) y **puerto M8 tapado para antena externa opcional**. Esto es lo que hace que parezca una instalación y no un objeto decorativo. |
| `NIVEL_AGUA` | sonda Ø 0.032 m | Cable + sonda cilíndrica de acero con punta. Baja 1.15 m desde la caja de conexiones. |
| `PLUVIOMETRO` | Ø 0.20 m | Balancín (`tipping bucket`): embudo blanco, rejilla antihoja, nivel de burbuja, montado en **brazo aparte 1.55 m bajo el puck** para que quede libre y nivelado. |
| `ANEMOMETRO` | Ø 0.24 m | **Cazoletas de 3 brazos a 120°** sobre eje vertical, cuerpo con optoacoplador y prensaestopas, en brazo aparte **0.66 m bajo el puck**: es lo más alto y libre de la torre. Da la **velocidad del viento**. |
| `ABRIGO_HR` | Ø 0.12 × 0.20 m | **Abrigo de radiación** del sensor de **humedad** (y temperatura): pila de 5 platos blancos con tapa y base, sensor en el centro, en brazo aparte **1.26 m bajo el puck** y **del lado opuesto al anemómetro** (no se estorban ni se dan sombra). |

**Estación receptora (gateway)** — caja IP65 en mástil de techo, antena LoRa 5 dBi, LED de estado,
alimentación 12 V; detrás, el **almacenamiento local** (guardar y sincronizar cuando vuelva el enlace).
Es la pieza que explica el modo apagón.

**Escena de campo** — cauce del río, orilla con piedras, vegetación baja, 3–4 viviendas de lámina y bloque
al fondo (barrio ribereño), cerro, neblina de amanecer. `VIGÍA-07` en primer plano sobre el poste.
**El agua tiene que subir** en la toma: es el relato completo en una imagen.

**Tres estados del nodo** (misma escena, se renderiza 3 veces): **verde** enlace OK · **ámbar** sin enlace,
guardando local · **rojo** nivel crítico. El estado se cuenta con el LED y las bandas del poste, sin HUD.

### 7.2b Edificio monitoreado — CENTRO COMERCIAL

Planta 32 × 20 m, 7.6 m de alto, **techo plano** con pretil; **huerto solar de 10 paneles inclinados 18°**
+ equipos de A/A + ductos + tanque + caseta de escalera + parabólica; **mástil de 2.9 m con el puck 360°**
en la cubierta. Fachada: vidriera de dos niveles, base oscura, alero partido en dos, volumen de vidrio de
acceso de doble altura con banda LED cian y **tótem luminoso**. Estacionamiento con líneas y 2 autos,
4 árboles lejanos, montañas al fondo. Es donde se concentra la gente: por eso el nodo va en su techo.

### 7.3 Materiales e iluminación

- **Materiales (PBR, EEVEE Next):** ABS gris RAL 7035 (rugosidad 0.5) · aluminio anodizado (metal 1.0,
  rug 0.35) · acero inox en tornillería · vidrio templado del panel (celdas azul oscuro) · FR-4 verde en
  la PCB · concreto con textura de poro · LED con **emisión fuerte** (lee bien en video, sin glow falso
  alrededor del objeto, que está prohibido en §2.1).
- **Iluminación, 3 setups guardados:** `L-HERO` (estudio: HDRI neutro + 2 area lights) para stills de
  producto con alfa · `L-CAMPO` (hora dorada baja + neblina volumétrica ligera) para la ribera ·
  `L-NOCHE` (apagón: luz lunar y **el LED del nodo como única fuente cálida**).
- **Cámaras:** `HERO_ISO` 50 mm a tres cuartos · `MACRO` 85 mm f/2.8 para los sensores · `DRON` 24 mm
  cenital a 30° para la escena · `CORTE` ortográfica para el despiece.

### 7.4 Reglas duras del carril 3D

1. **Escala real en metros** (la BOM está en `brief.md` §5). Si dudas de un tamaño, se mide, no se estima.
2. **Stills de producto con fondo TRANSPARENTE (PNG RGBA)** para que entren sobre cualquiera de los temas de §2.
   La escena de campo sí lleva cielo y niebla (ahí el fondo es la escena).
3. **Datos coherentes** con el nodo de ejemplo: `VIGÍA-07` · LoRa `915 MHz` · SF9 · ~12 km con línea de vista ·
   panel 5–10 W · batería 12 Ah · **7 días sin sol** · muestreo 60 s, agregado en ventanas de 5 min.
   No aparece ningún dato ni texto que contradiga §1.
4. **Privacidad en el mundo físico:** si se ve una etiqueta o placa, dice *"estimación agregada · sin
   identificación personal"*. Nunca siluetas de personas identificables ni rostros.
5. **Nada de Cycles: EEVEE Next** (PC de bajo rendimiento, 8 GB de RAM). Presupuesto de render pedido por
   el usuario: **24 muestras, 1600×900 / 1920×1080, máximo 1–2 imágenes por pasada**; clips a 24 fps.
6. Salida: `presentacion/3d/<toma>.png` y clips `presentacion/video/3d-<toma>.mp4`.
   **Prefijo `3d-` obligatorio** para no chocar con los clips HTML de `tools/video.mjs`.
7. **Los paneles solares nunca van planos:** el módulo del nodo va inclinado 22° y el huerto de cubierta 18°,
   siempre mirando al sol.
8. **Ningún clip se renderiza antes de que el usuario apruebe las imágenes** (regla explícita, 16 oct):
   primero stills → aprobación → después movimiento.
9. El nodo **no debe parecer una farola**: prohibido sombrero cónico + banda de vidrio luminosa sobre un poste.

## 8. Rodaje 3D — guion de tomas (`guion3d.json`)

30 fps · 1920×1080 · mp4 (H.264) + PNG 4K de cada toma. Estos 8 clips son el material del carril 3D:

| # | toma | movimiento | dur | qué dice |
| --- | --- | --- | --- | --- |
| 1 | `nodo-hero` | turntable 360°, fondo alfa | 8 s | Presentación del equipo. El plano limpio que abre. |
| 2 | `nodo-explosion` | las piezas se separan y se vuelven a armar | 10 s | **Toma estrella.** Caja → tapa → PCB (ESP32 + LoRa) → batería → antena → panel. Explica el hardware en un plano. |
| 3 | `sensor-lluvia` | macro, balancín volcando, gotas | 6 s | Sensor de riesgo ambiental nº1. |
| 4 | `sensor-nivel` | macro, el agua sube hasta la banda roja del poste | 8 s | Sensor nº2 + el umbral físico. La toma que asusta. |
| 5 | `campo-dron` | orbit descendente sobre el poste en la ribera | 10 s | Dónde vive el nodo y por qué en ese punto. |
| 6 | `lora-ondas` | pulsos concéntricos de la antena al gateway y a los nodos vecinos | 8 s | La red que sobrevive el apagón. |
| 7 | `nodo-estados` | plano fijo, LED verde → ámbar → rojo | 6 s | Confianza del dato: enlace, guardando local, crítico. |
| 8 | `estacion` | rack local + LED de sincronización | 8 s | Store-and-forward: guardar aquí, subir a SINAPRED cuando vuelva el enlace. |

**Notas de montaje:** las tomas 3 y 4 piden agua y partículas con simulación, que es lo más caro en RAM.
Presupuesto: simular una vez y **reutilizar el caché** en las dos tomas. Si el tiempo aprieta, la 3 y la 4
se hacen con keyframes y gotas como geometría simple: se ven casi igual en 2 segundos de video.

**Antes de renderizar:** Blender abierto y MCP conectado (§7), guardar el .blend, y verificar la salida con
`tools.blender.look` antes de gastar el render final. Una vez por toma, no en bucle.
