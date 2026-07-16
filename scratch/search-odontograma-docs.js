import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('FlowDent Docs');
const files = fs.readdirSync(docsDir);

console.log('Searching for "odontograma" or "dente" in FlowDent Docs...');
files.forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.toLowerCase().includes('odontograma') || content.toLowerCase().includes('dente')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes('odontograma') || line.toLowerCase().includes('dente')) {
          console.log(`[${file}] Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
});
