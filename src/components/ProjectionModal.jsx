import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const ProjectionModal = ({ isOpen, onClose }) => {
  const { calculateProjection, darkMode, themeColor } = useFinancial();
  const [horizon, setHorizon] = useState(3); // Default 3 meses
  const [manualIncome, setManualIncome] = useState('');

  // Generar datos
  const projectionData = useMemo(() => {
    return calculateProjection(horizon, Number(manualIncome) || 0);
  }, [horizon, manualIncome, calculateProjection]);

  // Cálculos finales
  const finalBalance = projectionData.length > 0 ? projectionData[projectionData.length - 1].balance : 0;
  const initialBalance = projectionData.length > 0 ? projectionData[0].balance : 0;
  const growth = finalBalance - initialBalance;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        
        {/* HEADER */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                <TrendingUp className="text-blue-500" size={24}/>
            </div>
            <div>
                <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Proyección Financiera</h2>
                <p className="text-slate-400 text-xs">Simulación basada en comportamiento actual</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X size={20}/>
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL (3 COLUMNAS) */}
        <div className="flex flex-col md:flex-row h-[500px]">
            
            {/* 1. IZQUIERDA: FILTROS TIEMPO (VERTICAL) */}
            <div className={`w-24 flex flex-col gap-2 p-4 border-r overflow-y-auto ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                <span className="text-[9px] font-bold text-slate-400 uppercase text-center mb-2">Plazo</span>
                {[
                    { label: '1M', val: 1 },
                    { label: '3M', val: 3 }, 
                    { label: '6M', val: 6 }, 
                    { label: '1A', val: 12 }, 
                    { label: '2A', val: 24 },
                    { label: '5A', val: 60 }
                ].map(opt => (
                    <button 
                        key={opt.label}
                        onClick={() => setHorizon(opt.val)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all ${horizon === opt.val ? 'bg-blue-500 text-white shadow-md' : (darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-white hover:shadow-sm')}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* 2. CENTRO: INPUT + GRÁFICA */}
            <div className="flex-1 flex flex-col p-4 relative">
                {/* Input Flotante Arriba */}
                <div className="flex justify-center mb-4 z-10">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ingreso Extra/sem:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">$</span>
                            <input 
                                type="number" 
                                value={manualIncome}
                                onChange={(e) => setManualIncome(e.target.value)}
                                placeholder="0"
                                className={`w-20 bg-transparent outline-none font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Gráfica */}
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="projModalGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, {month:'short', year: horizon > 12 ? '2-digit' : undefined})} 
                                tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} 
                                tickLine={false} 
                                axisLine={false} 
                                minTickGap={40}
                            />
                            <YAxis 
                                tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(val) => `$${val/1000}k`}
                            />
                            <Tooltip 
                                labelFormatter={(d) => new Date(d).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                                formatter={(value) => [formatCurrency(value), 'Balance Estimado']}
                                contentStyle={{ 
                                    backgroundColor: darkMode ? '#1e293b' : '#fff', 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    color: darkMode ? '#fff' : '#0f172a', 
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' 
                                }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="balance" 
                                stroke={themeColor} 
                                strokeWidth={3} 
                                fill="url(#projModalGrad)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. DERECHA: RESUMEN (VERTICAL) */}
            <div className={`w-48 border-l p-6 flex flex-col justify-center gap-8 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Balance Inicial</span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{formatCurrency(initialBalance)}</span>
                </div>
                
                <div className="py-6 border-y border-dashed border-slate-300 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Balance Final</span>
                    <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(finalBalance)}</span>
                </div>

                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Crecimiento</span>
                    <span className={`text-xl font-black ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {growth >= 0 ? '+' : ''}{formatCurrency(growth)}
                    </span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};