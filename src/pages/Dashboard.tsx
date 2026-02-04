import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Users, PieChart, Calendar, LogOut } from 'lucide-react';
import { Patients } from './Patients';
import { PatientDetails } from './PatientDetails'; // Importe a nova tela

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type View = 'home' | 'patients' | 'calendar';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPatient, setSelectedPatient] = useState<any>(null); // Estado para o paciente selecionado

  // Função para navegar para os detalhes
  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    // Não precisamos mudar currentView se controlarmos a renderização condicionalmente abaixo
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
  };

  // Menu Lateral
  const MenuLink = ({ view, icon: Icon, label }: any) => (
    <button
      onClick={() => { setCurrentView(view); setSelectedPatient(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === view && !selectedPatient ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-600 hover:bg-white/40'}`}
    >
      <Icon size={20} /> <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-white/30 backdrop-blur-xl border-r border-white/50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
           <span className="font-bold text-gray-800 text-lg">PsyFlow</span>
        </div>
        <nav className="flex-1 space-y-2">
          <MenuLink view="home" icon={PieChart} label="Visão Geral" />
          <MenuLink view="patients" icon={Users} label="Pacientes" />
          <MenuLink view="calendar" icon={Calendar} label="Agenda" />
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-200/30">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">{user.name.charAt(0)}</div>
             <p className="text-sm font-bold text-gray-700 truncate">{user.name}</p>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm"><LogOut size={16} /> Sair</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8 relative">
        {/* LÓGICA DE NAVEGAÇÃO */}
        
        {/* 1. Detalhes do Paciente (Sobrepõe a lista se houver selecionado) */}
        {selectedPatient ? (
           <PatientDetails 
              patient={selectedPatient} 
              user={user} 
              onBack={handleBackToPatients} 
           />
        ) : (
           /* 2. Lista de Pacientes */
           currentView === 'patients' ? (
              <Patients userId={user.id} onSelectPatient={handleSelectPatient} />
           ) : 
           /* 3. Home */
           currentView === 'home' ? (
              <div className="animate-fade-in">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card><h3 className="opacity-80 text-sm">Sessões Hoje</h3><p className="text-3xl font-bold mt-1">0</p></Card>
                 </div>
              </div>
           ) : (
             <div className="flex items-center justify-center h-full text-gray-400">Em breve</div>
           )
        )}
      </main>
    </div>
  );
};