const fs = require('fs');

// Caminho do arquivo original
const arquivoOriginal = './public/data/convenios.json';
// Caminho do novo arquivo corrigido
const arquivoCorrigido = './convenios.json';

// Lê o conteúdo do arquivo original
const conteudo = fs.readFileSync(arquivoOriginal, 'utf8');

// Expressão regular para encontrar todos os arrays no arquivo
const arrays = conteudo.match(/\[[\s\S]*?\]/g);

if (!arrays) {
  console.error('Nenhum array encontrado no arquivo!');
  process.exit(1);
}

// Junta todos os arrays em um só
let todosObjetos = [];
arrays.forEach(arr => {
  try {
    const objs = JSON.parse(arr);
    todosObjetos = todosObjetos.concat(objs);
  } catch (e) {
    console.error('Erro ao processar um dos arrays:', e);
  }
});

// Salva o novo arquivo JSON corrigido
fs.writeFileSync(arquivoCorrigido, JSON.stringify(todosObjetos, null, 2), 'utf8');
console.log(`Arquivo corrigido salvo como ${arquivoCorrigido} com ${todosObjetos.length} registros.`);