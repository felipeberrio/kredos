import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PieChart, TrendingUp, TrendingDown, Wallet, ArrowLeft, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
// IMPORTANTE: Ya no usamos el componente Card para envolver esto, usamos un simple div.
import { formatCurrency } from '../utils/formatters';
import { DEFAULT_EXPENSE_CATS, DEFAULT_INCOME_CATS } from '../constants/config';

// --- CATEGORÍAS PREDEFINIDAS ---
const EXPENSE_CATS = ['Vivienda', 'Comida', 'Transporte', 'Ocio', 'Salud', 'Educación', 'Servicios', 'Otros'];
const INCOME_CATS = ['Salario', 'Negocio', 'Freelance', 'Regalos', 'Inversiones', 'Reembolsos', 'Otros'];

export const TransactionForm = ({ editingItem, setEditingItem }) => {
  const { 
    addTransaction,
    addIncome, addExpense, updateIncome, updateExpense, updateTransaction,
    wallets, categories: contextCategories, incomeCategories,
    themeColor, darkMode,
    filteredIncomes, filteredExpenses, privacyMode,
    useSemanticColors
  } = useFinancial();

  const [activeTab, setActiveTab] = useState('form'); 
  const [showForm, setShowForm] = useState(false); 
  const [showSuccess, setShowSuccess] = useState(false); 
  
  const [type, setType] = useState('expense');
  const [walletId, setWalletId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [amount, setAmount] = useState('');

  const expenseCategoriesList = useMemo(() => contextCategories.length > 0 ? contextCategories : DEFAULT_EXPENSE_CATS, [contextCategories]);
  const incomeCategoriesList = useMemo(() => incomeCategories.length > 0 ? incomeCategories : DEFAULT_INCOME_CATS, [incomeCategories]);

  const currentCategories = type === 'income' ? incomeCategoriesList : expenseCategoriesList;

  useEffect(() => {
    if (editingItem) {
      setActiveTab('form'); 
      setShowForm(true); 
      setType(editingItem.type);
      setWalletId(editingItem.walletId);
      setCategory(editingItem.category);
      setDate(editingItem.date);
      setItemName(editingItem.name); 
      setDescription(editingItem.description || ''); 
      setAmount(editingItem.amount);
    } else {
        setShowForm(false); 
        if (wallets.length > 0 && !walletId) setWalletId(wallets[0].id);
        setCategory(expenseCategoriesList[0]); 
        setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingItem, wallets]); 

  const handleStart = (selectedType) => {
      setType(selectedType);
      const targetList = selectedType === 'income' ? incomeCategoriesList : expenseCategoriesList;
      setCategory(targetList[0]);
      setShowForm(true);
  };

  const cleanForm = () => {
    setAmount(''); setItemName(''); setDescription(''); setEditingItem(null); setShowForm(false);
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    setShowSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !itemName || !walletId) {
        alert("Por favor completa el monto, item y cuenta.");
        return;
    }

    const transactionData = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: itemName,
      description: description,
      amount: Number(amount),
      category, 
      walletId,
      date: date,
      type: type 
    };

    if (editingItem) {
        if (updateTransaction) updateTransaction(transactionData); 
        else type === 'expense' ? updateExpense(transactionData) : updateIncome(transactionData);
    } else {
        if (addTransaction) addTransaction(type, transactionData);
        else type === 'expense' ? addExpense(transactionData) : addIncome(transactionData);
    }

    setShowSuccess(true);
    setTimeout(() => {
        cleanForm();
    }, 1500);
  };

  const analysisData = useMemo(() => {
      const income = filteredIncomes.reduce((acc, t) => acc + Number(t.amount), 0);
      const expense = filteredExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
      return { income, expense, balance: income - expense };
  }, [filteredIncomes, filteredExpenses]);

  const inputStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#fff' : '#0f172a',
    borderColor: darkMode ? '#334155' : '#e2e8f0'
  };

  const handleFocus = (e) => e.target.style.boxShadow = `0 0 0 3px ${themeColor}30`;
  const handleBlur = (e) => e.target.style.boxShadow = 'none';

  const getButtonStyle = (btnType) => {
      if (useSemanticColors) {
          if (btnType === 'expense') {
              return {
                  containerClass: darkMode ? 'bg-rose-900/10 border-rose-900/30 hover:border-rose-500/50' : 'bg-rose-50 border-rose-100 hover:border-rose-200 shadow-sm',
                  textSmall: darkMode ? 'text-rose-300' : 'text-rose-400',
                  textBig: darkMode ? 'text-white' : 'text-rose-600',
                  iconCircle: darkMode ? 'bg-rose-500 text-white shadow-rose-900/50' : 'bg-rose-500 text-white shadow-rose-200'
              };
          } else {
              return {
                  containerClass: darkMode ? 'bg-emerald-900/10 border-emerald-900/30 hover:border-emerald-500/50' : 'bg-emerald-50 border-emerald-100 hover:border-emerald-200 shadow-sm',
                  textSmall: darkMode ? 'text-emerald-300' : 'text-emerald-400',
                  textBig: darkMode ? 'text-white' : 'text-emerald-600',
                  iconCircle: darkMode ? 'bg-emerald-500 text-white shadow-emerald-900/50' : 'bg-emerald-500 text-white shadow-emerald-200'
              };
          }
      }
      return {
          containerStyle: {
              backgroundColor: darkMode ? `${themeColor}10` : `${themeColor}08`, 
              borderColor: `${themeColor}30`,
          },
          textSmallStyle: { color: themeColor, opacity: 0.7 },
          textBigStyle: { color: themeColor },
          iconCircleStyle: {
              backgroundColor: themeColor,
              color: '#fff',
              boxShadow: `0 10px 15px -3px ${themeColor}50`
          }
      };
  };

  const expenseStyle = getButtonStyle('expense');
  const incomeStyle = getButtonStyle('income');

  return (
    // CAMBIO CLAVE: Quitamos la Card envolvente y usamos un div que fluya en el espacio.
    <div className="flex flex-col w-full h-auto">
      
      {/* PESTAÑAS (Nuevo / Resumen) */}
      <div className={`flex p-1.5 rounded-xl mb-4 shrink-0 max-w-sm w-full mx-auto ${darkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
        <button 
            onClick={() => { setActiveTab('form'); if(!editingItem) setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 ${activeTab === 'form' ? 'shadow-sm': 'text-slate-500 font-medium hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
            style={{ color: activeTab === 'form' ? themeColor : undefined,
                    backgroundColor: activeTab === 'form' 
                    ? (darkMode ? `${themeColor}15` : '#ffffff') 
                    : 'transparent'
            }}>
            <Plus size={14} strokeWidth={3} /> Nuevo Registro
        </button>
        <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 ${activeTab === 'analysis' ? 'shadow-sm': 'text-slate-500 font-medium hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
            style={{ color: activeTab === 'analysis' ? themeColor : undefined,
                    backgroundColor: activeTab === 'analysis' 
                    ? (darkMode ? `${themeColor}15` : '#ffffff') 
                    : 'transparent'
            }}>
            <PieChart size={14} strokeWidth={3} /> Resumen Mes
        </button>
      </div>

      {/* CONTENIDO */}
      {activeTab === 'form' ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
              
             {/* PANTALLA DE ÉXITO */}
             {showSuccess ? (
                 <div className="py-8 flex flex-col items-center justify-center animate-in zoom-in fade-in duration-300">
                     <div className="p-4 rounded-full bg-emerald-100 text-emerald-600 mb-2 dark:bg-emerald-900/30 dark:text-emerald-400">
                         <CheckCircle2 size={32} strokeWidth={3} />
                     </div>
                     <h3 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>¡Guardado!</h3>
                 </div>
             ) : (
                 <>
                     {/* PASO 1: SELECCIÓN DE TIPO */}
                     {!showForm ? (
                         <div className="animate-in fade-in zoom-in-95 duration-300">
                             
                             {/* CAMBIO VISUAL: Botones horizontales, ideales para columna ancha */}
                             <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                                 
                                 {/* BOTÓN INGRESO */}
                                 <button 
                                    onClick={() => handleStart('income')} 
                                    className={`group relative rounded-2xl border-2 transition-all active:scale-95 flex flex-row items-center justify-center p-3 sm:p-4 gap-3 ${useSemanticColors ? incomeStyle.containerClass : ''}`}
                                    style={useSemanticColors ? {} : incomeStyle.containerStyle}
                                 >
                                     <div 
                                        className={`p-2.5 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${useSemanticColors ? incomeStyle.iconCircle : ''}`}
                                        style={useSemanticColors ? {} : incomeStyle.iconCircleStyle}
                                     >
                                         <TrendingUp size={20} strokeWidth={3} />
                                     </div>
                                     <span className={`text-sm sm:text-base font-black uppercase ${useSemanticColors ? incomeStyle.textBig : ''}`} style={useSemanticColors ? {} : incomeStyle.textBigStyle}>INGRESO</span>
                                 </button>

                                 {/* BOTÓN GASTO */}
                                 <button 
                                    onClick={() => handleStart('expense')} 
                                    className={`group relative rounded-2xl border-2 transition-all active:scale-95 flex flex-row items-center justify-center p-3 sm:p-4 gap-3 ${useSemanticColors ? expenseStyle.containerClass : ''}`}
                                    style={useSemanticColors ? {} : expenseStyle.containerStyle}
                                 >
                                     <div 
                                        className={`p-2.5 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 ${useSemanticColors ? expenseStyle.iconCircle : ''}`}
                                        style={useSemanticColors ? {} : expenseStyle.iconCircleStyle}
                                     >
                                         <TrendingDown size={20} strokeWidth={3} />
                                     </div>
                                     <span className={`text-sm sm:text-base font-black uppercase ${useSemanticColors ? expenseStyle.textBig : ''}`} style={useSemanticColors ? {} : expenseStyle.textBigStyle}>GASTO</span>
                                 </button>
                             </div>
                         </div>
                     ) : (
                         /* PASO 2: EL FORMULARIO (ADAPTADO A COLUMNA ANCHA) */
                         <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 animate-in slide-in-from-top-4 duration-300 w-full max-w-4xl mx-auto">
                            
                            {/* Header y Back */}
                            <div className="flex items-center gap-2 mb-2">
                                {!editingItem && (
                                    <button type="button" onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                        <ArrowLeft size={16} strokeWidth={3}/>
                                    </button>
                                )}
                                <span 
                                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md"
                                    style={{
                                        backgroundColor: useSemanticColors 
                                            ? (type === 'expense' ? (darkMode ? '#88133740' : '#ffe4e6') : (darkMode ? '#064e3b40' : '#d1fae5'))
                                            : `${themeColor}20`,
                                        color: useSemanticColors
                                            ? (type === 'expense' ? (darkMode ? '#fda4af' : '#e11d48') : (darkMode ? '#6ee7b7' : '#059669'))
                                            : themeColor
                                    }}
                                >
                                    {type === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso'}
                                </span>
                            </div>

                            {/* FILA 1: CUENTA, CATEGORÍA, FECHA (Grid responsivo de 3 columnas) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select value={walletId || ""} onChange={e => setWalletId(e.target.value)} className="w-full p-2.5 rounded-lg text-xs font-bold outline-none border cursor-pointer" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 rounded-lg text-xs font-bold outline-none border cursor-pointer" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input 
                                    type="date"
                                    className="w-full p-2.5 rounded-lg text-[11px] font-bold outline-none border" 
                                    style={inputStyle}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    value={date || ''}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>

                            {/* FILA 2: CONCEPTO, DETALLE, MONTO, BOTÓN (Grid de 4 columnas en Desktop) */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                <input 
                                    placeholder="Concepto (Ej: Uber)" 
                                    className="w-full p-2.5 rounded-lg text-xs font-bold outline-none border md:col-span-1" 
                                    style={inputStyle}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    value={itemName || ''}
                                    onChange={e => setItemName(e.target.value)}
                                    autoFocus
                                />
                                <input 
                                    placeholder="Nota opcional..." 
                                    className="w-full p-2.5 rounded-lg text-xs font-bold outline-none border md:col-span-1" 
                                    style={inputStyle}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    value={description || ''}
                                    onChange={e => setDescription(e.target.value)}
                                />
                                <div className="relative md:col-span-1">
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        className="w-full p-2.5 pl-6 rounded-lg text-lg font-black outline-none border text-center" 
                                        style={inputStyle}
                                        onFocus={handleFocus} onBlur={handleBlur}
                                        value={amount || ''}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full py-3 rounded-lg text-white font-black text-xs uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all md:col-span-1"
                                    style={{
                                        backgroundColor: useSemanticColors 
                                            ? (type === 'expense' ? '#f43f5e' : '#10b981') 
                                            : themeColor,
                                        boxShadow: `0 4px 10px -2px ${useSemanticColors ? (type === 'expense' ? '#f43f5e40' : '#10b98140') : themeColor + '40'}`
                                    }}
                                >
                                    {editingItem ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                         </form>
                     )}
                 </>
             )}
          </div>
      ) : (
          // CONTENIDO 2: RESUMEN DEL PERIODO (Expandido)
          <div className="flex flex-col gap-2 flex-1 animate-in fade-in slide-in-from-right-4 w-full max-w-2xl mx-auto mt-2">
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${darkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className={`p-1.5 rounded-full ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><TrendingUp size={16}/></div>
                      <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Ingresos</p>
                          <p className={`text-lg font-bold tabular-nums ${darkMode ? 'text-white' : 'text-slate-800'}`}>{privacyMode ? '****' : formatCurrency(analysisData.income)}</p>
                      </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${darkMode ? 'bg-rose-900/10 border-rose-900/30' : 'bg-rose-50 border-rose-100'}`}>
                      <div className={`p-1.5 rounded-full ${darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-600'}`}><TrendingDown size={16}/></div>
                      <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Gastos</p>
                          <p className={`text-lg font-bold tabular-nums ${darkMode ? 'text-white' : 'text-slate-800'}`}>{privacyMode ? '****' : formatCurrency(analysisData.expense)}</p>
                      </div>
                  </div>

                  {/* CARD BALANCE NETO */}
                  <div 
                    className="col-span-2 md:col-span-1 p-4 rounded-xl border flex items-center justify-center relative overflow-hidden transition-colors duration-300"
                    style={{ 
                        backgroundColor: darkMode ? `${themeColor}15` : `${themeColor}10`,
                        borderColor: darkMode ? `${themeColor}30` : `${themeColor}20`
                    }}
                  >
                      <div className="relative z-10 w-full text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Balance Neto</p>
                          <p className="text-2xl font-black tabular-nums tracking-tight" style={{ color: themeColor }}>
                              {privacyMode ? '****' : formatCurrency(analysisData.balance)}
                          </p>
                      </div>
                      <Wallet className="absolute -right-2 -bottom-4 w-20 h-20 opacity-5 rotate-12 text-slate-500"/>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};