import { Customer, Product, Supplier, Sale, Branch, StockTransfer } from '../types';

const RAW_PRODUCTS: Product[] = [
  // Mobiliario (Sillones, Lavacabezas, Estaciones) - Pastel Azul/Celeste
  {
    id: 'prod-1',
    sku: 'MOB-SIL-01',
    name: 'Sillón Hidráulico Reclinable Roma',
    category: 'Mobiliario',
    price: 6850,
    costPrice: 4200,
    wholesalePrice: 6100,
    stock: 8,
    minStock: 3,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    description: 'Sillón para corte y barba tapizado en vinil premium antibacterial con base circular cromada y bomba hidráulica de alta resistencia.',
    specs: {
      dimensions: '95cm x 65cm x 105cm',
      material: 'Vinil de uso rudo y acero inoxidable',
      warranty: '2 años de garantía',
      hydraulic: true,
    }
  },
  {
    id: 'prod-2',
    sku: 'MOB-LAV-02',
    name: 'Lavacabezas Italiano Milano con Taza Basculante',
    category: 'Mobiliario',
    price: 11400,
    costPrice: 7800,
    wholesalePrice: 10200,
    stock: 5,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    description: 'Mueble lavacabezas con tina basculante de cerámica blanca profunda, mezcladora monomando y sillón ergonómico acolchado.',
    specs: {
      dimensions: '120cm x 68cm x 98cm',
      material: 'Cerámica esmaltada y fibra de vidrio reforzada',
      warranty: '3 años de garantía',
      hydraulic: false,
    }
  },
  {
    id: 'prod-3',
    sku: 'MOB-EST-03',
    name: 'Estación de Peinado París con Espejo LED Touch',
    category: 'Mobiliario',
    price: 7900,
    costPrice: 5100,
    wholesalePrice: 7200,
    stock: 6,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Tocador flotante con cajón de seguridad, soporte para secadora y plancha, y espejo con luz LED perimetral regulable cálida y fría.',
    specs: {
      dimensions: '180cm x 80cm x 35cm',
      material: 'MDF texturizado anti-manchas y cristal templado',
      warranty: '1 año de garantía',
      hydraulic: false,
    }
  },
  {
    id: 'prod-4',
    sku: 'MOB-MAN-04',
    name: 'Mesa de Manicura Pro con Extractor Integrado',
    category: 'Mobiliario',
    price: 5400,
    costPrice: 3400,
    wholesalePrice: 4900,
    stock: 4,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=600&q=80',
    description: 'Mesa especializada para uñas con sistema extractor de polvo silencioso, reposamuñecas acolchado y repisas para esmaltes.',
    specs: {
      dimensions: '110cm x 48cm x 78cm',
      material: 'Cubierta de cuarzo resistente a acetona y patas metálicas',
      warranty: '1 año de garantía',
      voltage: '110V',
    }
  },
  {
    id: 'prod-5',
    sku: 'MOB-CAR-05',
    name: 'Carrito Auxiliar Metálico de 5 Bandejas',
    category: 'Mobiliario',
    price: 1850,
    costPrice: 1050,
    wholesalePrice: 1600,
    stock: 14,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=600&q=80',
    description: 'Carrito organizador rodante con ruedas silenciosas anti-cabello, portasecadora y charola lateral desmontable.',
    specs: {
      dimensions: '88cm x 38cm x 38cm',
      material: 'Polímero ABS de alto impacto y chasis de aluminio',
      warranty: '1 año',
    }
  },

  // Aparatos y Secadoras - Pastel Naranja / Terracota
  {
    id: 'prod-6',
    sku: 'APA-SEC-01',
    name: 'Secadora de Pedestal Iónica Digital 2200W',
    category: 'Aparatos',
    price: 4950,
    costPrice: 3100,
    wholesalePrice: 4400,
    stock: 7,
    minStock: 3,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    description: 'Secadora de casco con campana retráctil, temporizador digital y control de temperatura constante para secados uniformes.',
    specs: {
      voltage: '120V / 2200 Watts',
      material: 'Carcasa térmica de polímero aislante',
      warranty: '2 años de garantía directa',
    }
  },
  {
    id: 'prod-7',
    sku: 'APA-PLA-02',
    name: 'Plancha Profesional de Titanio NanoSilver',
    category: 'Aparatos',
    price: 2150,
    costPrice: 1250,
    wholesalePrice: 1850,
    stock: 19,
    minStock: 6,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80',
    description: 'Placas flotantes de titanio espejo con calentamiento instantáneo hasta 450°F, ideal para sellado de keratina y alaciados japoneses.',
    specs: {
      voltage: '110-240V Dual',
      warranty: '1 año de garantía',
    }
  },
  {
    id: 'prod-8',
    sku: 'APA-VAP-03',
    name: 'Vaporizador Facial con Generador de Ozono Spa',
    category: 'Aparatos',
    price: 3200,
    costPrice: 1900,
    wholesalePrice: 2800,
    stock: 3, // Low stock example!
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    description: 'Aparato para tratamientos faciales y limpiezas profundas con brazo giratorio 360° y compartimento para aceites esenciales aromáticos.',
    specs: {
      voltage: '110V',
      warranty: '1 año de garantía',
    }
  },

  // Tintes y Cuidado Capilar - Pastel Rosa / Púrpura
  {
    id: 'prod-9',
    sku: 'TIN-PACK-01',
    name: 'Pack 12 Tubos Tinte Italiano Sin Amoniaco con Argán',
    category: 'Tintes y Cuidado',
    price: 1380,
    costPrice: 780,
    wholesalePrice: 1150,
    stock: 32,
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    description: 'Gama de tonos rubios, castaños y fantasía con tecnología micro-pigmentaria y colágeno para máxima duración y brillo sedoso.',
  },
  {
    id: 'prod-10',
    sku: 'TIN-DEC-02',
    name: 'Polvo Decolorante Plex Ultra Aclarante 9 Tonos 500g',
    category: 'Tintes y Cuidado',
    price: 520,
    costPrice: 290,
    wholesalePrice: 440,
    stock: 24,
    minStock: 8,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    description: 'Fórmula no volátil enriquecida con aminoácidos que protege los enlaces capilares durante procesos de balayage.',
  },
  {
    id: 'prod-11',
    sku: 'TIN-SHA-03',
    name: 'Shampoo Botánico Reparación Intensa 1000ml (Salón Size)',
    category: 'Tintes y Cuidado',
    price: 480,
    costPrice: 240,
    wholesalePrice: 390,
    stock: 2, // Low stock!
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    description: 'Shampoo libre de sulfatos con biotina y té verde, diseñado para el lavado previo y post coloración en salón.',
  },

  // Combos y Promociones - Pastel Dorado / Violeta
  {
    id: 'prod-12',
    sku: 'CMB-SAL-01',
    name: 'Combo Emprendedor: Sillón Roma + Espejo París + Carrito',
    category: 'Combos y Promos',
    price: 14990,
    costPrice: 9500,
    wholesalePrice: 14200,
    stock: 4,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    description: 'Paquete de apertura de salón que incluye 1 sillón hidráulico Roma, 1 espejo con luz LED París y 1 carrito organizador.',
    specs: {
      warranty: '2 años integral',
    }
  },
  {
    id: 'prod-13',
    sku: 'CMB-LAV-02',
    name: 'Dúo Estilista: Lavacabezas Milano + Sillón Hidráulico',
    category: 'Combos y Promos',
    price: 16800,
    costPrice: 11200,
    wholesalePrice: 15900,
    stock: 3,
    minStock: 1,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    description: 'Conjunto armónico en vinil negro mate con costuras reforzadas y herrajes en cromo.',
  },

  // Uñas y Estética - Pastel Menta / Verde agua
  {
    id: 'prod-14',
    sku: 'UNA-LAM-01',
    name: 'Lámpara LED/UV Smart Sensor 72W Secado Rápido',
    category: 'Uñas y Estética',
    price: 890,
    costPrice: 480,
    wholesalePrice: 750,
    stock: 18,
    minStock: 6,
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
    description: 'Lámpara con temporizador automático de 10s, 30s, 60s y 99s modo baja temperatura para gel semipermanente.',
  },
  {
    id: 'prod-15',
    sku: 'UNA-KIT-02',
    name: 'Set Profesional 36 Colores Gel Semipermanente Colección Glam',
    category: 'Uñas y Estética',
    price: 1950,
    costPrice: 1050,
    wholesalePrice: 1650,
    stock: 0, // Out of stock example!
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
    description: 'Pigmentos ultra cubrientes con acabado brillante que no se descarapela por más de 21 días.',
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Sucursal 1 - Matriz (Principal)',
    code: 'SUC-01',
    address: 'Av. Principal 101, Col. Centro, CDMX',
    phone: '+52 55 5555 0101',
    managerName: 'Lic. Mariana Valdez',
    isMain: true,
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'branch-2',
    name: 'Sucursal 2 - Plaza San Jerónimo',
    code: 'SUC-02',
    address: 'Plaza San Jerónimo Local 14, CDMX',
    phone: '+52 55 5555 0202',
    managerName: 'Ing. Roberto Carvajal',
    isMain: false,
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'branch-3',
    name: 'Sucursal 3 - Insurgentes Sur',
    code: 'SUC-03',
    address: 'Av. Insurgentes Sur 1420, CDMX',
    phone: '+52 55 5555 0303',
    managerName: 'Ana Lucía Morales',
    isMain: false,
    isActive: true,
    createdAt: '2026-02-15T11:00:00Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => {
  const p1 = p.price;
  const p2 = p.wholesalePrice || Math.round(p.price * 0.9);
  const p3 = Math.round(p.price * 0.84);
  const s1 = Math.ceil(p.stock * 0.5);
  const s2 = Math.floor(p.stock * 0.3);
  const s3 = Math.max(0, p.stock - s1 - s2);
  return {
    ...p,
    price1: p1,
    price2: p2,
    price3: p3,
    branchStocks: {
      'branch-1': s1,
      'branch-2': s2,
      'branch-3': s3,
    },
  };
});

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Brenda Alcaraz',
    businessName: 'Studio Glamour Peluquería',
    phone: '55-3412-8890',
    email: 'brenda@studioglamour.com',
    tier: 'VIP',
    address: 'Av. Insurgentes Sur 1420, Col. Actipan, CDMX',
    notes: 'Compradora frecuente de tintes y mobiliario para renovación de sucursales.',
    totalSpent: 48500,
  },
  {
    id: 'cust-2',
    name: 'Marco Aurelio Sánchez',
    businessName: 'Barbería El Caballero',
    phone: '55-7821-4433',
    email: 'marco@barberiacaballero.com',
    tier: 'Mayorista',
    address: 'Calle Juárez 45, Centro Histórico',
    notes: 'Requiere factura electrónica con IVA desglosado.',
    totalSpent: 32600,
  },
  {
    id: 'cust-3',
    name: 'Sofia Mendoza',
    businessName: 'Sofia Mendoza Nails & Lashes',
    phone: '55-9012-7711',
    email: 'sofia.nails@gmail.com',
    tier: 'Regular',
    address: 'Plaza Galerías Local 18',
    notes: 'Prefiere entregas los días lunes.',
    totalSpent: 8400,
  },
  {
    id: 'cust-4',
    name: 'Claudia Estrada',
    businessName: 'Academia de Belleza Renacer',
    phone: '55-1234-9988',
    email: 'direccion@academiarenacer.edu.mx',
    tier: 'Mayorista',
    address: 'Calzada de Tlalpan 890',
    notes: 'Compra por volumen para equipar salones de práctica de alumnas.',
    totalSpent: 96400,
  },
  {
    id: 'cust-5',
    name: 'Público General / Mostrador',
    businessName: 'Venta al Mostrador',
    phone: 'Sin teléfono',
    email: 'mostrador@palaciodebelleza.com',
    tier: 'Regular',
    address: 'Venta en Tienda',
    notes: 'Cliente genérico para ventas rápidas.',
    totalSpent: 12200,
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'Muebles Spa & Salón de México S.A.',
    contactPerson: 'Ing. Roberto Fuentes',
    phone: '55-5566-7788',
    email: 'ventas@mueblesspamexico.com',
    category: 'Mobiliario para Peluquería y Estética',
    city: 'Guadalajara, Jalisco',
    creditDays: 30,
    isActive: true,
  },
  {
    id: 'sup-2',
    companyName: 'Cosmética Profesional Italiana D’Capelli',
    contactPerson: 'Paola Rossi',
    phone: '55-9988-1122',
    email: 'pedidos@dcapellimx.com',
    category: 'Tintes, Decolorantes y Tratamientos Capilares',
    city: 'Ciudad de México',
    creditDays: 45,
    isActive: true,
  },
  {
    id: 'sup-3',
    companyName: 'Aparatos & Tecnología Estética TecnoBeauty',
    contactPerson: 'Carlos Zambrano',
    phone: '81-8344-9000',
    email: 'contacto@tecnobeauty.com',
    category: 'Secadoras, Planchas y Vaporizadores',
    city: 'Monterrey, N.L.',
    creditDays: 15,
    isActive: true,
  },
  {
    id: 'sup-4',
    companyName: 'Glam Nails Imports & Acrylics',
    contactPerson: 'Valeria Wong',
    phone: '55-4433-2211',
    email: 'distribucion@glamnails.com',
    category: 'Lámparas LED, Geles y Mobiliario de Uñas',
    city: 'León, Guanajuato',
    creditDays: 30,
    isActive: true,
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    folio: 'PB-1048',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    cashierRole: 'Pos: ventas',
    cashierName: 'Cajero Turno Matutino',
    customerName: 'Brenda Alcaraz (Studio Glamour)',
    customerId: 'cust-1',
    branchId: 'branch-1',
    branchName: 'Sucursal 1 - Matriz (Principal)',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 6850,
      },
      {
        product: INITIAL_PRODUCTS[8],
        quantity: 2,
        unitPrice: 1380,
      }
    ],
    subtotal: 9610,
    discountTotal: 400,
    tax: 1473.6,
    total: 10683.6,
    paymentMethod: 'Tarjeta de Crédito / Débito',
    amountPaid: 10683.6,
    changeDue: 0,
    status: 'Completada',
  },
  {
    id: 'sale-102',
    folio: 'PB-1049',
    date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    cashierRole: 'Pos: ventas',
    cashierName: 'Cajero Turno Matutino',
    customerName: 'Público General / Mostrador',
    customerId: 'cust-5',
    branchId: 'branch-1',
    branchName: 'Sucursal 1 - Matriz (Principal)',
    items: [
      {
        product: INITIAL_PRODUCTS[6],
        quantity: 1,
        unitPrice: 2150,
      }
    ],
    subtotal: 2150,
    discountTotal: 0,
    tax: 344,
    total: 2494,
    paymentMethod: 'Efectivo',
    amountPaid: 2500,
    changeDue: 6,
    status: 'Completada',
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'trf-1',
    folio: 'TRF-001',
    sourceBranchId: 'branch-1',
    sourceBranchName: 'Sucursal 1 - Matriz (Principal)',
    targetBranchId: 'branch-2',
    targetBranchName: 'Sucursal 2 - Plaza San Jerónimo',
    productId: 'prod-1',
    productName: 'Sillón Hidráulico Reclinable Roma',
    productSku: 'MOB-SIL-01',
    quantity: 2,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reason: 'Reabastecimiento de piso de venta para fin de semana',
    performedBy: 'Administrador General',
  },
  {
    id: 'trf-2',
    folio: 'TRF-002',
    sourceBranchId: 'branch-1',
    sourceBranchName: 'Sucursal 1 - Matriz (Principal)',
    targetBranchId: 'branch-3',
    targetBranchName: 'Sucursal 3 - Insurgentes Sur',
    productId: 'prod-7',
    productName: 'Secadora Profesional Iónica Turbonegra 3900',
    productSku: 'APA-SEC-01',
    quantity: 3,
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reason: 'Traspaso por pedido urgente de cliente mayorista',
    performedBy: 'Lic. Mariana Valdez',
  }
];

