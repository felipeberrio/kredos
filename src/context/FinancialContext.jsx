import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext'; // Importar Auth
import { supabase } from '../supabaseClient'; // Importar Cliente
import { DEFAULT_EXPENSE_CATS, DEFAULT_INCOME_CATS } from '../constants/config';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  const { user } = useAuth(); // Obtener usuario logueado

  // --- DATOS (HÍBRIDO: MEMORIA + LOCALSTORAGE) ---
  // Si hay usuario, usamos estado de memoria (se llena desde Supabase).
  // Si NO hay usuario, usamos useLocalStorage como siempre.
  
  // 1. Estados Locales (Tu código original)
  const [localIncomes, setLocalIncomes] = useLocalStorage('fin_incomes', []);
  const [localExpenses, setLocalExpenses] = useLocalStorage('fin_expenses', []);
  const [localWallets, setLocalWallets] = useLocalStorage('fin_wallets', [{ id: 'w1', name: 'Efectivo', type: 'cash', balance: 0 }, { id: 'w2', name: 'Banco', type: 'bank', balance: 0 }]);
  const [localUseSemanticColors, setLocalUseSemanticColors] = useLocalStorage('fin_semantic_mode', true);
  const [localSubscriptions, setLocalSubscriptions] = useLocalStorage('fin_subscriptions', []);
  const [localGoals, setLocalGoals] = useLocalStorage('fin_goals', []);
  const [localBudgets, setLocalBudgets] = useLocalStorage('fin_budgets', []);
  const [localWorkLogs, setLocalWorkLogs] = useLocalStorage('fin_work_logs', []);
  const [localCompanies, setLocalCompanies] = useLocalStorage('fin_companies', []);
  const [localDarkMode, setLocalDarkMode] = useLocalStorage('fin_dark', false);
  const [localThemeColor, setLocalThemeColor] = useLocalStorage('fin_theme', '#3b82f6');
  const [localPrivacyMode, setLocalPrivacyMode] = useLocalStorage('fin_privacy', false);
  const [localEvents, setLocalEvents] = useLocalStorage('finplan_events', []); // Recuperado del useEffect original
  const [localShoppingList, setLocalShoppingList] = useLocalStorage('fin_shopping', []); // Nuevo para persistencia local

  // 2. Estados de Nube (Para cuando hay usuario)
  const [cloudData, setCloudData] = useState({
      incomes: [], expenses: [], wallets: [], goals: [], subscriptions: [], budgets: [], 
      workLogs: [], companies: [], events: [], shoppingList: [],
      categories: [], incomeCategories: [],
      preferences: { theme: '#3b82f6', dark: false, privacy: false, currency: 'USD', semantic: true }
  });

  // 3. SELECTOR INTELIGENTE (El corazón del sistema híbrido)
  // Si user existe -> usa cloudData. Si no -> usa localStates
  const incomes = user ? cloudData.incomes : localIncomes;
  const expenses = user ? cloudData.expenses : localExpenses;
  const wallets = user ? cloudData.wallets : localWallets;
  const goals = user ? cloudData.goals : localGoals;
  const subscriptions = user ? cloudData.subscriptions : localSubscriptions;
  const budgets = user ? cloudData.budgets : localBudgets;
  const workLogs = user ? cloudData.workLogs : localWorkLogs;
  const companies = user ? cloudData.companies : localCompanies;
  const events = user ? cloudData.events : localEvents;
  const shoppingList = user ? cloudData.shoppingList : localShoppingList;



  const [localCategories, setLocalCategories] = useLocalStorage('fin_categories', DEFAULT_EXPENSE_CATS);
  const [localIncomeCategories, setLocalIncomeCategories] = useLocalStorage('fin_income_categories', DEFAULT_INCOME_CATS);


  const categories = user 
    ? (cloudData.categories && cloudData.categories.length > 0 ? cloudData.categories : localCategories) 
    : localCategories;

  const incomeCategories = user 
    ? (cloudData.incomeCategories && cloudData.incomeCategories.length > 0 ? cloudData.incomeCategories : localIncomeCategories) 
    : localIncomeCategories;

  // Preferencias
  const darkMode = user ? cloudData.preferences.dark : localDarkMode;
  const themeColor = user ? cloudData.preferences.theme : localThemeColor;
  const privacyMode = user ? cloudData.preferences.privacy : localPrivacyMode;
  const useSemanticColors = user ? cloudData.preferences.semantic : localUseSemanticColors;

  const availableThemes = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4'];

  // --- CONVERTIR DATOS DE SUPABASE A FORMATO DE APLICACIÓN

  const parseSupabaseList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data; // Si ya es array, perfecto
    if (typeof data === 'string') {
        try {
            // Intentamos convertir el texto "['a','b']" en una lista real
            return JSON.parse(data); 
        } catch (e) {
            console.error("Error convirtiendo lista:", e);
            return [];
        }
    }
    return [];
};

  // --- CARGAR DATOS DE SUPABASE (CON MAPEO CORREGIDO) ---
  useEffect(() => {
    if (user) {
        const loadSupabase = async () => {
            // Cargar todo en paralelo
            const [
                { data: w }, { data: t }, { data: g }, { data: s }, 
                { data: b }, { data: c }, { data: wl }, { data: ev }, 
                { data: shop }, { data: prof }
            ] = await Promise.all([
                supabase.from('wallets').select('*'),
                supabase.from('transactions').select('*'),
                supabase.from('goals').select('*'),
                supabase.from('subscriptions').select('*'),
                supabase.from('budgets').select('*'),
                supabase.from('companies').select('*'),
                supabase.from('work_logs').select('*'),
                supabase.from('events').select('*'),
                supabase.from('shopping_items').select('*'),
                supabase.from('profiles').select('*').eq('id', user.id).single()
            ]);

            // [CORRECCIÓN CRÍTICA] Mapeo de DB (wallet_id) a App (walletId) al leer
            const formattedT = t ? t.map(tx => ({ ...tx, walletId: tx.wallet_id })) : [];

            // Procesar transacciones en ingresos/gastos
            const inc = formattedT.filter(x => x.type === 'income');
            const exp = formattedT.filter(x => x.type === 'expense');

            // Mapeos adicionales (companies, worklogs, shopping)
            const formattedC = c ? c.map(comp => ({ ...comp, payDay: comp.pay_day, hasTips: comp.has_tips, payDayAnchor: comp.pay_day_anchor })) : [];
            const formattedWL = wl ? wl.map(log => ({ ...log, companyId: log.company_id, companyName: log.company_name, workDate: log.work_date, startTime: log.start_time, endTime: log.end_time, paymentDate: log.payment_date })) : [];
            const formattedShop = shop ? shop.map(it => ({ ...it, isFavorite: it.is_favorite, isAcquired: it.is_acquired })) : [];

            const dbCategories = parseSupabaseList(prof?.categories);
            const dbIncomeCategories = parseSupabaseList(prof?.income_categories); // Nota el guion bajo del DB

            setCloudData(prev => ({
                ...prev,
                wallets: w || [], incomes: inc, expenses: exp, goals: g || [],
                subscriptions: s || [], budgets: b || [], companies: formattedC,
                workLogs: formattedWL, events: ev || [], shoppingList: formattedShop,
                // 1. CATEGORÍAS DE GASTOS
                categories: dbCategories.length > 0 
                    ? dbCategories 
                    : DEFAULT_EXPENSE_CATS, // Solo si viene vacío usamos el default

                incomeCategories: dbIncomeCategories.length > 0 
                    ? dbIncomeCategories 
                    : DEFAULT_INCOME_CATS,
                preferences: prof ? {
                    theme: prof.theme_color,
                    dark: prof.dark_mode,
                    privacy: prof.privacy_mode,
                    currency: prof.currency,
                    semantic: true 
                } : prev.preferences
                
            }));
        };
        loadSupabase();
    }
  }, [user]);

  // --- FILTROS Y SALDOS (INTACTO) ---
  const [isAllExpanded, setIsAllExpanded] = useState(true); 
  const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
  const [dateFilter, setDateFilter] = useState({ mode: 'month', value: getCurrentMonth(), from: '', to: '' });
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0); // Asegurar Number
  
  const displayBalance = useMemo(() => {
    if (selectedWalletId) {
      const w = wallets.find(w => w.id === selectedWalletId);
      return w ? Number(w.balance) : 0;
    }
    return totalBalance;
  }, [selectedWalletId, wallets, totalBalance]);

  // --- FILTROS BASE (INTACTO) ---
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

  // --- LÓGICA DE PROYECCIÓN DE PAGO (INTACTO) ---
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

  // --- PROYECCIÓN FINANCIERA (INTACTO) ---
  const calculateProjection = (months = 6, extraWeeklyIncome = 0, excludedIds = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + months);
    
    let currentBalance = wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);
    
    const activeBudgets = budgets.filter(b => !excludedIds.includes(b.id));
    const totalActiveBudgets = activeBudgets.reduce((acc, b) => acc + (Number(b.limit) || 0), 0);
    const dailyBudgetBurn = totalActiveBudgets > 0 ? totalActiveBudgets / 30 : 0;
    
    const virtualGoalsProgress = goals.reduce((acc, g) => ({ ...acc, [g.id]: Number(g.saved) || 0 }), {});

    const projection = [];
    let currentDate = new Date(today);
    let daysCounter = 0; 

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfMonth = currentDate.getDate();
      const dayLogs = [];

      if (dailyBudgetBurn > 0) {
          currentBalance -= dailyBudgetBurn;
          dayLogs.push({ type: 'daily', name: 'Consumo Presupuesto', amount: -dailyBudgetBurn });
      }

      if (!excludedIds.includes('manual_extra_income')) {
          if (Number(extraWeeklyIncome) > 0 && daysCounter % 7 === 0) {
              const amount = Number(extraWeeklyIncome);
              currentBalance += amount;
              dayLogs.push({ type: 'income', name: 'Ingreso Extra Semanal', amount }); 
          }
      }

      companies
        .filter(c => c.type === 'full-time')
        .filter(c => !excludedIds.includes(c.id))
        .forEach(comp => {
            const rate = Number(comp.rate) || 0;
            const frequency = comp.frequency || 'weekly'; 
            
            const anchorDateStr = comp.payDayAnchor || new Date().toISOString().split('T')[0];
            const anchorDate = new Date(anchorDateStr + 'T00:00:00');
            const simDate = new Date(dateStr + 'T00:00:00');
            
            const workDaysCount = (comp.workDays && comp.workDays.length > 0) ? comp.workDays.length : 5;
            const hoursPerWeek = workDaysCount * 8; 
            
            const diffTime = simDate.getTime() - anchorDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0) {
                let isPayDay = false;
                let payAmount = 0;

                if (frequency === 'weekly') { 
                    if (diffDays % 7 === 0) { isPayDay = true; payAmount = rate * hoursPerWeek; } 
                } 
                else if (frequency === 'biweekly') { 
                    if (diffDays % 14 === 0) { isPayDay = true; payAmount = rate * hoursPerWeek * 2; } 
                } 
                else if (frequency === 'monthly') { 
                    if (simDate.getDate() === anchorDate.getDate()) { isPayDay = true; payAmount = rate * hoursPerWeek * 4; } 
                }

                if (isPayDay && payAmount > 0) {
                    currentBalance += payAmount;
                    dayLogs.push({ type: 'income', name: `Nómina ${comp.name}`, amount: payAmount });
                }
            }
      });

      const paymentsToday = workLogs.filter(log => log.paymentDate === dateStr && log.status !== 'paid');
      paymentsToday.forEach(log => {
          const amount = Number(log.total);
          currentBalance += amount;
          dayLogs.push({ type: 'income', name: `Pago Turno: ${log.companyName}`, amount });
      });

      subscriptions.filter(s => !excludedIds.includes(s.id)).forEach(sub => {
          const paymentDay = Number(sub.day) || 1;
          if (dayOfMonth === paymentDay) {
              const amount = Number(sub.price) || 0;
              currentBalance -= amount;
              dayLogs.push({ type: 'expense', name: `Suscripción: ${sub.name}`, amount: -amount });
          }
      });

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

      goals.filter(g => !excludedIds.includes(g.id)).forEach(goal => {
          const target = Number(goal.target) || 0;
          const installment = Number(goal.installment) || 0;
          const currentSaved = virtualGoalsProgress[goal.id];

          if (installment > 0 && currentSaved < target) {
              let shouldSave = false;
              const gStart = new Date(goal.startDate || dateStr);
              const gStartLocal = new Date(gStart.getTime() + gStart.getTimezoneOffset() * 60000);

              if (goal.frequency === 'once' && goal.deadline === dateStr) shouldSave = true;
              else if (goal.frequency === 'monthly' && dayOfMonth === gStartLocal.getDate()) shouldSave = true;
              else if (goal.frequency === 'weekly' && currentDate.getDay() === gStartLocal.getDay()) shouldSave = true;
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
        logs: dayLogs
      });

      currentDate.setDate(currentDate.getDate() + 1);
      daysCounter++;
    }
    return projection;
  };

  // --- CONFIGURACIÓN DE MONEDA ---
  const [currency, setCurrencyState] = useState('USD'); 
  const exchangeRate = 4200; 

  const setCurrency = (val) => {
      if(user) supabase.from('profiles').update({ currency: val }).eq('id', user.id).then();
      setCurrencyState(val);
  };

  const formatMoney = (amount) => {
      const number = Number(amount);
      const curr = user ? cloudData.preferences.currency : currency; // Prioridad nube
      if (curr === 'COP') {
          return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(number * exchangeRate);
      } else {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
      }
  };

  const getGoalDetails = (goal) => {
      const target = Number(goal.target) || 0;
      const saved = Number(goal.saved) || 0;
      const installment = Number(goal.installment) || 0;
      const remaining = target - saved;
      
      if (remaining <= 0) return { status: 'completed', text: '¡Meta Completada!', percent: 100 };
      if (!installment || installment <= 0) return { status: 'no_plan', text: 'Sin plan de ahorro', percent: (saved/target)*100 };

      let installmentsLeft = Math.ceil(remaining / installment);
      let daysPerInstallment = 30; 
      if (goal.frequency === 'weekly') daysPerInstallment = 7;
      if (goal.frequency === 'biweekly') daysPerInstallment = 14;
      if (goal.frequency === 'once') daysPerInstallment = 0;

      const daysLeft = installmentsLeft * daysPerInstallment;
      const today = new Date();
      const estimatedDate = new Date(today);
      estimatedDate.setDate(today.getDate() + daysLeft);

      return {
          status: 'active',
          daysLeft,
          estimatedDate: goal.frequency === 'once' ? new Date(goal.deadline) : estimatedDate,
          installmentsLeft,
          percent: Math.min((saved/target)*100, 100)
      };
  };

  // --- CRUD DISPATCHERS (HÍBRIDOS + MAPEO) ---
  const addWallet = async (item) => {
      if(user) { const { id, ...rest } = item; const { data } = await supabase.from('wallets').insert([{...rest, user_id: user.id}]).select(); if(data) setCloudData(p => ({...p, wallets: [...p.wallets, data[0]]})); } 
      else setLocalWallets([...localWallets, item]);
  };
  const updateWallet = async (item) => {
      if(user) { const { data } = await supabase.from('wallets').update(item).eq('id', item.id).select(); if(data) setCloudData(p => ({...p, wallets: p.wallets.map(w => w.id === item.id ? data[0] : w)})); } 
      else setLocalWallets(localWallets.map(w => w.id === item.id ? item : w));
  };
  const deleteWallet = async (id) => {
      if(user) { await supabase.from('wallets').delete().eq('id', id); setCloudData(p => ({...p, wallets: p.wallets.filter(w => w.id !== id)})); } 
      else setLocalWallets(localWallets.filter(w => w.id !== id));
  };

  // --- [CORRECCIÓN ERROR 400] ADD TRANSACTION ---
  const addTransaction = async (type, data) => {
      if(user) {
          // Extraemos walletId y mappeamos a wallet_id
          const { id, walletId, ...rest } = data;
          const dbData = { 
              ...rest, 
              type, 
              user_id: user.id, 
              wallet_id: walletId // <-- MAPEO CRÍTICO
          };
          
          const { data: newData } = await supabase.from('transactions').insert([dbData]).select();
          
          if(newData) {
              const tx = { ...newData[0], walletId: newData[0].wallet_id }; // Convertir de vuelta a camelCase para la app
              const listKey = type === 'income' ? 'incomes' : 'expenses';
              
              // Actualizar saldo billetera
              const wallet = wallets.find(w => w.id === walletId);
              if(wallet) {
                  const newBal = type === 'income' ? Number(wallet.balance) + Number(data.amount) : Number(wallet.balance) - Number(data.amount);
                  await supabase.from('wallets').update({balance: newBal}).eq('id', wallet.id);
                  setCloudData(p => ({
                      ...p, 
                      [listKey]: [tx, ...p[listKey]],
                      wallets: p.wallets.map(w => w.id === wallet.id ? {...w, balance: newBal} : w)
                  }));
              }
          }
      } else {
          // Lógica Local Original (INTACTA)
          if (type === 'income') setLocalIncomes(prev => [data, ...prev]);
          else setLocalExpenses(prev => [data, ...prev]);
          setLocalWallets(prev => prev.map(w => w.id === data.walletId ? { ...w, balance: type === 'income' ? w.balance + Number(data.amount) : w.balance - Number(data.amount) } : w));
      }
  };


  // --- UPDATE TRANSACTION (VERSIÓN BLINDADA: BÚSQUEDA SEGURA) ---
