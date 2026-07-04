const xlsx = require('xlsx');

function readExcel() {
  const workbook = xlsx.readFile('Cyber Hunt.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  if (data.length > 0) {
    console.log("Headers:", Object.keys(data[0]));
    console.log("First 2 rows:", JSON.stringify(data.slice(0, 2), null, 2));
    console.log("Total rows:", data.length);
  } else {
    console.log("Excel file is empty or unreadable.");
  }
}

readExcel();
