import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid,
  Folder,
  ClipboardList,
  Scale,
  FileText,
  Calendar,
  Bell,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onOpenPrivacyModal
}) => {
  const { user } = useAuth();
  const roleId = user?.roleId || 3;
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificationStats = async () => {
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.NOTIFICACIONES_STATS}`, { headers });
      if (res.data?.data) {
        setUnreadCount(res.data.data.unread ?? 0);
      }
    } catch {
      // Ignorar error silenciosamente en sidebar
    }
  };

  useEffect(() => {
    fetchNotificationStats();
    const handleUpdate = () => fetchNotificationStats();
    window.addEventListener('demuna-notifications-updated', handleUpdate);
    return () => window.removeEventListener('demuna-notifications-updated', handleUpdate);
  }, []);

  const navSections = [
    {
      label: 'PANEL PRINCIPAL',
      items: [
        { to: '/dashboard', label: 'Resumen general', icon: LayoutGrid, roles: [1, 2, 3] },
        { to: '/expedientes', label: 'Casos y expedientes', icon: Folder, roles: [1, 2, 3] },
        { to: '/fichas', label: 'Fichas de atención', icon: ClipboardList, roles: [1, 2, 3] },
        { to: '/conciliacion', label: 'Actas y conciliación', icon: Scale, roles: [1, 2, 3] },
        { to: '/reportes/mimp', label: 'Documentos PDF', icon: FileText, roles: [1, 2] },
      ]
    },
    {
      label: 'ORGANIZACIÓN',
      items: [
        { to: '/agenda', label: 'Agenda y actividades', icon: Calendar, roles: [1, 2, 3] },
        { to: '/notificaciones', label: 'Notificaciones', icon: Bell, roles: [1, 2, 3], badge: unreadCount > 0 ? unreadCount : null },
      ]
    },
    {
      label: 'ADMINISTRACIÓN',
      items: [
        { to: '/personal', label: 'Usuarios y personal', icon: Users, roles: [1, 2] },
        { to: '/configuracion', label: 'Configuración', icon: Settings, roles: [1, 2] },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0a0e20]/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 h-screen max-h-screen text-white flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0
          bg-gradient-to-b from-[#0a0e20] via-[#11152e] to-[#18143d] border-r border-[#323859]/50 shadow-2xl select-none
          lg:static lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[74px] min-w-[74px]' : 'w-64 min-w-[256px]'}
        `}
      >
        {/* Cabecera y Navegación sin scrollbar visible en la barra lateral */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Brand Header */}
          <div className={`flex items-center justify-between p-4 ${isCollapsed ? 'px-3 py-5 justify-center' : 'p-6 pb-5'}`}>
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9c6bff] to-[#6030e6] p-0.5 border border-[#a68aff] shadow-[0_8px_20px_rgba(107,57,227,0.35)] flex items-center justify-center shrink-0 cursor-pointer"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expandir barra lateral' : 'SISTDEMUNA'}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              
              {!isCollapsed && (
                <div className="overflow-hidden transition-opacity duration-200">
                  <h2 className="font-extrabold text-base tracking-wide text-white leading-tight font-sans truncate">
                    SISTDEMUNA
                  </h2>
                  <span className="text-[10px] text-[#aeb4d4] font-medium block mt-0.5 truncate">
                    Gestión de casos y documentos
                  </span>
                </div>
              )}
            </div>

            {/* Botón cerrar en móvil */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 px-2.5 space-y-4 py-2">
            {navSections.map((sec, sIdx) => {
              const visibleItems = sec.items.filter(item => item.roles.includes(roleId));
              if (!visibleItems.length) return null;

              return (
                <div key={sIdx} className="space-y-1">
                  {/* Etiqueta de Grupo (o línea divisoria si está colapsado) */}
                  {!isCollapsed ? (
                    <div className="px-3.5 text-[9.5px] font-extrabold uppercase tracking-[1.6px] text-[#727caa] truncate">
                      {sec.label}
                    </div>
                  ) : (
                    <div className="my-2 border-t border-[#323859]/50 mx-2" />
                  )}

                  <div className="space-y-1 mt-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={onClose}
                          title={isCollapsed ? item.label : undefined}
                          className={({ isActive }) => `
                            relative flex items-center rounded-xl text-[12.5px] font-semibold transition-all duration-150 group
                            ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'}
                            ${isActive
                              ? 'bg-gradient-to-r from-[#733dec]/40 to-[#7a4deb]/15 text-white border border-[#b695ff]/20 shadow-sm'
                              : 'text-[#9ea7cb] hover:text-white hover:bg-white/[0.07]'
                            }
                          `}
                        >
                          {({ isActive }) => (
                            <>
                              {/* Barra activa en el borde izquierdo */}
                              {isActive && (
                                <span className={`absolute left-0 top-2 bottom-2 w-[3px] bg-[#b79bff] rounded-r ${isCollapsed ? 'left-1' : ''}`} />
                              )}

                              <div className={`flex items-center space-x-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#b79bff]' : 'text-[#9ea7cb] group-hover:text-white'}`} />
                                {!isCollapsed && (
                                  <span className="truncate">{item.label}</span>
                                )}
                              </div>

                              {!isCollapsed && item.badge && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#f3ae56] text-[#0a0e20] rounded-full">
                                  {item.badge}
                                </span>
                              )}

                              {isCollapsed && item.badge && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f3ae56]" />
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar: Protección de la información + Botón Plegar/Desplegar */}
        <div className="p-3 border-t border-[#323859]/40 bg-[#0a0e20]/40">
          
          {/* Tarjeta de Seguridad (Expandida o Colapsada) */}
          {!isCollapsed ? (
            <div className="bg-gradient-to-br from-[#252052] to-[#292560] border border-[#413874] rounded-2xl p-3.5 shadow-lg text-left mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#6c3aed]/20 text-[#c5b3ff] flex items-center justify-center mb-2 border border-[#6c3aed]/30">
                <Shield className="w-4 h-4 text-[#c5b3ff]" />
              </div>
              <h4 className="text-xs font-bold text-white tracking-tight">
                Protección de la información
              </h4>
              <p className="text-[10.5px] text-[#b0b0d4] mt-1 mb-2.5 leading-relaxed">
                El acceso a expedientes debe respetar los permisos y la confidencialidad.
              </p>
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/15 border border-[#6d62b8] text-white text-[10.5px] font-bold rounded-lg transition-all"
              >
                Ver recomendaciones
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-2.5">
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                title="Protección de la información y recomendaciones"
                className="w-10 h-10 rounded-xl bg-[#252052] hover:bg-[#292560] border border-[#413874] text-[#c5b3ff] flex items-center justify-center transition-all shadow-md"
              >
                <Shield className="w-4 h-4 text-[#c5b3ff]" />
              </button>
            </div>
          )}

          {/* Botón Plegar / Desplegar en la base de la barra */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Desplegar barra lateral' : 'Plegar barra lateral a iconos'}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#323859]/60 text-[#aeb4d4] hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#b79bff]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#b79bff]" />
                <span className="text-[11px]">Plegar menú</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
