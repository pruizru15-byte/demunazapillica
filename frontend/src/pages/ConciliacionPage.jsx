import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  Scale,
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
  AlertTriangle,
  RefreshCw,
  Download,
  X,
  Sparkles,
  MapPin,
  Phone,
  Shield,
  Building2,
  DollarSign,
  RotateCcw,
  Send,
  Baby,
  Gavel,
  Check
} from 'lucide-react';

export const ConciliacionPage = () => {
  const navigate = useNavigate();
  const [actas, setActas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    conciliaciones: 0,
    invitaciones: 0,
    inasistencias: 0,
    compromisos: 0,
    derivaciones: 0,
    pensiones: { totalCuotas: 0, cuotasPagadas: 0, cuotasPendientes: 0, montoTotalPactado: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('conciliacion'); // 'todas' | 'conciliacion' | 'invitacion' | 'inasistencia' | 'compromiso' | 'derivacion' | 'pensiones'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [expedientesList, setExpedientesList] = useState([]);

  // Modal Nueva Acta / Conciliación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savingActa, setSavingActa] = useState(false);
  const [actaType, setActaType] = useState('12'); // 12 = Conciliación, 16 = Compromiso, 4 = Invitación, 8 = Derivación, 9 = Inasistencia
  const [form, setForm] = useState({
    expedienteId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    // Conciliación F9A
    materias: 'Alimentos, Régimen de Visitas y Tenencia',
    tipoAcuerdo: 'Acuerdo Total',
    hechos: 'Las partes se presentan voluntariamente a la audiencia convocada por la DEMUNA.',
    puntosControversia: 'Fijación del monto de pensión de alimentos y días del régimen de visitas.',
    termyCond: 'El citado se compromete a acudir puntualmente con la pensión mensual acordada.',
    montoPension: '350',
    numCuotas: '6',
    regAbogado: 'CALL-48921',
    colAbogados: 'Colegio de Abogados de Piura',
    testigoNombre: '',
    testigoDni: '',
    // Compromiso F10
    compromisos: 'Las partes se comprometen al trato respetuoso y a no generar conflictos en presencia del menor.',
    // Invitación F4/F5
    fechaCita: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    horaCita: '10:00:00',
    asunto: 'Audiencia de Conciliación Extrajudicial sobre Alimentos y Visitas',
    trabEntrega: 'Notificador DEMUNA',
    // Derivación F7
    destinatario: 'Fiscalía Provincial de Familia',
    cargoDest: 'Fiscal Provincial',
    institucionDest: 'Ministerio Público',
    descripcionDeriv: 'Se remite el expediente ante la imposibilidad de conciliar y salvaguardar los derechos del menor.'
  });

  // Modal Previsualización / Impresión
  const [previewActa, setPreviewActa] = useState(null);
  const [previewDetail, setPreviewDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modal Registrar Pago de Pensión
  const [payingItem, setPayingItem] = useState(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Cargar lista de actas, pagos y estadísticas
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'todas' && selectedCategory !== 'pensiones') {
        params.category = selectedCategory;
      }

      const [resActas, resStats, resPagos] = await Promise.all([
        apiClient.get(ENDPOINTS.ACTAS, { params }),
        apiClient.get(ENDPOINTS.ACTA_STATS),
        apiClient.get(ENDPOINTS.PAGOS)
      ]);

      if (resActas.data?.success) {
        setActas(resActas.data.data);
      }
      if (resStats.data?.success) {
        setStats(resStats.data.data);
      }
      if (resPagos.data?.success) {
        setPagos(resPagos.data.data);
      }
    } catch (err) {
      console.error("Error al cargar actas y conciliaciones", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de expedientes para el selector
  useEffect(() => {
    apiClient.get(ENDPOINTS.EXPEDIENTES).then(res => {
      if (res.data?.success && res.data.data.length > 0) {
        setExpedientesList(res.data.data);
        setForm(prev => ({ ...prev, expedienteId: res.data.data[0].id }));
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

  // Guardar nueva acta
  const handleSaveActa = async (e) => {
    e.preventDefault();
    setSavingActa(true);
    try {
      const payload = {
        typeId: parseInt(actaType, 10),
        expedienteId: form.expedienteId,
        title: form.title,
        date: form.date,
        materias: form.materias,
        tipoAcuerdo: form.tipoAcuerdo,
        hechos: form.hechos,
        puntosControversia: form.puntosControversia,
        termyCond: form.termyCond,
        montoPension: form.montoPension,
        numCuotas: form.numCuotas,
        regAbogado: form.regAbogado,
        colAbogados: form.colAbogados,
        testigoNombre: form.testigoNombre,
        testigoDni: form.testigoDni,
        compromisos: form.compromisos,
        fechaCita: form.fechaCita,
        horaCita: form.horaCita,
        asunto: form.asunto,
        trabEntrega: form.trabEntrega,
        destinatario: form.destinatario,
        cargoDest: form.cargoDest,
        institucionDest: form.institucionDest,
        descripcion: form.descripcionDeriv
      };

      const res = await apiClient.post(ENDPOINTS.ACTAS_STORE, payload);
      if (res.data?.success) {
        setIsCreateModalOpen(false);
        showToast("Documento conciliatorio emitido y registrado con éxito.");
        fetchData();
      } else {
        alert(res.data?.message || "Error al emitir acta");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al comunicarse con el servidor");
    } finally {
      setSavingActa(false);
    }
  };

  // Previsualizar documento oficial para imprimir
  const handleOpenPreview = async (item) => {
    setPreviewActa(item);
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(ENDPOINTS.ACTA_DETAIL(item.id));
      if (res.data?.success) {
        setPreviewDetail(res.data.data);
      }
    } catch (err) {
      console.error("Error al obtener detalle del acta", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Pagar cuota de pensión de alimentos
  const handleConfirmPayment = async () => {
    if (!payingItem) return;
    try {
      await apiClient.post(ENDPOINTS.PAGO_PAY(payingItem.id), { paidDate: payDate });
      showToast(`Abono de cuota #${payingItem.paymentNumber} registrado correctamente.`);
      setPayingItem(null);
      fetchData();
    } catch (err) {
      alert("Error al registrar abono");
    }
  };

  // Revertir pago
  const handleRevertPayment = async (pagoId) => {
    if (!confirm("¿Deseas revertir este abono a estado Pendiente?")) return;
    try {
      await apiClient.post(ENDPOINTS.PAGO_REVERT(pagoId), {});
      showToast("Pago revertido a estado Pendiente.");
      fetchData();
    } catch (err) {
      alert("Error al revertir pago");
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (selectedCategory === 'pensiones') {
      if (pagos.length === 0) return alert("No hay cuotas para exportar.");
      const headers = ['ID', 'Expediente', 'Obligado / Deudor', 'DNI', 'Cuota', 'Monto S/', 'Vencimiento', 'Fecha Pago', 'Estado'];
      const rows = pagos.map(p => [
        p.id,
        p.expedienteCode,
        `"${(p.debtorName || '').replace(/"/g, '""')}"`,
        p.debtorDni || '',
        `Cuota ${p.paymentNumber}`,
        p.amount,
        p.dueDate,
        p.paidDate || 'Pendiente',
        p.status
      ]);
      const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DEMUNA_Pensiones_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      if (actas.length === 0) return alert("No hay actas para exportar.");
      const headers = ['ID', 'Tipo', 'N° Acta', 'Expediente', 'Materia', 'Solicitante', 'Citado', 'Fecha', 'Defensor'];
      const rows = actas.map(a => [
        a.id,
        `"${a.typeName}"`,
        a.actNumber ? `Acta N° ${a.actNumber}` : '-',
        a.expedienteCode,
        `"${(a.expedienteSubject || a.title || '').replace(/"/g, '""')}"`,
        `"${(a.applicantName || 'Confidencial').replace(/"/g, '""')}"`,
        `"${(a.suspectName || 'Sin datos').replace(/"/g, '""')}"`,
        a.date,
        `"${(a.workerName || '').replace(/"/g, '""')}"`
      ]);
      const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DEMUNA_Actas_Conciliaciones_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  // Formato de badge por tipo de acta
  const getActaBadge = (typeId) => {
    const id = parseInt(typeId, 10);
    switch (id) {
      case 12: // Acta de Conciliación
        return {
          bg: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
          dot: 'bg-[#10b981]',
          label: 'Conciliación (F9A)',
          color: '#10b981'
        };
      case 16: // Compromiso
        return {
          bg: 'bg-[#8b59f6]/15 text-[#a78bfa] border-[#8b59f6]/30',
          dot: 'bg-[#8b59f6]',
          label: 'Compromiso (F10)',
          color: '#8b59f6'
        };
      case 4: // Invitación 1
      case 5: // Invitación 2
        return {
          bg: 'bg-[#2faaf7]/15 text-[#38bdf8] border-[#2faaf7]/30',
          dot: 'bg-[#2faaf7]',
          label: id === 5 ? '2da Invitación' : '1ra Invitación',
          color: '#2faaf7'
        };
      case 8: // Oficio de Derivación
        return {
          bg: 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30',
          dot: 'bg-[#f59e0b]',
          label: 'Derivación (F7)',
          color: '#f59e0b'
        };
      case 9:
      case 10:
      case 11:
        return {
          bg: 'bg-red-500/15 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
          label: 'Inasistencia (F8)',
          color: '#f87171'
        };
      default:
        return {
          bg: 'bg-[#6c3aed]/15 text-[#8b59f6] border-[#6c3aed]/30',
          dot: 'bg-[#6c3aed]',
          label: 'Acta Oficial',
          color: '#6c3aed'
        };
    }
  };

  const tabs = [
    { id: 'conciliacion', label: 'Conciliaciones (F9)', count: stats.conciliaciones, color: '#10b981' },
    { id: 'invitacion', label: 'Invitaciones a Audiencia (F4/F5)', count: stats.invitaciones, color: '#2faaf7' },
    { id: 'inasistencia', label: 'Inasistencias (F8)', count: stats.inasistencias, color: '#f87171' },
    { id: 'compromiso', label: 'Compromisos (F10)', count: stats.compromisos, color: '#8b59f6' },
    { id: 'derivacion', label: 'Derivaciones (F7)', count: stats.derivaciones, color: '#f59e0b' },
    { id: 'pensiones', label: 'Semáforo de Pensiones', count: stats.pensiones.totalCuotas, color: '#ffc36c' },
    { id: 'todas', label: 'Todas las Actas', count: stats.total },
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
              Actas y conciliación extrajudicial
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
              {stats.conciliaciones} acuerdos logrados
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Acuerdos vinculantes con título de ejecución, citaciones, control mensual de pensiones y oficios de derivación
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchData()}
            title="Actualizar datos"
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
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#34d399] hover:brightness-110 text-white text-xs font-black shadow-lg shadow-[#10b981]/25 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Emitir Acta / Conciliación</span>
          </button>
        </div>
      </div>

      {/* ================= 4 MINI KPIS DARK TECH ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Conciliaciones Exitosas */}
        <div
          onClick={() => setSelectedCategory('conciliacion')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'conciliacion' ? 'border-[#10b981] shadow-lg shadow-[#10b981]/15 ring-1 ring-[#10b981]' : 'border-[var(--line)] hover:border-[#10b981]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#10b981]/15 text-[#34d399] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#34d399] uppercase tracking-wider">F9A</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Conciliaciones con Acuerdo</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.conciliaciones}
          </div>
          <span className="text-[10.5px] text-[#34d399] font-semibold mt-1 block">Título de ejecución judicial</span>
        </div>

        {/* KPI 2: Invitaciones & Citaciones */}
        <div
          onClick={() => setSelectedCategory('invitacion')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'invitacion' ? 'border-[#2faaf7] shadow-lg shadow-[#2faaf7]/15 ring-1 ring-[#2faaf7]' : 'border-[var(--line)] hover:border-[#2faaf7]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#2faaf7]/15 text-[#38bdf8] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">F4 / F5</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Invitaciones Cursadas</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.invitaciones}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">Notificaciones para audiencia</span>
        </div>

        {/* KPI 3: Compromisos e Inasistencias */}
        <div
          onClick={() => setSelectedCategory('compromiso')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'compromiso' ? 'border-[#8b59f6] shadow-lg shadow-[#8b59f6]/15 ring-1 ring-[#8b59f6]' : 'border-[var(--line)] hover:border-[#8b59f6]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#8b59f6]/15 text-[#a78bfa] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider">F10 / F8</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Actas de Compromiso</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.compromisos}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">{stats.inasistencias} inasistencias registradas</span>
        </div>

        {/* KPI 4: Pensiones Pactadas en Seguimiento */}
        <div
          onClick={() => setSelectedCategory('pensiones')}
          className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'pensiones' ? 'border-[#ffc36c] shadow-lg shadow-[#ffc36c]/15 ring-1 ring-[#ffc36c]' : 'border-[var(--line)] hover:border-[#ffc36c]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#ffc36c]/15 text-[#fde047] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#fde047] uppercase tracking-wider">PENSIONES</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Cuotas de Alimentos</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.pensiones.cuotasPagadas} / {stats.pensiones.totalCuotas}
          </div>
          <span className="text-[10.5px] text-[#ffc36c] font-semibold mt-1 block">
            S/ {stats.pensiones.montoTotalPactado.toLocaleString('es-PE')} pactados
          </span>
        </div>
      </div>

      {/* ================= PESTAÑAS DE SUB-MÓDULO ================= */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--line)]">
        {tabs.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border-b-2 -mb-[1px] ${
                isActive
                  ? 'border-[#10b981] text-white bg-[var(--surface)] shadow-sm'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]/50'
              }`}
            >
              {tab.color && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.color }} />
              )}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-[#10b981]/20 text-[#34d399]' : 'bg-[var(--surface-2)] text-[var(--muted)]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= BARRA DE BÚSQUEDA ================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={selectedCategory === 'pensiones' ? "Buscar por obligado, DNI o expediente..." : "Buscar por N° acta, caso, partes o materia..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:border-[#10b981] outline-none"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {selectedCategory !== 'pensiones' && (
            <div className="flex items-center p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                title="Vista en tabla"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Vista en cuadrícula"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONTENIDO SEGÚN LA PESTAÑA ================= */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#10b981] border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)] font-medium">Cargando actas y acuerdos conciliatorios...</p>
        </div>
      ) : selectedCategory === 'pensiones' ? (
        
        /* ================= VISTA SEMÁFORO DE PENSIONES ALIMENTICIAS ================= */
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-[#ffc36c]/10 via-[var(--surface)] to-transparent border border-[#ffc36c]/30 rounded-[var(--radius)] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffc36c]/20 text-[#fde047] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--text)]">Cronograma Mensual de Pensiones de Alimentos</h4>
                <p className="text-[11px] text-[var(--muted)]">Control de cuotas fijadas en actas de conciliación extrajudicial</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Recaudado / Total</span>
              <span className="text-sm font-extrabold text-[#10b981]">{stats.pensiones.cuotasPagadas} pagadas</span>
              <span className="text-xs text-[var(--muted)]"> de {stats.pensiones.totalCuotas} cuotas</span>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-2)] text-[var(--muted)] uppercase font-bold text-[10.5px] border-b border-[var(--line)] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Expediente</th>
                    <th className="py-3 px-4">Obligado(a) / Deudor</th>
                    <th className="py-3 px-4 text-center">N° Cuota</th>
                    <th className="py-3 px-4 font-mono">Monto Pactado</th>
                    <th className="py-3 px-4">Fecha Vencimiento</th>
                    <th className="py-3 px-4">Fecha de Pago</th>
                    <th className="py-3 px-4 text-center">Semáforo</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
                  {pagos.map((p) => {
                    const isPaid = p.status === 'Pagado';
                    const isNext = p.status === 'Próximo Pago';
                    return (
                      <tr key={p.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#2faaf7]">
                          <Link to={`/expedientes/${p.expedienteId}`} className="hover:underline">
                            {p.expedienteCode}
                          </Link>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--text)]">{p.debtorName || 'Citado'}</div>
                          {p.debtorDni && <span className="text-[10px] text-[var(--muted)] font-mono">DNI: {p.debtorDni}</span>}
                        </td>

                        <td className="py-3 px-4 text-center font-bold">
                          Cuota #{p.paymentNumber}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          S/ {parseFloat(p.amount).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-[var(--muted)] font-mono text-[11px]">
                          {p.dueDate}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          {p.paidDate ? (
                            <span className="text-[#10b981] font-bold">{p.paidDate}</span>
                          ) : (
                            <span className="text-[var(--muted)] italic">Pendiente</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                              <span>Pagado</span>
                            </span>
                          ) : isNext ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffc36c]/15 text-[#fde047] border border-[#ffc36c]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ffc36c]" />
                              <span>Próximo Pago</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                              <span>Pendiente</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => handleRevertPayment(p.id)}
                              title="Revertir pago a estado pendiente"
                              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-red-500 text-[var(--muted)] hover:text-red-400 text-xs transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setPayingItem(p)}
                              className="px-2.5 py-1 rounded-lg bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#34d399] border border-[#10b981]/30 text-xs font-bold transition-all"
                            >
                              Registrar Abono
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
        </div>
      ) : actas.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
          <Scale className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[var(--text)]">No se encontraron actas registradas</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            No hay actas o citaciones en esta categoría o no coinciden con la búsqueda.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[#10b981] text-white text-xs font-bold rounded-xl shadow-md"
          >
            + Emitir Acta / Conciliación
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA TABLA DE ACTAS */
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)] uppercase font-bold text-[10.5px] border-b border-[var(--line)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">N° Acta</th>
                  <th className="py-3 px-4">Tipo de Documento</th>
                  <th className="py-3 px-4">Expediente Asociado</th>
                  <th className="py-3 px-4">Partes (Solicitante vs Citado)</th>
                  <th className="py-3 px-4">Resultado / Materia</th>
                  <th className="py-3 px-4">Fecha Emisión</th>
                  <th className="py-3 px-4">Defensor Responsable</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
                {actas.map((item) => {
                  const badge = getActaBadge(item.typeId);
                  return (
                    <tr key={item.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#10b981]">
                        Acta #{String(item.actNumber || item.id).padStart(3, '0')}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-[#2faaf7]">
                        <Link to={`/expedientes/${item.expedienteId}`} className="hover:underline">
                          {item.expedienteCode}
                        </Link>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text)] truncate max-w-[200px]">
                          {item.applicantName || 'Solicitante'}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] truncate max-w-[200px]">
                          vs. {item.suspectName || 'Citado / Obligado'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[var(--text)] block truncate max-w-[180px]">
                          {item.f9aTipoAcuerdo || item.title || item.expedienteSubject}
                        </span>
                        <span className="text-[10.5px] text-[var(--muted)] truncate block max-w-[180px]">
                          {item.f9aMaterias || item.expedienteSubject}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--muted)] whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-[var(--text)] truncate max-w-[150px]">
                        {item.workerName}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenPreview(item)}
                            title="Previsualizar e Imprimir formato oficial"
                            className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#10b981] text-[var(--text)] transition-all"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#10b981]" />
                          </button>

                          <Link
                            to={`/expedientes/${item.expedienteId}`}
                            title="Ver expediente 360°"
                            className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-[var(--text)] transition-all"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-[#8b59f6]" />
                          </Link>
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
          {actas.map((item) => {
            const badge = getActaBadge(item.typeId);
            return (
              <div
                key={item.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-sm hover:border-[#10b981]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-[#10b981]">
                      Acta #{String(item.actNumber || item.id).padStart(3, '0')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text)] mt-3 line-clamp-1">
                    {item.title || item.expedienteSubject}
                  </h4>

                  <div className="mt-1 flex items-center space-x-1 text-xs text-[var(--muted)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Expediente:</span>
                    <span className="font-mono font-bold text-[#2faaf7]">{item.expedienteCode}</span>
                  </div>

                  <div className="mt-3 p-3 bg-[var(--surface-2)] rounded-xl space-y-1.5 text-xs">
                    <div className="text-[var(--text)] truncate">
                      <strong>Solicitante:</strong> {item.applicantName || 'Parte interesada'}
                    </div>
                    <div className="text-[var(--muted)] truncate">
                      <strong>Citado:</strong> {item.suspectName || 'Parte contraria'}
                    </div>
                    {item.f9aTipoAcuerdo && (
                      <div className="text-[#10b981] font-bold text-[11px] pt-1 border-t border-[var(--line)]">
                        Acuerdo: {item.f9aTipoAcuerdo}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                  <button
                    onClick={() => handleOpenPreview(item)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#10b981] text-xs font-bold text-[var(--text)] transition-all flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Imprimir</span>
                  </button>

                  <Link
                    to={`/expedientes/${item.expedienteId}`}
                    className="px-3 py-1.5 rounded-lg bg-[#6c3aed]/15 text-[#8b59f6] border border-[#6c3aed]/30 hover:bg-[#6c3aed]/25 text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <span>Ver Caso</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: EMITIR ACTA / CONCILIACIÓN ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-2)]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#10b981]/15 text-[#34d399] flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[var(--text)]">Emisión de Acta y Conciliación Extrajudicial</h3>
                  <p className="text-[11px] text-[var(--muted)]">Redacción de documento oficial con fuerza legal ejecutoria</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActa} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Tipo de Documento */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1.5">
                  Tipo de Documento a Emitir *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: '12', label: 'Acta de Conciliación (F9A)', color: '#10b981' },
                    { id: '4', label: 'Invitación a Conciliar (F4)', color: '#2faaf7' },
                    { id: '16', label: 'Acta de Compromiso (F10)', color: '#8b59f6' },
                    { id: '9', label: 'Acta de Inasistencia (F8)', color: '#f87171' },
                    { id: '8', label: 'Oficio de Derivación (F7)', color: '#f59e0b' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActaType(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 ${
                        actaType === t.id
                          ? 'bg-[var(--surface-2)] border-[#10b981] text-[var(--text)] shadow-sm'
                          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:border-[#10b981]/50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expediente Asociado */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                  Expediente Vinculado *
                </label>
                <select
                  required
                  value={form.expedienteId}
                  onChange={(e) => setForm({ ...form, expedienteId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold focus:border-[#10b981] outline-none cursor-pointer"
                >
                  {expedientesList.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.code} &bull; {exp.subject} ({exp.workerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Título y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                    Título del Acta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Acta de Conciliación con Acuerdo Total sobre Pensión de Alimentos"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs focus:border-[#10b981] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                    Fecha de Audiencia / Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs focus:border-[#10b981] outline-none"
                  />
                </div>
              </div>

              {/* CAMPOS ESPECÍFICOS: CONCILIACIÓN F9A */}
              {actaType === '12' && (
                <div className="space-y-4 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--line)]">
                  <div className="flex items-center space-x-2 text-[#10b981]">
                    <Scale className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase">Cláusulas del Acuerdo Extrajudicial</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Tipo de Acuerdo *</label>
                      <select
                        value={form.tipoAcuerdo}
                        onChange={(e) => setForm({ ...form, tipoAcuerdo: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="Acuerdo Total">Acuerdo Total</option>
                        <option value="Acuerdo Parcial">Acuerdo Parcial</option>
                        <option value="Falta de Acuerdo">Falta de Acuerdo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Materias Conciliadas</label>
                      <input
                        type="text"
                        value={form.materias}
                        onChange={(e) => setForm({ ...form, materias: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Bloque Alimentos & Generador de Cronograma */}
                  <div className="p-3 bg-[var(--surface)] rounded-xl border border-[#10b981]/30 space-y-3">
                    <span className="text-xs font-black text-[#10b981] flex items-center space-x-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>Fijación de Pensión de Alimentos (Genera Cronograma Mensual)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">
                          Monto Mensual Pactado (S/.)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 350.00"
                          value={form.montoPension}
                          onChange={(e) => setForm({ ...form, montoPension: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] text-emerald-400 font-mono font-bold border border-[var(--line)] rounded-lg text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">
                          Cuotas Mensuales a Programar
                        </label>
                        <select
                          value={form.numCuotas}
                          onChange={(e) => setForm({ ...form, numCuotas: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs font-bold outline-none"
                        >
                          <option value="6">6 Meses</option>
                          <option value="12">12 Meses (1 Año)</option>
                          <option value="24">24 Meses (2 Años)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">
                      Términos y Condiciones del Acuerdo
                    </label>
                    <textarea
                      rows="2"
                      value={form.termyCond}
                      onChange={(e) => setForm({ ...form, termyCond: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                    />
                  </div>

                  {/* Asesor Legal Homologador */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--line)]">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Registro de Abogado</label>
                      <input
                        type="text"
                        value={form.regAbogado}
                        onChange={(e) => setForm({ ...form, regAbogado: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Colegio de Abogados</label>
                      <input
                        type="text"
                        value={form.colAbogados}
                        onChange={(e) => setForm({ ...form, colAbogados: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CAMPOS ESPECÍFICOS: INVITACIÓN F4 */}
              {actaType === '4' && (
                <div className="space-y-3 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--line)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Fecha Programada Audiencia</label>
                      <input
                        type="date"
                        value={form.fechaCita}
                        onChange={(e) => setForm({ ...form, fechaCita: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Hora de Audiencia</label>
                      <input
                        type="time"
                        value={form.horaCita}
                        onChange={(e) => setForm({ ...form, horaCita: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CAMPOS ESPECÍFICOS: DERIVACIÓN F7 */}
              {actaType === '8' && (
                <div className="space-y-3 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--line)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Institución Destino</label>
                      <input
                        type="text"
                        value={form.institucionDest}
                        onChange={(e) => setForm({ ...form, institucionDest: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-1">Destinatario / Cargo</label>
                      <input
                        type="text"
                        value={form.destinatario}
                        onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
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
                  disabled={savingActa}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#34d399] text-white text-xs font-black shadow-lg shadow-[#10b981]/20 hover:brightness-110 disabled:opacity-50 flex items-center space-x-2"
                >
                  {savingActa ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Emitiendo Documento...</span>
                    </>
                  ) : (
                    <span>Emitir y Firmar Acta</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR ABONO DE PENSIÓN ================= */}
      {payingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-[var(--line)]">
              <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 text-[#34d399] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--text)]">Registro de Abono de Pensión</h4>
                <p className="text-[11px] text-[var(--muted)]">{payingItem.expedienteCode} &bull; Cuota #{payingItem.paymentNumber}</p>
              </div>
            </div>

            <div className="p-3 bg-[var(--surface-2)] rounded-xl space-y-1 text-xs">
              <p><strong>Deudor / Citado:</strong> {payingItem.debtorName || 'Citado'}</p>
              <p><strong>Monto a Abonar:</strong> <span className="font-mono font-bold text-emerald-400">S/ {parseFloat(payingItem.amount).toFixed(2)}</span></p>
              <p><strong>Fecha Vencimiento:</strong> {payingItem.dueDate}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                Fecha Efectiva del Pago *
              </label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setPayingItem(null)}
                className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-white text-xs font-bold shadow-md"
              >
                Confirmar Abono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVISUALIZAR E IMPRIMIR ACTA OFICIAL ================= */}
      {previewActa && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-2)]">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-[#10b981]" />
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text)]">Formato Legal Oficial DEMUNA &bull; Título Ejecutivo</h3>
                  <p className="text-[10px] text-[var(--muted)]">Acta extrajudicial con valor de cosa juzgada conforme a ley</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Acta A4</span>
                </button>
                <button
                  onClick={() => { setPreviewActa(null); setPreviewDetail(null); }}
                  className="text-[var(--muted)] hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documento legal oficial listo para imprimir */}
            <div className="p-8 bg-white text-slate-900 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 font-serif leading-relaxed text-xs">
              
              {/* Membrete Oficial */}
              <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
                <p className="font-bold tracking-widest uppercase text-[11px] text-slate-700">República del Perú</p>
                <p className="font-extrabold text-sm uppercase text-slate-900 mt-0.5">Municipalidad Distrital &bull; DEMUNA</p>
                <p className="text-[10px] text-slate-600">Servicio de Conciliación Extrajudicial Especializada en Niñez y Adolescencia</p>
                <div className="inline-block mt-3 px-4 py-1.5 bg-slate-100 border border-slate-300 font-sans font-black text-xs uppercase tracking-wider text-slate-900">
                  {previewActa.typeName} &bull; ACTA N° {String(previewActa.actNumber || previewActa.id).padStart(4, '0')} - {new Date().getFullYear()}
                </div>
              </div>

              {/* Datos de cabecera */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded font-sans text-[11px] mb-5">
                <div>
                  <p><strong>Expediente:</strong> {previewActa.expedienteCode}</p>
                  <p><strong>Materia(s):</strong> {previewDetail?.f9aMaterias || previewActa.expedienteSubject || previewActa.title}</p>
                </div>
                <div>
                  <p><strong>Fecha de Audiencia:</strong> {previewActa.date}</p>
                  <p><strong>Defensor(a) Responsable:</strong> {previewActa.workerName}</p>
                </div>
              </div>

              {/* Identificación de las Partes */}
              <div className="mb-4 space-y-1 font-sans text-[11px]">
                <p>
                  <strong>PARTE SOLICITANTE:</strong> {previewActa.applicantName || 'Parte Solicitante'} &bull; DNI: ____________
                </p>
                <p>
                  <strong>PARTE CITADA / OBLIGADA:</strong> {previewActa.suspectName || 'Parte Citada'} &bull; DNI: ____________
                </p>
                {previewDetail?.nna && previewDetail.nna.length > 0 && (
                  <p>
                    <strong>EN FAVOR DEL MENOR (NNA):</strong> {previewDetail.nna.map(n => `${n.fullName} (${n.age ? n.age + ' años' : 'Menor de edad'})`).join(', ')}
                  </p>
                )}
              </div>

              {/* Cuerpo del Acta Legal con Cláusulas */}
              <div className="space-y-4 my-6 text-justify">
                <p>
                  En la sede de la Defensoría Municipal del Niño y del Adolescente (DEMUNA), siendo las 10:00 horas del día <strong>{previewActa.date}</strong>, comparecen libre y voluntariamente las partes antes identificadas ante el Defensor del Niño y del Adolescente <strong>{previewActa.workerName}</strong> y el Abogado Homologador <strong>Registro {previewDetail?.f9aRegAbogado || 'CALL-48921'} ({previewDetail?.f9aColAbogados || 'Colegio de Abogados'})</strong>, con el objeto de arribar a un acuerdo conciliatorio respecto a los derechos del menor de edad, acordando lo siguiente:
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <strong className="block text-slate-900 mb-1">CLÁUSULA PRIMERA: DE LOS ANTECEDENTES Y MATERIAS</strong>
                    <p className="text-slate-700">
                      {previewDetail?.f9aHechos || 'Las partes manifiestan que han convenido en solucionar sus diferencias en favor del bienestar integral del menor.'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <strong className="block text-slate-900 mb-1">CLÁUSULA SEGUNDA: DE LOS ACUERDOS Y CONDICIONES PACTADAS</strong>
                    <p className="text-slate-700">
                      {previewDetail?.f9aTermyCond || 'El obligado se compromete al pago puntual de la pensión acordada y al cumplimiento estricto del régimen de visitas en el horario pactado.'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <strong className="block text-slate-900 mb-1">CLÁUSULA TERCERA: MÉRITO EJECUTIVO Y COSA JUZGADA</strong>
                    <p className="text-slate-700">
                      De conformidad con lo dispuesto en el Código de los Niños y Adolescentes y la Ley de Conciliación N° 26872, el presente documento constituye <strong>TÍTULO DE EJECUCIÓN</strong> y tiene efecto de <strong>SENTENCIA CON VALOR DE COSA JUZGADA</strong>, siendo de obligatorio cumplimiento para ambas partes.
                    </p>
                  </div>
                </div>

                <p className="pt-2">
                  Leído el texto de la presente acta y encontrándose conformes con su contenido en su totalidad, los comparecientes la ratifican y firman en cuatro ejemplares del mismo tenor y efecto legal.
                </p>
              </div>

              {/* Bloque de 4 Firmas y Huellas Oficiales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 mt-12 text-center font-sans text-[10px]">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">{previewActa.applicantName || 'Solicitante'}</p>
                  <p className="text-slate-500">Parte Solicitante</p>
                  <p className="text-slate-500">Firma y Huella Digital</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">{previewActa.suspectName || 'Citado / Obligado'}</p>
                  <p className="text-slate-500">Parte Citada</p>
                  <p className="text-slate-500">Firma y Huella Digital</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">{previewActa.workerName}</p>
                  <p className="text-slate-500">Defensor(a) DEMUNA</p>
                  <p className="text-slate-500">Acreditación MIMP</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">Abogado Verificador</p>
                  <p className="text-slate-500">{previewDetail?.f9aRegAbogado || 'Reg. CALL-48921'}</p>
                  <p className="text-slate-500">Firma y Sello</p>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-3 border-t border-[var(--line)] flex justify-end bg-[var(--surface-2)]">
              <button
                onClick={() => { setPreviewActa(null); setPreviewDetail(null); }}
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

