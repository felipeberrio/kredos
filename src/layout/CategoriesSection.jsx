import React, { useState } from 'react';
import { Tag, Plus, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';

export const CategoriesSection = ({ onMoveUp, onMoveDown, isFirst, isLast }) => {
  const { categories, addCategory, setCategories, darkMode, themeColor } = useFinancial();
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCat.trim()) {
      addCategory(newCat.trim());
      setNewCat('');
      setIsAdding(false);
    }
  };

  const deleteCategory = (catToDelete) => {
    if (window.confirm(`¿Eliminar categoría "${catToDelete}"?`)) {
      setCategories(categories.filter(c => c !== catToDelete));
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Tag size={14}/> Categorías
        </h3>
        <div className="flex items-center gap-2">
            <div className="flex flex-col">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={12} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={12} strokeWidth={3}/></button>}
            </div>
            <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1.5 rounded-lg transition-all ${isAdding ? 'bg-rose-100 text-rose-500' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'} dark:bg-slate-800`}
            >
            {isAdding ? <X size={16}/> : <Plus size={16}/>}
            </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
          <input 
            autoFocus
            className={`flex-1 p-2 rounded-xl text-xs font-bold outline-none border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
            placeholder="Nueva categoría..."
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors" style={{ backgroundColor: themeColor }}>OK</button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <div key={cat} className={`group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all hover:pr-1 ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
            {cat}
            <button onClick={() => deleteCategory(cat)} className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-500 transition-all"><X size={10}/></button>
          </div>
        ))}
      </div>
    </Card>
  );
};  