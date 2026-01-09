import React, { useRef } from 'react';
import { Palette, Shuffle, Check } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const ThemeSelector = () => {
  const { themeColor, setThemeColor, darkMode } = useFinancial();
  const colorInputRef = useRef(null);

  // Colores predefinidos (Presets)
  const presets = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4'];

  // Generador de Color Elegante Random
  const setRandomElegantColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * (80 - 60) + 60); // 60-80%
    const lightness = Math.floor(Math.random() * (60 - 45) + 45);  // 45-60%
    setThemeColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  };

  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-colors ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      
      {/* 1. Botón Random (Varita Mágica) */}
      <button 
        onClick={setRandomElegantColor}
        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
        title="Color Sorpresa"
      >
        <Shuffle size={16} />
      </button>

      {/* 2. Lista de Presets */}
      <div className="flex gap-1.5 mx-1">
        {presets.map(color => (
          <button
            key={color}
            onClick={() => setThemeColor(color)}
            className={`w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${themeColor === color ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}`}
            style={{ backgroundColor: color, outlineColor: color }}
          >
            {themeColor === color && <Check size={10} className="text-white" strokeWidth={4} />}
          </button>
        ))}
      </div>

      {/* 3. Separador */}
      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      {/* 4. Picker Personalizado (Input oculto) */}
      <div className="relative group">
        <input 
            ref={colorInputRef}
            type="color" 
            value={themeColor} // Fallback si es hex
            onChange={(e) => setThemeColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <button 
            className={`p-1.5 rounded-xl transition-all flex items-center gap-2 ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}
            title="Paleta Personalizada"
        >
            <Palette size={18} style={{ color: themeColor }} />
        </button>
      </div>

    </div>
  );
};