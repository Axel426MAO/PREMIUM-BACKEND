'use strict';

// O módulo 'crypto' não é mais necessário para este formato, mas pode ser mantido
// se for usado em outras partes do projeto. Para esta função, não usaremos.

class LicenseBatchService {
  constructor(prisma) {
    if (!prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    this.prisma = prisma;
  }

  /**
   * Gera um trecho alfanumérico aleatório com um comprimento específico.
   * @param {number} length - O comprimento da string a ser gerada.
   * @returns {string} A string alfanumérica gerada.
   * @private
   */
  _generateRandomChunk(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Cria um lote de licenças e gera todas as chaves com a nomenclatura customizada.
   * @param {object} batchData - Dados para criar o lote.
   * @param {number} batchData.book_id - ID do livro.
   * @param {number} batchData.quantity - Quantidade de licenças.
   * @param {number} [batchData.secretary_id] - ID da secretaria (se aplicável).
   * @param {number} [batchData.school_id] - ID da escola privada (se aplicável).
   * @returns {Promise<object>} O lote criado com a contagem de chaves.
   */
  async createLicenseBatch({ book_id, quantity, secretary_id, school_id }) {

    // --- Validações Iniciais (Mantidas) ---
    if (!book_id || !quantity) {
      throw new Error('ID do livro e quantidade são obrigatórios.');
    }
    if (quantity <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }
    if (!secretary_id && !school_id) {
      throw new Error('É necessário fornecer um ID de secretaria ou de escola.');
    }
    if (secretary_id && school_id) {
      throw new Error('Forneça apenas um ID de secretaria ou de escola, não ambos.');
    }

    // --- NOVA LÓGICA DE GERAÇÃO DE CÓDIGO ---

    // 1. Determina o identificador do cliente (SECEST, SECMUN, ESCPRI)
    let clientIdentifier = '';
    let customerData = {};

    if (school_id) {
      const school = await this.prisma.school.findUnique({ where: { id: school_id } });
      if (!school) throw new Error(`Escola com ID ${school_id} não encontrada.`);
      if (!school.is_private) throw new Error('A geração de lotes diretos é permitida apenas para escolas privadas.');

      clientIdentifier = 'ESCPRI';
      customerData = { school_id, customer_type: 'SCHOOL' };

    } else if (secretary_id) {
      const secretary = await this.prisma.secretary.findUnique({ where: { id: secretary_id } });
      if (!secretary) throw new Error(`Secretaria com ID ${secretary_id} não encontrada.`);

      clientIdentifier = secretary.is_state_level ? 'SECEST' : 'SECMUN';
      customerData = { secretary_id, customer_type: 'SECRETARY' };
    }

    // 2. Prepara o sufixo de data no formato DDMMYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
    const year = String(now.getFullYear()).slice(-2);
    const dateSuffix = `${day}${month}${year}`;

    const result = await this.prisma.$transaction(async (prisma) => {
      // 3. Cria o lote de licenças
      const newBatch = await prisma.licenseBatch.create({
        data: {
          book_id,
          quantity,
          ...customerData,
        },
      });

      // 4. Gera as chaves com o novo formato
      const keysToCreate = [];
      for (let i = 0; i < quantity; i++) {
        const chunk1 = this._generateRandomChunk(5);
        const chunk2 = this._generateRandomChunk(5);
        const chunk3 = this._generateRandomChunk(5);

        const finalCode = `${clientIdentifier}-${chunk1}-${chunk2}-${chunk3}-${dateSuffix}`;

        keysToCreate.push({
          batch_id: newBatch.id,
          code: finalCode,
        });
      }

      // 5. Insere todas as chaves geradas no banco
      const createdKeys = await prisma.licenseKey.createMany({
        data: keysToCreate,
      });

      return {
        ...newBatch,
        keys_generated: createdKeys.count,
      };
    });

    return result;
  }

  /**
   * Busca todos os lotes de licença com informações detalhadas.
   */
  async getAllBatches() {
    return this.prisma.licenseBatch.findMany({
      include: {
        book: { select: { id: true, title: true } },
        secretary: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
        parent_batch: { select: { id: true } },
        _count: { select: { license_keys: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Busca um lote de licença específico pelo seu ID, incluindo todas as chaves associadas.
   * @param {number} id - O ID do lote de licenças.
   * @returns {Promise<object>} O lote encontrado com seus detalhes e chaves.
   */
  async getBatchById(id) {
    const batch = await this.prisma.licenseBatch.findUnique({
      where: { id },
      include: {
        book: { select: { id: true, title: true } },
        secretary: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
        license_keys: {
          select: {
            id: true,
            code: true,
            status: true,
            createdAt: true,
            activatedAt: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!batch) {
      throw new Error('Lote de licenças não encontrado.');
    }

    return batch;
  }

  /**
  * Busca todos os lotes de licença associados a uma secretaria específica.
  * @param {number} secretaryId - O ID da secretaria.
  * @returns {Promise<Array<object>>} Uma lista de lotes de licenças.
  */
  async getBatchesBySecretaryId(secretaryId) {
    return this.prisma.licenseBatch.findMany({
      where: {
        secretary_id: secretaryId,
        status: {
          in: ["ENVIADO", "RECEBIDO"]
        }
      },
      include: {
        book: { select: { id: true, title: true } },
        secretary: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
        _count: { select: { license_keys: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateBatchStatus(batchId, newStatus) {
    // 1. Busca o lote para garantir que ele existe e verificar seu status atual
    const existingBatch = await this.prisma.licenseBatch.findUnique({
      where: { id: batchId },
    });

    if (!existingBatch) {
      throw new Error('Lote de licenças não encontrado.');
    }

    // 2. Regra de negócio: só permite a alteração se o status atual for 'CRIADO'
    if (existingBatch.status !== 'CRIADO') {
      throw new Error('O lote só pode ser enviado se o status atual for "CRIADO".');
    }

    // 3. Prepara os dados para a atualização
    const now = new Date();
    const dataToUpdate = {
      status: newStatus, // 'ENVIADO'
      sentAt: now,
      receivedAt: now, // Conforme solicitado, a data de recebimento é a mesma do envio por agora
    };

    // 4. Executa a atualização no banco de dados
    const updatedBatch = await this.prisma.licenseBatch.update({
      where: { id: batchId },
      data: dataToUpdate,
    });

    return updatedBatch;
  }
}

module.exports = LicenseBatchService;