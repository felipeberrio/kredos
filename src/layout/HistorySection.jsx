import React, { useState, useEffect ,useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit3, Tag, Filter, ArrowUpDown, Wallet, RefreshCw, ChevronUp, ChevronDown, Minus, Maximize2, History } from 'lucide-react';

export const HistorySection = ({ onMoveUp, onMoveDown, isFirst, isLast, onEdit }) => {
  const { filteredIncomes, filteredExpenses, deleteTransaction, wallets, categories, dateFilter, themeColor, darkMode,isAllExpanded } = useFinancial();
  
  // Estados de UI
  const [isExpanded, setIsExpanded] = useState(true);
  useEffect(() => {
    setIsExpanded(isAllExpanded);
}, [isAllExpanded]);
  // Estados de Filtro Local
  const [localWallet, setLocalWallet] = useState('all');
  const [localCategory, setLocalCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const processedTransactions = useMemo(() => {
    let data = [
      ...filteredIncomes.map(i => ({ ...i, type: 'income' })),
      ...filteredExpenses.map(e => ({ ...e, type: 'expense' }))
    ];

    if (localWallet !== 'all') data = data.filter(t => t.walletId === localWallet);
    if (localCategory !== 'all') data = data.filter(t => (t.category || 'Otros') === localCategory);

    data.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest': return new Date(a.date) - new Date(b.date);
        case 'highest': return b.amount - a.amount;
        case 'lowest': return a.amount - b.amount;
        case 'newest': default: return new Date(b.date) - new Date(a.date);
      }
    });

    return data;
  }, [filteredIncomes, filteredExpenses, localWallet, localCategory, sortOrder]);

  const selectStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
    color: darkMode ? '#fff' : '#475569',
    borderColor: darkMode ? '#334155' : '#e2e8f0'
  };

  return (
    <Card className="transition-all duration-300">
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <History size={14} style={{ color: themeColor }}/> Historial Transacciones
            </h3>
            {dateFilter.mode !== 'all' && (
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                 {dateFilter.mode === 'month' ? dateFilter.value : dateFilter.mode}
                </span>
            )}
        </div>

        {/* CONTROLES DE LA TARJETA (MOVER/MINIMIZAR) */}
        <div className="flex items-center gap-1">
            <div className="flex flex-col mr-1">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2">
            
            {/* BARRA DE FILTROS */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Filtro Wallet */}
                <div className="relative flex-1 min-w-[120px]">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Wallet size={12}/></div>
                    <select value={localWallet} onChange={(e) => setLocalWallet(e.target.value)} className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[10px] font-bold outline-none border appearance-none cursor-pointer hover:border-blue-400 transition-colors" style={selectStyle}>
                        <option value="all">Todas las Cuentas</option>
                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>

                {/* Filtro Categoría */}
                <div className="relative flex-1 min-w-[120px]">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Tag size={12}/></div>
                    <select value={localCategory} onChange={(e) => setLocalCategory(e.target.value)} className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[10px] font-bold outline-none border appearance-none cursor-pointer hover:border-blue-400 transition-colors" style={selectStyle}>
                        <option value="all">Todas las Categorías</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Ordenamiento */}
                <div className="relative flex-1 min-w-[120px]">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ArrowUpDown size={12}/></div>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[10px] font-bold outline-none border appearance-none cursor-pointer hover:border-blue-400 transition-colors" style={selectStyle}>
                        <option value="newest">Más Recientes</option>
                        <option value="oldest">Más Antiguas</option>
                        <option value="highest">Mayor Monto</option>
                        <option value="lowest">Menor Monto</option>
                    </select>
                </div>

                {/* Reset */}
                {(localWallet !== 'all' || localCategory !== 'all' || sortOrder !== 'newest') && (
                    <button onClick={() => { setLocalWallet('all'); setLocalCategory('all'); setSortOrder('newest'); }} className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Limpiar Filtros">
                        <RefreshCw size={14}/>
                    </button>
                )}
            </div>
          
            {/* LISTA DE TRANSACCIONES */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {processedTransactions.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <Filter size={48} className="mx-auto mb-2 text-slate-300"/>
                    <p className="text-slate-400 text-xs font-bold">No hay transacciones</p>
                </div>
                )}
                
                {processedTransactions.map(t => {
                const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Cuenta borrada';
                return (
                    <div key={t.id} className={`flex items-center justify-between group p-3 rounded-2xl transition-all border ${darkMode ? 'hover:bg-slate-800/50 border-transparent hover:border-slate-700 text-white' : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800 shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {t.type === 'income' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                            </div>
                            <div>
                            <div className="flex items-center gap-2">
                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.name}</p>
                                {t.category && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-md border font-bold uppercase flex items-center gap-1 shadow-sm" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: darkMode ? `${themeColor}10` : '#ffffff' }}>
                                        <Tag size={8}/> {t.category}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t.date} • {walletName}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(t)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit3 size={16}/></button>
                            <button onClick={() => deleteTransaction(t.id, t.type)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
        </div>
      )}
    </Card>
  );
};