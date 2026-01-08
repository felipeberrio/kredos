import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { X, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const ProjectionModal = ({ isOpen, onClose }) => {
  const { calculateProjection, themeColor, darkMode } = useFinancial();
  const [timeframe, setTimeframe] = useState(12); // Meses
  const [weeklyIncome, setWeeklyIncome] = useState(''); // Input Manual

  // Calcular usando el input manual
  const data = useMemo(() => calculateProjection(timeframe, Number(weeklyIncome) || 0), [timeframe, weeklyIncome, calculateProjection]);
  
  const finalBalance = data.length > 0 ? data[data.length - 1].balance : 0;
  const startBalance = data.length > 0 ? data[0].balance : 0;
  const growth = finalBalance - startBalance;

  if (!isOpen) return null;

  const inputStyle = {
      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
      color: darkMode ? '#ffffff' : '#0f172a',
      borderColor: darkMode ? '#334155' : '#e2e8f0'
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp style={{ color: themeColor }}/> Proyección Financiera
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-1">Simulación basada en Presupuestos, Suscripciones e Ingresos</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={24} className="text-slate-400"/>
            </button>
        </div>

        {/* CONTROLES */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
            {/* 1. Horizonte Temporal */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Calendar size={12}/> Horizonte</label>
                <div className="flex flex-wrap gap-2">
                    {[ {L:'3M',V:3}, {L:'6M',V:6}, {L:'1A',V:12}, {L:'2A',V:24}, {L:'5A',V:60} ].map(opt => (
                        <button 
                            key={opt.V}
                            onClick={() => setTimeframe(opt.V)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === opt.V ? 'text-white shadow-md scale-105' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                            style={{ backgroundColor: timeframe === opt.V ? themeColor : undefined }}
                        >
                            {opt.L}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Ingreso Semanal Manual */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><DollarSign size={12}/> Ingreso Semanal Estimado</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-6 pr-4 py-2 rounded-xl text-sm font-bold outline-none border shadow-sm focus:ring-2"
                        style={{ ...inputStyle, '--tw-ring-color': themeColor }}
                        value={weeklyIncome}
                        onChange={(e) => setWeeklyIncome(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Resultado */}
            <div className={`p-4 rounded-2xl border flex justify-between items-center ${growth >= 0 ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900' : 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900'}`}>
                <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Balance Final</span>
                    <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(finalBalance)}</span>
                </div>
                <div className={`text-right ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <span className="text-[10px] font-black uppercase block">Crecimiento</span>
                    <span className="text-sm font-bold">{growth >= 0 ? '+' : ''}{formatCurrency(growth)}</span>
                </div>
            </div>
        </div>

        {/* GRAFICA (Con altura forzada para que se vea) */}
        <div className="flex-1 w-full h-[400px] p-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="projGradModal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={themeColor} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={(d) => {
                            const date = new Date(d);
                            return timeframe > 12 ? date.getFullYear() : date.toLocaleDateString(undefined, { month: 'short' });
                        }}
                        tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} 
                        tickLine={false} axisLine={false}
                        minTickGap={40}
                    />
                    <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
                    <Tooltip 
                        labelFormatter={(d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        formatter={(value) => [formatCurrency(value), 'Balance Estimado']}
                        contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: darkMode ? '#fff' : '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="balance" stroke={themeColor} strokeWidth={3} fill="url(#projGradModal)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};