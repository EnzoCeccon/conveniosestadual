import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#f4f7fb',
      paper: '#fff',
    },
    primary: {
      main: '#4f8cff',
    },
    secondary: {
      main: '#6c63ff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ffb300',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#2196f3',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Uni Neue, Arial, sans-serif',
    h6: {
      fontWeight: 700,
    },
    body1: {
      fontWeight: 400,
    },
  },
});

export default theme;
