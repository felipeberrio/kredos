import React from 'react';
import { useFinancial } from '../context/FinancialContext';

export const Card = ({ children, className = "" }) => {
  const { darkMode } = useFinancial();
  
  return (
    <div className={`
      p-6 rounded-[2.5rem] border transition-all duration-300
      ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}
      ${className}
    `}>
      {children}
    </div>
  );
};