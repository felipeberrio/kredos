export const INCOME_CATEGORIES = ["Salario", "Extra", "Regalo", "Inversión"];

export const DEFAULT_EXPENSE_CATS = [
  "🏠 Vivienda",
  "🍔 Comida",
  "🚌 Transporte",
  "💊 Salud",
  "🎉 Ocio",
  "📺 Suscripciones",
  "📱 Tecnología",
  "🛒 Supermercado",
  "🎓 Educación",      // Agregué estas para llegar a mas opciones si quieres
  "💡 Servicios",
  "👕 Ropa",
  "⁉️ Deudas y compromisos",
];

export const DEFAULT_INCOME_CATS = [
  "💰 Salario",
  "💸 Ingreso Extra",
  "🎁 Regalo",
  "📈 Inversión",
  "🔄 Devolución",
  "💼 Freelance",
  "💵 Propinas",
];

export const THEME_PALETTES = {
  '#3b82f6': ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'],
  '#8b5cf6': ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed'],
  // Agrega aquí el resto de tus colores...
};


export const INITIAL_CATALOG = {
    // 1. HOGAR (Naranja)
    home: { id: 'home', label: '🏠 Hogar', tag: '#Hogar', color: 'orange', items: [
        { id: 101, name: 'Cama King', price: 600 }, 
        { id: 102, name: 'Escritorio', price: 150 }, 
        { id: 103, name: 'Silla Ergonómica', price: 200 }, 
        { id: 104, name: 'Air Fryer', price: 80 },
        { id: 105, name: 'Robot Aspiradora', price: 250 },
        { id: 106, name: 'Set de Ollas', price: 120 },
        { id: 107, name: 'Cafetera Espresso', price: 180 },
        { id: 108, name: 'Smart TV 55"', price: 400 },
        { id: 109, name: 'Lámpara de Pie', price: 45 },
        { id: 110, name: 'Juego Sábanas', price: 60 }
    ]},
    
    // 2. TECNOLOGÍA (Azul)
    tech: { id: 'tech', label: '💻 Tecnología', tag: '#Tech', color: 'blue', items: [
        { id: 201, name: 'PS5 Pro', price: 700 }, 
        { id: 202, name: 'Monitor 4K', price: 350 }, 
        { id: 203, name: 'AirPods Max', price: 550 }, 
        { id: 204, name: 'iPhone 16', price: 1100 },
        { id: 205, name: 'iPad Air', price: 600 },
        { id: 206, name: 'MacBook Air', price: 1200 },
        { id: 207, name: 'Apple Watch', price: 400 },
        { id: 208, name: 'Disco SSD 2TB', price: 150 },
        { id: 209, name: 'Power Bank', price: 50 },
        { id: 210, name: 'Teclado Mecánico', price: 120 }
    ]},

    // 3. AUTO (Rosa/Rojo)
    car: { id: 'car', label: '🚗 Auto', tag: '#Auto', color: 'rose', items: [
        { id: 301, name: 'Set Llantas', price: 400 }, 
        { id: 302, name: 'Cambio Aceite', price: 60 }, 
        { id: 303, name: 'Bumper Frontal', price: 250 }, 
        { id: 304, name: 'Detailing Completo', price: 150 },
        { id: 305, name: 'Batería Nueva', price: 180 },
        { id: 306, name: 'Seguro Semestral', price: 600 },
        { id: 307, name: 'Gasolina Full', price: 50 },
        { id: 308, name: 'Polarizado', price: 120 },
        { id: 309, name: 'Cámara Dashcam', price: 80 },
        { id: 310, name: 'Kit Limpieza', price: 35 }
    ]},

    // 4. ROPA (Rosa Suave)
    clothing: { id: 'clothing', label: '👕 Ropa', tag: '#Ropa', color: 'pink', items: [
        { id: 401, name: 'Sneakers Nike', price: 120 }, 
        { id: 402, name: 'Outfit Completo', price: 150 }, 
        { id: 403, name: 'Chaqueta Invierno', price: 180 },
        { id: 404, name: 'Jeans Premium', price: 80 },
        { id: 405, name: 'Camisetas Pack', price: 40 },
        { id: 406, name: 'Botas Timberland', price: 160 },
        { id: 407, name: 'Gorra/Hat', price: 30 },
        { id: 408, name: 'Reloj Casual', price: 200 },
        { id: 409, name: 'Gafas de Sol', price: 150 },
        { id: 410, name: 'Ropa Interior', price: 50 }
    ]},

    // 5. MÚSICA (Índigo)
    music: { id: 'music', label: '🎵 Música', tag: '#Music', color: 'indigo', items: [
        { id: 501, name: 'Controladora DJ', price: 300 }, 
        { id: 502, name: 'Monitores Audio', price: 250 }, 
        { id: 503, name: 'Suscripción Beatport', price: 30 },
        { id: 504, name: 'Audífonos Pro', price: 200 },
        { id: 505, name: 'Interfaz de Audio', price: 150 },
        { id: 506, name: 'Micrófono Shure', price: 120 },
        { id: 507, name: 'Teclado MIDI', price: 180 },
        { id: 508, name: 'Acoustic Pads', price: 80 },
        { id: 509, name: 'Cables Premium', price: 40 },
        { id: 510, name: 'Plugin VST', price: 100 }
    ]},

    // --- NUEVAS CATEGORÍAS ---

    // 6. FITNESS (Esmeralda)
    fitness: { id: 'fitness', label: '💪 Fitness', tag: '#Fit', color: 'emerald', items: [
        { id: 601, name: 'Proteína Whey', price: 70 },
        { id: 602, name: 'Creatina', price: 35 },
        { id: 603, name: 'Membresía Gym', price: 50 },
        { id: 604, name: 'Zapatillas Running', price: 130 },
        { id: 605, name: 'Ropa Deportiva', price: 80 },
        { id: 606, name: 'Mancuernas Set', price: 100 },
        { id: 607, name: 'Pre-Workout', price: 40 },
        { id: 608, name: 'Smartwatch', price: 250 },
        { id: 609, name: 'Mat de Yoga', price: 30 },
        { id: 610, name: 'Bolso Deportivo', price: 45 }
    ]},

    // 7. GAMING (Violeta)
    gaming: { id: 'gaming', label: '🎮 Gaming', tag: '#Gamer', color: 'violet', items: [
        { id: 701, name: 'Control DualSense', price: 75 },
        { id: 702, name: 'Juego AAA Nuevo', price: 70 },
        { id: 703, name: 'Suscripción GamePass', price: 15 },
        { id: 704, name: 'Headset Gamer', price: 120 },
        { id: 705, name: 'Silla Gamer', price: 250 },
        { id: 706, name: 'Tarjeta Gráfica', price: 500 },
        { id: 707, name: 'Teclado RGB', price: 100 },
        { id: 708, name: 'Mouse Gamer', price: 60 },
        { id: 709, name: 'Monitor 144Hz', price: 200 },
        { id: 710, name: 'Steam Deck', price: 450 }
    ]},

    // 8. CUIDADO PERSONAL (Cyan)
    personal: { id: 'personal', label: '🧖 Personal', tag: '#SelfCare', color: 'cyan', items: [
        { id: 801, name: 'Perfume', price: 120 },
        { id: 802, name: 'Corte de Cabello', price: 30 },
        { id: 803, name: 'Kit Skincare', price: 85 },
        { id: 804, name: 'Vitaminas/Supl.', price: 40 },
        { id: 805, name: 'Máquina Afeitar', price: 60 },
        { id: 806, name: 'Masaje', price: 80 },
        { id: 807, name: 'Blanqueamiento', price: 200 },
        { id: 808, name: 'Bloqueador Solar', price: 25 },
        { id: 809, name: 'Cepillo Eléctrico', price: 50 },
        { id: 810, name: 'Consulta Médica', price: 100 }
    ]},

    // 9. OFICINA (Slate)
    office: { id: 'office', label: '💼 Oficina', tag: '#Work', color: 'slate', items: [
        { id: 901, name: 'Monitor Secundario', price: 180 },
        { id: 902, name: 'Soporte Laptop', price: 40 },
        { id: 903, name: 'Webcam HD', price: 60 },
        { id: 904, name: 'Agenda/Libreta', price: 20 },
        { id: 905, name: 'Bolígrafos Premium', price: 15 },
        { id: 906, name: 'Mochila Tech', price: 90 },
        { id: 907, name: 'Mousepad XL', price: 25 },
        { id: 908, name: 'Hub USB-C', price: 45 },
        { id: 909, name: 'Curso Online', price: 50 },
        { id: 910, name: 'Libros Finanzas', price: 30 }
    ]},

    // 10. MASCOTAS (Amber)
    pets: { id: 'pets', label: '🐾 Mascotas', tag: '#Pets', color: 'amber', items: [
        { id: 1001, name: 'Comida Premium', price: 60 },
        { id: 1002, name: 'Veterinario', price: 80 },
        { id: 1003, name: 'Vacunas', price: 50 },
        { id: 1004, name: 'Juguetes', price: 20 },
        { id: 1005, name: 'Cama Mascota', price: 45 },
        { id: 1006, name: 'Collar y Correa', price: 30 },
        { id: 1007, name: 'Baño/Peluquería', price: 40 },
        { id: 1008, name: 'Antipulgas', price: 35 },
        { id: 1009, name: 'Premios/Snacks', price: 15 },
        { id: 1010, name: 'Transportadora', price: 55 }
    ]}
};


