'use strict';

const SchoolService = require('./school.service');

class SchoolController {
    /**
     * Cria uma nova escola.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async create(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const newSchool = await schoolService.createSchool(request.body);
            return reply.status(201).send(newSchool);
        } catch (err) {
            request.log.error(`Erro ao criar escola: ${err.message}`);
            return reply.status(400).send({ error: err.message });
        }
    }

    /**
     * Busca todas as escolas.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async getAll(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const schools = await schoolService.getAllSchools();
            return reply.send(schools);
        } catch (err) {
            request.log.error(`Erro ao buscar escolas: ${err.message}`);
            return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
        }
    }

    /**
     * Busca uma escola pelo seu ID.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async getById(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const { id } = request.params;
            const school = await schoolService.getSchoolById(Number(id));
            return reply.send(school);
        } catch (err) {
            request.log.error(`Erro ao buscar escola por ID: ${err.message}`);
            if (err.code === 'P2025') {
                return reply.status(404).send({ error: 'Escola não encontrada.' });
            }
            return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
        }
    }

    /**
     * Atualiza uma escola existente.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async update(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const { id } = request.params;
            const updatedSchool = await schoolService.updateSchool(Number(id), request.body);
            return reply.send(updatedSchool);
        } catch (err) {
            request.log.error(`Erro ao atualizar escola: ${err.message}`);
            if (err.code === 'P2025') {
                return reply.status(404).send({ error: 'Escola não encontrada para atualização.' });
            }
            return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
        }
    }

    /**
     * Deleta uma escola.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async delete(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const { id } = request.params;
            await schoolService.deleteSchool(Number(id));
            // Retorna 204 No Content para sucesso em deleções
            return reply.status(204).send();
        } catch (err) {
            request.log.error(`Erro ao deletar escola: ${err.message}`);
            // O erro P2025 é tratado dentro do service, aqui tratamos a mensagem genérica dele.
            if (err.message.includes('não encontrada')) {
                return reply.status(404).send({ error: 'Escola não encontrada para exclusão.' });
            }
            return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
        }
    }
}

module.exports = new SchoolController();