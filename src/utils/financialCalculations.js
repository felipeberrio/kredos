/**
 * Funciones puras de cálculo financiero.
 * Extraídas para facilitar testing unitario y reutilización.
 */

/**
 * Filtra transacciones según el dateFilter.
 * @param {Object} dateFilter - { mode, value, from, to }
 * @param {Object} t - transacción con propiedad date
 * @returns {boolean}
 */
export const baseFilter = (dateFilter, selectedWalletId) => (t) => {
  if (selectedWalletId && t.walletId !== selectedWalletId) return false;
  if (dateFilter.mode === 'all') return true;
  if (dateFilter.mode === 'month') return t.date.startsWith(dateFilter.value);
  if (dateFilter.mode === 'year') return t.date.startsWith(dateFilter.value.substring(0, 4));
  if (dateFilter.mode === 'custom') {
    if (dateFilter.from && t.date < dateFilter.from) return false;
    if (dateFilter.to && t.date > dateFilter.to) return false;
    return true;
  }
  return true;
};

/**
 * Calcula el total de gastos para una lista filtrada.
 * @param {Array} expenses - Array de gastos con amount
 * @returns {number}
 */
export const getTotalExpenses = (expenses) => {
  return expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
};

/**
 * Calcula el total de ingresos para una lista filtrada.
 * @param {Array} incomes - Array de ingresos con amount
 * @returns {number}
 */
export const getTotalIncomes = (incomes) => {
  return incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
};

/**
 * Calcula el balance mensual (ingresos - gastos) para listas filtradas.
 * @param {Array} incomes - Ingresos filtrados
 * @param {Array} expenses - Gastos filtrados
 * @returns {number}
 */
export const getMonthlyBalance = (incomes, expenses) => {
  const totalIncome = getTotalIncomes(incomes);
  const totalExpense = getTotalExpenses(expenses);
  return totalIncome - totalExpense;
};

/**
 * Calcula horas trabajadas entre hora inicio y fin.
 * Maneja turnos que cruzan medianoche (ej: 22:00 - 02:00 = 4h).
 * @param {string} startTime - "HH:mm"
 * @param {string} endTime - "HH:mm"
 * @returns {{ hours: number, total: number }} horas y total (para multiplicar por tarifa)
 */
export const calculateWorkHours = (startTime, endTime) => {
  if (!startTime || !endTime) return { hours: 0, total: 0 };
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
  if (diff < 0) diff += 24;
  return { hours: parseFloat(diff.toFixed(2)), total: diff };
};

/**
 * Calcula el total de un turno (horas * tarifa).
 * @param {string} startTime
 * @param {string} endTime
 * @param {number} rate - Tarifa por hora
 * @returns {number}
 */
export const calculateWorkTotal = (startTime, endTime, rate) => {
  const { total } = calculateWorkHours(startTime, endTime);
  return total * Number(rate);
};

/**
 * Flujo neto de una wallet (ingresos - gastos).
 * @param {Array} incomes
 * @param {Array} expenses
 * @param {string} walletId
 * @returns {number}
 */
export const getWalletNetFlow = (incomes, expenses, walletId) => {
  const totalIncome = incomes
    .filter((t) => t.walletId === walletId)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpense = expenses
    .filter((t) => t.walletId === walletId)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  return totalIncome - totalExpense;
};

/**
 * Progreso de presupuesto por categoría en el mes actual.
 * @param {Array} expenses
 * @param {string} category
 * @param {string} currentMonthStr - "YYYY-MM"
 * @returns {number}
 */
export const getBudgetProgress = (expenses, category, currentMonthStr) => {
  return expenses
    .filter((e) => e.category === category && e.date.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
};
