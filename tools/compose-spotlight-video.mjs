// tools/compose-spotlight-video.mjs
// Ensambla un recurso de video de alto impacto para el pitch:
// Integra el modelo 3D realista con rotación/aproximación, los datos ambientales en vivo
// (velocidad de viento, lluvia, inundación) y las UIs dinámicas desde escala nacional hasta la específica.
import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());
const VIDEO_DIR = join(ROOT, 'presentacion', 'video');
const OUTPUT_MP4 = join(VIDEO_DIR, 'pitch-recurso-sinapred-impacto.mp4');

console.log('Verificando piezas multimedia disponibles (3D + UI)...');
const clipsToCheck = [
  '3d-04-llegada-centro-comercial0001-0145.mp4',
  '3d-01-turntable0001-0193.mp4',
  't2-zoom-pais.mp4',
  't5-municipio.mp4',
  't6-prioridad.mp4',
  't7-croquis-zoom.mp4'
];

for (const c of clipsToCheck) {
  const p = join(VIDEO_DIR, c);
  if (!existsSync(p)) {
    console.error(`Clip no encontrado: ${p}`);
    process.exit(1);
  }
}

console.log('Ensamblando video recurso de alto impacto (3D en movimiento + telemetría + navegación de crisis)...');

// Secuencia:
// 1. [0] 3D Vuelo llegada a edificio monitoreado (0s a 5s)
// 2. [1] 3D Turntable del Nodo 360° con celdas, ventanas RF y sensores (0.5s a 5.5s)
// 3. [2] UI Nacional SINAPRED (Zoom país, 3 eventos activos y 1276 nodos) (1.0s a 6.5s)
// 4. [3] UI Municipio Puerto Cabezas (Bilwi) con calor de personas mapeadas (1.0s a 7.0s)
// 5. [4] UI Prioridad IPR y despacho de brigada (1.0s a 6.0s)
// 6. [5] UI Croquis Isométrico en vivo (Nodo emitiendo, viento, lluvia, avance brigada) (1.0s a 8.5s)

// Se reescala todo de forma homogénea a 1920x1080 @ 30fps para máxima nitidez y transiciones de disolvencia cruzada (xfade).
const filterComplex = [
  '[0:v]trim=start=0:end=5.0,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c0]',
  '[1:v]trim=start=0.5:end=5.5,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c1]',
  '[2:v]trim=start=1.0:end=6.5,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c2]',
  '[3:v]trim=start=1.0:end=7.0,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c3]',
  '[4:v]trim=start=1.0:end=6.0,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c4]',
  '[5:v]trim=start=1.0:end=8.5,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c5]',
  // Duraciones:
  // c0: 5.0s
  // c1: 5.0s -> offset 0 = 5.0 - 0.7 = 4.3s -> total 8.6s
  // c2: 5.5s -> offset 1 = 8.6 - 0.7 = 7.9s -> total 13.4s
  // c3: 6.0s -> offset 2 = 13.4 - 0.7 = 12.7s -> total 18.7s
  // c4: 5.0s -> offset 3 = 18.7 - 0.7 = 18.0s -> total 23.0s
  // c5: 7.5s -> offset 4 = 23.0 - 0.7 = 22.3s -> total 29.8s
  '[c0][c1]xfade=transition=fade:duration=0.7:offset=4.3[x1]',
  '[x1][c2]xfade=transition=fade:duration=0.7:offset=7.9[x2]',
  '[x2][c3]xfade=transition=fade:duration=0.7:offset=12.7[x3]',
  '[x3][c4]xfade=transition=fade:duration=0.7:offset=18.0[x4]',
  '[x4][c5]xfade=transition=fade:duration=0.7:offset=22.3[outv]'
];

const args = [];
for (const c of clipsToCheck) {
  args.push('-i', join(VIDEO_DIR, c));
}

args.push(
  '-filter_complex', filterComplex.join(';'),
  '-map', '[outv]',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-preset', 'fast',
  '-crf', '18',
  '-y',
  OUTPUT_MP4
);

const proc = spawn(ffmpegStatic, args, { stdio: 'inherit' });
proc.on('close', (code) => {
  if (code === 0) {
    console.log(`\n¡Video de impacto completado exitosamente!\nGuardado en: ${OUTPUT_MP4}`);
  } else {
    console.error(`Error durante el render (código ${code})`);
    process.exit(code);
  }
});
