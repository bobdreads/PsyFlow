import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Plus, Search, User, Phone, Trash2, Edit2 } from 'lucide-react';

interface PatientsProps {
  userId: string;
}

export const Patients: React.FC<PatientsProps> = ({ userId }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [saving, setSaving] = useState(false);

  // Carregar Pacientes
  const loadPatients = async () => {
    try {
      const result = await window.api.patients.list(userId);
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error("Erro ao listar pacientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [userId]);

  // CORREÇÃO 1: Função para abrir o modal limpando o estado anterior
  // Isso evita que o input venha "travado" ou com lixo de memória
  const openNewPatient = () => {
    setName('');
    setPhone('');
    setEmail('');
    setIsModalOpen(true);
  };

  // Criar Paciente
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await window.api.patients.create({
        userId,
        name,
        phone,
        email
      });
      
      if (result.success) {
        setIsModalOpen(false);
        loadPatients(); 
      } else {
        alert('Erro ao criar: ' + result.error);
      }
    } catch (err) {
      alert('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este paciente?')) return;
    
    // Pequeno delay para garantir que o foco voltou do confirm
    setTimeout(async () => {
        await window.api.patients.delete(id, userId);
        loadPatients();
    }, 100);
  };

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pacientes</h2>
          <p className="text-gray-500 text-sm">Gerencie seus prontuários</p>
        </div>
        
        <Button 
          className="w-fit! px-5 py-0 h-10 text-sm shadow-md hover:shadow-lg flex items-center gap-2" 
          onClick={openNewPatient} // Usa a nova função
        >
          <Plus size={18} /> 
          <span>Novo Paciente</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Carregando lista...</div>
      ) : patients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 border-white/40 bg-white/20">
          <div className="w-16 h-16 bg-purple-100/50 rounded-full flex items-center justify-center text-purple-400 mb-4 shadow-sm">
            <User size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-700">Nenhum paciente ainda</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
            Comece cadastrando seu primeiro paciente para iniciar os atendimentos.
          </p>
          
          <Button 
            className="w-fit! px-8 mx-auto" 
            onClick={openNewPatient}
          >
            Cadastrar Paciente
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-xl transition-shadow cursor-pointer group relative overflow-hidden border border-white/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg shadow-inner">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{patient.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      {patient.phone ? (
                        <><Phone size={10} /> {patient.phone}</>
                      ) : 'Sem telefone'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100/50 flex justify-between text-xs text-gray-400">
                <span>Cadastrado em {new Date(patient.createdAt).toLocaleDateString()}</span>
                <span className="text-purple-500 font-medium group-hover:underline">Ver Prontuário →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Novo Paciente"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-1">
          <Input 
            label="Nome Completo" 
            placeholder="Ex: Maria Oliveira" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={saving} // CORREÇÃO 2: Bloqueia enquanto salva
            autoFocus // CORREÇÃO 3: Força o foco ao abrir
          />
          <Input 
            label="Telefone / WhatsApp" 
            placeholder="(00) 00000-0000" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={saving}
          />
          <Input 
            label="E-mail (Opcional)" 
            placeholder="email@exemplo.com" 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={saving}
          />
          
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button 
              type="button" 
              className="w-fit! bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} className="w-fit! px-6">
              Salvar Paciente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};