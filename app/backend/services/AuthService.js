"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserRepository_1 = require("../repositories/UserRepository");
const AppError_1 = require("../utils/AppError");
// Se não tiver zod instalado, pode validar com ifs normais, 
// mas recomendo: npm install zod
const userRepository = new UserRepository_1.UserRepository();
class AuthService {
    // REGISTRO DE USUÁRIO (PRIMEIRO ACESSO)
    async register(name, email, password) {
        // 1. Validações básicas
        if (!email || !password || !name) {
            throw new AppError_1.AppError('Nome, email e senha são obrigatórios.');
        }
        // 2. Verifica se já existe
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError_1.AppError('Este e-mail já está cadastrado.');
        }
        // 3. Hash da senha (Segurança)
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // 4. Criação
        const user = await userRepository.create({
            name,
            email,
            passwordHash,
        });
        // Remove o hash do retorno para não vazar
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    // LOGIN
    async login(email, password) {
        // 1. Busca usuário
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError_1.AppError('E-mail ou senha inválidos.', 401);
        }
        // 2. Compara a senha enviada com o hash no banco
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError_1.AppError('E-mail ou senha inválidos.', 401);
        }
        // 3. Retorna usuário (sem senha) e configurações
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.AuthService = AuthService;
