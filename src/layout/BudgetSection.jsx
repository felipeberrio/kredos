import React, { useState, useEffect } from 'react';
import { PieChart, Plus, ChevronUp, ChevronDown, Minus, Maximize2, Trash2, AlertTriangle, Edit3, Clock, Filter } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

export const BudgetSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd, onEdit }) => {
  const { budgets, getBudgetProgress, deleteBudget, darkMode, themeColor, selectedCategory, setSelectedCategory, isAllExpanded } = useFinancial();
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    setIsExpanded(isAllExpanded);
  }, [isAllExpanded]);

  // --- CÁLCULO DE TIEMPO ---
  const now = new Date();
  
  // Semanas Restantes (Mínimo 1 para no dividir por cero)
  const getWeeksLeft = () => {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diffTime = Math.abs(endOfMonth - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 0) return 0;
    return Math.max(1, Math.ceil(diffDays / 7));
  };

  // Semanas Totales del Mes
  const getTotalWeeksInMonth = () => {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.ceil(daysInMonth / 7);
  };

  const weeksLeft = getWeeksLeft();
  const totalWeeks = getTotalWeeksInMonth();

  const handleBudgetClick = (category) => {
    if (selectedCategory === category) setSelectedCategory(null);
    else setSelectedCategory(category);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-1">
        <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <PieChart size={14} style={{ color: themeColor }}/> Presupuestos
            </h3>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock size={10}/> Quedan {weeksLeft} {weeksLeft === 1 ? 'semana' : 'semanas'}
            </span>
        </div>

        <div className="flex items-center gap-1">
            <div className="flex flex-col mr-1">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>
            <button onClick={onAdd} className="p-1.5 rounded-lg hover:brightness-110 transition-all text-white shadow-sm" style={{ backgroundColor: themeColor }}>
                <Plus size={16}/>
            </button>
        </div>
      </div>

      {isExpanded && (
        // Contenedor principal rediseñado para Scroll Horizontal
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory custom-scrollbar animate-in fade-in slide-in-from-top-2">
            {budgets.map(b => {
                const spent = getBudgetProgress(b.category);
                const rawPercentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                const percentage = Math.min(rawPercentage, 100); // Tope visual al 100%
                const isOver = spent > b.limit;
                const remaining = b.limit - spent;
                const isSelected = selectedCategory === b.category;
                
                // --- CÁLCULOS SEMANALES ---
                const weeklyIdeal = b.limit / totalWeeks; 
                const weeklyActual = remaining > 0 ? remaining / weeksLeft : 0; 

                return (
                    <div 
                        key={b.id} 
                        onClick={() => handleBudgetClick(b.category)}
                        className={`group relative flex flex-col items-center shrink-0 w-[110px] sm:w-[125px] transition-all cursor-pointer snap-center rounded-2xl p-2 ${
                            isSelected 
                                ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                    >
                        {/* Status (Disponible / Excedido) */}
                        <div className="flex flex-col items-center mb-4 h-10 justify-end text-center">
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {isOver ? 'Excedido' : 'Disponible'}
                            </span>
                            <span className={`text-sm font-black tracking-tight ${isOver ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                {formatCurrency(Math.abs(remaining))}
                            </span>
                        </div>

                        {/* La Barra Vertical */}
                        <div className="relative w-16 sm:w-20 h-48 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col justify-end p-1.5 transition-colors group-hover:border-slate-300 dark:group-hover:border-slate-600">
                            
                            {/* Botones de acción flotantes (Hover) */}
                            <div className="absolute -right-3 -top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(b); }} className="p-2 bg-white dark:bg-slate-800 text-blue-500 rounded-full shadow-md hover:scale-110 transition-transform"><Edit3 size={12}/></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteBudget(b.id); }} className="p-2 bg-white dark:bg-slate-800 text-rose-500 rounded-full shadow-md hover:scale-110 transition-transform"><Trash2 size={12}/></button>
                            </div>

                            {/* Relleno de progreso */}
                            <div 
                                className={`w-full rounded-[1.75rem] transition-all duration-1000 ease-out flex flex-col items-center justify-start pt-3 overflow-hidden shadow-inner ${isOver ? 'bg-rose-500' : ''}`}
                                style={{ 
                                    height: `${Math.max(percentage, 18)}%`, // 18% mínimo para que no se corte el texto
                                    backgroundColor: isOver ? undefined : themeColor 
                                }}
                            >
                                <span className="text-white font-black text-xs sm:text-sm tracking-tight drop-shadow-md">
                                    {Math.round(rawPercentage)}%
                                </span>
                            </div>
                        </div>
                        
                        {/* Info Inferior */}
                        <div className="mt-4 flex flex-col items-center text-center w-full">
                            <span className={`text-sm font-bold flex items-center justify-center gap-1 w-full truncate px-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {b.category}
                                {isSelected && <Filter size={10} className="animate-pulse shrink-0"/>}
                                {isOver && <AlertTriangle size={10} className="text-rose-500 animate-pulse shrink-0"/>}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">
                                {formatCurrency(spent)} / {formatCurrency(b.limit)}
                            </span>

                            {/* Info Semanal Compacta */}
                            <div className="mt-2 flex flex-col items-center text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/80 rounded-lg py-1.5 px-2 w-full border border-slate-200/50 dark:border-slate-700/50">
                                <span className="mb-0.5">Ideal: {formatCurrency(weeklyIdeal)}/s</span>
                                {!isOver && (
                                    <span className={weeklyActual < weeklyIdeal ? 'text-rose-500' : 'text-emerald-500'}>
                                        Act: {formatCurrency(weeklyActual)}/s
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {budgets.length === 0 && <p className="text-center w-full text-slate-400 text-[10px] py-8 italic">Sin presupuestos activos</p>}
        </div>
      )}
    </Card>
  );
};