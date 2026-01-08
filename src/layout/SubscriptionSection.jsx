import React from 'react';
import { Calendar, Zap, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

export const SubscriptionSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd }) => {
  const { subscriptions, deleteSubscription, darkMode } = useFinancial();
  const monthlyTotal = subscriptions.reduce((acc, sub) => acc + Number(sub.price), 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Calendar size={14}/> Suscripciones
        </h3>
        <div className="flex items-center gap-2">
            <div className="flex flex-col">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={12} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={12} strokeWidth={3}/></button>}
            </div>
            <button onClick={onAdd} className="p-1.5 text-indigo-500 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20">
            <Plus size={18}/>
            </button>
        </div>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
        {subscriptions.map(sub => (
          <div key={sub.id} className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white bg-indigo-500 text-xs">{sub.name.charAt(0)}</div>
              <div>
                <p className="text-xs font-bold">{sub.name}</p>
                <p className="text-[9px] text-slate-400 font-bold">Día {sub.day} • {formatCurrency(sub.price)}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"><Zap size={14}/></button>
              <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
        {subscriptions.length === 0 && <p className="text-center text-slate-400 text-[10px] py-4 italic">No tienes suscripciones</p>}
      </div>

      <div className={`p-4 rounded-2xl flex justify-between items-center ${darkMode ? 'bg-slate-800' : 'bg-indigo-50'}`}>
        <div><span className="text-[8px] font-black uppercase text-indigo-400 block">Mensual</span><span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(monthlyTotal)}</span></div>
        <div className="text-right"><span className="text-[8px] font-black uppercase text-rose-400 block">Anual</span><span className="text-sm font-black text-rose-500">{formatCurrency(monthlyTotal * 12)}</span></div>
      </div>
    </Card>
  );
};