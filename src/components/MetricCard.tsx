import React from 'react';
import { Paper, Typography } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        bgcolor: '#f5f5f5'
      }}
    >
      <Typography variant="h6" gutterBottom component="div">
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </Paper>
  );
};

export default MetricCard; 