import { ipcMain } from 'electron';
import { AuthService } from '../../../backend/services/AuthService';
import logger from '../../../backend/utils/logger';

const authService = new AuthService();

// Helper para limpar objetos complexos do Prisma (Decimal, Date, etc)
// transformando-os em JSON puro que o Electron aceita
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function setupAuthIPC() {
  // Canal de Registro
  ipcMain.handle('auth:register', async (_, { name, email, password }) => {
    try {
      const user = await authService.register(name, email, password);
      // CORREÇÃO: Usamos serialize() aqui
      return { success: true, data: serialize(user) };
    } catch (error: any) {
      logger.error(`Register error: ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Canal de Login
  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      const user = await authService.login(email, password);
      // CORREÇÃO: Usamos serialize() aqui
      return { success: true, data: serialize(user) };
    } catch (error: any) {
      logger.error(`Login error: ${error.message} (Email: ${email})`);
      return { success: false, error: error.message };
    }
  });
}