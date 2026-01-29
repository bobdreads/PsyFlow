import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class PatientRepository {
  // Cria um novo paciente
  async create(data: Prisma.PatientCreateInput) {
    return await prisma.patient.create({
      data,
    });
  }

  // Lista pacientes de um usuário (apenas os ativos)
  async findAllActive(userId: string) {
    return await prisma.patient.findMany({
      where: {
        userId,
        deletedAt: null, // Regra do Soft Delete
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Busca um paciente específico (garantindo que pertence ao usuário)
  async findById(id: string, userId: string) {
    return await prisma.patient.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
  }

  // Atualiza dados
  async update(id: string, userId: string, data: Prisma.PatientUpdateInput) {
    return await prisma.patient.updateMany({
      where: {
        id,
        userId, // Garante segurança (só atualiza se for do dono)
      },
      data,
    });
  }

  // Soft Delete (Marca data de exclusão)
  async delete(id: string, userId: string) {
    return await prisma.patient.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}