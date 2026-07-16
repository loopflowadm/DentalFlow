import fs from 'fs';
import path from 'path';

const filePath = path.resolve('supabase-schema.sql');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
console.log('Searching for "tooth_records" table in supabase-schema.sql...');
let print = false;
let count = 0;
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('create table') && line.toLowerCase().includes('tooth_records')) {
    print = true;
    count = 0;
  }
  if (print) {
    console.log(`${index + 1}: ${line}`);
    count++;
    if (count > 25) {
      print = false;
    }
  }
});
