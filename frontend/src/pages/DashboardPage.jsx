import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  Folder,
  ClipboardList,
  Scale,
  Calendar,
  Clock,
  Download,
  Plus,
  ArrowRight,
  Check,
  Shield,
  Search,
  MoreVertical,
  HelpCircle,
  X,
  FileText,
  Sparkles
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();

  // KPIs dinámicos cargados desde el backend
  const [kpis, setKpis] = useState(null);

  // Periodo seleccionado: 'month' | 'quarter' | 'year'
  const [period, setPeriod] = useState('year');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);

  // Cargar métricas reales del backend al montar
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    apiClient.get(ENDPOINTS.KPIS)
      .then(res => {
        if (res.data?.success) {
          setKpis(res.data.data);
        }
      })
      .catch(err => {
        console.log("No se pudieron cargar KPIs en vivo, usando datos locales", err);
      });

    apiClient.get(ENDPOINTS.AGENDA_EVENTS)
      .then(res => {
        if (res.data?.success && res.data.data.length > 0) {
          setLiveEvents(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Formulario de nueva atención rápida (demo / interactivo)
  const [demoType, setDemoType] = useState('Recepción');
  const [demoStatus, setDemoStatus] = useState('Recepción');

  // Datos mensuales base (modelo del prototipo)
  const monthlyData = useMemo(() => [
    { label: 'Ene', full: 'Enero', cases: 12, followup: 8, actas: 4, events: 3, forms: [12, 9, 3, 8], docs: [5, 3, 2, 2, 4] },
    { label: 'Feb', full: 'Febrero', cases: 14, followup: 9, actas: 5, events: 4, forms: [14, 8, 4, 9], docs: [6, 3, 3, 2, 4] },
    { label: 'Mar', full: 'Marzo', cases: 16, followup: 10, actas: 5, events: 3, forms: [16, 11, 5, 10], docs: [6, 4, 4, 2, 5] },
    { label: 'Abr', full: 'Abril', cases: 20, followup: 13, actas: 7, events: 6, forms: [20, 13, 6, 13], docs: [8, 5, 3, 3, 6] },
    { label: 'May', full: 'Mayo', cases: 18, followup: 11, actas: 6, events: 5, forms: [18, 12, 6, 11], docs: [8, 3, 3, 3, 6] },
    { label: 'Jun', full: 'Junio', cases: 21, followup: 14, actas: 8, events: 4, forms: [21, 15, 9, 14], docs: [9, 5, 4, 3, 8] },
    { label: 'Jul', full: 'Julio', cases: 22, followup: 13, actas: 8, events: 4, forms: [22, 14, 8, 13], docs: [10, 6, 5, 4, 8] },
    { label: 'Ago', full: 'Agosto', cases: 26, followup: 17, actas: 9, events: 5, forms: [26, 17, 9, 17], docs: [11, 7, 5, 4, 9] },
    { label: 'Sep', full: 'Septiembre', cases: 27, followup: 19, actas: 10, events: 5, forms: [27, 19, 12, 19], docs: [12, 8, 6, 4, 10] },
    { label: 'Oct', full: 'Octubre', cases: 24, followup: 16, actas: 8, events: 5, forms: [24, 18, 11, 16], docs: [11, 6, 6, 5, 10] },
    { label: 'Nov', full: 'Noviembre', cases: 15, followup: 11, actas: 5, events: 3, forms: [15, 12, 6, 11], docs: [8, 5, 3, 3, 7] },
  ], []);

  // Expedientes de demostración iniciales
  const [cases, setCases] = useState([
    { code: 'EXP-2026-0215', type: 'Recepción', date: '10 nov 2026', status: 'Recepción' },
    { code: 'EXP-2026-0214', type: 'Seguimiento', date: '10 nov 2026', status: 'En seguimiento' },
    { code: 'EXP-2026-0213', type: 'Entrevista', date: '09 nov 2026', status: 'En seguimiento' },
    { code: 'EXP-2026-0212', type: 'Visita', date: '08 nov 2026', status: 'Derivado' },
    { code: 'EXP-2026-0211', type: 'Seguimiento', date: '07 nov 2026', status: 'Concluido' },
    { code: 'EXP-2026-0210', type: 'Recepción', date: '06 nov 2026', status: 'Recepción' },
    { code: 'EXP-2026-0209', type: 'Entrevista', date: '05 nov 2026', status: 'En seguimiento' },
  ]);

  // Próximas actividades de agenda
  const upcomingEvents = [
    { day: '12', month: 'NOV', title: 'Reunión de coordinación', time: '09:00 a. m.', tag: 'Agenda' },
    { day: '13', month: 'NOV', title: 'Revisión de expedientes', time: '10:30 a. m.', tag: 'Interna' },
    { day: '16', month: 'NOV', title: 'Seguimiento de compromisos', time: '11:00 a. m.', tag: 'Atención' },
    { day: '18', month: 'NOV', title: 'Actividad comunitaria', time: '03:00 p. m.', tag: 'Actividad' },
  ];

  const displayEvents = useMemo(() => {
    if (liveEvents.length > 0) {
      return liveEvents.slice(0, 4).map(ev => {
        const parts = (ev.eventDate || '').split('-');
        const d = parts[2] || '12';
        const m = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][parseInt(parts[1] || '11', 10) - 1] || 'NOV';
        return {
          day: d,
          month: m,
          title: ev.type + (ev.expedienteCode ? ` (${ev.expedienteCode})` : ''),
          time: (ev.eventTime || '10:00:00').substring(0, 5),
          tag: ev.type.includes('Concilia') ? 'Audiencia' : ev.type.includes('Visita') ? 'Visita' : 'Agenda'
        };
      });
    }
    return upcomingEvents;
  }, [liveEvents]);

  const docNames = ['Actas', 'Invitaciones', 'Solicitudes', 'Informes', 'Fichas PDF'];
  const formNames = ['Recepción', 'Entrevista', 'Visita', 'Seguimiento'];
  const formColors = ['#7546e8', '#269fe6', '#f0b357', '#39bca2'];

  // Notificador toast temporal
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4200);
  };

  // Filtrado de filas mensuales según período
  const currentRows = useMemo(() => {
    if (period === 'month') return monthlyData.slice(-1);
    if (period === 'quarter') return monthlyData.slice(-3);
    return monthlyData;
  }, [period, monthlyData]);

  // Sumas de métricas para las tarjetas
  const statsCounts = useMemo(() => {
    const sum = (key) => currentRows.reduce((acc, r) => acc + (r[key] || 0), 0);
    return {
      cases: sum('cases'),
      followup: sum('followup'),
      actas: sum('actas'),
      events: sum('events'),
    };
  }, [currentRows]);

  const periodNote = useMemo(() => {
    if (period === 'month') return 'Noviembre 2026';
    if (period === 'quarter') return 'Sep. – nov. 2026';
    return 'Enero – noviembre 2026';
  }, [period]);

  // Totales de fichas por tipo para la Dona
  const formTotals = useMemo(() => {
    if (kpis?.fichas && (kpis.fichas.recepcion > 0 || kpis.fichas.entrevista > 0 || kpis.fichas.visita > 0 || kpis.fichas.seguimiento > 0)) {
      return [kpis.fichas.recepcion, kpis.fichas.entrevista, kpis.fichas.visita, kpis.fichas.seguimiento];
    }
    return [0, 1, 2, 3].map(i => currentRows.reduce((acc, r) => acc + (r.forms[i] || 0), 0));
  }, [currentRows, kpis]);

  const totalForms = useMemo(() => formTotals.reduce((a, b) => a + b, 0), [formTotals]);

  // Totales de documentos por formato para las barras
  const docTotals = useMemo(() => {
    return [0, 1, 2, 3, 4].map(i => currentRows.reduce((acc, r) => acc + (r.docs[i] || 0), 0));
  }, [currentRows]);

  const maxDocTotal = useMemo(() => Math.max(...docTotals, 1), [docTotals]);

  // Filtrado de expedientes en la tabla
  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter(c =>
      (c.code + ' ' + c.type + ' ' + c.status + ' ' + c.date).toLowerCase().includes(q)
    );
  }, [cases, searchQuery]);

  // Renderizado del Path Bezier para el gráfico curvo
  const chartSvgContent = useMemo(() => {
    const W = 760;
    const H = 265;
    const pad = { l: 36, r: 24, t: 20, b: 37 };
    const plotH = H - pad.t - pad.b;
    const plotW = W - pad.l - pad.r;

    const all = currentRows.map(x => x.cases);
    const yMax = Math.max(10, Math.ceil(Math.max(...all) / 10) * 10);
    const getY = (v) => pad.t + plotH - (v / yMax) * plotH;
    const getX = (i) => pad.l + (currentRows.length === 1 ? plotW / 2 : (i * plotW) / (currentRows.length - 1));

    const coords = currentRows.map((r, i) => [getX(i), getY(r.cases)]);

    // Suavizado Bezier
    let lineD = '';
    if (coords.length === 1) {
      lineD = `M ${coords[0][0]} ${coords[0][1]}`;
    } else if (coords.length > 1) {
      lineD = `M ${coords[0][0]} ${coords[0][1]}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[Math.max(0, i - 1)];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[Math.min(coords.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        lineD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
      }
    }

    const areaD = coords.length > 1
      ? `${lineD} L ${coords[coords.length - 1][0]} ${pad.t + plotH} L ${coords[0][0]} ${pad.t + plotH} Z`
      : '';

    // Líneas de grilla
    const gridLines = [0, 1, 2, 3, 4].map(i => {
      const val = yMax - (i * yMax) / 4;
      const yy = getY(val);
      return { val: Math.round(val), yy };
    });

    return { W, H, pad, coords, lineD, areaD, gridLines, getX, getY };
  }, [currentRows]);

  // Exportar datos a CSV
  const handleExportCsv = () => {
    const headers = [
      'Mes', 'Casos', 'Fichas de seguimiento', 'Actas', 'Actividades',
      'Fichas recepción', 'Fichas entrevista', 'Fichas visita', 'Fichas seguimiento',
      'PDF actas', 'PDF invitaciones', 'PDF solicitudes', 'PDF informes', 'PDF fichas'
    ];
    const rows = [headers];

    currentRows.forEach(m => {
      rows.push([
        m.full, m.cases, m.followup, m.actas, m.events,
        ...m.forms,
        ...m.docs
      ]);
    });

    const csvContent = '\ufeff' + rows.map(r => r.join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SISTDEMUNA_Reporte_${period}_2026.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);

    showToast('Archivo CSV generado y descargado exitosamente.');
  };

  // Agregar nuevo expediente en la demo
  const handleCreateDemoCase = (e) => {
    e.preventDefault();
    const newCount = cases.length + 1;
    const code = `EXP-2026-${String(215 + newCount).padStart(4, '0')}`;
    const newEntry = {
      code,
      type: demoType,
      date: '11 nov 2026',
      status: demoStatus
    };

    setCases(prev => [newEntry, ...prev]);
    setShowModal(false);
    showToast(`Se registró ${code} en la atención de casos.`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Recepción':
        return 'bg-[#f1eaff] text-[#8054e2] border border-[#8054e2]/20';
      case 'En seguimiento':
        return 'bg-[#edf3ff] text-[#478ce0] border border-[#478ce0]/20';
      case 'Concluido':
        return 'bg-[#e5f7f0] text-[#289674] border border-[#289674]/20';
      case 'Derivado':
        return 'bg-[#fff0dd] text-[#c78531] border border-[#c78531]/20';
      default:
        return 'bg-[#f3f3f7] text-[#7e8298] border border-[#7e8298]/20';
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ================= CABECERA DE LA PÁGINA ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[var(--text)] font-sans">
            Panel de control
          </h1>
          <p className="text-xs sm:text-[12.5px] text-[var(--muted)] mt-1 font-medium">
            Miércoles, 11 de noviembre de 2026 &bull; Seguimiento de la atención documental
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Pill de demostración */}
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#ede8ff] text-[#6b3ed6] text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8e66f6] animate-pulse" />
            <span>Datos de demostración</span>
          </span>

          {/* Botón Exportar CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] hover:border-[#a68dff] hover:-translate-y-0.5 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-[var(--muted)]" />
            <span>Exportar CSV</span>
          </button>

          {/* Botón Nueva Atención */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8751f9] to-[#6330df] hover:from-[#9562fa] hover:to-[#713eeb] text-white text-xs font-bold shadow-[0_7px_17px_rgba(106,55,224,0.22)] hover:shadow-[0_10px_22px_rgba(106,55,224,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva atención</span>
          </button>
        </div>
      </div>

      {/* ================= HERO BANNER INSTITUCIONAL ================= */}
      <section className="relative overflow-hidden rounded-[19px] min-h-[176px] bg-gradient-to-r from-[#252657] via-[#4a2d95] to-[#7545dd] p-7 sm:p-8 flex items-center justify-between shadow-[0_12px_24px_rgba(82,53,175,0.15)] border border-white/10">
        
        {/* Adornos geométricos y luces en el fondo */}
        <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full border border-white/15 pointer-events-none shadow-[0_0_0_60px_rgba(255,255,255,0.03),0_0_0_120px_rgba(255,255,255,0.02)]" />
        <div className="absolute right-28 -bottom-36 w-72 h-60 bg-radial from-[#a97aff]/40 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl text-white space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#cdbaff] text-[11px] font-bold tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ffcc79] shadow-[0_0_10px_#ffc65b]" />
            <span>Gestión municipal organizada</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            Cada atención merece un seguimiento claro.
          </h2>

          <p className="text-xs sm:text-[12px] text-[#d9d7f4] leading-relaxed max-w-md pb-1">
            Consulta el avance de los casos, localiza fichas y organiza los documentos de la DEMUNA desde un mismo espacio.
          </p>

          <Link
            to="/expedientes"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white text-[#452799] hover:bg-[#f5f4ff] font-extrabold text-xs shadow-md transition-all hover:translate-x-0.5 mt-2"
          >
            <span>Explorar expedientes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Ilustración 3D flotante del lado derecho */}
        <div className="hidden lg:flex relative w-72 h-36 items-center justify-center shrink-0">
          {/* Placa de vidrio inclinada */}
          <div className="absolute w-44 h-28 -rotate-12 bg-white/15 border border-white/35 rounded-2xl shadow-[0_15px_30px_rgba(22,15,101,0.3)] backdrop-blur-md flex items-center justify-center animate-hero-plate">
            <Folder className="w-12 h-12 text-[#e0d3ff]" />
          </div>

          {/* Chip flotante 1 */}
          <div className="absolute top-1 right-2 bg-white rounded-xl shadow-[0_15px_25px_rgba(24,18,86,0.3)] px-3 py-2 flex items-center space-x-1.5 text-[#37345b] text-[10px] font-extrabold animate-hero-chip-1">
            <Check className="w-4 h-4 text-[#6c3aed]" />
            <span>Registro organizado</span>
          </div>

          {/* Chip flotante 2 */}
          <div className="absolute bottom-1 left-2 bg-white rounded-xl shadow-[0_15px_25px_rgba(24,18,86,0.3)] px-3 py-2 flex items-center space-x-1.5 text-[#37345b] text-[10px] font-extrabold animate-hero-chip-2">
            <Shield className="w-4 h-4 text-[#22a77a]" />
            <span>Acceso protegido</span>
          </div>
        </div>
      </section>

      {/* ================= GRID DE INDICADORES (4 KPI CARDS) ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Casos registrados */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="w-11 h-11 rounded-xl bg-[#f0eafd] dark:bg-[#7747e6]/20 text-[#7747e6] flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5 text-[#7747e6]" />
            </div>
            {/* Sparkline curve */}
            <svg className="w-20 h-8 opacity-80 shrink-0" viewBox="0 0 80 31" fill="none">
              <path d="M2 25Q10 20 17 21T32 10T48 15T64 7T78 3" stroke="#a47bf8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-3 text-[11.5px] font-bold text-[var(--muted)]">Casos registrados</div>
          <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[var(--text)] mt-0.5 font-sans">
            {statsCounts.cases}
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-[var(--muted)] mt-1.5 truncate">
            <Calendar className="w-3 h-3 text-[#1aab79] shrink-0" />
            <span className="truncate">{periodNote}</span>
          </div>
        </div>

        {/* KPI 2: Fichas de seguimiento */}
        <Link
          to="/fichas"
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:border-[#2faaf7] hover:shadow-lg transition-all duration-200 block overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-11 h-11 rounded-xl bg-[#e8f5ff] dark:bg-[#2a9ee1]/20 text-[#2a9ee1] flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-[#2a9ee1]" />
            </div>
            <svg className="w-20 h-8 opacity-80 shrink-0" viewBox="0 0 80 31" fill="none">
              <path d="M2 24Q14 6 22 17T39 19T58 8T78 4" stroke="#6bc5f4" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-3 text-[11.5px] font-bold text-[var(--muted)]">Fichas de seguimiento</div>
          <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[var(--text)] mt-0.5 font-sans">
            {statsCounts.followup}
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-[var(--muted)] mt-1.5 truncate">
            <FileText className="w-3 h-3 text-[#2a9ee1] shrink-0" />
            <span className="truncate">Registros documentales</span>
          </div>
        </Link>

        {/* KPI 3: Actas registradas */}
        <Link
          to="/conciliacion"
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:border-[#ffc36c] hover:shadow-lg transition-all duration-200 block overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-11 h-11 rounded-xl bg-[#fff4e6] dark:bg-[#df9b30]/20 text-[#df9b30] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[#df9b30]" />
            </div>
            <svg className="w-20 h-8 opacity-80 shrink-0" viewBox="0 0 80 31" fill="none">
              <path d="M2 24Q18 21 22 13T43 19T58 11T78 7" stroke="#f2bc70" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-3 text-[11.5px] font-bold text-[var(--muted)]">Actas registradas</div>
          <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[var(--text)] mt-0.5 font-sans">
            {statsCounts.actas}
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-[var(--muted)] mt-1.5 truncate">
            <FileText className="w-3 h-3 text-[#df9b30] shrink-0" />
            <span className="truncate">Trámites de atención y conciliación</span>
          </div>
        </Link>

        {/* KPI 4: Actividades agendadas */}
        <Link
          to="/agenda"
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:border-[#10b981] hover:shadow-lg transition-all duration-200 block overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-11 h-11 rounded-xl bg-[#e4f8ef] dark:bg-[#2aaa77]/20 text-[#2aaa77] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#2aaa77]" />
            </div>
            <svg className="w-20 h-8 opacity-80 shrink-0" viewBox="0 0 80 31" fill="none">
              <path d="M2 24Q12 12 20 14T40 12T60 10T78 3" stroke="#63c7a5" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-3 text-[11.5px] font-bold text-[var(--muted)]">Actividades agendadas</div>
          <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[var(--text)] mt-0.5 font-sans">
            {statsCounts.events}
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-[var(--muted)] mt-1.5 truncate">
            <Clock className="w-3 h-3 text-[#2aaa77] shrink-0" />
            <span className="truncate">Programación del período</span>
          </div>
        </Link>

      </section>

      {/* ================= FILA 1 DE PANELES GRÁFICOS (LÍNEA CURVA + DONUT) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Panel Izquierdo: Registro de Casos por Mes (span 7 u 8) */}
        <section className="xl:col-span-7 2xl:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-[var(--shadow)] flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-[15px] font-extrabold text-[var(--text)] tracking-tight font-sans">
                Registro de casos por mes
              </h3>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                Cantidad de casos ingresados a la DEMUNA &bull; Ejemplo 2026
              </p>
            </div>

            {/* Selector de Período: Mes | Trimestre | Año */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[10.5px] font-extrabold">
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 rounded-lg transition-all ${period === 'month' ? 'bg-[var(--surface)] text-[#7044e6] shadow-sm font-black' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setPeriod('quarter')}
                className={`px-3 py-1.5 rounded-lg transition-all ${period === 'quarter' ? 'bg-[var(--surface)] text-[#7044e6] shadow-sm font-black' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              >
                Trimestre
              </button>
              <button
                type="button"
                onClick={() => setPeriod('year')}
                className={`px-3 py-1.5 rounded-lg transition-all ${period === 'year' ? 'bg-[var(--surface)] text-[#7044e6] shadow-sm font-black' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              >
                Año
              </button>
            </div>
          </div>

          {/* Área SVG del Gráfico de Casos */}
          <div className="relative w-full h-64 mt-2">
            <svg
              viewBox={`0 0 ${chartSvgContent.W} ${chartSvgContent.H}`}
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b64eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b64eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Líneas horizontales de grilla y números de eje Y */}
              {chartSvgContent.gridLines.map((gl, i) => (
                <g key={i}>
                  <line
                    x1={chartSvgContent.pad.l}
                    y1={gl.yy}
                    x2={chartSvgContent.W - chartSvgContent.pad.r}
                    y2={gl.yy}
                    stroke="var(--line)"
                    strokeDasharray="4 5"
                    strokeWidth="1"
                  />
                  <text
                    x={chartSvgContent.pad.l - 10}
                    y={gl.yy + 4}
                    textAnchor="end"
                    fill="var(--muted)"
                    fontSize="10.5"
                    className="font-sans"
                  >
                    {gl.val}
                  </text>
                </g>
              ))}

              {/* Relleno con gradiente y Trazo de línea suave */}
              {chartSvgContent.coords.length > 1 ? (
                <>
                  <path d={chartSvgContent.areaD} fill="url(#chart-grad)" />
                  <path
                    d={chartSvgContent.lineD}
                    fill="none"
                    stroke="#8253ed"
                    strokeWidth="3.3"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <rect
                  x={chartSvgContent.getX(0) - 25}
                  y={chartSvgContent.coords[0][1]}
                  width="50"
                  height={chartSvgContent.pad.t + (chartSvgContent.H - chartSvgContent.pad.t - chartSvgContent.pad.b) - chartSvgContent.coords[0][1]}
                  rx="8"
                  fill="#8054e9"
                  opacity="0.9"
                />
              )}

              {/* Nombres de mes en eje X y Puntos interactivos con Tooltip */}
              {currentRows.map((r, i) => {
                const cx = chartSvgContent.getX(i);
                const cy = chartSvgContent.coords[i][1];
                return (
                  <g key={i}>
                    <text
                      x={cx}
                      y={chartSvgContent.H - 10}
                      textAnchor="middle"
                      fill="var(--muted)"
                      fontSize="10.5"
                      className="font-sans"
                    >
                      {r.label}
                    </text>

                    {/* Círculo interactivo */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={currentRows.length === 1 ? 7 : 5}
                      fill="#ffffff"
                      stroke="#8253ed"
                      strokeWidth="3"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onMouseEnter={() => setTooltipData({ x: cx, y: cy, label: r.full, val: r.cases })}
                      onMouseLeave={() => setTooltipData(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip flotante */}
            {tooltipData && (
              <div
                className="absolute pointer-events-none bg-[#151632] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full mb-2 z-20 border border-[#373351]"
                style={{
                  left: `${(tooltipData.x / chartSvgContent.W) * 100}%`,
                  top: `${(tooltipData.y / chartSvgContent.H) * 100}%`
                }}
              >
                {tooltipData.label}: <span className="text-[#ffc36c]">{tooltipData.val} casos</span>
              </div>
            )}
          </div>
        </section>

        {/* Panel Derecho: Fichas por tipo (Donut Chart) */}
        <section className="xl:col-span-5 2xl:col-span-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-[var(--shadow)] flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-[15px] font-extrabold text-[var(--text)] tracking-tight font-sans">
                Fichas por tipo
              </h3>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                Recepción, entrevista, visita y seguimiento
              </p>
            </div>
            <Link
              to="/fichas"
              className="text-[#8154ec] hover:underline text-[11px] font-extrabold flex items-center space-x-0.5 whitespace-nowrap"
            >
              <span>Ver fichas</span>
              <span>&nearr;</span>
            </Link>
          </div>

          {/* Gráfico de Dona SVG */}
          <div className="flex flex-col sm:flex-row xl:flex-row items-center justify-center gap-5 sm:gap-6 my-auto py-3">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 xl:w-36 xl:h-36 2xl:w-44 2xl:h-44 shrink-0">
              <svg viewBox="0 0 210 210" className="w-full h-full -rotate-90">
                {/* Círculo base tenue */}
                <circle
                  cx="105"
                  cy="105"
                  r="76"
                  stroke="var(--line)"
                  strokeWidth="22"
                  fill="none"
                />

                {/* Arcos coloreados según porcentaje */}
                {(() => {
                  let cum = 0;
                  const circ = 2 * Math.PI * 76;
                  return formTotals.map((val, idx) => {
                    const length = totalForms > 0 ? (val / totalForms) * circ : 0;
                    const strokeDash = `${Math.max(0, length - 5)} ${circ}`;
                    const strokeOffset = -cum;
                    cum += length;

                    return (
                      <circle
                        key={idx}
                        cx="105"
                        cy="105"
                        r="76"
                        fill="none"
                        stroke={formColors[idx]}
                        strokeWidth="22"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()}
              </svg>

              {/* Centro de la dona con cifra total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[var(--text)] font-sans">
                  {totalForms}
                </span>
                <span className="text-[11px] text-[var(--muted)] font-medium mt-0.5">
                  fichas
                </span>
              </div>
            </div>

            {/* Leyenda de la Dona */}
            <div className="space-y-2.5 w-full sm:w-auto flex-1 min-w-0">
              {formNames.map((name, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-[var(--muted)] gap-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: formColors[idx] }} />
                    <span className="text-[11px] truncate">{name}</span>
                  </div>
                  <strong className="text-[var(--text)] font-extrabold text-xs shrink-0 pl-1">
                    {formTotals[idx]}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ================= FILA 2 DE PANELES (DOCUMENTOS POR FORMATO + AGENDA) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        
        {/* Documentos por formato */}
        <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-[var(--shadow)] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-[15px] font-extrabold text-[var(--text)] tracking-tight font-sans">
                  Documentos por formato
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Documentación elaborada y generada en el período
                </p>
              </div>
              <Link
                to="/reportes/mimp"
                className="text-[#8154ec] hover:underline text-[11px] font-extrabold flex items-center space-x-0.5 whitespace-nowrap"
              >
                <span>Ver documentos</span>
                <span>&nearr;</span>
              </Link>
            </div>

            {/* Barras Horizontales de Progreso con ancho flexible */}
            <div className="space-y-3.5 py-2">
              {docNames.map((name, i) => {
                const count = docTotals[i];
                const pct = (count / maxDocTotal) * 100;
                const gradients = [
                  'from-[#6952e6] to-[#a883f8]',
                  'from-[#26a2df] to-[#7ccbf7]',
                  'from-[#e9a84c] to-[#f3c987]',
                  'from-[#42b59c] to-[#90decb]',
                  'from-[#7777d8] to-[#b3b8fb]'
                ];

                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-28 sm:w-36 md:w-44 text-[11px] font-bold text-[var(--text)] truncate shrink-0" title={name}>
                      {name}
                    </span>
                    <div className="flex-1 min-w-0 h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--line)]/50">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradients[i]} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 text-right font-extrabold text-[11.5px] text-[var(--text)] shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-[var(--muted)] border-t border-dashed border-[var(--line)] pt-3.5 mt-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#259be8] shrink-0" />
            <span>Los formatos y conteos son auditados con la base de datos central de DEMUNA.</span>
          </div>
        </section>

        {/* Próximas actividades (Agenda) */}
        <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-[var(--shadow)] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-[15px] font-extrabold text-[var(--text)] tracking-tight font-sans">
                  Próximas actividades
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Agenda institucional &bull; Programación y audiencias
                </p>
              </div>
              <Link
                to="/agenda"
                className="text-[#8154ec] hover:underline text-[11px] font-extrabold flex items-center space-x-0.5 whitespace-nowrap"
              >
                <span>Ver agenda</span>
                <span>&nearr;</span>
              </Link>
            </div>

            {/* Lista de Eventos con protección de desborde */}
            <div className="space-y-2">
              {displayEvents.map((ev, i) => (
                <div
                  key={i}
                  onClick={() => showToast(`Actividad: ${ev.title} programada para el ${ev.day} de noviembre (${ev.time}).`)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-transparent hover:border-[var(--line)] group gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Bloque de Fecha */}
                    <div className="w-10 h-11 sm:w-11 sm:h-12 rounded-xl bg-[#f4efff] dark:bg-[#7649dc]/20 text-[#7649dc] flex flex-col items-center justify-center font-sans font-extrabold shrink-0 border border-[#7649dc]/30">
                      <span className="text-sm sm:text-base leading-none">{ev.day}</span>
                      <span className="text-[8.5px] sm:text-[9px] tracking-wider mt-0.5 leading-none">{ev.month}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[var(--text)] leading-tight truncate group-hover:text-[#8154ec] transition-colors" title={ev.title}>
                        {ev.title}
                      </h4>
                      <span className="flex items-center space-x-1 text-[10px] sm:text-[10.5px] text-[var(--muted)] mt-1">
                        <Clock className="w-3 h-3 text-[#259be8] shrink-0" />
                        <span className="truncate">{ev.time}</span>
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[9.5px] font-extrabold bg-[#f2edff] dark:bg-[#875be4]/20 text-[#875be4] border border-[#875be4]/30 shrink-0 whitespace-nowrap">
                    {ev.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[var(--muted)] border-t border-[var(--line)] pt-3 mt-3">
            <span>Sincronizado con el calendario de audiencias</span>
            <Link to="/agenda" className="text-[#8154ec] font-bold hover:underline">
              Agendar nueva cita &rarr;
            </Link>
          </div>
        </section>

      </div>

      {/* ================= TABLA DE EXPEDIENTES RECIENTES ================= */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-[15px] font-extrabold text-[var(--text)] tracking-tight font-sans">
              Expedientes recientes
            </h3>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Consulta rápida de referencias internas &bull; Sin datos personales expuestos
            </p>
          </div>

          <Link
            to="/expedientes"
            className="text-[#8154ec] hover:underline text-[11px] font-extrabold flex items-center space-x-0.5 whitespace-nowrap self-start sm:self-auto"
          >
            <span>Ver todos los casos</span>
            <span>&nearr;</span>
          </Link>
        </div>

        {/* Barra de Búsqueda y Limpiar Filtro */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar expediente o trámite..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] border border-[var(--line)] focus:border-[#6c3aed] focus:ring-2 focus:ring-[#6c3aed]/20 rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none transition-all"
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors self-end sm:self-auto"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        {/* Tabla Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Expediente</th>
                <th className="py-3 px-4">Tipo de registro</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Situación ilustrativa</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-xs">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--muted)] text-xs">
                    No hay expedientes que coincidan con el filtro ingresado.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-[#7446e1] font-mono">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text)]">
                      {c.type}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--muted)]">
                      {c.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10.5px] font-bold ${getStatusBadge(c.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        <span>{c.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Consultando detalles para el expediente ${c.code}...`)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[#6c3aed] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--line)] transition-all cursor-pointer"
                        title="Ver detalles"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Tabla */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-[var(--muted)] border-t border-[var(--line)] pt-3.5 mt-3 gap-2">
          <span>Mostrando {filteredCases.length} de {cases.length} registros</span>
          <Link to="/expedientes" className="text-[#8154ec] font-bold hover:underline">
            Consultar módulo completo de expedientes &rarr;
          </Link>
        </div>
      </section>

      {/* ================= MODAL: NUEVA ATENCIÓN (DEMO/REAL) ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[var(--text)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold">Nueva atención (registro rápido)</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Registra una ficha rápida para seguimiento en el tablero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemoCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Tipo de registro</label>
                <select
                  value={demoType}
                  onChange={(e) => setDemoType(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                >
                  <option value="Recepción">Recepción de caso</option>
                  <option value="Entrevista">Ficha de entrevista</option>
                  <option value="Visita">Ficha de visita</option>
                  <option value="Seguimiento">Ficha de seguimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Situación procesal</label>
                <select
                  value={demoStatus}
                  onChange={(e) => setDemoStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] outline-none focus:border-[#6c3aed]"
                >
                  <option value="Recepción">Recepción</option>
                  <option value="En seguimiento">En seguimiento</option>
                  <option value="Concluido">Concluido</option>
                  <option value="Derivado">Derivado</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8751f9] to-[#6330df] shadow-md hover:opacity-95"
                >
                  Agregar registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FLOATING TOAST ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e2047] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border border-[#6c3aed]/40 flex items-center space-x-2 animate-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#ffc36c]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= PIE DE PÁGINA ================= */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] border-t border-[var(--line)] pt-5 pb-2 gap-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#8c7deb]" />
          <span>Plataforma institucional de gestión tutelar &bull; Municipalidad Distrital de Sapillica</span>
        </div>
        <span>Diseño SISTDEMUNA &copy; {new Date().getFullYear()}</span>
      </footer>

    </div>
  );
};
