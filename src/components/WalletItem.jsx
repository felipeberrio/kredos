import React from 'react';
import { CreditCard, Wallet, Trash2, Settings } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const WalletItem = ({ wallet }) => {
  const { darkMode, themeColor, privacyMode } = useFinancial();

  return (
    <div className={`p-4 rounded-3xl border transition-all flex items-center justify-between
      ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
          {wallet.type === 'credit' ? <CreditCard size={18}/> : <Wallet size={18}/>}
        </div>
        <div>
          <p className="text-xs font-bold">{wallet.name}</p>
          {wallet.type === 'credit' && <p className="text-[8px] font-black text-rose-500 uppercase">Crédito</p>}
        </div>
      </div>

      <div className="text-right">
        <span className={`font-black text-sm block ${privacyMode ? 'blur-md' : ''}`}>
          {formatCurrency(wallet.balance)}
        </span>
      </div>
    </div>
  );
};