import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for list container elements or mappings in Pacientes.jsx...');
lines.forEach((line, index) => {
  if (line.includes('patients.map') || line.includes('Buscar paciente') || line.includes('Buscar por nome') || line.includes('PACIENTES') || line.includes('w-80') || line.includes('w-64')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
