import React from 'react';

/**
 * Componente de Botão Tátil com profundidade física (macOS Depth UI) adaptável a Temas
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  ...props 
}) {
  const baseStyles = "relative inline-flex items-center justify-center font-bold select-none transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none";

  const sizes = {
    sm: "px-2.5 py-1.5 text-[11px] rounded-lg gap-1.5",
    md: "px-4 py-2 text-xs rounded-xl gap-2",
    lg: "px-5 py-2.5 text-sm rounded-xl gap-2.5",
    icon: "p-2 rounded-xl text-xs flex items-center justify-center"
  };

  const variants = {
    primary: "bg-[#196BFB] hover:bg-[#155bd8] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),_0_0_0_1px_rgba(255,255,255,0.1)_inset,_0_1px_0_0_rgba(255,255,255,0.25)_inset] hover:-translate-y-0.5 active:scale-[0.98]",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2333] dark:hover:bg-[#222d42] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-sm hover:-translate-y-0.5 active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent active:scale-[0.97]",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 active:scale-[0.98]",
    cyan: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 active:scale-[0.98]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${size === 'sm' ? 'w-3.5 h-3.5' : ''}`} />}
      {children}
    </button>
  );
}
