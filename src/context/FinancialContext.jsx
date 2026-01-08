import React, { createContext, useContext, useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  // DATOS
  const [incomes, setIncomes] = useLocalStorage('fin_incomes', []);
  const [expenses, setExpenses] = useLocalStorage('fin_expenses', []);
  const [wallets, setWallets] = useLocalStorage('fin_wallets', [
    { id: 'w1', name: 'Efectivo', type: 'cash', balance: 0 },
    { id: 'w2', name: 'Banco', type: 'bank', balance: 0 }
  ]);
  const [subscriptions, setSubscriptions] = useLocalStorage('fin_subscriptions', []);
  const [goals, setGoals] = useLocalStorage('fin_goals', []);
  const [categories, setCategories] = useLocalStorage('fin_categories', [
    "🏠 Vivienda", "🍔 Comida", "🚌 Transporte", "💊 Salud", "🎉 Ocio", "📺 Suscripciones", "📱 Tecnología", "🛒 Supermercado"
  ]);

  // CONFIGURACIÓN
  const [darkMode, setDarkMode] = useLocalStorage('fin_dark', false);
  const [themeColor, setThemeColor] = useLocalStorage('fin_theme', '#3b82f6');
  const [privacyMode, setPrivacyMode] = useLocalStorage('fin_privacy', false);

  // --- NUEVO: SISTEMA DE FILTRO DE FECHAS ---
  const getCurrentMonth = () => new Date().toISOString().slice(0, 7); // "2025-01"
  
  const [dateFilter, setDateFilter] = useState({
    mode: 'month', // 'month', 'year', 'custom', 'all'
    value: getCurrentMonth(), // Para mes o año
    from: '', // Para custom
    to: ''    // Para custom
  });

  // Saldo Total (Siempre es el real de las cuentas, no se filtra)
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Lógica de filtrado
  const filterTransaction = (t) => {
    if (dateFilter.mode === 'all') return true;
    if (dateFilter.mode === 'month') return t.date.startsWith(dateFilter.value); // "2025-01"
    if (dateFilter.mode === 'year') return t.date.startsWith(dateFilter.value.substring(0, 4)); // "2025"
    if (dateFilter.mode === 'custom') {
      if (dateFilter.from && t.date < dateFilter.from) return false;
      if (dateFilter.to && t.date > dateFilter.to) return false;
      return true;
    }
    return true;
  };

  // Listas filtradas (Memorizadas para rendimiento)
  const filteredIncomes = useMemo(() => incomes.filter(filterTransaction), [incomes, dateFilter]);
  const filteredExpenses = useMemo(() => expenses.filter(filterTransaction), [expenses, dateFilter]);

  // --- ACTIONS ---
  const addTransaction = (type, data) => {
    if (type === 'income') setIncomes(prev => [data, ...prev]);
    else setExpenses(prev => [data, ...prev]);

    setWallets(prev => prev.map(w => w.id === data.walletId 
      ? { ...w, balance: type === 'income' ? w.balance + Number(data.amount) : w.balance - Number(data.amount) } 
      : w
    ));
  };

  const deleteTransaction = (id, type) => {
    const list = type === 'income' ? incomes : expenses;
    const item = list.find(t => t.id === id);
    if (type === 'income') setIncomes(prev => prev.filter(t => t.id !== id));
    else setExpenses(prev => prev.filter(t => t.id !== id));

    if (item) {
      setWallets(prev => prev.map(w => w.id === item.walletId 
        ? { ...w, balance: type === 'income' ? w.balance - Number(item.amount) : w.balance + Number(item.amount) } 
        : w
      ));
    }
  };

  const updateTransaction = (oldItem, newItem) => {
    // 1. Revertir impacto anterior en wallets
    setWallets(current => current.map(w => {
      if (w.id === oldItem.walletId) {
        return { ...w, balance: oldItem.type === 'income' ? w.balance - Number(oldItem.amount) : w.balance + Number(oldItem.amount) };
      }
      return w;
    }));

    // 2. Aplicar nuevo impacto (timeout 0 para asegurar ciclo de render)
    setTimeout(() => {
      setWallets(current => current.map(w => {
        if (w.id === newItem.walletId) {
          return { ...w, balance: newItem.type === 'income' ? w.balance + Number(newItem.amount) : w.balance - Number(newItem.amount) };
        }
        return w;
      }));
    }, 0);

    // 3. Actualizar listas
    if (newItem.type === 'income') {
      setIncomes(prev => prev.map(i => i.id === oldItem.id ? newItem : i));
    } else {
      setExpenses(prev => prev.map(e => e.id === oldItem.id ? newItem : e));
    }
  };

  const deleteSubscription = (id) => setSubscriptions(prev => prev.filter(s => s.id !== id));
  const addCategory = (newCat) => { if (!categories.includes(newCat)) setCategories([...categories, newCat]); };

  const value = {
    // Datos crudos
    incomes, expenses, wallets, subscriptions, goals, categories,
    // Datos filtrados
    filteredIncomes, filteredExpenses, dateFilter, setDateFilter,
    // Funciones
    setGoals, setSubscriptions, setCategories, addCategory,
    totalBalance, darkMode, setDarkMode,
    themeColor, setThemeColor, privacyMode, setPrivacyMode,
    addTransaction, deleteTransaction, updateTransaction, 
    setWallets, deleteSubscription 
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancial = () => useContext(FinancialContext);