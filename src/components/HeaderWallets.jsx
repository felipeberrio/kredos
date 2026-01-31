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
        case 'credit': return <CreditCard size={14}/>;
        case 'debit': return <Wallet size={14}/>;
        default: return <Banknote size={14}/>;
    }
  };

  return (
    <div className="flex items-center gap-3 h-full px-2">
      
      {wallets.map(w => {
        const isSelected = selectedWalletId === w.id;
        const isCredit = w.type === 'credit';
        const balance = Math.abs(w.balance); // En crédito, el balance suele ser negativo (deuda)
        const limit = w.limit || 0;
        const available = limit - balance;
        // Porcentaje de USO (para el círculo): Si debo 300 de 1000, es 30% lleno
        const progressPercent = limit > 0 ? (balance / limit) * 100 : 0;
        // Configuración del Círculo SVG
        const radius = 10;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (Math.min(progressPercent, 100) / 100) * circumference;

        // --- COLORES DINÁMICOS PROFESIONALES ---
        // Creamos versiones transparentes del color del tema para el fondo y la sombra
        const selectedBg = darkMode ? `${themeColor}15` : `${themeColor}08`; // Tinte muy suave (8%-15%)
        const selectedShadow = `0 4px 12px -3px ${themeColor}40`; // Sombra difusa (40%)

        return (
          <div 
            key={w.id}
            onClick={() => handleWalletClick(w.id)}
            // --- CAMBIO DE CLASES AQUÍ ---
            // Quitamos los rings y backgrounds fijos. Usamos scale y border base.
            className={`
                group relative min-w-[140px] h-[50px] px-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between shrink-0
                ${isSelected 
                    ? 'scale-[1.02]' 
                    : 'bg-white/40 hover:bg-white/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 border-transparent hover:shadow-sm'
                }
            `}
            // --- ESTILOS EN LÍNEA PARA EL EFECTO PREMIUM ---
            style={{ 
                backgroundColor: isSelected ?  '#c7c8c9ca' : '#f1f5f9',
                borderColor: isSelected ? themeColor : undefined,
                boxShadow: isSelected ? selectedShadow : undefined,
            }}
          >
            {/* --- SECCIÓN IZQUIERDA: Info Principal --- */}
            <div className="flex flex-col justify-center gap-1 pr-4">
                {/* IZQUIERDA: Icono + Textos */}
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100/80 text-slate-500'}`} style={{ color: isSelected ? themeColor : undefined, backgroundColor: isSelected ? (darkMode ? `${themeColor}20` : 'white') : undefined }}>
                        {getIcon(w.type)}
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1">
                            <p className={`text-[10px] font-bold leading-none truncate max-w-[80px] transition-colors ${darkMode ? 'text-slate-200' : 'text-slate-700'}`} style={{ color: isSelected ? themeColor : undefined }}>
                                {w.name}
                            </p>
                        </div>
                        <span className={`text-[8px] font-bold uppercase mt-0.5 text-slate-400`}>
                            {w.type === 'credit' ? 'Crédito' : w.type === 'debit' ? 'Débito' : 'Efectivo'}
                        </span>
                    </div>
                </div>

                {/* Saldo Principal */}
                <span className={`text-sm font-black tracking-tight ${privacyMode ? 'blur-[3px] select-none' : ''} ${w.balance < 0 ? 'text-rose-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>
                    {formatCurrency(w.balance)}
                </span>
            </div>

            

            {/* Indicador Selección (Esquina) */}
            {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                    <CheckCircle2 size={10} style={{ color: themeColor, fill: darkMode ? "#1e293b" : "white" }} />
                </div>
            )}

            {/* Botones Hover (Flotantes) */}
            <div className="absolute  left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-1" >
                <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 p-0.5 px-1.5" style={{ '--tw-ring-color': isSelected ? themeColor : 'transparent', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(w); }} className="p-1 text-slate-400 hover:text-blue-500 transition-colors"><Settings size={10}/></button>
                    <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 self-center"></div>
                    <button onClick={(e) => { e.stopPropagation(); deleteWallet(w.id); }} className="p-1 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={10}/></button>
                </div>
            </div>

          </div>
        );
      })}

      {/* Botón Agregar Compacto */}
      <button 
        onClick={onAdd}
        className={`
            h-[35px] w-[35px] rounded-2xl border-2 border-dashed flex items-center justify-center transition-all shrink-0
            ${darkMode ? 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50' : 'border-slate-300/50 hover:border-slate-400 hover:bg-slate-50/50'}
        `}
      >
        <Plus size={20} className="text-slate-400"/>
      </button>

    </div>
  );
};