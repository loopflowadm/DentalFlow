import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/configuracoes/Configuracoes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for "logo_url" or "logo" in Configuracoes.jsx...');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('logo')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
