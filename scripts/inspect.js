const fs = require('fs');
const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('resources/Cyber_Hunt.xlsx');
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  const columns = Object.keys(data[0] || {});
  const sample = data.slice(0, 2);
  
  fs.writeFileSync('scripts/columns.txt', JSON.stringify({ columns, sample }, null, 2));
  console.log("Written successfully");
} catch (err) {
  fs.writeFileSync('scripts/columns.txt', err.stack);
}
