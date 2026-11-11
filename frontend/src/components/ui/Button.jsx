import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-200",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-sky-500",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-400"
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

