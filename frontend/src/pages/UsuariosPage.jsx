import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../api/endpoints';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  FileText,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  Folder,
  Briefcase,
  Sparkles,
  X,
  Check,
  LayoutGrid,
  List,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const UsuariosPage = () => {
  // State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    jobTitle: 'Especialista DEMUNA',
    roleId: 3,
    status: 'Activo',
    password: '',
    confirmPassword: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Fetch all users and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [resUsers, resStats, resRoles] = await Promise.all([
        axios.get(`${API_BASE_URL}${ENDPOINTS.USUARIOS}`, { headers }),
        axios.get(`${API_BASE_URL}${ENDPOINTS.USUARIOS_STATS}`, { headers }).catch(() => ({ data: { data: null } })),
        axios.get(`${API_BASE_URL}${ENDPOINTS.USUARIOS_ROLES}`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      if (resUsers.data?.data) {
        setUsers(resUsers.data.data);
      }
      if (resStats.data?.data) {
        setStats(resStats.data.data);
      }
      if (resRoles.data?.data) {
        setRoles(resRoles.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && String(u.roleId) !== String(roleFilter)) return false;

      // Status filter
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = (u.fullName || '').toLowerCase().includes(q);
        const inDni = (u.dni || '').toLowerCase().includes(q);
        const inEmail = (u.email || '').toLowerCase().includes(q);
        const inCargo = (u.jobTitle || '').toLowerCase().includes(q);
        const inRole = (u.roleName || '').toLowerCase().includes(q);
        if (!inName && !inDni && !inEmail && !inCargo && !inRole) return false;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: '',
      jobTitle: 'Especialista DEMUNA',
      roleId: 3,
      status: 'Activo',
      password: '',
      confirmPassword: ''
    });
    setShowPass(false);
    setShowCreateModal(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.dni.length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }
    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${API_BASE_URL}${ENDPOINTS.USUARIOS}`, formData, { headers });
      showToast(res.data?.message || 'Usuario institucional registrado');
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al registrar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user, e) => {
    e?.stopPropagation();
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      dni: user.dni || '',
      email: user.email || '',
      phone: user.phone || '',
      jobTitle: user.jobTitle || 'Especialista DEMUNA',
      roleId: user.roleId || 3,
      status: user.status || 'Activo',
      password: '',
      confirmPassword: ''
    });
    setShowPass(false);
    setShowEditModal(true);
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (formData.dni.length !== 8) {
      alert('El DNI debe tener 8 dígitos.');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.put(`${API_BASE_URL}${ENDPOINTS.USUARIO_UPDATE(selectedUser.id)}`, formData, { headers });
      showToast(res.data?.message || 'Usuario actualizado');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Password Modal
  const handleOpenPasswordModal = (user, e) => {
    e?.stopPropagation();
    setSelectedUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPass(false);
    setShowPasswordModal(true);
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${API_BASE_URL}${ENDPOINTS.USUARIO_PASSWORD(selectedUser.id)}`,
        { password: passwordForm.newPassword },
        { headers }
      );
      showToast(`Contraseña actualizada para ${selectedUser.firstName}`);
      setShowPasswordModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (user, e) => {
    e?.stopPropagation();
    const actionText = user.status === 'Activo' ? 'suspender / desactivar' : 'reactivar';
    if (!window.confirm(`¿Está seguro de ${actionText} la cuenta de ${user.fullName}?`)) return;

    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.put(`${API_BASE_URL}${ENDPOINTS.USUARIO_STATUS(user.id)}`, {}, { headers });
      showToast(res.data?.message || 'Estado actualizado');
      
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: res.data?.data?.status || (u.status === 'Activo' ? 'Inactivo' : 'Activo') } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: res.data?.data?.status } : null);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'No se pudo cambiar el estado del usuario');
    }
  };

  // Delete User
  const handleDeleteUser = async (user, e) => {
    e?.stopPropagation();
    if (!window.confirm(`¿Está seguro de eliminar definitivamente a ${user.fullName}? Esta acción no se puede deshacer.`)) return;

    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_BASE_URL}${ENDPOINTS.USUARIO_DELETE(user.id)}`, { headers });
      showToast('Trabajador y cuenta eliminados');
      setShowDetailModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'No se pudo eliminar el usuario');
    }
  };

  // Open Detail 360 Modal
  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredUsers.length) {
      alert('No hay usuarios para exportar con los filtros seleccionados.');
      return;
    }

    const headers = ['ID', 'Nombres', 'Apellidos', 'DNI', 'Correo', 'Teléfono', 'Cargo', 'Rol', 'Estado', 'Expedientes Asignados', 'Actas Suscritas', 'Último Acceso'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${(u.firstName || '').replace(/"/g, '""')}"`,
      `"${(u.lastName || '').replace(/"/g, '""')}"`,
      u.dni,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.phone || '',
      `"${(u.jobTitle || '').replace(/"/g, '""')}"`,
      u.roleName,
      u.status,
      u.caseCount || 0,
      u.actaCount || 0,
      u.lastLogin || 'Nunca'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEMUNA_Personal_Usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    showToast('Archivo CSV generado y descargado con éxito.');
  };

  // Helper Initials
  const getInitials = (name) => {
    if (!name) return 'DM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Helper Role Badge Color
  const getRoleBadge = (roleId) => {
    switch (Number(roleId)) {
      case 1:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase tracking-wider bg-purple-500/20 text-[#c5b3ff] border border-purple-500/40">
            Desarrollador
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase tracking-wider bg-[#2faaf7]/20 text-[#84d0ff] border border-[#2faaf7]/40">
            Administrador
          </span>
        );
      case 3:
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase tracking-wider bg-[#10b981]/20 text-[#6ee7b7] border border-[#10b981]/40">
            Defensor / Personal
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f1b3e] border border-[#6c3aed] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-[#ffc36c] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#191731] via-[#211d47] to-[#121029] border border-[#323859]/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c3aed]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#6c3aed]/20 border border-[#8b59f6]/30 text-[#b79bff] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administración & Personal DEMUNA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestión de Personal y Cuentas de Acceso
            </h1>
            <p className="text-sm text-[#9ea7cb] leading-relaxed">
              Supervisión de trabajadores, asignación de roles institucionales (Administrador, Defensor/Especialista, Desarrollador), control de credenciales y auditoría de accesos.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#323859] text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:border-[#2faaf7]"
              title="Exportar personal filtrado en CSV"
            >
              <Download className="w-4 h-4 text-[#2faaf7]" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#323859] text-white transition-all cursor-pointer hover:border-[#6c3aed]"
              title="Recargar listado"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b59f6]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] hover:from-[#5b2cdb] hover:to-[#7a49e6] text-white text-xs font-extrabold transition-all flex items-center space-x-2 shadow-lg shadow-[#6c3aed]/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario / Trabajador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini-KPIs Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Personal */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Total Personal</span>
            <h3 className="text-2xl font-black text-[var(--text)] mt-1">
              {stats?.total ?? users.length}
            </h3>
            <span className="text-[10px] text-[#9ea7cb]">Trabajadores registrados</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#6c3aed]/15 border border-[#8b59f6]/30 text-[#8b59f6] flex items-center justify-center shrink-0 ml-3">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Activos con Acceso */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Cuentas Activas</span>
            <h3 className="text-2xl font-black text-emerald-300 mt-1 flex items-center space-x-2">
              <span>{stats?.active ?? users.filter(u => u.status === 'Activo').length}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Habilitados para ingresar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 ml-3">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Especialistas & Defensores */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Especialistas / Defensores</span>
            <h3 className="text-2xl font-black text-amber-300 mt-1">
              {stats?.workers ?? users.filter(u => u.roleId === 3).length}
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Atención directa y expedientes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 ml-3">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Administración & TI</span>
            <h3 className="text-2xl font-black text-blue-300 mt-1">
              {(stats?.admins || 0) + (stats?.developers || 0)}
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Control de gestión y sistemas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 ml-3">
            <Shield className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg)] p-3 rounded-2xl border border-[var(--line)]">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombres, DNI, correo electrónico, cargo o rol..."
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

          {/* Role Filter */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer"
            >
              <option value="all">Todos los roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="Activo">Solo Activos</option>
              <option value="Inactivo">Inactivos / Suspendidos</option>
            </select>

            {/* Switch Grid / Table */}
            <div className="flex items-center rounded-xl bg-[var(--surface)] border border-[var(--line)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#6c3aed] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'}`}
                title="Vista en cuadrícula de tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#6c3aed] text-white shadow-sm' : 'text-[var(--muted)] hover:text-white'}`}
                title="Vista en tabla detallada"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#8b59f6] animate-spin mx-auto" />
            <p className="text-xs text-[var(--muted)] font-medium">Cargando directorio de trabajadores...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[var(--bg)]/50 rounded-2xl border border-[var(--line)]/50 p-8">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[var(--muted)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-[#2faaf7]" />
            </div>
            <h4 className="text-base font-bold text-[var(--text)]">No se encontraron trabajadores</h4>
            <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
              No hay coincidencias con los términos de búsqueda o filtros seleccionados.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isActive = user.status === 'Activo';

              return (
                <div
                  key={user.id}
                  onClick={() => handleOpenDetail(user)}
                  className={`
                    cursor-pointer relative rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between group overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-br from-[#1d193d]/90 via-[#171433] to-[#121029] border-[#323859]/70 hover:border-[#6c3aed] shadow-lg hover:shadow-xl hover:shadow-[#6c3aed]/10'
                      : 'bg-[#151426]/60 border-red-500/20 opacity-75 hover:opacity-100 hover:border-red-500/40'
                    }
                  `}
                >
                  {/* Top user profile row */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c3aed] to-[#2faaf7] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md shrink-0">
                          {getInitials(user.fullName)}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white truncate group-hover:text-[#b79bff] transition-colors">
                            {user.fullName}
                          </h4>
                          <span className="text-xs text-[#aeb4d4] font-medium block truncate mt-0.5">
                            {user.jobTitle || 'Especialista DEMUNA'}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span>{user.status}</span>
                      </span>
                    </div>

                    {/* Role & DNI row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getRoleBadge(user.roleId)}
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-white/5 text-[var(--muted)] border border-white/10">
                        DNI {user.dni}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-1.5 text-xs text-[var(--muted)] py-2 border-t border-white/5">
                      <div className="flex items-center space-x-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#2faaf7] shrink-0" />
                        <span className="text-slate-300 truncate">{user.email || 'Sin correo registrado'}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Caseload stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/5 text-center">
                      <div className="bg-[#0c0d22] rounded-xl p-2 border border-[#323859]/50">
                        <span className="text-[10px] text-[var(--muted)] block font-semibold uppercase">Expedientes</span>
                        <strong className="text-sm font-black text-white">{user.caseCount || 0}</strong>
                      </div>
                      <div className="bg-[#0c0d22] rounded-xl p-2 border border-[#323859]/50">
                        <span className="text-[10px] text-[var(--muted)] block font-semibold uppercase">Actas</span>
                        <strong className="text-sm font-black text-white">{user.actaCount || 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5">
                    <span className="text-[10px] text-[#8e98be]">
                      {user.lastLogin ? `Acceso: ${new Date(user.lastLogin).toLocaleDateString('es-PE')}` : 'Sin inicios aún'}
                    </span>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      {/* Password reset button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenPasswordModal(user, e)}
                        title="Cambiar contraseña"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(user, e)}
                        title="Editar datos"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(user, e)}
                        title={isActive ? 'Desactivar / Suspender cuenta' : 'Reactivar cuenta'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteUser(user, e)}
                        title="Eliminar usuario"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--surface-2)] text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-3 px-4 font-bold">Colaborador / Puesto</th>
                  <th className="py-3 px-4 font-bold">DNI</th>
                  <th className="py-3 px-4 font-bold">Correo / Contacto</th>
                  <th className="py-3 px-4 font-bold">Rol</th>
                  <th className="py-3 px-4 font-bold text-center">Estado</th>
                  <th className="py-3 px-4 font-bold text-center">Casos</th>
                  <th className="py-3 px-4 font-bold">Último Acceso</th>
                  <th className="py-3 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredUsers.map((user) => {
                  const isActive = user.status === 'Activo';

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenDetail(user)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-[#6c3aed]/20 text-[#c5b3ff] flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <span className="font-extrabold text-white block">{user.fullName}</span>
                            <span className="text-[11px] text-[var(--muted)]">{user.jobTitle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        {user.dni}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--muted)]">
                        <div>{user.email || '—'}</div>
                        {user.phone && <div className="text-[10px] text-slate-400">{user.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(user.roleId)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{user.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-white">
                        {user.caseCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[var(--muted)]">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenPasswordModal(user, e)}
                            title="Cambiar contraseña"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(user, e)}
                            title="Editar datos"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-300"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(user, e)}
                            title={isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
                            className={`p-1.5 rounded-lg ${isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          >
                            {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteUser(user, e)}
                            title="Eliminar usuario"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL 1: NUEVO USUARIO / TRABAJADOR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#323859]/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6c3aed]/20 border border-[#8b59f6]/40 text-[#c5b3ff] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Nuevo Trabajador & Cuenta</h3>
                  <p className="text-[11px] text-[#9ea7cb]">Registrar credenciales y perfil institucional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Sección A: Datos Personales */}
              <div className="bg-[#0c0d22]/50 border border-[#323859]/60 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#b79bff] block">
                  1. Datos del Colaborador
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ej. Juan Carlos"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Ej. Perez Prado"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">DNI (8 dígitos) *</label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      pattern="[0-9]{8}"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                      placeholder="88776655"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Teléfono / Celular</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="999888777"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Correo Institucional</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@demuna.gob.pe"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Cargo / Puesto</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="Ej. Abogado Conciliador"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                    />
                  </div>
                </div>
              </div>

              {/* Sección B: Credenciales y Seguridad */}
              <div className="bg-[#0c0d22]/50 border border-[#323859]/60 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2faaf7] block">
                  2. Credenciales de Acceso & Permisos
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Rol Institucional *</label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Estado de la Cuenta</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                    >
                      <option value="Activo">Activo (Acceso Habilitado)</option>
                      <option value="Inactivo">Inactivo (Suspendido)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Contraseña Inicial *</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-white"
                    >
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Confirmar Contraseña *</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repita la contraseña"
                      className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6c3aed]"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#323859]/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white text-xs font-extrabold hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Registrando...' : 'Crear Usuario'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR USUARIO */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#323859]/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2faaf7]/20 border border-[#2faaf7]/40 text-[#2faaf7] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Editar Trabajador & Perfil</h3>
                  <p className="text-[11px] text-[#9ea7cb]">Modificar información de {selectedUser.fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">DNI (8 dígitos) *</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Correo Institucional</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Cargo / Especialidad</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Rol Institucional</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Estado de Acceso</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] cursor-pointer"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Inactivo">Inactivo (Suspendido)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Nueva Contraseña (Opcional - solo si desea cambiarla)
                </label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para conservar la actual"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#323859]/60">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2faaf7] to-[#1083cc] text-white text-xs font-extrabold hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: CAMBIAR / RESETEAR CONTRASEÑA */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#323859]/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Resetear Contraseña</h3>
                  <p className="text-[11px] text-[#9ea7cb]">Para {selectedUser.fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              <div className="relative">
                <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Nueva Contraseña *</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b0b0d4] mb-1">Confirmar Contraseña *</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repita la nueva contraseña"
                  className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#323859]/60">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Actualizando...' : 'Cambiar Clave'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 4: FICHA TÉCNICA 360° DEL USUARIO */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#323859]/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#6c3aed]/20 border border-[#8b59f6]/40 text-[#c5b3ff] flex items-center justify-center font-bold">
                  {getInitials(selectedUser.fullName)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Ficha 360° del Trabajador</h3>
                  <p className="text-[11px] text-[#9ea7cb]">Expediente de Personal y Acceso Institucional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">{selectedUser.fullName}</h2>
                  <span className="text-xs text-[#b79bff] font-bold block mt-0.5">{selectedUser.jobTitle}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getRoleBadge(selectedUser.roleId)}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedUser.status === 'Activo'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs text-slate-300">
                <div>
                  <span className="text-[10.5px] text-[var(--muted)] block">Documento DNI</span>
                  <strong className="text-white font-mono">{selectedUser.dni}</strong>
                </div>
                <div>
                  <span className="text-[10.5px] text-[var(--muted)] block">Teléfono de Contacto</span>
                  <strong>{selectedUser.phone || 'No registrado'}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10.5px] text-[var(--muted)] block">Correo Electrónico</span>
                  <strong className="text-[#2faaf7]">{selectedUser.email || 'No registrado'}</strong>
                </div>
              </div>
            </div>

            {/* Caseload & Activities */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#121029] border border-[#323859]/60 rounded-2xl p-3">
                <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Expedientes</span>
                <span className="text-xl font-black text-[#c5b3ff] mt-0.5 block">{selectedUser.caseCount || 0}</span>
              </div>
              <div className="bg-[#121029] border border-[#323859]/60 rounded-2xl p-3">
                <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Actas</span>
                <span className="text-xl font-black text-emerald-300 mt-0.5 block">{selectedUser.actaCount || 0}</span>
              </div>
              <div className="bg-[#121029] border border-[#323859]/60 rounded-2xl p-3">
                <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Diligencias</span>
                <span className="text-xl font-black text-blue-300 mt-0.5 block">{selectedUser.eventCount || 0}</span>
              </div>
            </div>

            {/* Audit Dates */}
            <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-4 text-xs text-[var(--muted)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Fecha de Alta en el Sistema:</span>
                <strong className="text-white">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('es-PE') : 'Inicial'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Último Inicio de Sesión Registrado:</span>
                <strong className="text-[#ffc36c]">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('es-PE') : 'Sin actividad aún'}
                </strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#323859]/60">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenEdit(selectedUser);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenPasswordModal(selectedUser);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Contraseña</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedUser)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedUser.status === 'Activo'
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedUser.status === 'Activo' ? 'Suspender Acceso' : 'Habilitar Acceso'}
                </button>

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

