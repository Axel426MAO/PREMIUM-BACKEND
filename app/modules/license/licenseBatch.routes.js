'use strict';

const licenseBatchController = require('./licenseBatch.controller');

async function licenseBatchRoutes(fastify, options) {
  // Rota para criar um novo lote de licenças e suas chaves
  fastify.post('/', licenseBatchController.create);

  // Rota para listar todos os lotes de licença criados
  fastify.get('/', licenseBatchController.getAll);

  // --- NOVA ROTA ---
  // Rota para buscar um lote de licenças específico pelo ID com suas chaves
  fastify.get('/:id', licenseBatchController.getById);
}

module.exports = licenseBatchRoutes;
