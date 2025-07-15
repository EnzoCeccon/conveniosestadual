const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Exemplo de rota - substitua pela sua lógica real
app.get('/api/convenios', (req, res) => {
  // Aqui você pode buscar dados do Firestore, de um arquivo, etc.
  res.json({ mensagem: 'API de convênios funcionando no Firebase!' });
});

exports.api = functions.https.onRequest(app); 