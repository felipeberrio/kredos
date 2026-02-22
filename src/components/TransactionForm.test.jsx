import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from './TransactionForm';

// Mock del contexto financiero
const mockAddTransaction = vi.fn();
const mockWallets = [
  { id: 'w1', name: 'Efectivo', type: 'cash', balance: 100 },
  { id: 'w2', name: 'Banco', type: 'debit', balance: 500 },
];
const mockCategories = ['Comida', 'Transporte', 'Vivienda'];
const mockIncomeCategories = ['Salario', 'Extra'];

vi.mock('../context/FinancialContext', () => ({
  useFinancial: () => ({
    addTransaction: mockAddTransaction,
    addIncome: vi.fn(),
    addExpense: vi.fn(),
    updateIncome: vi.fn(),
    updateExpense: vi.fn(),
    updateTransaction: vi.fn(),
    wallets: mockWallets,
    categories: mockCategories,
    incomeCategories: mockIncomeCategories,
    themeColor: '#3b82f6',
    darkMode: false,
    filteredIncomes: [],
    filteredExpenses: [],
    privacyMode: false,
    useSemanticColors: true,
  }),
}));

describe('TransactionForm - Integration Tests', () => {
  beforeEach(() => {
    mockAddTransaction.mockClear();
  });

  it('muestra botones de Ingreso y Gasto inicialmente', () => {
    render(<TransactionForm editingItem={null} setEditingItem={vi.fn()} />);
    expect(screen.getByText(/INGRESO/)).toBeInTheDocument();
    expect(screen.getByText(/GASTO/)).toBeInTheDocument();
  });

  it('al hacer clic en GASTO muestra el formulario', async () => {
    render(<TransactionForm editingItem={null} setEditingItem={vi.fn()} />);
    const gastoBtn = screen.getByText(/GASTO/);
    await userEvent.click(gastoBtn);
    expect(screen.getByPlaceholderText(/Concepto/)).toBeInTheDocument();
  });

  it('al enviar Nuevo Gasto llama a addTransaction con los datos correctos', async () => {
    const user = userEvent.setup();
    render(<TransactionForm editingItem={null} setEditingItem={vi.fn()} />);

    // Abrir formulario de gasto
    await user.click(screen.getByText(/GASTO/));

    // Llenar campos
    const conceptInput = screen.getByPlaceholderText(/Concepto/);
    await user.type(conceptInput, 'Uber');

    const amountInput = screen.getByPlaceholderText(/0\.00/);
    await user.type(amountInput, '15.50');

    // Asegurar que hay wallet seleccionada (por defecto wallets[0])
    const form = screen.getByPlaceholderText(/Concepto/).closest('form');
    expect(form).toBeInTheDocument();

    // Enviar
    const submitBtn = screen.getByRole('button', { name: /Guardar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith('expense', expect.objectContaining({
        name: 'Uber',
        amount: 15.5,
        type: 'expense',
      }));
    });
  });

  it('no envía si falta monto y muestra alerta', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<TransactionForm editingItem={null} setEditingItem={vi.fn()} />);

    await user.click(screen.getByText(/GASTO/));
    await user.type(screen.getByPlaceholderText(/Concepto/), 'Test');
    // No llenamos monto
    await user.click(screen.getByRole('button', { name: /Guardar/i }));

    expect(mockAddTransaction).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Por favor completa el monto, item y cuenta.');
    alertSpy.mockRestore();
  });
});
