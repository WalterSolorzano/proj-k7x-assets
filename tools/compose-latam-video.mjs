// tools/compose-latam-video.mjs
// Compone el video definitivo con apertura internacional/regional LATAM
// mostrando el mapa continental, detección en Panamá, rotación 3D del dispositivo
// y descenso territorial hasta el croquis vivo de respuesta.
import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());
const VIDEO_DIR = join(ROOT, 'presentacion', 'video');
const OUTPUT_MP4 = join(VIDEO_DIR, 'pitch-recurso-latam-panama-innovador.mp4');

console.log('Ensamblando video LATAM internacional con detección en Panamá + Modelos 3D...');

// Secuencia de tomas:
// [0] t0-latam-panama.mp4 (Apertura continental LATAM, detección en Panamá: Canal/Colón, alerta IPR 96) (0 a 4.5s)
// [1] 3d-01-turntable0001-0193.mp4 (Hardware 3D VIGÍA-07 en rotación con panel PV 22°, ventanas RF y sensores) (0 a 5.0s)
// [2] t2-zoom-pais.mp4 (Zoom a país y nodos territoriales) (1.0 a 6.0s)
// [3] t5-municipio.mp4 (Personas mapeadas por manzana y nodos silenciados) (1.0 a 6.0s)
// [4] t7-croquis-zoom.mp4 (Croquis en vivo: telemetría viento 84km/h, lluvia 142mm, paquete LoRa y brigadas) (1.0 a 8.5s)

const clips = [
  't0-latam-panama.mp4',
  '3d-01-turntable0001-0193.mp4',
  't2-zoom-pais.mp4',
  't5-municipio.mp4',
  't7-croquis-zoom.mp4'
];

const filterComplex = [
  '[0:v]trim=start=0:end=4.5,setpts=PTS-STARTPTS,scale=1920:1080,fps=30[c0]',
  '[1:v]trim=start=0.5:end=5.5,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[c1]',
  '[2:v]trim=start=1.0:end=6.0,setpts=PTS-STARTPTS,scale=1920:1080,fps=30[c2]',
  '[3:v]trim=start=1.0:end=6.0,setpts=PTS-STARTPTS,scale=1920:1080,fps=30[c3]',
  '[4:v]trim=start=1.0:end=8.5,setpts=PTS-STARTPTS,scale=1920:1080,fps=30[c4]',
  // Disolvencias cruzadas xfade de 0.7s:
  // c0: 4.5s
  // c1: 5.0s -> offset 0 = 4.5 - 0.7 = 3.8s -> total 8.8s
  // c2: 5.0s -> offset 1 = 8.8 - 0.7 = 8.1s -> total 13.1s
  // c3: 5.0s -> offset 2 = 13.1 - 0.7 = 12.4s -> total 17.4s
  // c4: 7.5s -> offset 3 = 17.4 - 0.7 = 16.7s -> total 24.2s
  '[c0][c1]xfade=transition=fade:duration=0.7:offset=3.8[x1]',
  '[x1][c2]xfade=transition=fade:duration=0.7:offset=8.1[x2]',
  '[x2][c3]xfade=transition=fade:duration=0.7:offset=12.4[x3]',
  '[x3][c4]xfade=transition=fade:duration=0.7:offset=16.7[outv]'
];

const args = [];
for (const c of clips) {
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
    console.log(`\n¡Video LATAM completado exitosamente!\nGuardado en: ${OUTPUT_MP4}`);
  } else {
    console.error(`Error durante el ensamble del video (${code})`);
    process.exit(code);
  }
});
