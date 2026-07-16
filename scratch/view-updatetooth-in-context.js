import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/context/ClinicContext.jsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for "updateToothRecord" in ClinicContext.jsx...');
let matchIndex = -1;
lines.forEach((line, index) => {
  if (line.includes('updateToothRecord') && line.includes('async')) {
    matchIndex = index;
  }
});

if (matchIndex !== -1) {
  console.log(`Found match at line ${matchIndex + 1}. Printing 50 lines:`);
  for (let i = matchIndex; i <= Math.min(lines.length - 1, matchIndex + 50); i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
} else {
  console.log('No function match found.');
}
