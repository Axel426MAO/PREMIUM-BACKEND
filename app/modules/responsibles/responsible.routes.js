'use strict';

const responsibleController = require('./responsible.controller');

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function responsibleRoutes(fastify, options) {
  // Rota para criar um novo responsável
  fastify.post('/', responsibleController.create);

  // Rota para buscar todos os responsáveis
  fastify.get('/', responsibleController.getAll);

  // Rota para buscar um responsável por ID
  fastify.get('/:id', responsibleController.getById);

  // Rota para atualizar um responsável por ID
  fastify.put('/:id', responsibleController.update);

  // Rota para deletar um responsável por ID
  fastify.delete('/:id', responsibleController.delete);
}

module.exports = responsibleRoutes;
