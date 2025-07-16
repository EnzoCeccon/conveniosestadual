import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';

function agruparPorCampo(dados, campo, max = 5) {
  const contagem = {};
  dados.forEach(d => {
    const valor = d[campo] || 'Outro';
    contagem[valor] = (contagem[valor] || 0) + 1;
  });
  const lista = Object.entries(contagem)
    .map(([id, value]) => ({ id, label: id, value: Number(value) }))
    .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
  const principais = lista.slice(0, max);
  const outros = lista.slice(max);
  if (outros.length > 0) {
    principais.push({ id: 'Outros', label: 'Outros', value: outros.reduce((acc: number, cur: { value: number }) => acc + cur.value, 0) });
  }
  return principais;
}

// Função para mapear o objeto para uma área macro
function classificarArea(objeto) {
  if (!objeto) return 'Outro';
  const texto = objeto.toLowerCase();
  if (texto.match(/saúde|hospital|ubs|psf|unidade básica|posto de saúde|samu|enfermagem|clínica/)) return 'Saúde';
  if (texto.match(/educação|escola|creche|aluno|professor|ensino|merenda|escolar|universidade|escolarização/)) return 'Educação';
  if (texto.match(/cultura|evento cultural|museu|patrimônio|artístico|artes|teatro|dança|música/)) return 'Cultura';
  if (texto.match(/esporte|ginásio|quadra|campo|futebol|esportiva|pista de atletismo/)) return 'Esporte';
  if (texto.match(/infraestrutura|pavimentação|asfalto|estrada|ponte|saneamento|água|drenagem|iluminação/)) return 'Infraestrutura';
  if (texto.match(/assistência social|cras|creas|abrigo|idoso|família|vulnerabilidade/)) return 'Assistência Social';
  if (texto.match(/agricultura|rural|agro|produtor rural|agropecuária/)) return 'Agricultura';
  return 'Outro';
}

export default function ResumoDonutsCard({ dados }) {
  let porSecretaria: any[] = [];
  if (Array.isArray(dados) && dados.length > 0) {
    if (dados[0] && typeof dados[0] === 'object' && 'concedente' in dados[0]) {
      porSecretaria = agruparPorCampo(dados, 'concedente');
    } else if (dados[0] && typeof dados[0] === 'object' && 'órgão' in dados[0]) {
      porSecretaria = agruparPorCampo(dados, 'órgão');
    }
  }
  // Novo agrupamento: mapeia cada objeto para área macro
  const dadosComArea = dados.map(d => ({ ...d, area_macro: classificarArea(d.objeto) }));
  const porArea = agruparPorCampo(dadosComArea, 'area_macro');

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Distribuição por Secretaria e Área de Atuação
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" mb={1}>Principais Secretarias/Concedentes</Typography>
          <Box height={220}>
            <ResponsivePie
              data={porSecretaria}
              margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
              innerRadius={0.6}
              padAngle={1}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'paired' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLabels={false}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 36,
                  itemWidth: 80,
                  itemHeight: 18,
                  itemsSpacing: 0,
                  symbolSize: 14,
                  symbolShape: 'circle',
                },
              ]}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" mb={1}>Principais Áreas de Atuação</Typography>
          <Box height={220}>
            <ResponsivePie
              data={porArea}
              margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
              innerRadius={0.6}
              padAngle={1}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'set2' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLabels={false}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 36,
                  itemWidth: 80,
                  itemHeight: 18,
                  itemsSpacing: 0,
                  symbolSize: 14,
                  symbolShape: 'circle',
                },
              ]}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
} 