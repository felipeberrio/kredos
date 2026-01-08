import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit3, Tag } from 'lucide-react';

export const HistorySection = ({ onEdit }) => {
  const { filteredIncomes, expenses, deleteTransaction, wallets, themeColor } = useFinancial();

  const allTransactions = [
    ...filteredIncomes.map(i => ({ ...i, type: 'income' })),
    ...expenses.map(e => ({ ...e, type: 'expense' }))
  ].sort((a, b) => b.id - a.id); // Ordenar por ID (que es el timestamp) para ver lo último primero

  return (
    <Card className="mt-6">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Historial Reciente</h3>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {allTransactions.length === 0 && (
          <p className="text-center text-slate-400 text-xs py-10">No hay movimientos registrados</p>
        )}
        
        {allTransactions.map(t => {
          const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Cuenta borrada';
          return (
            <div key={t.id} className="flex items-center justify-between group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {t.type === 'income' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{t.name}</p>
                    {t.category && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase flex items-center gap-1">
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
                  <button 
                    onClick={() => onEdit(t)}
                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Editar"
                  >
                    <Edit3 size={16}/>
                  </button>
                  <button 
                    onClick={() => deleteTransaction(t.id, t.type)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};