import fs from 'fs';
import * as XLSX from 'xlsx';

const fileBuffer = fs.readFileSync('universal_sales_data.csv');
const data = new Uint8Array(fileBuffer);
try {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet);
  console.log('Parsed successfully:', jsonData.length, 'rows');
} catch (err) {
  console.error('Error parsing with XLSX:', err);
}
