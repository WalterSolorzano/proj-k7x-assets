// tools/compose-recorrido.mjs
// Compone un video continuo y cinematográfico recorriendo desde lo nacional hasta lo específico
// usando crossfade/transiciones suaves para representar la visión de SINAPRED.
import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());
const VIDEO_DIR = join(ROOT, 'presentacion', 'video');
const OUTPUT_MP4 = join(VIDEO_DIR, 'recorrido-institucional-sinapred.mp4');

// Secuencia narrativa: Del nivel general (país) al específico (nodo y brigadas)
// t2-zoom-pais: Vista satelital/nacional completa con los 3 eventos activos y 1276 nodos
// t4-escala: Transición a la escala territorial (departamento, municipio, sector)
// t5-municipio: Puerto Cabezas (Bilwi) por manzanas, detección de ocupación y nodos
// t6-prioridad: Índice de Prioridad de Rescate (IPR), ranking y toma de decisiones
// t7-croquis-zoom: En vivo - nodo VIGÍA emitiendo paquete LoRa y respuesta de brigada
// t9-red: Red store-and-forward y cobertura ante fallo de infraestructura
const clips = [
  't2-zoom-pais.mp4',
  't4-escala.mp4',
  't5-municipio.mp4',
  't6-prioridad.mp4',
  't7-croquis-zoom.mp4',
  't9-red.mp4'
];

console.log('Verificando clips existentes en presentacion/video/ ...');
for (const c of clips) {
  const p = join(VIDEO_DIR, c);
  if (!existsSync(p)) {
    console.error(`Clip faltante: ${p}`);
    process.exit(1);
  }
}

console.log('Compilando video cinematográfico continuo con transiciones...');

// Usaremos un filtro complejo de xfade en ffmpeg para transiciones fluidas de 0.8s entre cada toma
// Cada clip se recorta al segmento dinámico óptimo (sin la espera estática del inicio/fin)
const filterParts = [
  // Recortes: [0:v] trim=start=1:end=9,setpts=PTS-STARTPTS[v0]; etc.
  '[0:v]trim=start=1:end=8.5,setpts=PTS-STARTPTS[v0]',
  '[1:v]trim=start=1:end=7.5,setpts=PTS-STARTPTS[v1]',
  '[2:v]trim=start=1:end=8.0,setpts=PTS-STARTPTS[v2]',
  '[3:v]trim=start=1:end=6.5,setpts=PTS-STARTPTS[v3]',
  '[4:v]trim=start=1:end=9.5,setpts=PTS-STARTPTS[v4]',
  '[5:v]trim=start=1:end=7.0,setpts=PTS-STARTPTS[v5]',
  // Duraciones efectivas:
  // v0: 7.5s
  // v1: 6.5s -> offset xfade 0 = 7.5 - 0.8 = 6.7s -> dura 7.5 + 6.5 - 0.8 = 13.2s
  // v2: 7.0s -> offset xfade 1 = 13.2 - 0.8 = 12.4s -> dura 13.2 + 7.0 - 0.8 = 19.4s
  // v3: 5.5s -> offset xfade 2 = 19.4 - 0.8 = 18.6s -> dura 19.4 + 5.5 - 0.8 = 24.1s
  // v4: 8.5s -> offset xfade 3 = 24.1 - 0.8 = 23.3s -> dura 24.1 + 8.5 - 0.8 = 31.8s
  // v5: 6.0s -> offset xfade 4 = 31.8 - 0.8 = 31.0s -> dura 31.8 + 6.0 - 0.8 = 37.0s
  '[v0][v1]xfade=transition=fade:duration=0.8:offset=6.7[x1]',
  '[x1][v2]xfade=transition=fade:duration=0.8:offset=12.4[x2]',
  '[x2][v3]xfade=transition=fade:duration=0.8:offset=18.6[x3]',
  '[x3][v4]xfade=transition=fade:duration=0.8:offset=23.3[x4]',
  '[x4][v5]xfade=transition=fade:duration=0.8:offset=31.0[outv]'
];

const args = [];
for (const c of clips) {
  args.push('-i', join(VIDEO_DIR, c));
}

args.push(
  '-filter_complex', filterParts.join(';'),
  '-map', '[outv]',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-preset', 'fast',
  '-crf', '19',
  '-y',
  OUTPUT_MP4
);

const proc = spawn(ffmpegStatic, args, { stdio: 'inherit' });
proc.on('close', (code) => {
  if (code === 0) {
    console.log(`\n¡Video continuo completado con éxito!\nGuardado en: ${OUTPUT_MP4}`);
  } else {
    console.error(`Error al compilar video (código ${code})`);
    process.exit(code);
  }
});
