import React from 'react';
import { Target, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

export const GoalsSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd }) => {
  const { goals } = useFinancial();

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Target size={14}/> Metas de Ahorro
        </h3>
        <div className="flex items-center gap-2">
            <div className="flex flex-col">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={12} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={12} strokeWidth={3}/></button>}
            </div>
            <button onClick={onAdd} className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20">
            <Plus size={16}/>
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map(g => {
          const progress = Math.min(100, (g.saved / g.target) * 100);
          return (
            <div key={g.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold">{g.name}</span>
                <span className="text-[10px] font-bold text-emerald-500">{formatCurrency(g.saved)} / {formatCurrency(g.target)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}/>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-center text-slate-400 text-[10px] py-2 italic">Sin metas activas</p>}
      </div>
    </Card>
  );
};