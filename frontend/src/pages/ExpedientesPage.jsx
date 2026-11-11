import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  Folder,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  RefreshCw,
  Download,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

export const ExpedientesPage = () => {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const fetchExpedientes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedStatus) params.status = selectedStatus;

      const res = await apiClient.get(ENDPOINTS.EXPEDIENTES, { params });
      if (res.data?.success) {
        setExpedientes(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar expedientes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedientes();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpedientes();
  };

  // KPIs superiores
  const stats = useMemo(() => {
    const total = expedientes.length;
    const pending = expedientes.filter(e => e.statusId === 1).length;
    const inProgress = expedientes.filter(e => e.statusId === 2).length;
    const completed = expedientes.filter(e => e.statusId === 5 || e.statusId === 6).length;
    return { total, pending, inProgress, completed };
  }, [expedientes]);

  const getStatusBadge = (statusId, statusName) => {
    const id = parseInt(statusId, 10);
    switch (id) {
      case 1: // Pendiente / Recepción
        return {
          bg: 'bg-[#f1eaff] text-[#8054e2] border-[#8054e2]/30',
          dot: 'bg-[#8054e2]',
          label: statusName || 'Pendiente'
        };
      case 2: // En Progreso
        return {
          bg: 'bg-[#edf3ff] text-[#478ce0] border-[#478ce0]/30',
          dot: 'bg-[#478ce0]',
          label: statusName || 'En Progreso'
        };
      case 5: // Resuelto
      case 6: // Concluido
        return {
          bg: 'bg-[#e5f7f0] text-[#289674] border-[#289674]/30',
          dot: 'bg-[#289674]',
          label: statusName || 'Concluido'
        };
      case 4: // Derivado
        return {
          bg: 'bg-[#fff0dd] text-[#c78531] border-[#c78531]/30',
          dot: 'bg-[#c78531]',
          label: statusName || 'Derivado'
        };
      case 3: // Archivado
      default:
        return {
          bg: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]',
          dot: 'bg-[var(--muted)]',
          label: statusName || 'Archivado'
        };
    }
  };

  // Exportar listado a CSV
  const handleExportCsv = () => {
    if (!expedientes.length) return;
    const headers = ['ID', 'Código', 'Materia', 'Institución Solicitante', 'Fecha Apertura', 'Estado', 'Defensor Asignado'];
    const rows = [headers];

    expedientes.forEach(e => {
      rows.push([
        e.id,
        e.code,
        `"${(e.subject || '').replace(/"/g, '""')}"`,
        `"${(e.institution || '').replace(/"/g, '""')}"`,
        e.openDate,
        e.statusName,
        `"${(e.workerName || '').replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = '\ufeff' + rows.map(r => r.join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEMUNA_ZAPILLICA_Expedientes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ================= CABECERA DE LA PÁGINA ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[var(--text)] font-sans">
            Casos y expedientes
          </h1>
          <p className="text-xs sm:text-[12.5px] text-[var(--muted)] mt-1 font-medium">
            Registro general, seguimiento procesal y archivo digital de la DEMUNA
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] hover:border-[#a68dff] hover:-translate-y-0.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[var(--muted)]" />
            <span className="hidden sm:inline">Exportar lista</span>
          </button>

          <Link
            to="/expedientes/nuevo"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8751f9] to-[#6330df] hover:from-[#9562fa] hover:to-[#713eeb] text-white text-xs font-bold shadow-[0_7px_17px_rgba(106,55,224,0.22)] hover:shadow-[0_10px_22px_rgba(106,55,224,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Expediente</span>
          </Link>
        </div>
      </div>

      {/* ================= RESUMEN DE INDICADORES (MINI KPIS) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--muted)]">Total de Casos</span>
            <div className="w-8 h-8 rounded-lg bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] mt-1 font-sans">{stats.total}</p>
          <span className="text-[10px] text-[var(--muted)]">Registrados en la plataforma</span>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--muted)]">En Recepción</span>
            <div className="w-8 h-8 rounded-lg bg-[#f1eaff] dark:bg-[#8054e2]/20 text-[#8054e2] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] mt-1 font-sans">{stats.pending}</p>
          <span className="text-[10px] text-[#8054e2]">Pendientes de trámite</span>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--muted)]">En Seguimiento</span>
            <div className="w-8 h-8 rounded-lg bg-[#edf3ff] dark:bg-[#478ce0]/20 text-[#478ce0] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] mt-1 font-sans">{stats.inProgress}</p>
          <span className="text-[10px] text-[#478ce0]">En evaluación y conciliación</span>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--muted)]">Concluidos</span>
            <div className="w-8 h-8 rounded-lg bg-[#e5f7f0] dark:bg-[#289674]/20 text-[#289674] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] mt-1 font-sans">{stats.completed}</p>
          <span className="text-[10px] text-[#289674]">Resueltos formalmente</span>
        </div>
      </div>

      {/* ================= BARRA DE BÚSQUEDA Y FILTROS ================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Formulario de Búsqueda */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código (ej. EXP-2026), materia, solicitante..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-2)] border border-[var(--line)] focus:border-[#6c3aed] focus:ring-2 focus:ring-[#6c3aed]/20 rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none transition-all"
          />
        </form>

        {/* Filtros por Estado y Selector de Vista */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="relative min-w-[170px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--text)] outline-none focus:border-[#6c3aed] cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="1">1. Pendiente / Recepción</option>
              <option value="2">2. En Progreso</option>
              <option value="5">5. Resuelto</option>
              <option value="4">4. Derivado</option>
              <option value="6">6. Concluido</option>
              <option value="3">3. Archivado</option>
            </select>
          </div>

          {/* Selector Vista Tabla / Grid */}
          <div className="flex items-center p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Vista en tabla"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[var(--surface)] text-[#6c3aed] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista en tarjetas"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--surface)] text-[#6c3aed] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= VISTA DE EXPEDIENTES ================= */}
      {loading ? (
        <div className="text-center py-20 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6c3aed] border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)] font-medium">Cargando expedientes y casos...</p>
        </div>
      ) : expedientes.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-6">
          <div className="w-14 h-14 rounded-2xl bg-[#6c3aed]/10 text-[#8b59f6] flex items-center justify-center mx-auto mb-3">
            <Folder className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[var(--text)]">No se encontraron expedientes</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            No hay casos que coincidan con la búsqueda o filtro seleccionado. Puedes registrar uno nuevo de inmediato.
          </p>
          <Link
            to="/expedientes/nuevo"
            className="inline-flex items-center space-x-2 px-4 py-2 mt-4 rounded-xl bg-[#6c3aed] hover:bg-[#814eff] text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Crear primer expediente</span>
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        
        /* ---------------- VISTA EN TABLA ---------------- */
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] shadow-[var(--shadow)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[10.5px] font-extrabold text-[var(--muted)] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Expediente</th>
                  <th className="py-3.5 px-4">Materia / Hechos</th>
                  <th className="py-3.5 px-4">Institución / Solicitante</th>
                  <th className="py-3.5 px-4">Fecha Apertura</th>
                  <th className="py-3.5 px-4">Situación</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-xs">
                {expedientes.map((exp) => {
                  const badge = getStatusBadge(exp.statusId, exp.statusName);
                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-[var(--surface-2)] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/expedientes/${exp.id}`)}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#6c3aed]/15 text-[#8b59f6] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-extrabold text-[#8b59f6] group-hover:text-[#6c3aed] text-xs">
                              {exp.code}
                            </span>
                            <span className="block text-[10px] text-[var(--muted)]">ID: #{exp.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-[var(--text)] line-clamp-1">{exp.subject || 'Sin asunto especificado'}</p>
                        <span className="text-[10px] text-[var(--muted)] block truncate">
                          Defensor: {exp.workerName || 'No asignado'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-[var(--text)] block truncate max-w-[200px]">
                          {exp.institution || 'Solicitud Directa'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[var(--muted)] font-mono text-[11px]">
                        {exp.openDate}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10.5px] font-bold border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} mr-1.5`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/expedientes/${exp.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[#6c3aed] hover:text-white text-[#8b59f6] text-[11px] font-bold transition-all border border-[var(--line)]"
                        >
                          <span>Ver caso</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 bg-[var(--surface-2)] border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Mostrando {expedientes.length} casos registrados</span>
            <span>DEMUNA ZAPILLICA &bull; MIMP</span>
          </div>
        </div>
      ) : (
        
        /* ---------------- VISTA EN TARJETAS (GRID) ---------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expedientes.map((exp) => {
            const badge = getStatusBadge(exp.statusId, exp.statusName);
            return (
              <div
                key={exp.id}
                onClick={() => navigate(`/expedientes/${exp.id}`)}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:border-[#6c3aed]/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black text-[#8b59f6] bg-[#6c3aed]/10 px-2.5 py-1 rounded-lg border border-[#6c3aed]/20">
                      {exp.code}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} mr-1.5`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[13.5px] text-[var(--text)] line-clamp-2 leading-snug group-hover:text-[#6c3aed] transition-colors mb-2">
                    {exp.subject || 'Atención general de caso DEMUNA'}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[var(--muted)]">
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-[#259be8] shrink-0" />
                      <span className="truncate">{exp.institution || 'Presentación directa de parte'}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#e6a03a] shrink-0" />
                      <span>Apertura: {exp.openDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--muted)] truncate max-w-[150px]">
                    {exp.workerName}
                  </span>
                  <span className="text-[#8b59f6] font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Detalle 360°</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
