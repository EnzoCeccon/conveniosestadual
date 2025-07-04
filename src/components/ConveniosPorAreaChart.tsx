import React, { useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Button, Box, Snackbar, Alert } from '@mui/material';

const conveniosPorArea = [
  { id: 'Saúde', value: 40 },
  { id: 'Educação', value: 30 },
  { id: 'Infraestrutura', value: 15 },
  { id: 'Assistência Social', value: 10 },
  { id: 'Outros', value: 5 },
];

function exportarCSV(dados: any[]) {
  const header = Object.keys(dados[0]).join(',');
  const csv = dados.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([header + '\n' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'convenios_por_area.csv';
  a.click();
}

const ConveniosPorAreaChart = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleExport = () => {
    exportarCSV(conveniosPorArea);
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsivePie
          data={conveniosPorArea}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ scheme: 'nivo' }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
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

export default ConveniosPorAreaChart; 