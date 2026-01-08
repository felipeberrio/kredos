import React from 'react';
import { CreditCard, Wallet, Banknote } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const WalletItem = ({ wallet }) => {
  const { darkMode, themeColor, privacyMode } = useFinancial();

  const getIcon = () => {
    switch(wallet.type) {
        case 'credit': return <CreditCard size={18}/>;
        case 'debit': return <Wallet size={18}/>;
        default: return <Banknote size={18}/>;
    }
  };

  const getTypeName = () => {
    switch(wallet.type) {
        case 'credit': return 'Crédito';
        case 'debit': return 'Débito';
        default: return 'Efectivo';
    }
  };

  // Cálculos para tarjeta de crédito
  // Asumimos que balance negativo es deuda usada.
  const isCredit = wallet.type === 'credit';
  const limit = wallet.limit || 0;
  const usedDebt = wallet.balance < 0 ? Math.abs(wallet.balance) : 0; // Deuda es el valor negativo absoluto
  const available = limit - usedDebt;
  const progress = limit > 0 ? (usedDebt / limit) * 100 : 0;

  return (
    <div className={`p-4 rounded-3xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                {getIcon()}
            </div>
            <div>
                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{wallet.name}</p>
                <p className="text-[8px] font-black uppercase text-slate-400">{getTypeName()}</p>
            </div>
        </div>

        <div className="text-right">
            <span className={`font-black text-sm block ${privacyMode ? 'blur-md select-none' : ''} ${wallet.balance < 0 ? 'text-rose-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>
                {formatCurrency(wallet.balance)}
            </span>
        </div>
      </div>

      {/* SECCIÓN EXCLUSIVA DE CRÉDITO */}
      {isCredit && (
        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-1 text-[9px] font-bold uppercase">
                <span className="text-slate-400">Cupo Usado</span>
                <span className={`text-emerald-500 ${privacyMode ? 'blur-[2px]' : ''}`}>Disp: {formatCurrency(available)}</span>
            </div>
            
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                        width: `${Math.min(progress, 100)}%`, 
                        backgroundColor: themeColor // Usa el color del tema
                    }}
                />
            </div>
            
            <div className={`text-right text-[8px] font-bold text-slate-400 mt-1 ${privacyMode ? 'blur-[2px]' : ''}`}>
                Límite: {formatCurrency(limit)}
            </div>
        </div>
      )}
    </div>
  );
};