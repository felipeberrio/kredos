import React, { useState } from 'react';
import { useFinancial } from './context/FinancialContext';
import { MainHero } from './layout/MainHero';
import { WalletSection } from './layout/WalletSection';
import { CategoriesSection } from './layout/CategoriesSection';
import { TransactionForm } from './components/TransactionForm';
import { HistorySection } from './layout/HistorySection';
import { SubscriptionSection } from './layout/SubscriptionSection';
import { GoalsSection } from './layout/GoalsSection';
import { FinancialCharts } from './components/FinancialCharts';
import { DateFilter } from './components/DateFilter';
import { Modal } from './components/Modal';
import { Moon, Sun, Eye, EyeOff, Target, Calendar, Wallet } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const { 
    darkMode, setDarkMode, 
    privacyMode, setPrivacyMode, 
    wallets, setWallets,
    goals, setGoals: setGlobalGoals,
    subscriptions, setSubscriptions: setGlobalSubs
  } = useFinancial();
  
  // ORDENAMIENTO
  const [leftOrder, setLeftOrder] = useLocalStorage('fin_order_layout', ['wallets', 'categories', 'goals', 'subs']);

  // ESTADOS
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  
  // Inputs Modales
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubPrice, setNewSubPrice] = useState('');
  const [newSubDay, setNewSubDay] = useState('');

  // LÓGICA DE MOVER SECCIONES
  const moveSection = (index, direction) => {
    const newOrder = [...leftOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setLeftOrder(newOrder);
  };

  // HANDLERS
  const handleOpenModal = (type) => { setModalType(type); setModalOpen(true); };
  
  const handleCreateWallet = (e) => {
    e.preventDefault(); if(!newWalletName) return;
    setWallets([...wallets, { id: Date.now().toString(), name: newWalletName, type: 'cash', balance: Number(newWalletBalance) || 0 }]);
    closeModal();
  };
  const handleCreateGoal = (e) => {
    e.preventDefault(); if(!newGoalName) return;
    setGlobalGoals([...goals, { id: Date.now().toString(), name: newGoalName, target: Number(newGoalTarget), saved: Number(newGoalSaved) || 0 }]);
    closeModal();
  };
  const handleCreateSub = (e) => {
    e.preventDefault(); if(!newSubName) return;
    setGlobalSubs([...subscriptions, { id: Date.now().toString(), name: newSubName, price: Number(newSubPrice), day: Number(newSubDay) || 1 }]);
    closeModal();
  };
  const closeModal = () => {
    setModalOpen(false);
    setNewWalletName(''); setNewWalletBalance('');
    setNewGoalName(''); setNewGoalTarget(''); setNewGoalSaved('');
    setNewSubName(''); setNewSubPrice(''); setNewSubDay('');
  };

  // RENDERIZADOR DINÁMICO
  const renderLeftSection = (key, index) => {
    const props = {
      key,
      onMoveUp: () => moveSection(index, 'up'),
      onMoveDown: () => moveSection(index, 'down'),
      isFirst: index === 0,
      isLast: index === leftOrder.length - 1,
      onAdd: () => {
         if(key === 'wallets') handleOpenModal('wallet');
         if(key === 'goals') handleOpenModal('goal');
         if(key === 'subs') handleOpenModal('sub');
      }
    };

    switch(key) {
      case 'wallets': return <WalletSection {...props} />;
      case 'categories': return <CategoriesSection {...props} />; // Categories maneja su propio Add
      case 'goals': return <GoalsSection {...props} />;
      case 'subs': return <SubscriptionSection {...props} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* HEADER */}
      <header className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-opacity-80">
        <h1 className="font-black uppercase italic text-xl tracking-tighter">FinPlan <span className="text-blue-500">PRO</span></h1>
        <DateFilter />
        <div className="flex items-center gap-2">
          <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            {privacyMode ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl transition-transform active:scale-90 ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-white'}`}>
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LADO IZQUIERDO */}
          <div className="lg:col-span-4 space-y-6">
            <MainHero />
            <div className="flex flex-col gap-6">
               {leftOrder.map((key, index) => renderLeftSection(key, index))}
            </div>
          </div>

          {/* LADO DERECHO */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TransactionForm editingItem={editingItem} setEditingItem={setEditingItem} />
              <FinancialCharts />
            </div>
            <HistorySection onEdit={(item) => setEditingItem(item)} />
          </div>
        </div>
      </main>

      {/* MODALES */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={modalType === 'wallet' ? 'Nueva Cuenta' : modalType === 'goal' ? 'Nueva Meta' : 'Nueva Suscripción'}>
        {modalType === 'wallet' && (
          <form onSubmit={handleCreateWallet} className="space-y-4">
            <div className="flex justify-center mb-4"><div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600"><Wallet size={32}/></div></div>
            <input autoFocus className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Nombre" value={newWalletName} onChange={e => setNewWalletName(e.target.value)} />
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Saldo Inicial" value={newWalletBalance} onChange={e => setNewWalletBalance(e.target.value)} />
            <button className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">CREAR</button>
          </form>
        )}
        {modalType === 'goal' && (
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="flex justify-center mb-4"><div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600"><Target size={32}/></div></div>
            <input autoFocus className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Meta" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} />
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Objetivo" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Ahorrado" value={newGoalSaved} onChange={e => setNewGoalSaved(e.target.value)} />
            <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl">CREAR</button>
          </form>
        )}
        {modalType === 'sub' && (
          <form onSubmit={handleCreateSub} className="space-y-4">
            <div className="flex justify-center mb-4"><div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600"><Calendar size={32}/></div></div>
            <input autoFocus className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Servicio" value={newSubName} onChange={e => setNewSubName(e.target.value)} />
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Precio" value={newSubPrice} onChange={e => setNewSubPrice(e.target.value)} />
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none" placeholder="Día Pago" value={newSubDay} onChange={e => setNewSubDay(e.target.value)} />
            <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl">CREAR</button>
          </form>
        )}
      </Modal>
    </div>
  );
}