import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkSection } from './WorkSection';

const mockWorkLogs = [
  {
    id: '1',
    companyId: 'c1',
    companyName: 'Restaurante A',
    workDate: '2025-02-15',
    startTime: '09:00',
    endTime: '17:00',
    total: 120,
    hours: 8,
    status: 'pending',
    location: 'Sede Norte',
    paymentDate: '2025-02-20',
  },
  {
    id: '2',
    companyId: 'c1',
    companyName: 'Restaurante A',
    workDate: '2025-02-18',
    startTime: '10:00',
    endTime: '14:00',
    total: 60,
    hours: 4,
    status: 'pending',
    location: 'Sede Sur',
  },
];

const mockCompanies = [
  { id: 'c1', name: 'Restaurante A', rate: 15, type: 'part-time', frequency: 'weekly' },
];

vi.mock('../context/FinancialContext', () => ({
  useFinancial: () => ({
    workLogs: mockWorkLogs,
    companies: mockCompanies,
    wallets: [{ id: 'w1', name: 'Efectivo', balance: 0 }],
    themeColor: '#3b82f6',
    darkMode: false,
    isAllExpanded: true,
    markWorkAsPaid: vi.fn(),
    unmarkWorkAsPaid: vi.fn(),
    deleteWorkLog: vi.fn(),
    deleteCompany: vi.fn(),
    payWorkLogs: vi.fn(),
    calculatePayDate: vi.fn((workDate) => workDate),
  }),
}));

const defaultProps = {
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  isFirst: true,
  isLast: true,
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onAddCompany: vi.fn(),
  onEditCompany: vi.fn(),
};

describe('WorkSection - Integration Tests', () => {
  it('renderiza la sección de Gestión Trabajo', () => {
    render(<WorkSection {...defaultProps} />);
    expect(screen.getByText(/Gestión Trabajo/i)).toBeInTheDocument();
  });

  it('renderiza los días de la semana en vista calendario', async () => {
    render(<WorkSection {...defaultProps} />);
    // Cambiar a vista calendario (está en tab "logs" por defecto)
    const calendarBtn = screen.getByRole('button', { name: /vista calendario/i });
    await userEvent.click(calendarBtn);

    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Mié')).toBeInTheDocument();
    expect(screen.getByText('Jue')).toBeInTheDocument();
    expect(screen.getByText('Vie')).toBeInTheDocument();
    expect(screen.getByText('Sáb')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('renderiza los turnos en vista lista', () => {
    render(<WorkSection {...defaultProps} />);
    // Por defecto viewType es 'list' - hay 2 turnos de Restaurante A
    const items = screen.getAllByText('Restaurante A');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra los totales (Ganado, Proyectado, Total)', () => {
    render(<WorkSection {...defaultProps} />);
    expect(screen.getByText(/Ganado/i)).toBeInTheDocument();
    expect(screen.getByText(/Proyectado/i)).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });

  it('renderiza pestañas Turnos, Pagos, Empresas', () => {
    render(<WorkSection {...defaultProps} />);
    expect(screen.getByText(/Turnos/i)).toBeInTheDocument();
    expect(screen.getByText(/Pagos/i)).toBeInTheDocument();
    expect(screen.getByText(/Empresas/i)).toBeInTheDocument();
  });
});
