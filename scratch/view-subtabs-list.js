import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for tab arrays or lists in Pacientes.jsx...');
lines.forEach((line, index) => {
  if (line.includes('const tabs = [') || line.includes('const subtabs = [') || line.includes('id: \'visao_geral\'') || line.includes('id: \'anamnese\'')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
    // Print 15 lines following
    for (let i = index + 1; i <= Math.min(lines.length - 1, index + 15); i++) {
      console.log(`  ${i+1}: ${lines[i]}`);
    }
  }
});
