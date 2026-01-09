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
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            {budgets.map(b => {
                const spent = getBudgetProgress(b.category);
                const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
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
                        className={`group relative p-2 rounded-xl transition-all duration-300 cursor-pointer border -mx-2
                            ${isSelected 
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                    >
                        <div className="flex justify-between items-end mb-1">
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold flex items-center gap-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                    {b.category}
                                    {isSelected && <Filter size={10} className="animate-pulse"/>}
                                    {isOver && <AlertTriangle size={12} className="text-rose-500 animate-pulse"/>}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black ${isOver ? 'text-rose-500' : 'text-slate-500'}`}>
                                    {formatCurrency(spent)} / {formatCurrency(b.limit)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-100 dark:border-slate-700">
                            <div 
                                className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : ''}`}
                                style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: isOver ? undefined : themeColor 
                                }}
                            />
                        </div>
                        
                        <div className="flex justify-between mt-1.5 items-center">
                            <div className="flex flex-col">
                                {/* Estado Restante */}
                                <span className="text-[8px] font-bold text-slate-400">
                                    {isOver ? 'Excedido' : 'Disponible'}: <span className={isOver ? 'text-rose-500' : 'text-emerald-500'}>{formatCurrency(Math.abs(remaining))}</span>
                                </span>
                                
                                {/* Info Semanal: Ideal vs Actual */}
                                <div className="flex gap-2 mt-0.5">
                                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                                        Ideal: <span className="text-slate-500 dark:text-slate-300">{formatCurrency(weeklyIdeal)}/sem</span>
                                    </span>
                                    {!isOver && (
                                        <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                                            Actual: <span className={`${weeklyActual < weeklyIdeal ? 'text-rose-400' : 'text-emerald-500'}`}>{formatCurrency(weeklyActual)}/sem</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(b); }} className="text-[8px] text-blue-400 hover:text-blue-600 font-bold uppercase"><Edit3 size={10}/></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteBudget(b.id); }} className="text-[8px] text-rose-400 hover:text-rose-600 font-bold uppercase"><Trash2 size={10}/></button>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {budgets.length === 0 && <p className="text-center text-slate-400 text-[10px] py-2 italic">Sin presupuestos</p>}
        </div>
      )}
    </Card>
  );
};