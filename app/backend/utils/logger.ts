import winston from 'winston';
import path from 'path';
import { app } from 'electron';

// Define o caminho dos logs dependendo do SO (AppData/Roaming, etc.)
// Nota: Em dev, pode querer logar na raiz, mas em prod deve ser no userData
const logPath = process.env.NODE_ENV === 'development'
  ? path.join(process.cwd(), 'logs')
  : path.join(app.getPath('userData'), 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'psyflow-backend' },
  transports: [
    // Escreve todos os erros em error.log
    new winston.transports.File({ filename: path.join(logPath, 'error.log'), level: 'error' }),
    // Escreve tudo em combined.log
    new winston.transports.File({ filename: path.join(logPath, 'combined.log') }),
  ],
});

// Se não estiver em produção, loga também no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;