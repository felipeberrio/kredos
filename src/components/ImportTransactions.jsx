import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { useFinancial } from '../context/FinancialContext'; 
import { DEFAULT_INCOME_CATS, DEFAULT_EXPENSE_CATS } from '../constants/config'; 
import { X, Check, UploadCloud, Wallet, Trash2, AlertCircle } from 'lucide-react';

export default function ImportTransactions({ onClose }) {
  const { categories, incomeCategories, wallets, addTransaction } = useFinancial(); 
  
  const [previewData, setPreviewData] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [targetWalletId, setTargetWalletId] = useState('');

  // 1. CEREBRO DE CATEGORÍAS
  const { incomeList, expenseList } = useMemo(() => {
    const INCOME_KEYWORDS = ['ingreso', 'salario', 'sueldo', 'deposito', 'ahorro', 'negocio', 'freelance', 'propinas', 'devolución', 'banco', 'honorarios', 'retorno', '💰', '💸', '💵', '📈', 'dev'];

    const income = incomeCategories.filter(cat => {
        if (DEFAULT_INCOME_CATS.includes(cat)) return true;
        return INCOME_KEYWORDS.some(k => cat.toLowerCase().includes(k));
    });

    const expense = categories.filter(cat => {
        if (income.includes(cat)) return false;
        return true;
    });

    return { incomeList: income, expenseList: expense };
  }, [categories]); 

  // 2. AUTO-CATEGORIZACIÓN
  const autoCategorize = (description, amount) => {
    if (!description) return ''; 
    const lowerDesc = description.toString().toLowerCase();
    const isIncome = amount > 0;
    const findIn = (list, keyword) => list.find(c => c.toLowerCase().includes(keyword));

    if (isIncome) {
        return findIn(incomeList, 'ingreso') || findIn(incomeList, 'salario') || findIn(incomeList, 'deposito') || findIn(incomeList, 'nomina') || '';
    } else {
        if (['doordash', 'uber eats', 'advance ice', 'ihop','nddn distrib', 'casablanca', 'sassafras','canteen','spicy pie','la colina com','rozu', 'osso','gril','sabor a colombia', 'burger king','casa de las empan','little caesars', 'aldi', 'exprezo','orion-moil', 'la calenita','buffet', 'new china','ginza japanese','dice.fm','la perrada del go','buffalo wild', 'al pan pan','pdq','dunkin','china wok', 'la brasa grill','pizza', 'papa johns', 'chipotle', 'wendys', 'taco bell', 'kfc', 'mcdonalds','sushi', 'starbucks','el bod', 'los brothers res','rappi', 'dd/br','wm supercenter','el bochinche', 'supermark','mart', 'publix', 'hong kong city bb', 'caprichos mexican' , 'wawa','meat','boca mart','chilis','rinconcito', 'wal-mart','bravo', 'publix', 'restaurant','taco'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'comida') || findIn(expenseList, 'supermercado') || ''; 
        if (['uber', 'lyft', 'parking', 'racetrac', 'tt* miamidade','turo', 'park mobile','hergos inc','parkwa','rapid auto lub', 'pembroke pines he','wpy*discount auto','auto part', 'marathon petro','sunoco', 'fuels', 'city of wpb','parkin','plaza hotel','kwik','pronto tires','shell','parking', 'chevron', 'gas', 'exxon', 'transit', 'broward county'].some(k => lowerDesc.includes(k))) 
            return findIn(expenseList, 'transporte') || findIn(expenseList, 'gasolina') || '';
        if (['netflix', 'spotify', 'apple', 'mad radi', 'rosario','distric ballroom', 'do not sit on','hocus pocus','event', 'baru latinbar','99 cent', 'amazon','dollar general','ultra music', '1800 lucky', 'five below', 'sweeneys', 'responsible vend', 'uptown uptown','sunshine', 'mykhael', 'daer','express drive th', 'factory town', 'crazy poke', 'amazonica','total wine','ivy palm beach','spazio','lost weekend','irish pub', 'inn','airbnb','hbo', 'economy inn','disney', 'cinema','crown','el car wash','7-eleven','cloud 95','smoke','puff n pass','space'].some(k => lowerDesc.includes(k))) 
            return findIn(expenseList, 'entretenimiento') || findIn(expenseList, 'suscrip') || '';
        if (['fpl', 'water', 'internet', 'rent', 'csc serviceworks','home', 'lease', 'comcast','laundry','t-mobile','tmobile'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'vivienda') || findIn(expenseList, 'servicios') || '';
        if (['pharmacy', 'walgreens', 'cvs', 'oscarhealth','borinquen','hospital', 'clinic', 'doctor'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'salud') || findIn(expenseList, 'medicina') || '';
        if (['gym','crunch','pf','iclub fees'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'personal care') || findIn(expenseList, 'cuidado personal') || '';
        if (['atm','banking payment','irs','vanessa salamanca'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'deudas') || findIn(expenseList, 'compromisos') || '';
        if (['amen s', 'ross','target','shein', '5guys','marshalls'].some(k => lowerDesc.includes(k)))
            return findIn(expenseList, 'clothes') || findIn(expenseList, 'ropa') || '';
        if (['school','university','course','udemy','coursera','education'].some(k => lowerDesc.includes(k)))
            return findIn(expenseList, 'educación') || findIn(expenseList, 'desarrollo') || '';
        if (['monthly maintenance fee'].some(k => lowerDesc.includes(k)))
            return findIn(expenseList, 'banco') || findIn(expenseList, 'bank') || '';
        if (['openai', 'microsoft'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'tecnología') || findIn(expenseList, 'technology') || '';
        if (['binance', 'robinhood'].some(k => lowerDesc.includes(k))) 
             return findIn(expenseList, 'inversiones') || findIn(expenseList, 'invest') || '';
        

    }
    return ''; 
  };

  // 12. MANEJO DE ARCHIVOS: HYBRID PARSER (SOLUCIÓN DEFINITIVA)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target.result;
      const lines = text.split('\n');

      // --- FASE 0: LIMPIEZA INTELIGENTE (CORREGIDA) ---
      // Verificamos las primeras 5 líneas. Si alguna tiene el formato sucio (""..."""), activamos la limpieza.
      // Esto arregla archivos donde la cabecera está limpia pero los datos sucios.
      const isDirtyFormat = lines.slice(0, 5).some(line => {
          const l = line.trim();
          return l.startsWith('"') && l.endsWith('"') && l.includes('""');
      });

      if (isDirtyFormat) {
          text = lines.map(line => {
              let l = line.trim();
              if (l.startsWith('"') && l.endsWith('"')) {
                  l = l.slice(1, -1); // Quitamos comillas externas
              }
              return l.replace(/""/g, '"'); // Convertimos "" en "
          }).join('\n');
      }

      // --- FASE 1: PARSEO ESTÁNDAR ---
      Papa.parse(text, {
        header: false,
        skipEmptyLines: 'greedy',
        // QuoteChar por defecto para manejar comas dentro de descripciones correctamente
        
        complete: (results) => {
          let rows = results.data;
          if (!rows || rows.length < 2) {
             alert("El archivo no tiene datos suficientes.");
             return;
          }

          // --- PASO 2: DETECCIÓN DE COLUMNAS ---
          let startRow = -1;
          const headerKeywords = ['date', 'fecha', 'posted', 'payee', 'desc'];
          const dateRegex = /\d{1,4}[\/\-]\d{1,2}[\/\-]\d{2,4}/;

          for (let i = 0; i < Math.min(rows.length, 20); i++) {
              const rowStr = rows[i].join(' ').toLowerCase();
              if (headerKeywords.some(k => rowStr.includes(k))) {
                  startRow = i + 1; 
                  break;
              }
              if (dateRegex.test(rows[i][0].toString().replace(/['"]/g, ''))) {
                  startRow = i;
                  break;
              }
          }

          if (startRow === -1) { alert("No encuentro fechas."); return; }

          const dataRows = rows.slice(startRow);
          const headerRow = (startRow > 0) ? rows[startRow - 1] : null;

          const colCount = dataRows[0].length;
          const dateVotes = new Array(colCount).fill(0);
          const amountVotes = new Array(colCount).fill(0);

          const sampleLimit = Math.min(dataRows.length, 50);

          for (let i = 0; i < sampleLimit; i++) {
              const row = dataRows[i];
              if (row.length < 2) continue;

              row.forEach((cell, colIndex) => {
                  if (!cell) return;
                  const val = cell.toString().trim();
                  const valClean = val.replace(/['"]/g, '');

                  // Voto Fecha
                  if (valClean.length >= 6 && dateRegex.test(valClean) && !isNaN(Date.parse(valClean))) {
                      dateVotes[colIndex]++;
                  }

                  // Voto Monto
                  let cleanMoney = valClean.replace(/[$,\s]/g, '');
                  if (cleanMoney.includes('(')) cleanMoney = '-' + cleanMoney.replace(/[()]/g, '');
                  
                  if (!isNaN(parseFloat(cleanMoney)) && /[0-9]/.test(cleanMoney) && !dateRegex.test(valClean)) {
                      const isLongID = cleanMoney.replace(/[-]/g, '').length > 11 && !cleanMoney.includes('.');
                      if (!isLongID) amountVotes[colIndex]++;
                  }
              });
          }

          const bestDateCol = dateVotes.indexOf(Math.max(...dateVotes));
          
          // --- ELECCIÓN DE COLUMNA DE DINERO ---
          let bestAmountCol = -1;
          const moneyCandidates = [];

          amountVotes.forEach((votes, index) => {
              if (index === bestDateCol) return;
              if (votes > sampleLimit * 0.2) {
                  let isBlacklisted = false;
                  let score = votes;

                  if (headerRow && headerRow[index]) {
                      const h = headerRow[index].toString().toLowerCase().replace(/['"]/g, '');
                      if (h.includes('summary') || h.includes('balance') || h.includes('saldo')) isBlacklisted = true; 
                      if (h.includes('amount') || h.includes('monto') || h.includes('debit')) score += 1000;
                  }

                  if (!isBlacklisted) moneyCandidates.push({ index, score });
              }
          });

          // ORDENAR: 1. Score alto, 2. Índice menor (Izquierda)
          moneyCandidates.sort((a, b) => {
              if (b.score > 100 && a.score < 100) return 1;
              if (a.score > 100 && b.score < 100) return -1; 
              return a.index - b.index; 
          });

          if (moneyCandidates.length > 0) bestAmountCol = moneyCandidates[0].index;
          else bestAmountCol = (bestDateCol === 0) ? 2 : 1;

          // Descripción
          let bestDescCol = -1;
          for(let i=0; i<colCount; i++) {
              if (i !== bestDateCol && i !== bestAmountCol) {
                   const sample = dataRows[1] ? dataRows[1][i] : ''; 
                   const val = sample ? sample.toString().replace(/['"]/g, '') : '';
                   if (/[a-zA-Z]/.test(val) && val.length > 2) {
                       bestDescCol = i;
                       break; 
                   }
              }
          }
          if (bestDescCol === -1) bestDescCol = (bestDateCol === 0) ? 1 : 0;

          // --- MAPEO FINAL ---
          const processed = dataRows.map((row, index) => {
              if (!row[bestAmountCol]) return null;

              const rawDate = row[bestDateCol];
              const rawDesc = row[bestDescCol];
              const rawAmount = row[bestAmountCol];

              let dateStr = rawDate ? rawDate.toString().replace(/['"]/g, '').trim() : '';
              try {
                  if (dateStr.includes('/')) {
                      const parts = dateStr.split('/');
                      if (parts.length === 3) dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                  }
              } catch(e) {}

              let amountStr = rawAmount.toString().replace(/['"]/g, '');
              if (amountStr.includes('(')) amountStr = '-' + amountStr.replace(/[()]/g, '');
              amountStr = amountStr.replace(/[^0-9.-]+/g,""); 
              const amount = parseFloat(amountStr);

              if (isNaN(amount) || amount === 0) return null;

              const desc = rawDesc ? rawDesc.toString().replace(/['"]/g, '').trim() : 'Movimiento';
              const suggestedCategory = autoCategorize(desc, amount);
              
              let isValid = false;
              if (amount > 0) isValid = incomeList.includes(suggestedCategory);
              else isValid = expenseList.includes(suggestedCategory);

              return {
                  tempId: index,
                  date: dateStr,
                  payee: desc,
                  amount: amount,
                  category: isValid ? suggestedCategory : '',
                  needsReview: !isValid
              };
          }).filter(item => item !== null);

          setPreviewData(processed);
          setIsReviewing(true);
        }
      });
    };
    reader.readAsText(file);
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
            const typeStr = isIncome ? 'income' : 'expense';
            const newTransaction = {
                date: new Date(tx.date).toISOString().split('T')[0], 
                name: tx.payee,
                description: tx.payee,
                amount: Math.abs(tx.amount), 
                category: tx.category,
                walletId: targetWalletId,
            };
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

  return (
    <div className="w-full">
      {!isReviewing ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 bg-slate-50 dark:bg-slate-800/50 transition-colors">
           <div className="mb-4 p-4 bg-emerald-100 rounded-full text-emerald-600 animate-bounce">
             <UploadCloud size={40} />
           </div>
           <p className="text-slate-600 dark:text-slate-300 font-bold mb-2">Sube tu CSV del Banco</p>
           <input type="file" accept=".csv" onChange={handleFileUpload} 
             className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
           />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">Destino de los fondos</h3>
                <button onClick={handleClearAll} className="text-rose-500 p-2 hover:bg-rose-100 rounded-lg transition-colors" title="Borrar todo"><Trash2 size={18}/></button>
             </div>
             <div className="flex items-center gap-2">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400"><Wallet size={20} /></div>
                <select value={targetWalletId} onChange={(e) => setTargetWalletId(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                    <option value="">-- Selecciona Billetera --</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (${w.balance})</option>)}
                </select>
             </div>
          </div>
          
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
                  const isIncome = tx.amount > 0;
                  const categoriesToShow = isIncome ? incomeList : expenseList;
                  return (
                    <tr key={idx} className={`transition-colors ${tx.needsReview ? "bg-rose-50 dark:bg-rose-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                      <td className="px-3 py-3 max-w-[150px]">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={tx.payee}>{tx.payee}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{tx.date}</div>
                      </td>
                      <td className={`px-3 py-3 text-xs font-black text-right ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isIncome ? '+' : ''}{tx.amount}
                      </td>
                      <td className="px-3 py-2">
                        <select value={tx.category} onChange={(e) => updateCategory(idx, e.target.value)}
                          className={`block w-full rounded-lg text-xs border-0 py-2 px-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 dark:bg-slate-800 dark:text-white transition-all cursor-pointer ${
                            tx.needsReview ? "text-rose-600 ring-rose-300 focus:ring-rose-500 bg-white font-bold" : "text-slate-700 ring-slate-200 dark:ring-slate-700 focus:ring-emerald-500"
                          }`}
                        >
                          <option value="" disabled>Seleccionar...</option>
                          {categoriesToShow.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button onClick={handleSaveToSupabase} disabled={!targetWalletId}
            className={`w-full py-4 rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                !targetWalletId ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800' : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99]'
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