import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../../api/endpoints';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Calendar,
  ClipboardList,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCheck,
  PanelLeftClose,
  PanelLeft,
  Settings
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [resList, resStats] = await Promise.all([
        axios.get(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES}?limit=6`, { headers }),
        axios.get(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES_STATS}`, { headers }).catch(() => ({ data: { data: null } }))
      ]);

      if (resList.data?.data) {
        setNotifications(resList.data.data);
      }
      if (resStats.data?.data) {
        setUnreadCount(resStats.data.data.unread ?? 0);
      } else if (resList.data?.data) {
        setUnreadCount(resList.data.data.filter(n => n.status === 'Activa').length);
      }
    } catch {
      // Ignorar de forma resiliente
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('demuna-notifications-updated', handleUpdate);
    return () => window.removeEventListener('demuna-notifications-updated', handleUpdate);
  }, []);

  const pageTitles = {
    '/dashboard': 'Resumen general',
    '/expedientes': 'Casos y expedientes',
    '/expedientes/nuevo': 'Nuevo expediente',
    '/orientaciones': 'Fichas de atención',
    '/pensiones': 'Actas y conciliación',
    '/reportes/mimp': 'Documentos PDF e Informe MIMP',
    '/agenda': 'Agenda y actividades',
    '/notificaciones': 'Notificaciones institucionales',
    '/personal': 'Usuarios y personal',
    '/configuracion': 'Configuración'
  };

  const currentTitle = pageTitles[location.pathname] || 'Panel de control';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPopover(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'DM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-[78px] min-h-[78px] bg-[var(--surface)] border-b border-[var(--line)] shrink-0 z-30 px-6 lg:px-9 flex items-center justify-between transition-colors duration-200">
      
      {/* Lado Izquierdo: Botón Plegar + Miga de Pan */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Botón Plegar / Desplegar en Desktop */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isSidebarCollapsed ? 'Desplegar barra lateral' : 'Plegar barra lateral'}
          className="hidden lg:flex w-9 h-9 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[#6c3aed] hover:border-[#c9bef8] items-center justify-center transition-all cursor-pointer"
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-[#8b59f6]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Botón menú en móvil */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--purple)] hover:border-[#c9bef8] transition-colors focus:outline-none"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs text-[var(--muted)]">
          <span className="font-semibold tracking-wide hidden sm:inline">DEMUNA ZAPILLICA</span>
          <span className="text-[var(--muted)] hidden sm:inline">›</span>
          <strong className="text-[var(--text)] font-extrabold text-xs sm:text-sm">
            {currentTitle}
          </strong>
        </div>
      </div>

      {/* Lado Derecho: Tema, Notificaciones y Perfil */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Toggle Dark / Light Theme */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
          aria-label="Cambiar tema"
          className="w-[38px] h-[38px] rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[#6c3aed] hover:border-[#c9bef8] flex items-center justify-center transition-all duration-150 cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#ffc36c]" />
          ) : (
            <Moon className="w-4 h-4 text-[#6c3aed]" />
          )}
        </button>

        {/* Botón de Notificaciones con Dot Dorado */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            title="Notificaciones institucionales"
            aria-label="Notificaciones"
            className="relative w-[38px] h-[38px] rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[#6c3aed] hover:border-[#c9bef8] flex items-center justify-center transition-all duration-150 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[#f3ae56] text-[#0a0e20] text-[9.5px] font-black rounded-full flex items-center justify-center ring-2 ring-[var(--surface)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popover de Notificaciones */}
          {showNotifPopover && (
            <div className="absolute right-0 mt-3 w-80 sm:w-88 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-2">
                <h3 className="text-xs font-bold text-[var(--text)]">Notificaciones y Alertas</h3>
                <span className="text-[10px] font-semibold text-[#8b59f6] bg-[#8b59f6]/10 px-2 py-0.5 rounded-full">
                  {unreadCount} pendientes
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] text-center py-4">No hay notificaciones recientes</p>
                ) : (
                  notifications.map((n) => {
                    const isUnread = n.status === 'Activa';
                    const iconColor = (n.type || '').includes('Audiencia') ? 'text-[#8b59f6] bg-[#6c3aed]/15' :
                                      (n.type || '').includes('Pensi') ? 'text-amber-400 bg-amber-500/15' :
                                      (n.type || '').includes('Seguimiento') ? 'text-emerald-400 bg-emerald-500/15' :
                                      'text-blue-400 bg-blue-500/15';

                    return (
                      <Link
                        key={n.id}
                        to="/notificaciones"
                        onClick={() => setShowNotifPopover(false)}
                        className={`
                          flex items-start space-x-3 p-2.5 rounded-xl transition-colors border-b border-[var(--line)]/50 last:border-0 block text-left
                          ${isUnread ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'hover:bg-[var(--surface-2)] opacity-80'}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
                          {(n.type || '').includes('Audiencia') ? <Calendar className="w-4 h-4" /> :
                           (n.type || '').includes('Pensi') ? <DollarSign className="w-4 h-4" /> :
                           (n.type || '').includes('Seguimiento') ? <ClipboardList className="w-4 h-4" /> :
                           <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[var(--text)] truncate">{n.title}</p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1.5" />
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--muted)] line-clamp-1 mt-0.5">{n.message}</p>
                          <span className="text-[9.5px] text-[#8b59f6] block mt-1">
                            {n.scheduledDate || 'Aviso del sistema'} {n.scheduledTime ? `· ${n.scheduledTime.substring(0,5)}` : ''}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              <Link
                to="/notificaciones"
                onClick={() => setShowNotifPopover(false)}
                className="block text-center text-xs font-bold text-[#8b59f6] hover:underline pt-3 border-t border-[var(--line)] mt-2"
              >
                Ver centro de notificaciones completo &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Perfil del Usuario */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 pl-3 border-l border-[var(--line)] ml-1 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-tr from-[#9c6bff]/20 to-[#6030e6]/20 border border-[#8b59f6]/30 text-[#8b59f6] flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 shadow-sm">
              {getInitials(user?.fullName)}
            </div>

            <div className="hidden sm:block">
              <b className="block text-xs font-bold text-[var(--text)] leading-tight group-hover:text-[#6c3aed] transition-colors">
                {user?.fullName || 'Personal DEMUNA Zapillica'}
              </b>
              <small className="block text-[10px] text-[var(--muted)] leading-none mt-0.5">
                {user?.roleName || 'Cuenta demostrativa'}
              </small>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--text)] transition-transform duration-150" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                <p className="text-xs font-bold text-[var(--text)] truncate">{user?.fullName || 'Usuario DEMUNA Zapillica'}</p>
                <p className="text-[10px] text-[var(--muted)]">{user?.dni ? `DNI: ${user.dni}` : 'Sesión activa'}</p>
              </div>

              {(user?.roleId === 1 || user?.roleId === 2) && (
                <Link
                  to="/configuracion"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text)] hover:bg-[var(--line)]/50 transition-colors mb-1"
                >
                  <Settings className="w-4 h-4 text-[#8b59f6]" />
                  <span>Configuración del sistema</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
