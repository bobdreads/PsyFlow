import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // Busca as configurações assim que carrega (Teste da Fase 1.2)
    const loadSettings = async () => {
      if (user?.id) {
        try {
          const result = await window.api.settings.get(user.id);
          if (result.success) {
            setSettings(result.data);
          }
        } catch (error) {
          console.error("Erro ao carregar settings:", error);
        }
      }
    };
    loadSettings();
  }, [user]);

  return (
    <div className="min-h-screen p-8 flex flex-col gap-6">
      {/* Header Glass */}
      <Card className="flex justify-between items-center py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <User size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Olá, {user?.name}</h2>
            <p className="text-xs text-gray-500">Psicólogo(a)</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600" title="Configurações">
             <SettingsIcon size={20} />
           </button>
           <button onClick={onLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Sair">
             <LogOut size={20} />
           </button>
        </div>
      </Card>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Resumo Financeiro</h3>
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300/50 rounded-xl bg-gray-50/30">
            <span className="text-gray-400 text-sm">Gráfico em breve (Fase 5)</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Próximas Sessões</h3>
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300/50 rounded-xl bg-gray-50/30">
            <span className="text-gray-400 text-sm">Lista em breve (Fase 2)</span>
          </div>
        </Card>
      </div>

      {/* Debug Area (Para validar Fase 1.2) */}
      <div className="mt-auto">
        <p className="text-xs font-mono text-gray-400 mb-1 ml-2">DEBUG: Settings Carregadas (Fase 1.2)</p>
        <Card className="bg-black/5 p-4 font-mono text-xs text-gray-600 overflow-auto">
          <pre>{JSON.stringify(settings, null, 2)}</pre>
        </Card>
      </div>
    </div>
  );
};