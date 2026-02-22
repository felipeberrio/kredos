import { describe, it, expect } from 'vitest';
import {
  getTotalExpenses,
  getTotalIncomes,
  getMonthlyBalance,
  calculateWorkHours,
  calculateWorkTotal,
  getWalletNetFlow,
  getBudgetProgress,
  baseFilter,
} from './financialCalculations';

describe('financialCalculations - Unit Tests', () => {
  describe('getTotalExpenses', () => {
    it('devuelve 0 para lista vacía', () => {
      expect(getTotalExpenses([])).toBe(0);
    });

    it('suma correctamente los gastos', () => {
      const expenses = [
        { id: '1', amount: 50 },
        { id: '2', amount: 100 },
        { id: '3', amount: 25.5 },
      ];
      expect(getTotalExpenses(expenses)).toBe(175.5);
    });

    it('maneja amount como string', () => {
      const expenses = [
        { id: '1', amount: '100' },
        { id: '2', amount: '50' },
      ];
      expect(getTotalExpenses(expenses)).toBe(150);
    });

    it('ignora amounts null/undefined como 0', () => {
      const expenses = [
        { id: '1', amount: 100 },
        { id: '2', amount: null },
      ];
      expect(getTotalExpenses(expenses)).toBe(100);
    });
  });

  describe('getTotalIncomes', () => {
    it('devuelve 0 para lista vacía', () => {
      expect(getTotalIncomes([])).toBe(0);
    });

    it('suma correctamente los ingresos', () => {
      const incomes = [
        { id: '1', amount: 1000 },
        { id: '2', amount: 500 },
      ];
      expect(getTotalIncomes(incomes)).toBe(1500);
    });
  });

  describe('getMonthlyBalance', () => {
    it('calcula balance = ingresos - gastos correctamente', () => {
      const incomes = [{ amount: 2000 }, { amount: 500 }];
      const expenses = [{ amount: 800 }, { amount: 200 }];
      expect(getMonthlyBalance(incomes, expenses)).toBe(1500);
    });

    it('devuelve negativo cuando gastos > ingresos', () => {
      const incomes = [{ amount: 500 }];
      const expenses = [{ amount: 1000 }];
      expect(getMonthlyBalance(incomes, expenses)).toBe(-500);
    });

    it('devuelve 0 cuando ambos están vacíos', () => {
      expect(getMonthlyBalance([], [])).toBe(0);
    });
  });

  describe('calculateWorkHours', () => {
    it('calcula horas correctamente en el mismo día', () => {
      const result = calculateWorkHours('09:00', '17:00');
      expect(result.hours).toBe(8);
      expect(result.total).toBe(8);
    });

    it('calcula horas con minutos fraccionarios', () => {
      const result = calculateWorkHours('09:00', '12:30');
      expect(result.hours).toBe(3.5);
      expect(result.total).toBe(3.5);
    });

    it('calcula turno nocturno que cruza medianoche', () => {
      const result = calculateWorkHours('22:00', '02:00');
      expect(result.hours).toBe(4);
      expect(result.total).toBe(4);
    });

    it('devuelve 0 cuando faltan parámetros', () => {
      expect(calculateWorkHours('', '17:00')).toEqual({ hours: 0, total: 0 });
      expect(calculateWorkHours('09:00', '')).toEqual({ hours: 0, total: 0 });
      expect(calculateWorkHours(null, null)).toEqual({ hours: 0, total: 0 });
    });

    it('1 hora exacta', () => {
      const result = calculateWorkHours('10:00', '11:00');
      expect(result.hours).toBe(1);
    });

    it('8.5 horas con 30 min', () => {
      const result = calculateWorkHours('08:00', '16:30');
      expect(result.hours).toBe(8.5);
    });
  });

  describe('calculateWorkTotal', () => {
    it('multiplica horas por tarifa correctamente', () => {
      expect(calculateWorkTotal('09:00', '17:00', 15)).toBe(120); // 8h * 15
    });

    it('con tarifa decimal', () => {
      expect(calculateWorkTotal('10:00', '12:00', 25.5)).toBe(51); // 2 * 25.5
    });
  });

  describe('getWalletNetFlow', () => {
    it('calcula flujo neto por wallet', () => {
      const incomes = [{ walletId: 'w1', amount: 500 }, { walletId: 'w2', amount: 200 }];
      const expenses = [{ walletId: 'w1', amount: 100 }, { walletId: 'w1', amount: 50 }];
      expect(getWalletNetFlow(incomes, expenses, 'w1')).toBe(350); // 500 - 150
    });

    it('devuelve 0 para wallet sin transacciones', () => {
      const incomes = [{ walletId: 'w1', amount: 100 }];
      const expenses = [{ walletId: 'w1', amount: 100 }];
      expect(getWalletNetFlow(incomes, expenses, 'w99')).toBe(0);
    });
  });

  describe('getBudgetProgress', () => {
    it('suma gastos de categoría en el mes', () => {
      const expenses = [
        { category: 'Comida', date: '2025-02-15', amount: 50 },
        { category: 'Comida', date: '2025-02-20', amount: 30 },
        { category: 'Transporte', date: '2025-02-10', amount: 40 },
      ];
      expect(getBudgetProgress(expenses, 'Comida', '2025-02')).toBe(80);
    });

    it('ignora gastos de otros meses', () => {
      const expenses = [
        { category: 'Comida', date: '2025-01-15', amount: 100 },
        { category: 'Comida', date: '2025-02-15', amount: 50 },
      ];
      expect(getBudgetProgress(expenses, 'Comida', '2025-02')).toBe(50);
    });
  });

  describe('baseFilter', () => {
    it('modo month filtra por mes', () => {
      const filter = baseFilter({ mode: 'month', value: '2025-02' }, null);
      expect(filter({ date: '2025-02-15' })).toBe(true);
      expect(filter({ date: '2025-01-15' })).toBe(false);
      expect(filter({ date: '2025-03-01' })).toBe(false);
    });

    it('modo year filtra por año', () => {
      const filter = baseFilter({ mode: 'year', value: '2025' }, null);
      expect(filter({ date: '2025-02-15' })).toBe(true);
      expect(filter({ date: '2024-12-31' })).toBe(false);
    });

    it('modo all permite todo', () => {
      const filter = baseFilter({ mode: 'all' }, null);
      expect(filter({ date: '2020-01-01' })).toBe(true);
    });

    it('filtra por walletId cuando se especifica', () => {
      const filter = baseFilter({ mode: 'all' }, 'w1');
      expect(filter({ date: '2025-02-15', walletId: 'w1' })).toBe(true);
      expect(filter({ date: '2025-02-15', walletId: 'w2' })).toBe(false);
    });
  });
});
