import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../api/endpoints';
import {
  Settings,
  Building2,
  Network,
  Sliders,
  Mail,
  Server,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Download,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Phone,
  MapPin,
  Clock,
  Globe,
  X,
  ChevronRight,
  HardDrive,
  Calendar,
  Hash,
  Send,
  Eye,
  Lock
} from 'lucide-react';

export const ConfiguracionPage = () => {
  // Estado de navegación por pestañas
  const [activeTab, setActiveTab] = useState('institucion'); // 'institucion' | 'entidades' | 'operacion' | 'smtp' | 'sistema'

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Datos del backend
  const [configs, setConfigs] = useState({
    general: {},
    operacion: {},
    smtp: {}
  });
  const [systemInfo, setSystemInfo] = useState(null);

  // Formulario local editable de configuración
  const [formData, setFormData] = useState({
    // General
    institucion_nombre: '',
    defensoria_nombre: '',
    defensoria_codigo_mimp: '',
    defensor_responsable: '',
    defensor_colegiatura: '',
    direccion_sede: '',
    telefono_institucional: '',
    telefono_emergencia: '',
    email_institucional: '',
    horario_atencion: '',
    // Operación
    dias_anticipacion_audiencia: '3',
    dias_gracia_pension: '5',
    plazo_maximo_citacion: '7',
    alerta_audiencias_activas: '1',
    alerta_pensiones_activas: '1',
    notificaciones_correo: '1',
    prefijo_expediente: 'EXP',
    ano_fiscal_activo: '2026',
    unidad_territorial: 'Piura - Ayabaca - Zapillica',
    meta_anual_casos: '180',
    // SMTP
    smtp_host: '',
    smtp_port: '465',
    smtp_user: '',
    smtp_pass: '',
    smtp_encryption: 'ssl',
    smtp_from_name: ''
  });

  // Entidades Aliadas (Red de Derivación)
  const [entidades, setEntidades] = useState([]);
  const [tiposEntidad, setTiposEntidad] = useState([]);
  const [loadingEntidades, setLoadingEntidades] = useState(false);
  const [searchEntidad, setSearchEntidad] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  // Modal Entidad Aliada (Crear / Editar)
  const [isEntidadModalOpen, setIsEntidadModalOpen] = useState(false);
  const [editingEntidad, setEditingEntidad] = useState(null);
  const [savingEntidad, setSavingEntidad] = useState(false);
  const [entidadForm, setEntidadForm] = useState({
    name: '',
    typeId: '',
    address: '',
    district: 'Zapillica',
    province: 'Ayabaca',
    department: 'Piura',
    phone: ''
  });

  // Helper para mostrar notificaciones flotantes (Toasts)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // Cabeceras con Token JWT
  const getAuthHeaders = () => {
    const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Cargar configuraciones globales e información del servidor
  const fetchConfiguracion = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.CONFIGURACION}`, {
        headers: getAuthHeaders()
      });

      if (res.data?.success && res.data.data) {
        const { configs: cfg, system } = res.data.data;
        setConfigs(cfg || {});
        setSystemInfo(system || null);

        // Prellenar formulario combinando categorías
        const merged = {
          ...(cfg.general || {}),
          ...(cfg.operacion || {}),
          ...(cfg.smtp || {})
        };

        setFormData(prev => ({
          ...prev,
          ...merged
        }));
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      showToast('Error al conectar con el módulo de configuración.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Cargar Entidades Aliadas y Catálogo de Tipos
  const fetchEntidades = async () => {
    setLoadingEntidades(true);
    try {
      const [resEnt, resTipos] = await Promise.all([
        axios.get(`${API_BASE_URL}${ENDPOINTS.CONFIGURACION_ENTIDADES}`, {
          headers: getAuthHeaders()
        }),
        axios.get(`${API_BASE_URL}${ENDPOINTS.CONFIGURACION_TIPOS_ENTIDAD}`, {
          headers: getAuthHeaders()
        })
      ]);

      if (resEnt.data?.success) {
        setEntidades(resEnt.data.data || []);
      }
      if (resTipos.data?.success) {
        setTiposEntidad(resTipos.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar entidades aliadas:', err);
    } finally {
      setLoadingEntidades(false);
    }
  };

  useEffect(() => {
    fetchConfiguracion();
    fetchEntidades();
  }, []);

  // Manejo de cambios en el formulario de configuración
  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
  };

  // Guardar cambios en las configuraciones
  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}${ENDPOINTS.CONFIGURACION_UPDATE}`, formData, {
        headers: getAuthHeaders()
      });

      if (res.data?.success) {
        showToast('Parámetros de configuración guardados exitosamente.', 'success');
        fetchConfiguracion();
      } else {
        showToast(res.data?.message || 'No se pudo guardar la configuración.', 'error');
      }
    } catch (err) {
      console.error('Error guardando configuración:', err);
      showToast('Error de red al guardar la configuración.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Probar conectividad SMTP
  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpResult(null);
    try {
      const res = await axios.post(`${API_BASE_URL}${ENDPOINTS.CONFIGURACION_TEST_EMAIL}`, {}, {
        headers: getAuthHeaders()
      });

      if (res.data?.success) {
        setSmtpResult(res.data.data);
        showToast('Diagnóstico SMTP completado con éxito.', 'success');
      } else {
        setSmtpResult(res.data?.data || { success: false, message: res.data?.message });
        showToast('El servidor SMTP no respondió favorablemente.', 'error');
      }
    } catch (err) {
      setSmtpResult({
        success: false,
        message: err.response?.data?.message || err.message
      });
      showToast('Fallo al contactar el servicio de correo.', 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  // Descargar Respaldo SQL
  const handleDownloadBackup = () => {
    const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
    window.open(`${API_BASE_URL}${ENDPOINTS.CONFIGURACION_BACKUP}?token=${encodeURIComponent(token || '')}`, '_blank');
    showToast('Generando respaldo oficial de base de datos SQL...', 'info');
  };

  // Filtrar Entidades Aliadas
  const filteredEntidades = useMemo(() => {
    return entidades.filter(item => {
      const matchesSearch =
        searchEntidad.trim() === '' ||
        item.name?.toLowerCase().includes(searchEntidad.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchEntidad.toLowerCase()) ||
        item.district?.toLowerCase().includes(searchEntidad.toLowerCase()) ||
        item.phone?.includes(searchEntidad);

      const matchesType =
        selectedTypeFilter === 'all' ||
        String(item.typeId) === String(selectedTypeFilter);

      return matchesSearch && matchesType;
    });
  }, [entidades, searchEntidad, selectedTypeFilter]);

  // Abrir Modal de Crear Entidad
  const handleOpenCreateEntidad = () => {
    setEditingEntidad(null);
    setEntidadForm({
      name: '',
      typeId: tiposEntidad[0]?.id ? String(tiposEntidad[0].id) : '1',
      address: '',
      district: 'Zapillica',
      province: 'Ayabaca',
      department: 'Piura',
      phone: ''
    });
    setIsEntidadModalOpen(true);
  };

  // Abrir Modal de Editar Entidad
  const handleOpenEditEntidad = (entidad) => {
    setEditingEntidad(entidad);
    setEntidadForm({
      name: entidad.name || '',
      typeId: entidad.typeId ? String(entidad.typeId) : '1',
      address: entidad.address || '',
      district: entidad.district || 'Zapillica',
      province: entidad.province || 'Ayabaca',
      department: entidad.department || 'Piura',
      phone: entidad.phone || ''
    });
    setIsEntidadModalOpen(true);
  };

  // Guardar Entidad (Crear o Actualizar)
  const handleSaveEntidad = async (e) => {
    e.preventDefault();
    if (!entidadForm.name.trim()) {
      showToast('El nombre de la entidad es obligatorio.', 'error');
      return;
    }

    setSavingEntidad(true);
    try {
      if (editingEntidad) {
        const res = await axios.put(
          `${API_BASE_URL}${ENDPOINTS.CONFIGURACION_ENTIDAD_UPDATE(editingEntidad.id)}`,
          entidadForm,
          { headers: getAuthHeaders() }
        );
        if (res.data?.success) {
          showToast('Entidad aliada actualizada correctamente.', 'success');
          setIsEntidadModalOpen(false);
          fetchEntidades();
        }
      } else {
        const res = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.CONFIGURACION_ENTIDAD_STORE}`,
          entidadForm,
          { headers: getAuthHeaders() }
        );
        if (res.data?.success) {
          showToast('Nueva entidad aliada registrada en el directorio.', 'success');
          setIsEntidadModalOpen(false);
          fetchEntidades();
        }
      }
    } catch (err) {
      console.error('Error guardando entidad:', err);
      showToast('Error al registrar la entidad aliada.', 'error');
    } finally {
      setSavingEntidad(false);
    }
  };

  // Eliminar Entidad Aliada
  const handleDeleteEntidad = async (id, name) => {
    if (!window.confirm(`¿Está seguro de eliminar "${name}" del directorio de entidades aliadas?`)) {
      return;
    }
    try {
      const res = await axios.delete(
        `${API_BASE_URL}${ENDPOINTS.CONFIGURACION_ENTIDAD_DELETE(id)}`,
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        showToast('Entidad eliminada del directorio.', 'success');
        fetchEntidades();
      }
    } catch (err) {
      console.error('Error eliminando entidad:', err);
      showToast('No se pudo eliminar la entidad.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D22] text-[#F5F4FF] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-slide-up ${
            toast.type === 'error'
              ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444]'
              : toast.type === 'info'
              ? 'bg-[#2FAAF7]/20 border-[#2FAAF7]/40 text-[#2FAAF7]'
              : 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Acciones Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#323859]/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
            <span>DEMUNA ZAPILLICA</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6C3AED]" />
            <span>Administración</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6C3AED]" />
            <span className="text-[#2FAAF7]">Configuración General</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#6C3AED]" />
            Configuración y Parámetros del Sistema
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Gestione la acreditación MIMP, el directorio de la red de derivación interinstitucional, directrices operativas y seguridad.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadBackup}
            title="Descargar copia íntegra de la base de datos MySQL en archivo .sql"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#191731] hover:bg-[#25224A] text-[#2FAAF7] border border-[#2FAAF7]/30 hover:border-[#2FAAF7] text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#0C0D22]/50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span> Respaldo SQL
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C3AED] to-[#4F46E5] hover:from-[#5B21B6] hover:to-[#4338CA] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#6C3AED]/30 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Estado del Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Acreditación */}
        <div className="bg-[#191731]/70 backdrop-blur-md border border-[#323859]/50 rounded-2xl p-4 flex items-center gap-4 hover:border-[#6C3AED]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#6C3AED]/20 border border-[#6C3AED]/30 flex items-center justify-center text-[#6C3AED] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#9CA3AF] uppercase">Acreditación MIMP</span>
            <div className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{formData.defensoria_codigo_mimp || 'DEMUNA-ACR-020'}</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#10B981]/20 text-[#10B981] rounded border border-[#10B981]/30">
                Vigente
              </span>
            </div>
            <span className="text-xs text-[#9CA3AF]">D.S. N° 005-2019-MIMP</span>
          </div>
        </div>

        {/* KPI 2: Entidades Aliadas */}
        <div className="bg-[#191731]/70 backdrop-blur-md border border-[#323859]/50 rounded-2xl p-4 flex items-center gap-4 hover:border-[#2FAAF7]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#2FAAF7]/20 border border-[#2FAAF7]/30 flex items-center justify-center text-[#2FAAF7] shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#9CA3AF] uppercase">Red de Derivación</span>
            <div className="text-lg font-bold text-white mt-0.5">
              {entidades.length} Entidades
            </div>
            <span className="text-xs text-[#2FAAF7]">PNP, CEM, Salud, Colegios</span>
          </div>
        </div>

        {/* KPI 3: Base de Datos */}
        <div className="bg-[#191731]/70 backdrop-blur-md border border-[#323859]/50 rounded-2xl p-4 flex items-center gap-4 hover:border-[#FFC36C]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#FFC36C]/20 border border-[#FFC36C]/30 flex items-center justify-center text-[#FFC36C] shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#9CA3AF] uppercase">Base de Datos</span>
            <div className="text-base font-bold text-white mt-0.5">
              {systemInfo?.dbEngine || 'MySQL 8.0'}
            </div>
            <span className="text-xs text-[#FFC36C]">Espacio: {systemInfo?.dbSizeMb || '1.11 MB'}</span>
          </div>
        </div>

        {/* KPI 4: Conectividad SMTP */}
        <div className="bg-[#191731]/70 backdrop-blur-md border border-[#323859]/50 rounded-2xl p-4 flex items-center gap-4 hover:border-[#10B981]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#9CA3AF] uppercase">Notificaciones Email</span>
            <div className="text-base font-bold text-white mt-0.5">
              Puerto {formData.smtp_port} ({formData.smtp_encryption.toUpperCase()})
            </div>
            <span className="text-xs text-[#10B981]">Servicio SMTP Saliente</span>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex items-center gap-2 border-b border-[#323859]/50 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'institucion', label: 'Defensoría y Acreditación', icon: Building2 },
          { id: 'entidades', label: `Red de Entidades Aliadas (${entidades.length})`, icon: Network },
          { id: 'operacion', label: 'Parámetros y Expedientes', icon: Sliders },
          { id: 'smtp', label: 'Correo y Servidor SMTP', icon: Mail },
          { id: 'sistema', label: 'Diagnóstico y Respaldo BD', icon: Server }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-t-xl text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#6C3AED] text-white bg-[#191731]/80 shadow-lg'
                  : 'border-transparent text-[#9CA3AF] hover:text-white hover:bg-[#191731]/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#6C3AED]' : 'text-[#9CA3AF]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="bg-[#191731]/50 backdrop-blur-md border border-[#323859]/50 rounded-2xl p-5 md:p-6 shadow-xl">
        {/* ======================================================== */}
        {/* TAB 1: DATOS INSTITUCIONALES Y ACREDITACIÓN MIMP */}
        {/* ======================================================== */}
        {activeTab === 'institucion' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#323859]/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#6C3AED]" />
                  Información Institucional y Membrete Oficial
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Estos datos se plasman automáticamente en las actas de conciliación, informes estadísticos MIMP y formatos oficiales.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#6C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-all flex items-center gap-2 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar Pestaña
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Municipalidad */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Municipalidad / Gobierno Local Patrocinador
                </label>
                <input
                  type="text"
                  name="institucion_nombre"
                  value={formData.institucion_nombre}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="Ej. Municipalidad Distrital de Zapillica"
                  required
                />
              </div>

              {/* Código MIMP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  Código de Acreditación MIMP
                </label>
                <input
                  type="text"
                  name="defensoria_codigo_mimp"
                  value={formData.defensoria_codigo_mimp}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-sm font-mono text-[#2FAAF7] transition-colors"
                  placeholder="Ej. DEMUNA-ACR-020-PIU"
                  required
                />
              </div>

              {/* Nombre de la Defensoría */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Denominación Oficial de la Defensoría
                </label>
                <input
                  type="text"
                  name="defensoria_nombre"
                  value={formData.defensoria_nombre}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="Ej. DEMUNA ZAPILLICA - Defensoría Municipal del Niño, Niña y Adolescente"
                  required
                />
              </div>

              {/* Colegiatura */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  N° Registro / Colegiatura Defensor
                </label>
                <input
                  type="text"
                  name="defensor_colegiatura"
                  value={formData.defensor_colegiatura}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm font-mono text-white transition-colors"
                  placeholder="Ej. CAL-45892 o REG-MIMP-2024"
                />
              </div>

              {/* Defensor Responsable */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Defensor(a) Responsable / Titular Acreditado
                </label>
                <input
                  type="text"
                  name="defensor_responsable"
                  value={formData.defensor_responsable}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="Ej. Abog. Carlos Mendoza Ruesta"
                  required
                />
              </div>

              {/* Horario de Atención */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FFC36C]" />
                  Horario de Atención Ciudadana
                </label>
                <input
                  type="text"
                  name="horario_atencion"
                  value={formData.horario_atencion}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="Lunes a Viernes 08:00 - 17:00"
                />
              </div>

              {/* Dirección Física */}
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#6C3AED]" />
                  Dirección de la Sede Central de Conciliación
                </label>
                <input
                  type="text"
                  name="direccion_sede"
                  value={formData.direccion_sede}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="Plaza de Armas s/n, Palacio Municipal - Zapillica, Ayabaca, Piura"
                  required
                />
              </div>

              {/* Teléfono Institucional */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  Teléfono de Atención / Mesa de Partes
                </label>
                <input
                  type="text"
                  name="telefono_institucional"
                  value={formData.telefono_institucional}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="(073) 381-042"
                />
              </div>

              {/* Teléfono de Emergencia */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#EF4444]" />
                  Línea de Emergencia y Resguardo NNA
                </label>
                <input
                  type="text"
                  name="telefono_emergencia"
                  value={formData.telefono_emergencia}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#EF4444] focus:outline-none text-sm text-white transition-colors"
                  placeholder="969 845 120"
                />
              </div>

              {/* Correo Institucional */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                  Correo Electrónico Institucional
                </label>
                <input
                  type="email"
                  name="email_institucional"
                  value={formData.email_institucional}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="demuna@munizapillica.gob.pe"
                  required
                />
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DIRECTORIO DE ENTIDADES ALIADAS (RED DERIVACIÓN) */}
        {/* ======================================================== */}
        {activeTab === 'entidades' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#323859]/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-[#2FAAF7]" />
                  Red de Derivación Interinstitucional y Entidades Aliadas
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Instituciones receptoras y emisoras de oficios de derivación (`F7`), denuncias policiales y auxilio judicial.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateEntidad}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2FAAF7] hover:bg-[#0284C7] text-white text-xs font-semibold transition-all shadow shrink-0"
              >
                <Plus className="w-4 h-4" />
                Nueva Entidad Aliada
              </button>
            </div>

            {/* Filtros de Entidades */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, distrito o teléfono..."
                  value={searchEntidad}
                  onChange={(e) => setSearchEntidad(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-xs text-white"
                />
              </div>

              <div>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-xs text-[#F5F4FF]"
                >
                  <option value="all">Todos los Sectores / Tipos ({entidades.length})</option>
                  {tiposEntidad.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listado de Entidades en Tabla Estilizada */}
            <div className="border border-[#323859]/50 rounded-xl overflow-hidden bg-[#0C0D22]/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#F5F4FF]">
                  <thead className="bg-[#191731] text-[#9CA3AF] uppercase font-semibold border-b border-[#323859]/60">
                    <tr>
                      <th className="px-4 py-3">Entidad / Institución</th>
                      <th className="px-4 py-3">Sector</th>
                      <th className="px-4 py-3">Ubicación / Distrito</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#323859]/30">
                    {loadingEntidades ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-[#9CA3AF]">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2FAAF7] mb-2" />
                          Cargando directorio de entidades aliadas...
                        </td>
                      </tr>
                    ) : filteredEntidades.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-[#9CA3AF]">
                          No se encontraron entidades que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredEntidades.map((item) => (
                        <tr key={item.id} className="hover:bg-[#191731]/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{item.name}</div>
                            <div className="text-[11px] text-[#9CA3AF] truncate max-w-xs">{item.address || 'Sin dirección registrada'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#2FAAF7]/10 text-[#2FAAF7] border border-[#2FAAF7]/30">
                              {item.typeName || 'General'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#9CA3AF]">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#FFC36C]" />
                              <span>{item.district || 'Zapillica'} - {item.province || 'Ayabaca'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 font-mono text-[#10B981]">
                              <Phone className="w-3 h-3" />
                              <span>{item.phone || 'S/N'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditEntidad(item)}
                                title="Editar entidad"
                                className="p-1.5 rounded-lg bg-[#191731] hover:bg-[#2FAAF7]/20 text-[#2FAAF7] border border-[#323859] transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntidad(item.id, item.name)}
                                title="Eliminar entidad"
                                className="p-1.5 rounded-lg bg-[#191731] hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#323859] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PARÁMETROS OPERATIVOS Y REGLAS DE NEGOCIO */}
        {/* ======================================================== */}
        {activeTab === 'operacion' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#323859]/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#FFC36C]" />
                  Reglas Operativas, Plazos Legales y Expedientes
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Ajuste los plazos para citaciones de conciliación, días de gracia para el pago de alimentos y códigos correlativos.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#6C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-all flex items-center gap-2 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar Parámetros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Prefijo Expediente */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  Prefijo Oficial del Código de Expediente
                </label>
                <input
                  type="text"
                  name="prefijo_expediente"
                  value={formData.prefijo_expediente}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm font-mono text-white transition-colors"
                  placeholder="EXP"
                  required
                />
                <p className="text-[11px] text-[#9CA3AF]">Formato resultante: EXP-2026-001</p>
              </div>

              {/* Año Fiscal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6C3AED]" />
                  Año Fiscal en Curso
                </label>
                <input
                  type="number"
                  name="ano_fiscal_activo"
                  value={formData.ano_fiscal_activo}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm font-mono text-white transition-colors"
                  placeholder="2026"
                  required
                />
              </div>

              {/* Meta Anual de Casos */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Meta Anual de Casos Atendidos (POI)
                </label>
                <input
                  type="number"
                  name="meta_anual_casos"
                  value={formData.meta_anual_casos}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm font-mono text-white transition-colors"
                  placeholder="180"
                  required
                />
              </div>

              {/* Días Anticipación Audiencia */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FFC36C]" />
                  Anticipación Mínima para Citaciones (Días Hábiles)
                </label>
                <input
                  type="number"
                  name="dias_anticipacion_audiencia"
                  value={formData.dias_anticipacion_audiencia}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  min="1"
                  max="15"
                  required
                />
                <p className="text-[11px] text-[#9CA3AF]">Días entre notificación y audiencia (MIMP exige mín. 3 días)</p>
              </div>

              {/* Días Gracia Pensión */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                  Días de Gracia para Pago de Pensión
                </label>
                <input
                  type="number"
                  name="dias_gracia_pension"
                  value={formData.dias_gracia_pension}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  min="0"
                  max="30"
                  required
                />
                <p className="text-[11px] text-[#9CA3AF]">Días antes de activar estado "En Mora"</p>
              </div>

              {/* Plazo Máximo 2da Citación */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Plazo Máximo entre 1ra y 2da Citación (Días)
                </label>
                <input
                  type="number"
                  name="plazo_maximo_citacion"
                  value={formData.plazo_maximo_citacion}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  min="3"
                  max="30"
                  required
                />
              </div>

              {/* Jurisdicción Territorial */}
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  Unidad Territorial y Ámbito Jurisdiccional
                </label>
                <input
                  type="text"
                  name="unidad_territorial"
                  value={formData.unidad_territorial}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#6C3AED] focus:outline-none text-sm text-white transition-colors"
                  placeholder="Piura - Ayabaca - Zapillica y Caseríos Aledaños"
                  required
                />
              </div>
            </div>

            {/* Switches de Alertas Automáticas */}
            <div className="pt-4 border-t border-[#323859]/40 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Automatización de Alertas y Notificaciones del Sistema
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/60 cursor-pointer hover:border-[#6C3AED] transition-colors">
                  <input
                    type="checkbox"
                    name="alerta_audiencias_activas"
                    checked={formData.alerta_audiencias_activas === '1'}
                    onChange={handleConfigChange}
                    className="w-4 h-4 rounded text-[#6C3AED] bg-[#191731] border-[#323859] focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Recordatorios de Audiencias</div>
                    <div className="text-[10px] text-[#9CA3AF]">Notificar 24 horas antes de cada cita</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/60 cursor-pointer hover:border-[#10B981] transition-colors">
                  <input
                    type="checkbox"
                    name="alerta_pensiones_activas"
                    checked={formData.alerta_pensiones_activas === '1'}
                    onChange={handleConfigChange}
                    className="w-4 h-4 rounded text-[#10B981] bg-[#191731] border-[#323859] focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Alertas de Cuotas en Mora</div>
                    <div className="text-[10px] text-[#9CA3AF]">Generar alerta automática por impago</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/60 cursor-pointer hover:border-[#2FAAF7] transition-colors">
                  <input
                    type="checkbox"
                    name="notificaciones_correo"
                    checked={formData.notificaciones_correo === '1'}
                    onChange={handleConfigChange}
                    className="w-4 h-4 rounded text-[#2FAAF7] bg-[#191731] border-[#323859] focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Notificaciones por Email</div>
                    <div className="text-[10px] text-[#9CA3AF]">Envío a ciudadanos vía SMTP</div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SERVIDOR DE CORREO SMTP */}
        {/* ======================================================== */}
        {activeTab === 'smtp' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#323859]/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#10B981]" />
                  Servidor de Correo Saliente (SMTP Institucional)
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Configuración para el envío de recordatorios de audiencias, resúmenes de pago y recuperación de contraseñas.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="px-3.5 py-2 rounded-xl bg-[#191731] hover:bg-[#25224A] text-[#10B981] border border-[#10B981]/30 hover:border-[#10B981] text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Probar Conexión SMTP
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#6C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-all flex items-center gap-2 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar SMTP
                </button>
              </div>
            </div>

            {/* Diagnóstico de Prueba SMTP */}
            {smtpResult && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                  smtpResult.success
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                    : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                }`}
              >
                {smtpResult.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{smtpResult.message}</div>
                  {smtpResult.banner && (
                    <div className="mt-1 font-mono text-[11px] opacity-80">
                      Respuesta del servidor: {smtpResult.banner}
                    </div>
                  )}
                  {smtpResult.authenticatedUser && (
                    <div className="mt-0.5 text-[11px]">
                      Usuario autenticado: {smtpResult.authenticatedUser}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Host SMTP */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Servidor Host SMTP
                </label>
                <input
                  type="text"
                  name="smtp_host"
                  value={formData.smtp_host}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#10B981] focus:outline-none text-sm font-mono text-white transition-colors"
                  placeholder="mail.popydev.com o smtp.gmail.com"
                  required
                />
              </div>

              {/* Puerto */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Puerto SMTP
                </label>
                <input
                  type="number"
                  name="smtp_port"
                  value={formData.smtp_port}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#10B981] focus:outline-none text-sm font-mono text-white transition-colors"
                  placeholder="465 o 587"
                  required
                />
              </div>

              {/* Usuario / Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Usuario o Correo Autenticado
                </label>
                <input
                  type="text"
                  name="smtp_user"
                  value={formData.smtp_user}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#10B981] focus:outline-none text-sm text-white transition-colors"
                  placeholder="datossistema@popydev.com"
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  Contraseña de Aplicación SMTP
                </label>
                <input
                  type="password"
                  name="smtp_pass"
                  value={formData.smtp_pass}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#10B981] focus:outline-none text-sm text-white transition-colors"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Cifrado */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Tipo de Cifrado
                </label>
                <select
                  name="smtp_encryption"
                  value={formData.smtp_encryption}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#10B981] focus:outline-none text-sm text-white transition-colors"
                >
                  <option value="ssl">SSL (Recomendado para puerto 465)</option>
                  <option value="tls">TLS (Recomendado para puerto 587)</option>
                  <option value="none">Sin cifrado (Desarrollo local)</option>
                </select>
              </div>

              {/* Nombre Emisor */}
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Nombre Remitente Mostrado al Ciudadano
                </label>
                <input
                  type="text"
                  name="smtp_from_name"
                  value={formData.smtp_from_name}
                  onChange={handleConfigChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#10B981] focus:outline-none text-sm text-white transition-colors"
                  placeholder="DEMUNA Perú - Sistema de Gestión Municipal"
                  required
                />
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 5: DIAGNÓSTICO DEL SISTEMA Y RESPALDO BD */}
        {/* ======================================================== */}
        {activeTab === 'sistema' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#323859]/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#6C3AED]" />
                  Diagnóstico del Entorno, Seguridad y Respaldos
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Monitoreo de almacenamiento de la base de datos MySQL, métricas de tablas y generación de copias de seguridad.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2FAAF7] hover:bg-[#0284C7] text-white text-xs font-semibold transition-all shadow shrink-0"
              >
                <Download className="w-4 h-4" />
                Descargar Dump SQL Completo
              </button>
            </div>

            {/* Cuadrícula de Información Técnica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/50">
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase">Intérprete Backend</span>
                <div className="text-base font-bold text-white mt-1">PHP {systemInfo?.phpVersion || '8.1.x'}</div>
                <span className="text-xs text-[#10B981] flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Runtime Activo
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/50">
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase">Motor de Datos</span>
                <div className="text-base font-bold text-white mt-1">{systemInfo?.dbEngine || 'MySQL 8.0'}</div>
                <span className="text-xs text-[#2FAAF7] flex items-center gap-1 mt-0.5">
                  <Database className="w-3 h-3" /> Base: {systemInfo?.dbName || 'popydev_demuna'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/50">
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase">Tamaño de BD en Disco</span>
                <div className="text-base font-bold text-white mt-1">{systemInfo?.dbSizeMb || '1.11 MB'}</div>
                <span className="text-xs text-[#FFC36C] flex items-center gap-1 mt-0.5">
                  <HardDrive className="w-3 h-3" /> Almacenamiento Óptimo
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0C0D22]/60 border border-[#323859]/50">
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase">Zona Horaria Servidor</span>
                <div className="text-base font-bold text-white mt-1">{systemInfo?.timezone || 'America/Lima'}</div>
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {systemInfo?.serverTime || 'Sincronizado'}
                </span>
              </div>
            </div>

            {/* Métricas de Registros en Tablas Principales */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-[#6C3AED]" />
                Volumen de Registros por Entidad del Sistema
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Expedientes', count: systemInfo?.counts?.expedientes ?? 15, color: '#6C3AED' },
                  { label: 'Actas y Resoluciones', count: systemInfo?.counts?.actas ?? 38, color: '#2FAAF7' },
                  { label: 'Fichas y Orientaciones', count: systemInfo?.counts?.fichas ?? 44, color: '#10B981' },
                  { label: 'Agenda / Audiencias', count: systemInfo?.counts?.eventos ?? 20, color: '#FFC36C' },
                  { label: 'Notificaciones', count: systemInfo?.counts?.notificaciones ?? 22, color: '#EF4444' },
                  { label: 'Usuarios / Personal', count: systemInfo?.counts?.usuarios ?? 14, color: '#8B5CF6' },
                  { label: 'Entidades Aliadas', count: systemInfo?.counts?.entidades ?? 14, color: '#06B6D4' },
                  { label: 'Ciudadanos Registrados', count: systemInfo?.counts?.personas ?? 31, color: '#F59E0B' }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#0C0D22]/50 border border-[#323859]/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] text-[#9CA3AF] font-medium">{stat.label}</div>
                      <div className="text-lg font-extrabold text-white mt-0.5">{stat.count}</div>
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Banner de Políticas y Buenas Prácticas */}
            <div className="p-4 rounded-xl bg-[#6C3AED]/10 border border-[#6C3AED]/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#6C3AED] shrink-0 mt-0.5" />
              <div className="text-xs text-[#F5F4FF] leading-relaxed">
                <span className="font-bold text-[#6C3AED]">Política de Continuidad Institucional: </span>
                De conformidad con la normativa del MIMP para Defensorías Acreditadas, se recomienda descargar y custodiar una copia de seguridad semanal de la base de datos SQL antes de cada cierre estadístico trimestral.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: REGISTRAR / EDITAR ENTIDAD ALIADA */}
      {/* ======================================================== */}
      {isEntidadModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0C0D22]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191731] border border-[#323859] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            {/* Cabecera Modal */}
            <div className="px-6 py-4 border-b border-[#323859]/60 flex items-center justify-between bg-[#11152e]">
              <div className="flex items-center gap-2.5">
                <Network className="w-5 h-5 text-[#2FAAF7]" />
                <h3 className="text-base font-bold text-white">
                  {editingEntidad ? 'Editar Entidad Aliada' : 'Nueva Entidad en Red de Derivación'}
                </h3>
              </div>
              <button
                onClick={() => setIsEntidadModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#323859]/50 text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario Modal */}
            <form onSubmit={handleSaveEntidad} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Nombre Institucional de la Entidad
                </label>
                <input
                  type="text"
                  value={entidadForm.name}
                  onChange={(e) => setEntidadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Comisaría Rural PNP Zapillica"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                    Sector / Tipo de Entidad
                  </label>
                  <select
                    value={entidadForm.typeId}
                    onChange={(e) => setEntidadForm(prev => ({ ...prev, typeId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-xs text-white"
                  >
                    {tiposEntidad.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={entidadForm.phone}
                    onChange={(e) => setEntidadForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(073) 381-010"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Dirección o Sede
                </label>
                <input
                  type="text"
                  value={entidadForm.address}
                  onChange={(e) => setEntidadForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle Comercio s/n, Zapillica"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0D22]/80 border border-[#323859] focus:border-[#2FAAF7] focus:outline-none text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase">Distrito</label>
                  <input
                    type="text"
                    value={entidadForm.district}
                    onChange={(e) => setEntidadForm(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0D22]/80 border border-[#323859] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase">Provincia</label>
                  <input
                    type="text"
                    value={entidadForm.province}
                    onChange={(e) => setEntidadForm(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0D22]/80 border border-[#323859] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase">Dpto.</label>
                  <input
                    type="text"
                    value={entidadForm.department}
                    onChange={(e) => setEntidadForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0D22]/80 border border-[#323859] text-xs text-white"
                  />
                </div>
              </div>

              {/* Botones Modal */}
              <div className="pt-4 border-t border-[#323859]/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEntidadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0C0D22] hover:bg-[#323859]/40 text-[#9CA3AF] hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEntidad}
                  className="px-5 py-2 rounded-xl bg-[#2FAAF7] hover:bg-[#0284C7] text-white text-xs font-semibold transition-all shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {savingEntidad ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {editingEntidad ? 'Guardar Cambios' : 'Registrar Entidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ConfiguracionPage;

