import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ComposedChart, Line, Area, Legend, AreaChart
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';
import { PieChart as PieIcon, BarChart3, TrendingUp, ChevronLeft, ChevronRight, AlertCircle, Maximize2 } from 'lucide-react';

export const FinancialCharts = ({ onOpenProjection }) => {
  const { chartExpenses, chartIncomes, themeColor, darkMode, dateFilter, selectedCategory, setSelectedCategory, calculateProjection } = useFinancial();
  const [chartIndex, setChartIndex] = useState(0);
  
  // Estado local para ingreso manual en la gráfica pequeña
  const [weeklyIncome, setWeeklyIncome] = useState('');

  // --- DATOS ---
  const expenseData = useMemo(() => {
    const grouped = chartExpenses.reduce((acc, curr) => {
      const cat = curr.category || 'Varios';
      const existing = acc.find(item => item.name === cat);
      if (existing) existing.value += Number(curr.amount);
      else acc.push({ name: cat, value: Number(curr.amount) });
      return acc;
    }, []);
    return grouped.sort((a, b) => b.value - a.value);
  }, [chartExpenses]);

  const incomeData = useMemo(() => {
    const grouped = chartIncomes.reduce((acc, curr) => {
      const cat = curr.category || curr.name || 'Otros';
      const existing = acc.find(item => item.name === cat);
      if (existing) existing.value += Number(curr.amount);
      else acc.push({ name: cat, value: Number(curr.amount) });
      return acc;
    }, []);
    return grouped.sort((a, b) => b.value - a.value);
  }, [chartIncomes]);

  const trendData = useMemo(() => {
    const allDates = new Set([...chartExpenses.map(e => e.date), ...chartIncomes.map(i => i.date)]);
    const timeline = Array.from(allDates).sort().map(date => {
        const dayExpenses = chartExpenses.filter(e => e.date === date).reduce((sum, e) => sum + Number(e.amount), 0);
        const dayIncomes = chartIncomes.filter(i => i.date === date).reduce((sum, i) => sum + Number(i.amount), 0);
        return {
            date, dayName: new Date(date).getDate(),
            expense: dayExpenses, income: dayIncomes, net: dayIncomes - dayExpenses
        };
    });
    let accumulator = 0;
    return timeline.map(day => { accumulator += day.net; return { ...day, balance: accumulator }; });
  }, [chartExpenses, chartIncomes]);

  // Proyección de 30 días usando el input manual
  const projectionData = useMemo(() => {
      return calculateProjection(1, Number(weeklyIncome) || 0);
  }, [weeklyIncome, calculateProjection]);

  // --- CONFIG VISTAS ---
  const views = [
    { id: 'expenses', title: 'Gastos por Categoría', icon: <PieIcon size={14}/>, data: expenseData, totalLabel: 'Total Gastado' },
    { id: 'incomes', title: 'Fuentes de Ingreso', icon: <BarChart3 size={14}/>, data: incomeData, totalLabel: 'Total Ingresado' },
    { id: 'trend', title: 'Balance y Tendencia', icon: <TrendingUp size={14}/>, data: trendData, totalLabel: 'Flujo Neto' },
    { id: 'projection', title: 'Proyección (30 Días)', icon: <TrendingUp size={14}/>, data: projectionData, totalLabel: 'Estimado Final' }
  ];

  const currentView = views[chartIndex];
  
  // TOTALES
  const currentTotal = useMemo(() => {
      if(chartIndex === 0) return chartExpenses.reduce((a,b)=>a+Number(b.amount),0);
      if(chartIndex === 1) return chartIncomes.reduce((a,b)=>a+Number(b.amount),0);
      if(chartIndex === 2) return chartIncomes.reduce((a,b)=>a+Number(b.amount),0) - chartExpenses.reduce((a,b)=>a+Number(b.amount),0);
      if(chartIndex === 3 && projectionData.length > 0) return projectionData[projectionData.length -1].balance;
      return 0;
  }, [chartIndex, chartExpenses, chartIncomes, projectionData]);

  const nextChart = () => setChartIndex((prev) => (prev + 1) % views.length);
  const prevChart = () => setChartIndex((prev) => (prev - 1 + views.length) % views.length);

  const COLORS = [themeColor, '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4'];

  const handleSliceClick = (data) => {
      if (selectedCategory === data.name) setSelectedCategory(null);
      else setSelectedCategory(data.name);
  };

  const renderContent = () => {
    // Si no hay datos (excepto en proyección que siempre genera algo)
    if (chartIndex !== 3 && (!currentView.data || currentView.data.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <AlertCircle size={48} strokeWidth={1.5} className="mb-2"/>
                <p className="text-xs font-bold uppercase">Sin datos</p>
            </div>
        );
    }

    switch (chartIndex) {
      case 0: // DONA
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenseData} innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none" onClick={handleSliceClick} cursor="pointer">
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1} stroke={selectedCategory === entry.name ? darkMode ? '#fff' : '#000' : 'none'} strokeWidth={2}/>
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', color: darkMode ? '#fff' : '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 1: // BARRAS
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData} layout="vertical" margin={{ left: 0, right: 20, top: 40, bottom: 0 }}>
              <defs><linearGradient id="incGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/><stop offset="100%" stopColor="#10b981" stopOpacity={1}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false}/>
              <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', color: darkMode ? '#fff' : '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} fill="url(#incGrad)" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 2: // TENDENCIA
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
              <defs><linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/><stop offset="95%" stopColor={themeColor} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="dayName" tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(d) => `Día ${d}`} formatter={(value, name) => [formatCurrency(value), name === 'balance' ? 'Balance' : name === 'income' ? 'Ing.' : 'Gas.']} contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', color: darkMode ? '#fff' : '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="balance" fill="url(#balGrad)" stroke={themeColor} strokeWidth={3} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 3: // PROYECCIÓN (ÁREA SIMPLE)
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 50, right: 10, bottom: 0, left: -20 }}>
              <defs><linearGradient id="projSimGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={themeColor} stopOpacity={0.4}/><stop offset="95%" stopColor={themeColor} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate()} tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} formatter={(value) => [formatCurrency(value), 'Estimado']} contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', color: darkMode ? '#fff' : '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="balance" stroke={themeColor} strokeWidth={3} fill="url(#projSimGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default: return null;
    }
  };

  return (
    <Card className="h-full flex flex-col min-h-[340px] relative group transition-all duration-500">
      <div className="flex justify-between items-start mb-4">
        <div>
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
             {currentView.icon} {currentView.title}
           </h3>
           <p className="text-[9px] font-bold text-slate-400 mt-1">
             {dateFilter.mode === 'all' ? 'Histórico Completo' : dateFilter.value}
             {selectedCategory && <span className="ml-2 text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">Filtro: {selectedCategory}</span>}
           </p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1 shadow-inner border border-slate-200 dark:border-slate-700">
            <button onClick={prevChart} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white"><ChevronLeft size={14} strokeWidth={2.5}/></button>
            <div className="flex gap-1.5 px-1">{views.map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === chartIndex ? 'scale-125' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ backgroundColor: i === chartIndex ? themeColor : undefined }} />))}</div>
            <button onClick={nextChart} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white"><ChevronRight size={14} strokeWidth={2.5}/></button>
        </div>
      </div>

      {/* CONTROLES OVERLAY PARA PROYECCIÓN */}
      {chartIndex === 3 && (
          <div className="absolute top-10 left-0 right-0 z-10 flex justify-center gap-2 animate-in slide-in-from-top-2 px-4">
              <input 
                type="number"
                placeholder="Ingreso $/sem"
                className={`w-28 px-2 py-1 rounded-lg text-[9px] font-bold border shadow-sm outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                value={weeklyIncome}
                onChange={(e) => setWeeklyIncome(e.target.value)}
              />
              <button 
                onClick={onOpenProjection}
                className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide bg-blue-500 text-white shadow-md hover:scale-105 transition-transform flex items-center gap-1"
              >
                  <Maximize2 size={10}/> Agrandar
              </button>
          </div>
      )}

      <div className="flex-1 w-full relative animate-in zoom-in-95 duration-500">
        {renderContent()}
        
        {/* TOTAL CENTRO (Dona) */}
        {chartIndex === 0 && currentView.data && currentView.data.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</span>
                <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(currentTotal)}</span>
                {selectedCategory && <span className="text-[9px] text-blue-500 font-bold mt-1">(Filtrado)</span>}
            </div>
        )}

        {/* TOTAL FLOTANTE (Para el resto) */}
        {chartIndex !== 0 && (
            <div className="absolute -top-2 right-0 text-right pointer-events-none">
                <span className="text-[8px] font-bold text-slate-400 block uppercase">{currentView.totalLabel}</span>
                <span className={`text-xl font-black ${chartIndex === 1 ? 'text-emerald-500' : 'text-slate-700 dark:text-white'}`}>{formatCurrency(currentTotal)}</span>
            </div>
        )}
      </div>

      {/* LEYENDA (Dona) */}
      {chartIndex === 0 && currentView.data && currentView.data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
            {expenseData.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center justify-between cursor-pointer hover:opacity-70" onClick={() => handleSliceClick(item)}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${selectedCategory === item.name ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}`} style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className={`text-[10px] font-bold truncate ${selectedCategory === item.name ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}>{item.name}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{Math.round((item.value / currentTotal) * 100)}%</span>
            </div>
            ))}
        </div>
      )}
    </Card>
  );
};