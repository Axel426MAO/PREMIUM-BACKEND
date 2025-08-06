'use strict';

const AddressService = require('./address.service');

class AddressController {
  /**
   * Cria um novo endereço.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async create(request, reply) {
    try {
      const addressService = new AddressService(request.server.prisma);
      const newAddress = await addressService.createAddress(request.body);
      return reply.status(201).send(newAddress);
    } catch (err) {
      request.log.error(`Erro ao criar endereço: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao criar o endereço.' });
    }
  }

  /**
   * Busca todos os endereços.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async getAll(request, reply) {
    try {
      const addressService = new AddressService(request.server.prisma);
      const addresses = await addressService.getAllAddresses();
      return reply.send(addresses);
    } catch (err) {
      request.log.error(`Erro ao buscar endereços: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao buscar os endereços.' });
    }
  }

  /**
   * Busca um endereço pelo seu ID.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async getById(request, reply) {
    try {
      const addressService = new AddressService(request.server.prisma);
      const { id } = request.params;
      const address = await addressService.getAddressById(Number(id));
      return reply.send(address);
    } catch (err) {
      request.log.error(`Erro ao buscar endereço por ID: ${err.message}`);
      if (err.code === 'P2025') { // Código de erro do Prisma para "não encontrado"
        return reply.status(404).send({ error: 'Endereço não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Atualiza um endereço existente.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async update(request, reply) {
    try {
      const addressService = new AddressService(request.server.prisma);
      const { id } = request.params;
      const updatedAddress = await addressService.updateAddress(Number(id), request.body);
      return reply.send(updatedAddress);
    } catch (err) {
      request.log.error(`Erro ao atualizar endereço: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Endereço não encontrado para atualização.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  /**
   * Deleta um endereço.
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  async delete(request, reply) {
    try {
      const addressService = new AddressService(request.server.prisma);
      const { id } = request.params;
      await addressService.deleteAddress(Number(id));
      return reply.status(204).send(); // 204 No Content
    } catch (err) {
      request.log.error(`Erro ao deletar endereço: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Endereço não encontrado para exclusão.' });
      }
      // Erro de violação de chave estrangeira (endereço em uso por uma secretaria)
      if (err.code === 'P2003') {
        return reply.status(409).send({ error: 'Este endereço não pode ser excluído pois está associado a uma secretaria.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }
}

module.exports = new AddressController();
