import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ShieldCheck, X } from 'lucide-react';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('demuna_sidebar_collapsed') === 'true';
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('demuna_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="h-screen max-h-screen w-full overflow-hidden flex bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 selection:bg-[#6c3aed] selection:text-white">
      {/* Barra Lateral Plegable / Desplegable (Altura exacta de la pantalla, fija) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenPrivacyModal={() => setShowPrivacyModal(true)}
      />

      {/* Espacio de Trabajo Principal (Fijo a pantalla completa con scroll solo en el contenido) */}
      <div className="flex-1 h-screen max-h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Cabecera Superior (Fija, sin scroll) */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Zona del Dashboard / Gráficos (ÚNICO contenedor con scroll vertical independiente) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Modal de Recomendaciones de Seguridad y Privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[var(--text)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text)]">Protección y Confidencialidad</h3>
                  <p className="text-xs text-[var(--muted)]">Lineamientos Institucionales DEMUNA ZAPILLICA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--muted)] leading-relaxed">
              <p>
                De acuerdo con la normativa vigente del <strong>Ministerio de la Mujer y Poblaciones Vulnerables (MIMP)</strong> y la Ley de Protección de Datos Personales (Ley N° 29733):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[var(--text)] font-medium">
                <li>La información de niñas, niños y adolescentes goza de reserva absoluta y protección tutelar.</li>
                <li>Los expedientes y actas solo deben ser consultados por personal formalmente acreditado.</li>
                <li>Queda terminantemente prohibida la descarga o difusión de fichas a medios no autorizados.</li>
                <li>Toda consulta y modificación queda registrada en el registro de auditoría del sistema.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-[#8751f9] to-[#6330df] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#6c3aed]/20 hover:opacity-95 transition-opacity"
            >
              Comprendido y Aceptado
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
