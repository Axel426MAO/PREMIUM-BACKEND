'use strict';

const SchoolService = require('./school.service');

class SchoolController {
    /**
     * Busca todas as escolas associadas a um ID de secretaria.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async getBySecretaryId(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            // Extrai o ID da secretaria dos parâmetros da URL.
            const { secretaryId } = request.params;

            // Valida se o ID foi fornecido.
            if (!secretaryId) {
                return reply.status(400).send({ error: 'O ID da secretaria é obrigatório.' });
            }
            
            // Chama o serviço para buscar as escolas, convertendo o ID para número.
            const schools = await schoolService.getSchoolsBySecretaryId(Number(secretaryId));
            
            return reply.send(schools);
        } catch (err) {
            request.log.error(`Erro ao buscar escolas por secretaria: ${err.message}`);
            return reply.status(500).send({ error: 'Ocorreu um erro interno ao processar sua solicitação.' });
        }
    }
    
    /**
     * Orquestra a atualização completa de uma escola e suas entidades relacionadas.
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async updateFull(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const { id } = request.params;
            const updatedSchool = await schoolService.updateFullSchool(Number(id), request.body);
            return reply.send(updatedSchool);
        } catch (err) {
            request.log.error(`Erro no fluxo de atualização completa da escola: ${err.message}`);
            if (err.code === 'P2025' || err.message.includes('não encontrada')) {
                return reply.status(404).send({ error: 'Escola não encontrada para atualização.' });
            }
            return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
        }
    }

    // --- MÉTODOS EXISTENTES (sem alterações) ---

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

    async delete(request, reply) {
        try {
            const schoolService = new SchoolService(request.server.prisma);
            const { id } = request.params;
            await schoolService.deleteSchool(Number(id));
            return reply.status(204).send();
        } catch (err) {
            request.log.error(`Erro ao deletar escola: ${err.message}`);
            if (err.message.includes('não encontrada')) {
                return reply.status(404).send({ error: 'Escola não encontrada para exclusão.' });
            }
            return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
        }
    }
}

module.exports = new SchoolController();
