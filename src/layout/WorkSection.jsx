import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Plus, ChevronUp, ChevronDown, Minus, Maximize2, CheckCircle2, Clock, MapPin, Edit3, Trash2, Building2, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Minimize2, TrendingUp, CalendarDays, X, Wallet, Copy, Banknote, Hourglass } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

/* RECOMENDACIONES
import { formatDate, formatDateSafe, getMonthName, getYear } from '../utils/dateUtils';
import { Calendar } from '../components/Calendar';
import { WorkLogForm } from '../components/WorkLogForm';
import { CompanyForm } from '../components/CompanyForm';
import { WorkLogCard } from '../components/WorkLogCard';
import { CompanyCard } from '../components/CompanyCard';
import { WorkLogModal } from '../components/WorkLogModal';
import { CompanyModal } from '../components/CompanyModal';
import { WorkLogCalendar } from '../components/WorkLogCalendar';
import { WorkLogList } from '../components/WorkLogList';
import { CompanyList } from '../components/CompanyList'; */

export const WorkSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd, onEdit, onAddCompany, onEditCompany }) => {
  const { workLogs, companies, markWorkAsPaid, unmarkWorkAsPaid, wallets, themeColor, darkMode, deleteWorkLog, deleteCompany, isAllExpanded, payWorkLogs, calculatePayDate} = useFinancial();
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    setIsExpanded(isAllExpanded);
  }, [isAllExpanded]);

  const [isMaximized, setIsMaximized] = useState(false);
  
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('logs');
  const [viewType, setViewType] = useState('list'); // Default a lista para ver mejor los detalles
  const [calScope, setCalScope] = useState('month'); 
  const [listSort, setListSort] = useState('date-desc');
  const [payingLogId, setPayingLogId] = useState(null); 

  const [currentDate, setCurrentDate] = useState(new Date());

  // --- 1. FUNCIÓN PARA CORREGIR EL ERROR DE FECHA (ZONA HORARIA) ---
  const formatDateSafe = (dateStr) => {
      if (!dateStr) return { dayName: '', dayNum: '', fullDate: new Date() };
      // "2026-01-12" -> [2026, 1, 12]
      const [year, month, day] = dateStr.split('-').map(Number);
      // Creamos la fecha localmente (Mes es index 0 en JS, por eso month - 1)
      const localDate = new Date(year, month - 1, day);
      
      const dayName = localDate.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
      const dayNum = localDate.getDate();
      
      return { dayName, dayNum, fullDate: localDate };
  };
  
  // --- 2. CÁLCULOS DE ESTADO (REAL vs PROYECTADO) ---
  const todayStr = new Date().toISOString().split('T')[0]; // Fecha hoy YYYY-MM-DD

  // Filtramos solo los pendientes
  const pendingLogs = useMemo(() => workLogs.filter(log => log.status === 'pending'), [workLogs]);

  // Calculamos los totales separados
  const totals = useMemo(() => {
      let earned = 0;    // Ya trabajados (Real)
      let projected = 0; // Futuros (Esperado)

      pendingLogs.forEach(log => {
          // Si la fecha es menor a hoy, ya se trabajó
          if (log.workDate < todayStr) {
              earned += Number(log.total);
          } else {
              projected += Number(log.total);
          }
      });

      return { earned, projected, total: earned + projected };
  }, [pendingLogs, todayStr]);
  
  const getCompanyDebt = (companyId) => pendingLogs.filter(log => log.companyId === companyId).reduce((acc, log) => acc + Number(log.total), 0);
  
  // --- CÁLCULO PRODUCCIÓN MES (MEJORADO: Proyección para Full-Time) ---
  const getCompanyMonthProduction = (companyId) => {
      const comp = companies.find(c => c.id === companyId);
      if (!comp) return 0;

      // CASO 1: PART-TIME (Suma real de lo trabajado)
      if (comp.type !== 'full-time') {
          const currentMonthStr = new Date().toISOString().slice(0, 7);
          return workLogs
              .filter(log => log.companyId === companyId && log.workDate.startsWith(currentMonthStr))
              .reduce((acc, log) => acc + Number(log.total), 0);
      } 
      
      // CASO 2: FULL-TIME (Proyección estimada)
      // Calculamos: Tarifa * Horas Semanales * 4 Semanas
      const rate = Number(comp.rate || 0);
      
      // Intentamos calcular las horas semanales según tus datos
      // Si tienes un array de días (workDays), asumimos 8h por día. Si no, 40h default.
      let weeklyHours = 40; 
      if (comp.workDays && Array.isArray(comp.workDays)) {
          weeklyHours = comp.workDays.length * 8;
      }
      
      // Retornamos la proyección mensual
      return rate * weeklyHours * 4; 
  };

