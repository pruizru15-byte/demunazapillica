import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  FileText,
  User,
  Users,
  UserX,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Phone,
  MapPin,
  Heart,
  Baby
} from 'lucide-react';

export const NuevoExpedientePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reniecLoading, setReniecLoading] = useState(false);
  const [reniecSuccess, setReniecSuccess] = useState('');

  // Materias frecuentes para DEMUNA
  const MATERIA_PRESETS = [
    'Alimentos',
    'Régimen de Visitas',
    'Tenencia',
    'Normas de Comportamiento',
    'Reconocimiento Voluntario de Filiación',
    'Violencia Psicológica / Maltrato',
    'Orientación Legal y Psicológica'
  ];

  // Instituciones frecuentes
  const INSTITUCION_PRESETS = [
    'Atención Directa (Parte Interesada)',
    'Comisaría PNP / Policía Nacional',
    'Sector Educación / Institución Educativa',
    'Centro de Salud / Puesto Médico',
    'Centro Emergencia Mujer (CEM)',
    'Juzgado de Paz Letrado / Fiscalía'
  ];

  // Estado del Formulario Multi-Paso
  const [formData, setFormData] = useState({
    code: '',
    openDate: new Date().toISOString().split('T')[0],
    subject: '',
    institution: 'Atención Directa (Parte Interesada)',
    informants: [
      {
        dni: '',
        names: '',
        surnames: '',
        phone: '',
        address: '',
        relationship: 'Madre',
        isAnonymous: false,
        isEntity: false,
        entityName: '',
        subRole: 'Informante'
      }
    ],
    children: [
      {
        dni: '',
        names: '',
        surnames: '',
        gender: 'Femenino',
        age: '',
        ageUnit: 'año',
        address: '',
        relationship: 'Hijo(a)'
      }
    ],
    suspect: {
      dni: '',
      names: '',
      surnames: '',
      gender: 'Masculino',
      phone: '',
      address: '',
      relationship: 'Padre'
    }
  });

  // Cargar el correlativo automático al montar
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.EXPEDIENTE_NEXT_CODE);
        if (res.data?.success) {
          setFormData(prev => ({ ...prev, code: res.data.data.code }));
        }
      } catch (err) {
        console.error("Error al obtener correlativo", err);
      }
    };
    fetchCode();
  }, []);

  // Función para autocompletar con RENIEC
  const handleReniecLookup = async (dni, callback) => {
    if (dni.length !== 8) return;
    setReniecLoading(true);
    setReniecSuccess('');
    try {
      const res = await apiClient.get(ENDPOINTS.PERSONA_DNI(dni));
      if (res.data?.success && res.data.data.names) {
        callback(res.data.data.names, res.data.data.surnames);
        setReniecSuccess(`DNI ${dni} verificado.`);
        setTimeout(() => setReniecSuccess(''), 3000);
      } else {
        setReniecSuccess(`DNI ${dni} no encontrado en base local.`);
        setTimeout(() => setReniecSuccess(''), 3000);
      }
    } catch (err) {
      console.log("No se pudo consultar RENIEC", err);
    } finally {
      setReniecLoading(false);
    }
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validaciones por paso
    if (currentStep === 1) {
      if (!formData.subject.trim()) {
        setError('Por favor indica la materia o motivo principal del caso.');
        return;
      }
    } else if (currentStep === 2) {
      const inf = formData.informants[0];
      if (!inf.isAnonymous && (!inf.names.trim() || !inf.surnames.trim())) {
        setError('Por favor completa los nombres y apellidos del informante o marca la casilla de anónimo.');
        return;
      }
    } else if (currentStep === 3) {
      for (let i = 0; i < formData.children.length; i++) {
        const child = formData.children[i];
        if (!child.names.trim() || !child.surnames.trim()) {
          setError(`Completa el nombre y apellido del Menor #${i + 1}.`);
          return;
        }
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post(ENDPOINTS.EXPEDIENTES, formData);
      if (res.data?.success) {
        const newId = res.data.data.id;
        navigate(`/expedientes/${newId}`);
      } else {
        setError(res.data?.message || 'Error al registrar expediente');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al comunicarse con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Datos Básicos', subtitle: 'Materia y fecha', icon: FileText },
    { number: 2, title: 'Solicitante', subtitle: 'Identificación parte', icon: User },
    { number: 3, title: 'NNA Beneficiarios', subtitle: 'Niñez y adolescencia', icon: Baby },
    { number: 4, title: 'Presunto Transgresor', subtitle: 'Citado y resumen', icon: UserX },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ================= CABECERA INSTITUCIONAL ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center space-x-3.5">
          <Link
            to="/expedientes"
            title="Volver a lista de expedientes"
            className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[#6c3aed] text-[var(--muted)] hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
                Apertura de Nuevo Expediente
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#6c3aed]/15 text-[#8b59f6] border border-[#6c3aed]/30">
                Paso {currentStep} de 4
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Asistente guiado de 4 pasos para registro formal, clasificación y protección DEMUNA
            </p>
          </div>
        </div>

        {/* Código autogenerado */}
        {formData.code && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-[var(--muted)]">N° Asignado:</span>
            <span className="font-mono text-xs font-black text-[#8b59f6]">{formData.code}</span>
          </div>
        )}
      </div>

      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;

          return (
            <div
              key={s.number}
              onClick={() => isDone && setCurrentStep(s.number)}
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex items-center space-x-3 ${
                isActive
                  ? 'bg-[#6c3aed]/10 border-[#6c3aed] shadow-lg shadow-[#6c3aed]/15'
                  : isDone
                  ? 'bg-[var(--surface)] border-[#10b981]/40 cursor-pointer hover:border-[#10b981]'
                  : 'bg-[var(--surface)] border-[var(--line)] opacity-60'
              }`}
            >
              {/* Barra superior de acento activo */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6c3aed] to-[#2faaf7]" />
              )}

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                  isActive
                    ? 'bg-gradient-to-br from-[#6c3aed] to-[#8b59f6] text-white shadow-md shadow-[#6c3aed]/30 scale-105'
                    : isDone
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0">
                <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-[var(--text)]' : isDone ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                  {s.title}
                </p>
                <p className="text-[10px] text-[var(--muted)] truncate">
                  {isDone ? 'Completado' : s.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-400 text-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Notificación temporal de RENIEC */}
      {reniecSuccess && (
        <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl flex items-center space-x-2 text-[#10b981] text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{reniecSuccess}</span>
        </div>
      )}

      {/* ================= FORMULARIO WIZARD ================= */}
      <form onSubmit={handleStepSubmit}>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 md:p-8 shadow-xl space-y-6">
          
          {/* ================= PASO 1: DATOS BÁSICOS ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center space-x-3 pb-4 border-b border-[var(--line)]">
                <div className="w-8 h-8 rounded-lg bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Paso 1: Información General del Expediente
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Define la codificación, fechas y la materia legal o social del caso
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Número de Expediente (Correlativo Institucional)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--surface-2)] font-mono font-bold text-[#8b59f6] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] focus:ring-1 focus:ring-[#6c3aed] outline-none"
                    placeholder="001-2026-20043"
                  />
                  <p className="text-[10px] text-[var(--muted)] mt-1">
                    Generado de acuerdo al formato oficial de la DEMUNA distrital
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Fecha de Apertura
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.openDate}
                    onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] focus:ring-1 focus:ring-[#6c3aed] outline-none"
                  />
                </div>
              </div>

              {/* Materia / Motivo con Chips rápidos */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                  Materia Principal / Motivo de Solicitud *
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {MATERIA_PRESETS.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setFormData({ ...formData, subject: m })}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        formData.subject === m
                          ? 'bg-[#6c3aed] text-white border-[#6c3aed] font-bold shadow-sm'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:border-[#6c3aed] hover:text-[var(--text)]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Escribe o selecciona la materia (ej. Alimentos, Régimen de Visitas...)"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] focus:ring-1 focus:ring-[#6c3aed] outline-none"
                />
              </div>

              {/* Institución Derivante / Solicitante */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                  Institución Solicitante / Vía de Ingreso
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {INSTITUCION_PRESETS.map((inst) => (
                    <button
                      type="button"
                      key={inst}
                      onClick={() => setFormData({ ...formData, institution: inst })}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        formData.institution === inst
                          ? 'bg-[#2faaf7]/20 text-[#2faaf7] border-[#2faaf7] font-bold'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:border-[#2faaf7] hover:text-[var(--text)]'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Institución o persona remitente"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] focus:ring-1 focus:ring-[#6c3aed] outline-none"
                />
              </div>
            </div>
          )}

          {/* ================= PASO 2: INFORMANTE O SOLICITANTE ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center space-x-3 pb-4 border-b border-[var(--line)]">
                <div className="w-8 h-8 rounded-lg bg-[#2faaf7]/15 text-[#2faaf7] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Paso 2: Datos del Informante o Solicitante
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Persona o institución que pone en conocimiento el caso o solicita conciliación
                  </p>
                </div>
              </div>

              {formData.informants.map((inf, idx) => (
                <div key={idx} className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--line)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                    <span className="text-xs font-black uppercase tracking-wider text-[var(--text)] flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#6c3aed]" />
                      <span>Informante / Solicitante #{idx + 1}</span>
                    </span>

                    <label className="inline-flex items-center text-xs text-[var(--text)] font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={inf.isAnonymous}
                        onChange={(e) => {
                          const updated = [...formData.informants];
                          updated[idx].isAnonymous = e.target.checked;
                          if (e.target.checked) {
                            updated[idx].names = 'Anónimo / Reserva de Identidad';
                            updated[idx].surnames = 'Confidencial';
                          } else {
                            updated[idx].names = '';
                            updated[idx].surnames = '';
                          }
                          setFormData({ ...formData, informants: updated });
                        }}
                        className="mr-2 w-4 h-4 accent-[#6c3aed] rounded cursor-pointer"
                      />
                      Solicitud con Reserva de Identidad (Anónimo)
                    </label>
                  </div>

                  {!inf.isAnonymous ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* DNI */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            DNI (8 dígitos) *
                          </label>
                          <span className="text-[10px] text-[#2faaf7] font-semibold">RENIEC Auto</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength="8"
                            required={!inf.isAnonymous}
                            value={inf.dni}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              const updated = [...formData.informants];
                              updated[idx].dni = val;
                              setFormData({ ...formData, informants: updated });
                              if (val.length === 8) {
                                handleReniecLookup(val, (names, surnames) => {
                                  const up = [...formData.informants];
                                  up[idx].names = names;
                                  up[idx].surnames = surnames;
                                  setFormData({ ...formData, informants: up });
                                });
                              }
                            }}
                            className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                            placeholder="Ingrese DNI..."
                          />
                          {reniecLoading && (
                            <div className="absolute right-3 top-3">
                              <div className="animate-spin h-4 w-4 border-2 border-[#6c3aed] border-t-transparent rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nombres */}
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Nombres *
                        </label>
                        <input
                          type="text"
                          required={!inf.isAnonymous}
                          value={inf.names}
                          onChange={(e) => {
                            const updated = [...formData.informants];
                            updated[idx].names = e.target.value;
                            setFormData({ ...formData, informants: updated });
                          }}
                          className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                          placeholder="Nombres completos"
                        />
                      </div>

                      {/* Apellidos */}
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          required={!inf.isAnonymous}
                          value={inf.surnames}
                          onChange={(e) => {
                            const updated = [...formData.informants];
                            updated[idx].surnames = e.target.value;
                            setFormData({ ...formData, informants: updated });
                          }}
                          className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                          placeholder="Apellidos completos"
                        />
                      </div>

                      {/* Parentesco */}
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Parentesco con el NNA
                        </label>
                        <select
                          value={inf.relationship}
                          onChange={(e) => {
                            const updated = [...formData.informants];
                            updated[idx].relationship = e.target.value;
                            setFormData({ ...formData, informants: updated });
                          }}
                          className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none cursor-pointer"
                        >
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Abuelo(a)">Abuelo(a)</option>
                          <option value="Tío(a)">Tío(a)</option>
                          <option value="Hermano(a) mayor">Hermano(a) mayor</option>
                          <option value="Tutor(a) legal">Tutor(a) legal</option>
                          <option value="Docente / Director">Docente / Director</option>
                          <option value="Vecino(a) / Tercero">Vecino(a) / Tercero</option>
                        </select>
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Teléfono / Celular
                        </label>
                        <input
                          type="text"
                          value={inf.phone}
                          onChange={(e) => {
                            const updated = [...formData.informants];
                            updated[idx].phone = e.target.value;
                            setFormData({ ...formData, informants: updated });
                          }}
                          className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                          placeholder="9XXXXXXXX"
                        />
                      </div>

                      {/* Domicilio */}
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Dirección / Domicilio
                        </label>
                        <input
                          type="text"
                          value={inf.address}
                          onChange={(e) => {
                            const updated = [...formData.informants];
                            updated[idx].address = e.target.value;
                            setFormData({ ...formData, informants: updated });
                          }}
                          className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                          placeholder="Caserío / Calle / Sector"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#6c3aed]/10 border border-[#6c3aed]/20 rounded-xl text-xs text-[var(--muted)]">
                      <p className="font-bold text-[var(--text)] mb-1">
                        Informante en condición de Anónimo / Confidencial
                      </p>
                      Los datos personales no se harán públicos en las actas de citación para proteger la integridad del denunciante.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ================= PASO 3: NNA (BENEFICIARIOS) ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ffc36c]/15 text-[#ffc36c] flex items-center justify-center">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">
                      Paso 3: Niñas, Niños y Adolescentes (NNA)
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Beneficiarios protegidos por la intervención DEMUNA
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      children: [
                        ...formData.children,
                        {
                          dni: '',
                          names: '',
                          surnames: '',
                          gender: 'Femenino',
                          age: '',
                          ageUnit: 'año',
                          address: '',
                          relationship: 'Hijo(a)'
                        }
                      ]
                    });
                  }}
                  className="px-3.5 py-2 bg-[#6c3aed]/15 hover:bg-[#6c3aed]/25 text-[#8b59f6] border border-[#6c3aed]/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir otro NNA</span>
                </button>
              </div>

              {formData.children.map((child, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--line)] space-y-4 relative"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-[#6c3aed] text-white text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[var(--text)]">
                        Menor de edad #{idx + 1}
                      </span>
                    </div>

                    {formData.children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.children.filter((_, i) => i !== idx);
                          setFormData({ ...formData, children: updated });
                        }}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all flex items-center space-x-1 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* DNI */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                          DNI (Opcional)
                        </label>
                        <span className="text-[10px] text-[#2faaf7] font-semibold">RENIEC</span>
                      </div>
                      <input
                        type="text"
                        maxLength="8"
                        value={child.dni}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const updated = [...formData.children];
                          updated[idx].dni = val;
                          setFormData({ ...formData, children: updated });
                          if (val.length === 8) {
                            handleReniecLookup(val, (names, surnames) => {
                              const up = [...formData.children];
                              up[idx].names = names;
                              up[idx].surnames = surnames;
                              setFormData({ ...formData, children: up });
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                        placeholder="DNI del menor..."
                      />
                    </div>

                    {/* Nombres */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Nombres del Menor *
                      </label>
                      <input
                        type="text"
                        required
                        value={child.names}
                        onChange={(e) => {
                          const updated = [...formData.children];
                          updated[idx].names = e.target.value;
                          setFormData({ ...formData, children: updated });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                        placeholder="Nombres de pila"
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Apellidos del Menor *
                      </label>
                      <input
                        type="text"
                        required
                        value={child.surnames}
                        onChange={(e) => {
                          const updated = [...formData.children];
                          updated[idx].surnames = e.target.value;
                          setFormData({ ...formData, children: updated });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                        placeholder="Apellidos completos"
                      />
                    </div>

                    {/* Sexo */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Sexo
                      </label>
                      <select
                        value={child.gender}
                        onChange={(e) => {
                          const updated = [...formData.children];
                          updated[idx].gender = e.target.value;
                          setFormData({ ...formData, children: updated });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none cursor-pointer"
                      >
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    </div>

                    {/* Edad y Unidad */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Edad
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="18"
                          placeholder="Edad"
                          value={child.age}
                          onChange={(e) => {
                            const updated = [...formData.children];
                            updated[idx].age = e.target.value;
                            setFormData({ ...formData, children: updated });
                          }}
                          className="w-2/3 px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                        />
                        <select
                          value={child.ageUnit}
                          onChange={(e) => {
                            const updated = [...formData.children];
                            updated[idx].ageUnit = e.target.value;
                            setFormData({ ...formData, children: updated });
                          }}
                          className="w-1/3 px-2 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold focus:border-[#6c3aed] outline-none cursor-pointer"
                        >
                          <option value="año">Años</option>
                          <option value="mes">Meses</option>
                        </select>
                      </div>
                    </div>

                    {/* Relación con solicitante */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Relación con el Solicitante
                      </label>
                      <input
                        type="text"
                        value={child.relationship}
                        onChange={(e) => {
                          const updated = [...formData.children];
                          updated[idx].relationship = e.target.value;
                          setFormData({ ...formData, children: updated });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                        placeholder="Hijo(a), Nieto(a)..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= PASO 4: PRESUNTO TRANSGRESOR / CITADO ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center space-x-3 pb-4 border-b border-[var(--line)]">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Paso 4: Presunto Transgresor / Parte Citada
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Identificación de la contraparte o presunto transgresor para notificaciones y audiencias
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--line)] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* DNI */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                        DNI (Opcional)
                      </label>
                      <span className="text-[10px] text-[#2faaf7] font-semibold">RENIEC</span>
                    </div>
                    <input
                      type="text"
                      maxLength="8"
                      value={formData.suspect.dni}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({
                          ...formData,
                          suspect: { ...formData.suspect, dni: val }
                        });
                        if (val.length === 8) {
                          handleReniecLookup(val, (names, surnames) => {
                            setFormData(prev => ({
                              ...prev,
                              suspect: { ...prev.suspect, names, surnames }
                            }));
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                      placeholder="DNI del citado..."
                    />
                  </div>

                  {/* Nombres */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.suspect.names}
                      onChange={(e) => setFormData({
                        ...formData,
                        suspect: { ...formData.suspect, names: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                      placeholder="Nombres completos"
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.suspect.surnames}
                      onChange={(e) => setFormData({
                        ...formData,
                        suspect: { ...formData.suspect, surnames: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                      placeholder="Apellidos completos"
                    />
                  </div>

                  {/* Sexo */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Sexo
                    </label>
                    <select
                      value={formData.suspect.gender}
                      onChange={(e) => setFormData({
                        ...formData,
                        suspect: { ...formData.suspect, gender: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none cursor-pointer"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>

                  {/* Relación con NNA */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Relación con el NNA
                    </label>
                    <input
                      type="text"
                      value={formData.suspect.relationship}
                      onChange={(e) => setFormData({
                        ...formData,
                        suspect: { ...formData.suspect, relationship: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                      placeholder="Padre, Madre, Padrastro, Vecino..."
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={formData.suspect.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        suspect: { ...formData.suspect, phone: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                      placeholder="9XXXXXXXX"
                    />
                  </div>

                  {/* Domicilio para citación */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Dirección / Domicilio para Notificaciones y Citaciones
                    </label>
                    <input
                      type="text"
                      value={formData.suspect.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        suspect: { ...formData.suspect, address: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-sm focus:border-[#6c3aed] outline-none"
                      placeholder="Caserío / Calle / Mz / Lote de residencia del citado"
                    />
                  </div>
                </div>
              </div>

              {/* ================= RESUMEN PREVIO DE CONFIRMACIÓN ================= */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#6c3aed]/10 via-[var(--surface-2)] to-transparent border border-[#6c3aed]/30 space-y-3">
                <div className="flex items-center space-x-2 text-[#8b59f6]">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Resumen Ejecutivo del Expediente a Crear
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Expediente</span>
                    <span className="font-mono font-bold text-[#8b59f6]">{formData.code || 'Auto'}</span>
                  </div>

                  <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Materia</span>
                    <span className="font-bold text-[var(--text)] truncate block">{formData.subject || 'Sin especificar'}</span>
                  </div>

                  <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Solicitante</span>
                    <span className="font-bold text-[var(--text)] truncate block">
                      {formData.informants[0]?.isAnonymous
                        ? 'Reserva de identidad'
                        : `${formData.informants[0]?.names} ${formData.informants[0]?.surnames}` || 'Sin datos'}
                    </span>
                  </div>

                  <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Beneficiarios NNA</span>
                    <span className="font-bold text-[var(--text)] truncate block">
                      {formData.children.length} menor(es)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= NAVEGACIÓN INFERIOR DEL WIZARD ================= */}
          <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setCurrentStep(currentStep - 1);
                }}
                className="px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-[var(--text)] text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] hover:brightness-110 text-white text-xs font-black shadow-lg shadow-[#6c3aed]/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Aperturando Expediente...</span>
                </>
              ) : currentStep === 4 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Registrar y Aperturar Expediente</span>
                </>
              ) : (
                <>
                  <span>Siguiente Paso</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
