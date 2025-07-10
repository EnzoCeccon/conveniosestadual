import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Select, MenuItem, Button, CircularProgress, Dialog, DialogTitle, DialogContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Modal, InputLabel, FormControl, Fade, Grow, Skeleton, Zoom } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
import ConveniosPorAreaChart from './ConveniosPorAreaChart';
import ExecucaoMensalChart from './ExecucaoMensalChart';
import DesempenhoRegionalChart from './DesempenhoRegionalChart';
import axios from 'axios';
import * as XLSX from 'xlsx';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrincipaisConveniosCard from './PrincipaisConveniosCard';
import TablePagination from '@mui/material/TablePagination';
import ResumoDonutsCard from './ResumoDonutsCard';
import { useSpring, animated } from '@react-spring/web';

// Dados de exemplo para Convênios Estaduais
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

const desempenhoRegional = [
  { regiao: 'Capital', convenios: 180 },
  { regiao: 'Região Norte', convenios: 120 },
  { regiao: 'Região Sul', convenios: 150 },
  { regiao: 'Região Leste', convenios: 90 },
  { regiao: 'Região Oeste', convenios: 110 },
];

// Lista fixa dos 15 municípios de Roraima
const municipiosOficiais = [
  'Alto Alegre', 'Amajari', 'Boa Vista', 'Bonfim', 'Cantá', 'Caracaraí', 'Caroebe',
  'Iracema', 'Mucajaí', 'Normandia', 'Pacaraima', 'Rorainópolis',
  'São João da Baliza', 'São Luiz', 'Uiramutã'
];

function exportarCSV(dados) {
  const csv = dados.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dados.csv';
  a.click();
}

