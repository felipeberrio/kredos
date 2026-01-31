import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, ChevronUp, ChevronDown, Minus, Maximize2, Edit3, ArrowDownCircle, ArrowUpCircle, Target } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';

export const CategoriesSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onEdit, onAdd }) => {
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

        
        {/* --- HEADER ESTANDARIZADO --- */}
        <div className="flex justify-between items-center mb-4">
            {/* IZQUIERDA: ÍCONO Y TÍTULO */}
            <div className="flex items-center gap-3">
  
                    <div className={` rounded-xl shrink-0${darkMode ?'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                        <Tag size={14} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        CATEGORÍAS 
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{currentList.length} Categorías</span>

            </div>
            {/* DERECHA: CONTROLES (ORDENAR -> MINIMIZAR -> AGREGAR) */}
            <div className="flex items-center gap-3">
                
                {/* 1. ORDENAR (Flechas Verticales) */}
                <div className="flex flex-col items-center justify-center gap-0.5">
                    <button 
                        onClick={onMoveUp} 
                        disabled={isFirst}
                        className={`hover:text-blue-500 transition-colors leading-none ${isFirst ? 'opacity-30 cursor-not-allowed' : 'text-slate-400'}`}
                        title="Subir Sección"
                    >
                        <ChevronUp size={10} />
                    </button>
                    <button 
                        onClick={onMoveDown} 
                        disabled={isLast}
                        className={`hover:text-blue-500 transition-colors leading-none ${isLast ? 'opacity-30 cursor-not-allowed' : 'text-slate-400'}`}
                        title="Bajar Sección"
                    >
                        <ChevronDown size={10} />
                    </button>
                </div>

                {/* 2. MINIMIZAR (Guión) */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={isExpanded ? "Contraer" : "Expandir"}
                >
                    {isExpanded ? <Minus size={16}/> : <Maximize2 size={14}/>}
                </button>

                {/* 3. AGREGAR (Botón Azul) */}
                {/* Solo se muestra si la sección tiene función de agregar */}
                {onAdd && (
                    <button 
                        onClick={onAdd} 
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
                        title="Agregar Nuevo"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>
       
      </div>

        

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2">
            
            {/* TABS DE TIPO - FONDO FORZADO PARA EVITAR ERRORES DE MODO OSCURO */}
            <div className={`flex p-1 rounded-xl shadow-inner  ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'expense' ? 'bg-white text-rose-500 shadow-sm dark:bg-slate-700' : 'text-slate-400'}`}
                    style={{ 
                        color: activeTab === 'expense' ? themeColor : undefined,
                        backgroundColor: activeTab === 'expense' 
                            ? (darkMode ? `${themeColor}15` : '#ffffff') // BLANCO en claro, TINTE en oscuro
                            : 'transparent'
                    }}
                >
                    <ArrowDownCircle size={12}/> Gastos
                </button>
                <button 
                    onClick={() => setActiveTab('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'income' ? 'bg-white text-emerald-500 shadow-sm dark:bg-slate-700' : 'text-slate-400'}`}
                    style={{ 
                        color: activeTab === 'income' ? themeColor : undefined,
                        backgroundColor: activeTab === 'income' 
                            ? (darkMode ? `${themeColor}15` : '#ffffff') 
                            : 'transparent'
                    }}
                >
                    <ArrowUpCircle size={12}/> Ingresos
                </button>
            </div>
            
            
            {/* INPUT AÑADIR */}
            {isAdding && (
                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input 
                    autoFocus 
                    className="flex-1 p-2 rounded-xl text-xs font-bold outline-none border shadow-sm" 
                    style={{ 
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                        color: darkMode ? '#fff' : '#000', 
                        borderColor: themeColor 
                    }}
                    placeholder={`Nueva de ${activeTab === 'expense' ? 'Gasto' : 'Ingreso'}...`} 
                    value={newCat || ''} 
                    onChange={e => setNewCat(e.target.value)} 
                />
                <button type="submit" className="px-3 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-colors" style={{ backgroundColor: themeColor }}>OK</button>
                </form>
            )}
            {/* LISTA DE CATEGORÍAS */}
            <div className="flex flex-wrap gap-2 m-2">
                {currentList.map(cat => (
                <div 
                    key={cat} 
                    className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border text-[10px] font-medium uppercase tracking-wide transition-all hover:pr-1 cursor-default shadow-sm hover:shadow-md"
                    style={{ themeColor : 'transparent', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }}
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