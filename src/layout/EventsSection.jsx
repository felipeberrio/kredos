import React, { useState, useEffect } from 'react';
import { Plane, Calendar, MapPin, Plus, Trash2, CheckSquare, Square, X, ChevronUp, ChevronDown, Minus, Maximize2, PartyPopper, Tent, Film, Utensils, Music, Heart, ShoppingBag, Car, Ticket } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

// --- CONFIGURACIÓN DE TIPOS Y GASTOS SUGERIDOS ---
const EVENT_TYPES = {
    trip: { label: 'Viaje', icon: <Plane size={14}/>, presets: [
        { name: 'Vuelos / Transporte', cost: 300 },
        { name: 'Hospedaje (Airbnb/Hotel)', cost: 400 },
        { name: 'Comidas Diarias', cost: 200 },
        { name: 'Souvenirs', cost: 50 },
        { name: 'Seguro Viaje', cost: 40 }
    ]},
    festival: { label: 'Festival Música', icon: <Tent size={14}/>, presets: [
        { name: 'Ticket Entrada (Tier 1)', cost: 350 },
        { name: 'Bebidas/Alcohol', cost: 150 },
        { name: 'Outfit / Ropa', cost: 100 },
        { name: 'Transporte al sitio', cost: 60 },
        { name: 'Lockers', cost: 25 }
    ]},
    party: { label: 'Fiesta / Rumba', icon: <PartyPopper size={14}/>, presets: [
        { name: 'Cover / Entrada', cost: 30 },
        { name: 'Botella / Tragos', cost: 80 },
        { name: 'Uber Ida/Vuelta', cost: 40 },
        { name: 'After Party', cost: 50 }
    ]},
    dinner: { label: 'Cena Especial', icon: <Utensils size={14}/>, presets: [
        { name: 'Platos Fuertes', cost: 80 },
        { name: 'Botella Vino', cost: 60 },
        { name: 'Postre', cost: 25 },
        { name: 'Propina (18-20%)', cost: 35 },
        { name: 'Valet Parking', cost: 15 }
    ]},
    picnic: { label: 'Picnic / Parque', icon: <Heart size={14}/>, presets: [
        { name: 'Quesos y Carnes frías', cost: 45 },
        { name: 'Vino / Sangría', cost: 30 },
        { name: 'Frutas y Snacks', cost: 25 },
        { name: 'Desechables Eco', cost: 10 }
    ]},
    cinema: { label: 'Cine / Teatro', icon: <Film size={14}/>, presets: [
        { name: 'Entradas VIP', cost: 45 },
        { name: 'Combo Palomitas', cost: 30 },
        { name: 'Dulces Extra', cost: 15 },
        { name: 'Parking', cost: 10 }
    ]},
    concert: { label: 'Concierto', icon: <Music size={14}/>, presets: [
        { name: 'Boleta General', cost: 180 },
        { name: 'Merch (Camiseta)', cost: 45 },
        { name: 'Cervezas', cost: 40 },
        { name: 'Transporte', cost: 30 }
    ]},
    date: { label: 'Cita Romántica', icon: <Heart size={14}/>, presets: [
        { name: 'Actividad (Bowling/Minigolf)', cost: 60 },
        { name: 'Cena Ligera', cost: 50 },
        { name: 'Helados/Café', cost: 20 },
        { name: 'Uber', cost: 30 }
    ]},
    shopping: { label: 'Día de Compras', icon: <ShoppingBag size={14}/>, presets: [
        { name: 'Ropa Nueva', cost: 200 },
        { name: 'Zapatos', cost: 120 },
        { name: 'Accesorios', cost: 60 },
        { name: 'Almuerzo Mall', cost: 25 }
    ]},
    roadtrip: { label: 'Road Trip', icon: <Car size={14}/>, presets: [
        { name: 'Gasolina', cost: 120 },
        { name: 'Peajes', cost: 40 },
        { name: 'Snacks Carretera', cost: 35 },
        { name: 'Motel/Hospedaje Paso', cost: 90 }
    ]},
    birthday: { label: 'Cumpleaños (Regalo)', icon: <PartyPopper size={14}/>, presets: [
        { name: 'Regalo Principal', cost: 100 },
        { name: 'Torta / Pastel', cost: 40 },
        { name: 'Decoración', cost: 30 },
        { name: 'Aporte Vaca', cost: 50 }
    ]},
    wedding: { label: 'Boda (Invitado)', icon: <Ticket size={14}/>, presets: [
        { name: 'Lluvia de Sobres', cost: 150 },
        { name: 'Traje / Vestido', cost: 200 },
        { name: 'Peluquería/Barbería', cost: 50 },
        { name: 'Hotel (Si es fuera)', cost: 150 }
    ]},
    beach: { label: 'Día de Playa', icon: <Plane size={14}/>, presets: [
        { name: 'Alquiler Carpa', cost: 40 },
        { name: 'Cervezas/Cocteles', cost: 60 },
        { name: 'Almuerzo Pescado', cost: 50 },
        { name: 'Bloqueador', cost: 15 }
    ]}
};

