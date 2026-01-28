import { ipcMain } from 'electron';
import { SettingsService } from '../../../backend/services/SettingsService';
import logger from '../../../backend/utils/logger';

const settingsService = new SettingsService();

// Mesmo helper de serialização
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function setupSettingsIPC() {
  // Buscar Configurações
  ipcMain.handle('settings:get', async (_, userId) => {
    try {
      const data = await settingsService.getSettings(userId);
      return { success: true, data: serialize(data) };
    } catch (error: any) {
      logger.error(`Error fetching settings: ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Atualizar Configurações
  ipcMain.handle('settings:update', async (_, { userId, data }) => {
    try {
      const updated = await settingsService.updateSettings(userId, data);
      return { success: true, data: serialize(updated) };
    } catch (error: any) {
      logger.error(`Error updating settings: ${error.message}`);
      return { success: false, error: error.message };
    }
  });
}