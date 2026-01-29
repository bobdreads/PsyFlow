import { ipcMain } from 'electron';
import { PatientService } from '../../../backend/services/PatientService';
import logger from '../../../backend/utils/logger';

const patientService = new PatientService();

// Helper de Serialização (Evita erro de clone)
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function setupPatientIPC() {
  // Criar
  ipcMain.handle('patients:create', async (_, data) => {
    try {
      const patient = await patientService.createPatient(data);
      return { success: true, data: serialize(patient) };
    } catch (error: any) {
      logger.error(`Error creating patient: ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Listar
  ipcMain.handle('patients:list', async (_, userId) => {
    try {
      const patients = await patientService.listPatients(userId);
      return { success: true, data: serialize(patients) };
    } catch (error: any) {
      logger.error(`Error listing patients: ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Excluir
  ipcMain.handle('patients:delete', async (_, { id, userId }) => {
    try {
      await patientService.deletePatient(id, userId);
      return { success: true };
    } catch (error: any) {
      logger.error(`Error deleting patient: ${error.message}`);
      return { success: false, error: error.message };
    }
  });
  
  // Aqui poderíamos adicionar o update também...
}