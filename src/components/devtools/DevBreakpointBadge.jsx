import React, { useState, useEffect } from 'react';
import { EyeOff } from 'lucide-react';

export default function DevBreakpointBadge({ isVisible, onToggle }) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  const getBreakpoint = () => {
    if (windowWidth < 640) return { label: 'XS', range: '< 640px', color: 'bg-rose-500' };
    if (windowWidth < 768) return { label: 'SM', range: '640px - 767px', color: 'bg-amber-500' };
    if (windowWidth < 1024) return { label: 'MD', range: '768px - 1023px', color: 'bg-emerald-500' };
    if (windowWidth < 1280) return { label: 'LG', range: '1024px - 1279px', color: 'bg-sky-500' };
    if (windowWidth < 1536) return { label: 'XL', range: '1280px - 1535px', color: 'bg-indigo-500' };
    return { label: '2XL', range: '>= 1536px', color: 'bg-purple-500' };
  };

  const bp = getBreakpoint();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/90 dark:bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/20 shadow-2xl text-xs font-mono select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className={`w-2.5 h-2.5 rounded-full ${bp.color} animate-pulse`} />
      <span className="font-extrabold text-amber-400">{bp.label}</span>
      <span className="text-[10px] opacity-70">({windowWidth}px)</span>
      
      <button 
        onClick={onToggle} 
        title="Ocultar Badge de Breakpoint"
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity p-0.5"
      >
        <EyeOff className="w-3 h-3 text-slate-300" />
      </button>
    </div>
  );
}