// --- COBRAR MÚLTIPLES TURNOS (Genera Ingreso + Actualiza Saldos + Marca Pagados) ---
  // Esta función es la que llama tu botón "Confirmar" del modal
const handleConfirmPayment = () => {
    if (!selectedWalletId) {
        alert("Por favor selecciona una cuenta");
        return;
    }

    // 'dayLogs' son los turnos que estás viendo en ese día y quieres cobrar
    // Filtramos solo los que estén 'pending' para no cobrar doble por error
    const pendingLogs = dayLogs.filter(log => log.status === 'pending');

    if (pendingLogs.length === 0) {
        alert("No hay turnos pendientes por cobrar en este día.");
        return;
    }

    // ¡Aquí ocurre la magia!
    payWorkLogs(pendingLogs, selectedWalletId);
    
    // Cierras el modal
    setIsPaymentModalOpen(false);
};



  // --- LOGICA PESTAÑA PAGOS (AGRUPACIÓN POR FECHA) ---
  const upcomingPayments = useMemo(() => {
      const groups = {};
      
      pendingLogs.forEach(log => {
        // 1. INTENTAMOS OBTENER LA FECHA
        let dateKey = log.paymentDate; 
          
        // 2. SI ES NULL (Porque acabas de desmarcarlo), LA CALCULAMOS
          if (!dateKey) {
              const company = companies.find(c => c.id === log.companyId);
              // Usamos la función inteligente del contexto para saber cuándo toca pagar
              dateKey = calculatePayDate(log.workDate, company);
          }
          // Si por alguna razón sigue fallando, usamos la fecha de trabajo como fallback
          if (!dateKey) dateKey = log.workDate;
          if (!groups[dateKey]) {
              groups[dateKey] = {
                  date: dateKey,
                  total: 0,
                  count: 0,
                  logs: [],
                  companies: new Set()
              };
          }
          groups[dateKey].total += Number(log.total);
          groups[dateKey].count += 1;
          groups[dateKey].logs.push(log);
          groups[dateKey].companies.add(log.companyName);
      });

      return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [pendingLogs]);

  // --- GENERADOR DE CALENDARIO ---
  const calendarDays = useMemo(() => {
      const days = [];
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      if (calScope === 'week') {
          const day = currentDate.getDay();
          const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Lunes
          const monday = new Date(new Date(currentDate).setDate(diff));
          for (let i = 0; i < 7; i++) {
              const d = new Date(monday);
              d.setDate(monday.getDate() + i);
              days.push({ date: d, isCurrentMonth: true });
          }
      } else {
          // Mes (42 días fijos)
          const firstDayOfMonth = new Date(year, month, 1);
          const startDay = firstDayOfMonth.getDay(); 
          const diff = startDay === 0 ? 6 : startDay - 1; 
          
          const startDate = new Date(year, month, 1 - diff);
          for (let i = 0; i < 42; i++) {
              const d = new Date(startDate);
              d.setDate(startDate.getDate() + i);
              days.push({ date: d, isCurrentMonth: d.getMonth() === month });
          }
      }
      return days;
  }, [currentDate, calScope]);

  // --- CÁLCULO TOTALES VISTA CALENDARIO ---
  const currentViewTotal = useMemo(() => {
      if (calScope === 'week') {
          const start = calendarDays[0]?.date;
          const end = calendarDays[6]?.date;
          if (!start || !end) return 0;
          
          const startTs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
          const endTs = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();

          return workLogs.filter(log => {
              const [y, m, d] = log.workDate.split('-').map(Number);
              const logTs = new Date(y, m - 1, d).getTime();
              return logTs >= startTs && logTs <= endTs;
          }).reduce((acc, log) => acc + Number(log.total), 0);

      } else {
          const targetMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
          const targetYear = String(currentDate.getFullYear());
          const targetPrefix = `${targetYear}-${targetMonth}`;
          return workLogs.filter(log => log.workDate.startsWith(targetPrefix))
                         .reduce((acc, log) => acc + Number(log.total), 0);
      }
  }, [currentDate, calScope, workLogs, calendarDays]);

  // Funciones Auxiliares
  const changeDate = (direction) => {
      const newDate = new Date(currentDate);
      if (calScope === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
      else newDate.setMonth(newDate.getMonth() + direction);
      setCurrentDate(newDate);
  };

  const isToday = (date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const formatDateKey = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
  };
  
  const dateLabel = calScope === 'week' 
      ? `Semana ${calendarDays[0]?.date.getDate()} - ${calendarDays[6]?.date.getDate()}`
      : currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const sortedListLogs = useMemo(() => {
      return [...workLogs].sort((a, b) => {
          if (listSort === 'date-desc') return new Date(b.workDate) - new Date(a.workDate);
          if (listSort === 'date-asc') return new Date(a.workDate) - new Date(b.workDate);
          if (listSort === 'amount-desc') return b.total - a.total;
          return 0;
      });
  }, [workLogs, listSort]);

  const handlePay = (log, walletId) => {
      if (!walletId) return;
      // Si selecciona "Ninguna", enviamos null (o el valor que prefieras para no afectar saldo)
      const finalWalletId = walletId === 'NONE' ? null : walletId;
      markWorkAsPaid(log, finalWalletId);
      setPayingLogId(null);
  };

  const handlePayGroup = (paymentGroup, walletId) => {
      if (!walletId) return;
      const finalWalletId = walletId === 'NONE' ? null : walletId;
      // Si usas payWorkLogs, asegúrate de que soporte null, si no, iteramos manual:
      if (finalWalletId === null) {
          // Si es Ninguna, marcamos uno por uno sin afectar saldo global masivo
          paymentGroup.logs.forEach(log => markWorkAsPaid(log, null));
      } else {
          payWorkLogs(paymentGroup.logs, finalWalletId);
      }
      setPayingLogId(null);
  };

  const handleDateClick = (dateStr) => {
      onEdit({ id: null, workDate: dateStr, status: 'new_entry' }); 
  };

  const handleCopyLog = (originalLog) => {
      const logCopy = { ...originalLog, id: null, status: 'pending', paymentDate: '' };
      onEdit(logCopy);
  };

  // --- RENDERIZADO DEL CONTENIDO ---
  const WorkContent = ({ isLarge }) => (
    <div className={`flex flex-col h-full ${isLarge ? 'p-6' : ''}`}>
        
        {/* HEADER CON NUEVOS TOTALES DESGLOSADOS */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2 shrink-0">
            {/* TABS */}
            <div className="flex w-full p-1 rounded-xl mb-4" style={{ backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }}> {/* Forzamos el fondo del contenedor (Gris claro en Light / Gris oscuro en Dark) */}
                {/* TAB: TURNOS */}
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] uppercase transition-all ${
                        activeTab === 'logs' 
                            ? 'shadow-sm font-black' 
                            : 'text-slate-400 font-bold hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                    style={{ 
                        color: activeTab === 'logs' ? themeColor : undefined,
                        backgroundColor: activeTab === 'logs' 
                            ? (darkMode ? `${themeColor}15` : '#ffffff') 
                            : 'transparent'
                    }}
                >
                    <Clock size={12} className="shrink-0"/> Turnos
                </button>

                {/* TAB: PAGOS */}
                <button 
                    onClick={() => setActiveTab('payments')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] uppercase transition-all ${
                        activeTab === 'payments' 
                            ? 'shadow-sm font-black' 
                            : 'text-slate-400 font-bold hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                    style={{ 
                        color: activeTab === 'payments' ? themeColor : undefined,
                        backgroundColor: activeTab === 'payments' 
                            ? (darkMode ? `${themeColor}15` : '#ffffff') 
                            : 'transparent'
                    }}
                >
                    <Banknote size={12} className="shrink-0"/> Pagos
                </button>

                {/* TAB: EMPRESAS */}
                <button 
                    onClick={() => setActiveTab('companies')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] uppercase transition-all ${
                        activeTab === 'companies' 
                            ? 'shadow-sm font-black' 
                            : 'text-slate-400 font-bold hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                    style={{ 
                        color: activeTab === 'companies' ? themeColor : undefined,
                        backgroundColor: activeTab === 'companies' 
                            ? (darkMode ? `${themeColor}15` : '#ffffff') 
                            : 'transparent'
                    }}
                >
                    <Building2 size={12} className="shrink-0"/> Empresas
                </button>
            </div>

            {(activeTab === 'logs' || activeTab === 'payments') && (
                <div className="flex gap-2 items-center">
                    <div className={`flex p-1 rounded-xl`}>
                        <button onClick={() => setViewType('calendar')} className={`p-1.5 rounded-lg transition-all') : 'text-slate-400'}`}><CalendarIcon size={14}/></button>
                        <button onClick={() => setViewType('list')} className={`p-1.5 rounded-lg transition-all `}><List size={14}/></button>
                    </div>

                    {viewType === 'calendar' && (
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-xl border`}>
                            <button onClick={() => changeDate(-1)} className="text-slate-400 hover:text-slate-600"><ChevronLeft size={14}/></button>
                            <span className="text-[10px] font-bold w-24 text-center capitalize truncate">{dateLabel}</span>
                            <button onClick={() => changeDate(1)} className="text-slate-400 hover:text-slate-600"><ChevronRight size={14}/></button>
                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button onClick={() => setCalScope('week')} className={`text-[9px] font-bold uppercase ${calScope === 'week' ? 'text-blue-500' : 'text-slate-400'}`}>Sem</button>
                            <button onClick={() => setCalScope('month')} className={`text-[9px] font-bold uppercase ${calScope === 'month' ? 'text-blue-500' : 'text-slate-400'}`}>Mes</button>
                        </div>
                    )}
                </div>
            )}
            
            <button onClick={activeTab === 'logs' ? onAdd : onAddCompany} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:brightness-110 transition-all text-white shadow-sm text-[10px] font-bold uppercase" style={{ backgroundColor: themeColor }}>
                <Plus size={14}/> {isLarge ? (activeTab === 'logs' ? 'Registrar Turno' : 'Nueva Empresa') : ''}
            </button>
        </div>

        {/* --- VISTA CALENDARIO --- */}
        {activeTab === 'logs' && viewType === 'calendar' && (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <div className="min-w-[600px] h-full flex flex-col"> 
                        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                                <div key={day} className="text-center">
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isToday(calendarDays[i]?.date || new Date()) && calScope === 'week' ? 'text-blue-500' : 'text-slate-400'}`}>{day}</span>
                                </div>
                            ))}
                        </div>

                        <div className={`grid grid-cols-7 gap-[1px] border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-700 border-slate-700' : 'bg-slate-200 border-slate-200'} ${calScope === 'month' ? 'auto-rows-fr' : ''} ${calScope === 'month' && isLarge ? 'h-full' : ''}`}>
                            {calendarDays.map((item, i) => {
                                const dateKey = formatDateKey(item.date);
                                const daysLogs = workLogs.filter(log => log.workDate === dateKey);
                                const isCurrent = isToday(item.date);

                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => handleDateClick(dateKey)}
                                        className={`group/day relative flex flex-col p-1 transition-all cursor-pointer ${item.isCurrentMonth ? (darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-50') : (darkMode ? 'bg-slate-900/50 opacity-50' : 'bg-slate-50 opacity-60')} ${calScope === 'week' ? 'min-h-[140px]' : 'min-h-[90px]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1 px-1 pt-1">
                                            <span className={`text-[10px] font-bold ${isCurrent ? 'bg-blue-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm' : item.isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>{item.date.getDate()}</span>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDateClick(dateKey); }}
                                                className="opacity-0 group-hover/day:opacity-100 p-0.5 text-slate-400 hover:text-blue-500 transition-all"
                                            >
                                                <Plus size={12}/>
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-full px-1 pb-1">
                                            {daysLogs.map(log => (
                                                <div 
                                                    key={log.id}
                                                    className={`group relative p-1.5 rounded-md border text-[9px] cursor-pointer transition-all hover:z-20 hover:shadow-md ${log.status === 'paid' ? (darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400 grayscale') : (darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm')}`}
                                                    style={log.status === 'pending' ? { borderLeftWidth: '3px', borderLeftColor: themeColor } : { borderLeftWidth: '3px', borderLeftColor: '#cbd5e1' }}
                                                    onClick={(e) => { e.stopPropagation(); onEdit(log); }}
                                                >
                                                    <div className="flex justify-between font-bold truncate"><span>{log.companyName}</span></div>
                                                    {(isLarge || calScope === 'week') && (
                                                        <div className="flex justify-between mt-0.5 opacity-90">
                                                            <span className="text-slate-400">{log.hours}h</span>
                                                            <span className="font-bold">{formatCurrency(log.total)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <span className="text-[10px] text-slate-400">Total {calScope === 'week' ? 'Semana' : 'Mes'} Actual:</span>
                    <span className="text-sm font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-xl">
                        {formatCurrency(currentViewTotal)}
                    </span>
                </div>
            </div>
        )}

        {/* --- VISTA LISTA (ACTUALIZADA CON LÓGICA DE ESTADO) --- */}
        {activeTab === 'logs' && viewType === 'list' && (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-1">
                    {sortedListLogs.map(log => {
                        // USO DE LA FUNCIÓN SEGURA PARA FECHAS
                        const { dayName, dayNum } = formatDateSafe(log.workDate);
                        // LÓGICA DE COMPLETADO VS PLANEADO
                        const isCompleted = log.workDate < todayStr;
                        const isTodayLog = log.workDate === todayStr;
                        const isPaid = log.status === 'paid';

                        return (
                            <div 
                                key={log.id} 
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all group relative 
                                    ${isPaid 
                                        ? (darkMode ? 'bg-slate-800/50 border-slate-700 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60') 
                                        : (darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:shadow-md')}
                                `}
                                onClick={() => onEdit(log)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Caja de Fecha (Con color según estado) */}
                                    <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg 
                                        ${isPaid 
                                            ? (darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400') 
                                            : (isCompleted 
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                : (isTodayLog ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'))
                                        }`}>
                                        <span className="text-[8px] uppercase font-bold">{dayName}</span>
                                        <span className="text-xs font-black">{dayNum}</span>
                                    </div>
                                    
                                    {/* Info Principal */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{log.companyName}</p>
                                            
                                            {/* Badge de Estado */}
                                            {!isPaid && (
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1
                                                    ${isCompleted 
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}
                                                `}>
                                                    {isCompleted ? <CheckCircle2 size={8}/> : <Hourglass size={8}/>}
                                                    {isCompleted ? 'Por Cobrar' : 'Planeado'}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`flex gap-2 text-[9px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <span className="flex items-center gap-1"><Clock size={8}/> {log.hours}h</span>
                                            <span className="flex items-center gap-1"><MapPin size={8}/> {log.location || 'Remoto'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lado Derecho: Precios y Botones */}
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <span className={`block text-sm font-black ${isPaid ? 'text-slate-400' : (isCompleted ? 'text-emerald-600' : 'text-slate-400')}`}>
                                            {formatCurrency(log.total)}
                                        </span>
                                        <span className={`text-[8px] font-bold ${isPaid ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {/* Usamos formatDateSafe también para la fecha de cobro */}
                                            {isPaid 
                                                ? 'PAGADO' 
                                                : `Cobro: ${formatDateSafe(log.paymentDate).dayNum} ${formatDateSafe(log.paymentDate).dayName}`
                                            }
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => {e.stopPropagation(); handleCopyLog(log)}} className={`p-1.5 rounded hover:text-blue-500 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`} title="Duplicar"><Copy size={12}/></button>
                                        <button onClick={(e) => {e.stopPropagation(); onEdit(log)}} className={`p-1.5 rounded hover:text-blue-500 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}><Edit3 size={12}/></button>
                                        <button onClick={(e) => {e.stopPropagation(); deleteWorkLog(log.id)}} className={`p-1.5 rounded hover:text-rose-500 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}><Trash2 size={12}/></button>
                                        
                                        {/* Solo mostrar botón cobrar si ya se completó o está pagado */}
                                        {log.status === 'pending' ? (
                                            <button onClick={(e) => {e.stopPropagation(); setPayingLogId(log.id)}} className={`p-1.5 rounded hover:brightness-90 ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><CheckCircle2 size={12}/></button>
                                        ) : (
                                            <button onClick={(e) => {e.stopPropagation(); unmarkWorkAsPaid(log)}} className={`p-1.5 rounded hover:brightness-90 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}><X size={12}/></button>
                                        )}
                                    </div>
                                </div>

                                {/* Popup Depositar */}
                                {payingLogId === log.id && (
                                    <div className={`absolute right-14 top-1/2 -translate-y-1/2 z-[100] shadow-2xl p-3 rounded-xl border w-48 animate-in fade-in zoom-in ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
                                        <div className={`flex justify-between items-center mb-2 pb-1 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1"><Wallet size={10}/> Depositar en:</span>
                                            <button onClick={(e) => {e.stopPropagation(); setPayingLogId(null)}} className="text-slate-400 hover:text-rose-500"><X size={10}/></button>
                                        </div>
                                        <select className={`w-full text-[10px] p-2 rounded border outline-none cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} onChange={(e) => handlePay(log, e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus>
                                            <option value="">Seleccionar cuenta...</option><option value="NONE">Ninguna</option>{wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {sortedListLogs.length === 0 && <p className="text-center text-slate-400 text-xs py-8 italic">No hay turnos registrados</p>}
                </div>
            </div>
        )}
        
        {/* --- VISTA PAGOS (CALENDARIO) --- */}
        {activeTab === 'payments' && viewType === 'calendar' && (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <div className="min-w-[600px] h-full flex flex-col"> 
                        <div className={`grid grid-cols-7 border-b pb-2 mb-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                                <div key={day} className="text-center"><span className={`text-[9px] font-black uppercase tracking-wider ${isToday(calendarDays[i]?.date || new Date()) && calScope === 'week' ? 'text-blue-500' : 'text-slate-400'}`}>{day}</span></div>
                            ))}
                        </div>

                        <div className={`grid grid-cols-7 gap-[1px] border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-700 border-slate-700' : 'bg-slate-200 border-slate-200'} ${calScope === 'month' ? 'auto-rows-fr' : ''} ${calScope === 'month' && isLarge ? 'h-full' : ''}`}>
                            {calendarDays.map((item, i) => {
                                const dateKey = formatDateKey(item.date);
                                const dayPayments = upcomingPayments.filter(p => p.date === dateKey);
                                const isCurrent = isToday(item.date);

                                return (
                                    <div 
                                        key={i} 
                                        className={`group/day relative flex flex-col p-1 transition-all ${item.isCurrentMonth ? (darkMode ? 'bg-slate-900' : 'bg-white') : (darkMode ? 'bg-slate-900/50 opacity-50' : 'bg-slate-50 opacity-70')} ${calScope === 'week' ? 'min-h-[140px]' : 'min-h-[90px]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1 px-1 pt-1">
                                            <span className={`text-[10px] font-bold ${isCurrent ? 'bg-blue-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm' : item.isCurrentMonth ? (darkMode ? 'text-slate-300' : 'text-slate-700') : 'text-slate-400'}`}>{item.date.getDate()}</span>
                                        </div>

                                        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-full px-1 pb-1">
                                            {dayPayments.map(payment => (
                                                <div 
                                                    key={payment.id}
                                                    className={`relative p-2 rounded-lg border text-[9px] transition-all hover:scale-[1.02] hover:z-20 hover:shadow-md cursor-pointer ${darkMode ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-slate-700'}`}
                                                    onClick={() => setPayingLogId(payment.id)} 
                                                >
                                                    <div className="flex justify-between font-bold truncate items-center">
                                                        <span className="truncate flex-1">{payment.companies.size > 1 ? 'Varios' : [...payment.companies][0]}</span>
                                                        <span className={`font-black ml-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCurrency(payment.total)}</span>
                                                    </div>
                                                    
                                                    {payingLogId === payment.id && (
                                                        <div 
                                                            className={`absolute top-full left-0 right-0 z-50 p-2 mt-1 rounded-lg border shadow-xl animate-in zoom-in-95 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-[8px] font-bold opacity-70">Depositar:</span>
                                                                <X size={10} className="cursor-pointer" onClick={(e) => {e.stopPropagation();setPayingLogId(null)}}/>
                                                            </div>
                                                            <select 
                                                                className={`w-full text-[9px] p-1 rounded border outline-none ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                                                onChange={(e) => handlePayGroup(payment, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                autoFocus
                                                            >
                                                                <option value="">Cuenta...</option>
                                                                <option value="NONE">Ninguna</option>
                                                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        
        {/* --- VISTA PAGOS (LISTA) --- */}
        {activeTab === 'payments' && viewType === 'list' && (
            <div className="h-full overflow-y-auto custom-scrollbar p-1">
                <div className={`grid gap-3 ${isLarge ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    {upcomingPayments.map((group, idx) => {
                        const dateObj = new Date(group.date);
                        const dateLocal = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
                        
                        const daysLeft = Math.ceil((dateLocal - new Date()) / (1000 * 60 * 60 * 24));
                        const isToday = daysLeft === 0;
                        const isPast = daysLeft < 0;

                        return (
                            <div 
                                key={idx} 
                                className={`relative p-4 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold shadow-sm ${isToday ? 'bg-emerald-100 text-emerald-600' : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                            <span className="text-[9px] uppercase">{dateLocal.toLocaleDateString(undefined, {weekday:'short'})}</span>
                                            <span className="text-lg leading-none">{dateLocal.getDate()}</span>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {dateLocal.toLocaleDateString(undefined, {month:'long', year:'numeric'})}
                                            </p>
                                            <p className={`text-xs font-bold ${isToday ? 'text-emerald-500' : isPast ? 'text-rose-400' : 'text-blue-500'}`}>
                                                {isToday ? '¡Pagan Hoy!' : isPast ? `Hace ${Math.abs(daysLeft)} días` : `Faltan ${daysLeft} días`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[8px] font-bold uppercase block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total a Recibir</span>
                                        <span className="text-xl font-black text-emerald-500">{formatCurrency(group.total)}</span>
                                    </div>
                                </div>

                                <div className={`space-y-1 pt-2 border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                                    {[...group.companies].map(compName => (
                                        <div key={compName} className={`flex justify-between items-center text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                            <span className="flex items-center gap-1"><Building2 size={10}/> {compName}</span>
                                            <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {formatCurrency(group.logs.filter(l => l.companyName === compName).reduce((a,b)=>a+Number(b.total),0))}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    {payingLogId === group.date ? (
                                        <div className={`p-2 rounded-lg border animate-in fade-in relative z-50 ${darkMode ? 'bg-slate-900 border-emerald-900' : 'bg-slate-50 border-emerald-200'}`}>
                                            <div className="flex justify-between mb-1">
                                                <span className={`text-[8px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Depositar todo en:</span> 
                                                <X size={10} className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={(e) => {e.stopPropagation();setPayingLogId(null)}}/>
                                            </div>
                                            <select 
                                                className={`w-full text-[10px] p-1.5 rounded border outline-none cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`} 
                                                onChange={(e) => handlePayGroup(group, e.target.value)} 
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            >
                                                <option value="">Seleccionar cuenta...</option>
                                                <option value="NONE">Ninguna</option>
                                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setPayingLogId(group.date)} 
                                            className="w-full py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase hover:brightness-110 shadow-sm transition-all flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle2 size={12}/> Cobrar Todo el Día
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {upcomingPayments.length === 0 && (
                        <div className={`col-span-full text-center py-12 border-2 border-dashed rounded-2xl ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}`}>
                            <Banknote size={32} className={`mx-auto mb-2 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}/>
                            <p className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No hay pagos próximos programados</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- VISTA EMPRESAS --- */}
        {activeTab === 'companies' && (
            <div className="h-full overflow-y-auto custom-scrollbar">
                <div className={`grid gap-3 ${isLarge ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {companies.map(comp => {
                        const debt = getCompanyDebt(comp.id);
                        const monthProd = getCompanyMonthProduction(comp.id);
                        return (
                            <div key={comp.id} className={`relative p-3 rounded-2xl border hover:shadow-lg transition-all group ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-500 font-bold shadow-inner">{comp.name.charAt(0)}</div>
                                    <div className="text-right">
                                        <span className="text-[8px] text-slate-400 font-bold uppercase block">Adeuda</span>
                                        <span className={`text-xs font-black ${debt > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>{formatCurrency(debt)}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{comp.name}</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded border ${comp.type === 'full-time' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>{comp.type === 'full-time' ? 'Full' : 'Part'}</span>
                                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-100">${comp.rate}/h</span>
                                    </div>
                                    <p className="text-[8px] text-slate-400 mt-2 flex items-center gap-1"><CalendarDays size={8}/> {comp.frequency}</p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1"><TrendingUp size={8}/> Prod. Mes</span>
                                    <span className="text-[9px] font-black text-blue-500">{formatCurrency(monthProd)}</span>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => onEditCompany(comp)} className="p-1 bg-white shadow-sm border rounded hover:text-blue-500"><Edit3 size={10}/></button>
                                    <button onClick={() => deleteCompany(comp.id)} className="p-1 bg-white shadow-sm border rounded hover:text-rose-500"><Trash2 size={10}/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <>
        <Card className={`overflow-hidden flex flex-col transition-all duration-500 ${isExpanded ? 'h-full min-h-[300px]' : 'h-auto'}`}>
            <div className="flex justify-between items-center mb-2 shrink-0">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Briefcase size={14} style={{ color: themeColor }}/> Gestión Trabajo
                    </h3>
                    
                    {/* NUEVO HEADER CON DATOS DESGLOSADOS */}
                    <div className="mt-1 flex gap-3 text-[9px]">
                        <div>
                            <span className="text-slate-400 font-bold block">Ganado (Real)</span>
                            <span className="text-emerald-500 font-black">{formatCurrency(totals.earned)}</span>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 h-6 self-center"></div>
                        <div>
                            <span className="text-slate-400 font-bold block">Proyectado</span>
                            <span className="text-slate-400 font-black">{formatCurrency(totals.projected)}</span>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 h-6 self-center"></div>
                        <div>
                            <span className="text-slate-400 font-bold block">Total</span>
                            <span className={`font-black ${darkMode ? 'text-white' : 'text-slate-700'}`}>{formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="flex flex-col mr-1">
                        {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
                        {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
                    </div>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><Minus size={16}/></button>
                    <button onClick={() => setIsMaximized(true)} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-all"><Maximize2 size={16}/></button>
                </div>
            </div>
            {isExpanded && <div className="flex-1 overflow-hidden flex flex-col"><WorkContent isLarge={false} /></div>}
        </Card>

        {isMaximized && (
            <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className={`w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    <div className="absolute top-4 right-4 z-50">
                        <button onClick={() => setIsMaximized(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><Minimize2 size={20}/></button>
                    </div>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Briefcase className="text-blue-500"/> Gestión Detallada de Trabajo</h2>
                    </div>
                    <div className="flex-1 overflow-hidden"><WorkContent isLarge={true} /></div>
                </div>
            </div>
        )}
    </>
  );
};