export function DashboardHeader({
  ano, setAno, regiao, setRegiao, status, setStatus, onAtualizar, anos, regioes, statusList
}: any) {
  return (
    <Box sx={{ background: '#e9effc', borderRadius: 3, p: 3, mb: 3 }}>
      <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
        Painel de Convênios Estaduais
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={1}>
        Monitoramento e análise de convênios entre Estado e Municípios
      </Typography>
      <Box display="flex" gap={2} alignItems="center" mb={3}>
        {/* Filtro por Ano (EXERCÍCIO) */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Ano</InputLabel>
          <Select
            value={anos.includes(ano) ? ano : ''}
            label="Ano"
            onChange={e => setAno(e.target.value)}
          >
            {anos.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
        {/* Filtro por Status */}
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusList.includes(status) ? status : ''}
            label="Status"
            onChange={e => setStatus(e.target.value)}
          >
            {statusList.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" gap={2} alignItems="center" mb={3}>
        {/* Filtro por Município */}
        {regioes.length > 1 && (
          <FormControl>
            <InputLabel>Região</InputLabel>
            <Select
              value={regioes.includes(regiao) ? regiao : ''}
              label="Região"
              onChange={e => setRegiao(e.target.value)}
            >
              {regioes.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {/* Campo de busca livre */}
        <TextField
          placeholder="Buscar objeto..."
          size="small"
          sx={{ width: 250 }}
        />
        <Button
          variant="contained"
          sx={{
            ml: 2,
            height: 56,
            fontWeight: 700,
            backgroundColor: '#0d47a1',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#08306b',
            },
          }}
          onClick={onAtualizar}
          startIcon={<AccountBalanceWalletIcon />}
        >
          Atualizar Dados
        </Button>
      </Box>
    </Box>
  );
}

function formatValor(valor: number) {
  if (valor >= 1_000_000) {
    return 'R$ ' + (valor / 1_000_000).toFixed(2).replace('.', ',') + ' Mi';
  } else if (valor >= 1_000) {
    return 'R$ ' + (valor / 1_000).toFixed(2).replace('.', ',') + ' mil';
  } else {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }
}

// Animação de contagem para cards
function AnimatedNumber({ value }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { duration: 1200 }
  });
  return <animated.span>{number.to(val => Math.round(val))}</animated.span>;
}

function Dashboard() {
  const [dados, setDados] = useState<any[]>([]);
  const [modoEscuro, setModoEscuro] = useState(false);

  const theme = createTheme({
    palette: {
      mode: modoEscuro ? 'dark' : 'light',
      // ...outras cores
    },
    // ...tipografia
  });

  const [ano, setAno] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [proponente, setProponente] = useState('');
  const [busca, setBusca] = useState('');

  const anos = ['Todos', ...Array.from(new Set(dados.map(d => d['EXERCÍCIO']))).filter(Boolean)];
  const municipios = ['Todos', ...Array.from(new Set(dados.map(d => d['Município']))).filter(Boolean)];
  const proponentes = ['Todos', ...Array.from(new Set(dados.map(d => d['PROPONENTE']))).filter(Boolean)];

  const [regiao, setRegiao] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [convenioSelecionado, setConvenioSelecionado] = useState<any>(null);
  const [filtros, setFiltros] = useState({ ano: 'Todos', regiao: 'Todas', status: 'Todos', busca: '' });
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(4);

  // Dentro do componente Dashboard
  const regioes = ['Todas', ...Array.from(new Set(dados.map(d => d.Região))).filter(Boolean)];
  const statusList = ['Todos', ...Array.from(new Set(dados.map(d => d.Status))).filter(Boolean)];

  const dadosFiltrados = dados.filter(d =>
    (ano === '' || ano === 'Todos' || d['EXERCÍCIO'] === ano) &&
    (municipio === '' || municipio === 'Todos' || d['Município'] === municipio) &&
    (proponente === '' || proponente === 'Todos' || d['PROPONENTE'] === proponente) &&
    (busca === '' || (d['OBJETO'] && d['OBJETO'].toLowerCase().includes(busca.toLowerCase())))
  );

  // Exemplo de cálculo
  const valorTotal = dadosFiltrados.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0);
  const taxaExecucao = dadosFiltrados.length
    ? (dadosFiltrados.filter(d => d.situação && d.situação.toLowerCase().includes('aprovado')).length / dadosFiltrados.length) * 100
    : 0;
  const prazoMedio = dadosFiltrados.length
    ? Math.round(dadosFiltrados.reduce((acc, curr) => acc + (curr.prazo_meses || 0), 0) / dadosFiltrados.length)
    : 0;

  // Dados para gráficos
  const dadosPorRegiao = Object.values(
    dadosFiltrados.reduce((acc: any, curr) => {
      acc[curr.Município] = acc[curr.Município] || { regiao: curr.Município, convenios: 0 };
      acc[curr.Município].convenios += 1;
      return acc;
    }, {})
  );

  const dadosPorStatus = Object.values(
    dadosFiltrados.reduce((acc: any, curr) => {
      acc[curr.Status] = acc[curr.Status] || { id: curr.Status, convenios: 0 };
      acc[curr.Status].convenios += 1;
      return acc;
    }, {})
  );

  const principaisConvenios = [...dados]
    .filter(d => d.valor_total)
    .sort((a, b) => Number(b.valor_total) - Number(a.valor_total))
    .slice(0, 4);

  // Adicionar estado para busca dos convênios recentes
  const [buscaRecentes, setBuscaRecentes] = useState('');

  // Função para filtrar convênios recentes
  const conveniosRecentesFiltrados = dadosFiltrados.filter(row => {
    const termo = buscaRecentes.toLowerCase();
    const ano = (row['EXERCÍCIO'] || row['exercicio'] || row['ano'] || '').toString().toLowerCase();
    const municipio = (row['município'] || row['municipio'] || row['Município'] || '').toLowerCase();
    const objeto = (row['objeto'] || row['OBJETO'] || '').toLowerCase();
    return (
      termo === '' ||
      ano.includes(termo) ||
      municipio.includes(termo) ||
      objeto.includes(termo)
    );
  });

  // @ts-ignore
  const API_URL = process.env.REACT_APP_API_URL || 'https://conveniosestadual-production.up.railway.app/api/convenios';

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setDados(res.data);
        console.log('Dados recebidos da API:', res.data);
      })
      .catch(() => setDados([]));
  }, []);

  useEffect(() => {
    // Simula o carregamento de dados para exibir o painel
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPagina(0);
  }, [busca, ano, municipio, proponente, status]);

  const handleOpenModal = (convenio: any) => {
    setConvenioSelecionado(convenio);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setConvenioSelecionado(null);
  };

  const handleAtualizar = () => {
    // Aqui você pode filtrar os dados do Excel conforme os filtros selecionados
  };

  // Upload múltiplo
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
          setDados(allData);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  if (loading) return <CircularProgress />;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <DashboardHeader
          ano={ano}
          setAno={setAno}
          regiao={regiao}
          setRegiao={setRegiao}
          status={status}
          setStatus={setStatus}
          onAtualizar={handleAtualizar}
          anos={anos}
          regioes={regioes}
          statusList={statusList}
        />

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderLeft: '5px solid #4f8cff', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalanceWalletIcon fontSize="large" color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Valor Total</Typography>
                  <Typography variant="h5" fontWeight={700}>{formatValor(valorTotal)}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderLeft: '5px solid #b36cff', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <LocationCityIcon fontSize="large" sx={{ color: '#b36cff' }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Municípios Atendidos</Typography>
                  <Typography variant="h5" fontWeight={700}>{municipiosOficiais.length}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderLeft: '5px solid #4caf50', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon fontSize="large" sx={{ color: '#4caf50' }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Taxa de Execução</Typography>
                  <Typography variant="h5" fontWeight={700}>{taxaExecucao.toFixed(1)}%</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderLeft: '5px solid #ffb300', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTimeIcon fontSize="large" sx={{ color: '#ffb300' }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Prazo Médio</Typography>
                  <Typography variant="h5" fontWeight={700}>{prazoMedio} meses</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <PrincipaisConveniosCard convenios={principaisConvenios} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Taxa de Execução Mensal (%)">
              <ExecucaoMensalChart />
            </ChartCard>
          </Grid>
        </Grid>
        <Grow in={!loading} timeout={1000}><div><ResumoDonutsCard dados={dadosFiltrados} /></div></Grow>
        <Box sx={{ height: 32 }} />

        <Dialog open={modalAberto} onClose={() => setModalAberto(false)}>
          <DialogTitle>Detalhes</DialogTitle>
          <DialogContent>
            {detalhe && <pre>{JSON.stringify(detalhe, null, 2)}</pre>}
          </DialogContent>
        </Dialog>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Convênios Recentes</Typography>
          <TextField placeholder="Buscar..." variant="outlined" size="small" sx={{ mb: 2 }}
            value={buscaRecentes}
            onChange={e => {
              setBuscaRecentes(e.target.value);
              setPagina(0);
            }}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>NÚMERO</b></TableCell>
                  <TableCell><b>MUNICÍPIO</b></TableCell>
                  <TableCell><b>OBJETO</b></TableCell>
                  <TableCell><b>VALOR (R$)</b></TableCell>
                  <TableCell><b>VIGÊNCIA</b></TableCell>
                  <TableCell><b>PROPONENTE</b></TableCell>
                  <TableCell><b>AÇÕES</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conveniosRecentesFiltrados.length > 0 ? (
                  conveniosRecentesFiltrados
                    .slice(pagina * linhasPorPagina, pagina * linhasPorPagina + linhasPorPagina)
                    .map((row, idx) => (
                      <TableRow key={row['numero_convênio'] || row['NUMERO'] || idx} sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3eaf7' } }}>
                        <TableCell><b>{row['numero_convênio'] || row['NUMERO']}</b></TableCell>
                        <TableCell>{row['município'] || row['proponente'] || row['PROPONENTE'] || row['Município'] || '--'}</TableCell>
                        <TableCell>{row['objeto']}</TableCell>
                        <TableCell>{row['valor_total']}</TableCell>
                        <TableCell>{row['vigência'] || row['vigência_inicial'] || row['vigência_final']}</TableCell>
                        <TableCell>{row['proponente'] || row['PROPONENTE'] || row['município'] || row['Município'] || '--'}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenModal(row)}>Detalhes</Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Nenhum dado encontrado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={conveniosRecentesFiltrados.length}
            page={pagina}
            onPageChange={(event, newPage) => setPagina(newPage)}
            rowsPerPage={linhasPorPagina}
            onRowsPerPageChange={e => {
              setLinhasPorPagina(parseInt(e.target.value, 10));
              setPagina(0);
            }}
            rowsPerPageOptions={[4, 8, 12]}
            labelRowsPerPage="Linhas por página"
          />
        </Paper>

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-detalhes-title"
          aria-describedby="modal-detalhes-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: 'none'
          }}>
            {convenioSelecionado && (
              <>
                <Typography id="modal-detalhes-title" variant="h6" mb={2}>
                  Detalhes do Convênio
                </Typography>
                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                  <Typography><b>Número:</b> {convenioSelecionado.numero_convênio || convenioSelecionado.NUMERO || convenioSelecionado.numero || '---'}</Typography>
                  <Typography><b>Proponente:</b> {convenioSelecionado.proponente || convenioSelecionado.PROPONENTE || '---'}</Typography>
                  <Typography><b>Município:</b> {convenioSelecionado.municipio || convenioSelecionado.município || convenioSelecionado.Município || '---'}</Typography>
                  <Typography><b>Concedente:</b> {convenioSelecionado?.concedente || convenioSelecionado?.['órgão'] || convenioSelecionado?.CONCEDENTE || '---'}</Typography>
                  <Typography><b>Objeto:</b> {convenioSelecionado.objeto || convenioSelecionado.OBJETO || '---'}</Typography>
                  <Typography><b>Valor:</b> {convenioSelecionado.valor_total || convenioSelecionado.valor || convenioSelecionado.VALOR || convenioSelecionado.VALOR_TOTAL || '---'}</Typography>
                  <Typography><b>Área:</b> {convenioSelecionado.area || convenioSelecionado['área'] || convenioSelecionado['area_macro'] || '---'}</Typography>
                  <Typography><b>Vigência:</b> {convenioSelecionado.vigencia || convenioSelecionado.vigência || convenioSelecionado.vigência_inicial || convenioSelecionado.vigência_final || '---'}</Typography>
                  <Typography><b>Situação/Status:</b> {convenioSelecionado.situacao || convenioSelecionado.situação || convenioSelecionado.status || convenioSelecionado.STATUS || '---'}</Typography>
                  {convenioSelecionado.data_assinatura && (
                    <Typography><b>Data de Assinatura:</b> {convenioSelecionado.data_assinatura}</Typography>
                  )}
                  {convenioSelecionado.data_publicacao && (
                    <Typography><b>Data de Publicação:</b> {convenioSelecionado.data_publicacao}</Typography>
                  )}
                </Box>
                <Typography variant="subtitle1" mt={2} mb={1}>Cronograma de Desembolso</Typography>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parcela</TableCell>
                        <TableCell>Data Prevista</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(convenioSelecionado.cronograma || []).map((parcela: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{parcela.parcela}</TableCell>
                          <TableCell>{parcela.data}</TableCell>
                          <TableCell>{parcela.valor}</TableCell>
                          <TableCell>
                            <Chip
                              label={parcela.status}
                              color={
                                parcela.status === 'Liberado' ? 'success' :
                                parcela.status === 'Em análise' ? 'warning' :
                                parcela.status === 'Pendente' ? 'default' : 'info'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button variant="outlined" color="primary" /* onClick={exportarPDF} */>Exportar PDF</Button>
                  <Button variant="outlined" onClick={handleCloseModal}>Fechar</Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard; 