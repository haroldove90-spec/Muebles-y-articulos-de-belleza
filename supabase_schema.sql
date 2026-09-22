-- ==============================================================================
-- PALACIO DE BELLEZA - ESQUEMA DE BASE DE DATOS PARA SUPABASE (ACTUALIZADO)
-- Incluye: is_active en Productos, Clientes y Proveedores + Tabla Profiles
-- ==============================================================================

-- 1. TABLA: PRODUCTOS E INVENTARIO
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0,
    wholesale_price NUMERIC(12, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 3,
    image TEXT,
    description TEXT,
    specs JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Si la tabla ya existía, asegurar la columna is_active
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. TABLA: CLIENTES Y SALONES DE BELLEZA
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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Si la tabla ya existía, asegurar la columna is_active
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. TABLA: PROVEEDORES Y FABRICANTES
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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Si la tabla ya existía, asegurar la columna is_active
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. TABLA: VENTAS Y TICKETS (POS)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    cashier_role TEXT NOT NULL,
    cashier_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_id TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_total NUMERIC(12, 2) DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    change_due NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'Completada',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLA: PERFILES DE USUARIO (DATOS PERSONALES Y FOTO POR ROL)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    store_name TEXT DEFAULT 'Palacio de Belleza - Sucursal Matriz',
    position TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_active ON public.customers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_folio ON public.sales(folio);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- SEGURIDAD (ROW LEVEL SECURITY) Y POLÍTICAS PÚBLICAS PARA POS CLIENT
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para Products
CREATE POLICY "Permitir lectura publica products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insercion publica products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica products" ON public.products FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir eliminacion publica products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- Políticas para Customers
CREATE POLICY "Permitir lectura publica customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insercion publica customers" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica customers" ON public.customers FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir eliminacion publica customers" ON public.customers FOR DELETE TO anon, authenticated USING (true);

-- Políticas para Suppliers
CREATE POLICY "Permitir lectura publica suppliers" ON public.suppliers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insercion publica suppliers" ON public.suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica suppliers" ON public.suppliers FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir eliminacion publica suppliers" ON public.suppliers FOR DELETE TO anon, authenticated USING (true);

-- Políticas para Sales
CREATE POLICY "Permitir lectura publica sales" ON public.sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insercion publica sales" ON public.sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica sales" ON public.sales FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir eliminacion publica sales" ON public.sales FOR DELETE TO anon, authenticated USING (true);

-- Políticas para Profiles
CREATE POLICY "Permitir lectura publica profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insercion publica profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir eliminacion publica profiles" ON public.profiles FOR DELETE TO anon, authenticated USING (true);

-- ==============================================================================
-- INSERCIÓN DE PERFILES PREESTABLECIDOS POR ROL
-- ==============================================================================
INSERT INTO public.profiles (id, role, name, email, phone, photo_url, store_name, position, bio)
VALUES
(
    'user-admin',
    'Admin',
    'Lic. Mariana Valdez',
    'administracion@palaciodebelleza.mx',
    '+52 55 4123 8900',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'Palacio de Belleza - Matriz',
    'Directora General y Administradora',
    'Responsable de compras corporativas, catálogo mayorista y gobierno de la plataforma.'
),
(
    'user-gerente',
    'Gerente',
    'Ing. Roberto Carvajal',
    'gerencia@palaciodebelleza.mx',
    '+52 55 8920 1144',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    'Palacio de Belleza - Matriz',
    'Gerente Operativo y de Sucursal',
    'Supervisión de piso, inventarios críticos, cumplimiento de metas diarias y arqueos de caja.'
),
(
    'user-pos',
    'Pos: ventas',
    'Ana Lucía Morales',
    'caja.mostrador@palaciodebelleza.mx',
    '+52 55 2390 4455',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    'Palacio de Belleza - Matriz',
    'Cajera Principal / Asesora de Ventas',
    'Atención al cliente en mostrador, facturación express y emisión de tickets térmicos.'
)
ON CONFLICT (role) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    photo_url = EXCLUDED.photo_url,
    store_name = EXCLUDED.store_name,
    position = EXCLUDED.position,
    bio = EXCLUDED.bio,
    updated_at = NOW();