export const EventsSection = ({ onMoveUp, onMoveDown, isFirst, isLast }) => {
  const { events, addEvent, updateEvent, deleteEvent, themeColor, darkMode, isAllExpanded } = useFinancial();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Estado para nuevo evento / edición
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ name: '', date: '', location: '', type: 'trip', items: [] });
  
  // Inputs para agregar items manuales
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  // Sincronizar con botón global
  useEffect(() => { setIsExpanded(isAllExpanded); }, [isAllExpanded]);

  // Manejo de Items del Checklist
  const handleAddItem = () => {
      if (!newItemName) return;
      const newItem = { id: Date.now(), name: newItemName, cost: Number(newItemCost) || 0, checked: false };
      setCurrentEvent({ ...currentEvent, items: [...currentEvent.items, newItem] });
      setNewItemName(''); setNewItemCost('');
  };

  const handleAddPreset = (preset) => {
      const newItem = { id: Date.now() + Math.random(), name: preset.name, cost: preset.cost, checked: false };
      setCurrentEvent(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (itemId) => {
      setCurrentEvent({ ...currentEvent, items: currentEvent.items.filter(i => i.id !== itemId) });
  };

  const handleToggleItem = (itemId) => {
      const updatedItems = currentEvent.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
      setCurrentEvent({ ...currentEvent, items: updatedItems });
  };

  // NUEVO: Función para editar en línea nombre y costo
  const handleUpdateItem = (id, field, value) => {
      const updatedItems = currentEvent.items.map(i => {
          if (i.id === id) {
              return { ...i, [field]: field === 'cost' ? Number(value) : value };
          }
          return i;
      });
      setCurrentEvent({ ...currentEvent, items: updatedItems });
  };

  const handleSaveEvent = () => {
      if (!currentEvent.name || !currentEvent.date) return;
      if (currentEvent.id) updateEvent(currentEvent);
      else addEvent(currentEvent);
      setIsEditing(false);
      setCurrentEvent({ name: '', date: '', location: '', type: 'trip', items: [] });
  };

  const openEdit = (evt) => {
      setCurrentEvent(evt);
      setIsEditing(true);
  };

  // CÁLCULO MEJORADO: Excluir items marcados (checked)
  const calculateTotal = (items) => {
      return items
        .filter(item => !item.checked) // Filtra los que NO están checkeados
        .reduce((acc, item) => acc + Number(item.cost), 0);
  };

  return (
    <Card className={`overflow-hidden flex flex-col transition-all duration-500 ${isExpanded ? 'h-full min-h-[300px]' : 'h-auto'}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Plane size={14} style={{ color: themeColor }}/> Planeación Viajes & Eventos
            </h3>
        </div>
        <div className="flex items-center gap-1">
            <div className="flex flex-col mr-1">
                {!isFirst && <button onClick={onMoveUp} className="text-slate-300 hover:text-slate-500"><ChevronUp size={10} strokeWidth={3}/></button>}
                {!isLast && <button onClick={onMoveDown} className="text-slate-300 hover:text-slate-500"><ChevronDown size={10} strokeWidth={3}/></button>}
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* MODO EDICIÓN / NUEVO */}
            {isEditing ? (
                <div className="flex-1 flex flex-col gap-3 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center border-b pb-2 dark:border-slate-700">
                        <span className="text-xs font-black uppercase dark:text-white">
                            {currentEvent.id ? 'Editar Evento' : 'Nuevo Evento'}
                        </span>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-rose-500"><X size={16}/></button>
                    </div>
                    
                    {/* Campos Principales */}
                    <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Nombre Evento" value={currentEvent.name} onChange={e => setCurrentEvent({...currentEvent, name: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                        <input type="date" value={currentEvent.date} onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                         <input placeholder="Ubicación (Opcional)" value={currentEvent.location} onChange={e => setCurrentEvent({...currentEvent, location: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                         <select value={currentEvent.type} onChange={e => setCurrentEvent({...currentEvent, type: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                             {Object.entries(EVENT_TYPES).map(([key, data]) => (
                                 <option key={key} value={key}>{data.label}</option>
                             ))}
                         </select>
                    </div>

                    {/* SUGERENCIAS RÁPIDAS */}
                    <div className="mb-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Sugerencias Rápidas</span>
                        <div className="flex flex-wrap gap-2">
                            {EVENT_TYPES[currentEvent.type]?.presets.map((preset, idx) => (
                                <button key={idx} onClick={() => handleAddPreset(preset)} className={`px-2 py-1 rounded-md text-[10px] border flex items-center gap-1 hover:scale-105 transition-transform ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                                    <Plus size={8} /> {preset.name} <span className="font-bold text-rose-500">${preset.cost}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CHECKLIST INTERACTIVO */}
                    <div className={`flex-1 rounded-xl p-3 border flex flex-col min-h-[150px] ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        {/* Input Nuevo Item */}
                        <div className="flex gap-2 mb-2">
                            <input placeholder="Item personalizado..." value={newItemName} onChange={e => setNewItemName(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                            <input type="number" placeholder="$" value={newItemCost} onChange={e => setNewItemCost(e.target.value)} className={`w-20 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                            <button onClick={handleAddItem} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Plus size={14}/></button>
                        </div>
                        
                        {/* Lista de Items Editables */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                            {currentEvent.items.length === 0 && <p className="text-center text-[10px] text-slate-400 italic mt-4">Lista vacía</p>}
                            
                            {currentEvent.items.map(item => (
                                <div key={item.id} className={`flex justify-between items-center p-1 px-2 rounded-lg group ${darkMode ? 'bg-slate-900' : 'bg-white shadow-sm'}`}>
                                    <div className="flex items-center gap-2 flex-1">
                                        <button onClick={() => handleToggleItem(item.id)} className={item.checked ? 'text-emerald-500' : 'text-slate-300'}>
                                            {item.checked ? <CheckSquare size={14}/> : <Square size={14}/>}
                                        </button>
                                        
                                        {/* Input Nombre Editable */}
                                        <input 
                                            value={item.name} 
                                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                            className={`text-xs bg-transparent border-none outline-none w-full ${item.checked ? 'line-through text-slate-500' : (darkMode ? 'text-slate-200' : 'text-slate-700')}`}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                                        {/* Input Costo Editable */}
                                        <input 
                                            type="number"
                                            value={item.cost}
                                            onChange={(e) => handleUpdateItem(item.id, 'cost', e.target.value)}
                                            className={`text-xs font-bold bg-transparent border-none outline-none w-16 text-right ${item.checked ? 'line-through text-slate-500' : (darkMode ? 'text-white' : 'text-slate-800')}`}
                                        />
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 ml-1"><Trash2 size={12}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Footer Total */}
                        <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs font-bold">
                            <span className="uppercase text-slate-400">Total Pendiente:</span>
                            {/* Color Rojo/Rosa para indicar gasto */}
                            <span className="text-rose-500 text-sm">{formatCurrency(calculateTotal(currentEvent.items))}</span>
                        </div>
                    </div>

                    <button onClick={handleSaveEvent} className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-lg shadow-blue-500/20">Guardar Evento</button>
                </div>
            ) : (
                
                // MODO LISTA (VISUALIZACIÓN)
                <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                        {events.length === 0 && (
                            <div className="text-center py-8 opacity-50">
                                <Plane size={32} className="mx-auto mb-2 text-slate-300"/>
                                <p className="text-slate-400 text-xs font-bold">No hay eventos planeados</p>
                            </div>
                        )}

                        {events.sort((a,b) => new Date(a.date) - new Date(b.date)).map(evt => {
                            const total = calculateTotal(evt.items);
                            const daysLeft = Math.ceil((new Date(evt.date) - new Date()) / (1000 * 60 * 60 * 24));
                            const evtTypeData = EVENT_TYPES[evt.type] || EVENT_TYPES.trip;

                            return (
                                <div key={evt.id} className={`group relative p-4 rounded-2xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                                                {evtTypeData.icon}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{evt.name}</h4>
                                                <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                                                    <span className="flex items-center gap-1"><Calendar size={10}/> {evt.date}</span>
                                                    {evt.location && <span className="flex items-center gap-1"><MapPin size={10}/> {evt.location}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {/* Total en Rojo/Rosa */}
                                            <span className="block text-xs font-black text-rose-500">{formatCurrency(total)}</span>
                                            <span className={`text-[9px] font-bold ${daysLeft < 0 ? 'text-rose-400' : 'text-blue-500'}`}>{daysLeft < 0 ? 'Pasado' : `Faltan ${daysLeft} días`}</span>
                                        </div>
                                    </div>

                                    <div className={`space-y-1 p-2 rounded-lg ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                                        {/* Mostrar solo items NO checkeados o todos? Usualmente mejor mostrar resumen */}
                                        {evt.items.slice(0, 2).map(i => (
                                            <div key={i.id} className="flex justify-between text-[10px]">
                                                <span className={`${i.checked ? 'line-through text-slate-500' : (darkMode ? 'text-slate-300' : 'text-slate-600')}`}>{i.name}</span>
                                                <span className={`font-bold opacity-60 ${i.checked ? 'line-through' : ''}`}>{formatCurrency(i.cost)}</span>
                                            </div>
                                        ))}
                                        {evt.items.length > 2 && <p className="text-[9px] text-center text-slate-400 italic">+{evt.items.length - 2} items más...</p>}
                                    </div>

                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm rounded-lg p-1">
                                        <button onClick={() => openEdit(evt)} className={`p-1.5 rounded hover:text-blue-500 ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600 shadow-sm'}`}><Plus size={12}/></button>
                                        <button onClick={() => deleteEvent(evt.id)} className={`p-1.5 rounded hover:text-rose-500 ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600 shadow-sm'}`}><Trash2 size={12}/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={() => { setIsEditing(true); setCurrentEvent({ name: '', date: '', location: '', type: 'trip', items: [] }); }} className="mt-3 w-full py-2 rounded-xl border border-dashed text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                        <Plus size={14}/> Agregar Nuevo Plan
                    </button>
                </div>
            )}
        </div>
      )}
    </Card>
  );
};