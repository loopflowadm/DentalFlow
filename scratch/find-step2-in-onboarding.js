import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/onboarding/Onboarding.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for "step === 2" or step 2 elements in Onboarding.jsx...');
let printLines = false;
let count = 0;
lines.forEach((line, index) => {
  const num = index + 1;
  if (line.includes('step === 2') || line.includes('Step 2')) {
    printLines = true;
    count = 0;
  }
  if (printLines) {
    console.log(`Line ${num}: ${line}`);
    count++;
    if (count > 80) {
      printLines = false;
    }
  }
});
