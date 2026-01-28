"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../lib/prisma"); // ← IMPORTA AQUI!
class UserRepository {
    // Cria usuário e configurações padrão em uma transação atômica
    async create(data) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Cria o usuário
            const user = await tx.user.create({ data });
            // 2. Cria as configurações padrão imediatamente
            await tx.settings.create({
                data: {
                    userId: user.id,
                    timezone: 'America/Sao_Paulo',
                    currency: 'BRL',
                    theme: 'light',
                },
            });
            return user;
        });
    }
    async findByEmail(email) {
        return await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { settings: true }, // Já traz as configs
        });
    }
    async findById(id) {
        return await prisma_1.prisma.user.findUnique({
            where: { id },
            include: { settings: true },
        });
    }
}
exports.UserRepository = UserRepository;
