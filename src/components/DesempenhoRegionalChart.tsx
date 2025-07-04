import React, { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Button, Box, Snackbar, Alert } from '@mui/material';

const desempenhoRegional = [
  { regiao: 'Capital', convenios: 180 },
  { regiao: 'Região Norte', convenios: 120 },
  { regiao: 'Região Sul', convenios: 150 },
  { regiao: 'Região Leste', convenios: 90 },
  { regiao: 'Região Oeste', convenios: 110 },
];

function exportarCSV(dados: any[]) {
  const header = Object.keys(dados[0]).join(',');
  const csv = dados.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([header + '\n' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'desempenho_regional.csv';
  a.click();
}

interface DesempenhoRegionalChartProps {
  onClick: (bar: any) => void;
}

const DesempenhoRegionalChart: React.FC<DesempenhoRegionalChartProps> = ({ onClick }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleExport = () => {
    exportarCSV(desempenhoRegional);
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveBar
          data={desempenhoRegional}
          keys={['convenios']}
          indexBy="regiao"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          colors={{ scheme: 'nivo' }}
          axisTop={null}
          axisRight={null}
          labelSkipWidth={12}
          labelSkipHeight={12}
          onClick={onClick}
        />
      </Box>
      <Button sx={{ mt: 2 }} variant="outlined" onClick={handleExport}>
        Exportar CSV
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2500}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Arquivo exportado com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DesempenhoRegionalChart; 