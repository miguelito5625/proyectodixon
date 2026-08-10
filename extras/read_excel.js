const xlsx = require('xlsx');

try {
  const filePath = "c:\\Users\\exbinario\\Documents\\desarrollo\\antigravity\\proyectoDixon\\extras\\IAD 158 DataHall Altas Bajas.xlsx";
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  for (let i = 15; i < Math.min(40, data.length); i++) {
    console.log(`Row ${i + 1}:`, JSON.stringify(data[i]));
  }
} catch (e) {
  console.error("Error reading file:", e.message);
}
