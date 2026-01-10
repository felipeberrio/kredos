import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';
import { Target, ChevronUp, ChevronDown, Minus, Maximize2, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const GoalsSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onEdit }) => {
  const { goals, deleteGoal, themeColor, darkMode, isAllExpanded, getGoalDetails } = useFinancial();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
      setIsExpanded(isAllExpanded);
  }, [isAllExpanded]);

  // Ordenar metas: Primero las activas, luego las completadas
  const sortedGoals = [...goals].sort((a, b) => {
      const detailsA = getGoalDetails(a);
      const detailsB = getGoalDetails(b);
      if (detailsA.status === 'completed' && detailsB.status !== 'completed') return 1;
      if (detailsA.status !== 'completed' && detailsB.status === 'completed') return -1;
      return 0;
  });

  return (
    <Card className={`overflow-hidden flex flex-col transition-all duration-500 ${isExpanded ? 'h-full min-h-[300px]' : 'h-auto'}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Target size={14} style={{ color: themeColor }}/> Metas de Ahorro
            </h3>
        </div>
        <div className="flex items-center gap-1">
            <div className="flex flex-col mr-1">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
            {goals.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <Target size={48} className="mx-auto mb-2 text-slate-300"/>
                    <p className="text-slate-400 text-xs font-bold">Sin metas definidas</p>
                </div>
            )}

            {sortedGoals.map(goal => {
                const details = getGoalDetails(goal);
                const isCompleted = details.status === 'completed';
                
                return (
                    <div 
                        key={goal.id} 
                        className={`group relative p-4 rounded-2xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                        onClick={() => onEdit(goal)} // Click para editar
                    >
                        {/* Cabecera Meta */}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {goal.name}
                                    {isCompleted && <CheckCircle2 size={14} className="text-emerald-500"/>}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    {isCompleted ? '¡Completado!' : `Objetivo: ${formatCurrency(goal.target)}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-black ${isCompleted ? 'text-emerald-500' : 'text-blue-500'}`} style={{ color: !isCompleted ? themeColor : undefined }}>
                                    {formatCurrency(goal.saved)}
                                </span>
                            </div>
                        </div>

                        {/* Barra de Progreso */}
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div 
                                className="h-full transition-all duration-1000 ease-out rounded-full relative"
                                style={{ 
                                    width: `${details.percent}%`, 
                                    backgroundColor: isCompleted ? '#10b981' : themeColor 
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Detalles de Proyección */}
                        {!isCompleted && (
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                {details.status === 'no_plan' ? (
                                    <span className="flex items-center gap-1 text-rose-400">
                                        <AlertCircle size={10}/> Define un plan de ahorro
                                    </span>
                                ) : (
                                    <>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp size={10}/> Ahorro: {formatCurrency(goal.installment)} / {goal.frequency === 'biweekly' ? 'quincena' : (goal.frequency === 'weekly' ? 'semana' : 'mes')}
                                        </span>
                                        <span className="flex items-center gap-1 text-emerald-500">
                                            <Calendar size={10}/> Fin: {details.estimatedDate.toLocaleDateString()}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Botón Borrar (Hover) */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }} 
                            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-900 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50"
                        >
                            <Minus size={12}/>
                        </button>
                    </div>
                );
            })}
        </div>
      )}
    </Card>
  );
};