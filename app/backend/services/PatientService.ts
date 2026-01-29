import { PatientRepository } from '../repositories/PatientRepository';
import { AppError } from '../utils/AppError';

const patientRepository = new PatientRepository();

interface CreatePatientDTO {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string; // Vem como string do frontend
  address?: string;
}

export class PatientService {
  async createPatient(data: CreatePatientDTO) {
    if (!data.name) {
      throw new AppError('O nome do paciente é obrigatório.');
    }

    // Conversão de data (string -> Date) se existir
    let formattedBirthDate = null;
    if (data.birthDate) {
      formattedBirthDate = new Date(data.birthDate);
    }

    return await patientRepository.create({
      user: { connect: { id: data.userId } }, // Conecta ao usuário logado
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      birthDate: formattedBirthDate,
      address: data.address,
    });
  }

  async listPatients(userId: string) {
    return await patientRepository.findAllActive(userId);
  }

  async updatePatient(id: string, userId: string, data: Partial<CreatePatientDTO>) {
     // Tratamento de data na edição também
     let updateData: any = { ...data };
     if (data.birthDate) {
       updateData.birthDate = new Date(data.birthDate);
     }
     delete updateData.userId; // Não deixamos mudar o dono

     return await patientRepository.update(id, userId, updateData);
  }

  async deletePatient(id: string, userId: string) {
    return await patientRepository.delete(id, userId);
  }
}