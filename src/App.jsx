import React, { useState, useEffect } from 'react';
import { useFinancial } from './context/FinancialContext';
import { MainHero } from './layout/MainHero';
import { WalletSection } from './layout/WalletSection';
import { CategoriesSection } from './layout/CategoriesSection';
import { BudgetSection } from './layout/BudgetSection';
import { WorkSection } from './layout/WorkSection';
import { TransactionForm } from './components/TransactionForm';
import { HistorySection } from './layout/HistorySection';
import { SubscriptionSection } from './layout/SubscriptionSection';
import { GoalsSection } from './layout/GoalsSection';
import { FinancialCharts } from './components/FinancialCharts';
import { DateFilter } from './components/DateFilter';
import { Modal } from './components/Modal';
import { ProjectionModal } from './components/ProjectionModal';
import { ThemeSelector } from './components/ThemeSelector';
import { Moon, Sun, Eye, EyeOff, Target, Calendar, Wallet, CreditCard, PieChart, Tag, Briefcase, Building2, ChevronsUp, ChevronsDown, Brush, PaintBucket} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { formatCurrency } from './utils/formatters';
import { EventsSection } from './layout/EventsSection';


export default function App() {
  const { 
    darkMode, setDarkMode, privacyMode, setPrivacyMode, themeColor,
    wallets, setWallets, goals, setGoals: setGlobalGoals, 
    subscriptions, setSubscriptions: setGlobalSubs,
    budgets, setBudgets: setGlobalBudgets, categories,
    workLogs, addWorkLog, updateWorkLog, 
    companies, addCompany, updateCompany,
    updateWallet, updateGoal, updateSubscription, updateBudget, updateCategory, isAllExpanded, setIsAllExpanded,
    calculatePayDate,useSemanticColors, setUseSemanticColors // <--- IMPORTANTE: Para autocalcular fecha cobro
  } = useFinancial();
  
  // ORDEN COLUMNA IZQUIERDA (Sin 'work' aquí, porque no cabe)
  const [leftOrder, setLeftOrder] = useLocalStorage('fin_order_layout_v5', ['wallets', 'categories', 'budgets', 'goals', 'subs']);
  
  // ORDEN COLUMNA DERECHA (Nueva zona para Trabajo e Historial)
  const [rightOrder, setRightOrder] = useLocalStorage('fin_order_right_v3', ['work', 'events', 'history']);
  const [editingItem, setEditingItem] = useState(null);
  
  // MODALS
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [projectionOpen, setProjectionOpen] = useState(false);

  // INPUTS GENERALES
  const [newWalletName, setNewWalletName] = useState(''); const [newWalletBalance, setNewWalletBalance] = useState(''); const [newWalletType, setNewWalletType] = useState('cash'); const [newWalletLimit, setNewWalletLimit] = useState('');
  const [newGoalName, setNewGoalName] = useState(''); const [newGoalTarget, setNewGoalTarget] = useState(''); const [newGoalSaved, setNewGoalSaved] = useState('');
  const [newSubName, setNewSubName] = useState(''); const [newSubPrice, setNewSubPrice] = useState(''); const [newSubDay, setNewSubDay] = useState('');
  const [newBudgetCat, setNewBudgetCat] = useState(''); const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [catName, setCatName] = useState('');

  // INPUTS DE TRABAJO (WORK LOG)
  const [selectedCompanyId, setSelectedCompanyId] = useState(''); const [workLocation, setWorkLocation] = useState(''); 
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]); 
  const [workStart, setWorkStart] = useState(''); const [workEnd, setWorkEnd] = useState(''); 
  const [workRate, setWorkRate] = useState(''); const [workPaymentDate, setWorkPaymentDate] = useState(''); 
  const [workTotalCalc, setWorkTotalCalc] = useState(0); const [workHoursCalc, setWorkHoursCalc] = useState(0);

  // INPUTS DE EMPRESA (COMPANY)
  const [compName, setCompName] = useState(''); const [compRate, setCompRate] = useState(''); 
  const [compType, setCompType] = useState('part-time'); const [compFrequency, setCompFrequency] = useState('biweekly'); 
  const [compPayDay, setCompPayDay] = useState(''); const [compPayDayAnchor, setCompPayDayAnchor] = useState(''); 
  const [compTips, setCompTips] = useState(false); 
  const [compSchedule, setCompSchedule] = useState({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });

  // EFECTO: Calcular horas y total en tiempo real
  useEffect(() => { 
      if (workStart && workEnd && workRate) { 
          const [h1, m1] = workStart.split(':').map(Number); 
          const [h2, m2] = workEnd.split(':').map(Number); 
          let diff = (h2 + m2/60) - (h1 + m1/60); 
          if (diff < 0) diff += 24; 
          setWorkHoursCalc(diff.toFixed(2)); 
          setWorkTotalCalc(diff * Number(workRate)); 
      } else { 
          setWorkTotalCalc(0); setWorkHoursCalc(0); 
      } 
  }, [workStart, workEnd, workRate]);

  // EFECTO: Autocompletar Tarifa y Fecha Pago según Empresa
  useEffect(() => { 
      if (selectedCompanyId) { 
          const comp = companies.find(c => c.id === selectedCompanyId); 
          if (comp) { 
              if(!workRate) setWorkRate(comp.rate); 
              const estimatedPay = calculatePayDate(workDate, comp); 
              setWorkPaymentDate(estimatedPay); 
          } 
      } 
  }, [selectedCompanyId, workDate, companies]);

  // GESTIÓN DE ORDENAMIENTO
  const moveLeftSection = (index, direction) => {
    const newOrder = [...leftOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setLeftOrder(newOrder);
  };

  const moveRightSection = (index, direction) => {
    const newOrder = [...rightOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setRightOrder(newOrder);
  };

  // APERTURA DE MODALES
  const handleOpenModal = (type, item = null) => { 
      setModalType(type); setItemToEdit(item); setModalOpen(true); cleanInputs();
      if (item) {
          // Prellenado de datos
          if(type === 'wallet') { setNewWalletName(item.name); setNewWalletBalance(item.balance); setNewWalletType(item.type); setNewWalletLimit(item.limit || ''); }
          if(type === 'goal') { setNewGoalName(item.name); setNewGoalTarget(item.target); setNewGoalSaved(item.saved); }
          if(type === 'sub') { setNewSubName(item.name); setNewSubPrice(item.price); setNewSubDay(item.day); }
          if(type === 'budget') { setNewBudgetCat(item.category); setNewBudgetLimit(item.limit); }
          if(type === 'category') { setCatName(item.name); }
          if(type === 'work') { 
              if(item.status === 'new_entry') { 
                  // Caso especial: Clic en calendario vacío -> Nuevo con fecha
                  setWorkDate(item.workDate); 
              } else { 
                  // Caso: Editar existente
                  setSelectedCompanyId(item.companyId); setWorkLocation(item.location); setWorkDate(item.workDate); 
                  setWorkStart(item.startTime); setWorkEnd(item.endTime); setWorkRate(item.rate); setWorkPaymentDate(item.paymentDate); 
              }
          }
          if(type === 'company') { 
              setCompName(item.name); setCompRate(item.rate); setCompType(item.type); setCompFrequency(item.frequency); 
              setCompPayDay(item.payDay); setCompTips(item.hasTips); setCompPayDayAnchor(item.payDayAnchor || ''); 
              setCompSchedule(item.schedule || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }); 
          }
      } else { 
          if(type === 'budget') setNewBudgetCat(categories[0]); 
      }
  };

  const cleanInputs = () => {
    setNewWalletName(''); setNewWalletBalance(''); setNewWalletType('cash'); setNewWalletLimit('');
    setNewGoalName(''); setNewGoalTarget(''); setNewGoalSaved('');
    setNewSubName(''); setNewSubPrice(''); setNewSubDay('');
    setNewBudgetLimit(''); setCatName('');
    setSelectedCompanyId(''); setWorkLocation(''); setWorkDate(new Date().toISOString().split('T')[0]); setWorkStart(''); setWorkEnd(''); setWorkRate(''); setWorkPaymentDate(''); setWorkTotalCalc(0);
    setCompName(''); setCompRate(''); setCompType('part-time'); setCompFrequency('biweekly'); setCompPayDay(''); setCompTips(false); setCompPayDayAnchor(''); setCompSchedule({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
  };
  
  // SAVE HANDLERS
  const handleSaveWallet = (e) => { e.preventDefault(); if(!newWalletName) return; const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), name: newWalletName, type: newWalletType, balance: Number(newWalletBalance) || 0, limit: newWalletType === 'credit' ? (Number(newWalletLimit) || 0) : 0 }; if(itemToEdit) updateWallet(data); else setWallets([...wallets, data]); closeModal(); };
  const handleSaveGoal = (e) => { e.preventDefault(); if(!newGoalName) return; const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), name: newGoalName, target: Number(newGoalTarget), saved: Number(newGoalSaved) || 0 }; if(itemToEdit) updateGoal(data); else setGlobalGoals([...goals, data]); closeModal(); };
  const handleSaveSub = (e) => { e.preventDefault(); if(!newSubName) return; const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), name: newSubName, price: Number(newSubPrice), day: Number(newSubDay) || 1 }; if(itemToEdit) updateSubscription(data); else setGlobalSubs([...subscriptions, data]); closeModal(); };
  const handleSaveBudget = (e) => { e.preventDefault(); if(!newBudgetLimit) return; if (!itemToEdit && budgets.find(b => b.category === newBudgetCat)) { alert("Ya existe"); return; } const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), category: newBudgetCat, limit: Number(newBudgetLimit) }; if(itemToEdit) updateBudget(data); else setGlobalBudgets([...budgets, data]); closeModal(); };
  const handleSaveCategory = (e) => { e.preventDefault(); if(!catName) return; if(itemToEdit && itemToEdit.type) { updateCategory(itemToEdit.name, catName, itemToEdit.type); } closeModal(); }
  
  const handleSaveWork = (e) => { 
      e.preventDefault(); 
      if(!selectedCompanyId || !workStart || !workEnd) return; 
      const comp = companies.find(c => c.id === selectedCompanyId); 
      const logData = { 
          id: (itemToEdit && itemToEdit.id) ? itemToEdit.id : Date.now().toString(), 
          companyId: selectedCompanyId, companyName: comp ? comp.name : 'Unknown', 
          location: workLocation, workDate, startTime: workStart, endTime: workEnd, 
          rate: Number(workRate), paymentDate: workPaymentDate || workDate, 
          hours: workHoursCalc, total: workTotalCalc, 
          status: (itemToEdit && itemToEdit.status) ? itemToEdit.status : 'pending' 
      }; 
      if(itemToEdit && itemToEdit.id) updateWorkLog(logData); else addWorkLog(logData); 
      closeModal(); 
  };
  
  const handleSaveCompany = (e) => { 
      e.preventDefault(); 
      if(!compName || !compRate) return; 
      const compData = { 
          id: itemToEdit ? itemToEdit.id : Date.now().toString(), 
          name: compName, rate: Number(compRate), type: compType, 
          frequency: compFrequency, payDay: compPayDay, hasTips: compTips, 
          payDayAnchor: compPayDayAnchor, 
          schedule: compType === 'full-time' ? compSchedule : null 
      }; 
      if(itemToEdit) updateCompany(compData); else addCompany(compData); 
      closeModal(); 
  };
  
  const closeModal = () => { setModalOpen(false); cleanInputs(); setItemToEdit(null); };

  // RENDER SECCIONES IZQUIERDA
  const renderLeftSection = (key, index) => {
    const props = { key, onMoveUp: () => moveLeftSection(index, 'up'), onMoveDown: () => moveLeftSection(index, 'down'), isFirst: index === 0, isLast: index === leftOrder.length - 1, onAdd: () => handleOpenModal(key === 'wallets' ? 'wallet' : key === 'goals' ? 'goal' : key === 'subs' ? 'sub' : 'budget'), onEdit: (item) => handleOpenModal(key === 'wallets' ? 'wallet' : key === 'categories' ? 'category' : key === 'goals' ? 'goal' : key === 'subs' ? 'sub' : 'budget', item) };
    switch(key) {
      case 'wallets': return <WalletSection {...props} />;
      case 'categories': return <CategoriesSection {...props} />;
      case 'goals': return <GoalsSection {...props} />;
      case 'subs': return <SubscriptionSection {...props} />;
      case 'budgets': return <BudgetSection {...props} />;
      default: return null;
    }
  };

  // RENDER SECCIONES DERECHA
  const renderRightSection = (key, index) => {
      const props = {
          key,
          onMoveUp: () => moveRightSection(index, 'up'),
          onMoveDown: () => moveRightSection(index, 'down'),
          isFirst: index === 0,
          isLast: index === rightOrder.length - 1,
          onAdd: () => handleOpenModal('work'),
          onAddCompany: () => handleOpenModal('company'),
          onEdit: (item) => handleOpenModal(key === 'work' ? 'work' : 'transaction', item), // 'transaction' abre form general si es history
          onEditCompany: (item) => handleOpenModal('company', item)
      };

      switch(key) {
          case 'work': return <WorkSection {...props} />;
          case 'events': return <EventsSection {...props} />;
          case 'history': return <HistorySection {...props} onEdit={(item) => setEditingItem(item)} />;
          default: return null;
      }
  };

  const modalInputStyle = { backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', color: darkMode ? '#fff' : '#0f172a' };

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <header className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-opacity-80">
        <h1 className="font-black uppercase italic text-xl tracking-tighter">FinPlan <span className="text-blue-500">PRO</span></h1>
        <DateFilter />
        <div className="flex items-center gap-4">
          {/* NUEVO BOTÓN: Alternar Colores Semánticos (Reset a Rojo/Verde) */}
          <button 
              onClick={() => setUseSemanticColors(!useSemanticColors)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  useSemanticColors 
                  ? (darkMode ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-100 text-emerald-600 border-slate-200')
                  : (darkMode ? 'bg-slate-900 text-slate-500 border-transparent' : 'bg-white text-slate-400 border-transparent')
              }`}
              title="Alternar entre colores Rojo/Verde o color del Tema"
          >
              {useSemanticColors ? <PaintBucket size={16}/> : <Brush size={16}/>}
              <span className="hidden md:inline">{useSemanticColors ? 'Semántico' : 'Unicolor'}</span>
          </button>
          <ThemeSelector />
          <div className="flex gap-2">
            {/* Botón Minimizar/Maximizar Todo */}
            <button onClick={() => setIsAllExpanded(!isAllExpanded)}className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-600'}`}title={isAllExpanded ? "Minimizar todo" : "Maximizar todo"}>{isAllExpanded ? <ChevronsUp size={20}/> : <ChevronsDown size={20}/>}</button>
            <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">{privacyMode ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl transition-transform active:scale-90 ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-white'}`}>{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA (Estrecha) */}
          <div className="lg:col-span-4 space-y-6">
            <MainHero />
            <div className="flex flex-col gap-6">{leftOrder.map((key, index) => renderLeftSection(key, index))}</div>
          </div>
          
          {/* COLUMNA DERECHA (Ancha) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TransactionForm editingItem={editingItem} setEditingItem={setEditingItem} />
              <FinancialCharts onOpenProjection={() => setProjectionOpen(true)} />
            </div>
            {/* Lista dinámica derecha */}
            <div className="flex flex-col gap-6">
                {rightOrder.map((key, index) => renderRightSection(key, index))}
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={closeModal} title={itemToEdit ? 'Editar' : 'Crear Nuevo'}>
        {/* WALLET */}
        {modalType === 'wallet' && ( <form onSubmit={handleSaveWallet} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 rounded-full text-white" style={{ backgroundColor: themeColor }}>{newWalletType === 'credit' ? <CreditCard size={32}/> : <Wallet size={32}/>}</div></div> <select className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} value={newWalletType} onChange={(e) => setNewWalletType(e.target.value)}><option value="cash">Efectivo</option><option value="debit">Débito</option><option value="credit">Crédito</option></select> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Nombre" value={newWalletName} onChange={e => setNewWalletName(e.target.value)} /> {newWalletType === 'credit' && <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Cupo Límite" value={newWalletLimit} onChange={e => setNewWalletLimit(e.target.value)} />} <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Saldo Actual" value={newWalletBalance} onChange={e => setNewWalletBalance(e.target.value)} /> <button className="w-full py-4 text-white font-black rounded-xl" style={{ backgroundColor: themeColor }}>{itemToEdit ? 'ACTUALIZAR' : 'GUARDAR'}</button> </form> )}
        
        {/* WORK LOG */}
        {modalType === 'work' && (
            <form onSubmit={handleSaveWork} className="space-y-4">
                <div className="flex justify-center mb-4"><div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><Briefcase size={32}/></div></div>
                <div><label className="text-[10px] font-bold uppercase text-slate-500">Empresa</label><select className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)}><option value="">Seleccionar...</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Fecha</label><input type="date" className="w-full p-3 rounded-xl font-bold outline-none mt-1 text-xs" style={modalInputStyle} value={workDate} onChange={e => setWorkDate(e.target.value)} /></div><div><label className="text-[10px] font-bold uppercase text-slate-500">Lugar</label><input className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={workLocation} onChange={e => setWorkLocation(e.target.value)} /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Inicio</label><input type="time" className="w-full p-3 rounded-xl font-bold outline-none mt-1 text-xs" style={modalInputStyle} value={workStart} onChange={e => setWorkStart(e.target.value)} /></div><div><label className="text-[10px] font-bold uppercase text-slate-500">Fin</label><input type="time" className="w-full p-3 rounded-xl font-bold outline-none mt-1 text-xs" style={modalInputStyle} value={workEnd} onChange={e => setWorkEnd(e.target.value)} /></div></div>
                <div className="grid grid-cols-2 gap-4 items-end"><div><label className="text-[10px] font-bold uppercase text-slate-500">Tarifa/Hora</label><input type="number" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={workRate} onChange={e => setWorkRate(e.target.value)} /></div><div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-right"><span className="text-[9px] font-bold text-slate-400 block">Total ({workHoursCalc}h)</span><span className="text-xl font-black text-emerald-500">{formatCurrency(workTotalCalc)}</span></div></div>
                <div><label className="text-[10px] font-bold uppercase text-slate-500">Fecha de Cobro (Calculada)</label><input type="date" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={workPaymentDate} onChange={e => setWorkPaymentDate(e.target.value)} /></div>
                <button className="w-full py-4 text-white font-black rounded-xl" style={{ backgroundColor: themeColor }}>GUARDAR</button>
            </form>
        )}

        {/* COMPANY */}
        {modalType === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-4">
                <div className="flex justify-center mb-4"><div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><Building2 size={32}/></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Nombre</label><input autoFocus className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={compName} onChange={e => setCompName(e.target.value)} /></div><div><label className="text-[10px] font-bold uppercase text-slate-500">Pago Hora</label><input type="number" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={compRate} onChange={e => setCompRate(e.target.value)} /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Frecuencia</label><select className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={compFrequency} onChange={e => setCompFrequency(e.target.value)}><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option><option value="immediate">Inmediato</option></select></div><div><label className="text-[10px] font-bold uppercase text-slate-500">Próx. Pago (Ref)</label><input type="date" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={compPayDayAnchor} onChange={e => setCompPayDayAnchor(e.target.value)} /></div></div>
                <div className="flex gap-4"><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={compType === 'full-time'} onChange={e => setCompType(e.target.checked ? 'full-time' : 'part-time')} /> Es Full-Time?</label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={compTips} onChange={e => setCompTips(e.target.checked)} /> Incluye Tips?</label></div>
                {compType === 'full-time' && (<div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Horas Estimadas por Día</label><div className="grid grid-cols-4 gap-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (<div key={day} className="text-center"><span className="text-[8px] font-bold uppercase block mb-1">{day}</span><input type="number" className="w-full p-1 rounded text-center text-xs font-bold outline-none border" style={modalInputStyle} value={compSchedule[day.toLowerCase()]} onChange={e => setCompSchedule({...compSchedule, [day.toLowerCase()]: Number(e.target.value)})} /></div>))}</div></div>)}
                <button className="w-full py-4 text-white font-black rounded-xl" style={{ backgroundColor: themeColor }}>GUARDAR EMPRESA</button>
            </form>
        )}

        {/* OTROS (GOAL, SUB, BUDGET, CAT) */}
        {modalType === 'goal' && ( <form onSubmit={handleSaveGoal} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600"><Target size={32}/></div></div> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Meta" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} /> <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Objetivo" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} /> <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Ahorrado" value={newGoalSaved} onChange={e => setNewGoalSaved(e.target.value)} /> <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl">{itemToEdit ? 'ACTUALIZAR' : 'CREAR'}</button> </form> )}
        {modalType === 'sub' && ( <form onSubmit={handleSaveSub} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600"><Calendar size={32}/></div></div> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Servicio" value={newSubName} onChange={e => setNewSubName(e.target.value)} /> <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Precio" value={newSubPrice} onChange={e => setNewSubPrice(e.target.value)} /> <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Día" value={newSubDay} onChange={e => setNewSubDay(e.target.value)} /> <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl">{itemToEdit ? 'ACTUALIZAR' : 'CREAR'}</button> </form> )}
        {modalType === 'budget' && ( <form onSubmit={handleSaveBudget} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-500"><PieChart size={32}/></div></div> <select className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} value={newBudgetCat} onChange={e => setNewBudgetCat(e.target.value)} disabled={!!itemToEdit}> {categories.map(c => <option key={c} value={c}>{c}</option>)} </select> <input type="number" autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Límite" value={newBudgetLimit} onChange={e => setNewBudgetLimit(e.target.value)} /> <button className="w-full py-4 bg-rose-500 text-white font-black rounded-xl">{itemToEdit ? 'ACTUALIZAR' : 'CREAR'}</button> </form> )}
        {modalType === 'category' && ( <form onSubmit={handleSaveCategory} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600"><Tag size={32}/></div></div> <label className="text-xs uppercase font-bold text-slate-500">Editar nombre de categoría</label> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} value={catName} onChange={e => setCatName(e.target.value)} /> <p className="text-[10px] text-slate-400">Nota: Esto actualizará el nombre en todo tu historial.</p> <button className="w-full py-4 bg-slate-800 text-white font-black rounded-xl">RENOMBRAR</button> </form> )}
      </Modal>

      <ProjectionModal isOpen={projectionOpen} onClose={() => setProjectionOpen(false)} />
    </div>
  );
}