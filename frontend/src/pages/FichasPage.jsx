import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Users,
  FileText,
  Printer,
  Eye,
  ArrowRight,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Home,
  Heart,
  Baby,
  RefreshCw,
  Download,
  X,
  Sparkles,
  MapPin,
  Phone,
  Shield,
  Building2,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const FichasPage = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [stats, setStats] = useState({ total: 0, recepcion: 0, entrevista: 0, visita: 0, seguimiento: 0, orientacion: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas'); // 'todas' | 'recepcion' | 'entrevista' | 'visita' | 'seguimiento' | 'orientacion'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [expedientesList, setExpedientesList] = useState([]);

  // Modal Nueva Ficha
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savingFicha, setSavingFicha] = useState(false);
  const [formType, setFormType] = useState('1'); // '1' = F1, '2' = F2, '3' = F3, '17' = F11, '99' = Orientación
  const [form, setForm] = useState({
    expedienteId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    // F1
    atencionPrevia: 'No',
    detalleAtencion: '',
    resumenHecho: '',
    accionArealizar: 'Diligencias e investigación preliminar',
    // F2, F3, F11
    ubicacion: 'Oficina DEMUNA',
    // Orientación express
    dni: '',
    names: '',
    surnames: '',
    phone: '',
    address: '',
    age: '',
    ageUnit: 'año',
    reason: ''
  });

  // Modal Previsualización / Impresión
  const [previewFicha, setPreviewFicha] = useState(null);
  const [previewDetail, setPreviewDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Cargar lista de fichas y stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'todas') params.category = selectedCategory;

      const [resFichas, resStats] = await Promise.all([
        apiClient.get(ENDPOINTS.FICHAS, { params }),
        apiClient.get(ENDPOINTS.FICHA_STATS)
      ]);

      if (resFichas.data?.success) {
        setFichas(resFichas.data.data);
      }
      if (resStats.data?.success) {
        setStats(resStats.data.data);
      }
    } catch (err) {
      console.error("Error al cargar fichas", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista resumida de expedientes para el modal
  useEffect(() => {
    apiClient.get(ENDPOINTS.EXPEDIENTES).then(res => {
      if (res.data?.success) {
        setExpedientesList(res.data.data);
        if (res.data.data.length > 0) {
          setForm(prev => ({ ...prev, expedienteId: res.data.data[0].id }));
        }
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Autocompletar DNI en modal express
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

  // Guardar nueva ficha
  const handleSaveFicha = async (e) => {
    e.preventDefault();
    setSavingFicha(true);
    try {
      const payload = {
        typeId: parseInt(formType, 10),
        expedienteId: formType !== '99' ? form.expedienteId : null,
        title: form.title,
        date: form.date,
        atencionPrevia: form.atencionPrevia,
        detalleAtencion: form.detalleAtencion,
        resumenHecho: form.resumenHecho,
        accionArealizar: form.accionArealizar,
        ubicacion: form.ubicacion,
        dni: form.dni,
        names: form.names,
        surnames: form.surnames,
        phone: form.phone,
        address: form.address,
        age: form.age,
        ageUnit: form.ageUnit,
        reason: form.reason
      };

      const res = await apiClient.post(ENDPOINTS.FICHAS, payload);
      if (res.data?.success) {
        setIsCreateModalOpen(false);
        showToast("Ficha de atención registrada con éxito.");
        fetchData();
      } else {
        alert(res.data?.message || "Error al registrar ficha");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al comunicarse con el servidor");
    } finally {
      setSavingFicha(false);
    }
  };

  // Abrir previsualización oficial para imprimir
  const handleOpenPreview = async (item) => {
    setPreviewFicha(item);
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(ENDPOINTS.FICHA_DETAIL(item.id, item.source));
      if (res.data?.success) {
        setPreviewDetail(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar detalle para previsualizar", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Promover orientación express a caso formal
  const handlePromoteToCase = (item) => {
    navigate('/expedientes/nuevo', {
      state: {
        initialSubject: item.expedienteSubject || item.title,
        initialInformant: {
          names: item.applicantName,
          phone: '',
          address: ''
        }
      }
    });
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (fichas.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const headers = ['ID', 'Tipo', 'Nombre Ficha', 'Expediente', 'Materia', 'Beneficiario / Solicitante', 'Fecha', 'Defensor'];
    const rows = fichas.map(f => [
      f.id,
      f.typeName,
      `"${(f.title || '').replace(/"/g, '""')}"`,
      f.expedienteCode || 'Express',
      `"${(f.expedienteSubject || '').replace(/"/g, '""')}"`,
      `"${(f.childName || f.applicantName || 'Confidencial').replace(/"/g, '""')}"`,
      f.date,
      `"${(f.workerName || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DEMUNA_Fichas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formato temático por tipo de ficha
  const getFichaBadge = (typeId) => {
    const id = parseInt(typeId, 10);
    switch (id) {
      case 1: // Recepción
        return {
          bg: 'bg-[#7546e8]/15 text-[#a47bf8] border-[#7546e8]/30',
          dot: 'bg-[#7546e8]',
          label: 'F1: Recepción',
          color: '#7546e8'
        };
      case 2: // Entrevista
        return {
          bg: 'bg-[#269fe6]/15 text-[#6bc5f4] border-[#269fe6]/30',
          dot: 'bg-[#269fe6]',
          label: 'F2: Entrevista',
          color: '#269fe6'
        };
      case 3: // Visita
        return {
          bg: 'bg-[#f0b357]/15 text-[#f2bc70] border-[#f0b357]/30',
          dot: 'bg-[#f0b357]',
          label: 'F3: Visita Domiciliaria',
          color: '#f0b357'
        };
      case 17: // Seguimiento
        return {
          bg: 'bg-[#39bca2]/15 text-[#5eead4] border-[#39bca2]/30',
          dot: 'bg-[#39bca2]',
          label: 'F11: Seguimiento',
          color: '#39bca2'
        };
      case 99: // Orientación express
      default:
        return {
          bg: 'bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/30',
          dot: 'bg-[#ec4899]',
          label: 'Orientación Rápida',
          color: '#ec4899'
        };
    }
  };

  const tabs = [
    { id: 'todas', label: 'Todas las Fichas', count: stats.total },
    { id: 'recepcion', label: 'Recepción (F1)', count: stats.recepcion, color: '#7546e8' },
    { id: 'entrevista', label: 'Entrevistas (F2)', count: stats.entrevista, color: '#269fe6' },
    { id: 'visita', label: 'Visitas (F3)', count: stats.visita, color: '#f0b357' },
    { id: 'seguimiento', label: 'Seguimiento (F11)', count: stats.seguimiento, color: '#39bca2' },
    { id: 'orientacion', label: 'Orientaciones Rápidas', count: stats.orientacion, color: '#ec4899' },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#191731] border border-[#6c3aed] text-white text-xs font-bold rounded-2xl shadow-2xl shadow-[#6c3aed]/30 flex items-center space-x-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= CABECERA INSTITUCIONAL ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
              Fichas de atención y seguimiento
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#6c3aed]/15 text-[#8b59f6] border border-[#6c3aed]/30">
              {stats.total} registradas
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Documentación de recepción de casos, entrevistas psicológicas, visitas domiciliarias y monitoreo continuo
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchData()}
            title="Actualizar listado"
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#6c3aed] text-[var(--muted)] hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6c3aed]' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#6c3aed] text-[var(--text)] text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-[#2faaf7]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] hover:brightness-110 text-white text-xs font-black shadow-lg shadow-[#6c3aed]/25 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nueva Ficha</span>
          </button>
        </div>
      </div>

      {/* ================= 4 MINI KPIS DARK TECH ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: F1 Recepción */}
        <div
          onClick={() => setSelectedCategory('recepcion')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'recepcion' ? 'border-[#7546e8] shadow-lg shadow-[#7546e8]/15 ring-1 ring-[#7546e8]' : 'border-[var(--line)] hover:border-[#7546e8]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#7546e8]/15 text-[#a47bf8] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#a47bf8] uppercase tracking-wider">Ficha 1</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Fichas de Recepción</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.recepcion}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">Apertura formal de casos</span>
        </div>

        {/* KPI 2: F2 Entrevistas */}
        <div
          onClick={() => setSelectedCategory('entrevista')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'entrevista' ? 'border-[#269fe6] shadow-lg shadow-[#269fe6]/15 ring-1 ring-[#269fe6]' : 'border-[var(--line)] hover:border-[#269fe6]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#269fe6]/15 text-[#6bc5f4] flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#6bc5f4] uppercase tracking-wider">Ficha 2</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Fichas de Entrevista</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.entrevista}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">Psicológica / Social</span>
        </div>

        {/* KPI 3: F3 Visitas */}
        <div
          onClick={() => setSelectedCategory('visita')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'visita' ? 'border-[#f0b357] shadow-lg shadow-[#f0b357]/15 ring-1 ring-[#f0b357]' : 'border-[var(--line)] hover:border-[#f0b357]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#f0b357]/15 text-[#f2bc70] flex items-center justify-center">
              <Home className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#f2bc70] uppercase tracking-wider">Ficha 3</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Visitas Domiciliarias</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.visita}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">Inspección de campo in situ</span>
        </div>

        {/* KPI 4: F11 Seguimiento */}
        <div
          onClick={() => setSelectedCategory('seguimiento')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'seguimiento' ? 'border-[#39bca2] shadow-lg shadow-[#39bca2]/15 ring-1 ring-[#39bca2]' : 'border-[var(--line)] hover:border-[#39bca2]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#39bca2]/15 text-[#5eead4] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#5eead4] uppercase tracking-wider">Ficha 11</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Fichas de Seguimiento</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.seguimiento}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">Monitoreo post-conciliación</span>
        </div>
      </div>

      {/* ================= PESTAÑAS DE TIPOS DE FICHA ================= */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--line)]">
        {tabs.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border-b-2 -mb-[1px] ${
                isActive
                  ? 'border-[#6c3aed] text-white bg-[var(--surface)] shadow-sm'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]/50'
              }`}
            >
              {tab.color && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.color }} />
              )}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-[#6c3aed]/20 text-[#8b59f6]' : 'bg-[var(--surface-2)] text-[var(--muted)]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= BARRA DE BÚSQUEDA Y CONTROLES ================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Buscador */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, materia, NNA o defensor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:border-[#6c3aed] outline-none"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {/* Alternar Vista: Tabla vs Cuadrícula */}
          <div className="flex items-center p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              title="Vista en tabla"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-[#6c3aed] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-[#6c3aed] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENIDO: TABLA O CUADRÍCULA ================= */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6c3aed] border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)] font-medium">Cargando fichas de atención...</p>
        </div>
      ) : fichas.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
          <ClipboardList className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[var(--text)]">No se encontraron fichas</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            No hay registros de fichas en esta categoría o no coinciden con el término de búsqueda.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[#6c3aed] text-white text-xs font-bold rounded-xl shadow-md"
          >
            + Registrar Ficha Ahora
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA TABLA INSTITUCIONAL */
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)] uppercase font-bold text-[10.5px] border-b border-[var(--line)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">N° / Registro</th>
                  <th className="py-3 px-4">Tipo de Ficha</th>
                  <th className="py-3 px-4">Expediente / Asunto</th>
                  <th className="py-3 px-4">Beneficiario / Solicitante</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Defensor Asignado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
                {fichas.map((item) => {
                  const badge = getFichaBadge(item.typeId);
                  return (
                    <tr key={`${item.source}-${item.id}`} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                      {/* N° / ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#8b59f6]">
                        #{String(item.actNumber || item.id).padStart(3, '0')}
                      </td>

                      {/* Tipo de Ficha Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Expediente / Asunto */}
                      <td className="py-3 px-4">
                        {item.expedienteId ? (
                          <div>
                            <Link
                              to={`/expedientes/${item.expedienteId}`}
                              className="font-mono font-bold text-[#2faaf7] hover:underline"
                            >
                              {item.expedienteCode}
                            </Link>
                            <p className="text-[11px] text-[var(--muted)] line-clamp-1 max-w-xs">
                              {item.title || item.expedienteSubject}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono text-[11px] font-bold text-[#ec4899]">
                              {item.expedienteCode}
                            </span>
                            <p className="text-[11px] text-[var(--muted)] line-clamp-1 max-w-xs">
                              {item.title}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Beneficiario / Solicitante */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text)]">
                          {item.childName ? (
                            <span className="flex items-center space-x-1">
                              <Baby className="w-3.5 h-3.5 text-[#ffc36c] shrink-0" />
                              <span className="truncate max-w-[180px]">{item.childName}</span>
                            </span>
                          ) : item.applicantName ? (
                            <span className="flex items-center space-x-1">
                              <User className="w-3.5 h-3.5 text-[#2faaf7] shrink-0" />
                              <span className="truncate max-w-[180px]">{item.applicantName}</span>
                            </span>
                          ) : (
                            <span className="text-[var(--muted)] italic">Confidencial</span>
                          )}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-4 text-[var(--muted)] font-mono text-[11px] whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Defensor Asignado */}
                      <td className="py-3 px-4 text-xs font-medium text-[var(--text)] truncate max-w-[160px]">
                        {item.workerName || 'Equipo DEMUNA'}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenPreview(item)}
                            title="Previsualizar e Imprimir formato oficial"
                            className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-[var(--text)] transition-all"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#2faaf7]" />
                          </button>

                          {item.expedienteId ? (
                            <Link
                              to={`/expedientes/${item.expedienteId}`}
                              title="Ver expediente 360°"
                              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-[var(--text)] transition-all"
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-[#8b59f6]" />
                            </Link>
                          ) : (
                            <button
                              onClick={() => handlePromoteToCase(item)}
                              title="Promover a Expediente formal"
                              className="px-2 py-1 rounded-lg bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30 text-[10px] font-bold hover:bg-[#ec4899]/25 transition-all"
                            >
                              Promover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA EN CUADRÍCULA (GRID CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fichas.map((item) => {
            const badge = getFichaBadge(item.typeId);
            return (
              <div
                key={`${item.source}-${item.id}`}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-sm hover:border-[#6c3aed]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-[#8b59f6]">
                      #{String(item.actNumber || item.id).padStart(3, '0')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text)] mt-3 line-clamp-1">
                    {item.title || item.expedienteSubject}
                  </h4>

                  {item.expedienteCode && (
                    <div className="mt-1 flex items-center space-x-1 text-xs text-[var(--muted)]">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Caso:</span>
                      <span className="font-mono font-bold text-[#2faaf7]">{item.expedienteCode}</span>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-[var(--surface-2)] rounded-xl space-y-1.5 text-xs">
                    {item.childName && (
                      <div className="flex items-center space-x-1.5 text-[var(--text)]">
                        <Baby className="w-3.5 h-3.5 text-[#ffc36c] shrink-0" />
                        <span className="truncate">NNA: <strong>{item.childName}</strong></span>
                      </div>
                    )}
                    {item.applicantName && (
                      <div className="flex items-center space-x-1.5 text-[var(--muted)]">
                        <User className="w-3.5 h-3.5 text-[#2faaf7] shrink-0" />
                        <span className="truncate">Parte: {item.applicantName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                      <span>{item.date}</span>
                      <span className="truncate max-w-[130px]">{item.workerName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                  <button
                    onClick={() => handleOpenPreview(item)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-xs font-bold text-[var(--text)] transition-all flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#2faaf7]" />
                    <span>Imprimir</span>
                  </button>

                  {item.expedienteId ? (
                    <Link
                      to={`/expedientes/${item.expedienteId}`}
                      className="px-3 py-1.5 rounded-lg bg-[#6c3aed]/15 text-[#8b59f6] border border-[#6c3aed]/30 hover:bg-[#6c3aed]/25 text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <span>Ver Caso</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handlePromoteToCase(item)}
                      className="px-3 py-1.5 rounded-lg bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30 hover:bg-[#ec4899]/25 text-xs font-bold transition-all"
                    >
                      Promover a Caso
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: NUEVA FICHA DE ATENCIÓN ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[var(--text)]">Registro de Ficha de Atención</h3>
                  <p className="text-[11px] text-[var(--muted)]">Diligencia formal o consulta ciudadana express</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFicha} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Tipo de Ficha */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1.5">
                  Tipo de Ficha a Registrar *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: '1', label: 'F1: Recepción', color: '#7546e8' },
                    { id: '2', label: 'F2: Entrevista', color: '#269fe6' },
                    { id: '3', label: 'F3: Visita Domiciliaria', color: '#f0b357' },
                    { id: '17', label: 'F11: Seguimiento', color: '#39bca2' },
                    { id: '99', label: 'Orientación Rápida', color: '#ec4899' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormType(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 ${
                        formType === t.id
                          ? 'bg-[var(--surface-2)] border-[#6c3aed] text-[var(--text)] shadow-sm'
                          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:border-[#6c3aed]/50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Si NO es orientación: Expediente asociado */}
              {formType !== '99' ? (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                    Expediente Asociado *
                  </label>
                  <select
                    required
                    value={form.expedienteId}
                    onChange={(e) => setForm({ ...form, expedienteId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold focus:border-[#6c3aed] outline-none cursor-pointer"
                  >
                    {expedientesList.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.code} &bull; {exp.subject} ({exp.workerName})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Datos del ciudadano para Orientación express */
                <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                    <span className="text-xs font-bold text-[#ec4899]">Datos del Ciudadano (Atención Express)</span>
                    <span className="text-[10px] text-[var(--muted)]">Consulta RENIEC activa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">DNI (8 dígitos)</label>
                      <input
                        type="text"
                        maxLength="8"
                        placeholder="Buscar DNI..."
                        value={form.dni}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setForm({ ...form, dni: val });
                          if (val.length === 8) handleDniLookup(val);
                        }}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Nombres *</label>
                      <input
                        type="text"
                        required
                        value={form.names}
                        onChange={(e) => setForm({ ...form, names: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Apellidos *</label>
                      <input
                        type="text"
                        required
                        value={form.surnames}
                        onChange={(e) => setForm({ ...form, surnames: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Teléfono</label>
                      <input
                        type="text"
                        placeholder="9XXXXXXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Dirección / Caserío</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Título de la Ficha */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                  Título / Descripción de la Ficha *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ficha de Entrevista Inicial con Menor de Edad"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs focus:border-[#6c3aed] outline-none"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                  Fecha de la Diligencia *
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs focus:border-[#6c3aed] outline-none"
                />
              </div>

              {/* Campos específicos F1 (Recepción) */}
              {formType === '1' && (
                <div className="space-y-3 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--line)]">
                  <div className="flex items-center space-x-4">
                    <label className="text-xs font-bold text-[var(--text)]">¿Hubo atención previa?</label>
                    <label className="inline-flex items-center text-xs text-[var(--muted)]">
                      <input
                        type="radio"
                        name="prev"
                        checked={form.atencionPrevia === 'Si'}
                        onChange={() => setForm({ ...form, atencionPrevia: 'Si' })}
                        className="mr-1 accent-[#6c3aed]"
                      />
                      Sí
                    </label>
                    <label className="inline-flex items-center text-xs text-[var(--muted)]">
                      <input
                        type="radio"
                        name="prev"
                        checked={form.atencionPrevia === 'No'}
                        onChange={() => setForm({ ...form, atencionPrevia: 'No' })}
                        className="mr-1 accent-[#6c3aed]"
                      />
                      No
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">
                      Resumen del Hecho Puesto en Conocimiento
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Relato de los hechos..."
                      value={form.resumenHecho}
                      onChange={(e) => setForm({ ...form, resumenHecho: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">
                      Acción Inmediata a Realizar
                    </label>
                    <input
                      type="text"
                      value={form.accionArealizar}
                      onChange={(e) => setForm({ ...form, accionArealizar: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Campos específicos F2, F3, F11 (Ubicación) */}
              {(formType === '2' || formType === '3' || formType === '17') && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                    Lugar / Ubicación de la Diligencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Domicilio del menor / Caserío El Palmo / Oficina DEMUNA"
                    value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs focus:border-[#6c3aed] outline-none"
                  />
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingFicha}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white text-xs font-black shadow-lg shadow-[#6c3aed]/20 hover:brightness-110 disabled:opacity-50 flex items-center space-x-2"
                >
                  {savingFicha ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Registrar Ficha</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVISUALIZAR E IMPRIMIR FICHA OFICIAL ================= */}
      {previewFicha && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-2)]">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-[#2faaf7]" />
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text)]">Formato Oficial de Impresión DEMUNA</h3>
                  <p className="text-[10px] text-[var(--muted)]">Vista previa conforme al formato estandarizado MIMP</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2faaf7] hover:bg-[#2faaf7]/90 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Documento</span>
                </button>
                <button
                  onClick={() => { setPreviewFicha(null); setPreviewDetail(null); }}
                  className="text-[var(--muted)] hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documento oficial listo para imprimir */}
            <div className="p-8 bg-white text-slate-900 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 font-serif leading-relaxed text-xs">
              
              {/* Membrete Oficial */}
              <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
                <p className="font-bold tracking-widest uppercase text-[11px] text-slate-700">República del Perú</p>
                <p className="font-extrabold text-sm uppercase text-slate-900 mt-0.5">Municipalidad Distrital &bull; DEMUNA</p>
                <p className="text-[10px] text-slate-600">Defensoría Municipal del Niño y del Adolescente</p>
                <div className="inline-block mt-3 px-3 py-1 bg-slate-100 border border-slate-300 font-sans font-bold text-xs uppercase tracking-wider text-slate-800">
                  {previewFicha.typeName} &bull; REGISTRO N° {String(previewFicha.actNumber || previewFicha.id).padStart(4, '0')}
                </div>
              </div>

              {/* Datos de cabecera del caso */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded font-sans text-[11px] mb-5">
                <div>
                  <p><strong>Expediente:</strong> {previewFicha.expedienteCode}</p>
                  <p><strong>Materia:</strong> {previewFicha.expedienteSubject || previewFicha.title}</p>
                </div>
                <div>
                  <p><strong>Fecha de Diligencia:</strong> {previewFicha.date}</p>
                  <p><strong>Especialista DEMUNA:</strong> {previewFicha.workerName}</p>
                </div>
              </div>

              {/* Partes Involucradas si existen */}
              {previewDetail?.nna && previewDetail.nna.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-sans font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-2">
                    Niña, Niño o Adolescente Beneficiario(a)
                  </h5>
                  <div className="space-y-1">
                    {previewDetail.nna.map((n, i) => (
                      <p key={i}>
                        &bull; <strong>{n.fullName}</strong> — DNI: {n.dni || 'Sin DNI'} | Edad: {n.age ? `${n.age} ${n.ageUnit}s` : 'Por determinar'} | Sexo: {n.gender}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuerpo del Formato Oficial según Tipo */}
              <div className="space-y-4 my-6 text-justify">
                <h5 className="font-sans font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1">
                  Contenido de la Diligencia Institucional
                </h5>

                <p>
                  En la localidad correspondiente, siendo el día <strong>{previewFicha.date}</strong>, ante la presencia del Defensor y Especialista de la DEMUNA <strong>{previewFicha.workerName}</strong>, se deja formal constancia documental de la actuación realizada bajo el expediente <strong>{previewFicha.expedienteCode}</strong>:
                </p>

                {previewDetail?.f1Resumen ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-2">
                    <p><strong>Hechos puestos en conocimiento:</strong></p>
                    <p className="italic text-slate-700">"{previewDetail.f1Resumen}"</p>
                    <p><strong>Acciones preliminares a realizar:</strong> {previewDetail.f1Accion || 'Diligencias de ley'}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <p><strong>Motivo / Descripción de la Actuación:</strong></p>
                    <p className="italic text-slate-700">"{previewFicha.title}"</p>
                  </div>
                )}

                <p>
                  Habiendo concluido la presente diligencia y estando conformes los participantes con lo expuesto, se procede a la firma y sellado del presente documento en señal de conformidad e inicio del trámite protector institucional.
                </p>
              </div>

              {/* Bloque de Firmas Oficiales */}
              <div className="grid grid-cols-3 gap-6 pt-16 mt-12 text-center font-sans text-[10px]">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">{previewFicha.workerName}</p>
                  <p className="text-slate-500">Defensor(a) Responsable</p>
                  <p className="text-slate-500">DEMUNA Perú</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">
                    {previewFicha.applicantName || 'Solicitante / Informante'}
                  </p>
                  <p className="text-slate-500">Parte Interesada</p>
                  <p className="text-slate-500">DNI: ______________</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Especialista Interviniente</p>
                  <p className="text-slate-500">Psicología / Trabajo Social</p>
                  <p className="text-slate-500">Sello Institucional</p>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-3 border-t border-[var(--line)] flex justify-end bg-[var(--surface-2)]">
              <button
                onClick={() => { setPreviewFicha(null); setPreviewDetail(null); }}
                className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-white"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

