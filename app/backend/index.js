"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBackend = initBackend;
const logger_1 = __importDefault(require("./utils/logger"));
function initBackend() {
    try {
        logger_1.default.info('Backend services starting...');
        // Aqui futuramente inicializaremos os handlers de IPC (Eventos)
        // Ex: setupIpcHandlers();
        logger_1.default.info('Backend services initialized successfully.');
    }
    catch (error) {
        logger_1.default.error('Failed to initialize backend:', error);
        throw error;
    }
}
