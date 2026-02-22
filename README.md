# 💰 FinPlan PRO v2

Aplicación web de gestión financiera personal, construida con arquitectura modular y diseño moderno.

## 🛠 Tecnologías Utilizadas
* **Core:** React JS (Vite)
* **Estilos:** Tailwind CSS
* **Iconos:** Lucide React
* **Gráficos:** Recharts
* **Persistencia:** LocalStorage + Supabase
* **Testing:** Vitest + React Testing Library

## 🚀 Instalación y Ejecución

Si descargas este proyecto por primera vez:

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```
3.  **Construir para producción:**
    ```bash
    npm run build
    ```

## 🧪 Pruebas (Testing)

### Comandos de test

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta tests en modo watch (se re-ejecutan al guardar cambios) |
| `npm run test:run` | Ejecuta la suite completa una sola vez |
| `npm run test:coverage` | Ejecuta tests y genera reporte de cobertura |

### Ver el reporte de cobertura

1. Ejecuta:
   ```bash
   npm run test:coverage
   ```
2. Abre el reporte HTML generado en `coverage/index.html` con tu navegador:
   ```bash
   # En Windows
   start coverage/index.html

   # En macOS/Linux
   open coverage/index.html
   ```

### Estructura de tests

- **Unit Tests:** `src/utils/financialCalculations.test.js` — Lógica de cálculo (totales, balance, horas de trabajo)
- **Integration Tests:**
  - `src/components/TransactionForm.test.jsx` — Formulario de gastos/ingresos
  - `src/layout/WorkSection.test.jsx` — Calendario de turnos

Los tests usan mocks de Supabase, por lo que **no requieren conexión a internet**.

## ✅ Funcionalidades Implementadas
1.  **Dashboard Principal:**
    * Visualización de Patrimonio Neto Total en tiempo real.
    * Soporte para Modo Oscuro/Claro (Dark Mode).
    * Modo Privacidad (Ocultar saldos con blur).

2.  **Gestión de Cuentas (Wallets):**
    * Creación de múltiples cuentas (Efectivo, Banco, etc.).
    * Cálculo automático de saldos basado en transacciones.

3.  **Transacciones:**
    * Registro rápido de Ingresos y Gastos.
    * Asignación a cuentas específicas.
    * Historial reciente con opción de eliminación.

4.  **Herramientas Financieras:**
    * **Metas de Ahorro:** Barra de progreso visual.
    * **Suscripciones:** Control de gastos fijos mensuales y proyección anual.
    * **Gráficos:** Distribución de gastos (Dona) y tendencias (Área).

## 🚧 Pendiente / Roadmap
* 
---
**Desarrollado con ❤️ para control total de tus finanzas.**
