'use strict';

const addressController = require('./address.controller');

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function addressRoutes(fastify, options) {
    // Rota para criar um novo endereço
    fastify.post('/', addressController.create);
    // Rota para buscar todos os endereços
    fastify.get('/', addressController.getAll);
    // Rota para buscar um endereço por ID
    fastify.get('/:id', addressController.getById);
    // Rota para atualizar um endereço por ID
    fastify.put('/:id', addressController.update);
    // Rota para deletar um endereço por ID
    fastify.delete('/:id', addressController.delete);
}

module.exports = addressRoutes;
