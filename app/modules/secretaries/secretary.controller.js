'use strict';

const SecretaryService = require('./secretary.service');

class SecretaryController {
  /**
   * Cria uma nova secretaria.
   * O corpo da requisição deve conter os dados da secretaria e um objeto 'address'.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async create(request, reply) {
    try {
      const secretaryService = new SecretaryService(request.server.prisma);
      // O request.body agora deve conter 'is_state_level'
      const newSecretary = await secretaryService.createSecretary(request.body);
      return reply.status(201).send(newSecretary);
    } catch (err) {
      request.log.error(`Erro ao criar secretaria: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao criar a secretaria.' });
    }
  }

  /**
   * Busca todas as secretarias.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async getAll(request, reply) {
    try {
      const secretaryService = new SecretaryService(request.server.prisma);
      const secretaries = await secretaryService.getAllSecretaries();
      return reply.send(secretaries);
    } catch (err) {
      request.log.error(`Erro ao buscar secretarias: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Busca uma secretaria pelo seu ID.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async getById(request, reply) {
    try {
      const secretaryService = new SecretaryService(request.server.prisma);
      const { id } = request.params;
      const secretary = await secretaryService.getSecretaryById(Number(id));
      return reply.send(secretary);
    } catch (err) {
      request.log.error(`Erro ao buscar secretaria por ID: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Secretaria não encontrada.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Atualiza uma secretaria existente.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async update(request, reply) {
    try {
      const secretaryService = new SecretaryService(request.server.prisma);
      const { id } = request.params;
      // O request.body agora pode conter 'is_state_level'
      const updatedSecretary = await secretaryService.updateSecretary(Number(id), request.body);
      return reply.send(updatedSecretary);
    } catch (err) {
      request.log.error(`Erro ao atualizar secretaria: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Secretaria não encontrada para atualização.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Deleta uma secretaria.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async delete(request, reply) {
    try {
      const secretaryService = new SecretaryService(request.server.prisma);
      const { id } = request.params;
      await secretaryService.deleteSecretary(Number(id));
      return reply.status(204).send();
    } catch (err) {
      request.log.error(`Erro ao deletar secretaria: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Secretaria não encontrada para exclusão.' });
      }
      if (err.code === 'P2003') {
        return reply.status(409).send({ error: 'Esta secretaria não pode ser excluída pois possui responsáveis vinculados.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  async updateFull(request, reply) {
    try {
      const secretaryService = new SecretaryService(request.server.prisma);
      const { id } = request.params;
      const updatedData = await secretaryService.updateFullSecretary(Number(id), request.body);
      return reply.send(updatedData);
    } catch (err) {
      request.log.error(`Erro no fluxo de atualização completa: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Secretaria não encontrada para atualização.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }
}

module.exports = new SecretaryController();
