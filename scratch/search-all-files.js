import fs from 'fs';
import path from 'path';

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else {
      const lower = file.toLowerCase();
      if (lower.includes('odontograma') || lower.includes('dente') || lower.includes('tooth')) {
        console.log(`Found file: ${fullPath}`);
      }
    }
  }
}

console.log('Searching codebase for odontograma/tooth/dente files...');
searchFiles(path.resolve('.'));
