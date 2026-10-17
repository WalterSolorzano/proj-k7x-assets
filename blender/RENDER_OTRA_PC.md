# Guía de Renderizado para la otra PC — VIGÍA-07 / SITRE 3D

El archivo de escena **`blender/vigia-07-nodo.blend`** ya está completamente modelado, texturizado con materiales PBR avanzados y con la animación/cámaras configuradas para renderizar en una máquina potente.

---

## 1. Novedades y Mejoras Implementadas
1. **Producto All-in-One (Sensores Integrados al Chasis):**
   - Todos los sensores ahora forman parte **física del propio equipo**, sin cajas externas colgadas ni brazos toscos de poste:
     - **Anemómetro de viento:** anclado directamente al hombro superior del Puck.
     - **Sensor de humedad y temperatura:** cápsula compacta integrada a la bahía lateral del chasis.
     - **Pluviómetro de balancín:** montado en soporte mecanizado CNC a ras del cuerpo.
     - **Sonda de nivel:** conexión directa mediante conector rápido estanco M12 inferior.
2. **Panel Solar Realista:** 
   - Silicio monocristalino azul noche con rejilla conductora de plata y vidrio templado antirreflectante IOR 1.52.
3. **Mástil Esbelto:** 
   - Sin poste de concreto tosco; montura técnica de aluminio aeroespacial con brida industrial de fijación.
4. **Despiece Técnico Animado (Exploded View):**
   - Secuencia en frames 1..60 que expone el interior del dispositivo (Panel solar $\to$ Tapa estanca $\to$ PCB Antenas 360° $\to$ Procesador ESP32-S3 $\to$ Módulo LoRa 915 MHz $\to$ Sensores perimetrales $\to$ Chasis disipador $\to$ Brida base).

---

## 2. Los 3 Escenarios y sus Cámaras

| Escenario | Nombre de Cámara | Tipo de Toma | Frames | Descripción |
| --- | --- | --- | --- | --- |
| **1A. Producto Hero** | `CAM_ESC1_PRODUCTO_360` | Giro orbital 360° | `1..120` (5s @ 24fps) | Enfoque cercano al puck limpio sobre mástil corto. Fondo transparente RGBA. |
| **1B. Despiece Técnico** | `CAM_ESC1_DESPIECE` | Animación de Armado/Explosión | `1..60` (2.5s @ 24fps) | En frame 1 está cerrado; en frame 60 todas las piezas internas levitan en orden. |
| **2. Campo / Sensores** | `CAM_ESC2_SENSORES_360` | Giro orbital amplio | `1..120` (5s @ 24fps) | Abarca mástil, anemómetro, abrigo de humedad, pluviómetro y caja de radio. |
| **3. Cubierta Urbana** | `CAM_ESC3_CUBIERTA` | Vista fija / plano general | Frame estático o video | El nodo operando sobre la cubierta del centro comercial. |

---

## 3. Comandos Rápidos para Renderizar en la otra PC

Abre una terminal en la otra máquina dentro de la carpeta del proyecto y ejecuta:

### Opción A — Renderizar Video Clips (.mp4) por Línea de Comandos

```bash
# 1. Giro 360° de Producto (Escenario 1)
blender -b blender/vigia-07-nodo.blend -s 1 -e 120 -a -o //presentacion/video/3d-01-producto-360-#####

# 2. Despiece Técnico / Explosión (Frames 1 al 60)
# (Selecciona la cámara de despiece antes de renderizar)
blender -b blender/vigia-07-nodo.blend --python-expr "import bpy; bpy.context.scene.camera = bpy.data.objects['CAM_ESC1_DESPIECE']" -s 1 -e 60 -a -o //presentacion/video/3d-despiece-#####

# 3. Giro 360° de la Estación con Sensores de Viento y Humedad (Escenario 2)
blender -b blender/vigia-07-nodo.blend --python-expr "import bpy; bpy.context.scene.camera = bpy.data.objects['CAM_ESC2_SENSORES_360']" -s 1 -e 120 -a -o //presentacion/video/3d-02-sensores-360-#####
```

### Opción B — Desde la Interfaz de Blender
1. Abre `blender/vigia-07-nodo.blend`.
2. Presiona `0` en el teclado numérico para ir a la vista de cámara.
3. Para cambiar de escenario, ve a la pestaña **Scene Properties** $\to$ **Camera** y selecciona `CAM_ESC1_PRODUCTO_360`, `CAM_ESC1_DESPIECE` o `CAM_ESC2_SENSORES_360`.
4. Pulsa `Ctrl + F12` para renderizar la animación con Cycles o EEVEE Next a la calidad deseada.
