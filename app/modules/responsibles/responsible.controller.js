'use strict';

const ResponsibleService = require('./responsible.service');

class ResponsibleController {
  /**
   * Cria um novo responsável.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async create(request, reply) {
    try {
      const responsibleService = new ResponsibleService(request.server.prisma);
      const newResponsible = await responsibleService.createResponsible(request.body);
      return reply.status(201).send(newResponsible);
    } catch (err) {
      request.log.error(`Erro ao criar responsável: ${err.message}`);
      // Erro de violação de chave única (usuário já é responsável)
      if (err.code === 'P2002' && err.meta?.target?.includes('user_id')) {
        return reply.status(409).send({ error: 'Este usuário já está definido como responsável.' });
      }
      // Erro de chave estrangeira (usuário ou secretaria não existem)
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Usuário ou Secretaria não encontrado(a).' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao criar o responsável.' });
    }
  }

  /**
   * Busca todos os responsáveis.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async getAll(request, reply) {
    try {
      const responsibleService = new ResponsibleService(request.server.prisma);
      const responsibles = await responsibleService.getAllResponsibles();
      return reply.send(responsibles);
    } catch (err) {
      request.log.error(`Erro ao buscar responsáveis: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Busca um responsável pelo seu ID.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async getById(request, reply) {
    try {
      const responsibleService = new ResponsibleService(request.server.prisma);
      const { id } = request.params;
      const responsible = await responsibleService.getResponsibleById(Number(id));
      return reply.send(responsible);
    } catch (err) {
      request.log.error(`Erro ao buscar responsável por ID: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Responsável não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Atualiza um responsável existente.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async update(request, reply) {
    try {
      const responsibleService = new ResponsibleService(request.server.prisma);
      const { id } = request.params;
      const updatedResponsible = await responsibleService.updateResponsible(Number(id), request.body);
      return reply.send(updatedResponsible);
    } catch (err) {
      request.log.error(`Erro ao atualizar responsável: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Registro não encontrado para atualização (Responsável, Usuário ou Secretaria).' });
      }
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: 'O ID de usuário fornecido já pertence a outro responsável.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Deleta um responsável.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async delete(request, reply) {
    try {
      const responsibleService = new ResponsibleService(request.server.prisma);
      const { id } = request.params;
      await responsibleService.deleteResponsible(Number(id));
      return reply.status(204).send();
    } catch (err) {
      request.log.error(`Erro ao deletar responsável: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Responsável não encontrado para exclusão.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }
}

module.exports = new ResponsibleController();
