import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/pacientes/Pacientes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for "upperTeethRight" in JSX...');
let matchIndex = -1;
lines.forEach((line, index) => {
  if (line.includes('upperTeethRight') && index > 350) { // filter out declaration
    matchIndex = index;
  }
});

if (matchIndex !== -1) {
  console.log(`Found match at line ${matchIndex + 1}. Printing surrounding lines (70 lines before and after):`);
  const start = Math.max(0, matchIndex - 70);
  const end = Math.min(lines.length - 1, matchIndex + 70);
  for (let i = start; i <= end; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
} else {
  console.log('No JSX match found for upperTeethRight.');
}
