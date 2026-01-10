import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { X, TrendingUp, Calendar, AlertCircle, List, PieChart, DollarSign, Filter, ChevronDown, ChevronUp, Check, Power } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const ProjectionModal = ({ isOpen, onClose }) => {
  const { calculateProjection, themeColor, darkMode, budgets, subscriptions, companies, goals } = useFinancial();
  const [months, setMonths] = useState(3);
  const [extraIncome, setExtraIncome] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); 
  
  // --- NUEVOS ESTADOS PARA SIMULACIÓN ---
  const [excludedIds, setExcludedIds] = useState([]); // Lista negra de IDs apagados
  const [isSlopeExpanded, setIsSlopeExpanded] = useState(false); // Abrir/cerrar detalles de pendiente

  // Generar datos (Pasamos excludedIds al cálculo)
  const data = useMemo(() => calculateProjection(months, Number(extraIncome), excludedIds), [months, extraIncome, excludedIds, calculateProjection]);
  const daysWithEvents = useMemo(() => data.filter(d => d.logs && d.logs.length > 0), [data]);

  if (!isOpen) return null;

  const startBalance = data.length > 0 ? data[0].balance : 0;
  const endBalance = data.length > 0 ? data[data.length - 1].balance : 0;
  const growth = endBalance - startBalance;

  // Manejo de Filtros (Toggle ON/OFF)
  const toggleFilter = (id) => {
      setExcludedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Cálculo para el desglose de pendiente diaria (Solo activos)
  const activeBudgets = budgets.filter(b => !excludedIds.includes(b.id));
  // Para mostrar en la lista, usamos TODOS los presupuestos, pero marcamos visualmente los apagados
  const allBudgetsForList = budgets.map(b => ({
      name: b.category,
      dailyCost: (Number(b.limit) || 0) / 30,
      id: b.id
  })).sort((a, b) => b.dailyCost - a.dailyCost);

  // Estilos
  const bgClass = darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';
  const borderClass = darkMode ? 'border-slate-800' : 'border-slate-100';
  const subTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const timeRanges = [ { label: '1M', val: 1 }, { label: '3M', val: 3 }, { label: '6M', val: 6 }, { label: '1A', val: 12 }, { label: '2A', val: 24 }, { label: '3A', val: 36 }, { label: '5A', val: 60 } ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl flex overflow-hidden ${bgClass}`}>
        
        {/* IZQUIERDA: GRÁFICA */}
        <div className="flex-1 flex flex-col p-6 relative">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2"><TrendingUp className="text-blue-500"/> Proyección Financiera</h2>
                    <p className={`text-xs ${subTextClass}`}>Simulación interactiva de escenarios</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Input Ingreso Extra con botón de apagado */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} ${excludedIds.includes('manual_extra_income') ? 'opacity-50 grayscale' : ''}`}>
                        <button onClick={() => toggleFilter('manual_extra_income')} className={`mr-1 ${excludedIds.includes('manual_extra_income') ? 'text-slate-400' : 'text-emerald-500'}`} title={excludedIds.includes('manual_extra_income') ? "Activar" : "Desactivar"}>
                            <Power size={12} strokeWidth={3}/>
                        </button>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Extra/sem:</span>
                        <div className="flex items-center text-emerald-500 font-bold">
                            <DollarSign size={12} strokeWidth={3}/>
                            <input type="number" className="w-16 bg-transparent outline-none text-sm ml-0.5" placeholder="0" value={extraIncome} onChange={e => setExtraIncome(e.target.value)} disabled={excludedIds.includes('manual_extra_income')}/>
                        </div>
                    </div>
                    
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
                    
                    <div className={`flex p-1 rounded-xl overflow-x-auto max-w-[300px] md:max-w-none custom-scrollbar ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        {timeRanges.map(range => (
                            <button key={range.val} onClick={() => setMonths(range.val)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${months === range.val ? 'bg-blue-500 text-white shadow-md' : subTextClass}`}>{range.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs><linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={themeColor} stopOpacity={0.2}/><stop offset="95%" stopColor={themeColor} stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="date" tickFormatter={(val) => { const d = new Date(val.split('-')[0], val.split('-')[1]-1, val.split('-')[2]); if (months > 12) return d.getFullYear(); return d.toLocaleDateString('es-ES', { month: 'short' }); }} tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={30}/>
                        <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val/1000).toFixed(0) + 'k' : val}`}/>
                        <Tooltip labelFormatter={(label) => { const [y, m, d] = label.split('-'); return new Date(y, m-1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }} formatter={(value) => [formatCurrency(value), 'Saldo Estimado']} contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                        <Area type="monotone" dataKey="balance" stroke={themeColor} strokeWidth={3} fill="url(#projGrad)" animationDuration={500}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* DERECHA: SIDEBAR DE DATOS */}
        <div className={`w-96 flex flex-col border-l ${borderClass}`}>
            
            {/* Header Sidebar */}
            <div className={`p-4 border-b flex justify-between items-center ${borderClass}`}>
                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <button onClick={() => setActiveTab('summary')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'summary' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}><PieChart size={14}/> Resumen</button>
                    <button onClick={() => setActiveTab('details')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'details' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}><List size={14}/> Desglose</button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors text-slate-400"><X size={20}/></button>
            </div>

            {/* TAB: RESUMEN (PANEL DE CONTROL DE SIMULACIÓN) */}
            {activeTab === 'summary' && (
                <div className="flex-1 p-6 flex flex-col gap-6 animate-in slide-in-from-right-4 overflow-y-auto">
                    
                    {/* Sección de Simulador (Filtros) */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-1"><Filter size={10}/> Simulador: ¿Qué activos considerar?</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* Chips de Empresas */}
                            {companies.filter(c => c.type === 'full-time').map(comp => (
                                <button key={comp.id} onClick={() => toggleFilter(comp.id)} className={`px-2 py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1.5 ${excludedIds.includes(comp.id) ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 grayscale opacity-60' : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800'}`}>
                                    {excludedIds.includes(comp.id) ? <div className="w-2 h-2 rounded-full bg-slate-400"/> : <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_currentColor]"/>} 
                                    {comp.name}
                                </button>
                            ))}
                            {/* Chips de Suscripciones */}
                            {subscriptions.map(sub => (
                                <button key={sub.id} onClick={() => toggleFilter(sub.id)} className={`px-2 py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1.5 ${excludedIds.includes(sub.id) ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 grayscale opacity-60' : 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800'}`}>
                                    {excludedIds.includes(sub.id) ? <div className="w-2 h-2 rounded-full bg-slate-400"/> : <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_currentColor]"/>} 
                                    {sub.name}
                                </button>
                            ))}
                            {/* Chips de Metas */}
                            {goals.map(goal => (
                                <button key={goal.id} onClick={() => toggleFilter(goal.id)} className={`px-2 py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1.5 ${excludedIds.includes(goal.id) ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 grayscale opacity-60' : 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-900/30 dark:border-orange-800'}`}>
                                    {excludedIds.includes(goal.id) ? <div className="w-2 h-2 rounded-full bg-slate-400"/> : <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_currentColor]"/>} 
                                    Meta: {goal.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>

                    {/* Datos Grandes */}
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Balance Inicial</span>
                        <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(startBalance)}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Balance Final</span>
                        <p className={`text-4xl font-black ${endBalance >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>{formatCurrency(endBalance)}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${growth >= 0 ? (darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50') : (darkMode ? 'bg-rose-900/20' : 'bg-rose-50')}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Crecimiento Neto</span>
                        <p className={`text-2xl font-black ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{growth >= 0 ? '+' : ''}{formatCurrency(growth)}</p>
                    </div>
                </div>
            )}

            {/* TAB: DETALLES */}
            {activeTab === 'details' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 animate-in slide-in-from-right-4 relative">
                    
                    {/* --- TARJETA DE PENDIENTE (ACORDEÓN DESPLEGABLE) --- */}
                    <div className={`rounded-xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div 
                            className="p-3 flex items-center justify-between cursor-pointer"
                            onClick={() => setIsSlopeExpanded(!isSlopeExpanded)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-500'}`}>
                                    <TrendingUp size={16} className="rotate-180"/>
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Pendiente Diaria (Base)</p>
                                    <p className="text-[9px] text-slate-400">Consumo de presupuestos</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                                <p className="text-sm font-black text-rose-500">
                                    {formatCurrency((data[0]?.logs?.find(l => l.type === 'daily')?.amount || 0))}
                                    <span className="text-[9px] text-slate-400 font-bold ml-1">/ día</span>
                                </p>
                                {isSlopeExpanded ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                            </div>
                        </div>

                        {/* DETALLE EXPANDIDO (LISTA DE PRESUPUESTOS CON TOGGLE) */}
                        {isSlopeExpanded && (
                            <div className={`px-3 pb-3 pt-0 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'} animate-in slide-in-from-top-2`}>
                                <p className="text-[9px] font-bold text-slate-400 uppercase py-2 flex items-center gap-1"><Filter size={8}/> Click para activar/desactivar</p>
                                <div className="space-y-1">
                                    {allBudgetsForList.length === 0 && <p className="text-[9px] text-slate-400 italic">No hay presupuestos configurados</p>}
                                    
                                    {allBudgetsForList.map(item => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => toggleFilter(item.id)}
                                            className={`flex justify-between items-center p-1.5 rounded-lg text-[10px] cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 ${excludedIds.includes(item.id) ? 'opacity-40 grayscale' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${excludedIds.includes(item.id) ? 'bg-slate-400 shadow-none' : 'bg-rose-500'}`}></div>
                                                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{item.name}</span>
                                            </div>
                                            <span className={`font-bold ${excludedIds.includes(item.id) ? 'text-slate-400 line-through' : 'text-rose-500'}`}>-{formatCurrency(item.dailyCost)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 mt-4 pl-1">Eventos Específicos</h3>

                    {daysWithEvents.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <List size={32} className="mx-auto mb-2 text-slate-300"/>
                            <p className="text-center text-xs text-slate-400">No hay eventos específicos activos.</p>
                        </div>
                    ) : (
                        daysWithEvents.map((day, idx) => {
                            const specificLogs = day.logs.filter(l => l.type !== 'daily');
                            if (specificLogs.length === 0) return null;

                            return (
                                <div key={idx} className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                                        <Calendar size={12} className="text-blue-500"/>
                                        <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {new Date(day.date.split('-')[0], day.date.split('-')[1]-1, day.date.split('-')[2]).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {specificLogs.map((log, lIdx) => (
                                            <div key={lIdx} className="flex justify-between items-center text-[10px]">
                                                <span className={`font-medium truncate pr-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{log.name}</span>
                                                <span className={`font-bold whitespace-nowrap ${log.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {log.amount > 0 ? '+' : ''}{formatCurrency(log.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};