export const EVENT_TYPES = {
    // 1. VIAJE
    trip: { label: '✈️ Viaje', presets: [
        { name: 'Vuelos', cost: 300 }, 
        { name: 'Hotel', cost: 400 }, 
        { name: 'Comidas', cost: 200 },
        { name: 'Uber/Taxi', cost: 50 },
        { name: 'Tours', cost: 100 },
        { name: 'Seguro Viaje', cost: 40 },
        { name: 'SIM Card/Data', cost: 20 },
        { name: 'Souvenirs', cost: 50 },
        { name: 'Visas/Trámites', cost: 30 },
        { name: 'Propinas', cost: 25 }
    ]},

    // 2. FESTIVAL
    festival: { label: '🎪 Festival', presets: [
        { name: 'Ticket Entrada', cost: 350 }, 
        { name: 'Bebidas/Alcohol', cost: 150 }, 
        { name: 'Outfit/Ropa', cost: 100 },
        { name: 'Locker', cost: 20 },
        { name: 'Transporte', cost: 40 },
        { name: 'Comida', cost: 50 },
        { name: 'Merch/Camiseta', cost: 45 },
        { name: 'Afterparty', cost: 60 },
        { name: 'Camping/Glamping', cost: 120 },
        { name: 'Glitters/Maquillaje', cost: 30 }
    ]},

    // 3. FIESTA
    party: { label: '🎉 Fiesta', presets: [
        { name: 'Cover/Entrada', cost: 30 }, 
        { name: 'Botella/Servicio', cost: 80 }, 
        { name: 'Uber/Conductor', cost: 40 },
        { name: 'Comida Bajón', cost: 25 },
        { name: 'Pre-Drinks', cost: 30 },
        { name: 'Hookah', cost: 40 },
        { name: 'Propinas', cost: 20 },
        { name: 'Guardarropa', cost: 10 },
        { name: 'Aporte Vaca', cost: 50 },
        { name: 'Kit Recuperación', cost: 15 }
    ]},

    // 4. CENA
    dinner: { label: '🍽️ Cena', presets: [
        { name: 'Plato Fuerte', cost: 80 }, 
        { name: 'Vino/Bebidas', cost: 60 }, 
        { name: 'Propina', cost: 30 },
        { name: 'Postre', cost: 20 },
        { name: 'Valet Parking', cost: 15 },
        { name: 'Entradas', cost: 25 },
        { name: 'Cócteles', cost: 40 },
        { name: 'Café', cost: 10 },
        { name: 'Uber Ida/Vuelta', cost: 35 },
        { name: 'Flores/Detalle', cost: 40 }
    ]},

    // 5. SHOPPING
    shopping: { label: '🛍️ Shopping', presets: [
        { name: 'Ropa', cost: 200 }, 
        { name: 'Zapatos', cost: 120 }, 
        { name: 'Comida Mall', cost: 25 },
        { name: 'Parqueadero', cost: 10 },
        { name: 'Accesorios', cost: 50 },
        { name: 'Tecnología', cost: 100 },
        { name: 'Decoración', cost: 60 },
        { name: 'Regalos', cost: 80 },
        { name: 'Cosméticos', cost: 45 },
        { name: 'Arreglos Ropa', cost: 20 }
    ]},

    // 6. ROAD TRIP
    roadtrip: { label: '🚗 Road Trip', presets: [
        { name: 'Gasolina', cost: 120 }, 
        { name: 'Peajes', cost: 40 }, 
        { name: 'Snacks/Mecato', cost: 35 },
        { name: 'Revisión Auto', cost: 60 },
        { name: 'Hotel Carretera', cost: 90 },
        { name: 'Almuerzo Camino', cost: 50 },
        { name: 'Música/Datos', cost: 15 },
        { name: 'Kit Emergencia', cost: 30 },
        { name: 'Paradas Café', cost: 20 },
        { name: 'Lavada Auto', cost: 15 }
    ]},

    // --- NUEVAS CATEGORÍAS ---

    // 7. CITA ROMÁNTICA
    date: { label: '💘 Cita', presets: [
        { name: 'Cine/Entradas', cost: 40 },
        { name: 'Cena Romántica', cost: 100 },
        { name: 'Flores/Ramo', cost: 50 },
        { name: 'Regalo Sorpresa', cost: 80 },
        { name: 'Chocolates', cost: 30 },
        { name: 'Uber Select', cost: 45 },
        { name: 'Vino Especial', cost: 60 },
        { name: 'Actividad (Bolos/Golf)', cost: 55 },
        { name: 'Helado/Postre', cost: 20 },
        { name: 'Hotel/Estadía', cost: 150 }
    ]},

    // 8. CONCIERTO
    concert: { label: '🎸 Concierto', presets: [
        { name: 'Boleta Entrada', cost: 180 },
        { name: 'Merch Oficial', cost: 60 },
        { name: 'Cervezas', cost: 50 },
        { name: 'Agua', cost: 10 },
        { name: 'Tapones Oídos', cost: 15 },
        { name: 'Parqueadero', cost: 30 },
        { name: 'Transporte', cost: 45 },
        { name: 'Comida Rápida', cost: 25 },
        { name: 'Meet & Greet', cost: 200 },
        { name: 'Locker/Guardarropa', cost: 15 }
    ]},

    // 9. DEPORTES / ESTADIO
    sports: { label: '⚽ Estadio', presets: [
        { name: 'Entrada Partido', cost: 100 },
        { name: 'Camiseta Equipo', cost: 90 },
        { name: 'Cervezas', cost: 45 },
        { name: 'Comida Estadio', cost: 35 },
        { name: 'Transporte', cost: 30 },
        { name: 'Apuesta', cost: 20 },
        { name: 'Souvenir', cost: 25 },
        { name: 'Pintura Cara', cost: 10 },
        { name: 'Parqueadero', cost: 25 },
        { name: 'Membresía Socio', cost: 50 }
    ]},

    // 10. NEGOCIOS
    business: { label: '💼 Negocios', presets: [
        { name: 'Vuelo', cost: 250 },
        { name: 'Hotel Ejecutivo', cost: 180 },
        { name: 'Cena Clientes', cost: 150 },
        { name: 'Uber/Transporte', cost: 60 },
        { name: 'Lavandería', cost: 30 },
        { name: 'Coworking Day', cost: 40 },
        { name: 'Datos/WiFi', cost: 20 },
        { name: 'Cafés Reuniones', cost: 35 },
        { name: 'Impresiones', cost: 15 },
        { name: 'Evento Networking', cost: 100 }
    ]}
};