import { execSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';

const outDir = 'presentacion/video/ref-frames';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

execSync(`"${ffmpeg}" -i "WhatsApp Video 2026-10-16 at 10.51.41 PM.mp4" -vf "fps=1" "${outDir}/frame_%03d.png" -y`);
console.log('Frames extracted:', readdirSync(outDir).length);
