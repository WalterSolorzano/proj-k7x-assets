// tools/make-latam-panama-clip.mjs
// Crea un clip cinematográfico de 6 segundos en 1920x1080 a partir de la captura oficial en alta resolución
// de América Latina y Panamá, con un zoom dinámico e iluminación de alerta.
import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());
const PNG = join(ROOT, 'presentacion', 'video', 't0-latam-panama.png');
const MP4 = join(ROOT, 'presentacion', 'video', 't0-latam-panama.mp4');

if (!existsSync(PNG)) {
  console.error(`Falta el archivo: ${PNG}`);
  process.exit(1);
}

console.log('Generando clip dinámico de América Latina con detección en Panamá...');

// Efecto cinematográfico: Zoom gradual enfocado hacia la coordenada del Istmo de Panamá (Canal / Colón)
// La imagen original es 3840x2160 (scale 2). Con zoompan se anima suavemente el encuadre a 30 fps durante 6 segundos.
const args = [
  '-loop', '1',
  '-i', PNG,
  '-vf', 'zoompan=z=\'min(zoom+0.0018,1.35)\':x=\'iw*0.44-(iw/zoom/2)\':y=\'ih*0.30-(ih/zoom/2)\':d=180:s=1920x1080:fps=30',
  '-c:v', 'libx264',
  '-t', '6',
  '-pix_fmt', 'yuv420p',
  '-preset', 'fast',
  '-crf', '18',
  '-y',
  MP4
];

const proc = spawn(ffmpegStatic, args, { stdio: 'inherit' });
proc.on('close', (code) => {
  if (code === 0) {
    console.log(`✓ Clip generado con éxito: ${MP4}`);
  } else {
    console.error(`Error generando clip (${code})`);
    process.exit(code);
  }
});
