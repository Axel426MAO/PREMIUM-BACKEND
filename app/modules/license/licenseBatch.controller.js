'use strict';

const LicenseBatchService = require('./licenseBatch.service');

class LicenseBatchController {
  async create(request, reply) {
    try {
      const { book_id, quantity, secretary_id, school_id } = request.body;

      if (typeof book_id !== 'number' || typeof quantity !== 'number') {
        return reply.status(400).send({ error: 'Os campos book_id e quantity são obrigatórios e devem ser números.' });
      }

      const licenseBatchService = new LicenseBatchService(request.server.prisma);
      const newLicenseBatch = await licenseBatchService.createLicenseBatch({
        book_id,
        quantity,
        secretary_id,
        school_id
      });

      return reply.status(201).send(newLicenseBatch);

    } catch (err) {
      request.log.error(err, 'Erro ao criar lote de licenças');
      if (err instanceof Error && (err.message.includes('não encontrada') || err.message.includes('obrigatórios') || err.message.includes('não ambos'))) {
        return reply.status(400).send({ error: err.message });
      }
      if (err.code === 'P2003') {
        return reply.status(404).send({ error: `O livro com ID ${request.body.book_id} não foi encontrado.` });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao processar sua solicitação.' });
    }
  }

  async getAll(request, reply) {
    try {
      const licenseBatchService = new LicenseBatchService(request.server.prisma);
      const batches = await licenseBatchService.getAllBatches();
      return reply.send(batches);
    } catch (err) {
      request.log.error(err, 'Erro ao buscar lotes de licenças');
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao buscar os lotes.' });
    }
  }

  async getById(request, reply) {
    try {
      const { id } = request.params;
      const batchId = parseInt(id, 10);

      if (isNaN(batchId)) {
        return reply.status(400).send({ error: 'O ID do lote é inválido.' });
      }

      const licenseBatchService = new LicenseBatchService(request.server.prisma);
      const batch = await licenseBatchService.getBatchById(batchId);

      return reply.send(batch);

    } catch (err) {
      request.log.error(err, `Erro ao buscar o lote de licenças com ID: ${request.params.id}`);

      if (err instanceof Error && err.message.includes('não encontrado')) {
        return reply.status(404).send({ error: err.message });
      }

      return reply.status(500).send({ error: 'Ocorreu um erro interno ao buscar o lote.' });
    }
  }

  // --- NOVO MÉTODO ---
  async getBySecretaryId(request, reply) {
    try {
      const { secretaryId } = request.params;
      const id = parseInt(secretaryId, 10);

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'O ID da secretaria é inválido.' });
      }

      const licenseBatchService = new LicenseBatchService(request.server.prisma);
      const batches = await licenseBatchService.getBatchesBySecretaryId(id);

      return reply.send(batches);

    } catch (err) {
      request.log.error(err, `Erro ao buscar lotes de licenças para a secretaria com ID: ${request.params.secretaryId}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao buscar os lotes da secretaria.' });
    }
  }

  async updateStatus(request, reply) {
    try {
      const { id } = request.params;
      const { status } = request.body;

      // Valida o ID do lote
      const batchId = parseInt(id, 10);
      if (isNaN(batchId)) {
        return reply.status(400).send({ error: 'O ID do lote é inválido.' });
      }

      // Valida o status recebido. Por enquanto, só aceitamos "ENVIADO".
      if (status !== 'ENVIADO') {
        return reply.status(400).send({ error: 'O status fornecido é inválido. Apenas "ENVIADO" é permitido para esta ação.' });
      }

      const licenseBatchService = new LicenseBatchService(request.server.prisma);
      const updatedBatch = await licenseBatchService.updateBatchStatus(batchId, status);

      return reply.send(updatedBatch);

    } catch (err) {
      request.log.error(err, `Erro ao atualizar o status do lote de licenças: ${err.message}`);

      // Retorna erros de negócio (ex: lote não encontrado, status inválido)
      if (err instanceof Error && (err.message.includes('não encontrado') || err.message.includes('O lote só pode ser enviado'))) {
        return reply.status(400).send({ error: err.message });
      }

      // Retorna erro genérico
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao processar sua solicitação.' });
    }
  }
}

module.exports = new LicenseBatchController();