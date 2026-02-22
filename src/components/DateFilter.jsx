import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Calendar, Filter, X } from 'lucide-react';

export const DateFilter = () => {
  const { dateFilter, setDateFilter, themeColor, darkMode } = useFinancial();

  const handleModeChange = (e) => {
    const mode = e.target.value;
    const now = new Date();
    let value = dateFilter.value;

    if (mode === 'month') value = now.toISOString().slice(0, 7); // YYYY-MM
    if (mode === 'year') value = now.getFullYear().toString(); // YYYY
    
    setDateFilter({ ...dateFilter, mode, value });
  };

  return (
    <div className={`p-2 rounded-xl border flex items-center gap-2 transition-all duration-200 ${darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-200/80'}`}>
      
      <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} text-slate-500`}>
        <Filter size={16} />
      </div>

      <select 
        value={dateFilter.mode} 
        onChange={handleModeChange}
        className={`bg-transparent outline-none text-xs font-bold uppercase cursor-pointer ${darkMode ? 'text-white' : 'text-slate-700'}`}
      >
        <option value="month">📅 Por Mes</option>
        <option value="year">📆 Por Año</option>
        <option value="custom">🛠 Personalizado</option>
        <option value="all">♾️ Todo</option>
      </select>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

      {/* Selector de MES */}
      {dateFilter.mode === 'month' && (
        <input 
          type="month" 
          value={dateFilter.value}
          onChange={(e) => setDateFilter({...dateFilter, value: e.target.value})}
          className={`bg-transparent outline-none text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}
        />
      )}

      {/* Selector de AÑO */}
      {dateFilter.mode === 'year' && (
        <select 
            value={dateFilter.value}
            onChange={(e) => setDateFilter({...dateFilter, value: e.target.value})}
            className={`bg-transparent outline-none text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}
        >
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}

      {/* Selector PERSONALIZADO */}
      {dateFilter.mode === 'custom' && (
        <div className="flex items-center gap-1">
          <input 
            type="date" 
            value={dateFilter.from} 
            onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
            className={`w-24 bg-transparent text-[10px] font-bold border rounded px-1 ${darkMode ? 'border-slate-700 text-white' : 'border-slate-200'}`}
          />
          <span className="text-slate-400">-</span>
          <input 
            type="date" 
            value={dateFilter.to} 
            onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
            className={`w-24 bg-transparent text-[10px] font-bold border rounded px-1 ${darkMode ? 'border-slate-700 text-white' : 'border-slate-200'}`}
          />
        </div>
      )}

      {dateFilter.mode === 'all' && <span className="text-[10px] font-bold text-slate-400 px-2">Histórico Completo</span>}

    </div>
  );
};