import React from 'react';
import { PlusCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { WalletItem } from '../components/WalletItem';

export const WalletSection = ({ onMoveUp, onMoveDown, isFirst, isLast, onAdd }) => {
  const { wallets } = useFinancial();

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mis Cuentas</p>
        <div className="flex items-center gap-1">
           {/* Controles de orden */}
           <div className="flex flex-col mr-2">
             {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={12} strokeWidth={3}/></button>}
             {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={12} strokeWidth={3}/></button>}
           </div>
           {/* Botón Añadir */}
           <button onClick={onAdd} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
             <PlusCircle size={20}/>
           </button>
        </div>
      </div>
      
      <div className="grid gap-3">
        {wallets.map(w => (
          <WalletItem key={w.id} wallet={w} />
        ))}
      </div>
    </section>
  );
};