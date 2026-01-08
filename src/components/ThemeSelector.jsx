import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Palette } from 'lucide-react';

export const ThemeSelector = () => {
  const { themeColor, setThemeColor, availableThemes, darkMode } = useFinancial();

  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="hidden md:block pl-2 pr-1">
        <Palette size={16} className="text-slate-400" />
      </div>
      <div className="flex gap-1">
        {availableThemes.map((color) => (
          <button
            key={color}
            onClick={() => setThemeColor(color)}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${themeColor === color ? 'border-slate-600 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};