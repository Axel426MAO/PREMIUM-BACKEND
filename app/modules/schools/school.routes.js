'use strict';

const schoolController = require('./school.controller');

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function schoolRoutes(fastify, options) {
    fastify.get('/by-secretary/:secretaryId', schoolController.getBySecretaryId);
    fastify.put('/full/:id', schoolController.updateFull);

    // --- Rotas existentes ---
    fastify.post('/', schoolController.create);
    fastify.get('/', schoolController.getAll);

    fastify.get('/:id', schoolController.getById);
    fastify.put('/:id', schoolController.update);
    fastify.delete('/:id', schoolController.delete);
}

module.exports = schoolRoutes;
