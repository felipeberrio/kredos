import React from 'react';
import { X } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const Modal = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useFinancial();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`
          w-full max-w-md rounded-2xl shadow-premium relative p-6 max-h-[90vh] overflow-y-auto
          transition-all duration-300
          ${darkMode 
            ? 'bg-slate-900 border border-slate-700/50 text-white shadow-premium-dark' 
            : 'bg-white border border-slate-100 text-slate-900'}
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold tracking-tight tabular-nums">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all duration-200 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
