import { PrismaClient, Settings, prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prisma = new PrismaClient();

export class SettingsRepository {
  // Busca as configurações pelo ID do usuário
  async findByUserId(userId: string) {
    return await prisma.settings.findUnique({
      where: { userId },
    });
  }

  // Atualiza as configurações
  async update(userId: string, data: Prisma.SettingsUpdateInput) {
    return await prisma.settings.update({
      where: { userId },
      data,
    });
  }
}