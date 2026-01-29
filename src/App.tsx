import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import './assets/global.css';

const App: React.FC = () => {
  // Estado simples de "Rotas"
  // null = carregando, false = login, Object = logado
  const [user, setUser] = useState<any>(null);

  const handleLoginSuccess = (userData: any) => {
    console.log("Usuário logado:", userData);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    // Aqui poderíamos limpar tokens se estivéssemos usando JWT
  };

  return (
    <main className="text-gray-800 h-screen overflow-auto bg-gradient-to-br from-[#F6C1E1] via-[#DCCBFF] to-[#CFE9FF]">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
};

export default App;