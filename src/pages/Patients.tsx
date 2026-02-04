import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Plus, User, Phone, Trash2, Edit2 } from 'lucide-react';

interface PatientsProps {
  userId: string;
  onSelectPatient: (patient: any) => void;
}

export const Patients: React.FC<PatientsProps> = ({ userId, onSelectPatient }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null); // Se tiver algo aqui, é Edição
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPatients = async () => {
    try {
      const result = await api.patients.list(userId);
      if (result.success) setPatients(result.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadPatients(); }, [userId]);

  // Abre modal vazio para criar
  const openNewPatient = () => {
    setEditingPatient(null);
    setName(''); setPhone(''); setEmail('');
    setIsModalOpen(true);
  };

  // Abre modal preenchido para editar
  const openEditPatient = (e: React.MouseEvent, patient: any) => {
    e.stopPropagation(); // Não abrir o prontuário ao clicar no lápis
    setEditingPatient(patient);
    setName(patient.name);
    setPhone(patient.phone || '');
    setEmail(patient.email || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPatient) {
        // EDIÇÃO
        await api.patients.update(editingPatient.id, { name, phone, email });
      } else {
        // CRIAÇÃO
        await api.patients.create({ userId, name, phone, email });
      }
      setIsModalOpen(false);
      loadPatients();
    } catch (err) { alert('Erro ao salvar'); } 
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    await api.patients.delete(id, userId);
    loadPatients();
  };

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pacientes</h2>
          <p className="text-gray-500 text-sm">Gerencie seus prontuários</p>
        </div>
        <Button className="w-fit! px-5 py-0 h-10 text-sm flex items-center gap-2" onClick={openNewPatient}>
          <Plus size={18} /> <span>Novo Paciente</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Carregando...</div>
      ) : patients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-white/40">
          <User size={32} className="text-purple-300 mb-4" />
          <h3 className="text-gray-600 mb-4">Nenhum paciente ainda</h3>
          <Button className="w-fit px-6" onClick={openNewPatient}>Cadastrar Primeiro</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patients.map((patient) => (
            <Card 
                key={patient.id} 
                onClick={() => onSelectPatient(patient)}
                className="hover:shadow-xl transition-shadow cursor-pointer group relative border border-white/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{patient.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    {patient.phone ? <><Phone size={10} /> {patient.phone}</> : 'Sem telefone'}
                  </p>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Botão Editar */}
                <button 
                  onClick={(e) => openEditPatient(e, patient)}
                  className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                {/* Botão Excluir */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100/50 flex justify-between text-xs text-gray-400">
                <span>Desde {new Date(patient.createdAt).toLocaleDateString()}</span>
                <span className="text-purple-500 font-medium group-hover:underline">Ver Prontuário →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Reutilizável */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPatient ? "Editar Paciente" : "Novo Paciente"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <Input label="Nome" required value={name} onChange={(e:any) => setName(e.target.value)} disabled={saving} />
          <Input label="Telefone" value={phone} onChange={(e:any) => setPhone(e.target.value)} disabled={saving} />
          <Input label="Email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} disabled={saving} />
          
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" className="w-fit bg-gray-100 text-gray-600" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={saving} className="w-fit">
               {editingPatient ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};