import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PieChart, TrendingUp, TrendingDown, Wallet, ArrowLeft, Calendar, Tag, FileText } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';

// --- CATEGORÍAS PREDEFINIDAS ---
const EXPENSE_CATS = ['Vivienda', 'Comida', 'Transporte', 'Ocio', 'Salud', 'Educación', 'Servicios', 'Otros'];
const INCOME_CATS = ['Salario', 'Negocio', 'Freelance', 'Regalos', 'Inversiones', 'Reembolsos', 'Otros'];

export const TransactionForm = ({ editingItem, setEditingItem }) => {
  const { 
    addIncome, addExpense, updateIncome, updateExpense, 
    wallets, categories: contextCategories, 
    themeColor, darkMode,
    filteredIncomes, filteredExpenses, privacyMode,
    useSemanticColors
  } = useFinancial();


  // Estados de Navegación
  const [activeTab, setActiveTab] = useState('form'); 
  const [showForm, setShowForm] = useState(false); 
  
  // Estados del Formulario
  const [type, setType] = useState('expense');
  const [walletId, setWalletId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [amount, setAmount] = useState('');

  // Memorizar las listas de categorías para usarlas rápido
  const expenseCategoriesList = useMemo(() => contextCategories.length > 0 ? contextCategories : EXPENSE_CATS, [contextCategories]);
  const incomeCategoriesList = INCOME_CATS;

  // Lista actual para el renderizado del select
  const currentCategories = type === 'income' ? incomeCategoriesList : expenseCategoriesList;

  // Efecto Carga/Edición
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
        // Defaults iniciales
        setShowForm(false); 
        if (wallets.length > 0 && !walletId) setWalletId(wallets[0].id);
        setCategory(expenseCategoriesList[0]); 
        setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingItem, wallets]); 

  // Lógica manual al iniciar selección
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !itemName || !walletId) return;

    const transactionData = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: itemName,
      description: description,
      amount: Number(amount),
      category, 
      walletId,
      date: date
    };

    if (type === 'expense') {
      editingItem ? updateExpense(transactionData) : addExpense(transactionData);
    } else {
      editingItem ? updateIncome(transactionData) : addIncome(transactionData);
    }
    cleanForm();
  };

  // Datos para Resumen
  const analysisData = useMemo(() => {
      const income = filteredIncomes.reduce((acc, t) => acc + Number(t.amount), 0);
      const expense = filteredExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
      return { income, expense, balance: income - expense };
  }, [filteredIncomes, filteredExpenses]);

  // --- ESTILOS DINÁMICOS (Theme vs Semántico) ---
  const inputStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#fff' : '#0f172a',
    borderColor: darkMode ? '#334155' : '#e2e8f0'
  };

  const handleFocus = (e) => e.target.style.boxShadow = `0 0 0 3px ${themeColor}30`;
  const handleBlur = (e) => e.target.style.boxShadow = 'none';

  // Función auxiliar para generar estilos de botones grandes
  const getButtonStyle = (btnType) => {
      // Si el usuario activa el "Modo Semántico" (Reset Button en futuro), usamos colores fijos
      if (useSemanticColors) {
          if (btnType === 'expense') {
              return {
                  containerClass: darkMode ? 'bg-rose-900/10 border-rose-900/30 hover:border-rose-500/50' : 'bg-rose-50 border-rose-100 hover:border-rose-200 shadow-sm',
                  textSmall: darkMode ? 'text-rose-300' : 'text-rose-400',
                  textBig: darkMode ? 'text-white' : 'text-rose-600',
                  iconCircle: darkMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'
              };
          } else {
              return {
                  containerClass: darkMode ? 'bg-emerald-900/10 border-emerald-900/30 hover:border-emerald-500/50' : 'bg-emerald-50 border-emerald-100 hover:border-emerald-200 shadow-sm',
                  textSmall: darkMode ? 'text-emerald-300' : 'text-emerald-400',
                  textBig: darkMode ? 'text-white' : 'text-emerald-600',
                  iconCircle: darkMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
              };
          }
      }

      // MODO TEMA (Por defecto ahora)
      return {
          // Usamos estilos inline para colores dinámicos, devolvemos clases base neutras
          containerStyle: {
              backgroundColor: darkMode ? `${themeColor}10` : `${themeColor}08`, // Muy sutil
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
    <Card className="h-full flex flex-col transition-all duration-300 min-h-[500px]">
      
      {/* HEADER: PESTAÑAS */}
      <div className={`flex p-1 rounded-xl mb-4 shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <button 
            onClick={() => { setActiveTab('form'); if(!editingItem) setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'form' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            style={{ color: activeTab === 'form' ? themeColor : undefined }}
        >
            <Plus size={14} strokeWidth={3} /> Nuevo Registro
        </button>
        <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'analysis' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            style={{ color: activeTab === 'analysis' ? themeColor : undefined }}
        >
            <PieChart size={14} strokeWidth={3} /> Resumen Periodo
        </button>
      </div>

      {/* CONTENIDO */}
      {activeTab === 'form' ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
             
             {/* PASO 1: SELECCIÓN DE TIPO */}
             {!showForm ? (
                 <div className="flex flex-col gap-4 h-full animate-in fade-in zoom-in-95 duration-300 justify-center">
                     <div className="text-center pb-2">
                         <h4 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>¿Qué deseas registrar?</h4>
                     </div>
                     
                     {/* BOTÓN GASTO */}
                     <button 
                        onClick={() => handleStart('expense')} 
                        className={`group w-full relative rounded-3xl border-2 transition-all active:scale-95 flex items-center justify-between p-6 overflow-hidden ${useSemanticColors ? expenseStyle.containerClass : ''}`}
                        style={useSemanticColors ? {} : expenseStyle.containerStyle}
                     >
                         <div className="relative z-10 text-left">
                             <span className={`block text-xs font-bold uppercase mb-1 ${useSemanticColors ? expenseStyle.textSmall : ''}`} style={useSemanticColors ? {} : expenseStyle.textSmallStyle}>Registrar</span>
                             <span className={`text-3xl font-black ${useSemanticColors ? expenseStyle.textBig : ''}`} style={useSemanticColors ? {} : expenseStyle.textBigStyle}>GASTO</span>
                         </div>
                         <div 
                            className={`p-5 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 ${useSemanticColors ? expenseStyle.iconCircle : ''}`}
                            style={useSemanticColors ? {} : expenseStyle.iconCircleStyle}
                         >
                             <TrendingDown size={32} strokeWidth={2.5} />
                         </div>
                     </button>

                     {/* BOTÓN INGRESO */}
                     <button 
                        onClick={() => handleStart('income')} 
                        className={`group w-full relative rounded-3xl border-2 transition-all active:scale-95 flex items-center justify-between p-6 overflow-hidden ${useSemanticColors ? incomeStyle.containerClass : ''}`}
                        style={useSemanticColors ? {} : incomeStyle.containerStyle}
                     >
                         <div className="relative z-10 text-left">
                             <span className={`block text-xs font-bold uppercase mb-1 ${useSemanticColors ? incomeStyle.textSmall : ''}`} style={useSemanticColors ? {} : incomeStyle.textSmallStyle}>Registrar</span>
                             <span className={`text-3xl font-black ${useSemanticColors ? incomeStyle.textBig : ''}`} style={useSemanticColors ? {} : incomeStyle.textBigStyle}>INGRESO</span>
                         </div>
                         <div 
                            className={`p-5 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${useSemanticColors ? incomeStyle.iconCircle : ''}`}
                            style={useSemanticColors ? {} : incomeStyle.iconCircleStyle}
                         >
                             <TrendingUp size={32} strokeWidth={2.5} />
                         </div>
                     </button>
                 </div>
             ) : (
                 /* PASO 2: EL FORMULARIO COMPLETO */
                 <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 animate-in slide-in-from-bottom-8 duration-300">
                    
                    {/* Header y Back */}
                    <div className="flex items-center gap-3 mb-2">
                        {!editingItem && (
                            <button type="button" onClick={() => setShowForm(false)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <ArrowLeft size={18} strokeWidth={3}/>
                            </button>
                        )}
                        {/* Etiqueta Superior (Dinámica según Semantic o Theme) */}
                        <span 
                            className="text-xs font-black uppercase px-3 py-1 rounded-md"
                            style={{
                                backgroundColor: useSemanticColors 
                                    ? (type === 'expense' ? (darkMode ? '#88133740' : '#ffe4e6') : (darkMode ? '#064e3b40' : '#d1fae5'))
                                    : `${themeColor}20`,
                                color: useSemanticColors
                                    ? (type === 'expense' ? (darkMode ? '#fda4af' : '#e11d48') : (darkMode ? '#6ee7b7' : '#059669'))
                                    : themeColor
                            }}
                        >
                            {type === 'expense' ? 'Nuevo Gasto' : 'Nuevo Ingreso'}
                        </span>
                    </div>

                    {/* FILA 1: CUENTA + CATEGORÍA */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Wallet size={10}/> Cuenta</label>
                            <select value={walletId} onChange={e => setWalletId(e.target.value)} className="w-full p-3 rounded-xl text-xs font-bold outline-none border cursor-pointer transition-shadow duration-200" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Tag size={10}/> Categoría</label>
                            <div className="flex gap-1">
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl text-xs font-bold outline-none border cursor-pointer transition-shadow duration-200" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button type="button" className={`px-3 rounded-xl border ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}><Plus size={14}/></button>
                            </div>
                        </div>
                    </div>

                    {/* FILA 2: FECHA */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Calendar size={10}/> Fecha</label>
                        <input 
                            type="date"
                            className="w-full p-3 rounded-xl text-xs font-bold outline-none border transition-shadow duration-200" 
                            style={inputStyle}
                            onFocus={handleFocus} onBlur={handleBlur}
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    {/* FILA 3: ITEM (NOMBRE CORTO) */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><FileText size={10}/> Item</label>
                        <input 
                            placeholder={type === 'expense' ? "Ej: Almuerzo, Uber, Netflix" : "Ej: Nómina Enero, Venta Garage"} 
                            className="w-full p-3 rounded-xl text-sm font-bold outline-none border transition-shadow duration-200" 
                            style={inputStyle}
                            onFocus={handleFocus} onBlur={handleBlur}
                            value={itemName}
                            onChange={e => setItemName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* FILA 4: DETALLES (OPCIONAL) */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Detalle (Opcional)</label>
                        <input 
                            placeholder="Notas adicionales..." 
                            className="w-full p-3 rounded-xl text-xs outline-none border transition-shadow duration-200" 
                            style={inputStyle}
                            onFocus={handleFocus} onBlur={handleBlur}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* FILA 5: VALOR */}
                    <div className="space-y-1 relative mt-2">
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            className="w-full p-4 pl-8 rounded-xl text-3xl font-black outline-none border transition-shadow duration-200" 
                            style={inputStyle}
                            onFocus={handleFocus} onBlur={handleBlur}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">$</span>
                    </div>

                    <button 
                        className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all mt-auto"
                        style={{
                            backgroundColor: useSemanticColors 
                                ? (type === 'expense' ? '#f43f5e' : '#10b981') // Rose-500 / Emerald-500
                                : themeColor,
                            boxShadow: `0 10px 15px -3px ${useSemanticColors ? (type === 'expense' ? '#f43f5e40' : '#10b98140') : themeColor + '40'}`
                        }}
                    >
                        {editingItem ? 'Actualizar' : 'Guardar Registro'}
                    </button>
                 </form>
             )}
          </div>
      ) : (
          // CONTENIDO 2: RESUMEN DEL PERIODO
          <div className="flex flex-col gap-3 flex-1 animate-in fade-in slide-in-from-right-4">
              {/* Cards de Resumen */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] ${darkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><TrendingUp size={24}/></div>
                      <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Ingresos del Periodo</p>
                          <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{privacyMode ? '****' : formatCurrency(analysisData.income)}</p>
                      </div>
                  </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] ${darkMode ? 'bg-rose-900/10 border-rose-900/30' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-600'}`}><TrendingDown size={24}/></div>
                      <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Gastos del Periodo</p>
                          <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{privacyMode ? '****' : formatCurrency(analysisData.expense)}</p>
                      </div>
                  </div>
              </div>

              {/* CARD BALANCE NETO */}
              <div 
                className="mt-auto p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden transition-colors duration-300"
                style={{ 
                    backgroundColor: darkMode ? `${themeColor}15` : `${themeColor}10`,
                    borderColor: darkMode ? `${themeColor}30` : `${themeColor}20`
                }}
              >
                  <div className="relative z-10">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Balance Neto (Flujo)</p>
                      <p className="text-3xl font-black" style={{ color: themeColor }}>
                          {privacyMode ? '****' : formatCurrency(analysisData.balance)}
                      </p>
                  </div>
                  <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 text-slate-500"/>
              </div>
          </div>
      )}
    </Card>
  );
};