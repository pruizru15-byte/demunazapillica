import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';

import { LoginPage } from '../pages/LoginPage';
import { ExpedientesPage } from '../pages/ExpedientesPage';
import { NuevoExpedientePage } from '../pages/NuevoExpedientePage';
import { ExpedienteDetallePage } from '../pages/ExpedienteDetallePage';
import { PensionesPage } from '../pages/PensionesPage';
import { ConciliacionPage } from '../pages/ConciliacionPage';
import { AgendaPage } from '../pages/AgendaPage';
import { OrientacionesPage } from '../pages/OrientacionesPage';
import { FichasPage } from '../pages/FichasPage';
import { ReportesPage } from '../pages/ReportesPage';
import { DashboardPage } from '../pages/DashboardPage';
import { RecuperarPasswordPage } from '../pages/RecuperarPasswordPage';
import { NotificacionesPage } from '../pages/NotificacionesPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { ConfiguracionPage } from '../pages/ConfiguracionPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />

      {/* Rutas Protegidas dentro de MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/expedientes" element={<ExpedientesPage />} />
        <Route path="/expedientes/nuevo" element={<NuevoExpedientePage />} />
        <Route path="/expedientes/:id" element={<ExpedienteDetallePage />} />
        <Route path="/conciliacion" element={<ConciliacionPage />} />
        <Route path="/actas" element={<Navigate to="/conciliacion" replace />} />
        <Route path="/pensiones" element={<Navigate to="/conciliacion" replace />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/notificaciones" element={<NotificacionesPage />} />
        <Route path="/fichas" element={<FichasPage />} />
        <Route path="/orientaciones" element={<Navigate to="/fichas" replace />} />

        {/* Rutas exclusivas de Admin o Dev */}
        <Route
          path="/personal"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route path="/usuarios" element={<Navigate to="/personal" replace />} />
        <Route
          path="/reportes/mimp"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <ReportesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <ConfiguracionPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

