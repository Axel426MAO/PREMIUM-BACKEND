'use strict';

const secretaryController = require('./secretary.controller');

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function secretaryRoutes(fastify, options) {
    // Rota para criar uma nova secretaria (e seu endereço)
    fastify.post('/', secretaryController.create);

    // Rota para buscar todas as secretarias
    fastify.get('/', secretaryController.getAll);

    // Rota para buscar uma secretaria por ID
    fastify.get('/:id', secretaryController.getById);

    // Rota para atualizar uma secretaria por ID
    fastify.put('/:id', secretaryController.update);

    fastify.put('/full/:id', secretaryController.updateFull);
    // Rota para deletar uma secretaria por ID
    fastify.delete('/:id', secretaryController.delete);
}

module.exports = secretaryRoutes;
