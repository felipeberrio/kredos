import React from 'react';
import { Wallet, PiggyBank } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const MainHero = () => {
  const { totalBalance, themeColor, privacyMode } = useFinancial();

  return (
    <div 
      className="p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl"
      style={{ backgroundColor: themeColor }}
    >
      <div className="relative z-10">
        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
          <PiggyBank size={12}/> Patrimonio Neto Total
        </p>
        <h2 className={`text-5xl font-black tracking-tighter ${privacyMode ? 'blur-md select-none opacity-50' : ''}`}>
          {formatCurrency(totalBalance)}
        </h2>
      </div>
      <Wallet className="absolute -right-4 -bottom-4 opacity-10 rotate-12" size={140} />
    </div>
  );
};