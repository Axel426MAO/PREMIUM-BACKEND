'use strict';

const bookController = require('./books.controller');

async function bookRoutes(fastify, options) {
  // Rota para criar um novo livro
  fastify.post('/', bookController.create);

  // Rota para buscar todos os livros
  fastify.get('/', bookController.getAll);

  // Rota para buscar um livro específico por ID
  fastify.get('/:id', bookController.getById);

  // Rota para atualizar um livro (handler que estava faltando)
  fastify.put('/:id', bookController.update);

  // Rota para deletar um livro
  fastify.delete('/:id', bookController.delete);
}

module.exports = bookRoutes;
