import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class SettingsRepository {
  async findByUserId(userId: string) {
    return await prisma.settings.findUnique({
      where: { userId },
    })
  }

  async update(userId: string, data: Prisma.SettingsUpdateInput) {
    return await prisma.settings.update({
      where: { userId },
      data,
    })
  }
}