// --- UPDATE TRANSACTION (VERSIÓN DEPURADA Y SEGURA) ---
  // --- UPDATE TRANSACTION (VERSIÓN FINAL HÍBRIDA: CLOUD + LOCAL) ---
const updateTransaction = async (newItem) => {
    console.log("🔄 Iniciando actualización...", newItem);

    // =======================================================
    // 🌐 MODO ONLINE (CON USUARIO) - FUENTE DE VERDAD: DB
    // =======================================================
    if (user) {
        // 1. OBTENER LA VERDAD ABSOLUTA (Snapshot previo desde Supabase)
        const { data: originalDbItem, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', newItem.id)
            .single();

        if (fetchError || !originalDbItem) {
            console.error("❌ Error recuperando original:", fetchError);
            alert("Error de sincronización. Recarga la página.");
            return;
        }

        const oldAmount = Number(originalDbItem.amount);
        const oldWalletId = originalDbItem.wallet_id;
        const oldType = originalDbItem.type;

        const newAmount = Number(newItem.amount);
        const newWalletId = newItem.walletId;
        const newType = newItem.type;

        // A. ACTUALIZAR DB
        const { id, walletId, ...rest } = newItem;
        const dbData = { ...rest, wallet_id: walletId || null }; 

        const { error: updateError } = await supabase
            .from('transactions')
            .update(dbData)
            .eq('id', newItem.id);

        if (updateError) { console.error(updateError); return; }

        // B. CÁLCULO DE SALDOS (REVERTIR + APLICAR)
        let updatedWallets = [...wallets];

        // Revertir (Wallet Vieja)
        if (oldWalletId) {
            updatedWallets = updatedWallets.map(w => {
                if (String(w.id) === String(oldWalletId)) {
                    const current = Number(w.balance);
                    const reversal = oldType === 'income' ? -oldAmount : oldAmount;
                    return { ...w, balance: current + reversal };
                }
                return w;
            });
        }

        // Aplicar (Wallet Nueva)
        if (newWalletId) {
            updatedWallets = updatedWallets.map(w => {
                if (String(w.id) === String(newWalletId)) {
                    const current = Number(w.balance);
                    const application = newType === 'income' ? newAmount : -newAmount;
                    return { ...w, balance: current + application };
                }
                return w;
            });
        }

        // C. GUARDAR SALDOS
        const walletsToUpdateIds = [...new Set([oldWalletId, newWalletId])].filter(Boolean);
        for (const wId of walletsToUpdateIds) {
            const walletState = updatedWallets.find(w => String(w.id) === String(wId));
            if (walletState) {
                await supabase.from('wallets').update({ balance: walletState.balance }).eq('id', wId);
            }
        }

        // D. ACTUALIZAR UI
        setCloudData(p => {
            const listKey = newType === 'income' ? 'incomes' : 'expenses';
            return {
                ...p,
                [listKey]: p[listKey].map(x => x.id === newItem.id ? newItem : x),
                wallets: updatedWallets
            };
        });

    } else {
        // =======================================================
        // 🏠 MODO LOCAL (SIN USUARIO) - FUENTE DE VERDAD: MEMORIA
        // =======================================================
        
        // 1. Buscamos el original en los arrays locales
        const allLocals = [...localIncomes, ...localExpenses];
        const originalItem = allLocals.find(t => t.id === newItem.id);

        if (!originalItem) {
            console.error("No se encontró el item local original");
            return;
        }

        const oldAmount = Number(originalItem.amount);
        const oldWalletId = originalItem.walletId;
        const newAmount = Number(newItem.amount);
        const newWalletId = newItem.walletId;

        // 2. Actualizamos Saldos Locales (Misma lógica matemática: Revertir + Aplicar)
        setLocalWallets(prevWallets => {
            return prevWallets.map(w => {
                let balance = Number(w.balance);

                // Paso A: Revertir impacto anterior (si tenía wallet)
                if (oldWalletId && String(w.id) === String(oldWalletId)) {
                    const reversal = originalItem.type === 'income' ? -oldAmount : oldAmount;
                    balance += reversal;
                }

                // Paso B: Aplicar nuevo impacto (si tiene wallet)
                if (newWalletId && String(w.id) === String(newWalletId)) {
                    const application = newItem.type === 'income' ? newAmount : -newAmount;
                    balance += application;
                }

                return { ...w, balance };
            });
        });

        // 3. Actualizamos la lista de transacciones local
        if (newItem.type === 'income') {
            setLocalIncomes(prev => prev.map(x => x.id === newItem.id ? newItem : x));
        } else {
            setLocalExpenses(prev => prev.map(x => x.id === newItem.id ? newItem : x));
        }
    }
};

  // --- DELETE TRANSACTION (Inmune a Cuentas Borradas) ---
const deleteTransaction = async (id, type) => {
    if (user) {
        // 1. Buscamos la transacción en memoria antes de borrarla
        // (Necesitamos saber cuánto valía y de qué wallet era)
        const list = type === 'income' ? incomes : expenses;
        const tx = list.find(t => t.id === id);

        // 2. Borramos de Supabase SIEMPRE (exista la wallet o no)
        const { error } = await supabase.from('transactions').delete().eq('id', id).select();
        
        if (error) {
            console.error("Error borrando:", error);
            return;
        }

        // 3. Lógica de Saldos (CON PROTECCIÓN)
        if (tx) {
            // Buscamos si la wallet todavía existe
            const wallet = wallets.find(w => w.id === tx.walletId);

            if (wallet) {
                // CASO A: La wallet existe -> Le devolvemos/quitamos el dinero
                console.log(`Devolviendo saldo a wallet: ${wallet.name}`);
                const newBal = type === 'income' 
                    ? Number(wallet.balance) - Number(tx.amount) 
                    : Number(wallet.balance) + Number(tx.amount);

                await supabase.from('wallets').update({balance: newBal}).eq('id', wallet.id);

                // Actualizamos wallet en pantalla
                setCloudData(p => ({
                    ...p,
                    wallets: p.wallets.map(w => w.id === wallet.id ? {...w, balance: newBal} : w)
                }));
            } else {
                // CASO B: La wallet YA NO existe -> Solo avisamos y seguimos
                console.warn("⚠️ La cuenta asociada fue borrada anteriormente. Se omite el ajuste de saldo.");
            }
        }

        // 4. Actualizamos la lista visual (Quitamos la transacción)
        setCloudData(p => {
            const listKey = type === 'income' ? 'incomes' : 'expenses';
            return {
                ...p,
                [listKey]: p[listKey].filter(x => x.id !== id)
            };
        });

    } else {
        // Lógica Local (Offline) - Intacta
        const list = type === 'income' ? localIncomes : localExpenses;
        const item = list.find(t => t.id === id);
        if (type === 'income') setLocalIncomes(prev => prev.filter(t => t.id !== id));
        else setLocalExpenses(prev => prev.filter(t => t.id !== id));
        
        if (item) {
            // Protección local también
            const walletExists = localWallets.find(w => w.id === item.walletId);
            if(walletExists) {
                setLocalWallets(prev => prev.map(w => w.id === item.walletId ? { ...w, balance: type === 'income' ? w.balance - Number(item.amount) : w.balance + Number(item.amount) } : w));
            }
        }
    }
}; 
 

  // --- SETTERS LEGACY (INTACTOS) ---
  const setGoalsWrapper = (val) => { if(!user) setLocalGoals(val); };
  const setSubscriptionsWrapper = (val) => { if(!user) setLocalSubscriptions(val); };
  const setBudgetsWrapper = (val) => { if(!user) setLocalBudgets(val); };
  const setCategoriesWrapper = (val) => { if(!user) setLocalCategories(val); };
  const setIncomeCategoriesWrapper = (val) => { if(!user) setLocalIncomeCategories(val); };
  const setWorkLogsWrapper = (val) => { if(!user) setLocalWorkLogs(val); };
  const setCompaniesWrapper = (val) => { if(!user) setLocalCompanies(val); };
  const setWalletsWrapper = (val) => { if(!user) setLocalWallets(val); };

  // --- RESTO DE CRUDs HÍBRIDOS ---
  // --- ADD GOAL (CORREGIDO: Mapeo de columnas) ---
const addGoal = async (item) => { 
    if(user) { 
        // 1. Preparamos el objeto para Supabase (snake_case)
        const dbData = {
            user_id: user.id,
            name: item.name,
            target: item.target,
            saved: item.saved,
            deadline: item.deadline || null,
            frequency: item.frequency,
            installment: item.installment,
            // icon: item.icon, // Si usas iconos
            
            // EL CULPABLE HABITUAL: Mapeamos startDate -> start_date
            start_date: item.startDate || null 
        };

        const {data, error} = await supabase.from('goals').insert([dbData]).select();
        
        if (error) {
            console.error("Error creando meta:", error);
            return;
        }

        if(data) {
            // 2. Convertimos de vuelta para la App
            const formatted = {
                ...data[0],
                startDate: data[0].start_date // Leemos start_date como startDate
            };
            setCloudData(p => ({...p, goals: [...p.goals, formatted]})); 
        }
    } 
    else setLocalGoals([...localGoals, item]); 
};

// --- UPDATE GOAL (CORREGIDO) ---
const updateGoal = async (item) => { 
    if(user) { 
        // 1. Preparamos datos para actualizar
        const dbData = {
            name: item.name,
            target: item.target,
            saved: item.saved,
            deadline: item.deadline || null,
            frequency: item.frequency,
            installment: item.installment,
            // icon: item.icon,
            start_date: item.startDate || null // Mapeo crítico
        };

        const {data, error} = await supabase.from('goals').update(dbData).eq('id', item.id).select();
        
        if (error) {
            console.error("Error actualizando meta:", error);
            return;
        }

        if (data) {
            const formatted = { ...data[0], startDate: data[0].start_date };
            setCloudData(p => ({
                ...p, 
                goals: p.goals.map(x => x.id === item.id ? formatted : x)
            })); 
        }
    } 
    else setLocalGoals(localGoals.map(x => x.id === item.id ? item : x)); 
};
  const deleteGoal = async (id) => { 
      if(user) { await supabase.from('goals').delete().eq('id', id); setCloudData(p=>({...p, goals:p.goals.filter(x=>x.id!==id)})); } 
      else setLocalGoals(localGoals.filter(x=>x.id!==id)); 
  };

  const addSubscription = async (item) => { if(user){const {id,...r}=item;const {data}=await supabase.from('subscriptions').insert([{...r,user_id:user.id}]).select();if(data)setCloudData(p=>({...p,subscriptions:[...p.subscriptions,data[0]]}))}else setLocalSubscriptions([...localSubscriptions,item])};
  const updateSubscription = async (item) => { if(user){const {data}=await supabase.from('subscriptions').update(item).eq('id',item.id).select();if(data)setCloudData(p=>({...p,subscriptions:p.subscriptions.map(x=>x.id===item.id?data[0]:x)}))}else setLocalSubscriptions(localSubscriptions.map(x=>x.id===item.id?item:x))};
  const deleteSubscription = async (id) => { if(user){await supabase.from('subscriptions').delete().eq('id',id);setCloudData(p=>({...p,subscriptions:p.subscriptions.filter(x=>x.id!==id)}))}else setLocalSubscriptions(localSubscriptions.filter(x=>x.id!==id))};

  const addBudget = async (item) => { if(user){const {id,...r}=item;const {data}=await supabase.from('budgets').insert([{...r,user_id:user.id}]).select();if(data)setCloudData(p=>({...p,budgets:[...p.budgets,data[0]]}))}else setLocalBudgets([...localBudgets,item])};
  const updateBudget = async (item) => { if(user){const {data}=await supabase.from('budgets').update(item).eq('id',item.id).select();if(data)setCloudData(p=>({...p,budgets:p.budgets.map(x=>x.id===item.id?data[0]:x)}))}else setLocalBudgets(localBudgets.map(x=>x.id===item.id?item:x))};
  const deleteBudget = async (id) => { if(user){await supabase.from('budgets').delete().eq('id',id);setCloudData(p=>({...p,budgets:p.budgets.filter(x=>x.id!==id)}))}else setLocalBudgets(localBudgets.filter(x=>x.id!==id))};

  const addCompany = async (item) => { 
      if(user){
          const {id, payDay, hasTips, payDayAnchor, ...r}=item;
          const dbData = {...r, user_id:user.id, pay_day: payDay, has_tips: hasTips, pay_day_anchor: payDayAnchor};
          const {data}=await supabase.from('companies').insert([dbData]).select();
          if(data) {
              const formatted = {...data[0], payDay: data[0].pay_day, hasTips: data[0].has_tips, payDayAnchor: data[0].pay_day_anchor};
              setCloudData(p=>({...p,companies:[...p.companies, formatted]}));
          }
      } else setLocalCompanies([...localCompanies,item]);
  };
  // --- UPDATE COMPANY (CORREGIDO: ACTUALIZA, NO DUPLICA) ---
const updateCompany = async (item) => {
    if (user) {
        // 1. Mapeamos camelCase a snake_case para la base de datos
        const { id, payDay, hasTips, payDayAnchor, ...rest } = item;
        const dbData = {
            ...rest,
            pay_day: payDay,
            has_tips: hasTips,
            pay_day_anchor: payDayAnchor
        };

        // 2. Actualizamos buscando por ID
        const { error } = await supabase
            .from('companies')
            .update(dbData)
            .eq('id', id);

        if (error) console.error("Error actualizando empresa:", error);

        // 3. Actualizamos la UI
        setCloudData(p => ({
            ...p,
            companies: p.companies.map(c => c.id === item.id ? item : c)
        }));
    } else {
        // Modo Local
        setLocalCompanies(prev => prev.map(c => c.id === item.id ? item : c));
    }
};

const deleteCompany = async (id) => { if(window.confirm("¿Eliminar?")){ if(user){await supabase.from('companies').delete().eq('id',id);setCloudData(p=>({...p,companies:p.companies.filter(x=>x.id!==id)}))}else setLocalCompanies(localCompanies.filter(x=>x.id!==id))} };

  const addWorkLog = async (item) => { 
      if(user){
          const {id, companyId, companyName, workDate, startTime, endTime, paymentDate, ...r}=item;
          const dbData = {...r, user_id:user.id, company_id: companyId, company_name: companyName, work_date: workDate, start_time: startTime, end_time: endTime, payment_date: paymentDate, status:'pending'};
          const {data}=await supabase.from('work_logs').insert([dbData]).select();
          if(data) {
              const formatted = {...data[0], companyId: data[0].company_id, companyName: data[0].company_name, workDate: data[0].work_date, startTime: data[0].start_time, endTime: data[0].end_time, paymentDate: data[0].payment_date};
              setCloudData(p=>({...p,workLogs:[...p.workLogs, formatted]}));
          }
      } else setLocalWorkLogs([...localWorkLogs,{...item,status:'pending'}]);
  };
    // --- UPDATE WORK LOG (CORREGIDO: ACTUALIZA, NO DUPLICA) ---
    const updateWorkLog = async (item) => {
        // Si hay usuario, actualizamos en Supabase
        if (user) {
            console.log("🔄 Actualizando turno...", item);
            
            // 1. Mapeamos de camelCase (App) a snake_case (Base de Datos)
            const { id, companyId, companyName, workDate, startTime, endTime, paymentDate, ...rest } = item;
            
            const dbData = {
                ...rest,
                company_id: companyId,     // Importante
                company_name: companyName, // Importante
                work_date: workDate,
                start_time: startTime,
                end_time: endTime,
                payment_date: paymentDate
            };

            // 2. Ejecutamos el UPDATE buscando por ID
            const { error } = await supabase
                .from('work_logs')
                .update(dbData)
                .eq('id', id); // <--- La clave: busca el ID y edita ESE registro

            if (error) {
                console.error("Error actualizando turno:", error);
                return;
            }

            // 3. Actualizamos la vista (UI)
            setCloudData(prev => ({
                ...prev,
                workLogs: prev.workLogs.map(log => log.id === item.id ? item : log)
            }));

        } else {
            // LÓGICA LOCAL (Offline) - Esta ya estaba bien, pero la dejamos por seguridad
            setLocalWorkLogs(prev => prev.map(log => log.id === item.id ? item : log));
        }
    };

  const deleteWorkLog = async (id) => { if(user){await supabase.from('work_logs').delete().eq('id',id);setCloudData(p=>({...p,workLogs:p.workLogs.filter(x=>x.id!==id)}))}else setLocalWorkLogs(localWorkLogs.filter(x=>x.id!==id))};

  const addEvent = async (item) => { if(user){const {id,...r}=item;const {data}=await supabase.from('events').insert([{...r,user_id:user.id}]).select();if(data)setCloudData(p=>({...p,events:[...p.events,data[0]]}))}else setLocalEvents([...localEvents,item])};
  const updateEvent = async (item) => { if(user){const {data}=await supabase.from('events').update(item).eq('id',item.id).select();if(data)setCloudData(p=>({...p,events:p.events.map(x=>x.id===item.id?data[0]:x)}))}else setLocalEvents(localEvents.map(x=>x.id===item.id?item:x))};
  const deleteEvent = async (id) => { if(user){await supabase.from('events').delete().eq('id',id);setCloudData(p=>({...p,events:p.events.filter(x=>x.id!==id)}))}else setLocalEvents(localEvents.filter(x=>x.id!==id))};

  const addShoppingItem = async (item) => { 
      if(user){
          // 1. Extraemos TAMBIÉN 'cost' y 'tags' para que NO se vayan en 'r' automáticamente
          const {id, isFavorite, isAcquired, cost, tags, ...r} = item;
          
          // 2. Construimos el objeto 'dbData' asignando los nombres correctos para Supabase
          const dbData = {
              ...r, // Aquí va name, location, date...
              user_id: user.id, 
              is_favorite: isFavorite, 
              is_acquired: isAcquired,
              
              // --- AQUÍ ESTÁ LA CORRECCIÓN (TRADUCCIÓN) ---
              price: Number(cost) || 0,  // Tu App dice 'cost' -> Supabase recibe 'price'
              category: Array.isArray(tags) ? tags.join(' ') : (tags || '') // Tu App dice 'tags' -> Supabase recibe 'category'
          };

          const {data, error} = await supabase.from('shopping_items').insert([dbData]).select();
          
          if (error) {
              console.error("Error Supabase:", error); // Para ver si falla algo más
              return;
          }

          if(data) {
              // 3. Al recibir la respuesta, traducimos de vuelta para la App
              const formatted = {
                  ...data[0], 
                  isFavorite: data[0].is_favorite, 
                  isAcquired: data[0].is_acquired,
                  cost: data[0].price, // Recuperamos 'price' y lo guardamos como 'cost'
                  tags: data[0].category ? data[0].category.split(' ') : [] // Recuperamos string y lo volvemos array
              };
              setCloudData(p=>({...p,shoppingList:[...p.shoppingList, formatted]}));
          }
      } else setLocalShoppingList([item,...localShoppingList]);
  };
  const toggleShoppingStatus = (id) => { 
      const item = shoppingList.find(i=>i.id===id); 
      if(item) {
          const updated = {...item, isAcquired: !item.isAcquired}; // Local format
          if(user) {
              supabase.from('shopping_items').update({is_acquired: updated.isAcquired}).eq('id', id).then();
              setCloudData(p=>({...p, shoppingList: p.shoppingList.map(x=>x.id===id?updated:x)}));
          } else setLocalShoppingList(prev => prev.map(x=>x.id===id?updated:x));
      }
  };
  const toggleShoppingFavorite = (id) => { 
      const item = shoppingList.find(i=>i.id===id); 
      if(item) {
          const updated = {...item, isFavorite: !item.isFavorite};
          if(user) {
              supabase.from('shopping_items').update({is_favorite: updated.isFavorite}).eq('id', id).then();
              setCloudData(p=>({...p, shoppingList: p.shoppingList.map(x=>x.id===id?updated:x)}));
          } else setLocalShoppingList(prev => prev.map(x=>x.id===id?updated:x));
      }
  };
  const deleteShoppingItem = async (id) => { if(user){await supabase.from('shopping_items').delete().eq('id',id);setCloudData(p=>({...p,shoppingList:p.shoppingList.filter(x=>x.id!==id)}))}else setLocalShoppingList(localShoppingList.filter(x=>x.id!==id))};
  // --- UPDATE SHOPPING ITEM (CORREGIDO: ACTUALIZA, NO DUPLICA) ---
  const updateShoppingItem = async (item) => {
      if (user) {
          // 1. Extraemos y preparamos los datos EXACTOS para Supabase
          //    (Igual que hicimos en el 'add', hay que traducir manualmente)
          const dbData = {
              name: item.name,
              location: item.location || '',
              date: item.date || null,
              
              // TRADUCCIÓN MANUAL (App -> Base de Datos)
              price: Number(item.cost) || 0, 
              category: Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''),
              
              is_favorite: item.isFavorite,
              is_acquired: item.isAcquired
          };

          // 2. ENVIAMOS LA ACTUALIZACIÓN
          //    Nota: .update() en vez de .insert() y .eq('id', item.id) es VITAL
          const { error } = await supabase
              .from('shopping_items')
              .update(dbData)
              .eq('id', item.id);

          if (error) {
              console.error("Error actualizando compra:", error);
              return;
          }

          // 3. ACTUALIZAMOS EL ESTADO LOCAL (UI)
          setCloudData(p => ({
              ...p,
              shoppingList: p.shoppingList.map(i => i.id === item.id ? item : i)
          }));

      } else {
          // Modo Local (Sin usuario logueado)
          setLocalShoppingList(prev => prev.map(i => i.id === item.id ? item : i));
      }
  };

  
  const updateProfile = async (key, val) => {
      try { await supabase.from('profiles').update({[key]: val}).eq('id', user.id); 
            setCloudData(p => ({...p, preferences: {...p.preferences, [key === 'theme_color' ? 'theme' : (key==='dark_mode'?'dark':(key==='privacy_mode'?'privacy':'semantic'))]: val }})); 
      } catch(e) {}
  };

  const setDarkMode = (val) => { if(user) updateProfile('dark_mode', val); else setLocalDarkMode(val); };
  const setThemeColor = (val) => { if(user) updateProfile('theme_color', val); else setLocalThemeColor(val); };
  const setUseSemanticColors = (val) => { if(user) updateProfile('semantic_mode', val); else setLocalUseSemanticColors(val); }; 
  const setPrivacyMode = (val) => { if(user) updateProfile('privacy_mode', val); else setLocalPrivacyMode(val); };

  // --- MARK WORK AS PAID (CORREGIDO) ---
