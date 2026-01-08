import React, { useState } from 'react';
import { Calendar, Zap, Trash2, Plus, ChevronUp, ChevronDown, Minus, Maximize2, Edit3 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

export const SubscriptionSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd, onEdit }) => {
  const { subscriptions, deleteSubscription, darkMode, themeColor } = useFinancial();
  
  // Estado para contraer/expandir la tarjeta
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Cálculo del total mensual
  const monthlyTotal = subscriptions.reduce((acc, sub) => acc + Number(sub.price), 0);

  return (
    <Card className="relative overflow-hidden transition-all duration-300">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Calendar size={14} style={{ color: themeColor }}/> Suscripciones
        </h3>
        
        <div className="flex items-center gap-1">
            {/* Flechas de Ordenamiento */}
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
            
            {/* Botón Minimizar/Expandir */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                title={isExpanded ? "Minimizar" : "Expandir"}
            >
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>

            {/* Botón Añadir */}
            <button 
                onClick={onAdd} 
                className="p-1.5 rounded-lg hover:brightness-110 transition-all text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
            >
                <Plus size={16}/>
            </button>
        </div>
      </div>

      {/* CONTENIDO (Solo si está expandido) */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
            
            {/* Lista de Suscripciones */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1 custom-scrollbar">
                {subscriptions.map(sub => (
                <div 
                    key={sub.id} 
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all hover:shadow-sm ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-100'}`}
                >
                    <div className="flex items-center gap-3">
                        {/* Icono con la inicial y color del tema */}
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-xs shadow-md"
                            style={{ backgroundColor: themeColor }}
                        >
                            {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs font-bold">{sub.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold">
                                Día {sub.day} • {formatCurrency(sub.price)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Botones de Acción (Editar y Borrar) */}
                    <div className="flex gap-1">
                        <button 
                            onClick={() => onEdit(sub)} 
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit3 size={14}/>
                        </button>
                        <button 
                            onClick={() => deleteSubscription(sub.id)} 
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 size={14}/>
                        </button>
                    </div>
                </div>
                ))}
                
                {subscriptions.length === 0 && (
                    <p className="text-center text-slate-400 text-[10px] py-4 italic">
                        No tienes suscripciones activas
                    </p>
                )}
            </div>

            {/* Resumen de Totales */}
            <div className={`p-4 rounded-2xl flex justify-between items-center ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div>
                    <span className="text-[8px] font-black uppercase text-slate-400 block">Mensual</span>
                    <span className="text-lg font-black" style={{ color: themeColor }}>
                        {formatCurrency(monthlyTotal)}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[8px] font-black uppercase text-slate-400 block">Proyectado Anual</span>
                    <span className="text-sm font-black text-slate-500">
                        {formatCurrency(monthlyTotal * 12)}
                    </span>
                </div>
            </div>
        </div>
      )}
    </Card>
  );
};