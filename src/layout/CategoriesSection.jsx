import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, ChevronUp, ChevronDown, Minus, Maximize2, Edit3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';

export const CategoriesSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onEdit }) => {
  const { categories, incomeCategories, addCategory, deleteCategory, darkMode, themeColor, isAllExpanded } = useFinancial();
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
    useEffect(() => {
    setIsExpanded(isAllExpanded);
  }, [isAllExpanded]);
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'

  const currentList = activeTab === 'expense' ? categories : incomeCategories;


  
  const handleAdd = (e) => {
    e.preventDefault();
    if (newCat.trim()) {
      addCategory(newCat.trim(), activeTab);
      setNewCat('');
      setIsAdding(false);
    }
  };

  const handleDelete = (cat) => {
    if (window.confirm(`¿Eliminar categoría "${cat}"?`)) {
      deleteCategory(cat, activeTab);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Tag size={14} style={{ color: themeColor }}/> Categorías
        </h3>
        <div className="flex items-center gap-1">
            <div className="flex flex-col mr-1">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2">
            
            {/* TABS DE TIPO */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3">
                <button 
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'expense' ? 'bg-white text-rose-500 shadow-sm dark:bg-slate-700' : 'text-slate-400'}`}
                >
                    <ArrowDownCircle size={12}/> Gastos
                </button>
                <button 
                    onClick={() => setActiveTab('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'income' ? 'bg-white text-emerald-500 shadow-sm dark:bg-slate-700' : 'text-slate-400'}`}
                >
                    <ArrowUpCircle size={12}/> Ingresos
                </button>
            </div>

            {/* BARRA DE AÑADIR */}
            <div className="flex items-center justify-between mb-3">
               <span className="text-[9px] font-bold text-slate-400 uppercase">{currentList.length} Categorías</span>
               <button 
                    onClick={() => setIsAdding(!isAdding)} 
                    className={`p-1.5 rounded-lg transition-all ${isAdding ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} dark:bg-slate-800`}
                >
                    {isAdding ? <X size={14}/> : <Plus size={14}/>}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input 
                    autoFocus 
                    className="flex-1 p-2 rounded-xl text-xs font-bold outline-none border shadow-sm" 
                    style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#fff' : '#000' }} 
                    placeholder={`Nueva de ${activeTab === 'expense' ? 'Gasto' : 'Ingreso'}...`} 
                    value={newCat} 
                    onChange={e => setNewCat(e.target.value)} 
                />
                <button type="submit" className="px-3 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-colors" style={{ backgroundColor: themeColor }}>OK</button>
                </form>
            )}
            
            <div className="flex flex-wrap gap-2">
                {currentList.map(cat => (
                <div 
                    key={cat} 
                    className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all hover:pr-1 cursor-default shadow-sm hover:shadow-md"
                    style={{ 
                        color: themeColor, 
                        borderColor: `${themeColor}40`, 
                        backgroundColor: darkMode ? `${themeColor}10` : '#ffffff' 
                    }}
                >
                    {cat}
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit({ name: cat, type: activeTab }); }}
                        className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-500 transition-all ml-1"
                    >
                        <Edit3 size={10}/>
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(cat); }} 
                        className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-500 transition-all"
                    >
                        <X size={10}/>
                    </button>
                </div>
                ))}
            </div>
        </div>
      )}
    </Card>
  );
};