import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  sx?: any;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, sx }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 3, height: '100%', ...sx }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 350 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard; 