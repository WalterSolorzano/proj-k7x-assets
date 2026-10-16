# Material de rodaje — Carril 3D (VIGÍA-07 / SIRT)

Clips con movimiento + stills del **prototipo del equipo de campo en 3D**, listos para montar en el
video del pitch. No es una app: es la pieza visual que se inserta. Contrato: `CONTRATO.md` §7–§8.

Motor: **Blender 4.5 LTS · EEVEE Next · 24 muestras** (sin Cycles: la PC es de bajo rendimiento).
Todo es geometría **procedural** (`blender/sirt.py`) sobre el kit de texturas/HDRIs **Poly Haven**.

---

## 1. Clips (esto es lo que va dentro del video)

| archivo | qué muestra | formato | dur. | movimiento |
| --- | --- | --- | --- | --- |
| `3d-01-turntable.mp4` | El nodo 360° en la punta del mástil: panel solar inclinado, 4 ventanas RF, LEDs, placas grabadas | 1920×1080 · 24 fps | 8,0 s | órbita completa |
| `3d-02-detalle.mp4` | La instalación de cerca: **anemómetro de cazoletas**, **abrigo de humedad**, caja de conexiones, pluviómetro, sonda de nivel | 1920×1080 · 24 fps | 7,0 s | órbita a media altura |
| `3d-03-vertical.mp4` | Subida por el poste: bandas de umbral pintadas → sensores → nodo | **1080×1920** · 24 fps | 6,0 s | grúa vertical (para redes) |
| `3d-04-llegada-centro-comercial.mp4` | Vuelo desde el plano general del **centro comercial** hasta el nodo en la cubierta | 1920×1080 · 24 fps | 6,0 s | fly-in |

Los clips usan el prefijo `3d-` para no chocar con los clips HTML de `tools/video.mjs`
(`t1-…` a `t5-…`).

## 2. Stills de alta calidad

**Producto (fondo TRANSPARENTE, PNG RGBA — entran sobre cualquier tema de la presentación):**

- `presentacion/3d/rev-03-puck-hero.png` — el nodo a tres cuartos. Es el plano de producto.
- `presentacion/3d/rev-04-puck-macro.png` — macro: celdas del panel, ventanas RF, LEDs, placas inox
  `VIGÍA-07 · SITRE · SINAPRED` / `LoRa 915 MHz · RX 360`.

**Instalación y campo (con cielo y montañas, hora dorada):**

- `presentacion/3d/rev-08-sensores.png` — la instalación completa: anemómetro, abrigo de humedad,
  caja de conexiones, pluviómetro de balancín y sonda de nivel.
- `presentacion/3d/rev-09-instalacion.png` — tres cuartos con las montañas detrás.
- `presentacion/3d/rev-01-centro-moderno.png` — el centro comercial monitoreado: fachada vidriada,
  tótem luminoso, estacionamiento.
- `presentacion/3d/rev-02-cubierta-nodo.png` — la cubierta plana: huerto solar de 10 paneles
  **inclinados 18°**, equipos de A/A, caseta, parabólica y el nodo en su mástil.

## 3. Qué mide el equipo (lo que hay que decir en la locución)

Del nodo cuelgan, en brazos separados para que no se estorben:

- **Anemómetro de cazoletas** → velocidad del viento (el más alto y libre).
- **Abrigo de radiación** (pila de platos blancos) → humedad y temperatura, a la sombra y del lado
  opuesto al anemómetro.
- **Pluviómetro de balancín** → lluvia, en su propio brazo, nivelado.
- **Sonda de nivel** → nivel del agua, por cable.
- **Caja de conexiones** abrazada al poste, prensaestopas, venteo y puerto tapado para antena externa.

Y arriba, en el disco: 4 antenas internas a 90° (**RX 360°**, ventanas RF ahumadas), LoRa **915 MHz**
(banda ISM de Latinoamérica), módulo PV **inclinado 22°** y LEDs de estado (verde enlace / ámbar
guardando local).

## 4. Cómo se monta en el pitch (sugerencia de cortes)

1. `rev-01-centro-moderno.png` (3 s, fundido) → *"donde se concentra la gente"*.
2. `3d-04-llegada-centro-comercial.mp4` → sube al techo y entra al nodo.
3. `3d-01-turntable.mp4` → el aparato, limpio.
4. `3d-02-detalle.mp4` → *"mide viento, humedad, lluvia y nivel"*.
5. `rev-08-sensores.png` (still, con respiro) → detalle de la estación.
6. `3d-03-vertical.mp4` → cierre vertical (sirve también para redes).

## 5. Reglas que respeta este material

1. El nodo **no parece una farola** (prohibido sombrero cónico + banda de vidrio luminosa sobre poste).
2. Los **paneles solares nunca van planos**: 22° en el nodo, 18° en la cubierta, mirando al sol.
3. Escala real en metros; las bandas del poste son **1,20 m (ámbar, alerta)** y **2,00 m (roja, crítico)**.
4. Datos coherentes con el brief: `VIGÍA-07`, `SITRE · SINAPRED`, LoRa `915 MHz`, sin identificación
   personal (privacidad resuelta en el mundo físico, sin UI).
5. Ningún clip se renderiza antes de la aprobación de las imágenes.

## 6. Estado y pendientes

- Aprobado por el usuario: imágenes `rev-01`, `rev-02`. Clips 1, 2, 3 y 4 renderizados con los
  materiales definitivos (panel inclinado, vidrio oscuro, sensores incluidos).
- Descartados y borrados del entregable: los renders `ref-*` de los diseños previos (caja lateral,
  corona tipo farola, escuela, centro comercial antiguo) y el clip viejo con el panel plano.
- Si se pide más: falta un **plano nocturno** (LED del nodo como única fuente cálida) y una toma de
  **explosión/armado** mostrando la electrónica interna (4 chip-antennas a 90°, ESP32-S3, LoRa).
