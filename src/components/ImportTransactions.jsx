import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { useFinancial } from '../context/FinancialContext'; 
// Importamos tus listas base para tener la referencia inicial
import { DEFAULT_INCOME_CATS, DEFAULT_EXPENSE_CATS } from '../constants/config'; 
import { X, Check, UploadCloud, Wallet, Trash2, AlertCircle } from 'lucide-react';

export default function ImportTransactions({ onClose }) {
  // Traemos 'categories' (que contiene TODAS: por defecto + nuevas)
  const { categories, incomeCategories, wallets, addTransaction } = useFinancial(); 
  
  const [previewData, setPreviewData] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [targetWalletId, setTargetWalletId] = useState('');

  // ----------------------------------------------------------------------
  // 1. CEREBRO DE SEPARACIÓN DE CATEGORÍAS (FIJAS + NUEVAS)
  // ----------------------------------------------------------------------
  const { incomeList, expenseList } = useMemo(() => {
    // Definimos palabras clave para detectar si una categoría NUEVA es de ingreso
    const INCOME_KEYWORDS = ['ingreso', 'salario', 'sueldo', 'deposito', 'ahorro', 'negocio', 'freelance', 'banco', 'honorarios', 'retorno', '💰', '💸', '💵', '📈', 'dev'];

    // A. LISTA DE INGRESOS
    // Incluye las que están en tu config por defecto O las nuevas que parezcan ingresos
    const income = incomeCategories.filter(cat => {
        // 1. ¿Es una de las por defecto?
        if (DEFAULT_INCOME_CATS.includes(cat)) return true;
        // 2. ¿Tiene palabras clave de dinero? (Para las nuevas)
        return INCOME_KEYWORDS.some(k => cat.toLowerCase().includes(k));
    });

    // B. LISTA DE GASTOS
    // Incluye las que están en config de gastos O cualquiera que NO haya sido detectada como ingreso
    const expense = categories.filter(cat => {
        // Si ya está en la lista de ingresos, NO es gasto
        if (income.includes(cat)) return false;
        // Si no es ingreso, asumimos que es gasto
        return true;
    });

    return { incomeList: income, expenseList: expense };
  }, [categories]); // Se actualiza si creas una categoría nueva en la app


  // ----------------------------------------------------------------------
  // 2. LÓGICA DE AUTO-CATEGORIZACIÓN (Inteligencia Artificial Básica)
  // ----------------------------------------------------------------------
  const autoCategorize = (description, amount) => {
    if (!description) return ''; 
    const lowerDesc = description.toString().toLowerCase();
    const isIncome = amount > 0;

    // Helper para buscar dentro de una lista específica
    const findIn = (list, keyword) => list.find(c => c.toLowerCase().includes(keyword));

    if (isIncome) {
        // BUSCAR SOLO EN LA LISTA DE INGRESOS
        return findIn(incomeList, 'ingreso') || 
               findIn(incomeList, 'salario') || 
               findIn(incomeList, 'deposito') || 
               findIn(incomeList, 'nomina') || '';
    } else {
        // BUSCAR SOLO EN LA LISTA DE GASTOS (Tus reglas)
        // Comida
        if (['doordash', 'uber eats', 'rappi', 'mcdonalds', 'bravo', 'publix', 'restaurant'].some(k => lowerDesc.includes(k))) {
            return findIn(expenseList, 'comida') || findIn(expenseList, 'supermercado') || ''; 
        }
        // Transporte
        if (['uber', 'lyft', 'parking', 'shell', 'chevron', 'gas', 'exxon'].some(k => lowerDesc.includes(k))) {
           return findIn(expenseList, 'transporte') || findIn(expenseList, 'gasolina') || '';
        }
        // Entretenimiento
        if (['netflix', 'spotify', 'apple', 'hbo', 'disney', 'cinema'].some(k => lowerDesc.includes(k))) {
           return findIn(expenseList, 'suscrip') || findIn(expenseList, 'entretenimiento') || '';
        }
        // Vivienda/Servicios
        if (['fpl', 'water', 'internet', 'rent', 'lease', 'comcast'].some(k => lowerDesc.includes(k))) {
            return findIn(expenseList, 'vivienda') || findIn(expenseList, 'servicios') || '';
        }
        // Otros detectados en tus imágenes
        if (lowerDesc.includes('express')) return findIn(expenseList, 'ocio') || ''; 
    }
    return ''; 
  };


  // ----------------------------------------------------------------------
  // 3. MANEJO DE ARCHIVOS Y DATOS
  // ----------------------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processed = results.data.map((row, index) => {
          const desc = row['Description'] || row['Payee'] || row['Memo'] || 'Sin descripción';
          // Limpieza robusta del monto (quita símbolos de moneda y comas)
          let rawAmount = row['Amount'];
          if (typeof rawAmount === 'string') rawAmount = rawAmount.replace(/[^0-9.-]+/g,"");
          const amount = parseFloat(rawAmount || 0);
          
          const suggestedCategory = autoCategorize(desc, amount);
          
          // Validación: ¿La sugerencia realmente existe en la lista correcta?
          let isValid = false;
          if (amount > 0) isValid = incomeList.includes(suggestedCategory);
          else isValid = expenseList.includes(suggestedCategory);

          return {
            tempId: index, 
            date: row['Posted Date'] || row['Date'] || new Date().toISOString().split('T')[0],
            payee: desc,
            amount: amount,
            category: isValid ? suggestedCategory : '', 
            needsReview: !isValid // Si no encontró categoría válida, marca para revisar
          };
        });
        setPreviewData(processed);
        setIsReviewing(true);
      }
    });
  };

  const updateCategory = (index, newCategory) => {
    const updatedData = [...previewData];
    updatedData[index].category = newCategory;
    updatedData[index].needsReview = false;
    setPreviewData(updatedData);
  };

  const handleClearAll = () => {
    if(window.confirm('¿Borrar todo y empezar de cero?')) {
        setPreviewData([]);
        setIsReviewing(false);
        setTargetWalletId('');
    }
  };

  const handleSaveToSupabase = async () => {
    if (!targetWalletId) return alert("⚠️ Selecciona una Billetera primero.");
    if (previewData.some(t => !t.category)) return alert("⚠️ Hay transacciones sin categoría (revisa las rojas).");
    
    try {
        let successCount = 0;
        for (const tx of previewData) {
            const isIncome = tx.amount > 0;
            
            // 1. SEPARAMOS EL TIPO
            const typeStr = isIncome ? 'income' : 'expense';

            // 2. PREPARAMOS EL OBJETO DE DATOS
            const newTransaction = {
                // Formato de fecha seguro para Supabase
                date: new Date(tx.date).toISOString().split('T')[0], 
                name: tx.payee,
                description: tx.payee,
                amount: Math.abs(tx.amount), // Siempre positivo
                category: tx.category,
                walletId: targetWalletId,
            };
            
            // 3. ENVIAMOS LOS DOS ARGUMENTOS SEPARADOS (Tipo, Datos)
            // Esto soluciona el error "Cannot destructure property 'id'..."
            await addTransaction(typeStr, newTransaction);
            
            successCount++;
        }
        alert(`¡Éxito! Se guardaron ${successCount} movimientos en tu billetera.`);
        if(onClose) onClose();
    } catch (error) {
        console.error("Error importando:", error);
        alert("Error al guardar. Revisa la consola.");
    }
  };
  // ----------------------------------------------------------------------
  // 4. RENDERIZADO (UI)
  // ----------------------------------------------------------------------
  return (
    <div className="w-full">
      {!isReviewing ? (
        // VISTA DE CARGA (DROPZONE)
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 bg-slate-50 dark:bg-slate-800/50 transition-colors">
           <div className="mb-4 p-4 bg-emerald-100 rounded-full text-emerald-600 animate-bounce">
             <UploadCloud size={40} />
           </div>
           <p className="text-slate-600 dark:text-slate-300 font-bold mb-2">Sube tu CSV del Banco</p>
           <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
        </div>
      ) : (
        // VISTA DE REVISIÓN (TABLA)
        <div className="space-y-4">
          
          {/* HEADER: Billetera y Botón Borrar */}
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">Destino de los fondos</h3>
                <button onClick={handleClearAll} className="text-rose-500 p-2 hover:bg-rose-100 rounded-lg transition-colors" title="Borrar todo"><Trash2 size={18}/></button>
             </div>
             <div className="flex items-center gap-2">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400"><Wallet size={20} /></div>
                <select 
                    value={targetWalletId}
                    onChange={(e) => setTargetWalletId(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                    <option value="">-- Selecciona Billetera --</option>
                    {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name} (${w.balance})</option>
                    ))}
                </select>
             </div>
          </div>
          
          {/* TABLA DE TRANSACCIONES */}
          <div className="overflow-y-auto max-h-[50vh] rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transacción</th>
                  <th className="px-3 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-4">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {previewData.map((tx, idx) => {
                  
                  // LÓGICA VISUAL MAESTRA:
                  // Si es positivo -> Muestra solo Ingresos
                  // Si es negativo -> Muestra solo Gastos
                  const isIncome = tx.amount > 0;
                  const categoriesToShow = isIncome ? incomeList : expenseList;

                  return (
                    <tr key={idx} className={`transition-colors ${tx.needsReview ? "bg-rose-50 dark:bg-rose-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                      
                      {/* Descripción y Fecha */}
                      <td className="px-3 py-3 max-w-[150px]">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={tx.payee}>{tx.payee}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{tx.date}</div>
                      </td>

                      {/* Monto con Color */}
                      <td className={`px-3 py-3 text-xs font-black text-right ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isIncome ? '+' : ''}{tx.amount}
                      </td>

                      {/* Selector de Categoría Dinámico */}
                      <td className="px-3 py-2">
                        <select 
                          value={tx.category} 
                          onChange={(e) => updateCategory(idx, e.target.value)}
                          className={`block w-full rounded-lg text-xs border-0 py-2 px-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 dark:bg-slate-800 dark:text-white transition-all cursor-pointer ${
                            tx.needsReview 
                              ? "text-rose-600 ring-rose-300 focus:ring-rose-500 bg-white font-bold" 
                              : "text-slate-700 ring-slate-200 dark:ring-slate-700 focus:ring-emerald-500"
                          }`}
                        >
                          <option value="" disabled>Seleccionar...</option>
                          {/* Renderizado de la lista filtrada */}
                          {categoriesToShow.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* BOTÓN FINAL DE GUARDADO */}
          <button 
            onClick={handleSaveToSupabase}
            disabled={!targetWalletId}
            className={`w-full py-4 rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                !targetWalletId 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {targetWalletId ? <Check size={20} strokeWidth={3}/> : <AlertCircle size={20}/>}
            {targetWalletId ? `CONFIRMAR (${previewData.length})` : 'FALTA SELECCIONAR BILLETERA ARRIBA'}
          </button>
        </div>
      )}
    </div>
  );
}