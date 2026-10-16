# Material de rodaje — SITRE

Clips con movimiento + stills de alta resolución del prototipo **SITRE — Sistema de Inteligencia
Territorial para Rescates** (SINAPRED, Nicaragua). **No es el video del pitch**: es lo que se monta
dentro.

El material sigue el orden del propio sistema, que es el **descenso de escala**: país → región →
municipio → sector → nodo (`CONTRATO.md` §2.3). Si el montaje respeta ese orden, la narrativa se
explica sola y no hay que inventarla en la sala de edición.

## Dos carriles, dos piezas del mismo pitch

| carril | qué es | dónde | guía |
| --- | --- | --- | --- |
| **Interfaz** (HTML) | La plataforma nacional y la pantalla de brigada. | `presentacion/video/` · `presentacion/video/movil/` | este documento |
| **3D** (Blender) | El equipo de campo físico —nodo VIGÍA-07, sensores, cubierta— renderizado. | `presentacion/video/3d-*` · `presentacion/3d/` | `material-3d.md` |

Los dos se distinguen por prefijo: `t*` y `m*` son interfaz; `3d-*` es el render. Conviven en
`presentacion/video/` a propósito.

---

# 1. Carril interfaz — clips

**1920×1080 · 30 fps constantes · `.webm` (crudo) y `.mp4` (H.264, para CapCut/Premiere).**

| clip | dur. | movimiento | para qué sirve en el montaje |
| --- | --- | --- | --- |
| `pitch-recurso-sinapred-impacto.mp4` | 29,8 s | 3D dinámico + Disolvencias cruzadas + UI telemetría | **Recurso estrella de alto impacto.** Vuelo 3D hacia el centro comercial, órbita del nodo 360° con anemómetro/sensores, y descenso de crisis SINAPRED: país → personas mapeadas por manzanas → orden de rescate → croquis con viento (84 km/h), lluvia y avance de brigadas. |
| `recorrido-institucional-sinapred.mp4` | 37,0 s | Recorrido continuo multicámara + disolvencias cruzadas | Pieza unificada de interfaces desde lo nacional hasta el croquis y la topología de red. |
| `t1-fijo-pais.mp4` | 15,4 s | Fijo | Plano sin movimiento sobre el mapa nacional. Es el fondo donde el montaje escribe los titulares del arranque. |
| `t2-zoom-pais.mp4` | 12,3 s | Zoom al país | **Plano de apertura.** La nación entera empujando hacia dentro: 17 unidades, 1 276 nodos, 3 eventos activos en un solo cuadro. |
| `t3-scroll-descenso.mp4` | 23,9 s | Scroll | Recorrido de las 11 secciones de un tirón. El tramo de explicación, y la prueba de que la escala baja de verdad. |
| `t4-escala.mp4` | 12,4 s | Zoom a la escalera | La misma geografía a cuatro escalas, del país a la calle. |
| `t5-municipio.mp4` | 13,2 s | Zoom al municipio | Puerto Cabezas (Bilwi) por manzanas: ocupación estimada y los 8 nodos en silencio. Geografía real, no inventada. |
| `t6-prioridad.mp4` | 10,1 s | Zoom a la tabla | El IPR y las decisiones que salen de él. **Aquí está el argumento fuerte:** 3 de 6 sectores cubiertos, y los 3 que faltan son la petición de refuerzos. |
| `t7-croquis-zoom.mp4` | 15,1 s | Zoom al croquis | **La toma estrella.** El nodo emitiendo, el paquete LoRa viajando a la base, la brigada avanzando: todo con el mismo reloj. Es el clímax. |
| `t8-croquis-pan.mp4` | 11,1 s | Pan sobre el croquis | Alternativa sobria al zoom sobre la misma escena, para no repetir recurso dos veces seguidas. |
| `t9-red.mp4` | 11,0 s | Zoom a la topología | Cierra el arco: qué pasa con los nodos que no llegan y por qué el dato viejo cuenta. |

## Carril interfaz — pantalla de brigada (vertical)

**540×1170 · 30 fps.** Va aparte porque el marco es vertical y el motor fija el preset por
lanzamiento. El contenedor de las secciones móviles mide 430 px, así que a 540 queda un margen de
papel a los lados en vez de un layout estirado.

