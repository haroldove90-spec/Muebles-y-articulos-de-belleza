-- ==============================================================================
-- PALACIO DE BELLEZA - SCRIPT SQL COMPLETO CON ARCHIVOS Y DATOS DE MUESTRA
-- Proyecto Supabase: yioyruhnrcenyxkkgvun
-- Descripción: Estructura de base de datos relacional para multi-sucursales,
--              inventarios por tienda, listas de precios fijas (P1, P2, P3),
--              roles independientes (Admin, Gerente, Pos: ventas),
--              fotografías en Base64, traslados y registro de ventas.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA DE SUCURSALES (Branches)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    manager_name TEXT,
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TABLA DE CUENTAS DE USUARIO Y CREDENCIALES POR SUCURSAL (User Accounts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Admin', 'Gerente', 'Pos: ventas'
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    branch_name TEXT,
    email TEXT,
    phone TEXT,
    photo_url TEXT, -- Almacena URL o Data URL Base64 de la fotografía
    position TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. TABLA DE PERFILES (Profiles - Compatibilidad directa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    photo_url TEXT,
    store_name TEXT,
    position TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. TABLA DE PRODUCTOS E INVENTARIO POR SUCURSAL (Products)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    price1 NUMERIC(12, 2),
    price2 NUMERIC(12, 2),
    price3 NUMERIC(12, 2),
    price_1 NUMERIC(12, 2),
    price_2 NUMERIC(12, 2),
    price_3 NUMERIC(12, 2),
    cost_price NUMERIC(12, 2) DEFAULT 0,
    wholesale_price NUMERIC(12, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 3,
    branch_stocks JSONB DEFAULT '{}'::jsonb, -- {'branch-1': 10, 'branch-2': 5, ...}
    image TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    specs JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TABLA DE CLIENTES Y SALONES (Customers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    tier TEXT DEFAULT 'Regular',
    address TEXT,
    notes TEXT,
    total_spent NUMERIC(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. TABLA DE PROVEEDORES (Suppliers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    category TEXT,
    city TEXT,
    credit_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. TABLA DE VENTAS Y TICKETS DE CAJA (Sales)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    cashier_role TEXT NOT NULL,
    cashier_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_id TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    branch_name TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_total NUMERIC(12, 2) DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    change_due NUMERIC(12, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Completada',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. TABLA DE TRASPASOS DE STOCK ENTRE SUCURSALES (Stock Transfers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_transfers (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    source_branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    source_branch_name TEXT NOT NULL,
    target_branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    target_branch_name TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    received_date TIMESTAMPTZ,
    reason TEXT,
    performed_by TEXT NOT NULL,
    received_by TEXT,
    status TEXT NOT NULL DEFAULT 'En tránsito', -- 'En tránsito', 'Recibido', 'Rechazado'
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ACTUALIZACIÓN Y COMPATIBILIDAD DE COLUMNAS (Para tablas que ya existían previamente)
-- Esto garantiza que las columnas como price1, price2, price3, branch_stocks, etc.
-- se agreguen de inmediato aunque la tabla ya haya sido creada con anterioridad.
-- ==============================================================================
-- Tabla: branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Tabla: user_accounts
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS branch_id TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS bio TEXT;

-- Tabla: profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Tabla: products (Garantiza listas de precios P1, P2, P3 e inventario por sucursal)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price1 NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price2 NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price3 NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_1 NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_2 NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_3 NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 3;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS branch_stocks JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs JSONB;

-- Tabla: customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Regular';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Tabla: suppliers
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS credit_days INTEGER DEFAULT 30;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Tabla: stock_transfers
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS received_date TIMESTAMPTZ;
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS performed_by TEXT;
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS received_by TEXT;
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'En tránsito';
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.stock_transfers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Tabla: sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS branch_id TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cashier_role TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cashier_name TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Completada';

-- ==============================================================================
-- SEGURIDAD: POLÍTICAS RLS (Row Level Security) PERMISIVAS PARA ACCESO FRONTEND
-- ==============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access branches" ON public.branches;
CREATE POLICY "Public access branches" ON public.branches FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access user_accounts" ON public.user_accounts;
CREATE POLICY "Public access user_accounts" ON public.user_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access products" ON public.products;
CREATE POLICY "Public access products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access customers" ON public.customers;
CREATE POLICY "Public access customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access suppliers" ON public.suppliers;
CREATE POLICY "Public access suppliers" ON public.suppliers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access sales" ON public.sales;
CREATE POLICY "Public access sales" ON public.sales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access stock_transfers" ON public.stock_transfers;
CREATE POLICY "Public access stock_transfers" ON public.stock_transfers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- ARCHIVOS / DATOS DE MUESTRA (Initial Sample Data)
-- ==============================================================================

-- 1. MUESTRAS DE SUCURSALES
INSERT INTO public.branches (id, name, code, address, phone, manager_name, is_main, is_active)
VALUES 
  ('branch-1', 'Sucursal 1 - Matriz (Principal)', 'SUC-01', 'Av. Principal 101, Col. Centro, CDMX', '+52 55 5555 0101', 'Emilio', true, true),
  ('branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'SUC-02', 'Plaza San Jerónimo Local 14, CDMX', '+52 55 5555 0202', 'Harold Anguiano', false, true),
  ('branch-3', 'Sucursal 3 - Insurgentes Sur', 'SUC-03', 'Av. Insurgentes Sur 1420, CDMX', '+52 55 5555 0303', 'Ana Lucía Morales', false, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  manager_name = EXCLUDED.manager_name,
  is_main = EXCLUDED.is_main,
  is_active = EXCLUDED.is_active;

-- 2. MUESTRAS DE USUARIOS Y CREDENCIALES
INSERT INTO public.user_accounts (id, username, password, name, role, branch_id, branch_name, email, phone, photo_url, position, bio)
VALUES
  ('user-admin-emilio', 'emilio', 'AdminPassword2026!', 'Emilio', 'Admin', 'branch-1', 'Sucursal 1 - Matriz (Principal)', 'emilio@palaciodebelleza.mx', '55-4123-9870', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350', 'Director General & Administrador', 'Supervisión ejecutiva, control financiero, gestión multisucursales y altas de personal.'),
  ('user-gerente-harold', 'harold', 'Gerente2026#', 'Harold Anguiano', 'Gerente', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'harold@palaciodebelleza.mx', '55-7890-1234', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350', 'Gerente Operativo de Sucursal', 'Supervisión de piso de ventas, clientes mayoristas e inventario en San Jerónimo.'),
  ('user-vendedor-sofia', 'ventas_matriz', 'Ventas2026!', 'Sofía Morales', 'Pos: ventas', 'branch-1', 'Sucursal 1 - Matriz (Principal)', 'sofia.caja@palaciodebelleza.mx', '55-8765-4321', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350', 'Ejecutiva de Mostrador & Cajera POS', 'Atención personalizada al cliente y cobros en punto de venta matriz.'),
  ('user-vendedor-carlos', 'ventas_sanjeronimo', 'Ventas2026!', 'Carlos Mendoza', 'Pos: ventas', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'carlos.ventas@palaciodebelleza.mx', '55-2233-4455', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=350', 'Vendedor de Mostrador POS', 'Ventas de mostrador y cobros en terminal POS San Jerónimo.'),
  ('user-gerente-analucia', 'gerente_insurgentes', 'Gerente2026#', 'Ana Lucía Morales', 'Gerente', 'branch-3', 'Sucursal 3 - Insurgentes Sur', 'analucia@palaciodebelleza.mx', '55-5555-0303', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350', 'Gerente de Sucursal Insurgentes', 'Encargada de operaciones y ventas de mobiliario en Insurgentes Sur.')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  photo_url = EXCLUDED.photo_url;

-- 3. MUESTRAS DE PRODUCTOS CON INVENTARIOS POR SUCURSAL Y PRECIOS P1, P2, P3
INSERT INTO public.products (id, name, sku, category, price, price1, price2, price3, price_1, price_2, price_3, cost_price, wholesale_price, stock, min_stock, branch_stocks, image, description, is_active)
VALUES
  (
    'prod-1', 'Sillón Hidráulico Reclinable Roma', 'MOB-SIL-01', 'Mobiliario', 
    6850, 6850, 6100, 5800, 6850, 6100, 5800, 4200, 6100, 
    8, 3, 
    '{"branch-1": 4, "branch-2": 3, "branch-3": 1}'::jsonb, 
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    'Sillón para corte y barba tapizado en vinil premium antibacterial con bomba hidráulica de uso rudo.', true
  ),
  (
    'prod-2', 'Lavacabezas Italiano Milano con Taza Basculante', 'MOB-LAV-02', 'Mobiliario', 
    11400, 11400, 10200, 9700, 11400, 10200, 9700, 7800, 10200, 
    5, 2, 
    '{"branch-1": 2, "branch-2": 2, "branch-3": 1}'::jsonb, 
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    'Mueble lavacabezas con tina basculante de cerámica blanca profunda y mezcladora monomando cromada.', true
  ),
  (
    'prod-3', 'Estación de Peinado París con Espejo LED Touch', 'MOB-EST-03', 'Mobiliario', 
    7900, 7900, 7200, 6800, 7900, 7200, 6800, 5100, 7200, 
    6, 2, 
    '{"branch-1": 3, "branch-2": 2, "branch-3": 1}'::jsonb, 
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    'Tocador flotante con cajón de seguridad y espejo con luz LED perimetral regulable cálida y fría.', true
  ),
  (
    'prod-4', 'Secadora Iónica Titanium Turbo 2400W', 'APA-SEC-01', 'Aparatos', 
    1850, 1850, 1600, 1500, 1850, 1600, 1500, 980, 1600, 
    14, 4, 
    '{"branch-1": 6, "branch-2": 5, "branch-3": 3}'::jsonb, 
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    'Motor AC italiano de larga duración, generador de iones negativos anti-frizz y cable de uso rudo de 3 metros.', true
  ),
  (
    'prod-5', 'Plancha Alaciadora Nano Titanium Digital 450°F', 'APA-PLA-02', 'Aparatos', 
    2150, 2150, 1890, 1790, 2150, 1890, 1790, 1200, 1890, 
    12, 4, 
    '{"branch-1": 5, "branch-2": 4, "branch-3": 3}'::jsonb, 
    'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=600&q=80',
    'Placas ultra lisas de titanio que transmiten calor instantáneo sin dañar la cutícula capilar.', true
  ),
  (
    'prod-6', 'Tinte Capilar Permanente Milano Color 90ml', 'TIN-MIL-01', 'Tintes y Cuidado', 
    145, 145, 115, 105, 145, 115, 105, 68, 115, 
    45, 10, 
    '{"branch-1": 20, "branch-2": 15, "branch-3": 10}'::jsonb, 
    'https://images.unsplash.com/photo-1562887189-e5d078343de4?auto=format&fit=crop&w=600&q=80',
    'Fórmula con micro-pigmentos y ceramidas. Cobertura del 100% de canas con brillo radiante.', true
  ),
  (
    'prod-7', 'Decolorante en Polvo Azul Ultra Lift 9 Tonos 500g', 'TIN-DEC-02', 'Tintes y Cuidado', 
    420, 420, 360, 335, 420, 360, 335, 230, 360, 
    22, 5, 
    '{"branch-1": 10, "branch-2": 8, "branch-3": 4}'::jsonb, 
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    'Polvo no volátil formulado con plex protector anti-quiebre para decoloraciones rubias platinadas.', true
  ),
  (
    'prod-8', 'Tratamiento Mascarilla Reconstructora Plex 1000ml', 'TIN-TRAT-03', 'Tintes y Cuidado', 
    680, 680, 580, 540, 680, 580, 540, 370, 580, 
    16, 5, 
    '{"branch-1": 7, "branch-2": 5, "branch-3": 4}'::jsonb, 
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    'Reconstructor molecular con colágeno hidrolizado y queratina pura para cabello procesado químicamente.', true
  ),
  (
    'prod-9', 'Lámpara LED/UV Smart Sensor 72W Secado Rápido', 'UNA-LAM-01', 'Uñas y Estética', 
    890, 890, 750, 710, 890, 750, 710, 480, 750, 
    18, 6, 
    '{"branch-1": 8, "branch-2": 6, "branch-3": 4}'::jsonb, 
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
    'Lámpara con sensor inteligente de movimiento y 4 temporizadores programables de curado para gel.', true
  ),
  (
    'prod-10', 'Máquina Clipper Inalámbrica Barber Master Pro', 'BAR-CLIP-01', 'Barbería', 
    2490, 2490, 2190, 2050, 2490, 2190, 2050, 1450, 2190, 
    9, 3, 
    '{"branch-1": 4, "branch-2": 3, "branch-3": 2}'::jsonb, 
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    'Cuchillas de titanio y cerámica con motor rotativo magnético silencioso de 7200 RPM.', true
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  price = EXCLUDED.price,
  price1 = EXCLUDED.price1,
  price2 = EXCLUDED.price2,
  price3 = EXCLUDED.price3,
  stock = EXCLUDED.stock,
  branch_stocks = EXCLUDED.branch_stocks,
  is_active = EXCLUDED.is_active;

-- 4. MUESTRAS DE CLIENTES
INSERT INTO public.customers (id, name, business_name, phone, email, tier, address, notes, total_spent, is_active)
VALUES
  ('cust-1', 'Brenda Alcaraz', 'Studio Glamour Peluquería', '55-3344-5566', 'brenda@studioglamour.com', 'Mayorista', 'Av. Insurgentes Sur 450, Int 3', 'Cliente VIP de mobiliario y tintes continuos.', 48900, true),
  ('cust-2', 'Lic. Roberto Valdés', 'Barbería Don Porfirio', '55-7788-9900', 'barberia.donporfirio@gmail.com', 'Mayorista', 'Calle Juárez 45, Centro Histórico', 'Requiere factura electrónica en todas las compras.', 32600, true),
  ('cust-3', 'Sofia Mendoza', 'Sofia Mendoza Nails & Lashes', '55-9012-7711', 'sofia.nails@gmail.com', 'Regular', 'Plaza Galerías Local 18', 'Prefiere entregas los días lunes.', 8400, true),
  ('cust-4', 'Claudia Estrada', 'Academia de Belleza Renacer', '55-1234-9988', 'direccion@academiarenacer.edu.mx', 'Mayorista', 'Calzada de Tlalpan 890', 'Compra por volumen para equipar salones de alumnas.', 96400, true),
  ('cust-5', 'Público General / Mostrador', 'Venta al Mostrador', '55-0000-0000', 'mostrador@palaciodebelleza.com', 'Regular', 'Venta en Tienda', 'Cliente genérico para ventas rápidas de paso.', 12200, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  total_spent = EXCLUDED.total_spent;

-- 5. MUESTRAS DE PROVEEDORES
INSERT INTO public.suppliers (id, company_name, contact_person, phone, email, category, city, credit_days, is_active)
VALUES
  ('sup-1', 'Muebles Spa & Salón de México S.A.', 'Ing. Roberto Fuentes', '55-5566-7788', 'ventas@mueblesspamexico.com', 'Mobiliario para Peluquería y Estética', 'Guadalajara, Jalisco', 30, true),
  ('sup-2', 'Cosmética Profesional Italiana D’Capelli', 'Paola Rossi', '55-9988-1122', 'pedidos@dcapellimx.com', 'Tintes, Decolorantes y Tratamientos Capilares', 'Ciudad de México', 45, true),
  ('sup-3', 'Aparatos & Tecnología Estética TecnoBeauty', 'Carlos Zambrano', '81-8344-9000', 'contacto@tecnobeauty.com', 'Secadoras, Planchas y Vaporizadores', 'Monterrey, N.L.', 15, true),
  ('sup-4', 'Glam Nails Imports & Acrylics', 'Valeria Wong', '55-4433-2211', 'distribucion@glamnails.com', 'Lámparas LED, Geles y Mobiliario de Uñas', 'León, Guanajuato', 30, true)
ON CONFLICT (id) DO UPDATE SET 
  company_name = EXCLUDED.company_name,
  phone = EXCLUDED.phone;

-- 6. MUESTRAS DE TRASPASOS DE STOCK
INSERT INTO public.stock_transfers (id, folio, source_branch_id, source_branch_name, target_branch_id, target_branch_name, product_id, product_name, product_sku, quantity, date, received_date, reason, performed_by, received_by, status)
VALUES
  ('trf-1', 'TRF-001', 'branch-1', 'Sucursal 1 - Matriz (Principal)', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'prod-6', 'Tinte Capilar Permanente Milano Color 90ml', 'TIN-MIL-01', 10, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Reabastecimiento urgente por demanda', 'Emilio (Admin)', 'Harold Anguiano (Gerente)', 'Recibido'),
  ('trf-2', 'TRF-002', 'branch-1', 'Sucursal 1 - Matriz (Principal)', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'prod-4', 'Secadora Iónica Titanium Turbo 2400W', 'APA-SEC-01', 3, NOW() - INTERVAL '3 hours', NULL, 'Stock para fin de semana', 'Emilio (Admin)', NULL, 'En tránsito')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  received_by = EXCLUDED.received_by;

-- 7. MUESTRAS DE VENTAS REALIZADAS (Sales)
INSERT INTO public.sales (id, folio, date, cashier_role, cashier_name, customer_name, customer_id, branch_id, branch_name, items, subtotal, discount_total, tax, total, payment_method, amount_paid, change_due, status)
VALUES
  (
    'sale-101', 'FOL-1001', NOW() - INTERVAL '1 day', 'Pos: ventas', 'Sandra Gómez', 'Brenda Alcaraz', 'cust-1', 'branch-1', 'Sucursal 1 - Matriz (Principal)',
    '[{"product": {"id": "prod-6", "name": "Tinte Capilar Permanente Milano Color 90ml", "price": 145, "price1": 145, "price2": 115, "price3": 105, "sku": "TIN-MIL-01"}, "quantity": 10, "unitPrice": 115, "subtotal": 1150, "priceTier": 2}]'::jsonb,
    1150.00, 0, 184.00, 1334.00, 'Tarjeta de Crédito / Débito', 1334.00, 0.00, 'Completada'
  ),
  (
    'sale-102', 'FOL-1002', NOW() - INTERVAL '4 hours', 'Pos: ventas', 'Ana Morales', 'Lic. Roberto Valdés', 'cust-2', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo',
    '[{"product": {"id": "prod-10", "name": "Máquina Clipper Inalámbrica Barber Master Pro", "price": 2490, "price1": 2490, "price2": 2190, "price3": 2050, "sku": "BAR-CLIP-01"}, "quantity": 1, "unitPrice": 2190, "subtotal": 2190, "priceTier": 2}]'::jsonb,
    2190.00, 0, 350.40, 2540.40, 'Efectivo', 2600.00, 59.60, 'Completada'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total = EXCLUDED.total;

