'use strict';

const schoolController = require('./school.controller');

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function schoolRoutes(fastify, options) {
    // Rota para criar uma nova escola
    fastify.post('/', schoolController.create);

    // Rota para buscar todas as escolas
    fastify.get('/', schoolController.getAll);

    // Rota para buscar uma escola por ID
    fastify.get('/:id', schoolController.getById);

    // Rota para atualizar uma escola por ID
    fastify.put('/:id', schoolController.update);

    // Rota para deletar uma escola por ID
    fastify.delete('/:id', schoolController.delete);
}

module.exports = schoolRoutes;