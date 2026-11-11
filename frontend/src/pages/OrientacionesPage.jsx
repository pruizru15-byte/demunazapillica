import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { HelpCircle, Plus, User, ArrowUpRight, Search } from 'lucide-react';

export const OrientacionesPage = () => {
  const navigate = useNavigate();
  const [orientaciones, setOrientaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    dni: '',
    names: '',
    surnames: '',
    phone: '',
    address: '',
    age: '',
    ageUnit: 'año',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  const fetchOrientaciones = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.ORIENTACIONES);
      if (res.data?.success) {
        setOrientaciones(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar orientaciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrientaciones();
  }, []);

  const handleDniLookup = async (dniVal) => {
    if (dniVal.length !== 8) return;
    try {
      const res = await apiClient.get(ENDPOINTS.PERSONA_DNI(dniVal));
      if (res.data?.success && res.data.data.names) {
        setForm(prev => ({
          ...prev,
          names: res.data.data.names,
          surnames: res.data.data.surnames
        }));
      }
    } catch (err) {
      console.log("Error consulta DNI", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(ENDPOINTS.ORIENTACIONES, form);
      setIsModalOpen(false);
      setForm({ dni: '', names: '', surnames: '', phone: '', address: '', age: '', ageUnit: 'año', reason: '', date: new Date().toISOString().split('T')[0] });
      fetchOrientaciones();
    } catch (err) {
      alert("Error al registrar orientación");
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToCase = (item) => {
    // Redirigir a apertura de caso con datos prellenados
    navigate('/expedientes/nuevo', {
      state: {
        initialSubject: item.reason,
        initialInformant: {
          dni: item.dni,
          names: item.personName,
          phone: item.phone,
          address: item.address
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Orientaciones y Consultas Rápidas</h1>
          <p className="text-xs text-slate-500 font-medium">Atención express a ciudadanos que no requieren apertura inicial de expediente</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="shadow-md shadow-sky-600/20">
          <Plus className="w-4 h-4 mr-2" /> Nueva Orientación
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
          </div>
        ) : orientaciones.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12">No hay atenciones de orientación registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Ciudadano Solicitante</th>
                  <th className="py-3 px-4">Motivo / Asesoría</th>
                  <th className="py-3 px-4">Atendido Por</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orientaciones.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{o.date}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{o.personName}</p>
                      <span className="text-[10px] text-slate-400">DNI: {o.dni || '-'} | Cel: {o.phone || '-'}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                      {o.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{o.workerName}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handlePromoteToCase(o)}
                        className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline"
                        title="Promover a Expediente Formal"
                      >
                        Abrir Caso <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Nueva Orientación */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Orientación Ciudadana">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">DNI (Opcional)</label>
              <input
                type="text"
                maxLength="8"
                value={form.dni}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, dni: val });
                  handleDniLookup(val);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="8 dígitos"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombres *</label>
              <input
                type="text"
                required
                value={form.names}
                onChange={(e) => setForm({ ...form, names: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Apellidos *</label>
              <input
                type="text"
                required
                value={form.surnames}
                onChange={(e) => setForm({ ...form, surnames: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección / Lugar de Procedencia</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Motivo de Consulta y Orientación Brindada *</label>
            <textarea
              required
              rows="3"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="Describa la consulta ciudadana y la orientación legal/social brindada..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar Orientación</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

