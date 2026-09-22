-- ==============================================================================
-- PALACIO DE BELLEZA - ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- Proyecto ID: yioyruhnrcenyxkkgvun
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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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

-- 4. TABLA: VENTAS Y TICKETS (POS)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    cashier_role TEXT NOT NULL,
    cashier_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
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

-- ==============================================================================
-- ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_sales_folio ON public.sales(folio);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date DESC);

-- ==============================================================================
-- SEGURIDAD (ROW LEVEL SECURITY) Y POLÍTICAS PÚBLICAS PARA POS CLIENT
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

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

-- ==============================================================================
-- DATOS INICIALES (SEMILLA DEL CATÁLOGO DE PALACIO DE BELLEZA)
-- ==============================================================================

-- 1. Insertar Productos
INSERT INTO public.products (id, name, sku, category, price, cost_price, wholesale_price, stock, min_stock, image, description, specs)
VALUES
('prod-1', 'Sillón Hidráulico Roma Premium', 'PB-MOB-001', 'Mobiliario', 4850.00, 2900.00, 4200.00, 8, 2, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80', 'Sillón ergonómico de corte profesional con bomba hidráulica de uso rudo, rotación 360 grados y freno de bloqueo.', '{"warranty": "2 años de garantía en bomba", "dimensions": "95 x 65 x 85 cm", "hydraulic": true, "material": "Vinil antibacterial de alta resistencia"}'),
('prod-2', 'Lavacabezas Ergonómico Milán', 'PB-MOB-002', 'Mobiliario', 6200.00, 3800.00, 5400.00, 5, 2, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 'Lavacabezas con tina basculante de cerámica blanca esmaltada, grifería monomando cromada y asiento acojinado.', '{"warranty": "3 años en estructura y cerámica", "dimensions": "115 x 62 x 98 cm", "material": "Cerámica esmaltada y estructura de fibra"}'),
('prod-3', 'Secadora Profesional Ionic Turbo 3800', 'PB-APA-101', 'Aparatos', 1890.00, 1050.00, 1650.00, 15, 4, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 'Secadora de 2400W con tecnología de iones negativos para sellado de cutícula capilar.', '{"voltage": "110V - 127V", "warranty": "1 año", "power": "2400W"}'),
('prod-4', 'Plancha Titanium Pro Nano Glider', 'PB-APA-102', 'Aparatos', 1650.00, 920.00, 1420.00, 12, 3, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80', 'Placas de titanio ultra pulido de 1.25 pulgadas con calentamiento instantáneo hasta 450°F.', '{"voltage": "Bivoltaje 110-220V", "warranty": "1 año"}'),
('prod-5', 'Tinte Permanente Keratin Color 100ml', 'PB-TIN-201', 'Tintes y Cuidado', 125.00, 68.00, 98.00, 45, 10, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 'Coloración en crema con bajo contenido en amoníaco, enriquecido con keratina pura.', '{"volume": "100 ml", "origin": "Italia"}'),
('prod-6', 'Tratamiento Mascarilla Argán & Macadamia 1kg', 'PB-TIN-202', 'Tintes y Cuidado', 480.00, 260.00, 390.00, 20, 5, 'https://images.unsplash.com/photo-1608248597359-00204732152a?auto=format&fit=crop&w=600&q=80', 'Mascarilla intensiva reconstructora para cabello procesado o decolorado.', '{"volume": "1000 gr"}'),
('prod-7', 'Combo Apertura Salón Bronce', 'PB-COM-301', 'Combos y Promos', 11999.00, 7500.00, 10999.00, 3, 1, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80', 'Paquete ideal para salón nuevo: 1 Sillón Roma + 1 Secadora Turbo + 1 Plancha Titanium + Kit de 10 tintes.', '{"includes": "1 Sillón + 1 Secadora + 1 Plancha + 10 Tintes", "savings": "Ahorro del 18%"}'),
('prod-8', 'Lámpara UV/LED Nails Pro Sun X5 54W', 'PB-UNA-401', 'Uñas y Estética', 590.00, 310.00, 490.00, 18, 4, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', 'Lámpara de secado rápido para esmalte semipermanente, gel y acrílico con sensor infrarrojo inteligente.', '{"power": "54 Watts", "warranty": "6 meses"}')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Clientes
INSERT INTO public.customers (id, name, business_name, phone, email, tier, address, notes, total_spent)
VALUES
('cust-1', 'Brenda Alcaraz', 'Estudio Glamour VIP', '55-1234-5678', 'brenda@studioglamour.com', 'VIP', 'Av. Presidente Masaryk 340, Polanco, CDMX', 'Cliente frecuente de sillones y tintes premium', 48500.00),
('cust-2', 'Carlos Méndez', 'Barbería El Bigote Elegante', '55-9876-5432', 'carlos@elbigote.mx', 'Mayorista', 'Calle Orizaba 89, Col. Roma Norte, CDMX', 'Compra mobiliario y navajas al mayoreo', 32400.00),
('cust-3', 'Valeria Guzmán', 'Academia de Belleza Alta Moda', '55-4433-2211', 'direccion@altamoda.edu.mx', 'Mayorista', 'Calz. de Tlalpan 1890, CDMX', 'Equipamiento continuo para 40 alumnas', 67800.00),
('cust-4', 'Sofía Castillo', 'Studio Spa & Nails Sofía', '55-8899-7766', 'sofia@spasofia.com', 'Regular', 'Av. Universidad 1200, Coyoacán, CDMX', 'Compra productos de uñas y aparatos', 8900.00),
('cust-5', 'Público Mostrador', 'Mostrador General', '55-0000-0000', 'ventas@palaciodebelleza.com', 'Regular', 'Tienda Central Palacio de Belleza', 'Venta a clientes de paso sin cuenta', 12500.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Proveedores
INSERT INTO public.suppliers (id, company_name, contact_person, phone, email, category, city, credit_days, is_active)
VALUES
('sup-1', 'Muebles Spa & Salón de México S.A.', 'Ing. Roberto Fuentes', '55-5566-7788', 'ventas@mueblespasalon.com.mx', 'Mobiliario para Peluquería y Estética', 'Guadalajara, Jal.', 30, true),
('sup-2', 'Laboratorios Cosméticos Bellissima', 'Lic. Mariana Cordero', '55-3322-1100', 'pedidos@bellissima-lab.mx', 'Tintes, Decolorantes y Keratinas', 'Ciudad de México', 15, true),
('sup-3', 'Importadora Eléctricos BarberPro', 'Sr. Kenji Tanaka', '55-7788-9900', 'contacto@barberpro-import.com', 'Aparatos Eléctricos y Secadoras', 'Monterrey, N.L.', 45, true),
('sup-4', 'Distribuidora Golden Nails', 'Sra. Patricia Lugo', '55-6677-8899', 'ventas@goldennails.mx', 'Acrílicos, Geles y Lámparas UV', 'Puebla, Pue.', 30, true)
ON CONFLICT (id) DO NOTHING;
