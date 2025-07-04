import React from 'react';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import theme from './theme';
import Dashboard from './components/Dashboard';
import * as XLSX from 'xlsx';
import './index.css'; // Importe o CSS global

function App() {
  const handleMultipleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let allData: any[] = [];
    let filesRead = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        allData = allData.concat(data as any[]);
        filesRead++;
        if (filesRead === files.length) {
          setDados(allData); // Atualiza o estado só quando todos os arquivos foram lidos
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Dashboard />
      </Container>
    </ThemeProvider>
  );
}

export default App;