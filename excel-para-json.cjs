const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const pastaBase = './public/data';

function converterExcelParaJson(arquivoExcel) {
  const workbook = XLSX.readFile(arquivoExcel);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return json;
}

function processarPasta(pasta) {
  fs.readdirSync(pasta).forEach(file => {
    const fullPath = path.join(pasta, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processarPasta(fullPath);
    } else if (file.endsWith('.xlsx') || file.endsWith('.xls')) {
      const json = converterExcelParaJson(fullPath);
      const jsonPath = fullPath.replace(/\.xlsx?$/, '.json');
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Convertido: ${fullPath} -> ${jsonPath}`);
    }
  });
}

processarPasta(pastaBase);
console.log('Conversão concluída!');
