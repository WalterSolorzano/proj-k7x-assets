---
description: Reparte el build en paralelo, un subagente por sección
agent: rally
---

Reparte el trabajo en paralelo:
1. Actualiza el inventario de `CONTRATO.md` y `secciones/_sections.json` con las secciones indicadas.
2. Lanza un subagente `seccion` por cada carpeta en paralelo (en segundo plano), con el slug,
   la carpeta, el titular y los datos ficticios de cada una.
3. Al terminar todos, ejecuta `npm run build` y resume el estado de cada sección en una línea.

Secciones o instrucciones: $ARGUMENTS
