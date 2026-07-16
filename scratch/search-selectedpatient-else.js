import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for the else block of selectedPatient...');
lines.forEach((line, index) => {
  if (line.includes('selectedPatient') && line.includes('?')) {
    console.log(`Condition on line ${index + 1}: ${line.trim()}`);
  }
});
