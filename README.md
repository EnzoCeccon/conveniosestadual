# Dashboard de Convênios Estaduais

Um painel de controle interativo para monitoramento e análise de Convênios Estaduais, construído com React, TypeScript e bibliotecas modernas de visualização de dados.

## Funcionalidades

- Métricas principais em cards:
  - Total de Convênios
  - Valor Total dos Convênios
  - Taxa de Execução
  - Municípios Atendidos
- Gráfico de pizza para distribuição por área
- Gráfico de linha para taxa de execução mensal
- Gráfico de barras para distribuição regional
- Interface responsiva e moderna
- Tema personalizado com cores institucionais

## Tecnologias Utilizadas

- React
- TypeScript
- Material-UI
- Nivo Charts
- Vite

## Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/EnzoCeccon/painel-convenios.git]
cd dashboard-interativo
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo será aberto automaticamente em seu navegador padrão na porta 3000.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run preview` - Visualiza a versão de produção localmente

## Personalização

O tema pode ser personalizado editando o objeto `theme` no arquivo `src/App.tsx`. As cores atuais foram escolhidas para refletir uma identidade visual governamental.

## Dados

Os dados apresentados no dashboard são exemplos. Para usar dados reais, você precisará:

1. Conectar com sua API de dados de convênios
2. Atualizar os arquivos em `src/components` para usar os dados reais
3. Ajustar as visualizações conforme necessário

 