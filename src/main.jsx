import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { FinancialProvider } from './context/FinancialContext'
import './index.css'
import { AuthProvider } from './context/AuthContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <FinancialProvider>
      <App />
    </FinancialProvider>
    </AuthProvider>
  </React.StrictMode>,
)