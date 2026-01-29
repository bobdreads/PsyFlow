import { api } from '../services/api';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { User, LogOut, Settings as SettingsIcon, Users, PieChart, Calendar } from 'lucide-react';
import { Patients } from './Patients'; // Importa a página que criamos

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type View = 'home' | 'patients' | 'financial' | 'calendar';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [settings, setSettings] = useState<any>(null);

  // Carregar Configurações
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.id) {
        const result = await api.settings.get(user.id);
        if (result.success) setSettings(result.data);
      }
    };
    loadSettings();
  }, [user]);

  // Menu Lateral
  const MenuLink = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${currentView === view 
          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
          : 'text-gray-600 hover:bg-white/40 hover:text-purple-700'}
      `}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/30 backdrop-blur-xl border-r border-white/50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-linear-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
            PF
          </div>
          <span className="font-bold text-gray-800 text-lg tracking-tight">PsyFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <MenuLink view="home" icon={PieChart} label="Visão Geral" />
          <MenuLink view="patients" icon={Users} label="Pacientes" />
          <MenuLink view="calendar" icon={Calendar} label="Agenda" />
          {/* Financeiro virá na Fase 3 */}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">Psicólogo(a)</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-auto p-8 relative">
        {/* Renderização Condicional das Telas */}
        {currentView === 'patients' && <Patients userId={user.id} />}
        
        {currentView === 'home' && (
          <div className="animate-fade-in">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="bg-linear-to-br from-purple-500 to-indigo-500 text-white border-none">
                 <h3 className="opacity-80 text-sm">Sessões Hoje</h3>
                 <p className="text-3xl font-bold mt-1">0</p>
               </Card>
               <Card>
                 <h3 className="text-gray-500 text-sm">Pacientes Ativos</h3>
                 <p className="text-3xl font-bold text-gray-800 mt-1">
                   {/* Futuramente conectaremos isso ao count do banco */}
                   -
                 </p>
               </Card>
             </div>
             
             {/* Atalho Rápido */}
             <div className="mt-8">
               <h3 className="text-lg font-medium text-gray-700 mb-4">Acesso Rápido</h3>
               <button 
                onClick={() => setCurrentView('patients')}
                className="flex flex-col items-center justify-center w-32 h-32 bg-white/40 border border-white/60 rounded-xl hover:bg-white/60 transition-all gap-2 text-purple-600 hover:shadow-lg"
               >
                 <Users size={24} />
                 <span className="text-sm font-medium">Pacientes</span>
               </button>
             </div>
          </div>
        )}

        {currentView === 'calendar' && (
           <div className="flex items-center justify-center h-full text-gray-400">
             <p>Agenda será implementada na Fase 2.2</p>
           </div>
        )}
      </main>
    </div>
  );
};