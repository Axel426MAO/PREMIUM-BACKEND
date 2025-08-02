
'use strict';

const FileService = require('./files.service');

class FilesController {
  async create(request, reply) {
    try {
      let filePayload = null;
      const fields = {};

      const parts = request.parts();
      for await (const part of parts) {
        if (part.file) {
          // Apenas processe o primeiro arquivo encontrado
          if (!filePayload) {
            // **A MUDANÇA PRINCIPAL ESTÁ AQUI**
            // Consumimos o stream para um buffer e guardamos os dados
            const buffer = await part.toBuffer();
            filePayload = {
              buffer,
              filename: part.filename,
              mimetype: part.mimetype,
            };
          }
        } else {
          fields[part.fieldname] = part.value;
        }
      }

      if (!filePayload) {
        return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
      }

      const { reference_table, reference_id } = fields;
      if (!reference_table || !reference_id) {
        return reply.status(400).send({ error: 'Os campos "reference_table" e "reference_id" são obrigatórios.' });
      }

      const fileService = new FileService(request.server.prisma);

      // Passamos o payload com o buffer para o serviço
      const savedFile = await fileService.uploadFile({
        file: filePayload, // Agora contém { buffer, filename, ... }
        reference_table: reference_table,
        reference_id: reference_id,
      });

      return reply.status(201).send(savedFile);
    } catch (err) {
      request.log.error(err, 'Erro no upload de arquivo');
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao processar o arquivo.' });
    }
  }

  async getByReference(request, reply) {
    try {
      const { reference_table, reference_id } = request.params;
      if (!reference_table || !reference_id) {
        return reply.status(400).send({ error: 'Tabela e ID de referência são obrigatórios.' });
      }
      const fileService = new FileService(request.server.prisma);
      const files = await fileService.getFilesByReference({
        reference_table,
        reference_id
      });
      return reply.send(files);
    } catch (err) {
      request.log.error(err, 'Erro ao buscar arquivos por referência');
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao buscar os arquivos.' });
    }
  }
}

module.exports = new FilesController();