import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';
import { z } from 'zod'; // Vamos usar zod para validar dados (opcional, mas recomendado)

// Se não tiver zod instalado, pode validar com ifs normais, 
// mas recomendo: npm install zod
const userRepository = new UserRepository();

export class AuthService {
  
  // REGISTRO DE USUÁRIO (PRIMEIRO ACESSO)
  async register(name: string, email: string, password: string) {
    // 1. Validações básicas
    if (!email || !password || !name) {
      throw new AppError('Nome, email e senha são obrigatórios.');
    }

    // 2. Verifica se já existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Este e-mail já está cadastrado.');
    }

    // 3. Hash da senha (Segurança)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

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
  async login(email: string, password: string) {
    // 1. Busca usuário
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    // 2. Compara a senha enviada com o hash no banco
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    // 3. Retorna usuário (sem senha) e configurações
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}