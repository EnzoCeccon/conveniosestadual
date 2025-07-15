const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

app.get('/api/convenios', (req, res) => {
  const filePath = path.join(__dirname, 'convenios.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao ler o arquivo convenios.json' });
      return;
    }
    try {
      const convenios = JSON.parse(data);
      res.json(convenios);
    } catch (parseErr) {
      res.status(500).json({ erro: 'Erro ao parsear o arquivo convenios.json' });
    }
  });
});

exports.api = functions.https.onRequest(app); 