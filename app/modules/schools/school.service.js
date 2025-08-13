'use strict';
const bcrypt = require('bcrypt');

class SchoolService {
    /**
     * @param {import('@prisma/client').PrismaClient} prisma
     */
    constructor(prisma) {
        this.prisma = prisma;
    }

    /**
     * Busca todas as escolas associadas a um ID de secretaria específico.
     * @param {number} secretaryId - O ID da secretaria.
     * @returns {Promise<import('@prisma/client').School[]>}
     */
    async getSchoolsBySecretaryId(secretaryId) {
        return this.prisma.school.findMany({
            where: {
                // Filtra os resultados onde o 'secretary_id' corresponde ao ID fornecido.
                secretary_id: secretaryId,
            },
            // Inclui os dados relacionados para um retorno completo.
            include: {
                address: true,
                secretary: true,
                responsibles: {
                    include: {
                        user: {
                            select: { // Seleciona campos específicos para não expor a senha
                                id: true,
                                email: true,
                                user_type: true,

                            }
                        },
                    },
                },
            },
        });
    }

    /**
     * Cria uma nova escola, endereço, usuário e responsável em uma única transação.
     * @param {object} data - O payload completo vindo do frontend.
     * @returns {Promise<import('@prisma/client').School>}
     */
    async createSchool(data) {
        const {
            name,
            is_private,
            secretary_id,
            address: addressData,
            user: userData,
            responsible: responsibleData
        } = data;

        // Validações de negócio
        if (!is_private && !secretary_id) {
            throw new Error('Escolas públicas devem ter um ID de secretaria (secretary_id) vinculado.');
        }
        if (!addressData || !userData || !responsibleData) {
            throw new Error('Dados de endereço, usuário e responsável são obrigatórios.');
        }

        // A transação garante que todas as operações sejam bem-sucedidas ou nenhuma delas.
        return this.prisma.$transaction(async (prisma) => {
            // 1. Cria o Usuário primeiro
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const createdUser = await prisma.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    user_type: userData.user_type || 'responsible_school',
                },
            });

            // 2. Prepara os dados para a criação da Escola
            const schoolData = {
                name,
                is_private,
                address: {
                    create: addressData,
                },
            };

            // Conecta a secretaria se for uma escola pública
            if (!is_private && secretary_id) {
                schoolData.secretary = {
                    connect: { id: secretary_id },
                };
            }

            // 3. Cria a Escola
            const createdSchool = await prisma.school.create({
                data: schoolData,
            });

            // 4. Cria o Responsável, vinculando o Usuário e a Escola recém-criados
            await prisma.responsible.create({
                data: {
                    ...responsibleData,
                    user: {
                        connect: { id: createdUser.id },
                    },
                    school: {
                        connect: { id: createdSchool.id },
                    },
                },
            });

            // 5. Retorna a escola criada com todos os dados relacionados
            return prisma.school.findUnique({
                where: { id: createdSchool.id },
                include: {
                    address: true,
                    secretary: true,
                    responsibles: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Retorna todas as escolas com seus dados relacionados.
     * @returns {Promise<import('@prisma/client').School[]>}
     */
    async getAllSchools() {
        return this.prisma.school.findMany({
            include: {
                address: true,
                secretary: true,
                responsibles: true,
            },
        });
    }

    /**
     * Busca uma escola por ID, incluindo dados relacionados.
     * @param {number} id
     * @returns {Promise<import('@prisma/client').School>}
     */
    async getSchoolById(id) {
        return this.prisma.school.findUniqueOrThrow({
            where: { id },
            include: {
                address: true,
                secretary: true,
                responsibles: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    /**
     * Atualiza uma escola e/ou seu endereço.
     * @param {number} id
     * @param {object} data
     * @returns {Promise<import('@prisma/client').School>}
     */
    async updateSchool(id, data) {
        const { name, is_private, secretary_id, address: addressData } = data;

        return this.prisma.school.update({
            where: { id },
            data: {
                name,
                is_private,
                secretary_id,
                address: addressData ? { update: addressData } : undefined,
            },
            include: {
                address: true,
                secretary: true,
            },
        });
    }

    /**
     * Deleta uma escola e seu endereço associado de forma transacional.
     * @param {number} id - O ID da escola a ser deletada.
     * @returns {Promise<void>}
     */
    async deleteSchool(id) {
        return this.prisma.$transaction(async (prisma) => {
            const schoolToDelete = await prisma.school.findUnique({
                where: { id },
                select: { address_id: true },
            });

            if (!schoolToDelete) {
                throw new Error(`Escola com ID ${id} não encontrada.`);
            }

            await prisma.responsible.deleteMany({
                where: { school_id: id },
            });

            await prisma.school.delete({
                where: { id: id },
            });

            await prisma.address.delete({
                where: { id: schoolToDelete.address_id },
            });
        });
    }


    /**
     * Atualiza uma escola e todas as suas entidades relacionadas de forma transacional.
     * @param {number} id - O ID da escola a ser atualizada.
     * @param {object} data - Os novos dados para escola, endereço, responsável e usuário.
     */
    async updateFullSchool(id, data) {
        const { school, address, responsible, user } = data;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Busca a escola para obter os IDs relacionados (endereço, responsável, usuário)
            const existingSchool = await prisma.school.findUniqueOrThrow({
                where: { id },
                include: {
                    responsibles: true,
                },
            });

            const responsibleToUpdate = existingSchool.responsibles[0];
            if (!responsibleToUpdate) {
                throw new Error("Responsável principal não foi encontrado para esta escola.");
            }

            // 2. Atualiza os dados da escola
            await prisma.school.update({
                where: { id },
                data: {
                    name: school.name,
                    is_private: school.is_private,
                    secretary_id: school.is_private ? null : school.secretary_id,
                },
            });

            // 3. Atualiza o endereço
            await prisma.address.update({
                where: { id: existingSchool.address_id },
                data: address,
            });

            // 4. Atualiza o responsável
            await prisma.responsible.update({
                where: { id: responsibleToUpdate.id },
                data: {
                    name: responsible.name,
                    role: responsible.role,
                    phone: responsible.phone,
                    whatsapp: responsible.whatsapp,
                },
            });

            // 5. Prepara e atualiza os dados do usuário
            const userDataToUpdate = { email: user.email };
            // Se uma nova senha foi enviada, criptografa e adiciona ao objeto de atualização
            if (user.password && user.password.trim() !== '') {
                userDataToUpdate.password = await bcrypt.hash(user.password, 10);
            }

            await prisma.user.update({
                where: { id: responsibleToUpdate.user_id },
                data: userDataToUpdate,
            });

            // Retorna a escola com todos os dados atualizados para confirmar
            return this.getSchoolById(id);
        });
    }
}

module.exports = SchoolService;
