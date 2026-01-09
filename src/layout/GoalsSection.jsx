import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, ChevronUp, ChevronDown, Minus, Maximize2, Edit3, Trash2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

export const GoalsSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd, onEdit }) => {
  const { goals, themeColor, deleteGoal, isAllExpanded } = useFinancial();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setIsExpanded(isAllExpanded);
}, [isAllExpanded]);

  return (
    <Card>
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Target size={14} style={{ color: themeColor }}/> Metas de Ahorro
        </h3>
        
        <div className="flex items-center gap-1">
            <div className="flex flex-col mr-1">
                {!isFirst && (
                    <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500">
                        <ChevronUp size={10} strokeWidth={3}/>
                    </button>
                )}
                {!isLast && (
                    <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500">
                        <ChevronDown size={10} strokeWidth={3}/>
                    </button>
                )}
            </div>
            
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>

            <button 
                onClick={onAdd} 
                className="p-1 rounded-lg hover:brightness-110 transition-all text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
            >
                <Plus size={16}/>
            </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {isExpanded && (
        <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
            {goals.map(g => {
                // Cálculo de porcentaje seguro (evita división por cero)
                const progress = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
                
                return (
                    <div key={g.id} className="group space-y-2 relative hover:bg-slate-50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-colors -mx-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{g.name}</span>
                                
                                {/* Botones de acción flotantes (solo visibles en hover) */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onEdit(g)} 
                                        className="text-slate-400 hover:text-blue-500 p-0.5"
                                        title="Editar"
                                    >
                                        <Edit3 size={12}/>
                                    </button>
                                    <button 
                                        onClick={() => deleteGoal(g.id)} 
                                        className="text-slate-400 hover:text-rose-500 p-0.5"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={12}/>
                                    </button>
                                </div>
                            </div>
                            
                            <span className="text-[10px] font-bold" style={{ color: themeColor }}>
                                {formatCurrency(g.saved)} / {formatCurrency(g.target)}
                            </span>
                        </div>
                        
                        {/* Barra de Progreso */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div 
                                className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.2)]" 
                                style={{ width: `${progress}%`, backgroundColor: themeColor }}
                            />
                        </div>
                    </div>
                );
            })}
            
            {goals.length === 0 && (
                <p className="text-center text-slate-400 text-[10px] py-2 italic">
                    Sin metas definidas
                </p>
            )}
        </div>
      )}
    </Card>
  );
};