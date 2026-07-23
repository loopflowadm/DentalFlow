import React from 'react';

/**
 * Componente Card Adaptável a Temas (Light / Dark Obsidian Surface #1A2333)
 */
export default function Card({ 
  children, 
  className = '', 
  hoverable = false,
  onClick,
  ...props 
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#1A2333]/90 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-left transition-colors duration-300 ${
        hoverable ? 'hover:border-slate-300 dark:hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
