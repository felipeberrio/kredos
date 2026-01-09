import React, { useMemo } from 'react';
import { Wallet, CreditCard, Banknote, Coins } from 'lucide-react'; // Agregamos Banknote y Coins
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const MainHero = () => {
  // 1. Traemos themeColor del contexto
  const { wallets, selectedWalletId, privacyMode, themeColor } = useFinancial();

  // 2. Calculamos el total global
  const totalBalance = useMemo(() => wallets.reduce((acc, w) => acc + Number(w.balance), 0), [wallets]);

  // 3. Detectar si hay una billetera seleccionada
  const activeWallet = useMemo(() => {
    if (!selectedWalletId) return null;
    return wallets.find(w => w.id === selectedWalletId);
  }, [selectedWalletId, wallets]);

  // 4. Datos de la cuenta activa
  const walletType = activeWallet?.type || 'global'; // 'global', 'credit', 'debit', 'cash'
  const isCredit = walletType === 'credit';
  
  // Datos de Crédito (si aplica)
  const creditLimit = isCredit ? (activeWallet.limit || 0) : 0;
  const creditUsed = isCredit ? Math.abs(activeWallet.balance) : 0;
  const creditAvailable = creditLimit - creditUsed;
  const progressPercent = creditLimit > 0 ? Math.min((creditUsed / creditLimit) * 100, 100) : 0;

  // 5. Valores a mostrar
  const displayBalance = activeWallet ? activeWallet.balance : totalBalance;
  const displayName = activeWallet ? activeWallet.name : "Patrimonio Neto Total";

  // Función auxiliar para ocultar datos
  const maskValue = (val) => privacyMode ? '****' : formatCurrency(val);

  // --- LÓGICA DE ICONOS DINÁMICOS ---

  // Icono pequeño del encabezado
  const getHeaderIcon = () => {
      switch (walletType) {
          case 'credit':
          case 'debit': return <CreditCard size={18} />;
          case 'cash': return <Banknote size={18} />;
          default: return <Wallet size={18} />;
      }
  };

  // Icono GRANDE de fondo
  const getBackgroundIcon = () => {
      const baseClasses = "absolute -right-6 -bottom-6 w-48 h-48 text-white/10 -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-0 pointer-events-none";
      
      switch (walletType) {
          case 'credit':
          case 'debit':
              return <CreditCard className={baseClasses} strokeWidth={1} />;
          case 'cash':
              // Usamos Coins para efectivo, se ve bien como patrón de fondo
              return <Coins className={baseClasses} strokeWidth={1} />;
          default:
              // Billetera genérica para el global
              return <Wallet className={baseClasses} strokeWidth={1} />;
      }
  };


  return (
    <div className="grid grid-cols-1 relative z-0">
      {/* TARJETA PRINCIPAL
          - Quitamos bg-cyan-500 y shadow-cyan-...
          - Usamos style={{ backgroundColor: themeColor, boxShadow: ... }} para el color dinámico
      */}
      <div 
        className="p-6 rounded-3xl relative text-white flex flex-col justify-between group overflow-hidden min-h-[180px] transition-colors duration-300"
        style={{ 
            backgroundColor: themeColor,
            // Creamos una sombra suave del mismo color (usando opacidad hex '40' que es aprox 25%)
            boxShadow: `0 20px 25px -5px ${themeColor}40, 0 8px 10px -6px ${themeColor}40`
        }}
      >
        
        {/* Encabezado */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 opacity-90 mb-1">
            {getHeaderIcon()}
            <span className="text-xs font-black uppercase tracking-widest">{displayName}</span>
          </div>
          
          {/* Saldo con Privacidad */}
          <h2 className="text-5xl font-black tracking-tighter">
            {maskValue(displayBalance)}
          </h2>
          {isCredit && <span className="text-xs font-bold opacity-80">Saldo Actual (Deuda)</span>}
        </div>

        {/* Barra de Progreso (Solo Crédito) */}
        {isCredit ? (
            <div className="relative z-10 mt-6 animate-in fade-in slide-in-from-bottom-3">
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden mb-2 backdrop-blur-sm">
                    <div 
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                    <div className="flex flex-col">
                        <span className="opacity-60 text-[9px] uppercase">Cupo Usado</span>
                        <span>{privacyMode ? '****' : `${formatCurrency(creditUsed)} (${Math.round(progressPercent)}%)`}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="opacity-60 text-[9px] uppercase">Disponible</span>
                        <span className="text-white text-sm">{maskValue(creditAvailable)}</span>
                    </div>
                </div>
            </div>
        ) : (
            // Chips informativos para Débito o Efectivo
            <div className="relative z-10 mt-2">
                {walletType === 'cash' && (
                    <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 w-fit">
                        <Banknote size={12}/> Efectivo
                    </span>
                )}
                {walletType === 'debit' && (
                    <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 w-fit">
                        <CreditCard size={12}/> Cuenta Débito
                    </span>
                )}
            </div>
        )}

        {/* Icono de Fondo Dinámico */}
        {getBackgroundIcon()}
      </div>
    </div>
  );
};