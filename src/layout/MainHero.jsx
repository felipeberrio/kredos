import React from 'react';
import { Wallet, PiggyBank, CreditCard, XCircle } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const MainHero = () => {
  const { displayBalance, themeColor, privacyMode, selectedWalletId, wallets, setSelectedWalletId } = useFinancial();

  // Buscar la wallet activa si existe
  const activeWallet = selectedWalletId ? wallets.find(w => w.id === selectedWalletId) : null;

  return (
    <div 
      className="p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl transition-all duration-500"
      style={{ backgroundColor: themeColor }}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start">
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
            {activeWallet ? (
                <>
                    {activeWallet.type === 'credit' ? <CreditCard size={12}/> : <Wallet size={12}/>}
                    {activeWallet.name}
                </>
            ) : (
                <><PiggyBank size={12}/> Patrimonio Neto Total</>
            )}
            </p>
            {activeWallet && (
                <button 
                    onClick={() => setSelectedWalletId(null)}
                    className="bg-white/20 hover:bg-white/30 p-1 rounded-full text-white transition-colors"
                    title="Ver todo"
                >
                    <XCircle size={16}/>
                </button>
            )}
        </div>

        {/* LOGICA DE VISUALIZACIÓN */}
        {activeWallet && activeWallet.type === 'credit' ? (
            <div className="mt-2">
                <div className="flex items-end gap-2 mb-3">
                    <h2 className={`text-4xl font-black tracking-tighter ${privacyMode ? 'blur-md select-none opacity-50' : ''}`}>
                        {formatCurrency(activeWallet.balance)}
                    </h2>
                    <span className="text-xs font-bold text-white/60 mb-2">Saldo Actual</span>
                </div>
            </div>
        ) : (
            <h2 className={`text-5xl font-black tracking-tighter ${privacyMode ? 'blur-md select-none opacity-50' : ''}`}>
            {formatCurrency(displayBalance)}
            </h2>
        )}
      </div>

      {/* ICONO DE FONDO */}
      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
        {activeWallet && activeWallet.type === 'credit' ? <CreditCard size={140}/> : <Wallet size={140}/>}
      </div>
    </div>
  );
};