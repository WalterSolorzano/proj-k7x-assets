import fs from 'node:fs';

const pan = fs.readFileSync('assets/geo-panama-paths.html', 'utf8');
const regex = /id="([^"]+)"[^>]*d="([^"]+)"[^>]*data-nombre="([^"]+)"/g;
let m;
const results = [];
while ((m = regex.exec(pan)) !== null) {
  const id = m[1];
  const d = m[2];
  const name = m[3];
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i];
    const y = nums[i+1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const cx = ((minX + maxX) / 2).toFixed(1);
  const cy = ((minY + maxY) / 2).toFixed(1);
  results.push({ id, name, cx, cy, minX: minX.toFixed(1), maxX: maxX.toFixed(1), minY: minY.toFixed(1), maxY: maxY.toFixed(1) });
}
console.log(JSON.stringify(results, null, 2));
