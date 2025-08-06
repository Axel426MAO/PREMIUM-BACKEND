/* Arquivo: modules/license-batches/licenseBatch.controller.js 
*/
'use strict';

const LicenseBatchService = require('./licenseBatch.service');

class LicenseBatchController {
  async create(request, reply) {
    try {
      // CORREÇÃO: Ler todos os campos necessários do corpo da requisição
      const { book_id, quantity, secretary_id, school_id } = request.body;

      // A validação agora pode ser mais robusta, mas o serviço já faz a principal
      if (typeof book_id !== 'number' || typeof quantity !== 'number') {
        return reply.status(400).send({ error: 'Os campos book_id e quantity são obrigatórios e devem ser números.' });
      }

      const licenseBatchService = new LicenseBatchService(request.server.prisma);

      // Passa todos os dados para o serviço
      const newLicenseBatch = await licenseBatchService.createLicenseBatch({
        book_id,
        quantity,
        secretary_id,
        school_id
      });

      return reply.status(201).send(newLicenseBatch);

    } catch (err) {
      // Melhorando o log de erro para debug futuro
      request.log.error(err, 'Erro ao criar lote de licenças');

      // Retorna a mensagem de erro específica do serviço para o frontend
      if (err instanceof Error && (err.message.includes('não encontrada') || err.message.includes('obrigatórios') || err.message.includes('não ambos'))) {
        return reply.status(400).send({ error: err.message });
      }

      // Trata erros de chave estrangeira (ex: livro não existe)
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
}

module.exports = new LicenseBatchController();