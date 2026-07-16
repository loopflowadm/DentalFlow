import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for activeSubTab renders in Pacientes.jsx...');
lines.forEach((line, index) => {
  if (line.includes('activeSubTab ===')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
