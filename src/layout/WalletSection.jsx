import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, ChevronUp, ChevronDown, CheckCircle2, Minus, Maximize2, Settings, Trash2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { WalletItem } from '../components/WalletItem';
import { formatCurrency } from '../utils/formatters';

export const WalletSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd, onEdit }) => {
  const { wallets, selectedWalletId, setSelectedWalletId, themeColor, deleteWallet, isAllExpanded } = useFinancial();
  const [isExpanded, setIsExpanded] = useState(true);
  const { formatMoney } = useFinancial();
  
  useEffect(() => {
    setIsExpanded(isAllExpanded);
}, [isAllExpanded]);

  const handleWalletClick = (id) => {
    if (selectedWalletId === id) setSelectedWalletId(null);
    else setSelectedWalletId(id);
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {selectedWalletId ? 'Filtrando por Cuenta' : 'Mis Cuentas'}
        </p>
        <div className="flex items-center gap-1">
           <div className="flex flex-col mr-1">
             {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
             {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
           </div>
           <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
           </button>
           <button onClick={onAdd} className="p-1.5 hover:bg-slate-100 dark:hover:bg-blue-900/20 rounded-lg transition-all" style={{ color: themeColor }}>
             <PlusCircle size={20}/>
           </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
            {wallets.map(w => {
            const isSelected = selectedWalletId === w.id;
            return (
                <div 
                    key={w.id} 
                    className={`relative group transition-all duration-300 cursor-pointer rounded-3xl ${isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                    style={{ '--tw-ring-color': isSelected ? themeColor : 'transparent' }}
                    onClick={() => handleWalletClick(w.id)}
                >
                    <WalletItem wallet={w} />
                    
                    {/* Indicador de Selección (ARREGLADO EL CIRCULO NEGRO) */}
                    {isSelected && (
                        <div className="absolute top-2 right-2 bg-white dark:bg-slate-900 rounded-full">
                            <CheckCircle2 size={20} style={{ color: themeColor, fill: "white" }} /> 
                        </div>
                    )}

                    {/* Botones de acción (Editar/Borrar) solo al hover */}
                    <div className="absolute bottom-2 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(w); }} 
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-500 rounded-lg"
                        >
                            <Settings size={14}/>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteWallet(w.id); }} 
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 rounded-lg"
                        >
                            <Trash2 size={14}/>
                        </button>
                    </div>
                </div>
            );
            })}
        </div>
      )}
    </section>
  );
};