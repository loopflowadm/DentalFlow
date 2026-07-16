import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/onboarding/Onboarding.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for "logo" in Onboarding.jsx...');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('logo')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
