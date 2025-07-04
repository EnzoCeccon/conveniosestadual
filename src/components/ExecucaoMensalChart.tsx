import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Button, Box, Snackbar, Alert } from '@mui/material';

const execucaoMensal = [
  {
    id: "execução",
    data: [
      { x: 'Jan', y: 85 },
      { x: 'Fev', y: 78 },
      { x: 'Mar', y: 92 },
      { x: 'Abr', y: 88 },
      { x: 'Mai', y: 95 },
      { x: 'Jun', y: 89 },
    ],
  },
];

function exportarCSV(dados: any[]) {
  // Exporta apenas o array de data do primeiro item
  const data = dados[0].data;
  const header = Object.keys(data[0]).join(',');
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([header + '\n' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'execucao_mensal.csv';
  a.click();
}

const ExecucaoMensalChart = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleExport = () => {
    exportarCSV(execucaoMensal);
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveLine
          data={execucaoMensal}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 100, stacked: true, reverse: false }}
          curve="cardinal"
          axisTop={null}
          axisRight={null}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          enableArea={true}
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

export default ExecucaoMensalChart; 