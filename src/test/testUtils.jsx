import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { FinancialProvider } from '../context/FinancialContext';

/**
 * Renderiza un componente envuelto en los providers necesarios.
 */
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <AuthProvider>
        <FinancialProvider>
          {children}
        </FinancialProvider>
      </AuthProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
