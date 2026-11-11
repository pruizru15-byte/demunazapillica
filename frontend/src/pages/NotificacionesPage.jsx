import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../api/endpoints';
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  Folder,
  AlertTriangle,
  Info,
  DollarSign,
  ClipboardList,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  User,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Users,
  Download,
  Copy,
  Check,
  Phone,
  FileText
} from 'lucide-react';

export const NotificacionesPage = () => {
  const navigate = useNavigate();

  // State
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todas'); // 'todas', 'no_leidas', 'citas', 'pensiones', 'seguimiento', 'sistema', 'leidas'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'Alta', 'Media', 'Informativa'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Modal Nueva Alerta State
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expedientesList, setExpedientesList] = useState([]);
  const [expedienteSearch, setExpedienteSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    expedienteId: '',
    type: 'Audiencia',
    priority: 'Media',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
  });

  // Modal Detalle de Notificación State
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [clearingRead, setClearingRead] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Broadcast update to Navbar/Sidebar
  const notifyGlobalUpdate = () => {
    window.dispatchEvent(new Event('demuna-notifications-updated'));
  };

  // Fetch Notifications and Stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [resNotif, resStats] = await Promise.all([
        axios.get(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES}`, { headers }),
        axios.get(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES_STATS}`, { headers }).catch(() => ({ data: { data: null } }))
      ]);

      if (resNotif.data?.data) {
        setNotifications(resNotif.data.data);
      }
      if (resStats.data?.data) {
        setStats(resStats.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load expedientes for modal
  const fetchExpedientes = async () => {
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.EXPEDIENTES}`, { headers });
      if (res.data?.data) {
        setExpedientesList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching expedientes for modal:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchExpedientes();
  }, []);

  // Actions
  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE_URL}${ENDPOINTS.NOTIFICACION_READ(id)}`, {}, { headers });
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Leida' } : n));
      setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1), read: prev.read + 1 } : null);
      showToast('Notificación marcada como leída');
      notifyGlobalUpdate();
    } catch (err) {
      console.error(err);
      showToast('No se pudo marcar la notificación');
    }
  };

  const handleMarkAsUnread = async (id, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE_URL}${ENDPOINTS.NOTIFICACION_UNREAD(id)}`, {}, { headers });
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Activa' } : n));
      setStats(prev => prev ? { ...prev, unread: prev.unread + 1, read: Math.max(0, prev.read - 1) } : null);
      showToast('Notificación marcada como no leída');
      notifyGlobalUpdate();
    } catch (err) {
      console.error(err);
      showToast('No se pudo actualizar');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES_READ_ALL}`, {}, { headers });
      
      setNotifications(prev => prev.map(n => ({ ...n, status: 'Leida' })));
      setStats(prev => prev ? { ...prev, unread: 0, read: prev.total } : null);
      showToast('Todas las notificaciones han sido marcadas como leídas');
      notifyGlobalUpdate();
    } catch (err) {
      console.error(err);
      showToast('Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('¿Está seguro de descartar y eliminar esta notificación?')) return;

    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE_URL}${ENDPOINTS.NOTIFICACION_DELETE(id)}`, { headers });
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchData();
      showToast('Notificación eliminada');
      notifyGlobalUpdate();
    } catch (err) {
      console.error(err);
      showToast('No se pudo eliminar');
    }
  };

  const handleOpenDetail = async (item, e) => {
    e?.stopPropagation();
    setSelectedNotif(item);
    setShowDetailModal(true);
    setCopied(false);

    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.NOTIFICACION_DETAIL(item.id)}`, { headers });
      if (res.data?.data) {
        setSelectedNotif(res.data.data);
      }
    } catch {
      // mantener item básico en caso de fallo de red
    }
  };

  const handleCopyMessage = () => {
    if (!selectedNotif) return;
    const textToCopy = `DEMUNA - ${selectedNotif.title}\nExpediente: ${selectedNotif.expedienteCode || 'General'}\nFecha: ${selectedNotif.scheduledDate} ${selectedNotif.scheduledTime || ''}\nPrioridad: ${selectedNotif.priority}\n\nMensaje: ${selectedNotif.message}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClearRead = async () => {
    if (!window.confirm('¿Está seguro de eliminar permanentemente todas las notificaciones marcadas como leídas?')) return;
    setClearingRead(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.delete(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES_CLEAR_READ}`, { headers });
      showToast(res.data?.message || 'Historial de leídas depurado correctamente');
      fetchData();
      notifyGlobalUpdate();
    } catch (err) {
      console.error(err);
      showToast('Error al depurar el historial');
    } finally {
      setClearingRead(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredNotifications.length) {
      alert("No hay notificaciones para exportar con los filtros seleccionados.");
      return;
    }

    const headers = ['ID', 'Tipo', 'Prioridad', 'Título', 'Mensaje', 'Fecha Programada', 'Hora', 'N° Expediente', 'Parte Involucrada', 'Estado'];
    const rows = filteredNotifications.map(n => [
      n.id,
      `"${(n.type || 'General').replace(/"/g, '""')}"`,
      `"${(n.priority || 'Media').replace(/"/g, '""')}"`,
      `"${(n.title || '').replace(/"/g, '""')}"`,
      `"${(n.message || '').replace(/"/g, '""')}"`,
      n.scheduledDate || '',
      n.scheduledTime ? n.scheduledTime.substring(0, 5) : '',
      n.expedienteCode || 'Sin expediente',
      `"${(n.personName || 'Sin asignar').replace(/"/g, '""')}"`,
      n.status === 'Activa' ? 'Pendiente' : 'Leída'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEMUNA_Alertas_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    showToast("Listado de notificaciones descargado en CSV.");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor ingrese el título de la alerta.');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES}`, formData, { headers });

      showToast('Alerta institucional creada con éxito');
      setShowModal(false);
      setFormData({
        title: '',
        message: '',
        expedienteId: '',
        type: 'Audiencia',
        priority: 'Media',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
      });
      fetchData();
      notifyGlobalUpdate();
    } catch (err) {
      console.error(err);
      showToast('Error al registrar alerta');
    } finally {
      setCreating(false);
    }
  };

  // Helper formatting
  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) return 'Fecha no definida';
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
      const formatted = `${d} de ${monthNames[date.getMonth()]} ${y}`;
      if (timeStr) {
        return `${formatted} · ${timeStr.substring(0, 5)} hrs`;
      }
      return formatted;
    } catch {
      return dateStr;
    }
  };

  const getRelativeBadge = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) {
      return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">HOY</span>;
    }
    const diff = (new Date(dateStr) - new Date(today)) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40">Mañana</span>;
    }
    if (diff > 1 && diff <= 3) {
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">En {Math.round(diff)} días</span>;
    }
    if (diff < 0) {
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">Vencido</span>;
    }
    return null;
  };

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === 'no_leidas' && item.status !== 'Activa') return false;
      if (activeTab === 'leidas' && item.status !== 'Leida') return false;
      if (activeTab === 'citas' && !['Audiencia', 'Visita', 'Entrevista', 'Cita'].some(t => (item.type || '').includes(t) || (item.title || '').includes(t))) return false;
      if (activeTab === 'pensiones' && !['Pensión', 'Alimentos', 'Pago'].some(t => (item.type || '').includes(t) || (item.title || '').includes(t))) return false;
      if (activeTab === 'seguimiento' && !['Seguimiento', 'Ficha', 'F11', 'Verificación'].some(t => (item.type || '').includes(t) || (item.title || '').includes(t))) return false;
      if (activeTab === 'sistema' && !['Sistema', 'Respaldo', 'Aviso'].some(t => (item.type || '').includes(t) || (item.title || '').includes(t))) return false;

      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        if (dateFilter === 'today' && item.scheduledDate !== today) return false;
        if (dateFilter === 'week') {
          const itemDate = new Date(item.scheduledDate);
          const tDate = new Date(today);
          const diff = (itemDate - tDate) / (1000 * 60 * 60 * 24);
          if (diff < 0 || diff > 7) return false;
        }
        if (dateFilter === 'month') {
          if (!item.scheduledDate) return false;
          const [y, m] = item.scheduledDate.split('-');
          const curr = new Date();
          if (parseInt(y) !== curr.getFullYear() || parseInt(m) !== (curr.getMonth() + 1)) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (item.title || '').toLowerCase().includes(q);
        const inMsg = (item.message || '').toLowerCase().includes(q);
        const inExp = (item.expedienteCode || '').toLowerCase().includes(q);
        const inPerson = (item.personName || '').toLowerCase().includes(q);
        const inType = (item.type || '').toLowerCase().includes(q);
        if (!inTitle && !inMsg && !inExp && !inPerson && !inType) return false;
      }

      return true;
    });
  }, [notifications, activeTab, priorityFilter, dateFilter, searchQuery]);

  // Filtrar expedientes para el modal de nueva alerta
  const filteredExpedientesForModal = useMemo(() => {
    if (!expedienteSearch.trim()) return expedientesList;
    const q = expedienteSearch.toLowerCase();
    return expedientesList.filter(e =>
      ((e.code || e.NombreExpediente || '') + ' ' + (e.subject || e.Descripcion || '')).toLowerCase().includes(q)
    );
  }, [expedientesList, expedienteSearch]);

  // Icon mapping
  const getTypeIcon = (type, title = '') => {
    const combined = `${type} ${title}`.toLowerCase();
    if (combined.includes('audiencia') || combined.includes('concilia')) {
      return <Calendar className="w-5 h-5 text-[#8b59f6]" />;
    }
    if (combined.includes('pensi') || combined.includes('alimento')) {
      return <DollarSign className="w-5 h-5 text-amber-400" />;
    }
    if (combined.includes('visita')) {
      return <MapPin className="w-5 h-5 text-cyan-400" />;
    }
    if (combined.includes('entrevista')) {
      return <Users className="w-5 h-5 text-blue-400" />;
    }
    if (combined.includes('seguimiento') || combined.includes('ficha')) {
      return <ClipboardList className="w-5 h-5 text-emerald-400" />;
    }
    if (combined.includes('sistema') || combined.includes('respaldo')) {
      return <Shield className="w-5 h-5 text-purple-400" />;
    }
    return <Bell className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f1b3e] border border-[#6c3aed] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-[#ffc36c] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#191731] via-[#211d47] to-[#121029] border border-[#323859]/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c3aed]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#6c3aed]/20 border border-[#8b59f6]/30 text-[#b79bff] text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5" />
              <span>Bandeja Institucional DEMUNA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Centro de Notificaciones y Alertas
            </h1>
            <p className="text-sm text-[#9ea7cb] leading-relaxed">
              Supervisión en tiempo real de citas, audiencias de conciliación, compromisos de pensión de alimentos y avisos procedimentales.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#323859] text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:border-[#2faaf7]"
              title="Descargar alertas filtradas en formato CSV"
            >
              <Download className="w-4 h-4 text-[#2faaf7]" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {stats?.read > 0 && (
              <button
                type="button"
                onClick={handleClearRead}
                disabled={clearingRead}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="Eliminar permanentemente las notificaciones ya leídas del historial"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Limpiar leídas</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#323859] text-white text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm hover:border-[#8b59f6]"
              title="Marcar todas las alertas pendientes como leídas"
            >
              <CheckCheck className="w-4 h-4 text-[#8b59f6]" />
              <span>Marcar todas leídas</span>
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] hover:from-[#5b2cdb] hover:to-[#7a49e6] text-white text-xs font-extrabold transition-all flex items-center space-x-2 shadow-lg shadow-[#6c3aed]/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Alerta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini-KPIs Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Alertas */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Total Avisos</span>
            <h3 className="text-2xl font-black text-[var(--text)] mt-1">
              {stats?.total ?? notifications.length}
            </h3>
            <span className="text-[10px] text-[#9ea7cb]">En el historial institucional</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#6c3aed]/15 border border-[#8b59f6]/30 text-[#8b59f6] flex items-center justify-center shrink-0 ml-3">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* No leídas / Activas */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pendientes de Acción</span>
            <h3 className="text-2xl font-black text-amber-300 mt-1">
              {stats?.unread ?? notifications.filter(n => n.status === 'Activa').length}
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Requieren atención de personal</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 ml-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Audiencias y Citas */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Citas & Audiencias</span>
            <h3 className="text-2xl font-black text-blue-300 mt-1">
              {stats?.audiencias ?? notifications.filter(n => (n.type || '').includes('Audiencia') || (n.title || '').includes('Audiencia')).length}
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Citaciones y diligencias</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 ml-3">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pensiones & Alimentos */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Alimentos & Cuotas</span>
            <h3 className="text-2xl font-black text-emerald-300 mt-1">
              {stats?.pensiones ?? notifications.filter(n => (n.type || '').includes('Pensi') || (n.title || '').includes('Pensi')).length}
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Compromisos monetarios</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 ml-3">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 border-b border-[var(--line)] pb-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'todas', label: 'Todas las Alertas', count: notifications.length },
            { id: 'no_leidas', label: 'No leídas', count: notifications.filter(n => n.status === 'Activa').length, badgeColor: 'bg-amber-500 text-black' },
            { id: 'citas', label: 'Citas y Audiencias' },
            { id: 'pensiones', label: 'Alimentos y Pensiones' },
            { id: 'seguimiento', label: 'Fichas y Seguimiento' },
            { id: 'sistema', label: 'Sistema DEMUNA' },
            { id: 'leidas', label: 'Historial / Leídas', count: notifications.filter(n => n.status === 'Leida').length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer
                  ${isActive
                    ? 'bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white shadow-md shadow-[#6c3aed]/25'
                    : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${tab.badgeColor ? tab.badgeColor : isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[var(--muted)]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg)] p-3 rounded-2xl border border-[var(--line)]">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por asunto, N° de expediente (EXP-2026), persona o contenido..."
              className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#6c3aed] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer"
            >
              <option value="all">Todas las prioridades</option>
              <option value="Alta">Prioridad Alta</option>
              <option value="Media">Prioridad Media</option>
              <option value="Informativa">Informativa</option>
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer"
            >
              <option value="all">Cualquier fecha</option>
              <option value="today">Programadas para Hoy</option>
              <option value="week">Próximos 7 días</option>
              <option value="month">Este mes</option>
            </select>

            <button
              type="button"
              onClick={fetchData}
              title="Recargar avisos"
              className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-white hover:border-[#6c3aed] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b59f6]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#8b59f6] animate-spin mx-auto" />
            <p className="text-xs text-[var(--muted)] font-medium">Cargando bandeja de notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[var(--bg)]/50 rounded-2xl border border-[var(--line)]/50 p-8">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[var(--muted)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-[#2faaf7]" />
            </div>
            <h4 className="text-base font-bold text-[var(--text)]">No hay notificaciones que coincidan</h4>
            <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
              No se encontraron alertas en esta categoría con los filtros seleccionados. Todas las atenciones están al día.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => {
              const isUnread = item.status === 'Activa';
              const priority = item.priority || 'Media';

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className={`
                    cursor-pointer relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group overflow-hidden
                    ${isUnread
                      ? 'bg-gradient-to-r from-[#201c44]/80 via-[#1b173c]/70 to-[#191731] border-[#6c3aed]/50 shadow-lg shadow-[#6c3aed]/10 hover:border-[#8b59f6]'
                      : 'bg-[var(--surface)] border-[var(--line)] hover:border-[#6c3aed]/50 hover:bg-white/[0.03]'
                    }
                  `}
                >
                  {/* Glowing left bar for unread notifications */}
                  {isUnread && (
                    <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#8b59f6] rounded-r-md shadow-[0_0_10px_#8b59f6]" />
                  )}

                  {/* Left Column: Icon + Information */}
                  <div className="flex items-start space-x-3.5 sm:space-x-4 min-w-0 flex-1">
                    
                    {/* Category Icon */}
                    <div className="w-11 h-11 rounded-2xl bg-[#0c0d22] border border-[#323859] flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                      {getTypeIcon(item.type, item.title)}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      
                      {/* Meta pills row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isUnread && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>NUEVA</span>
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          priority === 'Alta'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : priority === 'Informativa'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {priority}
                        </span>

                        {/* Type Badge */}
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/5 text-[var(--muted)] border border-white/10">
                          {item.type || 'Institucional'}
                        </span>

                        {/* Relative day tag */}
                        {getRelativeBadge(item.scheduledDate)}

                        {/* Expediente Code Link */}
                        {item.expedienteId && (
                          <Link
                            to={`/expedientes/${item.expedienteId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#6c3aed]/20 text-[#c5b3ff] hover:text-white border border-[#6c3aed]/40 text-[10.5px] font-bold transition-colors"
                          >
                            <Folder className="w-3 h-3 text-[#b79bff]" />
                            <span>{item.expedienteCode || `EXP-${item.expedienteId}`}</span>
                          </Link>
                        )}
                      </div>

                      {/* Notification Title */}
                      <h4 className="text-sm sm:text-base font-bold text-[var(--text)] tracking-tight group-hover:text-[#b79bff] transition-colors">
                        {item.title}
                      </h4>

                      {/* Message Content */}
                      <p className="text-xs text-[#aeb4d4] leading-relaxed max-w-3xl line-clamp-2">
                        {item.message}
                      </p>

                      {/* Details row: Date, Time & Involucrado */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-[var(--muted)]">
                        <span className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8b59f6]" />
                          <span>{formatDate(item.scheduledDate, item.scheduledTime)}</span>
                        </span>

                        {item.personName && (
                          <span className="flex items-center space-x-1.5">
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            <span>Parte: <strong className="text-white font-medium">{item.personName}</strong></span>
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                    
                    {/* Botón Ver Detalle 360 */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenDetail(item, e)}
                      title="Ver detalle completo 360°"
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#6c3aed]/20 border border-[var(--line)] hover:border-[#8b59f6]/40 text-[#c5b3ff] text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#8b59f6]" />
                      <span className="hidden sm:inline">Detalle</span>
                    </button>

                    {/* View Expediente 360 link */}
                    {item.expedienteId && (
                      <Link
                        to={`/expedientes/${item.expedienteId}`}
                        onClick={(e) => e.stopPropagation()}
                        title="Abrir expediente completo 360°"
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--line)] text-[#c5b3ff] hover:text-white text-xs font-semibold transition-all flex items-center space-x-1"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Caso</span>
                      </Link>
                    )}

                    {/* View in Agenda link */}
                    {item.eventId && (
                      <Link
                        to="/agenda"
                        onClick={(e) => e.stopPropagation()}
                        title="Ver en Agenda y Calendario"
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--line)] text-blue-300 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Agenda</span>
                      </Link>
                    )}

                    {/* Read / Unread toggle */}
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        title="Marcar como leída"
                        className="px-3 py-1.5 rounded-xl bg-[#6c3aed]/20 hover:bg-[#6c3aed]/30 border border-[#8b59f6]/40 text-[#c5b3ff] hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-[#2faaf7]" />
                        <span>Leída</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsUnread(item.id, e)}
                        title="Marcar como pendiente (no leída)"
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--line)] text-[var(--muted)] hover:text-amber-300 text-xs font-medium transition-all cursor-pointer"
                      >
                        Desmarcar
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Descartar y eliminar notificación"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal: Nueva Notificación / Alerta Institucional */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#323859]/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6c3aed]/20 border border-[#8b59f6]/40 text-[#c5b3ff] flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Nueva Alerta Institucional</h3>
                  <p className="text-[11px] text-[#9ea7cb]">Programar aviso en el calendario o expediente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Asunto / Título */}
              <div>
                <label className="block text-xs font-bold text-[#b0b0d4] mb-1.5">
                  Título del Aviso / Alerta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Cédula de Notificación N° 04 entregada / Recordatorio de Cuota"
                  className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                />
              </div>

              {/* Expediente vinculable (opcional) con buscador */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#b0b0d4]">
                    Expediente Vinculado (Opcional)
                  </label>
                  {formData.expedienteId && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, expedienteId: '' })}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Quitar expediente
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={expedienteSearch}
                    onChange={(e) => setExpedienteSearch(e.target.value)}
                    placeholder="Filtrar por código (EXP-2026) o materia..."
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>

                <select
                  value={formData.expedienteId}
                  onChange={(e) => setFormData({ ...formData, expedienteId: e.target.value })}
                  className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                >
                  <option value="">-- Sin expediente (Alerta General) --</option>
                  {filteredExpedientesForModal.map((exp) => (
                    <option key={exp.id || exp.IdExpediente} value={exp.id || exp.IdExpediente}>
                      {exp.code || exp.NombreExpediente} - {exp.subject || exp.Descripcion || 'Caso DEMUNA'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría y Prioridad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                  >
                    <option value="Audiencia">Audiencia / Conciliación</option>
                    <option value="Visita">Visita Domiciliaria</option>
                    <option value="Entrevista">Entrevista Psicológica</option>
                    <option value="Pensión">Pensión de Alimentos</option>
                    <option value="Seguimiento">Ficha de Seguimiento</option>
                    <option value="Notificación">Notificación Cédula</option>
                    <option value="Sistema">Aviso del Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1.5">
                    Nivel de Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                  >
                    <option value="Alta">Alta (Urgente)</option>
                    <option value="Media">Media (Ordinaria)</option>
                    <option value="Informativa">Informativa</option>
                  </select>
                </div>
              </div>

              {/* Fecha y Hora programada */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1.5">
                    Fecha Programada *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1.5">
                    Hora Programada
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>
              </div>

              {/* Mensaje / Observaciones */}
              <div>
                <label className="block text-xs font-bold text-[#b0b0d4] mb-1.5">
                  Mensaje Detallado / Instrucciones
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detalles sobre la diligencia, citación de partes o seguimiento..."
                  className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#323859]/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white text-xs font-extrabold hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Guardando...' : 'Programar Alerta'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Vista 360° Detalle de Notificación / Alerta */}
      {showDetailModal && selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#323859]/60 shrink-0 bg-gradient-to-r from-[#201c44] to-[#191731]">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#0c0d22] border border-[#323859] flex items-center justify-center shrink-0 shadow-inner">
                  {getTypeIcon(selectedNotif.type, selectedNotif.title)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-white truncate">
                      Vista 360° de la Alerta
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#9ea7cb] border border-white/10">
                      ID #{selectedNotif.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ea7cb] truncate">
                    Bandeja Oficial de Comunicaciones y Seguimiento DEMUNA
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto min-h-0 flex-1">
              
              {/* Alerta Title and Badges */}
              <div className="space-y-2 bg-[#0c0d22]/70 border border-[#323859]/70 rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedNotif.status === 'Activa' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>PENDIENTE DE ACCIÓN</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ATENDIDA / LEÍDA</span>
                    </span>
                  )}

                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider ${
                    selectedNotif.priority === 'Alta'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedNotif.priority === 'Informativa'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    Prioridad {selectedNotif.priority || 'Media'}
                  </span>

                  <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white/5 text-[var(--muted)] border border-white/10">
                    {selectedNotif.type || 'General'}
                  </span>

                  {getRelativeBadge(selectedNotif.scheduledDate)}
                </div>

                <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-2">
                  {selectedNotif.title}
                </h2>
              </div>

              {/* Informational Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Diligencia y Fecha */}
                <div className="bg-[#121029] border border-[#323859]/60 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#b79bff]">
                    <Clock className="w-4 h-4 text-[#8b59f6]" />
                    <span>Programación & Fechas</span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {formatDate(selectedNotif.scheduledDate, selectedNotif.scheduledTime)}
                  </div>
                  <p className="text-[11px] text-[#9ea7cb]">
                    Registrado en el sistema: {selectedNotif.createdAt ? new Date(selectedNotif.createdAt).toLocaleString('es-PE') : 'Fecha de alta'}
                  </p>
                  {selectedNotif.workerName && (
                    <div className="pt-1 text-[11px] text-slate-300">
                      Responsable: <strong className="text-white">{selectedNotif.workerName}</strong>
                    </div>
                  )}
                </div>

                {/* Expediente Vinculado */}
                <div className="bg-[#121029] border border-[#323859]/60 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#2faaf7]">
                    <Folder className="w-4 h-4 text-[#2faaf7]" />
                    <span>Expediente Asociado</span>
                  </div>
                  {selectedNotif.expedienteId ? (
                    <div>
                      <div className="text-sm font-black text-[#c5b3ff] flex items-center space-x-1.5">
                        <span>{selectedNotif.expedienteCode || `EXP-${selectedNotif.expedienteId}`}</span>
                      </div>
                      <p className="text-[11px] text-[#9ea7cb] line-clamp-2 mt-0.5">
                        {selectedNotif.expedienteSubject || 'Caso registrado en DEMUNA'}
                      </p>
                      <Link
                        to={`/expedientes/${selectedNotif.expedienteId}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#2faaf7] hover:underline mt-2"
                      >
                        <span>Abrir expediente 360°</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--muted)] pt-1">
                      Aviso institucional de alcance general (sin expediente vinculado).
                    </div>
                  )}
                </div>

              </div>

              {/* Persona Involucrada / Ciudadano (si existe) */}
              {(selectedNotif.personName || selectedNotif.personDni) && (
                <div className="bg-[#121029] border border-[#323859]/60 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Ciudadano / Parte Involucrada</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-[var(--muted)] block">Nombre completo</span>
                      <strong className="text-white font-bold">{selectedNotif.personName || 'No registrado'}</strong>
                    </div>
                    {selectedNotif.personDni && (
                      <div>
                        <span className="text-[11px] text-[var(--muted)] block">DNI / Documento</span>
                        <strong className="text-white font-bold">{selectedNotif.personDni}</strong>
                      </div>
                    )}
                    {selectedNotif.personPhone && (
                      <div className="flex items-center space-x-1.5 pt-1">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <a href={`tel:${selectedNotif.personPhone}`} className="text-cyan-300 font-bold hover:underline">
                          {selectedNotif.personPhone}
                        </a>
                      </div>
                    )}
                    {selectedNotif.personAddress && (
                      <div className="flex items-center space-x-1.5 pt-1 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-300 text-[11px] truncate">{selectedNotif.personAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mensaje e Instrucciones */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#b0b0d4]">
                    Contenido del Mensaje & Instrucciones
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-[#c5b3ff] transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado al portapapeles</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar texto</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#0c0d22] border border-[#323859] rounded-2xl p-4 text-xs sm:text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap font-sans selection:bg-[#6c3aed]">
                  {selectedNotif.message || 'Sin observaciones adicionales registradas.'}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-[#323859]/60 shrink-0 bg-[#121029]">
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    handleDelete(selectedNotif.id, e);
                    setShowDetailModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>

                {selectedNotif.expedienteId && (
                  <Link
                    to={`/expedientes/${selectedNotif.expedienteId}`}
                    onClick={() => setShowDetailModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-[#6c3aed]/20 hover:bg-[#6c3aed]/30 border border-[#8b59f6]/40 text-[#c5b3ff] hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Ver Expediente</span>
                  </Link>
                )}

                {selectedNotif.eventId && (
                  <Link
                    to="/agenda"
                    onClick={() => setShowDetailModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ver en Agenda</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {selectedNotif.status === 'Activa' ? (
                  <button
                    type="button"
                    onClick={async (e) => {
                      await handleMarkAsRead(selectedNotif.id, e);
                      setSelectedNotif(prev => prev ? { ...prev, status: 'Leida' } : null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#6c3aed] hover:bg-[#5b2cdb] text-white text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md shadow-[#6c3aed]/30 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-[#2faaf7]" />
                    <span>Marcar como Leída</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async (e) => {
                      await handleMarkAsUnread(selectedNotif.id, e);
                      setSelectedNotif(prev => prev ? { ...prev, status: 'Activa' } : null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Marcar como Pendiente</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

