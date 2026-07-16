import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for "const getConditionCounts =" in Pacientes.jsx...');
let matchIndex = -1;
lines.forEach((line, index) => {
  if (line.includes('const getConditionCounts =')) {
    matchIndex = index;
  }
});

if (matchIndex !== -1) {
  console.log(`Found match at line ${matchIndex + 1}. Printing 40 lines:`);
  for (let i = matchIndex; i <= Math.min(lines.length - 1, matchIndex + 40); i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
} else {
  console.log('Not found declaration.');
}
