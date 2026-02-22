import React from 'react';
import { Plus, Wallet, CreditCard, Banknote, Trash2, Settings, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const HeaderWallets = ({ onAdd, onEdit }) => {
  const { wallets, selectedWalletId, setSelectedWalletId, themeColor, deleteWallet, darkMode, privacyMode } = useFinancial();

  const handleWalletClick = (id) => {
    if (selectedWalletId === id) setSelectedWalletId(null);
    else setSelectedWalletId(id);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'credit': return <CreditCard size={14} strokeWidth={2.5}/>;
      case 'debit': return <Wallet size={14} strokeWidth={2.5}/>;
      default: return <Banknote size={14} strokeWidth={2.5}/>;
    }
  };

  return (
    <div className="flex items-center gap-3 h-full px-2">
      {wallets.map(w => {
        const isSelected = selectedWalletId === w.id;
        const isCredit = w.type === 'credit';
        const balance = Math.abs(w.balance);
        const limit = w.limit || 0;
        const progressPercent = limit > 0 ? (balance / limit) * 100 : 0;
        const radius = 10;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (Math.min(progressPercent, 100) / 100) * circumference;

        return (
          <div
            key={w.id}
            onClick={() => handleWalletClick(w.id)}
            className={`
              group relative min-w-[130px] sm:min-w-[145px] h-[48px] sm:h-[52px] px-3 rounded-xl border-2 cursor-pointer flex items-center gap-2 shrink-0
              transition-all duration-200 ease-out hover:shadow-card-hover active:scale-[0.99]
              ${isSelected 
                ? 'border-current shadow-card' 
                : 'border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50'}
              ${darkMode 
                ? (isSelected ? 'bg-slate-800' : 'bg-slate-800/60 hover:bg-slate-800') 
                : (isSelected ? 'bg-white shadow-card' : 'bg-slate-50/80 hover:bg-white')}
            `}
            style={isSelected ? { borderColor: themeColor, boxShadow: `0 0 0 1px ${themeColor}` } : {}}
          >
            <div className={`p-2 rounded-lg shrink-0 transition-colors ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} ${isSelected ? 'opacity-100' : 'opacity-90'}`} style={isSelected ? { backgroundColor: `${themeColor}20`, color: themeColor } : {}}>
              {getIcon(w.type)}
            </div>
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <p className={`text-[10px] sm:text-xs font-semibold leading-none truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {w.name}
              </p>
              <span className={`text-xs sm:text-sm font-bold tabular-nums leading-tight ${privacyMode ? 'blur-[2px]' : ''} ${w.balance < 0 ? 'text-rose-500' : (darkMode ? 'text-slate-100' : 'text-slate-800')}`} style={isSelected && w.balance >= 0 ? { color: themeColor } : {}}>
                {formatCurrency(w.balance)}
              </span>
            </div>
            {isSelected && (
              <div className="absolute top-1.5 right-1.5">
                <CheckCircle2 size={12} className="text-current" style={{ color: themeColor }} strokeWidth={2.5} />
              </div>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className={`flex gap-0.5 rounded-full border p-1 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200 shadow-card'}`}>
                <button onClick={(e) => { e.stopPropagation(); onEdit(w); }} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
                  <Settings size={12} strokeWidth={2.5}/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteWallet(w.id); }} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all duration-200">
                  <Trash2 size={12} strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={onAdd}
        className={`
          h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] rounded-xl border-2 border-dashed flex items-center justify-center shrink-0
          transition-all duration-200 hover:scale-105 active:scale-95
          ${darkMode ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
        `}
      >
        <Plus size={22} className="text-slate-400" strokeWidth={2}/>
      </button>
    </div>
  );
};
