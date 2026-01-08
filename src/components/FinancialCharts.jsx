import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';

export const FinancialCharts = () => {
  const { filteredExpenses, themeColor, darkMode, dateFilter } = useFinancial();

  // 1. PROCESAR DATOS PARA DONA (Agrupado por Categoría)
  const pieData = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, curr) => {
      const cat = curr.category || 'Varios';
      const existing = acc.find(item => item.name === cat);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        acc.push({ name: cat, value: Number(curr.amount) });
      }
      return acc;
    }, []);
    // Ordenar mayor a menor y tomar top 5
    return grouped.sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // 2. PROCESAR DATOS PARA TENDENCIA (Ordenado por Fecha)
  const trendData = useMemo(() => {
    // Agrupar por día para que la gráfica no se vea rara si hay varios gastos el mismo día
    const groupedByDate = filteredExpenses.reduce((acc, curr) => {
        const date = curr.date.substring(5); // MM-DD para ahorrar espacio
        const existing = acc.find(item => item.date === date);
        if (existing) existing.amount += Number(curr.amount);
        else acc.push({ date: date, amount: Number(curr.amount), fullDate: curr.date });
        return acc;
    }, []);
    
    return groupedByDate.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  }, [filteredExpenses]);

  // Colores vibrantes para la gráfica
  const COLORS = [
    themeColor, 
    '#8b5cf6', // Violeta
    '#10b981', // Esmeralda
    '#f59e0b', // Ambar
    '#ec4899', // Rosa
    '#6366f1'  // Indigo
  ];

  // Si no hay datos, mostrar estado vacío
  if (filteredExpenses.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center min-h-[300px] opacity-70">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
          <PieIcon size={32} className="text-slate-400" />
        </div>
        <p className="text-sm font-bold text-slate-500">Sin datos en este periodo</p>
        <p className="text-[10px] text-slate-400">Intenta cambiar el filtro de fecha</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col min-h-[320px]">
      <div className="flex justify-between items-start mb-2">
        <div>
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
             <PieIcon size={14}/> Distribución
           </h3>
           <p className="text-[9px] font-bold text-slate-400 mt-1">
             {dateFilter.mode === 'all' ? 'Histórico' : dateFilter.value}
           </p>
        </div>
        {/* Total del periodo */}
        <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block">Total Gastado</span>
            <span className="text-lg font-black text-rose-500">
                {formatCurrency(filteredExpenses.reduce((a, b) => a + Number(b.amount), 0))}
            </span>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: darkMode ? '#1e293b' : '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: darkMode ? '#fff' : '#1e293b',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
              itemStyle={{ color: darkMode ? '#fff' : '#1e293b' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Texto central en la dona (opcional, visualmente agradable) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="text-center">
              <span className="text-2xl font-black text-slate-300 dark:text-slate-700 block">
                 {pieData.length}
              </span>
              <span className="text-[8px] font-bold uppercase text-slate-400">Cats</span>
           </div>
        </div>
      </div>

      {/* Leyenda Personalizada */}
      <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
        {pieData.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold truncate text-slate-600 dark:text-slate-300">{item.name}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{Math.round((item.value / filteredExpenses.reduce((a,b)=>a+Number(b.amount),0))*100)}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};