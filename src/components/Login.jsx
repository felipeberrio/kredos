import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login y Registro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Formulario
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
        setIsLogin(true); // Cambiar a login después de registro exitoso
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Decorativo */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
            
            <h1 className="text-3xl font-black text-white tracking-tight relative z-10">
                NPLAN<span className="text-blue-500">PRO</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 relative z-10">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
            </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Nombre (Solo en registro) */}
                {!isLogin && (
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                        <input 
                            type="text" 
                            placeholder="Nombre Completo" 
                            className="w-full pl-10 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none border border-transparent focus:bg-white focus:border-blue-500 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}

                {/* Email */}
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                    <input 
                        type="email" 
                        placeholder="Correo Electrónico" 
                        className="w-full pl-10 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none border border-transparent focus:bg-white focus:border-blue-500 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Contraseña */}
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        className="w-full pl-10 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none border border-transparent focus:bg-white focus:border-blue-500 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-lg text-center animate-in fade-in">
                        {error}
                    </div>
                )}

                {/* Botón Acción */}
                <button 
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin"/> : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    {!loading && <ArrowRight size={18}/>}
                </button>
            </form>

            {/* Toggle Login/Registro */}
            <div className="mt-6 text-center">
                <p className="text-xs font-bold text-slate-400">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="ml-2 text-blue-500 hover:underline"
                    >
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};