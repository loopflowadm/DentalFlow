import React from 'react';

/**
 * Componente Badge / Tag de Status Elegante
 */
export default function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center font-bold tracking-wider uppercase select-none rounded-full border";

  const sizes = {
    sm: "px-2 py-0.5 text-[8px]",
    md: "px-2.5 py-0.5 text-[9px]",
    lg: "px-3 py-1 text-[10px]"
  };

  const variants = {
    neutral: "bg-slate-800 text-slate-300 border-white/10",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  };

  return (
    <span
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
