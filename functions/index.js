const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Função para ler um arquivo JSON de forma segura
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
  }
  return [];
}

app.get('/api/convenios', (req, res) => {
  try {
    let todosConvenios = [];
    
    // 1. Ler o arquivo principal convenios.json
    const conveniosPath = path.join(__dirname, 'convenios.json');
    const conveniosPrincipais = readJsonFile(conveniosPath);
    todosConvenios = todosConvenios.concat(conveniosPrincipais);
    
    // 2. Ler os arquivos em public/data/apiconveniosjson/ (sem extensão .json)
    const apiConveniosPath = path.join(__dirname, '..', 'public', 'data', 'apiconveniosjson');
    
    // Ler arquivo 2017
    const convenios2017Path = path.join(apiConveniosPath, '2017');
    const convenios2017 = readJsonFile(convenios2017Path);
    todosConvenios = todosConvenios.concat(convenios2017);
    
    // Ler arquivo 2018
    const convenios2018Path = path.join(apiConveniosPath, '2018');
    const convenios2018 = readJsonFile(convenios2018Path);
    todosConvenios = todosConvenios.concat(convenios2018);
    
    // Ler arquivo 2019
    const convenios2019Path = path.join(apiConveniosPath, '2019');
    const convenios2019 = readJsonFile(convenios2019Path);
    todosConvenios = todosConvenios.concat(convenios2019);
    
    // 3. Remover duplicatas baseado no número do convênio
    const conveniosUnicos = todosConvenios.filter((convenio, index, self) => {
      const numero = convenio.numero_convênio || convenio.NUMERO || convenio.numero;
      return index === self.findIndex(c => 
        (c.numero_convênio || c.NUMERO || c.numero) === numero
      );
    });
    
    console.log(`Total de convênios carregados: ${todosConvenios.length}`);
    console.log(`Convênios únicos após remoção de duplicatas: ${conveniosUnicos.length}`);
    
    res.json(conveniosUnicos);
    
  } catch (error) {
    console.error('Erro ao processar dados de convênios:', error);
    res.status(500).json({ 
      erro: 'Erro ao processar dados de convênios',
      detalhes: error.message 
    });
  }
});

exports.api = functions.https.onRequest(app); 