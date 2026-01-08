import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from './Card';
import { X, Plus, ChevronDown } from 'lucide-react';

export const TransactionForm = ({ editingItem, setEditingItem }) => {
  const { wallets, categories, addTransaction, updateTransaction, addCategory, themeColor } = useFinancial();
  
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [walletId, setWalletId] = useState('');
  
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const incomeCategories = ["Salario", "Ingreso Extra", "Regalo", "Inversión", "Devolución"];

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type);
      setCategory(editingItem.category || (editingItem.type === 'income' ? 'Salario' : categories[0]));
      setDetails(editingItem.name);
      setAmount(editingItem.amount);
      setWalletId(editingItem.walletId);
    } else {
      setCategory(type === 'income' ? incomeCategories[0] : categories[0]);
    }
  }, [editingItem, type, categories]);

  const handleQuickAddCategory = (e) => {
    e.preventDefault();
    if(newCatName) {
      addCategory(newCatName);
      setCategory(newCatName);
      setNewCatName('');
      setShowNewCatInput(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !details) return;

    const finalWalletId = walletId || (wallets.length > 0 ? wallets[0].id : '');
    if (!finalWalletId) {
        alert("Crea una cuenta primero");
        return;
    }

    const transactionData = {
      id: editingItem ? editingItem.id : Date.now(),
      name: details,
      category: category,
      amount: Number(amount),
      date: editingItem ? editingItem.date : new Date().toISOString().split('T')[0],
      walletId: finalWalletId,
      type
    };

    if (editingItem) {
      updateTransaction(editingItem, transactionData);
      setEditingItem(null);
    } else {
      addTransaction(type, transactionData);
    }
    
    setDetails('');
    setAmount('');
  };

  return (
    <Card className={`h-full border-2 ${editingItem ? 'border-amber-400' : 'border-transparent'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {editingItem ? '✏️ Editando...' : 'Nuevo Registro'}
        </h3>
        {editingItem && (
          <button onClick={() => setEditingItem(null)} className="text-xs font-bold text-rose-500 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg hover:bg-rose-100 transition-colors">
            <X size={12}/> Cancelar
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TIPO */}
        <div className="flex p-1 rounded-2xl border transition-colors bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 ${type === 'expense' ? 'bg-slate-100 dark:bg-slate-600 text-rose-500 shadow-inner' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Gasto
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 ${type === 'income' ? 'bg-slate-100 dark:bg-slate-600 text-emerald-500 shadow-inner' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Ingreso
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* WALLET */}
          <div className="relative group">
             <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Cuenta</label>
             <div className="relative">
                <select 
                    className="w-full p-3 rounded-xl font-bold outline-none border transition-all text-xs appearance-none cursor-pointer shadow-sm !bg-white !text-slate-900 border-slate-200 focus:ring-2 focus:border-transparent dark:!bg-slate-800 dark:!text-white dark:border-slate-700"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    style={{ '--tw-ring-color': themeColor }}
                >
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>
          </div>

          {/* CATEGORIA */}
          <div className="relative group">
             <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Categoría</label>
             {!showNewCatInput ? (
               <div className="relative flex gap-1">
                 <div className="relative w-full">
                    <select 
                      className="w-full p-3 rounded-xl font-bold outline-none border transition-all text-xs appearance-none cursor-pointer shadow-sm !bg-white !text-slate-900 border-slate-200 focus:ring-2 focus:border-transparent dark:!bg-slate-800 dark:!text-white dark:border-slate-700"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ '--tw-ring-color': themeColor }}
                    >
                      {(type === 'income' ? incomeCategories : categories).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                 </div>
                 
                 {type === 'expense' && (
                   <button type="button" onClick={() => setShowNewCatInput(true)} className="px-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 border border-slate-200 shadow-sm !bg-white dark:!bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                     <Plus size={16}/>
                   </button>
                 )}
               </div>
             ) : (
               <div className="flex gap-1 animate-in fade-in slide-in-from-right-2">
                 <input 
                   autoFocus
                   placeholder="Nueva..." 
                   className="w-full p-3 rounded-xl font-bold outline-none border transition-all text-xs shadow-sm !bg-white !text-slate-900 border-slate-200 dark:!bg-slate-800 dark:!text-white dark:border-slate-700"
                   value={newCatName}
                   onChange={e => setNewCatName(e.target.value)}
                 />
                 <button type="button" onClick={handleQuickAddCategory} className="px-3 bg-emerald-500 text-white rounded-xl shadow-lg"><Plus size={16}/></button>
                 <button type="button" onClick={() => setShowNewCatInput(false)} className="px-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-xl"><X size={14}/></button>
               </div>
             )}
          </div>
        </div>

        {/* CONCEPTO */}
        <div>
            <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Detalle</label>
            <input 
              placeholder="Ej: Cena, Uber..."
              className="w-full p-3 rounded-xl font-bold outline-none border transition-all shadow-sm focus:ring-2 focus:border-transparent !bg-white !text-slate-900 border-slate-200 placeholder:text-slate-400 dark:!bg-slate-800 dark:!text-white dark:border-slate-700 dark:placeholder:text-slate-500"
              style={{ '--tw-ring-color': themeColor }}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
        </div>

        {/* MONTO */}
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">$</span>
            <input 
              type="number"
              placeholder="0.00"
              className="w-full p-3 pl-8 rounded-xl font-black outline-none border transition-all text-2xl tracking-tight shadow-sm focus:ring-2 focus:border-transparent !bg-white !text-slate-900 border-slate-200 placeholder:text-slate-400 dark:!bg-slate-800 dark:!text-white dark:border-slate-700 dark:placeholder:text-slate-500"
              style={{ '--tw-ring-color': themeColor }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
        </div>

        <button 
          type="submit"
          className={`w-full py-4 rounded-2xl text-white font-black shadow-lg hover:shadow-xl transition-all active:scale-95 hover:-translate-y-1 ${editingItem ? 'bg-amber-500' : ''}`}
          style={{ backgroundColor: editingItem ? undefined : themeColor }}
        >
          {editingItem ? 'ACTUALIZAR REGISTRO' : 'REGISTRAR'}
        </button>
      </form>
    </Card>
  );
};