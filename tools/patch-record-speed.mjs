import fs from 'fs';

const target = 'tools/record-cinematic-panama.mjs';
let content = fs.readFileSync(target, 'utf8');

// Ajustar -ss para iniciar a los 2.0s y preset veryfast para máxima rapidez y fluidez continua
content = content.replace("'-ss', '00:00:04.180',", "'-ss', '00:00:02.000',");
content = content.replace("'-preset', 'slow',", "'-preset', 'veryfast',");

fs.writeFileSync(target, content, 'utf8');
console.log('Successfully updated record-cinematic-panama.mjs settings!');
