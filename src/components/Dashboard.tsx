
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
import Autocomplete from '@mui/material/Autocomplete';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  ano, setAno, regiao, setRegiao, status, setStatus, onAtualizar, anos, regioes, statusList, onCriarRelatorio
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
        <Autocomplete
          freeSolo
          options={anos}
          value={ano}
          onInputChange={(event, newInputValue) => setAno(newInputValue || '')}
          renderInput={(params) => (
            <TextField {...params} label="Ano" size="small" />
          )}
          sx={{ minWidth: 120 }}
        />
        {/* Filtro por Status */}
        <Autocomplete
          freeSolo
          options={statusList}
          value={status}
          onInputChange={(event, newInputValue) => setStatus(newInputValue || '')}
          renderInput={(params) => (
            <TextField {...params} label="Status" size="small" />
          )}
          sx={{ minWidth: 140 }}
        />
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
        <Button
          variant="contained"
          sx={{
            height: 56,
            fontWeight: 700,
            backgroundColor: '#0d47a1',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#08306b',
            },
          }}
          onClick={onCriarRelatorio}
        >
          Criar Relatório
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
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);

  // Dentro do componente Dashboard
  const regioes = ['Todas', ...Array.from(new Set(dados.map(d => d.Região))).filter(Boolean)];
  const statusList = ['Todos', ...Array.from(new Set(dados.map(d => d.Status))).filter(Boolean)];

  // Corrigir o filtro dos dados para aceitar valores vazios
  const dadosFiltrados = dados.filter(d =>
    (!ano || ano === 'Todos' ||
      d['EXERCÍCIO'] === ano ||
      (d['numero_convênio'] && d['numero_convênio'].toString().includes(ano)) ||
      (d['NUMERO'] && d['NUMERO'].toString().includes(ano)) ||
      (d['numero'] && d['numero'].toString().includes(ano))
    ) &&
    (!municipio || municipio === 'Todos' || d['Município'] === municipio) &&
    (!proponente || proponente === 'Todos' || d['PROPONENTE'] === proponente) &&
    (!status || status === 'Todos' || d['Status'] === status) &&
    (busca === '' || (d['OBJETO'] && d['OBJETO'].toLowerCase().includes(busca.toLowerCase())))
  );

  // Exemplo de cálculo
  const valorTotal = dadosFiltrados.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0);
  const taxaExecucao = dadosFiltrados.length
    ? (dadosFiltrados.filter(d => d.situação && d.situação.toLowerCase().includes('aprovado')).length / dadosFiltrados.length) * 100
    : 0;
  const prazoMedio = dadosFiltrados.length
    ? Math.round(
        dadosFiltrados.reduce((acc, curr) => {
          const inicio = new Date(curr.vigencia_inicial || curr.vigência_inicial || curr.data_inicio || curr['Data Início'] || curr['VIGÊNCIA INICIAL']);
          const fim = new Date(curr.vigencia_final || curr.vigência_final || curr.data_fim || curr['Data Fim'] || curr['VIGÊNCIA FINAL']);
          if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime())) {
            // diferença em meses
            const diffMeses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
            return acc + diffMeses;
          }
          return acc;
        }, 0) / dadosFiltrados.length
      )
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

  // Ordenar conveniosRecentesFiltrados em ordem decrescente pelo campo 'numero_convênio' ou 'NUMERO' ou 'data' se existir
  const conveniosRecentesFiltradosOrdenados = [...conveniosRecentesFiltrados].sort((a, b) => {
    // Extrai o ano do número do convênio (ex: 001/2025 ou 001-2025)
    const getAno = (row) => {
      const num = row.numero_convênio || row.NUMERO || row.numero || '';
      const match = num.match(/(\d{4})$/);
      return match ? parseInt(match[1], 10) : 0;
    };
    const anoA = getAno(a);
    const anoB = getAno(b);
    if (anoA !== anoB) {
      return anoB - anoA; // ordem decrescente de ano
    }
    // Se o ano for igual, ordena pelo número (parte antes da barra)
    const getNum = (row) => {
      const num = row.numero_convênio || row.NUMERO || row.numero || '';
      const match = num.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getNum(b) - getNum(a);
  });

  // @ts-ignore
  const API_URL = process.env.REACT_APP_API_URL || 'https://us-central1-painel-de-conve.cloudfunctions.net/api/api/convenios';

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

  const gerarRelatorioPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Resumo dos Convênios', 14, 20);
    doc.setFontSize(12);
    doc.text(`Valor Total: ${formatValor(valorTotal)}`, 14, 35);
    doc.text(`Taxa de Execução: ${taxaExecucao.toFixed(1)}%`, 14, 45);
    doc.text(`Prazo Médio: ${prazoMedio} meses`, 14, 55);
    doc.save('relatorio_convenios.pdf');
  };

  const gerarRelatorioPDFVisual = async () => {
    // Esconde o modal antes de capturar
    const modal = document.querySelector('[aria-labelledby="modal-relatorio-title"]');
    if (modal) {
      (modal as HTMLElement).style.display = 'none';
    }
    // Aguarda o DOM atualizar
    await new Promise(r => setTimeout(r, 200));
    const dashboardElement = document.body; // captura a página inteira
    const canvas = await html2canvas(dashboardElement, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * (pageWidth / canvas.width);
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    let remainingHeight = imgHeight - pageHeight;
    while (remainingHeight > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
    }
    // Reexibe o modal
    if (modal) {
      (modal as HTMLElement).style.display = '';
    }
    pdf.save('relatorio_visual_dashboard.pdf');
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
          onCriarRelatorio={() => setModalRelatorioAberto(true)}
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
          <Button
            variant="outlined"
            onClick={() => exportarCSV(conveniosRecentesFiltradosOrdenados)}
            sx={{ mb: 2 }}
          >
            Exportar dados filtrados (CSV)
          </Button>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>NÚMERO</b></TableCell>
                  <TableCell><b>MUNICÍPIO / PROPONENTE / CONCEDENTE</b></TableCell>
                  <TableCell><b>OBJETO</b></TableCell>
                  <TableCell><b>VALOR (R$)</b></TableCell>
                  <TableCell><b>VIGÊNCIA</b></TableCell>
                  <TableCell><b>PROPONENTE</b></TableCell>
                  <TableCell><b>AÇÕES</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conveniosRecentesFiltradosOrdenados.length > 0 ? (
                  conveniosRecentesFiltradosOrdenados
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
            count={conveniosRecentesFiltradosOrdenados.length}
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
                  <Typography><b>Número:</b> {convenioSelecionado?.numero_convênio || convenioSelecionado?.NUMERO || convenioSelecionado?.numero || '---'}</Typography>
                  <Typography><b>Proponente:</b> {convenioSelecionado?.proponente || convenioSelecionado?.PROPONENTE || '---'}</Typography>
                  <Typography><b>Município:</b> {convenioSelecionado?.municipio || convenioSelecionado?.município || convenioSelecionado?.Município || '---'}</Typography>
                  <Typography><b>Concedente:</b> {convenioSelecionado?.concedente || convenioSelecionado?.['órgão'] || convenioSelecionado?.CONCEDENTE || '---'}</Typography>
                  <Typography><b>Objeto:</b> {convenioSelecionado?.objeto || convenioSelecionado?.OBJETO || '---'}</Typography>
                  <Typography><b>Valor:</b> {convenioSelecionado?.valor_total || convenioSelecionado?.valor || convenioSelecionado?.VALOR || convenioSelecionado?.VALOR_TOTAL || '---'}</Typography>
                  <Typography><b>Área:</b> {convenioSelecionado?.area || convenioSelecionado?.['área'] || convenioSelecionado?.['area_macro'] || '---'}</Typography>
                  <Typography><b>Vigência:</b> {convenioSelecionado?.vigencia || convenioSelecionado?.vigência || convenioSelecionado?.vigência_inicial || convenioSelecionado?.vigência_final || '---'}</Typography>
                  <Typography><b>Situação/Status:</b> {convenioSelecionado?.situacao || convenioSelecionado?.situação || convenioSelecionado?.status || convenioSelecionado?.STATUS || '---'}</Typography>
                  {convenioSelecionado?.data_assinatura && (
                    <Typography><b>Data de Assinatura:</b> {convenioSelecionado?.data_assinatura}</Typography>
                  )}
                  {convenioSelecionado?.data_publicacao && (
                    <Typography><b>Data de Publicação:</b> {convenioSelecionado?.data_publicacao}</Typography>
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
                      {(convenioSelecionado?.cronograma || []).map((parcela, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{parcela?.parcela}</TableCell>
                          <TableCell>{parcela?.data}</TableCell>
                          <TableCell>{parcela?.valor}</TableCell>
                          <TableCell>
                            <Chip
                              label={parcela?.status}
                              color={
                                parcela?.status === 'Liberado' ? 'success' :
                                parcela?.status === 'Em análise' ? 'warning' :
                                parcela?.status === 'Pendente' ? 'default' : 'info'
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
                  <Button variant="outlined" onClick={handleCloseModal}>Fechar</Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        <Modal
          open={modalRelatorioAberto}
          onClose={() => setModalRelatorioAberto(false)}
          aria-labelledby="modal-relatorio-title"
          aria-describedby="modal-relatorio-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: 'none',
          }}>
            <Typography id="modal-relatorio-title" variant="h6" component="h2" mb={2}>
              Criar Relatório
            </Typography>
            <Typography id="modal-relatorio-description" sx={{ mb: 2 }}>
              Clique no botão abaixo para baixar um PDF com o resumo dos dados filtrados.
            </Typography>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="contained" onClick={gerarRelatorioPDFVisual} sx={{ backgroundColor: '#0d47a1', color: '#fff', '&:hover': { backgroundColor: '#08306b' } }}>
                Baixar PDF Visual
              </Button>
              <Button variant="outlined" onClick={() => setModalRelatorioAberto(false)}>
                Fechar
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard; 