import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  // --- DATOS ---
  const [incomes, setIncomes] = useLocalStorage('fin_incomes', []);
  const [expenses, setExpenses] = useLocalStorage('fin_expenses', []);
  const [wallets, setWallets] = useLocalStorage('fin_wallets', [
    { id: 'w1', name: 'Efectivo', type: 'cash', balance: 0 },
    { id: 'w2', name: 'Banco', type: 'bank', balance: 0 }
  ]);
  // 1. Nuevo estado para activar/desactivar Rojo y Verde en botones
  const [useSemanticColors, setUseSemanticColors] = useLocalStorage('fin_semantic_mode', true);

  const [subscriptions, setSubscriptions] = useLocalStorage('fin_subscriptions', []);
  const [goals, setGoals] = useLocalStorage('fin_goals', []);
  const [budgets, setBudgets] = useLocalStorage('fin_budgets', []);
  const [workLogs, setWorkLogs] = useLocalStorage('fin_work_logs', []);
  const [companies, setCompanies] = useLocalStorage('fin_companies', []); 
  
  // CATEGORÍAS
  const [categories, setCategories] = useLocalStorage('fin_categories', [
    "🏠 Vivienda", "🍔 Comida", "🚌 Transporte", "💊 Salud", "🎉 Ocio", "📺 Suscripciones", "📱 Tecnología", "🛒 Supermercado"
  ]);
  const [incomeCategories, setIncomeCategories] = useLocalStorage('fin_income_categories', [
    "💰 Salario", "💸 Ingreso Extra", "🎁 Regalo", "📈 Inversión", "🔄 Devolución", "💼 Freelance", "💵 Propinas"
  ]);

  // --- CONFIGURACIÓN ---
  const [darkMode, setDarkMode] = useLocalStorage('fin_dark', false);
  const [themeColor, setThemeColor] = useLocalStorage('fin_theme', '#3b82f6');
  const [privacyMode, setPrivacyMode] = useLocalStorage('fin_privacy', false);

  const availableThemes = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4'];

  // --- FILTROS Y SALDOS ---
  const [isAllExpanded, setIsAllExpanded] = useState(true); 
  const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
  const [dateFilter, setDateFilter] = useState({ mode: 'month', value: getCurrentMonth(), from: '', to: '' });
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  
  const displayBalance = useMemo(() => {
    if (selectedWalletId) {
      const w = wallets.find(w => w.id === selectedWalletId);
      return w ? w.balance : 0;
    }
    return totalBalance;
  }, [selectedWalletId, wallets, totalBalance]);

  // --- FILTROS BASE ---
  const baseFilter = (t) => {
    if (selectedWalletId && t.walletId !== selectedWalletId) return false;
    if (dateFilter.mode === 'all') return true;
    if (dateFilter.mode === 'month') return t.date.startsWith(dateFilter.value);
    if (dateFilter.mode === 'year') return t.date.startsWith(dateFilter.value.substring(0, 4));
    if (dateFilter.mode === 'custom') {
      if (dateFilter.from && t.date < dateFilter.from) return false;
      if (dateFilter.to && t.date > dateFilter.to) return false;
      return true;
    }
    return true;
  };

  const chartIncomes = useMemo(() => incomes.filter(baseFilter), [incomes, dateFilter, selectedWalletId]);
  const chartExpenses = useMemo(() => expenses.filter(baseFilter), [expenses, dateFilter, selectedWalletId]);

  const filteredIncomes = useMemo(() => {
      let list = chartIncomes;
      if (selectedCategory) list = list.filter(i => (i.category || i.name) === selectedCategory);
      return list;
  }, [chartIncomes, selectedCategory]);

  const filteredExpenses = useMemo(() => {
      let list = chartExpenses;
      if (selectedCategory) list = list.filter(e => e.category === selectedCategory);
      return list;
  }, [chartExpenses, selectedCategory]);

  const getBudgetProgress = (category) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return expenses
      .filter(e => e.category === category && e.date.startsWith(currentMonth))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  };

  // --- LÓGICA DE PROYECCIÓN DE PAGO ---
  const calculatePayDate = (workDateStr, company) => {
      if (!company || !workDateStr) return workDateStr;
      
      const workDate = new Date(workDateStr);
      const workDateLocal = new Date(workDate.getTime() + workDate.getTimezoneOffset() * 60000);
      
      if (company.frequency === 'immediate') return workDateStr;

      if (company.payDayAnchor) {
          const anchor = new Date(company.payDayAnchor);
          const anchorLocal = new Date(anchor.getTime() + anchor.getTimezoneOffset() * 60000);
          
          const diffTime = workDateLocal - anchorLocal;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let cycleDays = 7; 
          if (company.frequency === 'biweekly') cycleDays = 14;
          if (company.frequency === 'monthly') cycleDays = 30; 
          
          let daysUntilNextPay = cycleDays - (diffDays % cycleDays);
          if (daysUntilNextPay < 0) daysUntilNextPay += cycleDays;
          
          const nextPay = new Date(workDateLocal);
          nextPay.setDate(workDateLocal.getDate() + daysUntilNextPay);
          return nextPay.toISOString().split('T')[0];
      }
      
      return workDateStr; 
  };

  // --- EVENTOS ---
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('finplan_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('finplan_events', JSON.stringify(events)); }, [events]);

  const addEvent = (event) => setEvents([...events, { ...event, id: Date.now().toString() }]);
  const updateEvent = (updatedEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };
  const deleteEvent = (id) => setEvents(events.filter(e => e.id !== id));


  // --- PROYECCIÓN FINANCIERA (CON LOGS DE AUDITORÍA Y FRECUENCIA REAL) ---
  const calculateProjection = (months = 6, extraWeeklyIncome = 0) => {
    const today = new Date();
    // Normalizamos 'today' a medianoche para evitar problemas de horas
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + months);
    
    // 1. BALANCE INICIAL
    let currentBalance = wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);
    
    // 2. GASTO DIARIO PROMEDIO (PRESUPUESTOS)
    const totalBudgets = budgets.reduce((acc, b) => acc + (Number(b.limit) || 0), 0);
    const dailyBudgetBurn = totalBudgets > 0 ? totalBudgets / 30 : 0;
    
    const virtualGoalsProgress = goals.reduce((acc, g) => ({ ...acc, [g.id]: Number(g.saved) || 0 }), {});

    const projection = [];
    let currentDate = new Date(today);
    
    // CONTADOR PARA SEMANAS
    let daysCounter = 0; 

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfMonth = currentDate.getDate();
      const dayOfWeek = currentDate.getDay(); 
      const dayLogs = []; // Array para guardar qué pasó este día

      // A. RESTAR GASTO DIARIO (PRESUPUESTO) - ¡AHORA SE MUESTRA!
      if (dailyBudgetBurn > 0) {
          currentBalance -= dailyBudgetBurn;
          
          // --- AQUÍ ESTÁ LO QUE PEDISTE ---
          // Guardamos este dato con tipo 'daily'. 
          // La gráfica lo usará para mostrar la tarjeta de "Pendiente Diaria".
          dayLogs.push({ 
              type: 'daily', 
              name: 'Consumo Presupuesto Diario', 
              amount: -dailyBudgetBurn 
          });
      }

      // B. SUMAR INGRESO EXTRA SEMANAL (Cada 7 días)
      if (Number(extraWeeklyIncome) > 0 && daysCounter % 7 === 0) {
          const amount = Number(extraWeeklyIncome);
          currentBalance += amount;
          dayLogs.push({ type: 'income', name: 'Ingreso Extra Semanal', amount }); 
      }

      // C. SALARIOS FULL-TIME (POR FRECUENCIA CONFIGURADA)
      companies.filter(c => c.type === 'full-time').forEach(comp => {
         // Si la empresa no tiene fecha de pago configurada, no podemos calcular
         if (!comp.payDayAnchor) return; 

         const rate = Number(comp.rate) || 0;
         const frequency = comp.frequency || 'weekly'; 
         
         // Fechas seguras
         const anchorDate = new Date(comp.payDayAnchor + 'T00:00:00');
         const simDate = new Date(dateStr + 'T00:00:00');
         
         // Días desde el primer pago
         const diffTime = simDate.getTime() - anchorDate.getTime();
         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

         if (diffDays >= 0) {
             let isPayDay = false;
             let hoursToPay = 0;

             if (frequency === 'weekly') {
                 if (diffDays % 7 === 0) { isPayDay = true; hoursToPay = 40; } // 40h Semanal
             } else if (frequency === 'biweekly') {
                 if (diffDays % 14 === 0) { isPayDay = true; hoursToPay = 80; } // 80h Quincenal
             } else if (frequency === 'monthly') {
                 if (simDate.getDate() === anchorDate.getDate()) { isPayDay = true; hoursToPay = 160; } // 160h Mensual
             }

             if (isPayDay) {
                 const payAmount = rate * hoursToPay;
                 currentBalance += payAmount;
                 // Guardamos el log para que salga en la lista
                 dayLogs.push({ type: 'income', name: `Nómina ${comp.name}`, amount: payAmount });
             }
         }
      });

      // D. TRABAJOS AGENDADOS (Work Logs)
      const paymentsToday = workLogs.filter(log => log.paymentDate === dateStr && log.status !== 'paid');
      paymentsToday.forEach(log => {
          const amount = Number(log.total);
          currentBalance += amount;
          dayLogs.push({ type: 'income', name: `Pago Turno: ${log.companyName}`, amount });
      });

      // E. SUSCRIPCIONES
      subscriptions.forEach(sub => {
          const paymentDay = Number(sub.day) || 1;
          if (dayOfMonth === paymentDay) {
              const amount = Number(sub.price) || 0;
              currentBalance -= amount;
              dayLogs.push({ type: 'expense', name: `Suscripción: ${sub.name}`, amount: -amount });
          }
      });

      // F. EVENTOS
      if (events && Array.isArray(events)) {
          const daysEvents = events.filter(e => e.date === dateStr);
          daysEvents.forEach(evt => {
              if (evt.items && Array.isArray(evt.items)) {
                  const totalEventCost = evt.items
                    .filter(item => !item.checked) 
                    .reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
                  
                  if (totalEventCost > 0) {
                      currentBalance -= totalEventCost;
                      dayLogs.push({ type: 'event', name: `Evento: ${evt.name}`, amount: -totalEventCost });
                  }
              }
          });
      }

      // G. METAS DE AHORRO
      goals.forEach(goal => {
          const target = Number(goal.target) || 0;
          const installment = Number(goal.installment) || 0;
          const currentSaved = virtualGoalsProgress[goal.id];

          if (installment > 0 && currentSaved < target) {
              let shouldSave = false;
              const gStart = new Date(goal.startDate || dateStr);
              const gStartLocal = new Date(gStart.getTime() + gStart.getTimezoneOffset() * 60000);

              if (goal.frequency === 'once' && goal.deadline === dateStr) shouldSave = true;
              else if (goal.frequency === 'monthly' && dayOfMonth === gStartLocal.getDate()) shouldSave = true;
              else if (goal.frequency === 'weekly' && dayOfWeek === gStartLocal.getDay()) shouldSave = true;
              else if (goal.frequency === 'biweekly') {
                  const diffTime = currentDate.getTime() - gStartLocal.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays >= 0 && diffDays % 14 === 0) shouldSave = true;
              }

              if (shouldSave) {
                  currentBalance -= installment;
                  virtualGoalsProgress[goal.id] += installment;
                  dayLogs.push({ type: 'goal', name: `Ahorro Meta: ${goal.name}`, amount: -installment });
              }
          }
      });

      projection.push({
        date: dateStr,
        balance: Math.round(currentBalance),
        logs: dayLogs // <--- AQUÍ VA TODA LA INFORMACIÓN PARA LA TABLA
      });

      currentDate.setDate(currentDate.getDate() + 1);
      daysCounter++;
    }
    return projection;
  };
  // --- NUEVA FUNCIÓN AUXILIAR PARA CALCULAR ESTADO DE META ---
  const getGoalDetails = (goal) => {
      const target = Number(goal.target) || 0;
      const saved = Number(goal.saved) || 0;
      const installment = Number(goal.installment) || 0;
      const remaining = target - saved;
      
      if (remaining <= 0) return { status: 'completed', text: '¡Meta Completada!', percent: 100 };
      if (!installment || installment <= 0) return { status: 'no_plan', text: 'Sin plan de ahorro', percent: (saved/target)*100 };

      // Calcular fecha estimada de finalización
      let installmentsLeft = Math.ceil(remaining / installment);
      let daysPerInstallment = 30; // Default monthly
      if (goal.frequency === 'weekly') daysPerInstallment = 7;
      if (goal.frequency === 'biweekly') daysPerInstallment = 14;
      if (goal.frequency === 'once') daysPerInstallment = 0; // Especial

      const daysLeft = installmentsLeft * daysPerInstallment;
      const today = new Date();
      const estimatedDate = new Date(today);
      estimatedDate.setDate(today.getDate() + daysLeft);

      // Calcular próxima fecha de pago
      // (Simplificado para UI: asume próxima fecha lógica basada en startDate)
      let nextPaymentDate = new Date(); // Aquí iría lógica más compleja si se requiere exactitud

      return {
          status: 'active',
          daysLeft,
          estimatedDate: goal.frequency === 'once' ? new Date(goal.deadline) : estimatedDate,
          installmentsLeft,
          percent: Math.min((saved/target)*100, 100)
      };
  };

  // --- CRUD GESTIÓN ---
  const addCategory = (newCat, type = 'expense') => {
    if (type === 'income') { if (!incomeCategories.includes(newCat)) setIncomeCategories([...incomeCategories, newCat]); } 
    else { if (!categories.includes(newCat)) setCategories([...categories, newCat]); }
  };
  const updateCategory = (oldName, newName, type = 'expense') => {
    if (type === 'income') {
        setIncomeCategories(prev => prev.map(c => c === oldName ? newName : c));
        setIncomes(prev => prev.map(i => i.category === oldName ? {...i, category: newName} : i));
    } else {
        setCategories(prev => prev.map(c => c === oldName ? newName : c));
        setExpenses(prev => prev.map(e => e.category === oldName ? {...e, category: newName} : e));
        setBudgets(prev => prev.map(b => b.category === oldName ? {...b, category: newName} : b));
    }
  };
  const deleteCategory = (catToDelete, type = 'expense') => {
      if (type === 'income') setIncomeCategories(prev => prev.filter(c => c !== catToDelete));
      else setCategories(prev => prev.filter(c => c !== catToDelete));
  };

  // --- CRUD COMPANIES ---
  const addCompany = (comp) => setCompanies(prev => [...prev, comp]);
  const updateCompany = (comp) => setCompanies(prev => prev.map(c => c.id === comp.id ? comp : c));
  const deleteCompany = (id) => {
      if(window.confirm("¿Eliminar empresa?")) {
          setCompanies(prev => prev.filter(c => c.id !== id));
      }
  };

  // --- CRUD WORK LOGS ---
  const addWorkLog = (log) => setWorkLogs(prev => [...prev, { ...log, status: 'pending' }]);
  const updateWorkLog = (log) => setWorkLogs(prev => prev.map(w => w.id === log.id ? log : w));
  const deleteWorkLog = (id) => setWorkLogs(prev => prev.filter(w => w.id !== id));
  
  // FUNCION COBRAR
  const markWorkAsPaid = (workLog, walletIdToDeposit) => {
      const newIncome = {
          id: Date.now(),
          name: `Pago: ${workLog.companyName}`,
          amount: workLog.total,
          category: '💰 Salario',
          date: new Date().toISOString().split('T')[0],
          walletId: walletIdToDeposit,
          details: `Pago horas acumuladas de ${workLog.companyName}`
      };
      
      setIncomes(prev => [newIncome, ...prev]);
      setWallets(prev => prev.map(w => w.id === walletIdToDeposit ? { ...w, balance: w.balance + Number(workLog.total) } : w));
      updateWorkLog({ ...workLog, status: 'paid', paidDate: newIncome.date });
  };

  const unmarkWorkAsPaid = (workLog) => {
      updateWorkLog({ ...workLog, status: 'pending', paidDate: '' });
  };

  // --- UPDATERS GENERICS ---
  const updateWallet = (updatedWallet) => setWallets(prev => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));
  const updateGoal = (updatedGoal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  const updateSubscription = (updatedSub) => setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  const updateBudget = (updatedBudget) => setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  
  const deleteSubscription = (id) => setSubscriptions(prev => prev.filter(s => s.id !== id));
  const deleteBudget = (id) => setBudgets(prev => prev.filter(b => b.id !== id));
  const deleteWallet = (id) => { if(window.confirm("¿Borrar cuenta?")) { setWallets(prev => prev.filter(w => w.id !== id)); if(selectedWalletId === id) setSelectedWalletId(null); } };
  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  const addTransaction = (type, data) => {
    if (type === 'income') setIncomes(prev => [data, ...prev]);
    else setExpenses(prev => [data, ...prev]);
    setWallets(prev => prev.map(w => w.id === data.walletId ? { ...w, balance: type === 'income' ? w.balance + Number(data.amount) : w.balance - Number(data.amount) } : w));
  };
  const updateTransaction = (oldItem, newItem) => {
    setWallets(current => current.map(w => {
      if (w.id === oldItem.walletId) return { ...w, balance: oldItem.type === 'income' ? w.balance - Number(oldItem.amount) : w.balance + Number(oldItem.amount) };
      return w;
    }));
    setTimeout(() => {
      setWallets(current => current.map(w => {
        if (w.id === newItem.walletId) return { ...w, balance: newItem.type === 'income' ? w.balance + Number(newItem.amount) : w.balance - Number(newItem.amount) };
        return w;
      }));
    }, 0);
    if (newItem.type === 'income') setIncomes(prev => prev.map(i => i.id === oldItem.id ? newItem : i));
    else setExpenses(prev => prev.map(e => e.id === oldItem.id ? newItem : e));
  };
  const deleteTransaction = (id, type) => {
    const list = type === 'income' ? incomes : expenses;
    const item = list.find(t => t.id === id);
    if (type === 'income') setIncomes(prev => prev.filter(t => t.id !== id));
    else setExpenses(prev => prev.filter(t => t.id !== id));
    if (item) setWallets(prev => prev.map(w => w.id === item.walletId ? { ...w, balance: type === 'income' ? w.balance - Number(item.amount) : w.balance + Number(item.amount) } : w));
  };

  const value = {
    incomes, expenses, wallets, subscriptions, goals, budgets, categories, incomeCategories, 
    workLogs, companies,
    chartIncomes, chartExpenses, filteredIncomes, filteredExpenses, 
    dateFilter, setDateFilter, selectedWalletId, setSelectedWalletId, selectedCategory, setSelectedCategory,
    displayBalance, totalBalance,
    setGoals, setSubscriptions, setCategories, setIncomeCategories, setBudgets, setWallets, setWorkLogs, setCompanies,
    addCategory, updateCategory, deleteCategory, getBudgetProgress, calculateProjection, calculatePayDate, getGoalDetails, // <--- EXPORTADO
    deleteBudget, deleteWallet, deleteGoal, deleteSubscription,
    updateWallet, updateGoal, updateSubscription, updateBudget,
    addWorkLog, updateWorkLog, deleteWorkLog, markWorkAsPaid, unmarkWorkAsPaid, 
    addCompany, updateCompany, deleteCompany,
    darkMode, setDarkMode, themeColor, setThemeColor, availableThemes, privacyMode, setPrivacyMode,
    addTransaction, deleteTransaction, updateTransaction, isAllExpanded, setIsAllExpanded, events, addEvent, updateEvent, deleteEvent,
    useSemanticColors, setUseSemanticColors
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancial = () => useContext(FinancialContext);