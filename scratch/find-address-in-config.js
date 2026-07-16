import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/configuracoes/Configuracoes.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for "address" or "cep" or "cLogo" in Configuracoes.jsx...');
lines.forEach((line, index) => {
  const l = line.toLowerCase();
  if (l.includes('address') || l.includes('cep') || l.includes('clogo')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