const markWorkAsPaid = (log, walletId) => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Crear el objeto de Ingreso
    const newIncome = { 
        id: Date.now().toString(), 
        name: `Pago: ${log.companyName}`, 
        amount: Number(log.total || 0), // Aseguramos que sea número
        category: 'Salario', 
        date: today, 
        walletId, 
        type: 'income',
        // ERROR ANTERIOR: "details" no existe en tu tabla transactions
        description: `Pago horas ${log.companyName}` // CORRECCIÓN: Usamos 'description'
    };

    // 2. Guardar la transacción
    addTransaction('income', newIncome); 
    
    // 3. Actualizar el Turno
    // ERROR ANTERIOR: Enviabas 'paidDate', pero updateWorkLog espera 'paymentDate'
    updateWorkLog({ 
        ...log, 
        status: 'paid', 
        paymentDate: today // CORRECCIÓN: paymentDate (camelCase) será convertido a payment_date por updateWorkLog
    });
};
  // CORRECCIÓN: Usamos 'paymentDate' (que updateWorkLog sabe manejar) en vez de 'paidDate'
// Además usamos 'null' para limpiar la fecha en la base de datos correctamente.
const unmarkWorkAsPaid = (log) => updateWorkLog({ 
    ...log, 
    status: 'pending', 
    paymentDate: null 
});
  // --- COBRAR MÚLTIPLES TURNOS (Genera Ingreso + Actualiza Saldos + Marca Pagados) ---
  const payWorkLogs = async (logsToPay, walletId) => {
    if (!user || logsToPay.length === 0) return;

    console.log("💰 Cobrando turnos masivos...", logsToPay);

    // 1. Calcular el Total
    const totalAmount = logsToPay.reduce((sum, log) => sum + Number(log.total || 0), 0);
    const today = new Date().toISOString().split('T')[0];

    // 2. Crear la Transacción de INGRESO
    const transactionData = {
        user_id: user.id,
        name: `Cobro Trabajos (${logsToPay.length} turnos)`,
        description: `Pago acumulado de: ${logsToPay.map(l => l.companyName).join(', ')}`,
        amount: totalAmount,
        type: 'income',
        category: 'Salario', 
        wallet_id: walletId,
        date: today
    };

    const { error: txError } = await supabase.from('transactions').insert([transactionData]).select();
    
    if (txError) {
        console.error("Error creando ingreso:", txError);
        alert("Error al cobrar.");
        return;
    }

    // 3. Actualizar Saldo de la Billetera
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
        const newBalance = Number(wallet.balance) + totalAmount;
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId);
        
        // Actualizamos saldo en local (UI)
        setCloudData(p => ({
            ...p,
            wallets: p.wallets.map(w => w.id === walletId ? { ...w, balance: newBalance } : w)
        }));
    }

    // 4. Marcar los Turnos como PAGADOS en DB
    const logIds = logsToPay.map(l => l.id);
    const { error: logsError } = await supabase
        .from('work_logs')
        .update({ status: 'paid', payment_date: today }) 
        .in('id', logIds);

    // 5. Refrescar los logs en la UI
    setCloudData(p => ({
        ...p,
        workLogs: p.workLogs.map(log => logIds.includes(log.id) ? { ...log, status: 'paid', paymentDate: today } : log)
    }));
    
    alert(`¡Cobrado exitosamente! +$${totalAmount}`);
  };



  // --- CATEGORÍAS HÍBRIDAS (CRUD) ---
    const addCategory = async (cat, type) => {
        if (user) {
            // Guardar en Supabase (Tabla 'profiles' o una nueva 'categories')
            // Si las guardas en profiles como un array:
            const column = type === 'income' ? 'income_categories' : 'categories';
            const currentList = type === 'income' ? incomeCategories : categories;
            
            if (!currentList.includes(cat)) {
                const newList = [...currentList, cat];
                await supabase.from('profiles').update({ [column]: newList }).eq('id', user.id);
                setCloudData(p => ({ ...p, [type === 'income' ? 'incomeCategories' : 'categories']: newList }));
            }
        } else {
            // Lógica Local
            if (type === 'income') {
                if (!localIncomeCategories.includes(cat)) setLocalIncomeCategories([...localIncomeCategories, cat]);
            } else {
                if (!localCategories.includes(cat)) setLocalCategories([...localCategories, cat]);
            }
        }
    };

    const updateCategory = async (oldN, newN, type) => {
    if (user) {
        const column = type === 'income' ? 'income_categories' : 'categories';
        const currentList = type === 'income' ? incomeCategories : categories;
        const newList = currentList.map(c => c === oldN ? newN : c);
        
        // Actualizar en Supabase
        await supabase.from('profiles').update({ [column]: newList }).eq('id', user.id);
        
        // Actualizar estado local de la nube
        setCloudData(p => ({ 
            ...p, 
            [type === 'income' ? 'incomeCategories' : 'categories']: newList 
        }));
    } else {
        // Lógica para modo sin sesión (Local)
        if (type === 'income') {
            setLocalIncomeCategories(prev => prev.map(c => c === oldN ? newN : c));
            setLocalIncomes(prev => prev.map(i => i.category === oldN ? {...i, category: newN} : i));
        } else {
            setLocalCategories(prev => prev.map(c => c === oldN ? newN : c));
            setLocalExpenses(prev => prev.map(e => e.category === oldN ? {...e, category: newN} : e));
            setLocalBudgets(prev => prev.map(b => b.category === oldN ? {...b, category: newN} : b));
        }
    }
    };

    const deleteCategory = async (cat, type) => {
        if (user) {
            const column = type === 'income' ? 'income_categories' : 'categories';
            const currentList = type === 'income' ? incomeCategories : categories;
            const newList = currentList.filter(c => c !== cat);
            
            await supabase.from('profiles').update({ [column]: newList }).eq('id', user.id);
            setCloudData(p => ({ ...p, [type === 'income' ? 'incomeCategories' : 'categories']: newList }));
        } else {
            if (type === 'income') setLocalIncomeCategories(prev => prev.filter(c => c !== cat));
            else setLocalCategories(prev => prev.filter(c => c !== cat));
        }
    };


  const value = {
    incomes, expenses, wallets, subscriptions, goals, budgets, workLogs, companies, events, shoppingList,
    categories, incomeCategories, 
    chartIncomes, chartExpenses, filteredIncomes, filteredExpenses, 
    dateFilter, setDateFilter, selectedWalletId, setSelectedWalletId, selectedCategory, setSelectedCategory,
    displayBalance, totalBalance,
    setGoals: setGoalsWrapper, setSubscriptions: setSubscriptionsWrapper, setBudgets: setBudgetsWrapper, setWallets: setWalletsWrapper, setWorkLogs: setWorkLogsWrapper, setCompanies: setCompaniesWrapper, setCategories: setCategoriesWrapper, setIncomeCategories: setIncomeCategoriesWrapper,
    addCategory, updateCategory, deleteCategory, getBudgetProgress, calculateProjection, calculatePayDate, getGoalDetails, 
    deleteBudget, deleteWallet, deleteGoal, deleteSubscription,
    updateWallet, updateGoal, updateSubscription, updateBudget, updateTransaction,
    addWorkLog, updateWorkLog, deleteWorkLog, markWorkAsPaid, unmarkWorkAsPaid, payWorkLogs,
    addCompany, updateCompany, deleteCompany,
    darkMode, setDarkMode, themeColor, setThemeColor, availableThemes, privacyMode, setPrivacyMode,
    addTransaction, deleteTransaction, isAllExpanded, setIsAllExpanded, 
    addEvent, updateEvent, deleteEvent,
    useSemanticColors, setUseSemanticColors,
    addShoppingItem, toggleShoppingStatus, toggleShoppingFavorite, deleteShoppingItem, updateShoppingItem,
    currency, setCurrency, formatMoney, 
    addWallet, addGoal, addSubscription, addBudget
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancial = () => useContext(FinancialContext);