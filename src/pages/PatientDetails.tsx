import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ArrowLeft, Calendar, FileText, Edit2, Trash2 } from 'lucide-react';

// Define Types for better safety
interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface PatientDetailsProps {
  patient: Patient;
  user: User;
  onBack: () => void;
}

interface Session {
  id: string;
  startTime: string;
  endTime: string; // Adicionado
  value: number;
  notes?: string;
  status: string;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, user, onBack }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [saving, setSaving] = useState(false);

  // Form States
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('scheduled');

  // Load Sessions
  const loadSessions = async () => {
    try {
      const result = await api.sessions.list(patient.id);
      if (result.success && result.data) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [patient.id]);

  // Abrir Modal para NOVA sessão (Limpa os campos)
  const openNewSession = () => {
    setEditingSession(null);
    setDate(''); 
    setStartTime(''); 
    setEndTime(''); 
    setValue(''); 
    setNotes(''); 
    setStatus('scheduled');
    setIsModalOpen(true);
  };

  // Abrir Modal para EDITAR sessão (Preenche os campos)
  const openEditSession = (session: Session) => {
    setEditingSession(session);
    
    const startObj = new Date(session.startTime);
    const endObj = new Date(session.endTime);
    
    // Formata para os inputs HTML (YYYY-MM-DD e HH:MM)
    setDate(startObj.toISOString().split('T')[0]);
    setStartTime(startObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setEndTime(endObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    
    setValue(session.value.toString());
    setNotes(session.notes || '');
    setStatus(session.status);
    
    setIsModalOpen(true);
  };

  // Excluir Sessão
  const handleDeleteSession = async (id: string) => {
    if(!confirm("Tem certeza que deseja apagar essa sessão?")) return;
    try {
        await api.sessions.delete(id);
        loadSessions();
    } catch (error) {
        alert('Erro ao excluir sessão');
    }
  };

  // Salvar (Criar ou Editar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const startIso = new Date(`${date}T${startTime}`).toISOString();
    const endIso = new Date(`${date}T${endTime}`).toISOString();

    const payload = {
        userId: user.id,
        patientId: patient.id,
        startTime: startIso,
        endTime: endIso,
        notes,
        value: parseFloat(value) || 0,
        status
    };

    try {
      let result;
      if (editingSession) {
         // Atualizar existente
         result = await api.sessions.update(editingSession.id, payload);
      } else {
         // Criar nova
         result = await api.sessions.create(payload);
      }

      if (result.success) {
        setIsModalOpen(false);
        loadSessions();
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao salvar sessão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
          <p className="text-gray-500 text-sm flex gap-3">
             <span>{patient.phone || 'Sem telefone'}</span>
             <span>•</span>
             <span>{patient.email || 'Sem email'}</span>
          </p>
        </div>
        <div className="ml-auto">
           <Button className="w-fit px-4" onClick={openNewSession}>
             <Calendar size={18} className="mr-2" /> Agendar Sessão
           </Button>
        </div>
      </div>

      {/* Sessions List */}
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        <FileText size={20} /> Histórico de Sessões
      </h3>

      {loading ? (
        <p className="text-gray-400">Carregando sessões...</p>
      ) : sessions.length === 0 ? (
        <Card className="py-12 text-center text-gray-400 bg-gray-50/50 border-dashed">
           Nenhuma sessão registrada para este paciente.
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const startDate = new Date(session.startTime);
            return (
              <Card key={session.id} className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:shadow-md transition-shadow group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex flex-col items-center justify-center text-purple-700 font-bold leading-tight">
                       <span className="text-sm">{startDate.getDate()}</span>
                       <span className="text-[10px] uppercase">{startDate.toLocaleString('pt-BR', { month: 'short' })}</span>
                    </div>
                    <div>
                       <p className="font-bold text-gray-800 flex items-center gap-2">
                         {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                         <span className="text-gray-300 text-xs">|</span>
                         <span className="text-gray-500 font-normal text-sm">R$ {session.value.toFixed(2)}</span>
                       </p>
                       <p className="text-sm text-gray-500 mt-1 max-w-lg truncate">
                         {session.notes || 'Sem anotações'}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      session.status === 'canceled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {session.status === 'scheduled' ? 'Agendada' : 
                       session.status === 'completed' ? 'Realizada' : 'Cancelada'}
                    </span>

                    {/* Botões de Ação (Aparecem ao passar o mouse) */}
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => openEditSession(session)} 
                            className="p-2 text-blue-400 hover:bg-blue-50 rounded transition-colors" 
                            title="Editar"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={() => handleDeleteSession(session.id)} 
                            className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors" 
                            title="Excluir"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                 </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal (Criar ou Editar) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSession ? "Editar Sessão" : "Agendar Sessão"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
           <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Data" 
                // @ts-ignore 
                type="date" 
                required 
                value={date} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              />
              <Input 
                label="Valor (R$)" 
                // @ts-ignore
                type="number" 
                placeholder="0.00"
                value={value} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Início" 
                // @ts-ignore
                type="time" 
                required 
                value={startTime} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
              />
              <Input 
                label="Fim" 
                // @ts-ignore
                type="time" 
                required 
                value={endTime} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
              />
           </div>
           
           {/* Seletor de Status */}
           <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700 text-sm"
                >
                    <option value="scheduled">Agendada</option>
                    <option value="completed">Realizada</option>
                    <option value="canceled">Cancelada</option>
                </select>
           </div>

           <Input 
              label="Anotações / Planejamento" 
              placeholder="O que será trabalhado?"
              value={notes} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
           />

           <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
             <Button type="button" className="w-fit bg-gray-100 text-gray-600" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
             <Button type="submit" isLoading={saving} className="w-fit">
                {editingSession ? 'Salvar Alterações' : 'Agendar'}
             </Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};