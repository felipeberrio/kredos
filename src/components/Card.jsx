import React from 'react';
import { useFinancial } from '../context/FinancialContext';

export const Card = ({ children, className = "", padded = true }) => {
  const { darkMode } = useFinancial();

  return (
    <div className={`
      rounded-2xl border transition-all duration-300 ease-out
      ${darkMode 
        ? 'bg-slate-900/80 border-slate-700/50 shadow-card-dark hover:border-slate-600/50' 
        : 'bg-white border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-200'}
      ${padded ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
