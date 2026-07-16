import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('--- Lines 250 to 310 ---');
for (let i = 249; i < 310; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

console.log('\n--- Lines 480 to 545 ---');
for (let i = 479; i < 545; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