| clip | dur. | movimiento | para qué sirve |
| --- | --- | --- | --- |
| `m1-fijo-tarea.mp4` | 12,0 s | Fijo | La tarea asignada: Brigada 1 → Malecón Centro. Fondo para rótulo en vertical. |
| `m2-scroll-brigada.mp4` | 15,2 s | Scroll | El ciclo completo: tarea → mapa → reporte. |
| `m3-mapa-sector.mp4` | 9,9 s | Zoom al mini-mapa | La misma geometría del tablero nacional, a escala de una calle. |
| `m4-reporte.mp4` | 10,0 s | Zoom al reporte | El dato que vuelve al sistema y corrige el índice. Cierra el circuito. |

# 2. Stills

Un fotograma por clip, **tomado al final del movimiento**: es el encuadre ya cerrado de su propia
toma, no la cabecera de la página.

- **Interfaz:** `t*.png` a **3840×2160** (escala 2). `m*.png` a **1080×2340**.
- **Página completa** (no son fotogramas de clip, son la pantalla entera): `presentacion/01-01-plataforma.png`
  (1440×10 419) y `presentacion/02-brigadas-movil.png` (860×4 008, a ancho de teléfono).
- **3D:** ver `material-3d.md` §2 — varios con **fondo transparente (RGBA)**, para que entren sobre
  cualquier tema.

# 3. Orden sugerido de montaje

No es obligatorio, pero es el que aprovecha el material sin repetir recurso:

1. `t2-zoom-pais` (12,3 s) — apertura. O `t1-fijo-pais` (15,4 s) de fondo bajo un titular.
2. `t4-escala` (12,4 s) — el descenso.
3. `t5-municipio` (13,2 s) — dónde ocurre.
4. `t6-prioridad` (10,1 s) — qué decide el sistema.
5. `t7-croquis-zoom` (15,1 s) — **el clímax**, cómo se ve funcionando. Alternativa: `t8-croquis-pan`.
6. `t9-red` (11,0 s) — qué pasa con los nodos que faltan.
7. Interludio de campo: `m2-scroll-brigada` (15,2 s) + `m3-mapa-sector` (9,9 s).
8. Si el montaje necesita **una sola toma que lo explique todo**: `t3-scroll-descenso` (23,9 s).

Suma de la secuencia sugerida: **≈ 1 min 39 s**. Bruto del carril interfaz: 2 min 04 s de plataforma
+ 47 s de móvil.

# 4. Cosas que hay que saber antes de editar

- **Cada clip arranca con la página cargando en reposo** (entre 2 y 9 s, según la toma). Es normal en
  material crudo: se recorta el inicio en la línea de tiempo. Los tiempos de la tabla son del archivo
  completo, no del tramo útil.
- **El movimiento es el dato, no adorno** (`CONTRATO.md` §2.4). En `t7` el nodo emite, el paquete
  viaja, la base acusa recibo y la brigada avanza **con el mismo reloj**: si se corta a mitad, se
  rompe la lectura de "esto está funcionando en vivo". Dejar el ciclo completo (≈ 5,3 s).
- **No hay barra fija** en ninguna de las dos pantallas, así que no hace falta recortar cromo.
- **Nada rebota.** La curva de todo el sistema es `cubic-bezier(0.22, 1, 0.36, 1)`. Si se acelera o se
  invierte un clip en el montaje, se pierde esa lectura.
- Los `.mp4` van con **rate constante a 30 fps** a propósito: CapCut y Premiere se llevan mal con VFR.

# 5. Cómo se regraba

```bash
# Carril interfaz — plataforma (16:9)
npm run video -- --guion guion.json --preset 16x9 --scale 2 --mp4 --stills --fps 30

# Carril interfaz — brigada (vertical, a su propia carpeta para no pisar el índice)
npm run video -- --guion guion-movil.json --width 540 --height 1170 --scale 2 --mp4 --stills --fps 30 --out presentacion/video/movil

# Capturas de página completa
npm run capture
```

Los guiones (`guion.json`, `guion-movil.json`) llevan en `_para` el motivo de cada toma: si se cambia
el contenido, se ajusta ahí y se vuelve a grabar.

# 6. Pendiente y roto

- **`3d-04-llegada-centro-comercial0001-0145.mp4` pesa 48 bytes.** `material-3d.md` §1 lo da por
  entregado, pero la exportación falló (se escribió a las 14:52:46, justo detrás de `3d-03-vertical`,
  que sí salió bien). Es el vuelo de llegada al centro comercial: **hay que re-renderizarlo**.
- Hay **dos variantes** del plano vertical: `3d-03-poste-vertical0001-0145.mp4` (13:34) y
  `3d-03-vertical0001-0145.mp4` (14:52). La guía nombra la segunda; la primera es un render anterior
  del mismo plano.
- `3d-0x-…0001-0193.mp4`: el sufijo son los números de fotograma de Blender, no un error.
