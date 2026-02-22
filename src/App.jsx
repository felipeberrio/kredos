import React, { useState, useEffect } from 'react';
import { useFinancial } from './context/FinancialContext';
import { CategoriesSection } from './layout/CategoriesSection';
import { BudgetSection } from './layout/BudgetSection';
import { WorkSection } from './layout/WorkSection';
import { HistorySection } from './layout/HistorySection';
import { SubscriptionSection } from './layout/SubscriptionSection';
import { GoalsSection } from './layout/GoalsSection';
import { FinancialCharts } from './components/FinancialCharts';
import { DateFilter } from './components/DateFilter';
import { Modal } from './components/Modal';
import { ProjectionModal } from './components/ProjectionModal';
import { ThemeSelector } from './components/ThemeSelector';
import { User, LogOut, UploadCloud, Moon, Sun, Eye, EyeOff, Target, Calendar, Wallet, CreditCard, PieChart, Tag, Briefcase, Building2, PaintBucket, Settings, X, Menu, Pin } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { formatCurrency } from './utils/formatters';
import { EventsSection } from './layout/EventsSection';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import ImportTransactions from './components/ImportTransactions';
import { supabase } from './supabaseClient';
import { HeaderWallets } from './components/HeaderWallets';


export default function App() {

  const { user, signOut } = useAuth();

  const { darkMode, setDarkMode, themeColor, wallets, goals, subscriptions, budgets, categories, workLogs, addWorkLog, updateWorkLog, companies, addCompany, updateCompany, addWallet, addGoal, addSubscription, addBudget, updateWallet, updateGoal, updateSubscription, updateBudget, updateCategory, isAllExpanded, calculatePayDate, totalBalance, selectedWalletId, getWalletNetFlow, updateWalletFromInitial, useSemanticColors, setUseSemanticColors, privacyMode, setPrivacyMode, currency, setCurrency } = useFinancial();


  const [leftOrder, setLeftOrder] = useLocalStorage('fin_order_layout_v6', ['categories', 'goals', 'subs']);
  const [rightOrder, setRightOrder] = useLocalStorage('fin_order_right_v4', ['budgets', 'history', 'work', 'events']);
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [projectionOpen, setProjectionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  // INPUTS GENERALES
  const [newWalletName, setNewWalletName] = useState(''); const [newWalletBalance, setNewWalletBalance] = useState(''); const [newWalletType, setNewWalletType] = useState('cash'); const [newWalletLimit, setNewWalletLimit] = useState('');
  const [newGoalName, setNewGoalName] = useState(''); const [newGoalTarget, setNewGoalTarget] = useState(''); const [newGoalSaved, setNewGoalSaved] = useState('');
  const [newSubName, setNewSubName] = useState(''); const [newSubPrice, setNewSubPrice] = useState(''); const [newSubDay, setNewSubDay] = useState('');
  const [newBudgetCat, setNewBudgetCat] = useState(''); const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [catName, setCatName] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState(''); 
  const [newGoalFrequency, setNewGoalFrequency] = useState('monthly');
  const [newGoalInstallment, setNewGoalInstallment] = useState('');
  const [newGoalStartDate, setNewGoalStartDate] = useState(new Date().toISOString().split('T')[0]);

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

  useEffect(() => { if (workStart && workEnd && workRate) { const [h1, m1] = workStart.split(':').map(Number); const [h2, m2] = workEnd.split(':').map(Number); let diff = (h2 + m2/60) - (h1 + m1/60); if (diff < 0) diff += 24; setWorkHoursCalc(diff.toFixed(2)); setWorkTotalCalc(diff * Number(workRate)); } else { setWorkTotalCalc(0); setWorkHoursCalc(0);} }, [workStart, workEnd, workRate]);
  useEffect(() => { if (selectedCompanyId) { const comp = companies.find(c => c.id === selectedCompanyId); if (comp) { if(!workRate) setWorkRate(comp.rate); const estimatedPay = calculatePayDate(workDate, comp); setWorkPaymentDate(estimatedPay); } } }, [selectedCompanyId, workDate, companies]);

  if (!user) {return <Login />;}

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
          if(type === 'profile') {setProfileName(user?.user_metadata?.full_name || '');setProfilePassword('');}
          if(type === 'wallet') { setNewWalletName(item.name); const netFlow = getWalletNetFlow(item.id);setNewWalletBalance(Number(item.balance) - netFlow); setNewWalletType(item.type);setNewWalletLimit(item.limit || '');}    
          if(type === 'goal') { setNewGoalName(item.name); setNewGoalTarget(item.target); setNewGoalSaved(item.saved); setNewGoalDeadline(item.deadline || ''); setNewGoalFrequency(item.frequency || 'monthly'); setNewGoalInstallment(item.installment || ''); setNewGoalStartDate(item.startDate || new Date().toISOString().split('T')[0]); }
          if(type === 'sub') { setNewSubName(item.name); setNewSubPrice(item.price); setNewSubDay(item.day); }
          if(type === 'budget') { setNewBudgetCat(item.category); setNewBudgetLimit(item.limit); }
          if(type === 'category') { setCatName(item.name); }
          if(type === 'work') { 
              if(item.status === 'new_entry') { setWorkDate(item.workDate); } 
              else { setSelectedCompanyId(item.companyId); setWorkLocation(item.location); setWorkDate(item.workDate); setWorkStart(item.startTime); setWorkEnd(item.endTime); setWorkRate(item.rate); setWorkPaymentDate(item.paymentDate); }
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
    setNewGoalDeadline(''); setNewGoalFrequency('monthly'); setNewGoalInstallment(''); setNewGoalStartDate(new Date().toISOString().split('T')[0]);  
  };
  
  // SAVE HANDLERS
  const handleSaveWallet = (e) => { e.preventDefault(); if(!newWalletName) return; if(itemToEdit) {updateWalletFromInitial(itemToEdit, newWalletBalance);} else {const data = { id: Date.now().toString(), name: newWalletName, type: newWalletType, balance: Number(newWalletBalance) || 0, limit: newWalletType === 'credit' ? (Number(newWalletLimit) || 0) : 0 }; addWallet(data); } closeModal(); };  
  const handleSaveGoal = (e) => { e.preventDefault(); if(!newGoalName) return; const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), name: newGoalName, target: Number(newGoalTarget), saved: Number(newGoalSaved) || 0, deadline: newGoalDeadline, frequency: newGoalFrequency, installment: Number(newGoalInstallment), startDate: newGoalStartDate}; if(itemToEdit) updateGoal(data); else addGoal(data); closeModal(); };
  const handleSaveSub = (e) => { e.preventDefault(); if(!newSubName) return; const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), name: newSubName, price: Number(newSubPrice), day: Number(newSubDay) || 1 }; if(itemToEdit) updateSubscription(data); else addSubscription(data); closeModal(); };
  const handleSaveBudget = (e) => { e.preventDefault(); if(!newBudgetLimit) return; if (!itemToEdit && budgets.find(b => b.category === newBudgetCat)) { alert("Ya existe"); return; } const data = { id: itemToEdit ? itemToEdit.id : Date.now().toString(), category: newBudgetCat, limit: Number(newBudgetLimit) }; if(itemToEdit) updateBudget(data); else addBudget(data); closeModal(); };
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
          onAdd: () => handleOpenModal(key === 'work' ? 'work' : key === 'budgets' ? 'budget' : 'transaction'),
          onAddCompany: () => handleOpenModal('company'),
          onEditCompany: (item) => handleOpenModal('company', item)
      };

      switch(key) {
          case 'budgets': return <BudgetSection {...props} />;
          case 'work': return <WorkSection {...props} onEdit={(item) => handleOpenModal('work', item)} />;
          case 'events': return <EventsSection {...props} />;
          // Pasamos editingItem y setEditingItem al Historial para que el Formulario funcione
          case 'history': return <HistorySection {...props} onEdit={(item) => setEditingItem(item)} editingItem={editingItem} setEditingItem={setEditingItem} />;
          default: return null;
      }
  };

  const modalInputStyle = { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', color: darkMode ? '#f1f5f9' : '#0f172a', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` };

  // ESTADOS PARA PERFIL DE USUARIO
  const [profileName, setProfileName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  
  // Obtener nombre actual (o usar el email si no tiene nombre)
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  // FUNCIÓN REAL PARA ACTUALIZAR PERFIL
  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      const updates = {};
      if (profileName && profileName !== displayName) {
          updates.data = { full_name: profileName };
      }
      if (profilePassword) {
          updates.password = profilePassword;
      }
      if (Object.keys(updates).length === 0) {
          closeModal();
          return;
      }
      try {
          const { error } = await supabase.auth.updateUser(updates);
          if (error) throw error;
          alert("¡Perfil actualizado con éxito!");
          setProfilePassword(''); 
          closeModal();
          window.location.reload(); 
      } catch (error) {
          console.error("Error al actualizar:", error);
          alert("Error: " + error.message);
      }
  };

  // --- LÓGICA INTELIGENTE DEL HEADER ---
  const activeWallet = React.useMemo(() => {
    if (!selectedWalletId) return null;
    return wallets.find(w => w.id === selectedWalletId);
  }, [selectedWalletId, wallets]);

  const headerData = React.useMemo(() => {
      const isCredit = activeWallet?.type === 'credit';
      const balance = activeWallet ? activeWallet.balance : totalBalance;
      const name = activeWallet ? activeWallet.name : "Patrimonio Neto";
      
      const limit = isCredit ? (activeWallet.limit || 0) : 0;
      const used = isCredit ? Math.abs(balance) : 0;
      const available = limit - used;
      const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

      return { isCredit, balance, name, limit, used, available, percent };
  }, [activeWallet, totalBalance]);


  return (
    <div 
      className={`min-h-screen pb-16 transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
      style={{ 
        backgroundColor: useSemanticColors 
          ? (darkMode ? '#0f172a' : '#F8FAFC')
          : (darkMode ? '#0f172a' : `${themeColor}08`)
      }}
    >
    <header className={`sticky top-0 z-50 mb-6 px-4 sm:px-6 rounded-b-2xl flex justify-between items-center transition-all duration-300 backdrop-blur-xl ${darkMode ? 'bg-slate-900/80 border-b border-slate-700/50 shadow-card-dark' : 'bg-white/90 border-b border-slate-200/60 shadow-card'}`}> 
        <div className="w-full px-2 sm:px-4 py-3 h-16 sm:h-18 flex items-center gap-3 sm:gap-4 overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg shrink-0 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: themeColor }}>$</div>
                    <h1 className="text-lg sm:text-xl font-black tracking-tight leading-none hidden xl:block">FINPLAN<span style={{ color: themeColor }}>PRO</span></h1>
                </div>
                <div className="h-7 w-px bg-slate-200 dark:bg-slate-600 hidden lg:block" />
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: themeColor }}><User size={14} strokeWidth={2.5}/></div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{displayName}</span>
                </div>
                <div className="flex items-center gap-4 hidden lg:flex">
                    <div className="flex flex-col justify-center min-w-[100px]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                            {headerData.name}
                        </span>
                        <span className="text-xl sm:text-2xl font-black leading-none tabular-nums tracking-tight" style={{ color: darkMode ? '#f8fafc' : themeColor }}>
                            {privacyMode ? '****' : formatCurrency(headerData.balance)}
                        </span>
                    </div>

                    {headerData.isCredit && !privacyMode && (
                        <>
                            <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                            
                            <div className="flex items-center gap-3">
                                <div className="relative w-9 h-9 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-200 dark:text-slate-700 opacity-50"/>
                                        <circle 
                                            cx="18" cy="18" r="14" 
                                            stroke={themeColor} strokeWidth="3" fill="transparent" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 14} 
                                            strokeDashoffset={(2 * Math.PI * 14) - (Math.min(headerData.percent, 100) / 100) * (2 * Math.PI * 14)} 
                                        />
                                    </svg>
                                    <div className="absolute text-[8px] font-black text-slate-400">
                                        {Math.round(headerData.percent)}%
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center text-[9px] font-bold leading-tight">
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">Disp:</span>
                                        <span className="text-emerald-500">{formatCurrency(headerData.available)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">Cupo:</span>
                                        <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{formatCurrency(headerData.limit)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-x-auto scrollbar-hide border-l border-r border-slate-200/50 dark:border-slate-700/50 mx-2 px-2 mask-linear-fade min-w-0">
                 <HeaderWallets 
                    onAdd={() => handleOpenModal('wallet')} 
                    onEdit={(item) => handleOpenModal('wallet', item)} 
                />
            </div>
      </div>
        <div className="flex items-center gap-1 sm:gap-2 py-2 shrink-0">
            <div className={`flex items-center gap-3 transition-all duration-300 origin-right overflow-hidden ${isSettingsOpen ? 'w-auto opacity-100 scale-100 mr-2' : 'w-0 opacity-0 scale-95'}`}>
                
                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <button onClick={() => setCurrency('USD')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${currency === 'USD' ? 'bg-white shadow text-blue-600 dark:bg-slate-600 dark:text-white' : 'text-slate-400'}`}>USD</button>
                    <button onClick={() => setCurrency('COP')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${currency === 'COP' ? 'bg-white shadow text-emerald-600 dark:bg-slate-600 dark:text-white' : 'text-slate-400'}`}>COP</button>
                </div>

                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <ThemeSelector />
                    <button 
                        onClick={() => setUseSemanticColors(!useSemanticColors)} 
                        className={`flex items-center gap-1 px-1.5 py-1 rounded-md transition-all border ${useSemanticColors ? (darkMode ? 'bg-teal-900/30 border-teal-700 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-600') : (darkMode ? 'border-transparent text-slate-400' : 'border-transparent text-slate-400')}`}
                        title="Modo Semántico"
                    >
                        <PaintBucket size={14}/>
                    </button>
                </div>

                <div className={`rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <DateFilter />
                </div>

                <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <button onClick={() => setPrivacyMode(!privacyMode)} className={`p-1.5 rounded-md transition-colors ${privacyMode ? 'text-blue-500 bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Ocultar Saldos">
                        {privacyMode ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => setDarkMode(!darkMode)} className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-yellow-400 bg-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Modo Oscuro">
                        {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
                    </button>
                </div>
            </div>

            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 ${isSidebarOpen ? 'text-blue-500 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`} title="Menú de gestión">
              <Menu size={20} strokeWidth={2}/>
            </button>
            <button onClick={() => handleOpenModal('import')} className="p-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 active:scale-95" title="Importar CSV">
              <UploadCloud size={20} strokeWidth={2}/>
            </button>
            <button onClick={() => handleOpenModal('profile')} className="p-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500 active:scale-95" title="Mi perfil">
              <User size={20} strokeWidth={2}/>
            </button>
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2.5 rounded-xl transition-all duration-200 ${isSettingsOpen ? 'text-blue-500 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}`} title="Ajustes">
              <Settings size={20} strokeWidth={2} className={isSettingsOpen ? 'rotate-90 transition-transform duration-200' : ''}/>
            </button>
            <button onClick={signOut} className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 active:scale-95" title="Cerrar sesión">
              <LogOut size={20} strokeWidth={2}/>
            </button>
        </div>
    </header>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 transition-all duration-300 ${isSidebarPinned && isSidebarOpen ? 'mr-[24rem] max-w-none pr-4' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="w-full h-[400px] overflow-hidden relative">
                <FinancialCharts onOpenProjection={() => setProjectionOpen(true)} />
            </div>
            {/* Componente de Formulario removido de aquí */}
          </div>
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col gap-6">{rightOrder.map((key, index) => renderRightSection(key, index))}</div>
          </div>
        </div>
      </main>

    {isSidebarOpen && !isSidebarPinned && (
    <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        onClick={() => setIsSidebarOpen(false)}
    />
    )}

    <div className={`fixed inset-y-0 right-0 z-[70] w-full sm:w-96 shadow-premium dark:shadow-premium-dark transform transition-transform duration-300 ease-out border-l flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${darkMode ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'}`}>    
    <div className={`flex items-center justify-between p-4 border-b shrink-0 ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gestión</span>
        <div className="flex items-center gap-1">
            <button onClick={() => setIsSidebarPinned(!isSidebarPinned)} className={`p-2.5 rounded-xl transition-all duration-200 ${isSidebarPinned ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title={isSidebarPinned ? "Desfijar" : "Fijar"}>
              <Pin size={18} strokeWidth={2} className={isSidebarPinned ? 'fill-current' : ''} />
            </button>
            <button onClick={() => { setIsSidebarOpen(false); setIsSidebarPinned(false); }} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition-all duration-200">
              <X size={20} strokeWidth={2}/>
            </button>
        </div>
    </div>

  <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 custom-scrollbar">
    {leftOrder.map((key, index) => {
        const commonProps = {
            key: key,
            onAdd: () => handleOpenModal(key === 'wallets' ? 'wallet' : key === 'goals' ? 'goal' : key === 'subs' ? 'sub' : key === 'categories' ? 'category' : 'budget'),
            onEdit: (item) => handleOpenModal(key === 'wallets' ? 'wallet' : key === 'goals' ? 'goal' : key === 'subs' ? 'sub' : key === 'categories' ? 'category' : 'budget', item),
            onMoveUp: () => moveLeftSection(index, 'up'),
            onMoveDown: () => moveLeftSection(index, 'down'),
            isFirst: index === 0,
            isLast: index === leftOrder.length - 1
        };

        switch(key) {
            case 'categories': return <CategoriesSection {...commonProps} />;
            case 'budgets':    return <BudgetSection {...commonProps} />;
            case 'goals':      return <GoalsSection {...commonProps} />;
            case 'subs':       return <SubscriptionSection {...commonProps} />;
            default: return null;
        }
    })}
    {leftOrder.length === 0 && (
        <p className="text-center text-slate-400 text-xs mt-10">No hay secciones visibles.</p>
    )}
  </div>
</div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={itemToEdit ? 'Editar' : 'Crear Nuevo'}>
        
        {modalType === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-xl" style={{ backgroundColor: themeColor }}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-full text-white border-2 border-white dark:border-slate-900">
                            <Settings size={14} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Correo Electrónico</label>
                    <input disabled className="w-full p-4 rounded-xl font-bold outline-none bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent" value={user?.email} />
                    <p className="text-[10px] text-slate-400 px-1">El correo no se puede cambiar por seguridad.</p>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Nombre Completo</label>
                    <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none border transition-colors focus:border-blue-500" style={modalInputStyle} placeholder="Tu Nombre" value={profileName} onChange={e => setProfileName(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Nueva Contraseña (Opcional)</label>
                    <input type="password" className="w-full p-4 rounded-xl font-bold outline-none border transition-colors focus:border-blue-500" style={modalInputStyle} placeholder="••••••••" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} />
                </div>

                <button className="w-full py-4 text-white font-black rounded-xl shadow-lg hover:brightness-110 transition-all mt-4" style={{ backgroundColor: themeColor }}>
                    ACTUALIZAR PERFIL
                </button>
            </form>
        )}
        {modalType === 'wallet' && ( <form onSubmit={handleSaveWallet} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 rounded-full text-white" style={{ backgroundColor: themeColor }}>{newWalletType === 'credit' ? <CreditCard size={32}/> : <Wallet size={32}/>}</div></div> <select className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} value={newWalletType} onChange={(e) => setNewWalletType(e.target.value)}><option value="cash">Efectivo</option><option value="debit">Débito</option><option value="credit">Crédito</option></select> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Nombre" value={newWalletName} onChange={e => setNewWalletName(e.target.value)} /> {newWalletType === 'credit' && <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Cupo Límite" value={newWalletLimit} onChange={e => setNewWalletLimit(e.target.value)} />} <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Saldo Actual" value={newWalletBalance} onChange={e => setNewWalletBalance(e.target.value)} /> <button className="w-full py-4 text-white font-black rounded-xl" style={{ backgroundColor: themeColor }}>{itemToEdit ? 'ACTUALIZAR' : 'GUARDAR'}</button> </form> )}
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
        {modalType === 'goal' && ( <form onSubmit={handleSaveGoal} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600"><Target size={32}/></div></div> <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Meta</label><input autoFocus className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} placeholder="Ej: Carro" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} /> </div><div><label className="text-[10px] font-bold uppercase text-slate-500">Objetivo ($)</label><input type="number" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} placeholder="5000" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} /> </div></div><div><label className="text-[10px] font-bold uppercase text-slate-500">Ya tengo ahorrado ($)</label><input type="number" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} placeholder="0" value={newGoalSaved} onChange={e => setNewGoalSaved(e.target.value)} /> </div><div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2"></div><p className="text-xs font-black uppercase text-center text-slate-400">Plan de Ahorro (Proyección)</p><div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Frecuencia</label><select className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} value={newGoalFrequency} onChange={e => setNewGoalFrequency(e.target.value)}><option value="monthly">Mensual</option><option value="biweekly">Quincenal</option><option value="weekly">Semanal</option><option value="once">Un solo pago</option></select></div><div><label className="text-[10px] font-bold uppercase text-slate-500">{newGoalFrequency === 'once' ? 'Monto Pago Final' : 'Cuota de Ahorro'}</label><input type="number" className="w-full p-3 rounded-xl font-bold outline-none mt-1" style={modalInputStyle} placeholder="100" value={newGoalInstallment} onChange={e => setNewGoalInstallment(e.target.value)} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold uppercase text-slate-500">Iniciar Desde</label><input type="date" className="w-full p-3 rounded-xl font-bold outline-none mt-1 text-xs" style={modalInputStyle} value={newGoalStartDate} onChange={e => setNewGoalStartDate(e.target.value)} /></div>{newGoalFrequency === 'once' && (<div className="animate-in fade-in"><label className="text-[10px] font-bold uppercase text-slate-500">Fecha Límite Pago</label><input type="date" className="w-full p-3 rounded-xl font-bold outline-none mt-1 text-xs" style={modalInputStyle} value={newGoalDeadline} onChange={e => setNewGoalDeadline(e.target.value)} /> </div> )} </div> <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 transition-colors mt-2"> {itemToEdit ? 'ACTUALIZAR META' : 'CREAR META'}</button> </form> )} 
        {modalType === 'sub' && ( <form onSubmit={handleSaveSub} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600"><Calendar size={32}/></div></div> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Servicio" value={newSubName} onChange={e => setNewSubName(e.target.value)} /> <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Precio" value={newSubPrice} onChange={e => setNewSubPrice(e.target.value)} /> <input type="number" className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Día" value={newSubDay} onChange={e => setNewSubDay(e.target.value)} /> <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl">{itemToEdit ? 'ACTUALIZAR' : 'CREAR'}</button> </form> )}
        {modalType === 'budget' && ( <form onSubmit={handleSaveBudget} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-500"><PieChart size={32}/></div></div> <select className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} value={newBudgetCat} onChange={e => setNewBudgetCat(e.target.value)} disabled={!!itemToEdit}> {categories.map(c => <option key={c} value={c}>{c}</option>)} </select> <input type="number" autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} placeholder="Límite" value={newBudgetLimit} onChange={e => setNewBudgetLimit(e.target.value)} /> <button className="w-full py-4 bg-rose-500 text-white font-black rounded-xl">{itemToEdit ? 'ACTUALIZAR' : 'CREAR'}</button> </form> )}
        {modalType === 'category' && ( <form onSubmit={handleSaveCategory} className="space-y-4"> <div className="flex justify-center mb-4"><div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600"><Tag size={32}/></div></div> <label className="text-xs uppercase font-bold text-slate-500">Editar nombre de categoría</label> <input autoFocus className="w-full p-4 rounded-xl font-bold outline-none" style={modalInputStyle} value={catName} onChange={e => setCatName(e.target.value)} /> <p className="text-[10px] text-slate-400">Nota: Esto actualizará el nombre en todo tu historial.</p> <button className="w-full py-4 bg-slate-800 text-white font-black rounded-xl">RENOMBRAR</button> </form> )}
      
        {modalType === 'import' && (
           <div className="animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center mb-4">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600">
                      <UploadCloud size={32}/>
                  </div>
              </div>
              <p className="text-center text-sm text-slate-500 mb-4">
                  Sube tu archivo CSV del banco para categorizar automáticamente.
              </p>
              <ImportTransactions onClose={closeModal} />
           </div>
        )}
      
      </Modal>

      <ProjectionModal isOpen={projectionOpen} onClose={() => setProjectionOpen(false)} />
    </div>
  );
}