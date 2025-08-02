
'use strict';

const fs = require('fs');
const path = require('path');

class FileService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Salva um arquivo no servidor a partir de um buffer.
   * @param {object} params
   * @param {object} params.file - O objeto com { buffer, filename }.
   * @param {string} params.reference_table - A tabela de referência.
   * @param {string} params.reference_id - O ID da referência.
   */
  async uploadFile({ file, reference_table, reference_id }) {
    const uploadDir = path.join(process.cwd(), 'uploads', reference_table, String(reference_id));
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${file.filename}`;
    const serverFilePath = path.join(uploadDir, uniqueFilename);

    // **MUDANÇA AQUI:** Usamos writeFile para salvar o buffer diretamente
    await fs.promises.writeFile(serverFilePath, file.buffer);

    const dbPath = path.join('uploads', reference_table, String(reference_id), uniqueFilename).replace(/\\/g, '/'); // Normaliza para S.O. Windows

    const newFileRecord = await this.prisma.file.create({
      data: {
        reference_table,
        reference_id: Number(reference_id),
        name: file.filename,
        file_path: dbPath,
      },
    });

    return newFileRecord;
  }

  // ... o resto da classe continua igual ...
  async getFilesByReference({ reference_table, reference_id }) {
    return this.prisma.file.findMany({
      where: {
        reference_table: reference_table,
        reference_id: Number(reference_id),
      },
    });
  }
}

module.exports = FileService;