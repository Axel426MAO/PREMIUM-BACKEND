'use strict';

const userController = require('./user.controller');

async function userRoutes(fastify, options) {
  // Rotas CRUD para usuários
  fastify.get('/', userController.getAll);
  fastify.get('/:id', userController.getById);
  fastify.post('/', userController.create);
  fastify.put('/:id', userController.update);
  fastify.delete('/:id', userController.delete);
}

module.exports = userRoutes;
