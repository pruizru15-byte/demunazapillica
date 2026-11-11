import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  ArrowLeft,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  Scale,
  Shield,
  Heart,
  UserCheck,
  Building2,
  AlertTriangle,
  RotateCcw,
  Eye,
  X,
  History,
  Check,
  Send,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

export const ExpedienteDetallePage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [actTypes, setActTypes] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Modal Nueva Acta
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [actForm, setActForm] = useState({
    typeId: 1,
    title: '',
    actNumber: '',
    actDate: new Date().toISOString().split('T')[0]
  });
  const [savingAct, setSavingAct] = useState(false);

  // Modal Previsualizar Acta Oficial para Imprimir
  const [previewAct, setPreviewAct] = useState(null);

  // Modal Agendar Evento / Cita
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    type: 'Invitación a Audiencia',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00:00'
  });
  const [savingEvent, setSavingEvent] = useState(false);

  // Modal Registrar Pago de Pensión
  const [payingItem, setPayingItem] = useState(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchDetail = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.EXPEDIENTE_DETAIL(id));
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar expediente", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    apiClient.get(ENDPOINTS.ACTA_TYPES).then(res => {
      if (res.data?.success) setActTypes(res.data.data);
    });
  }, [id]);

  // Cambiar estado procesal en tiempo real
  const handleStatusChange = async (newStatusId) => {
    try {
      await apiClient.put(ENDPOINTS.EXPEDIENTE_STATUS(id), { statusId: newStatusId });
      showToast("Estado procesal actualizado correctamente.");
      fetchDetail();
    } catch (err) {
      showToast("Error al actualizar estado procesal.");
    }
  };

  // Guardar nueva acta
  const handleSaveAct = async (e) => {
    e.preventDefault();
    setSavingAct(true);
    try {
      await apiClient.post(ENDPOINTS.ACTAS_STORE, {
        ...actForm,
        expedienteId: id
      });
      setIsActModalOpen(false);
      setActForm({ typeId: 1, title: '', actNumber: '', actDate: new Date().toISOString().split('T')[0] });
      showToast("Acta oficial registrada exitosamente.");
      fetchDetail();
    } catch (err) {
      showToast("Error al registrar acta en base de datos.");
    } finally {
      setSavingAct(false);
    }
  };

  // Guardar cita / evento
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    try {
      await apiClient.post(ENDPOINTS.AGENDA_EVENTS, {
        ...eventForm,
        expedienteId: id
      });
      setIsEventModalOpen(false);
      setEventForm({ type: 'Invitación a Audiencia', description: '', date: new Date().toISOString().split('T')[0], time: '10:00:00' });
      showToast("Cita agendada y registrada en el sistema.");
      fetchDetail();
    } catch (err) {
      showToast("Error al agendar cita.");
    } finally {
      setSavingEvent(false);
    }
  };

  // Registrar pago de cuota
  const handleConfirmPayment = async () => {
    if (!payingItem) return;
    try {
      await apiClient.post(ENDPOINTS.PAGO_PAY(payingItem.id), { paidDate: payDate });
      showToast(`Pago de cuota #${payingItem.paymentNumber} registrado.`);
      setPayingItem(null);
      fetchDetail();
    } catch (err) {
      showToast("Error al registrar abono.");
    }
  };

  // Revertir pago
  const handleRevertPayment = async (pagoId) => {
    try {
      await apiClient.post(ENDPOINTS.PAGO_REVERT(pagoId), {});
      showToast("Pago revertido a estado Pendiente.");
      fetchDetail();
    } catch (err) {
      showToast("Error al revertir pago.");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-[#6c3aed] border-t-transparent" />
        <p className="mt-3 text-xs text-[var(--muted)] font-medium">Cargando expediente 360°...</p>
      </div>
    );
  }

  if (!data || !data.expediente) {
    return (
      <div className="p-8 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] max-w-lg mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-[#e6a03a] mx-auto mb-3" />
        <h3 className="text-base font-extrabold text-[var(--text)]">Expediente no encontrado</h3>
        <p className="text-xs text-[var(--muted)] mt-1">El caso solicitado no existe o fue archivado.</p>
        <Link
          to="/expedientes"
          className="inline-flex items-center space-x-1 mt-4 px-4 py-2 bg-[#6c3aed] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Volver al listado</span>
        </Link>
      </div>
    );
  }

  const { expediente, informantes, nna, transgresores, actas, eventos, pagos } = data;

  // Cálculo de progreso procesal (4 etapas)
  const getProgressStep = (statusId) => {
    const id = parseInt(statusId, 10);
    if (id === 1) return 1; // Recepción
    if (id === 2 || id === 4) return 2; // En Progreso / Derivado
    if (id === 5) return 3; // Resuelto
    if (id === 6 || id === 3) return 4; // Concluido / Archivado
    return 1;
  };

  const currentStep = getProgressStep(expediente.statusId);

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ================= BARRA SUPERIOR 360° ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <Link
            to="/expedientes"
            title="Volver al listado"
            className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[#6c3aed] text-[var(--muted)] hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#8b59f6] tracking-tight">
                {expediente.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#6c3aed]/15 text-[#8b59f6] border border-[#6c3aed]/30">
                {expediente.statusName}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Aperturado el {expediente.openDate} &bull; Defensor asignado: <strong className="text-[var(--text)]">{expediente.workerName}</strong>
            </p>
          </div>
        </div>

        {/* Acciones de Cabecera: Selector de Estado y Botón Imprimir */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          {/* Selector de Estado */}
          <div className="flex items-center space-x-1.5 p-1 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs font-bold shadow-sm">
            <span className="text-[10px] text-[var(--muted)] uppercase px-2">Estado:</span>
            <select
              value={expediente.statusId}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-[var(--surface-2)] border border-[var(--line)] rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--text)] outline-none cursor-pointer focus:border-[#6c3aed]"
            >
              <option value="1">1. Pendiente / Recepción</option>
              <option value="2">2. En Progreso</option>
              <option value="5">5. Resuelto</option>
              <option value="4">4. Derivado</option>
              <option value="6">6. Concluido</option>
              <option value="3">3. Archivado</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[#6c3aed] text-xs font-bold text-[var(--text)] transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#259be8]" />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      {/* ================= BARRA DE PROGRESO PROCESAL ================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)]">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] block mb-3">
          Línea de avance procesal del caso
        </span>
        <div className="grid grid-cols-4 gap-2 relative">
          {[
            { step: 1, label: '1. Recepción & Apertura' },
            { step: 2, label: '2. Evaluación & Fichas' },
            { step: 3, label: '3. Conciliación & Actas' },
            { step: 4, label: '4. Conclusión / Archivo' },
          ].map((st) => {
            const isCompleted = currentStep >= st.step;
            const isCurrent = currentStep === st.step;
            return (
              <div key={st.step} className="flex flex-col items-center text-center space-y-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCompleted
                      ? 'bg-[#6c3aed] text-white shadow-md shadow-[#6c3aed]/30'
                      : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.step}
                </div>
                <span
                  className={`text-[11px] font-bold truncate max-w-full ${
                    isCurrent ? 'text-[#8b59f6]' : isCompleted ? 'text-[var(--text)]' : 'text-[var(--muted)]'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= NAVEGACIÓN DE PESTAÑAS (TABS) ================= */}
      <div className="flex border-b border-[var(--line)] space-x-1 overflow-x-auto pb-px">
        {[
          { id: 'general', label: 'Datos Generales', icon: Users, count: null },
          { id: 'actas', label: 'Actas y Diligencias', icon: FileText, count: actas.length },
          { id: 'pensiones', label: 'Pensiones de Alimentos', icon: DollarSign, count: pagos.length },
          { id: 'agenda', label: 'Agenda y Citas', icon: Calendar, count: eventos.length },
          { id: 'historial', label: 'Historial 360°', icon: History, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 pt-2 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#6c3aed] text-[#8b59f6] bg-[#6c3aed]/5 rounded-t-xl'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-[#6c3aed] text-white' : 'bg-[var(--surface-2)] text-[var(--muted)]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= CONTENIDO DE LAS PESTAÑAS ================= */}

      {/* TAB 1: DATOS GENERALES Y PARTES INVOLUCRADAS */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Materia y Hechos (Col span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tarjeta de Resumen de los Hechos */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-[var(--line)]">
                <FileText className="w-4 h-4 text-[#8b59f6]" />
                <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                  Materia y Resumen de Hechos
                </h3>
              </div>
              <p className="text-xs text-[var(--text)] leading-relaxed font-medium">
                {expediente.subject || 'Sin descripción detallada registrada.'}
              </p>
              {expediente.institution && (
                <div className="pt-2 text-[11px] text-[var(--muted)] flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#259be8]" />
                  <span>Derivado / Solicitado por: <strong className="text-[var(--text)]">{expediente.institution}</strong></span>
                </div>
              )}
            </div>

            {/* Tarjeta de Niñas, Niños y Adolescentes (NNA) */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-[#f16aa3]" />
                  <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                    Niñas, Niños y Adolescentes Beneficiarios ({nna.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#f16aa3] bg-[#f16aa3]/10 px-2 py-0.5 rounded-full">
                  Sujetos de Derecho
                </span>
              </div>

              {nna.length === 0 ? (
                <p className="text-xs text-[var(--muted)] py-4 text-center">No se han registrado menores en este caso.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {nna.map((c, i) => (
                    <div key={i} className="p-4 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl space-y-2 text-xs">
                      <div className="flex items-start justify-between">
                        <strong className="text-[var(--text)] font-bold text-sm block">
                          {c.fullName || 'Menor sin nombre'}
                        </strong>
                        {c.age && c.age < 5 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500/10 text-red-400 rounded">
                            Primera Infancia
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-[var(--muted)]">
                        <p>DNI: <span className="font-mono font-bold text-[var(--text)]">{c.dni || 'Sin DNI'}</span></p>
                        <p>Edad: <strong className="text-[var(--text)]">{c.age ? `${c.age} ${c.ageUnit || 'años'}` : 'No registrada'}</strong> &bull; Sexo: {c.gender || 'No registrado'}</p>
                        <p>Parentesco con solicitante: <span className="text-[var(--text)]">{c.relationshipWithChild || 'Hijo(a)'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Columna Derecha: Partes Adultas (Solicitante y Transgresor) (Col span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tarjeta Solicitante / Informante */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-[var(--line)]">
                <UserCheck className="w-4 h-4 text-[#22a77a]" />
                <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                  Parte Solicitante / Informante
                </h3>
              </div>

              {informantes.length === 0 ? (
                <p className="text-xs text-[var(--muted)] py-2">Sin informante registrado.</p>
              ) : (
                informantes.map((inf, i) => (
                  <div key={i} className="space-y-2 text-xs">
                    <p className="font-extrabold text-[var(--text)] text-sm">{inf.fullName || inf.entityName || 'Anónimo'}</p>
                    <div className="space-y-1.5 text-[var(--muted)]">
                      <p>DNI: <span className="font-mono font-bold text-[var(--text)]">{inf.dni || 'No registrado'}</span></p>
                      {inf.phone && (
                        <p className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#259be8]" />
                          <span>{inf.phone}</span>
                        </p>
                      )}
                      {inf.address && (
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#e6a03a]" />
                          <span>{inf.address}</span>
                        </p>
                      )}
                      <p>Condición: <strong className="text-[#22a77a]">{inf.relationshipWithChild || 'Madre / Familiar'}</strong></p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tarjeta Transgresor / Denunciado */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-[var(--line)]">
                <Scale className="w-4 h-4 text-[#e6a03a]" />
                <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                  Parte Denunciada / Transgresor
                </h3>
              </div>

              {transgresores.length === 0 ? (
                <p className="text-xs text-[var(--muted)] py-2">Sin parte denunciada registrada.</p>
              ) : (
                transgresores.map((tr, i) => (
                  <div key={i} className="space-y-2 text-xs">
                    <p className="font-extrabold text-[var(--text)] text-sm">{tr.fullName || 'Persona identificada'}</p>
                    <div className="space-y-1.5 text-[var(--muted)]">
                      <p>DNI: <span className="font-mono font-bold text-[var(--text)]">{tr.dni || 'No registrado'}</span></p>
                      {tr.phone && (
                        <p className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#259be8]" />
                          <span>{tr.phone}</span>
                        </p>
                      )}
                      {tr.address && (
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#e6a03a]" />
                          <span>{tr.address}</span>
                        </p>
                      )}
                      <p>Relación: <strong className="text-[#e6a03a]">{tr.relationshipWithChild || 'Padre / Transgresor'}</strong></p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ACTAS Y DILIGENCIAS */}
      {activeTab === 'actas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                Actas Emitidas ({actas.length})
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Documentación formal de recepción, conciliaciones y compromisos
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8751f9] to-[#6330df] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Nueva Acta</span>
            </button>
          </div>

          {actas.length === 0 ? (
            <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
              <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-2 opacity-50" />
              <h4 className="text-xs font-bold text-[var(--text)]">Sin actas emitidas todavía</h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Puedes redactar el Acta de Recepción (F1) o Conciliación (F9) con el botón superior.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actas.map((act) => (
                <div
                  key={act.id}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] hover:border-[#6c3aed]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10.5px] font-bold text-[#8b59f6] bg-[#6c3aed]/10 px-2.5 py-0.5 rounded-full border border-[#6c3aed]/20">
                        {act.typeName || 'Acta Oficial'}
                      </span>
                      <span className="font-mono text-xs text-[var(--muted)]">
                        {act.actNumber ? `N° ${act.actNumber}` : `ID #${act.id}`}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[var(--text)] leading-snug mb-1">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-[var(--muted)]">
                      Fecha del acta: <strong className="text-[var(--text)] font-mono">{act.actDate}</strong>
                    </p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      Emitida por: {act.workerName || 'Especialista DEMUNA'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewAct(act)}
                      className="text-xs font-bold text-[#8b59f6] hover:underline flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Documento</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewAct(act)}
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[#6c3aed] bg-[var(--surface-2)]"
                      title="Imprimir"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENSIONES Y ALIMENTOS */}
      {activeTab === 'pensiones' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                Compromisos y Pensiones de Alimentos
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Cronograma y control financiero de pagos acordados en acta
              </p>
            </div>
          </div>

          {pagos.length === 0 ? (
            <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
              <DollarSign className="w-10 h-10 text-[var(--muted)] mx-auto mb-2 opacity-50" />
              <h4 className="text-xs font-bold text-[var(--text)]">Sin cronograma de alimentos generado</h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Al suscribir un Acta de Conciliación con pensión de alimentos, las cuotas aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] shadow-[var(--shadow)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[10.5px] font-extrabold text-[var(--muted)] uppercase tracking-wider">
                      <th className="py-3 px-5">Cuota</th>
                      <th className="py-3 px-4">Vencimiento</th>
                      <th className="py-3 px-4">Monto Acordado</th>
                      <th className="py-3 px-4">Fecha Pago</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] text-xs">
                    {pagos.map((p) => {
                      const isPaid = p.status === 'Pagado';
                      return (
                        <tr key={p.id} className="hover:bg-[var(--surface-2)] transition-colors">
                          <td className="py-3.5 px-5 font-mono font-extrabold text-[var(--text)]">
                            Cuota #{p.paymentNumber}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[var(--muted)]">
                            {p.dueDate}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[var(--text)]">
                            S/ {parseFloat(p.amount).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--muted)]">
                            {p.paidDate || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isPaid
                                  ? 'bg-[#e5f7f0] text-[#289674] border border-[#289674]/30'
                                  : 'bg-[#fff0dd] text-[#c78531] border border-[#c78531]/30'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                              <span>{p.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isPaid ? (
                              <button
                                type="button"
                                onClick={() => setPayingItem(p)}
                                className="px-3 py-1 rounded-lg bg-[#22a77a] hover:bg-[#1aab79] text-white text-[11px] font-bold shadow-sm"
                              >
                                Registrar Abono
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRevertPayment(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-red-500/10 text-red-400 text-[11px] font-semibold border border-[var(--line)]"
                              >
                                Revertir
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AGENDA Y CITAS */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
                Agenda de Audiencias y Visitas ({eventos.length})
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Compromisos, inspecciones y citaciones programadas
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8751f9] to-[#6330df] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Cita o Visita</span>
            </button>
          </div>

          {eventos.length === 0 ? (
            <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
              <Calendar className="w-10 h-10 text-[var(--muted)] mx-auto mb-2 opacity-50" />
              <h4 className="text-xs font-bold text-[var(--text)]">Sin citas agendadas</h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Puedes programar una audiencia o visita domiciliaria con el botón superior.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-12 rounded-xl bg-[#f4efff] dark:bg-[#7649dc]/20 text-[#7649dc] flex flex-col items-center justify-center font-extrabold shrink-0 border border-[#7649dc]/30">
                      <span className="text-base leading-none">{ev.eventDate.split('-')[2]}</span>
                      <span className="text-[9px] tracking-wider mt-0.5 leading-none">DIA</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#8b59f6] bg-[#6c3aed]/10 px-2 py-0.5 rounded uppercase">
                        {ev.type}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text)] mt-1">{ev.description}</h4>
                      <p className="text-[10.5px] text-[var(--muted)] flex items-center space-x-2 mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-[#259be8]" />
                        <span>Hora: {ev.eventTime}</span>
                        <span>&bull;</span>
                        <span>Fecha: {ev.eventDate}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-[10px] font-bold bg-[#e5f7f0] text-[#289674] rounded-lg">
                    {ev.status || 'Activo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HISTORIAL 360° (TIMELINE) */}
      {activeTab === 'historial' && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text)] font-sans">
              Historial y Cronología de Actuaciones 360°
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Trazabilidad integral de todos los hitos y diligencias registradas
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-[#6c3aed]/40 space-y-6 pt-2">
            
            {/* Hito 1: Apertura */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#6c3aed] ring-4 ring-[var(--surface)]" />
              <div className="text-xs space-y-1">
                <span className="font-mono text-[10px] text-[#8b59f6] font-bold">{expediente.openDate}</span>
                <h4 className="font-bold text-[var(--text)]">Apertura formal del caso en DEMUNA</h4>
                <p className="text-[11px] text-[var(--muted)]">
                  Registrado por el defensor <strong>{expediente.workerName}</strong> bajo la materia: "{expediente.subject}".
                </p>
              </div>
            </div>

            {/* Hitos de Actas */}
            {actas.map((act) => (
              <div key={act.id} className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#259be8] ring-4 ring-[var(--surface)]" />
                <div className="text-xs space-y-1">
                  <span className="font-mono text-[10px] text-[#259be8] font-bold">{act.actDate}</span>
                  <h4 className="font-bold text-[var(--text)]">Emisión de {act.typeName || 'Acta Oficial'}</h4>
                  <p className="text-[11px] text-[var(--muted)]">
                    {act.title} (Suscrito por las partes).
                  </p>
                </div>
              </div>
            ))}

            {/* Hitos de Eventos */}
            {eventos.map((ev) => (
              <div key={ev.id} className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#e6a03a] ring-4 ring-[var(--surface)]" />
                <div className="text-xs space-y-1">
                  <span className="font-mono text-[10px] text-[#e6a03a] font-bold">{ev.eventDate} &bull; {ev.eventTime}</span>
                  <h4 className="font-bold text-[var(--text)]">Diligencia agendada: {ev.type}</h4>
                  <p className="text-[11px] text-[var(--muted)]">{ev.description}</p>
                </div>
              </div>
            ))}

            {/* Hitos de Pagos Realizados */}
            {pagos.filter(p => p.status === 'Pagado').map((p) => (
              <div key={p.id} className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#22a77a] ring-4 ring-[var(--surface)]" />
                <div className="text-xs space-y-1">
                  <span className="font-mono text-[10px] text-[#22a77a] font-bold">{p.paidDate}</span>
                  <h4 className="font-bold text-[var(--text)]">Abono de Cuota #{p.paymentNumber} Registrado</h4>
                  <p className="text-[11px] text-[var(--muted)]">
                    Monto pagado: S/ {parseFloat(p.amount).toFixed(2)} por concepto de pensión alimenticia.
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* ================= MODAL: EMITIR NUEVA ACTA ================= */}
      {isActModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[var(--text)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold">Emitir Nueva Acta Oficial</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Expediente {expediente.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Tipo de Acta</label>
                <select
                  value={actForm.typeId}
                  onChange={(e) => setActForm({ ...actForm, typeId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                >
                  {actTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Título / Sumilla del Acta</label>
                <input
                  type="text"
                  required
                  value={actForm.title}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  placeholder="ej. Acta de Compromiso de Pensión y Régimen de Visitas"
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5">N° de Acta</label>
                  <input
                    type="number"
                    value={actForm.actNumber}
                    onChange={(e) => setActForm({ ...actForm, actNumber: e.target.value })}
                    placeholder="ej. 01"
                    className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">Fecha</label>
                  <input
                    type="date"
                    required
                    value={actForm.actDate}
                    onChange={(e) => setActForm({ ...actForm, actDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsActModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAct}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8751f9] to-[#6330df] shadow-md hover:opacity-95"
                >
                  {savingAct ? 'Guardando...' : 'Emitir y Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AGENDAR CITA O VISITA ================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[var(--text)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold">Agendar Cita o Audiencia</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Expediente {expediente.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Tipo de Evento</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                >
                  <option value="Invitación a Audiencia">Invitación a Audiencia</option>
                  <option value="Segunda Citación">Segunda Citación</option>
                  <option value="Visita Social Domiciliaria">Visita Social Domiciliaria</option>
                  <option value="Evaluación Psicológica">Evaluación Psicológica</option>
                  <option value="Firma de Acta">Firma de Acta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Descripción / Lugar</label>
                <input
                  type="text"
                  required
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="ej. Primera audiencia de conciliación en oficina DEMUNA"
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5">Fecha</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">Hora</label>
                  <input
                    type="time"
                    required
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8751f9] to-[#6330df] shadow-md hover:opacity-95"
                >
                  {savingEvent ? 'Agendando...' : 'Guardar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR PAGO DE PENSIÓN ================= */}
      {payingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-[var(--text)]">
            <h3 className="text-base font-extrabold mb-1">Registrar Abono de Pensión</h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Cuota #{payingItem.paymentNumber} &bull; Monto: <strong>S/ {parseFloat(payingItem.amount).toFixed(2)}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Fecha de Pago</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPayingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] bg-[var(--surface-2)]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#22a77a] hover:bg-[#1aab79] shadow-md"
                >
                  Confirmar Abono
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVISUALIZAR ACTA OFICIAL (IMPRIMIBLE) ================= */}
      {previewAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative my-8 print:p-0 print:shadow-none">
            
            {/* Botones de acción del visor */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase">Documento Oficial DEMUNA</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#6c3aed] text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Acta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documento con formato formal */}
            <div className="space-y-6 text-xs text-justify leading-relaxed">
              {/* Membrete Oficial */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                <h3 className="font-extrabold text-sm uppercase tracking-wide">Municipalidad Distrital de Zapillica</h3>
                <h4 className="font-bold text-xs uppercase text-slate-700">Defensoría Municipal del Niño y del Adolescente (DEMUNA ZAPILLICA)</h4>
                <p className="text-[10px] text-slate-500">Acreditada ante el Ministerio de la Mujer y Poblaciones Vulnerables — MIMP</p>
              </div>

              {/* Título del Acta */}
              <div className="text-center py-2">
                <h2 className="text-base font-black uppercase underline decoration-2">
                  {previewAct.title}
                </h2>
                <span className="font-mono font-bold text-xs">
                  EXPEDIENTE N° {expediente.code} {previewAct.actNumber ? `— ACTA N° ${previewAct.actNumber}` : ''}
                </span>
              </div>

              {/* Contenido Formal */}
              <p>
                En el distrito de Zapillica, siendo el día <strong>{previewAct.actDate}</strong>, en las instalaciones de la Defensoría Municipal del Niño y del Adolescente (DEMUNA ZAPILLICA), ante la presencia del especialista responsable <strong>{expediente.workerName}</strong>, se deja constancia de la presente actuación correspondiente a la materia de <strong>{expediente.subject}</strong>.
              </p>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <p><strong>Parte Solicitante:</strong> {informantes[0]?.fullName || 'Identificada en autos'} (DNI: {informantes[0]?.dni || '—'})</p>
                <p><strong>Parte Obligada / Transgresor:</strong> {transgresores[0]?.fullName || 'Identificada en autos'} (DNI: {transgresores[0]?.dni || '—'})</p>
                <p><strong>Menor(es) Beneficiario(s):</strong> {nna[0]?.fullName || 'En autos'} (Edad: {nna[0]?.age ? `${nna[0].age} años` : '—'})</p>
              </div>

              <p>
                Las partes comparecientes, tras haber sido orientadas respecto del Principio del Interés Superior del Niño consagrado en la Convención sobre los Derechos del Niño y el Código de los Niños y Adolescentes (Ley N° 27337), convienen y suscriben el presente instrumento en señal de plena conformidad y compromiso tutelar.
              </p>

              {/* Firmas Formales */}
              <div className="grid grid-cols-3 gap-6 pt-16 text-center text-[10px] font-bold">
                <div className="border-t border-slate-900 pt-2">
                  <span>PARTE SOLICITANTE</span><br />
                  <span className="font-normal text-slate-500">DNI: {informantes[0]?.dni || '_______________'}</span>
                </div>
                <div className="border-t border-slate-900 pt-2">
                  <span>PARTE OBLIGADA</span><br />
                  <span className="font-normal text-slate-500">DNI: {transgresores[0]?.dni || '_______________'}</span>
                </div>
                <div className="border-t border-slate-900 pt-2">
                  <span>RESPONSABLE DEMUNA</span><br />
                  <span className="font-normal text-slate-500">Firma y Sello Oficial</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TOAST FLOTANTE ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e2047] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border border-[#6c3aed]/40 flex items-center space-x-2 animate-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#ffc36c]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
