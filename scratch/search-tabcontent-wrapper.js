import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Printing lines 1900 to 1980 of Pacientes.jsx to see tab content structure...');
for (let i = 1900; i < Math.min(lines.length, 1980); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
