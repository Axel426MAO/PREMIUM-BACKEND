'use strict';

const filesController = require('./files.controller');

async function filesRoutes(fastify, options) {
  fastify.post('/', filesController.create);
  fastify.get('/:reference_table/:reference_id', filesController.getByReference);
}

module.exports = filesRoutes;
