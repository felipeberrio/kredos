import React from 'react';
import { X } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const Modal = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useFinancial();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-[2rem] shadow-2xl relative p-6 max-h-[90vh] overflow-y-auto
        ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-900'}
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};