import React from 'react';
import { Box, Typography, Grid, LinearProgress, Avatar } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ScienceIcon from '@mui/icons-material/Science';

const icones = [
  <ApartmentIcon sx={{ color: '#2196f3' }} />,
  <MenuBookIcon sx={{ color: '#b36cff' }} />,
  <VolunteerActivismIcon sx={{ color: '#4caf50' }} />,
  <ScienceIcon sx={{ color: '#ff9800' }} />,
];
const cores = ['#2196f3', '#b36cff', '#4caf50', '#ff9800'];

function formatValor(valor: number) {
  if (valor >= 1_000_000) {
    return 'R$ ' + (valor / 1_000_000).toFixed(2).replace('.', ',') + ' Mi';
  } else if (valor >= 1_000) {
    return 'R$ ' + (valor / 1_000).toFixed(2).replace('.', ',') + ' mil';
  } else {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }
}

export default function PrincipaisConveniosCard({ convenios }: { convenios: any[] }) {
  return (
    <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: 2 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Principais Convênios
      </Typography>
      <Grid container spacing={2}>
        {convenios.map((c, idx) => (
          <Grid item xs={12} key={c.numero_convênio || c.nome || idx}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Avatar sx={{ bgcolor: cores[idx % cores.length] + '22', color: cores[idx % cores.length] }}>
                {icones[idx % icones.length]}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.objeto || c.nome}
                  </Typography>
                  <Typography fontWeight={600} color="success.main" sx={{ minWidth: 100, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatValor(Number(c.valor_total || c.valor_concedente || 0))}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={c.execucao || c.percentual_execucao || 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#eee',
                    my: 1,
                    '& .MuiLinearProgress-bar': { bgcolor: cores[idx % cores.length] }
                  }}
                />
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    Término: {c.vigência_final || c.termino || '--'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 