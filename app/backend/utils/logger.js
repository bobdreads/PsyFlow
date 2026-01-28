"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
// Define o caminho dos logs dependendo do SO (AppData/Roaming, etc.)
// Nota: Em dev, pode querer logar na raiz, mas em prod deve ser no userData
const logPath = process.env.NODE_ENV === 'development'
    ? path_1.default.join(process.cwd(), 'logs')
    : path_1.default.join(electron_1.app.getPath('userData'), 'logs');
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: { service: 'psyflow-backend' },
    transports: [
        // Escreve todos os erros em error.log
        new winston_1.default.transports.File({ filename: path_1.default.join(logPath, 'error.log'), level: 'error' }),
        // Escreve tudo em combined.log
        new winston_1.default.transports.File({ filename: path_1.default.join(logPath, 'combined.log') }),
    ],
});
// Se não estiver em produção, loga também no console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
}
exports.default = logger;
