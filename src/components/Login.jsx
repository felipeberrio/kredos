import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
import { Loader2, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { signIn, signUp } = useAuth();
  const { darkMode } = useFinancial();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        alert('¡Registro exitoso! Por favor inicia sesión.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-premium overflow-hidden border transition-all ${darkMode ? 'border-slate-800 shadow-premium-dark' : 'border-slate-200/80'}`}>
        {/* Header */}
        <div className="relative bg-slate-900 px-8 py-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -ml-12 -mb-12" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight relative z-10">
            FINPLAN<span className="text-blue-400">PRO</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-3 relative z-10">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <div className={`p-6 sm:p-8 transition-colors ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" size={20} strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl font-medium placeholder:text-slate-400 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${darkMode ? 'text-slate-100 bg-slate-800' : 'text-slate-800 bg-slate-50'}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" size={20} strokeWidth={2} />
              <input
                type="email"
                placeholder="Correo electrónico"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl font-medium placeholder:text-slate-400 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${darkMode ? 'text-slate-100 bg-slate-800' : 'text-slate-800 bg-slate-50'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" size={20} strokeWidth={2} />
              <input
                type="password"
                placeholder="Contraseña"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl font-medium placeholder:text-slate-400 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${darkMode ? 'text-slate-100 bg-slate-800' : 'text-slate-800 bg-slate-50'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className={`text-sm font-medium p-3 rounded-xl text-center animate-in fade-in duration-200 ${darkMode ? 'text-rose-400 bg-rose-900/20' : 'text-rose-600 bg-rose-50'}`}>
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${darkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
              {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-200"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
