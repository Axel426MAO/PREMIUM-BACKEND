
'use strict';

const licenseBatchController = require('./licenseBatch.controller');

async function licenseBatchRoutes(fastify, options) {
  // Rota para criar um novo lote de licenças e suas chaves
  fastify.post('/', licenseBatchController.create);

  // Rota para listar todos os lotes de licença criados
  fastify.get('/', licenseBatchController.getAll);
}

module.exports = licenseBatchRoutes;