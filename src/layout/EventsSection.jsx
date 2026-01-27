import React, { useState, useEffect } from 'react';
import { Plane, Calendar, MapPin, Plus, Trash2, CheckSquare, Square, X, ChevronUp, ChevronDown, Minus, Maximize2, PartyPopper, Tent, Film, Utensils, Music, Heart, ShoppingBag, Car, Ticket, Hash, Star, Edit3, Grid, Tag, ArrowLeft, DollarSign, Home, Settings, Save } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabaseClient';
import { INITIAL_CATALOG, EVENT_TYPES } from '../constants/config';

export const EventsSection = ({ onMoveUp, onMoveDown, isFirst, isLast }) => {
  const { user } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent, shoppingList, addShoppingItem, updateShoppingItem, toggleShoppingStatus, toggleShoppingFavorite, deleteShoppingItem, themeColor, darkMode, isAllExpanded } = useFinancial();
  
  // --- ESTADOS DE VISTA ---
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'events' | 'shopping'

  // --- ESTADOS EVENTOS ---
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ id: null, name: '', date: '', location: '', type: 'trip', items: [] });
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');



  // --- ESTADOS COMPRAS Y CATÁLOGO ---
  const [isCatalogEditMode, setIsCatalogEditMode] = useState(false); // Modo edición del catálogo
  const [newCatName, setNewCatName] = useState(""); // <--- Estado para el input de nueva categoría
  const [showShopForm, setShowShopForm] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingShopId, setEditingShopId] = useState(null);
  
  const [newShopItem, setNewShopItem] = useState({ name: '', location: '', date: '', tags: '', cost: '' });

  const [isCatalogLoading, setIsCatalogLoading] = useState(true); 


    // --- ESTADO PARA EL CATÁLOGO ---
  // Iniciamos con una función para intentar leer del localStorage primero
  const [catalog, setCatalog] = useState(() => {
      if (user) {
          const saved = localStorage.getItem(`fin_catalog_${user.id}`);
          return saved ? JSON.parse(saved) : INITIAL_CATALOG;
      }
      return INITIAL_CATALOG;
  });
  // 1. CARGAR CATÁLOGO DESDE SUPABASE AL INICIAR
  useEffect(() => {
      if (!user) return;

      const fetchCatalog = async () => {
          try {
              const { data, error } = await supabase
                  .from('user_catalogs')
                  .select('data')
                  .eq('user_id', user.id)
                  .maybeSingle();
              if (error && error.code !== 'PGRST116') {
                  console.error("Error cargando catálogo:", error);
              }
              if (data && data.data) {
                  // Si existe en la nube, lo usamos mezclado con el inicial (por si agregamos categorías base nuevas)
                  setCatalog({ ...INITIAL_CATALOG, ...data.data });
              }else {
                  // Si es null (usuario nuevo o sin datos), usamos el por defecto sin error
                  setCatalog(INITIAL_CATALOG);
              }
          } catch (error) {
              console.log("Usando catálogo por defecto");
          } finally {
              setIsCatalogLoading(false);
          }
      };

      fetchCatalog();
  }, [user]);

  // 2. GUARDAR EN SUPABASE AUTOMÁTICAMENTE (CON DEBOUNCE)
  useEffect(() => {
      if (!user || isCatalogLoading) return;

      // Esperamos 1 segundo después del último cambio para guardar (evita muchas peticiones seguidas)
      const timer = setTimeout(async () => {
          const { error } = await supabase
              .from('user_catalogs')
              .upsert({ 
                  user_id: user.id, 
                  data: catalog,
                  updated_at: new Date()
              });
          
          if (error) console.error("Error guardando catálogo:", error);
      }, 1500);

      return () => clearTimeout(timer);
  }, [catalog, user, isCatalogLoading]);


  useEffect(() => { setIsExpanded(isAllExpanded); }, [isAllExpanded]);

  // --- FUNCIONES EVENTOS ---
  const handleAddItem = () => {
      if (!newItemName) return;
      const newItem = { id: Date.now(), name: newItemName, cost: Number(newItemCost) || 0, checked: false };
      setCurrentEvent(prev => ({ ...prev, items: [...prev.items, newItem] }));
      setNewItemName(''); setNewItemCost('');
  };

  const handleUpdateItem = (id, field, value) => {
      const updatedItems = currentEvent.items.map(i => i.id === id ? { ...i, [field]: field === 'cost' ? Number(value) : value } : i);
      setCurrentEvent({ ...currentEvent, items: updatedItems });
  };

  const handleSaveEvent = () => {
      if (!currentEvent.name || !currentEvent.date) return;
      if (currentEvent.id) {
          updateEvent(currentEvent);
      } else {
          addEvent({ ...currentEvent, id: Date.now().toString() });
      }
      setIsEditingEvent(false);
      setCurrentEvent({ id: null, name: '', date: '', location: '', type: 'trip', items: [] });
  };

  const openEditEvent = (evt) => {
      setCurrentEvent(evt);
      setIsEditingEvent(true);
      setViewMode('events');
  };

  const calculateTotal = (items) => items.filter(item => !item.checked).reduce((acc, item) => acc + Number(item.cost), 0);

  // --- FUNCIONES COMPRAS Y CATÁLOGO ---

  // 1. Modificar items del catálogo (Precios y Nombres)
  const updateCatalogItem = (catId, itemId, field, value) => {
      setCatalog(prev => ({
          ...prev,
          [catId]: {
              ...prev[catId],
              items: prev[catId].items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
          }
      }));
  };

  // 2. Agregar nuevo item al catálogo
  const addCatalogItemToCategory = (catId) => {
      const newItem = { id: Date.now(), name: 'Nuevo Item', price: 0 };
      setCatalog(prev => ({
          ...prev,
          [catId]: { ...prev[catId], items: [...prev[catId].items, newItem] }
      }));
  };

  // 3. Crear nueva categoría
  const addNewCategory = () => {
      if (!newCatName.trim()) return;
      
      const id = newCatName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
      const colors = ['orange', 'blue', 'rose', 'pink', 'indigo', 'emerald', 'violet', 'cyan'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setCatalog(prev => ({
          ...prev,
          [id]: { 
              id, 
              label: newCatName, 
              tag: `#${newCatName.replace(/\s+/g, '')}`, 
              color: randomColor, 
              items: [] 
          }
      }));
      setNewCatName(""); // Limpiar input
  };

  // 4. Borrar categoría (Opcional, pero útil)
  const deleteCategory = (catId) => {
      if(window.confirm("¿Borrar esta categoría y sus items?")) {
          const newCatalog = { ...catalog };
          delete newCatalog[catId];
          setCatalog(newCatalog);
      }
  };

  const handleSelectCategory = (catData, itemData = null) => {
      let name = newShopItem.name;
      let cost = newShopItem.cost;
      
      if (itemData) {
          name = itemData.name;
          cost = itemData.price;
      }
      
      let tags = newShopItem.tags;
      if (!tags.includes(catData.tag)) {
          tags = catData.tag;
      }

      setNewShopItem({ ...newShopItem, name, cost, tags });
      if (itemData) setShowCatalog(false);
  };

  const handleSaveShopItem = () => {
    if (newShopItem.name) {
        const tagsArray = newShopItem.tags.split(' ').filter(t => t.trim() !== '').map(t => t.startsWith('#') ? t : `#${t}`);
        
        const itemData = {
            id: editingShopId || Date.now().toString(),
            name: newShopItem.name,
            location: newShopItem.location,
            cost: Number(newShopItem.cost) || 0,
            date: newShopItem.date || new Date().toISOString().split('T')[0],
            tags: tagsArray,
            isFavorite: editingShopId ? shoppingList.find(i => i.id === editingShopId)?.isFavorite : false,
            isAcquired: editingShopId ? shoppingList.find(i => i.id === editingShopId)?.isAcquired : false
        };

        if (editingShopId) {
            updateShoppingItem(itemData);
        } else {
            addShoppingItem(itemData);
        }
        
        setNewShopItem({ name: '', location: '', date: '', tags: '', cost: '' });
        setEditingShopId(null);
        setShowShopForm(false);
        setShowCatalog(false);
    }
  };

  const openShopEdit = (item) => {
      setNewShopItem({ 
          name: item.name, 
          location: item.location || '', 
          date: item.date || '', 
          tags: item.tags ? item.tags.join(' ') : '',
          cost: item.cost || ''
      });
      setEditingShopId(item.id);
      setShowShopForm(true);
      setViewMode('shopping');
  };

  // Función para agrupar compras por categoría
  const getGroupedShoppingList = () => {
      const groups = {};
      const sortedList = [...shoppingList].sort((a,b) => (b.isFavorite - a.isFavorite));

      sortedList.forEach(item => {
          // Tomamos el primer tag como categoría principal, o "Otros"
          const mainTag = item.tags && item.tags.length > 0 ? item.tags[0] : '#Otros';
          if (!groups[mainTag]) groups[mainTag] = [];
          groups[mainTag].push(item);
      });
      return groups;
  };

  const getTagColor = (tag) => {
    const t = (tag || '').toLowerCase();
    if (t.includes('auto') || t.includes('car')) return 'bg-rose-100 text-rose-600 border-rose-200';
    if (t.includes('hogar') || t.includes('home')) return 'bg-orange-100 text-orange-600 border-orange-200';
    if (t.includes('tech')) return 'bg-blue-100 text-blue-600 border-blue-200';
    if (t.includes('music')) return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    if (t.includes('ropa')) return 'bg-pink-100 text-pink-600 border-pink-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };


  // --- EFECTO: GUARDAR CATÁLOGO AUTOMÁTICAMENTE ---
  useEffect(() => {
      if (user) {
          localStorage.setItem(`fin_catalog_${user.id}`, JSON.stringify(catalog));
      }
  }, [catalog, user]);
  
  // --- EFECTO: CARGAR AL CAMBIAR DE USUARIO ---
  useEffect(() => {
      if (user) {
          const saved = localStorage.getItem(`fin_catalog_${user.id}`);
          setCatalog(saved ? JSON.parse(saved) : INITIAL_CATALOG);
      }
  }, [user]);


  // --- RENDERIZADO DEL DASHBOARD ---
  const renderDashboard = () => {
      const nextEvent = events
        .filter(e => new Date(e.date) >= new Date())
        .sort((a,b) => new Date(a.date) - new Date(b.date))[0];

      const pendingShopping = shoppingList
        .filter(i => !i.isAcquired)
        .sort((a,b) => b.isFavorite - a.isFavorite)
        .slice(0, 3);

      return (
          <div className="grid grid-cols-2 gap-4 h-full animate-in fade-in">
              <div className={`rounded-xl p-3 border flex flex-col relative overflow-hidden group hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximo Viaje</h4>
                      <button onClick={() => setViewMode('events')} className="text-[9px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-blue-500 font-bold">Ver Todo</button>
                  </div>
                  {nextEvent ? (
                      <div className="flex-1 flex flex-col justify-center items-center text-center cursor-pointer" onClick={() => openEditEvent(nextEvent)}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                              {EVENT_TYPES[nextEvent.type]?.icon || <Plane size={18}/>}
                          </div>
                          <h3 className={`text-sm font-bold leading-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{nextEvent.name}</h3>
                          <p className="text-[10px] text-slate-400 mb-2">{nextEvent.date}</p>
                          <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg">
                              {formatCurrency(calculateTotal(nextEvent.items))}
                          </span>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col justify-center items-center text-slate-300">
                          <Calendar size={24} className="mb-2 opacity-50"/>
                          <p className="text-[10px] font-bold">Sin planes futuros</p>
                          <button onClick={() => { setViewMode('events'); setIsEditingEvent(true); }} className="mt-2 text-[9px] text-blue-500 underline">Crear uno</button>
                      </div>
                  )}
              </div>

              <div className={`rounded-xl p-3 border flex flex-col relative group hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lista Deseos</h4>
                      <button onClick={() => setViewMode('shopping')} className="text-[9px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-blue-500 font-bold">Ver Todo</button>
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden">
                      {pendingShopping.length > 0 ? pendingShopping.map(item => (
                          <div key={item.id} onClick={() => openShopEdit(item)} className="flex justify-between items-center text-[10px] pb-1 border-b border-dashed border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded px-1">
                              <div className="flex items-center gap-1 overflow-hidden">
                                  {item.isFavorite && <Star size={8} className="text-yellow-400 fill-current shrink-0"/>}
                                  <span className={`truncate font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.name}</span>
                              </div>
                              <span className="font-bold text-slate-400 shrink-0 ml-1">{item.cost ? `$${item.cost}` : '-'}</span>
                          </div>
                      )) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300">
                              <ShoppingBag size={24} className="mb-2 opacity-50"/>
                              <p className="text-[10px]">Todo comprado</p>
                          </div>
                      )}
                  </div>
                  <button onClick={() => { setViewMode('shopping'); setShowShopForm(true); }} className="mt-auto w-full py-1 text-[9px] border border-dashed rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors">
                      + Agregar Rápido
                  </button>
              </div>
          </div>
      );
  };

  return (
    <Card className={`overflow-hidden flex flex-col transition-all duration-500 ${isExpanded ? 'h-full min-h-[400px]' : 'h-auto'}`}>
      
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="flex items-center gap-2">
            {viewMode !== 'dashboard' && (
                <button onClick={() => setViewMode('dashboard')} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                    <ArrowLeft size={14} />
                </button>
            )}
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                {viewMode === 'dashboard' ? <Home size={14} style={{ color: themeColor }}/> : viewMode === 'events' ? <Plane size={14} style={{ color: themeColor }}/> : <ShoppingBag size={14} style={{ color: themeColor }}/>}
                {viewMode === 'dashboard' ? 'Resumen General' : viewMode === 'events' ? 'Mis Viajes y Eventos' : 'Compras y Mejoras'}
            </h3>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                {isExpanded ? <Minus size={16}/> : <Maximize2 size={16}/>}
            </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* TABS DE NAVEGACIÓN */}
            <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-xl shrink-0">
                 <button 
                    onClick={() => setViewMode('dashboard')} 
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${viewMode === 'dashboard' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <Grid size={12}/>
                 </button>

                 <button 
                    onClick={() => setViewMode('events')} 
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${viewMode === 'events' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <Plane size={12}/> Eventos
                 </button>

                 <button 
                    onClick={() => setViewMode('shopping')} 
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${viewMode === 'shopping' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <ShoppingBag size={12}/> Compras
                 </button>
            </div>

            {/* CONTENIDO DINÁMICO */}
            
            {/* 1. MODO DASHBOARD */}
            {viewMode === 'dashboard' && renderDashboard()}

            {/* 2. MODO EVENTOS */}
            {viewMode === 'events' && (
                <>
                    {isEditingEvent ? (
                        <div className="flex-1 flex flex-col gap-3 animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-between items-center border-b pb-2 dark:border-slate-700">
                                <span className="text-xs font-black uppercase dark:text-white">{currentEvent.id ? 'Editar Plan' : 'Nuevo Plan'}</span>
                                <button onClick={() => setIsEditingEvent(false)} className="text-slate-400 hover:text-rose-500"><X size={16}/></button>
                            </div>
                            
                            {/* Inputs Principales */}
                            <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Nombre Evento" value={currentEvent.name} onChange={e => setCurrentEvent({...currentEvent, name: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                                <input type="date" value={currentEvent.date} onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                    <input placeholder="Ubicación" value={currentEvent.location} onChange={e => setCurrentEvent({...currentEvent, location: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                                    <select value={currentEvent.type} onChange={e => setCurrentEvent({...currentEvent, type: e.target.value})} className={`p-2 rounded-lg text-xs font-bold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                                            {Object.entries(EVENT_TYPES).map(([key, data]) => (
                                                <option key={key} value={key}>{data.label}</option>
                                            ))}
                                    </select>
                            </div>


                            {/* --- SECCIÓN DE PRESETS (BOTONES RÁPIDOS) --- */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {EVENT_TYPES[currentEvent.type]?.presets.map((preset, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setCurrentEvent(prev => ({
                                            ...prev,
                                            items: [...prev.items, { 
                                                id: Date.now() + Math.random(), // ID único
                                                name: preset.name, 
                                                cost: preset.cost, 
                                                checked: false 
                                            }]
                                        }))}
                                        className={`text-[9px] px-2 py-1 rounded-lg border border-dashed flex items-center gap-1 transition-all hover:scale-105 active:scale-95
                                            ${darkMode 
                                                ? 'border-slate-600 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/20' 
                                                : 'border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50'
                                            }`}
                                    >
                                        <Plus size={10}/> {preset.name} <span className="opacity-60">(${preset.cost})</span>
                                    </button>
                                ))}
                            </div>
                            {/* Checklist Interactivo */}
                            <div className={`flex-1 rounded-xl p-3 border flex flex-col min-h-[150px] ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex gap-2 mb-2">
                                    <input placeholder="Nuevo gasto..." value={newItemName} onChange={e => setNewItemName(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                                    <input type="number" placeholder="$" value={newItemCost} onChange={e => setNewItemCost(e.target.value)} className={`w-20 p-2 rounded-lg text-xs outline-none border ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                                    <button onClick={handleAddItem} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Plus size={14}/></button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                    {currentEvent.items.map(item => (
                                        <div key={item.id} className={`flex justify-between items-center p-1 px-2 rounded-lg group ${darkMode ? 'bg-slate-900' : 'bg-white shadow-sm'}`}>
                                            <div className="flex items-center gap-2 flex-1">
                                                <button onClick={() => setCurrentEvent({...currentEvent, items: currentEvent.items.map(i => i.id === item.id ? {...i, checked: !i.checked} : i)})} className={item.checked ? 'text-emerald-500' : 'text-slate-300'}>
                                                    {item.checked ? <CheckSquare size={14}/> : <Square size={14}/>}
                                                </button>
                                                <input value={item.name} onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)} className={`text-xs bg-transparent border-none outline-none w-full ${item.checked ? 'line-through text-slate-500' : (darkMode ? 'text-slate-200' : 'text-slate-700')}`}/>
                                            </div>
                                            <input type="number" value={item.cost} onChange={(e) => handleUpdateItem(item.id, 'cost', e.target.value)} className={`text-xs font-bold bg-transparent border-none outline-none w-16 text-right ${item.checked ? 'line-through text-slate-500' : (darkMode ? 'text-white' : 'text-slate-800')}`}/>
                                            <button onClick={() => setCurrentEvent({...currentEvent, items: currentEvent.items.filter(i => i.id !== item.id)})} className="text-slate-300 hover:text-rose-500 ml-1"><Trash2 size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs font-bold">
                                    <span className="uppercase text-slate-400">Total Estimado:</span>
                                    <span className="text-rose-500 text-sm">{formatCurrency(calculateTotal(currentEvent.items))}</span>
                                </div>
                            </div>

                            <button onClick={handleSaveEvent} className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-lg shadow-blue-500/20">
                                {currentEvent.id ? 'Guardar Cambios' : 'Crear Evento'}
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                                {events.sort((a,b) => new Date(a.date) - new Date(b.date)).map(evt => {
                                    const total = calculateTotal(evt.items);
                                    return (
                                        <div key={evt.id} className={`group relative p-4 rounded-2xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                                                        {EVENT_TYPES[evt.type]?.icon || <Plane size={14}/>}
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{evt.name}</h4>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10}/> {evt.date}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-xs font-black text-rose-500">{formatCurrency(total)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Acciones Rápidas */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded p-1">
                                                <button onClick={() => openEditEvent(evt)} className="p-1.5 hover:text-blue-500"><Edit3 size={12}/></button>
                                                <button onClick={() => deleteEvent(evt.id)} className="p-1.5 hover:text-rose-500"><Trash2 size={12}/></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => { setIsEditingEvent(true); setCurrentEvent({ id: null, name: '', date: '', location: '', type: 'trip', items: [] }); }} className="mt-3 w-full py-2 rounded-xl border border-dashed text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center gap-2">
                                <Plus size={14}/> Nuevo Evento
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* 3. MODO COMPRAS (MEJORADO: Agrupado y Editable) */}
            {viewMode === 'shopping' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 relative">
                    
                    {!showShopForm && (
                        <button onClick={() => { setShowShopForm(true); setEditingShopId(null); setNewShopItem({ name: '', location: '', date: '', tags: '', cost: '' }); }} className="w-full py-3 mb-2 border border-dashed rounded-xl text-slate-400 text-xs font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                            <Plus size={14}/> Agregar Deseo
                        </button>
                    )}

                    {/* FORMULARIO COMPRAS MEJORADO (Con Edición de Catálogo) */}
                    {showShopForm && (
                        <div className={`p-3 rounded-2xl border mb-3 animate-in fade-in zoom-in-95 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-200 shadow-md'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-[10px] font-black uppercase text-blue-500">{editingShopId ? 'Editar Deseo' : 'Nuevo Deseo'}</h4>
                                <div className="flex gap-1">
                                    <button onClick={() => setShowCatalog(!showCatalog)} className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${showCatalog ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        <Grid size={12}/> <span className="text-[9px] font-bold">Catálogo</span>
                                    </button>
                                    <button onClick={() => { setShowShopForm(false); setShowCatalog(false); }} className="text-slate-400 hover:text-rose-500"><X size={14}/></button>
                                </div>
                            </div>
                            
                            {/* CATÁLOGO DESPLEGABLE (EDITABLE) */}
                            {showCatalog && (
                                <div className={`mb-3 p-2 rounded-xl border animate-in slide-in-from-top-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black uppercase text-slate-400">Seleccionar o Editar</span>
                                        <button onClick={() => setIsCatalogEditMode(!isCatalogEditMode)} className={`text-[9px] flex items-center gap-1 font-bold ${isCatalogEditMode ? 'text-green-500' : 'text-slate-400 hover:text-blue-500'}`}>
                                            {isCatalogEditMode ? <><Save size={10}/> Guardar</> : <><Settings size={10}/> Editar Items</>}
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.values(catalog).map((cat) => (
                                            <div key={cat.id} className={`p-2 rounded-lg border relative group/cat ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                
                                                {/* Botón Borrar Categoría (Solo Edit Mode) */}
                                                {isCatalogEditMode && (
                                                    <button 
                                                        onClick={() => deleteCategory(cat.id)}
                                                        className="absolute top-1 right-1 text-slate-300 hover:text-rose-500"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                )}

                                                <div className={`w-full text-left text-[10px] font-black mb-1 flex items-center gap-1 ${cat.color === 'orange' ? 'text-orange-500' : cat.color === 'blue' ? 'text-blue-500' : 'text-slate-500'}`}>
                                                    {cat.label}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {cat.items.map(item => (
                                                        <div key={item.id}>
                                                            {isCatalogEditMode ? (
                                                                <div className="flex gap-1 mb-1">
                                                                     <input value={item.name} onChange={(e) => updateCatalogItem(cat.id, item.id, 'name', e.target.value)} className="w-16 text-[9px] p-0.5 border rounded outline-none"/>
                                                                     <input type="number" value={item.price} onChange={(e) => updateCatalogItem(cat.id, item.id, 'price', e.target.value)} className="w-10 text-[9px] p-0.5 border rounded outline-none text-right"/>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => handleSelectCategory(cat, item)} className="text-[9px] px-1.5 py-0.5 rounded border bg-white hover:scale-105 transition-transform flex gap-1">
                                                                        {item.name} <span className="text-slate-400">${item.price}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {isCatalogEditMode && (
                                                        <button onClick={() => addCatalogItemToCategory(cat.id)} className="text-[9px] px-2 py-0.5 rounded border border-dashed text-slate-400 hover:text-green-500 hover:border-green-500"><Plus size={10}/></button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* --- TARJETA DE "NUEVA CATEGORÍA" (SOLO EN MODO EDICIÓN) --- */}
                                        {isCatalogEditMode && (
                                            <div className={`p-2 rounded-lg border border-dashed flex flex-col justify-center items-center gap-2 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                                <span className="text-[9px] font-bold uppercase text-slate-400">Nueva Categoría</span>
                                                <div className="flex gap-1 w-full">
                                                    <input 
                                                        value={newCatName}
                                                        onChange={(e) => setNewCatName(e.target.value)}
                                                        placeholder="Ej: Mascotas"
                                                        className={`w-full text-[10px] p-1 rounded border outline-none ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                                                        onKeyDown={(e) => e.key === 'Enter' && addNewCategory()}
                                                    />
                                                    <button 
                                                        onClick={addNewCategory}
                                                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 shadow-sm"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Inputs: Nombre */}
                            <input 
                                className={`w-full p-2 mb-2 text-xs font-bold border rounded-lg outline-none ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} 
                                placeholder="Nombre del producto..." 
                                value={newShopItem.name} 
                                onChange={e => setNewShopItem({...newShopItem, name: e.target.value})} 
                                autoFocus
                            />

                            {/* Inputs: Costo y Lugar */}
                            <div className="flex gap-2 mb-2">
                                <div className="relative w-1/3">
                                    <DollarSign size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <input 
                                        type="number"
                                        className={`w-full pl-6 p-2 text-xs font-bold border rounded-lg outline-none ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} 
                                        placeholder="Valor" 
                                        value={newShopItem.cost} 
                                        onChange={e => setNewShopItem({...newShopItem, cost: e.target.value})}
                                    />
                                </div>
                                <input 
                                    className={`flex-1 p-2 text-xs border rounded-lg outline-none ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} 
                                    placeholder="Tienda / Web (Amazon, Walmart...)" 
                                    value={newShopItem.location} 
                                    onChange={e => setNewShopItem({...newShopItem, location: e.target.value})} 
                                />
                            </div>

                            {/* Input: Fecha y Selector de Categoría */}
                            <div className="flex gap-2 mb-3">
                                {/* Selector de Fecha */}
                                <input 
                                    type="date"
                                    className={`w-1/3 p-2 text-xs border rounded-xl outline-none ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} 
                                    value={newShopItem.date} 
                                    onChange={e => setNewShopItem({...newShopItem, date: e.target.value})}
                                />

                                {/* NUEVO: Selector de Categoría (Dropdown) */}
                                <div className="flex-1 relative">
                                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                    <select
                                        className={`w-full pl-9 p-2 text-xs font-bold border rounded-xl outline-none appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                        value={
                                            // Busca qué categoría del catálogo coincide con el tag actual del item
                                            Object.values(catalog).find(cat => newShopItem.tags.includes(cat.tag))?.id || ''
                                        }
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            if (selectedId && catalog[selectedId]) {
                                                // Asigna el tag correspondiente a la categoría seleccionada
                                                setNewShopItem({ ...newShopItem, tags: catalog[selectedId].tag });
                                            }
                                        }}
                                    >
                                        <option value="">Seleccionar Categoría...</option>
                                        {Object.values(catalog).map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.label} 
                                            </option>
                                        ))}
                                    </select>
                                    {/* Flechita decorativa del select */}
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                </div>
                            </div> 
                            
                            <button onClick={handleSaveShopItem} className="w-full py-2.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:brightness-110 shadow-md">
                                {editingShopId ? 'ACTUALIZAR DESEO' : 'AGREGAR A LISTA'}
                            </button>
                        </div>
                    )}

                    {/* LISTADO DE COMPRAS (AGRUPADO POR CATEGORÍA) */}
                    <div className="space-y-4 pb-4">
                        {Object.keys(getGroupedShoppingList()).length === 0 && !showShopForm && (
                            <div className="text-center py-8 opacity-40">
                                <ShoppingBag size={32} className="mx-auto mb-2 text-slate-300"/>
                                <p className="text-[10px] font-bold text-slate-400">Tu lista de deseos está vacía</p>
                            </div>
                        )}

                        {Object.entries(getGroupedShoppingList()).map(([tag, items]) => (
                            <div key={tag} className="animate-in fade-in slide-in-from-bottom-2">
                                {/* Encabezado de Categoría */}
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase mb-1 ml-1 ${getTagColor(tag)}`}>
                                    {tag}
                                </div>
                                
                                {/* Items de la Categoría */}
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <div key={item.id} className={`group flex items-center gap-3 p-2 rounded-xl border transition-all ${item.isAcquired ? 'opacity-60 grayscale bg-slate-50' : (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:shadow-sm')}`}>
                                            <button onClick={() => toggleShoppingStatus(item.id)} className={`shrink-0 transition-colors ${item.isAcquired ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}`}>
                                                {item.isAcquired ? <CheckSquare size={18}/> : <Square size={18}/>}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs font-bold truncate ${item.isAcquired ? 'line-through text-slate-400' : (darkMode ? 'text-white' : 'text-slate-800')}`}>{item.name}</p>
                                                    
                                                    {/* Botones de Acción (Visibles al hover) */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                                                            <button onClick={() => openShopEdit(item)} className="text-slate-400 hover:text-blue-500"><Edit3 size={12}/></button>
                                                            <button onClick={() => deleteShoppingItem(item.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={12}/></button>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); toggleShoppingFavorite(item.id); }} className={`${item.isFavorite ? 'text-yellow-400' : 'text-slate-200'}`}>
                                                            <Star size={14} fill={item.isFavorite ? "currentColor" : "none"}/>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-0.5">
                                                    <div className="flex items-center gap-2 text-[9px] text-slate-400">
                                                        {item.location && <span><MapPin size={8} className="inline mr-0.5"/>{item.location}</span>}
                                                        {item.date && <span>• {item.date}</span>}
                                                    </div>
                                                    {item.cost > 0 && <span className="text-[10px] font-black text-rose-500">{formatCurrency(item.cost)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      )}
    </Card>
  );
};