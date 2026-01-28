import { PrismaClient, User, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  // Cria usuário e configurações padrão em uma transação atômica
  async create(data: Prisma.UserCreateInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Cria o usuário
      const user = await tx.user.create({
        data,
      });

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

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { settings: true }, // Já traz as configs
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: { settings: true },
    });
  }
}