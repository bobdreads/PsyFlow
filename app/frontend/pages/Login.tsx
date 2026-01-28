import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock, Activity, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Lógica de Cadastro
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        
        if (password.length < 6) {
          throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }

        const result = await window.api.auth.register({ name, email, password });
        
        if (result.success) {
          // Cadastro feito com sucesso, já loga o usuário
          onLoginSuccess(result.data);
        } else {
          setError(result.error || 'Erro ao criar conta.');
        }

      } else {
        // Lógica de Login
        const result = await window.api.auth.login({ email, password });
        
        if (result.success) {
          onLoginSuccess(result.data);
        } else {
          setError(result.error || 'E-mail ou senha inválidos.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o sistema.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setName('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-500">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/40">
        
        {/* Header Animado */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 text-white transform transition-transform duration-300 hover:scale-105 hover:rotate-3">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {isRegistering ? 'Crie sua conta' : 'Bem-vindo ao PsyFlow'}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isRegistering 
              ? 'Comece a gerenciar sua clínica hoje mesmo' 
              : 'Gerencie sua clínica com tranquilidade'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          
          {/* Campo Nome (Só aparece no cadastro) */}
          {isRegistering && (
            <div className="animate-fade-in-down">
              <Input 
                label="Nome Completo" 
                type="text" 
                placeholder="Ex: Dr. João Silva"
                icon={<User size={18} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <Input 
            label="E-mail Profissional" 
            type="email" 
            placeholder="seu@email.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Campo Confirmar Senha (Só aparece no cadastro) */}
          {isRegistering && (
            <div className="animate-fade-in-up">
              <Input 
                label="Confirmar Senha" 
                type="password" 
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 text-sm rounded-lg text-center shadow-sm animate-shake">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} className="mt-4 group">
            <span className="mr-2">{isRegistering ? 'Criar Conta' : 'Entrar no Sistema'}</span>
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 pt-6 border-t border-gray-200/30 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}
            <button 
              type="button"
              onClick={toggleMode}
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors hover:underline focus:outline-none"
            >
              {isRegistering ? 'Fazer Login' : 'Cadastre-se gratuitamente'}
            </button>
          </p>
        </div>
      </Card>
      
      <div className="fixed bottom-4 text-center text-xs text-gray-500/60 font-medium tracking-wide">
        PsyFlow Desktop v1.0.0 • Feito para Psicólogos
      </div>
    </div>
  );
};