import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for "odontograma" or "tooth" in Pacientes.jsx...');
let matches = [];
lines.forEach((line, index) => {
  const l = line.toLowerCase();
  if (l.includes('odontograma') || l.includes('tooth') || l.includes('dente') || l.includes('arcada')) {
    matches.push({ lineNum: index + 1, content: line.trim() });
  }
});

console.log(`Found ${matches.length} matches. Displaying first 30 matches:`);
matches.slice(0, 30).forEach(m => {
  console.log(`Line ${m.lineNum}: ${m.content}`);
});
