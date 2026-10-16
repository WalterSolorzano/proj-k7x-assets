# Brief — SIRT: Sistema de Inteligencia Territorial para Rescates

> Rally Latinoamericano de Innovación 2026 · desafío: gestión del riesgo y rescate en desastres.
>
> **Dos carriles del mismo material de rodaje** (no hacemos una app, hacemos lo que va dentro del video):
> **(A) la plataforma** SITRE para SINAPRED — pantallas `01-plataforma` y `02-brigadas`, ver `CONTRATO.md` §1–§4;
> **(B) el prototipo 3D del equipo real de campo** — el nodo que se instala en los puntos elevados, la
> estación receptora y su escena de despliegue, ver `CONTRATO.md` §7–§8. Este brief alimenta a los dos.

## 1. La idea en una frase

Red de nodos autónomos montados en **puntos elevados y estratégicos** que estiman **cuánta gente
hay** en cada zona (señales Wi-Fi/Bluetooth, sin apps y sin identificar a nadie), las cruzan con
**sensores de riesgo ambiental** (nivel de agua y lluvia) y lo transmiten por **LoRa** a una estación
que sincroniza con SINAPRED cuando recupera enlace.

El resultado para la autoridad: **qué sector está lleno, cuál está en peligro y dónde conviene
mandar la brigada primero**.

## 2. Por qué no es "otro contador de personas"

| Solo conteo | SIRT |
| --- | --- |
| Cuántas personas hay | Cuántas hay **y** si el terreno las está poniendo en riesgo |
| Depende de internet | **LoRa 915 MHz** + buffer local en la estación |
| Depende de la luz eléctrica | Panel solar + batería LiFePO4 + respaldo |
| Un mapa de calor | Mapa de calor **+ nivel de confianza** (dato fresco / viejo / sin enlace) |

## 3. Detección de peligro (lo que la vuelve competitiva)

1. **Sensores de riesgo ambiental** en los mismos nodos: pluviómetro de balancín + sensor de nivel de
   agua (ultrasónico sobre el cauce y/o de presión sumergible).
2. **Cruce ocupación × peligro** → sector con gente + amenaza confirmada = prioridad de evacuación.
3. **Red independiente**: los nodos hablan LoRa con una estación receptora; la estación guarda todo
   localmente y sincroniza con SINAPRED cuando vuelve la conexión. Ningún nodo necesita internet.
4. **Mapa de prioridades con nivel de confianza**: se muestra si el dato es fresco, está desactualizado
   o no hubo enlace. Evita decidir sobre conteos poco fiables.

## 4. Límite técnico que asumimos de frente (y cómo lo contamos)

Los teléfonos modernos **aleatorizan su MAC** y no siempre transmiten. Por eso el sistema:

- **estima** ocupación con mediciones repetidas en ventanas de tiempo, no cuenta personas;
- **no localiza** individuos ni guarda identificadores;
- procesa todo **agregado por zona** (privacidad desde el diseño).

Comunicarlo da credibilidad técnica ante el jurado, no la quita. En pantalla se dice en una línea:
*"Estimación agregada por zona. Sin apps, sin identificación personal."*

## 5. Hardware del prototipo (BOM de referencia para el pitch)

| # | Componente | Rol | Costo aprox. (USD) |
| --- | --- | --- | --- |
| 1 | ESP32-S3 | Wi-Fi/BT scan + cómputo | 6 |
| 2 | Módulo LoRa SX1276 **915 MHz** (banda ISM de Latinoamérica) | enlace largo alcance | 12 |
| 3 | Antena LoRa 5 dBi + pigtail IP68 | 8–12 km con línea de vista | 9 |
| 4 | Caja estanca IP65/IP66 220×160×90 mm | intemperie, antivandálica | 18 |
| 5 | Panel solar 10 W + controlador MPPT | energía de día | 22 |
| 6 | Batería LiFePO4 12 Ah + BMS | respaldo nocturno y post-desastre | 35 |
| 7 | Pluviómetro de balancín | lluvia acumulada | 15 |
| 8 | Sensor ultrasónico impermeable (nivel de agua) | crecida del cauce | 14 |
| 9 | Prensaestopas IP68, bridas, tornillería inox, abrazaderas a poste | montaje real | 12 |
| 10 | Estación receptora: ESP32/raspberry + antena + SSD | buffer y sincronización | 45 |
| | **Total estimado por nodo** | | **≈ 145** |

Autonomía objetivo del nodo: **7 días sin sol**. Muestreo cada 60 s, agregado en ventanas de 5 min.

## 6. Lo que entregamos (material de rodaje)

Renders y clips **3D** del equipo real, no un dashboard:

1. Nodo completo en su punto de montaje (héroe, fondo transparente).
2. Nodo en explosión / armado, con piezas nombradas.
3. Close-ups de los sensores: pluviómetro, nivel de agua, antena, panel.
4. Estación receptora.
5. Escena de despliegue real: poste junto al cauce, con **regla hidrométrica pintada** marcando los
   umbrales amarillo/rojo y el LED del nodo cambiando de verde a ámbar a rojo.
6. Ondas LoRa saliendo de la antena hacia la estación (el sistema "hablando" sin internet).

Todo renderizado con **fondo transparente** para que sirva sobre cualquiera de los 4 temas del
sistema visual, y con **escala real en metros** para que las proporciones sean creíbles.

## 7. Reglas de corte

- Si no aparece en un render o en un clip, **no se hace**.
- Nada de simulación física, ni datos reales, ni backend. Los datos que se vean son de ejemplo.
- El web queda **congelado** (solo `00-nav`, `01-hero`, `99-footer`); como mucho una pantalla de
  apoyo "Nodo 07 — estado y confianza del dato" si sobra tiempo.
- Blender: **EEVEE Next** a 4K, no Cycles (8 GB de RAM).
