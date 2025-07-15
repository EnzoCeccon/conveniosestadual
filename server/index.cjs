const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
const PORT = 3001; // Porta do backend

// Função recursiva para listar todos os arquivos Excel em subpastas
function listarArquivosExcel(dir, arquivos = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      listarArquivosExcel(fullPath, arquivos);
    } else if (file.endsWith('.xlsx') || file.endsWith('.xls')) {
      arquivos.push(fullPath);
    }
  });
  return arquivos;
}

// Função recursiva para encontrar todos os arquivos .json
function listarArquivosJson(dir, arquivos = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      listarArquivosJson(fullPath, arquivos);
    } else if (file.endsWith('.json')) {
      arquivos.push(fullPath);
    }
  });
  return arquivos;
}

// Rota para retornar todos os dados dos arquivos JSO
app.get('/api/convenios', (req, res) => {
  const arquivosJson = listarArquivosJson(path.join(__dirname, '../public/data'));
  console.log('Arquivos JSON encontrados:', arquivosJson);
  let todosConvenios = [];
  arquivosJson.forEach(jsonPath => {
    try {
      const conteudo = fs.readFileSync(jsonPath, 'utf8');
      const dados = JSON.parse(conteudo);
      if (Array.isArray(dados)) {
        todosConvenios = todosConvenios.concat(dados);
      }
    } catch (e) {
      console.error('Erro ao ler', jsonPath, e);
    }
  });
  res.json(todosConvenios);
});

// Servir arquivos estáticos do frontend normalmente
app.use(express.static(path.join(__dirname, '../public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
}); 