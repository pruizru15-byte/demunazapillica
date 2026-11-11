import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  User,
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Scale,
  Home,
  Check,
  FileText,
  Building2,
  Trash2,
  ExternalLink,
  Users
} from 'lucide-react';

export const AgendaPage = () => {
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ totalMonth: 0, audiencias: 0, visitas: 0, entrevistas: 0, realizadas: 0, pendientes: 0, upcomingNext7Days: 0 });
  const [loading, setLoading] = useState(true);
  const [expedientesList, setExpedientesList] = useState([]);

  // Control de Vista: 'calendar' | 'list' | 'week'
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Control del Mes para el Calendario Interactivo
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal Agendar Evento
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    expedienteId: '',
    type: 'Audiencia de Conciliación',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: 'Oficina DEMUNA Zapillica - Sala de Audiencias',
    amount: ''
  });

  // Modal Detalle de Evento
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, notifRes, statsRes] = await Promise.all([
        apiClient.get(ENDPOINTS.AGENDA_EVENTS),
        apiClient.get(ENDPOINTS.AGENDA_NOTIFICATIONS),
        apiClient.get(ENDPOINTS.AGENDA_STATS)
      ]);

      if (evRes.data?.success) setEvents(evRes.data.data);
      if (notifRes.data?.success) setNotifications(notifRes.data.data);
      if (statsRes.data?.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error("Error al cargar agenda", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    apiClient.get(ENDPOINTS.EXPEDIENTES).then(res => {
      if (res.data?.success && res.data.data.length > 0) {
        setExpedientesList(res.data.data);
        setForm(prev => ({ ...prev, expedienteId: res.data.data[0].id }));
      }
    }).catch(console.error);
  }, []);

  // Crear nuevo evento
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        expedienteId: form.expedienteId,
        type: form.type,
        description: form.description || `${form.type} programada`,
        date: form.date,
        time: form.time + ':00',
        amount: form.amount ? parseFloat(form.amount) : null
      };

      const res = await apiClient.post(ENDPOINTS.AGENDA_EVENTS, payload);
      if (res.data?.success) {
        setIsCreateModalOpen(false);
        setForm({
          expedienteId: expedientesList[0]?.id || '',
          type: 'Audiencia de Conciliación',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          location: 'Oficina DEMUNA Zapillica - Sala de Audiencias',
          amount: ''
        });
        showToast("Actividad agendada y registrada en el sistema.");
        fetchData();
      } else {
        alert(res.data?.message || "Error al agendar evento");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al comunicarse con el servidor");
    } finally {
      setSaving(false);
    }
  };

  // Marcar evento como realizado o pendiente
  const handleUpdateEventStatus = async (id, newStatus) => {
    try {
      await apiClient.put(ENDPOINTS.AGENDA_EVENT_STATUS(id), { status: newStatus });
      showToast(`Actividad marcada como: ${newStatus}`);
      setSelectedEvent(null);
      fetchData();
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async (id) => {
    if (!confirm("¿Deseas eliminar esta actividad de la agenda?")) return;
    try {
      await apiClient.delete(ENDPOINTS.AGENDA_EVENT_DELETE(id));
      showToast("Actividad eliminada de la agenda.");
      setSelectedEvent(null);
      fetchData();
    } catch (err) {
      alert("Error al eliminar actividad");
    }
  };

  // Descartar notificación
  const handleDismissNotification = async (id) => {
    try {
      await apiClient.put(ENDPOINTS.AGENDA_NOTIF_READ(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast("Aviso marcado como leído.");
    } catch (err) {
      console.error(err);
    }
  };

  // Exportar calendario a formato .ics (iCalendar)
  const handleExportICS = () => {
    if (events.length === 0) {
      alert("No hay actividades para exportar.");
      return;
    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DEMUNA//DEMUNA ZAPILLICA v2.0//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Agenda DEMUNA Zapillica',
      'X-WR-TIMEZONE:America/Lima'
    ];

    events.forEach(ev => {
      const cleanDate = (ev.eventDate || '').replace(/-/g, '');
      const cleanTime = (ev.eventTime || '09:00:00').replace(/:/g, '').substring(0, 6);
      const dtStart = `${cleanDate}T${cleanTime}`;
      
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:event-${ev.id}-demuna@munizapillica.gob.pe`);
      lines.push(`DTSTAMP:${cleanDate}T000000Z`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`SUMMARY:${ev.type} - Caso ${ev.expedienteCode || ''}`);
      lines.push(`DESCRIPTION:${(ev.description || '').replace(/\n/g, ' ')}`);
      lines.push(`LOCATION:Oficina DEMUNA Zapillica / Diligencia`);
      lines.push(`STATUS:${ev.status === 'Realizado' ? 'CONFIRMED' : 'TENTATIVE'}`);
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DEMUNA_ZAPILLICA_Agenda_${new Date().toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Archivo iCalendar (.ics) descargado. Puedes importarlo en Google Calendar u Outlook.");
  };

  // Filtrado de eventos
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch = !searchQuery.trim() ||
        (ev.type + ' ' + ev.description + ' ' + ev.expedienteCode + ' ' + (ev.involvedPersonName || '')).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || ev.type.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, selectedType]);

  // Colores por tipo de evento
  const getEventBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('concilia') || t.includes('audiencia')) {
      return { bg: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30', dot: 'bg-[#10b981]', icon: Scale, label: 'Conciliación' };
    }
    if (t.includes('visita')) {
      return { bg: 'bg-[#ffc36c]/15 text-[#fde047] border-[#ffc36c]/30', dot: 'bg-[#ffc36c]', icon: Home, label: 'Visita Domiciliaria' };
    }
    if (t.includes('entrevista') || t.includes('psicol')) {
      return { bg: 'bg-[#2faaf7]/15 text-[#38bdf8] border-[#2faaf7]/30', dot: 'bg-[#2faaf7]', icon: User, label: 'Entrevista' };
    }
    return { bg: 'bg-[#8b59f6]/15 text-[#a78bfa] border-[#8b59f6]/30', dot: 'bg-[#8b59f6]', icon: CalendarIcon, label: 'Diligencia' };
  };

  // ================= LÓGICA DE DÍAS DEL CALENDARIO =================
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 es domingo
    // Convertir a Lunes = 0
    const startOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Días del mes anterior
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateStr: new Date(year, month - 1, daysInPrevMonth - i).toISOString().split('T')[0]
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateStr: dStr,
        isToday: dStr === new Date().toISOString().split('T')[0]
      });
    }

    // Días sobrantes para completar cuadrícula de 35 o 42 celdas
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateStr: new Date(year, month + 1, i).toISOString().split('T')[0]
      });
    }

    return days;
  }, [year, month]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Flotante */}
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
              Agenda y actividades de DEMUNA ZAPILLICA
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#6c3aed]/15 text-[#8b59f6] border border-[#6c3aed]/30">
              {stats.upcomingNext7Days} en los próximos 7 días
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Cronograma interactivo de audiencias de conciliación, visitas domiciliarias, entrevistas y notificaciones
          </p>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchData()}
            title="Refrescar agenda"
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#6c3aed] text-[var(--muted)] hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6c3aed]' : ''}`} />
          </button>

          <button
            onClick={handleExportICS}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#2faaf7] text-[var(--text)] text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-[#2faaf7]" />
            <span>Sincronizar (.ics)</span>
          </button>

          <button
            onClick={() => {
              setForm(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] hover:brightness-110 text-white text-xs font-black shadow-lg shadow-[#6c3aed]/25 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Agendar Cita o Actividad</span>
          </button>
        </div>
      </div>

      {/* ================= 4 MINI KPIS DARK TECH ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Actividades del Mes */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#8b59f6] uppercase tracking-wider font-mono">
              {monthNames[month].substring(0, 3)}
            </span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Actividades del Mes</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.totalMonth}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">{stats.realizadas} concluidas con éxito</span>
        </div>

        {/* KPI 2: Audiencias de Conciliación */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#10b981]/15 text-[#34d399] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#34d399] uppercase tracking-wider">AUDIENCIAS</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Conciliaciones Programadas</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.audiencias}
          </div>
          <span className="text-[10.5px] text-[#34d399] font-semibold mt-1 block">Con citación a las partes</span>
        </div>

        {/* KPI 3: Visitas Domiciliarias */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#ffc36c]/15 text-[#fde047] flex items-center justify-center">
              <Home className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#fde047] uppercase tracking-wider">CAMPO</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Visitas Domiciliarias</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.visitas}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">Inspecciones in situ</span>
        </div>

        {/* KPI 4: Entrevistas Psicológicas */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#2faaf7]/15 text-[#38bdf8] flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">ATENCIÓN</span>
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--muted)]">Entrevistas & Diligencias</div>
          <div className="text-2xl font-black text-[var(--text)] tracking-tight mt-0.5 font-mono">
            {stats.entrevistas}
          </div>
          <span className="text-[10.5px] text-[var(--muted)] mt-1 block">{stats.pendientes} pendientes de ejecución</span>
        </div>
      </div>

      {/* ================= CONTROLES DE VISTA Y FILTRO ================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Selector de Navegación del Mes */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-[var(--text)] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-black text-[var(--text)] font-sans px-3">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-[var(--text)] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-xs font-bold text-[var(--muted)] hover:text-white transition-all ml-1"
          >
            Hoy
          </button>
        </div>

        {/* Buscador y Selector de Modo */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cita, caso o persona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none focus:border-[#6c3aed]"
            />
          </div>

          <div className="flex items-center p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-[#6c3aed] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-[#6c3aed] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENIDO PRINCIPAL: CALENDARIO O LISTADO ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* PANEL IZQUIERDO: CALENDARIO / LISTA (3 COLUMNAS) */}
        <div className="lg:col-span-3 space-y-4">
          {viewMode === 'calendar' ? (
            
            /* ================= CALENDARIO MENSUAL DARK TECH ================= */
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] overflow-hidden shadow-sm">
              {/* Cabecera de los 7 días de la semana */}
              <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--surface-2)] text-center text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] py-2.5">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span className="text-[#ffc36c]">Sáb</span>
                <span className="text-red-400">Dom</span>
              </div>

              {/* Grilla de Días */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[var(--line)] text-xs">
                {calendarDays.map((day, idx) => {
                  const dayEvents = filteredEvents.filter(ev => ev.eventDate === day.dateStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setForm(prev => ({ ...prev, date: day.dateStr }));
                        setIsCreateModalOpen(true);
                      }}
                      className={`min-h-[105px] p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                        !day.isCurrentMonth
                          ? 'bg-[var(--bg)]/40 text-[var(--muted)] opacity-35'
                          : day.isToday
                          ? 'bg-[#6c3aed]/10 ring-1 ring-inset ring-[#6c3aed]'
                          : 'bg-[var(--surface)] hover:bg-[var(--surface-2)]/60'
                      }`}
                    >
                      {/* Número de día */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono font-bold text-xs ${
                            day.isToday
                              ? 'w-6 h-6 rounded-full bg-[#6c3aed] text-white flex items-center justify-center shadow-sm'
                              : day.isCurrentMonth
                              ? 'text-[var(--text)]'
                              : 'text-[var(--muted)]'
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-extrabold text-[var(--muted)] font-mono">
                            {dayEvents.length} {dayEvents.length === 1 ? 'cita' : 'citas'}
                          </span>
                        )}
                      </div>

                      {/* Chips de eventos en ese día */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map(ev => {
                          const badge = getEventBadge(ev.type);
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border truncate flex items-center space-x-1 ${badge.bg} hover:brightness-110 transition-all`}
                            >
                              <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                              <span className="font-mono text-[9px]">{ev.eventTime.substring(0, 5)}</span>
                              <span className="truncate">{ev.type}</span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <span className="text-[9px] text-[var(--muted)] font-bold block text-right">
                            +{dayEvents.length - 3} más
                          </span>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#8b59f6] text-right font-bold mt-1">
                        + Agendar
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            
            /* ================= VISTA LISTADO CRONOLÓGICO ================= */
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] divide-y divide-[var(--line)] shadow-sm">
              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-40" />
                  <h4 className="text-sm font-bold text-[var(--text)]">No hay actividades programadas</h4>
                  <p className="text-xs text-[var(--muted)] mt-1">No se encontraron citas o eventos con los filtros actuales.</p>
                </div>
              ) : (
                filteredEvents.map(ev => {
                  const badge = getEventBadge(ev.type);
                  const Icon = badge.icon;
                  const isDone = ev.status === 'Realizado';

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="p-4 hover:bg-[var(--surface-2)]/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-[var(--text)]">{ev.type}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            {isDone && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                                Realizado
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[var(--text)] font-medium">{ev.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] pt-1">
                            <span className="flex items-center font-mono text-[11px] text-[var(--text)] font-bold">
                              <Clock className="w-3.5 h-3.5 mr-1 text-[#6c3aed]" />
                              {ev.eventDate} a las {ev.eventTime}
                            </span>

                            {ev.expedienteCode && (
                              <span className="flex items-center text-[#2faaf7] font-mono font-bold">
                                Caso: {ev.expedienteCode}
                              </span>
                            )}

                            {ev.involvedPersonName && (
                              <span className="flex items-center">
                                <User className="w-3.5 h-3.5 mr-1" />
                                {ev.involvedPersonName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text)] hover:border-[#6c3aed]"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: NOTIFICACIONES & PRÓXIMAS ACTIVIDADES (1 COLUMNA) */}
        <div className="space-y-4">
          
          {/* Tarjeta de Notificaciones Activas */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[#ffc36c]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">
                  Alertas y Notificaciones
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ffc36c]/15 text-[#ffc36c] font-mono">
                {notifications.length}
              </span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-6">
                No hay notificaciones de audiencia pendientes.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--line)] space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--text)] line-clamp-1">
                        {notif.title}
                      </span>
                      <button
                        onClick={() => handleDismissNotification(notif.id)}
                        title="Marcar como leída"
                        className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-white transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-mono pt-1">
                      <span>{notif.scheduledDate} {notif.scheduledTime?.substring(0, 5)}</span>
                      {notif.expedienteCode && <span className="text-[#2faaf7] font-bold">{notif.expedienteCode}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tarjeta de acceso directo a Cita Rápida */}
          <div className="p-5 rounded-[var(--radius)] bg-gradient-to-br from-[#6c3aed]/15 via-[var(--surface)] to-transparent border border-[#6c3aed]/30 space-y-3">
            <div className="flex items-center space-x-2 text-[#8b59f6]">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase">Audiencias DEMUNA Zapillica</h4>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Las citas agendadas aquí generan notificaciones oficiales para las partes y sincronización en Google Calendar u Outlook.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2 bg-[#6c3aed] text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
            >
              + Nueva Citación
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: AGENDAR CITA O ACTIVIDAD ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-2)]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[var(--text)]">Agendar Actividad o Cita</h3>
                  <p className="text-[11px] text-[var(--muted)]">Programación de audiencia, visita domiciliaria o diligencia</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              {/* Tipo de Actividad */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                  Tipo de Actividad *
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Audiencia de Conciliación">Audiencia de Conciliación</option>
                  <option value="Segunda Audiencia de Conciliación">Segunda Audiencia de Conciliación</option>
                  <option value="Visita Domiciliaria / De Campo">Visita Domiciliaria / De Campo</option>
                  <option value="Entrevista Psicológica / Social">Entrevista Psicológica / Social</option>
                  <option value="Reunión de Coordinación Interna">Reunión de Coordinación Interna</option>
                  <option value="Actividad de Difusión Comunitaria">Actividad de Difusión Comunitaria</option>
                </select>
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
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  {expedientesList.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.code} &bull; {exp.subject} ({exp.workerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Lugar / Ubicación */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                  Lugar / Sala / Domicilio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sala de Audiencias DEMUNA Zapillica / Domicilio en Caserío El Palmo"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs outline-none"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">
                  Descripción / Objeto de la Cita *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Ej: Audiencia formal para tratar materia de pensión de alimentos y régimen de visitas del NNA."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs outline-none"
                />
              </div>

              {/* Botones */}
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white text-xs font-black shadow-lg shadow-[#6c3aed]/25 hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Programar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETALLE Y GESTIÓN DE EVENTO ================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <span className="font-mono text-xs font-bold text-[#8b59f6] block">
                  {selectedEvent.expedienteCode || 'Actividad DEMUNA Zapillica'}
                </span>
                <h4 className="text-base font-black text-[var(--text)] mt-0.5">{selectedEvent.type}</h4>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[var(--muted)] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[var(--surface-2)] rounded-xl space-y-1.5">
                <p className="text-[var(--text)] font-medium">"{selectedEvent.description}"</p>
                <div className="flex items-center space-x-2 text-[var(--muted)] font-mono text-[11px] pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#6c3aed]" />
                  <span>{selectedEvent.eventDate} &bull; {selectedEvent.eventTime}</span>
                </div>
              </div>

              {selectedEvent.involvedPersonName && (
                <p><strong>Persona Citada:</strong> {selectedEvent.involvedPersonName}</p>
              )}
              {selectedEvent.workerName && (
                <p><strong>Especialista a Cargo:</strong> {selectedEvent.workerName}</p>
              )}
              <div className="flex items-center space-x-2 pt-1">
                <strong>Estado:</strong>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedEvent.status === 'Realizado'
                    ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                    : 'bg-[#ffc36c]/15 text-[#fde047] border border-[#ffc36c]/30'
                }`}>
                  {selectedEvent.status || 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Acciones del evento */}
            <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-xs"
                title="Eliminar cita"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                {selectedEvent.expedienteId && (
                  <Link
                    to={`/expedientes/${selectedEvent.expedienteId}`}
                    className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[#6c3aed] text-xs font-bold text-[var(--text)] flex items-center space-x-1"
                  >
                    <span>Ver Caso</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {selectedEvent.status !== 'Realizado' ? (
                  <button
                    onClick={() => handleUpdateEventStatus(selectedEvent.id, 'Realizado')}
                    className="px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-white text-xs font-bold shadow-md flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Marcar Realizada</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateEventStatus(selectedEvent.id, 'Pendiente')}
                    className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-white"
                  >
                    Reabrir Cita
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
