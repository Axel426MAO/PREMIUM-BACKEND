'use strict';

class SecretaryService {
    /**
     * @param {import('@prisma/client').PrismaClient} prisma
     */
    constructor(prisma) {
        this.prisma = prisma;
    }

    /**
     * Cria uma nova secretaria e seu endereço de forma transacional.
     * @param {object} data - Dados da secretaria e do endereço.
     * @returns {Promise<import('@prisma/client').Secretary>}
     */
    async createSecretary(data) {
        const { name, is_state_level, municipality, state, address: addressData } = data;

        if (!addressData) {
            throw new Error('Os dados do endereço são obrigatórios para criar uma secretaria.');
        }

        return this.prisma.$transaction(async (prisma) => {
            const newAddress = await prisma.address.create({
                data: addressData,
            });

            const newSecretary = await prisma.secretary.create({
                data: {
                    name,
                    is_state_level,
                    municipality,
                    state,
                    address: {
                        connect: { id: newAddress.id },
                    },
                },
                include: {
                    address: true,
                },
            });

            return newSecretary;
        });
    }

    /**
     * Retorna todas as secretarias, incluindo seus endereços e responsáveis com os usuários aninhados.
     * @returns {Promise<import('@prisma/client').Secretary[]>}
     */
    async getAllSecretaries() {
        return this.prisma.secretary.findMany({
            include: {
                address: true,
                responsibles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                status: true
                            }
                        }
                    }
                },
            },
        });
    }

    /**
     * Busca uma secretaria por ID, incluindo seu endereço e responsáveis com os usuários aninhados.
     * @param {number} id
     * @returns {Promise<import('@prisma/client').Secretary>}
     */
    async getSecretaryById(id) {
        return this.prisma.secretary.findUniqueOrThrow({
            where: { id },
            include: {
                address: true,
                responsibles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                status: true
                            }
                        }
                    }
                },
            },
        });
    }

    /**
     * Atualiza uma secretaria e/ou seu endereço.
     * @param {number} id
     * @param {object} data
     * @returns {Promise<import('@prisma/client').Secretary>}
     */
    async updateSecretary(id, data) {
        const { name, is_state_level, municipality, state, address: addressData } = data;

        return this.prisma.secretary.update({
            where: { id },
            data: {
                name,
                is_state_level,
                municipality,
                state,
                address: addressData ? { update: addressData } : undefined,
            },
            include: {
                address: true,
            },
        });
    }

    /**
     * Deleta uma secretaria e todos os seus dados vinculados (responsáveis, usuários, endereço)
     * de forma transacional.
     * @param {number} id - O ID da secretaria a ser deletada.
     * @returns {Promise<void>}
     */
    async deleteSecretary(id) {
        return this.prisma.$transaction(async (prisma) => {
            // 1. Encontra a secretaria e os IDs dos usuários vinculados aos responsáveis.
            const secretaryToDelete = await prisma.secretary.findUnique({
                where: { id },
                include: {
                    responsibles: {
                        select: {
                            user_id: true,
                        },
                    },
                },
            });

            if (!secretaryToDelete) {
                // Lança um erro se a secretaria não for encontrada, o que será pego pelo controller.
                throw new Error(`Secretaria com ID ${id} não encontrada.`);
            }

            const userIdsToDelete = secretaryToDelete.responsibles.map(r => r.user_id);
            const addressIdToDelete = secretaryToDelete.address_id;

            // 2. Deleta todos os registros de 'Responsible' ligados à secretaria.
            await prisma.responsible.deleteMany({
                where: { secretary_id: id },
            });

            // 3. Deleta a própria secretaria.
            await prisma.secretary.delete({
                where: { id: id },
            });

            // 4. Deleta os usuários que estavam vinculados aos responsáveis.
            if (userIdsToDelete.length > 0) {
                await prisma.user.deleteMany({
                    where: {
                        id: {
                            in: userIdsToDelete,
                        },
                    },
                });
            }

            // 5. Deleta o endereço que estava vinculado à secretaria.
            if (addressIdToDelete) {
                await prisma.address.delete({
                    where: {
                        id: addressIdToDelete,
                    },
                });
            }
        });
    }
}

module.exports = SecretaryService;
