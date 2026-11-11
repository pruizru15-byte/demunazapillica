import React from 'react';

export const Badge = ({ children, statusId, className = '' }) => {
  // Mapeo automático de estados de expedientes DEMUNA
  const statusColors = {
    1: 'bg-amber-100 text-amber-800 border-amber-200', // Pendiente
    2: 'bg-blue-100 text-blue-800 border-blue-200',     // En Progreso
    3: 'bg-slate-100 text-slate-700 border-slate-200',  // Archivado
    4: 'bg-purple-100 text-purple-800 border-purple-200',// Derivado
    5: 'bg-emerald-100 text-emerald-800 border-emerald-200',// Resuelto
    6: 'bg-zinc-100 text-zinc-800 border-zinc-200',     // Concluido
  };

  const colorClass = statusId && statusColors[statusId] 
    ? statusColors[statusId] 
    : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}>
      {children}
    </span>
  );
};

