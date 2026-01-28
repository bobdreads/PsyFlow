import { SettingsRepository } from '../repositories/SettingsRepository';
import { AppError } from '../utils/AppError';

const settingsRepository = new SettingsRepository();

export class SettingsService {
  async getSettings(userId: string) {
    const settings = await settingsRepository.findByUserId(userId);
    
    if (!settings) {
      throw new AppError('Configurações não encontradas para este usuário.', 404);
    }
    
    return settings;
  }

  async updateSettings(userId: string, data: any) {
    // Aqui poderíamos validar fuso horário ou moeda se necessário
    if (data.defaultSessionValue && Number(data.defaultSessionValue) < 0) {
      throw new AppError('O valor padrão da sessão não pode ser negativo.');
    }

    return await settingsRepository.update(userId, data);
  }
}