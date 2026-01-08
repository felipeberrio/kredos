import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const SortableBlock = ({ children, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const { darkMode } = useFinancial();

  return (
    <div className="relative group mb-4">
      {/* Controles de ordenamiento SIEMPRE VISIBLES (Mobile Friendly) */}
      <div className="absolute -right-2 -top-3 z-20 flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm">
        {!isFirst && (
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'}`}
            title="Subir"
          >
            <ChevronUp size={14} strokeWidth={3} />
          </button>
        )}
        {!isLast && (
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'}`}
            title="Bajar"
          >
            <ChevronDown size={14} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="transition-transform duration-200">
        {children}
      </div>
    </div>
  );
};