import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock, Activity } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Chamada ao Backend via IPC
      const result = await window.api.auth.login({ email, password });
      
      if (result.success) {
        console.log('Login realizado:', result.data);
        // Aqui redirecionaremos para o Dashboard futuramente
      } else {
        setError(result.error || 'Erro ao realizar login');
      }
    } catch (err) {
      setError('Erro de conexão com o sistema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/40">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 text-white">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo ao PsyFlow</h1>
          <p className="text-gray-500 mt-2 text-sm">Gerencie sua clínica com tranquilidade</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <Input 
            label="E-mail Profissional" 
            type="email" 
            placeholder="seu@email.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} className="mt-2">
            Entrar no Sistema
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
            Esqueceu sua senha?
          </a>
        </div>
      </Card>
      
      <div className="fixed bottom-4 text-center text-xs text-gray-500/60">
        PsyFlow Desktop v1.0.0
      </div>
    </div>
  );
};