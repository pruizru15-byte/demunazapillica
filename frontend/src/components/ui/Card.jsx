import React from 'react';

export const Card = ({ children, className = '', title, action, ...props }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`} {...props}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

