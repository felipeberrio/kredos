import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { X, TrendingUp, TrendingDown, Calendar, AlertCircle, List, PieChart, DollarSign, Filter, ChevronDown, ChevronUp, Check, Power, Briefcase, Zap, Target, CreditCard, ArrowRight, Layers } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const ProjectionModal = ({ isOpen, onClose }) => {
  const { calculateProjection, themeColor, darkMode, budgets, subscriptions, companies, goals } = useFinancial();
  const [months, setMonths] = useState(3);
  const [extraIncome, setExtraIncome] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); 
  
  // --- ESTADOS SIMULACIÓN ---
  const [excludedIds, setExcludedIds] = useState([]); 
  const [expandedSections, setExpandedSections] = useState({
      jobs: true,
      budgets: true,
      subs: false,
      goals: false
  });

  // Generar datos
  const data = useMemo(() => calculateProjection(months, Number(extraIncome), excludedIds), [months, extraIncome, excludedIds, calculateProjection]);
  const daysWithEvents = useMemo(() => data.filter(d => d.logs && d.logs.length > 0), [data]);

  if (!isOpen) return null;

  const startBalance = data.length > 0 ? data[0].balance : 0;
  const endBalance = data.length > 0 ? data[data.length - 1].balance : 0;
  const growth = endBalance - startBalance;

  // --- LÓGICA DE FILTROS ---
  const toggleFilter = (id) => {
      setExcludedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSection = (section) => {
      setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
  };

  // Obtener todos los IDs posibles para el botón "Activar/Desactivar Todo"
  const getAllIds = () => {
      const ids = [
          'manual_extra_income',
          ...companies.filter(c => c.type === 'full-time').map(c => c.id),
          ...budgets.map(b => b.id),
          ...subscriptions.map(s => s.id),
          ...goals.map(g => g.id)
      ];
      return ids;
  };

  const toggleAll = () => {
      const allIds = getAllIds();
      // Si hay algo desactivado, activamos todo (limpiamos excludedIds)
      // Si está todo activo (excludedIds vacío), desactivamos todo
      if (excludedIds.length > 0) {
          setExcludedIds([]);
      } else {
          setExcludedIds(allIds);
      }
  };

  // --- CÁLCULOS DE RESUMEN ---
  const fullTimeCompanies = companies.filter(c => c.type === 'full-time');
  
  const currentMonthlyJobs = fullTimeCompanies
    .filter(c => !excludedIds.includes(c.id))
    .reduce((acc, c) => {
        const days = (c.workDays && c.workDays.length > 0) ? c.workDays.length : 5;
        return acc + (Number(c.rate) * (days * 8) * 4);
    }, 0);

  const currentDailyBurn = budgets
    .filter(b => !excludedIds.includes(b.id))
    .reduce((acc, b) => acc + (Number(b.limit) || 0), 0) / 30;

  const currentMonthlySubs = subscriptions
    .filter(s => !excludedIds.includes(s.id))
    .reduce((acc, s) => acc + Number(s.price), 0);

  const currentMonthlyGoals = goals
    .filter(g => !excludedIds.includes(g.id))
    .reduce((acc, g) => acc + Number(g.installment) * (g.frequency === 'weekly' ? 4 : (g.frequency === 'biweekly' ? 2 : 1)), 0);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2"><TrendingUp className="text-blue-500"/> Proyección Financiera</h2>
                    <p className={`text-xs ${subTextClass}`}>Simulación interactiva de escenarios</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} cursor-pointer ${excludedIds.includes('manual_extra_income') ? 'opacity-50 grayscale' : ''}`}>
                        <button onClick={() => toggleFilter('manual_extra_income')} className={`mr-1 ${excludedIds.includes('manual_extra_income') ? 'text-slate-400' : 'text-emerald-500'}`}><Power size={12}/></button>
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
            <div className={`p-4 border-b flex justify-between items-center ${borderClass}`}>
                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <button onClick={() => setActiveTab('summary')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'summary' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}><PieChart size={14}/> Resumen</button>
                    <button onClick={() => setActiveTab('details')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'details' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}><List size={14}/> Desglose</button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors text-slate-400"><X size={20}/></button>
            </div>

            {/* TAB: RESUMEN */}
            {activeTab === 'summary' && (
                <div className="flex-1 p-6 flex flex-col gap-8 animate-in slide-in-from-right-4 overflow-y-auto">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Balance Inicial</span>
                        <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(startBalance)}</p>
                    </div>
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 animate-in slide-in-from-right-4 relative">
                    
                    {/* BOTÓN ACTIVAR/DESACTIVAR TODO */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[10px] font-black uppercase text-slate-400">Factores Recurrentes</h3>
                        <button 
                            onClick={toggleAll} 
                            className={`text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-all ${excludedIds.length > 0 ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Layers size={10}/> {excludedIds.length > 0 ? 'Activar Todo' : 'Desactivar Todo'}
                        </button>
                    </div>

                    {/* 1. TRABAJOS FULL-TIME */}
                    <SummaryCard 
                        title="Ingresos Laborales" 
                        subtitle="Proyección mensual" 
                        amount={currentMonthlyJobs} 
                        isPositive={true}
                        icon={Briefcase} 
                        colorClass="text-blue-500"
                        bgIconClass={darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}
                        isOpen={expandedSections.jobs}
                        onToggle={() => toggleSection('jobs')}
                        darkMode={darkMode}
                    >
                        {fullTimeCompanies.length === 0 && <p className="text-[9px] text-slate-400 italic p-2">No hay trabajos registrados</p>}
                        {fullTimeCompanies.map(comp => {
                            const days = (comp.workDays && comp.workDays.length > 0) ? comp.workDays.length : 5;
                            return (
                                <FilterItem 
                                    key={comp.id} 
                                    id={comp.id} 
                                    name={comp.name} 
                                    value={`+${formatCurrency(Number(comp.rate) * days * 8 * 4)} /mes`} 
                                    isExcluded={excludedIds.includes(comp.id)} 
                                    onToggle={() => toggleFilter(comp.id)}
                                    colorClass="text-blue-500"
                                    darkMode={darkMode}
                                />
                            );
                        })}
                    </SummaryCard>

                    {/* 2. PRESUPUESTOS (CON MENSUAL ABAJO) */}
                    <SummaryCard 
                        title="Gasto Diario (Presupuesto)" 
                        subtitle="Consumo base por día" 
                        amount={currentDailyBurn} 
                        secondaryAmount={currentDailyBurn * 30} // <--- NUEVO: Valor Mensual
                        isPositive={false}
                        suffix="/ día"
                        icon={TrendingDown} 
                        colorClass="text-rose-500"
                        bgIconClass={darkMode ? 'bg-rose-900/30' : 'bg-rose-100'}
                        isOpen={expandedSections.budgets}
                        onToggle={() => toggleSection('budgets')}
                        darkMode={darkMode}
                    >
                        {budgets.map(b => (
                            <FilterItem 
                                key={b.id} 
                                id={b.id} 
                                name={b.category} 
                                value={`-${formatCurrency(Number(b.limit)/30)} /día`} 
                                isExcluded={excludedIds.includes(b.id)} 
                                onToggle={() => toggleFilter(b.id)}
                                colorClass="text-rose-500"
                                darkMode={darkMode}
                            />
                        ))}
                    </SummaryCard>

                    {/* 3. SUSCRIPCIONES */}
                    <SummaryCard 
                        title="Suscripciones" 
                        subtitle="Gastos fijos" 
                        amount={currentMonthlySubs} 
                        isPositive={false}
                        icon={Zap} 
                        colorClass="text-purple-500"
                        bgIconClass={darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}
                        isOpen={expandedSections.subs}
                        onToggle={() => toggleSection('subs')}
                        darkMode={darkMode}
                    >
                        {subscriptions.map(s => (
                            <FilterItem 
                                key={s.id} 
                                id={s.id} 
                                name={s.name} 
                                value={`-${formatCurrency(s.price)} /mes`} 
                                isExcluded={excludedIds.includes(s.id)} 
                                onToggle={() => toggleFilter(s.id)}
                                colorClass="text-purple-500"
                                darkMode={darkMode}
                            />
                        ))}
                    </SummaryCard>

                    {/* 4. METAS (CON CUOTAS RESTANTES) */}
                    <SummaryCard 
                        title="Ahorro Metas" 
                        subtitle="Deducciones programadas" 
                        amount={currentMonthlyGoals} 
                        isPositive={false}
                        icon={Target} 
                        colorClass="text-orange-500"
                        bgIconClass={darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}
                        isOpen={expandedSections.goals}
                        onToggle={() => toggleSection('goals')}
                        darkMode={darkMode}
                    >
                        {goals.map(g => {
                            // Cálculo de cuotas restantes
                            const remaining = Math.max(0, Number(g.target) - Number(g.saved));
                            const installmentsLeft = Math.ceil(remaining / (Number(g.installment) || 1));
                            
                            return (
                                <FilterItem 
                                    key={g.id} 
                                    id={g.id} 
                                    name={g.name}
                                    subLabel={installmentsLeft > 0 ? `Faltan ${installmentsLeft} cuotas` : 'Completada'} 
                                    value={`-${formatCurrency(g.installment)} /${g.frequency === 'weekly' ? 'sem' : 'mes'}`} 
                                    isExcluded={excludedIds.includes(g.id)} 
                                    onToggle={() => toggleFilter(g.id)}
                                    colorClass="text-orange-500"
                                    darkMode={darkMode}
                                />
                            );
                        })}
                    </SummaryCard>

                    {/* EVENTOS */}
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 mt-4 pl-1">Línea de Tiempo</h3>
                    {daysWithEvents.map((day, idx) => {
                        const specificLogs = day.logs.filter(l => l.type !== 'daily'); 
                        if (specificLogs.length === 0) return null;
                        return (
                            <div key={idx} className={`p-2 rounded-xl border mb-2 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-dashed border-slate-200 dark:border-slate-700">
                                    <Calendar size={10} className="text-blue-500"/>
                                    <span className={`text-[9px] font-bold uppercase ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{new Date(day.date.split('-')[0], day.date.split('-')[1]-1, day.date.split('-')[2]).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                </div>
                                {specificLogs.map((log, lIdx) => (
                                    <div key={lIdx} className="flex justify-between text-[9px] mb-1">
                                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{log.name}</span>
                                        <span className={`font-bold ${log.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{log.amount > 0 ? '+' : ''}{formatCurrency(log.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ACTUALIZADOS ---

const SummaryCard = ({ title, subtitle, amount, secondaryAmount, isPositive, suffix, icon: Icon, colorClass, bgIconClass, isOpen, onToggle, children, darkMode }) => (
    <div className={`rounded-xl border transition-all mb-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="p-3 flex items-center justify-between cursor-pointer" onClick={onToggle}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bgIconClass} ${colorClass}`}><Icon size={16}/></div>
                <div>
                    <p className={`text-[10px] font-black uppercase ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{title}</p>
                    <p className="text-[9px] text-slate-400">{subtitle}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? '+' : '-'}{formatCurrency(amount)}<span className="text-[9px] text-slate-400 font-bold ml-1">{suffix || '/ mes'}</span>
                    </p>
                    {isOpen ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                </div>
                {/* VALOR SECUNDARIO (Mensual para presupuestos) */}
                {secondaryAmount && (
                    <p className="text-[9px] font-bold text-slate-400 opacity-80 mt-0.5">
                        ≈ {formatCurrency(secondaryAmount)} / mes
                    </p>
                )}
            </div>
        </div>
        {isOpen && <div className={`px-3 pb-3 pt-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'} animate-in slide-in-from-top-2`}>
            {children}
        </div>}
    </div>
);

const FilterItem = ({ id, name, subLabel, value, isExcluded, onToggle, colorClass, darkMode }) => (
    <div onClick={onToggle} className={`flex justify-between items-center p-2 rounded-lg text-[10px] cursor-pointer transition-all mt-1 hover:bg-slate-100 dark:hover:bg-slate-700 ${isExcluded ? 'opacity-40 grayscale' : ''}`}>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${isExcluded ? 'bg-slate-400 shadow-none' : (colorClass.includes('rose') ? 'bg-rose-500' : colorClass.includes('blue') ? 'bg-blue-500' : colorClass.includes('purple') ? 'bg-purple-500' : 'bg-orange-500')}`}></div>
            <div className="flex flex-col">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{name}</span>
                {subLabel && <span className="text-[8px] text-slate-400 font-medium">{subLabel}</span>}
            </div>
        </div>
        <span className={`font-bold ${isExcluded ? 'text-slate-400 line-through' : colorClass}`}>{value}</span>
    </div>
);