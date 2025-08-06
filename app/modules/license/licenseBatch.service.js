'use strict';

// Importa o módulo de criptografia do Node.js para gerar o hash único
const crypto = require('crypto');

class LicenseBatchService {
  constructor(prisma) {
    if (!prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    this.prisma = prisma;
  }

  /**
   * Cria um lote de licenças e gera todas as chaves com uma nomenclatura customizada.
   * @param {object} batchData - Dados para criar o lote.
   * @param {number} batchData.book_id - ID do livro.
   * @param {number} batchData.quantity - Quantidade de licenças.
   * @param {number} [batchData.secretary_id] - ID da secretaria (se aplicável).
   * @param {number} [batchData.school_id] - ID da escola privada (se aplicável).
   * @returns {Promise<object>} O lote criado com a contagem de chaves.
   */
  async createLicenseBatch({ book_id, quantity, secretary_id, school_id }) {
    
    // --- Validações Iniciais ---
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

    // --- Lógica de Geração do Código ---
    const currentYear = new Date().getFullYear();
    let codePrefix = '';
    let customerData = {};

    if (secretary_id) {
      const secretary = await this.prisma.secretary.findUnique({ where: { id: secretary_id } });
      if (!secretary) throw new Error(`Secretaria com ID ${secretary_id} não encontrada.`);
      
      const sanitizedName = secretary.name.trim().replace(/\s+/g, '-').toUpperCase();
      codePrefix = `${sanitizedName}-${currentYear}`;
      customerData = { secretary_id, customer_type: 'SECRETARY' };

    } else if (school_id) {
      const school = await this.prisma.school.findUnique({ where: { id: school_id } });
      if (!school) throw new Error(`Escola com ID ${school_id} não encontrada.`);
      if (!school.is_private) throw new Error('A geração de lotes diretos é permitida apenas para escolas privadas.');

      codePrefix = `ESCOLA-PRIVADA-${currentYear}`;
      customerData = { school_id, customer_type: 'SCHOOL' };
    }


    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Cria o lote, agora com a informação do cliente
      const newBatch = await prisma.licenseBatch.create({
        data: {
          book_id,
          quantity,
          ...customerData,
        },
      });

      // 2. Gera as chaves com o código customizado
      const keysToCreate = [];
      for (let i = 0; i < quantity; i++) {
        // CORREÇÃO: Adiciona o índice do loop (i) e um timestamp de alta precisão
        // para garantir que a fonte do hash seja sempre única.
        const uniqueSource = `${codePrefix}-${i}-${process.hrtime.bigint()}`;
        const uniqueHash = crypto.createHash('sha1').update(uniqueSource).digest('hex').substring(0, 8).toUpperCase();
        
        const finalCode = `${codePrefix}-${uniqueHash}`;
        
        keysToCreate.push({
          batch_id: newBatch.id,
          code: finalCode,
        });
      }

      // 3. Insere todas as chaves geradas no banco
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
}

module.exports = LicenseBatchService;
