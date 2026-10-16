// tools/pdf.mjs — Extrae el texto de un PDF a Markdown.
// Uso: node tools/pdf.mjs Bases_Rally_2026.pdf bases.md
import { readFile, writeFile } from 'node:fs/promises';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const [input, output = 'bases.md'] = process.argv.slice(2);
if (!input) {
  console.error('Uso: node tools/pdf.mjs <archivo.pdf> [salida.md]');
  process.exit(1);
}

const data = await pdf(await readFile(input));
await writeFile(output, data.text.replace(/\n{3,}/g, '\n\n').trim() + '\n', 'utf8');
console.log(`${data.numpages} páginas → ${output} (${data.text.length} caracteres)`);
