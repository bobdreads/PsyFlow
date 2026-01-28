import logger from './utils/logger';

export function initBackend() {
  try {
    logger.info('Backend services starting...');

    // Aqui futuramente inicializaremos os handlers de IPC (Eventos)
    // Ex: setupIpcHandlers();

    logger.info('Backend services initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize backend:', error);
    throw error;
  }
}