import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  X,
  ShieldCheck,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Product, Customer, Supplier, Sale, Branch } from '../types';

interface SupabaseModalProps {
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  branches?: Branch[];
  onDataLoadedFromSupabase: (data: {
    products?: Product[];
    customers?: Customer[];
    suppliers?: Supplier[];
    sales?: Sale[];
    branches?: Branch[];
  }) => void;
  onOpenGlobalClear?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  onClose,
  products,
  customers,
  suppliers,
  sales,
  branches = [],
  onDataLoadedFromSupabase,
  onOpenGlobalClear,
}) => {
  const [status, setStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Comprobando conexión con Supabase...',
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const sqlCode = `-- ==============================================================================
-- PALACIO DE BELLEZA - ESQUEMA COMPLETO Y ACTUALIZADO PARA SUPABASE
-- Proyecto: yioyruhnrcenyxkkgvun (Multi-sucursales, Roles, Credenciales y Traspasos)
-- ==============================================================================

-- 1. TABLA DE SUCURSALES (Multi-tienda y Matriz)
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    manager_name TEXT,
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABLA DE CUENTAS DE USUARIO Y CREDENCIALES POR SUCURSAL
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
    photo_url TEXT,
    position TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA DE PRODUCTOS (Con Precios P1, P2, P3 y Existencias por Sucursal)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    price1 NUMERIC(12, 2),
    price2 NUMERIC(12, 2),
    price3 NUMERIC(12, 2),
    cost_price NUMERIC(12, 2) DEFAULT 0,
    wholesale_price NUMERIC(12, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 3,
    branch_stocks JSONB DEFAULT '{}'::jsonb,
    image TEXT,
    description TEXT,
    specs JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA DE CLIENTES Y SALONES
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

-- 5. TABLA DE PROVEEDORES
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

-- 6. TABLA DE VENTAS Y TICKETS DE CAJA
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
    status TEXT DEFAULT 'Completada',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABLA DE TRASPASOS DE INVENTARIO ENTRE SUCURSALES
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
    quantity INTEGER NOT NULL,
    date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reason TEXT,
    performed_by TEXT NOT NULL
);

-- HABILITAR SEGURIDAD (RLS)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO
CREATE POLICY "Allow anon all branches" ON public.branches FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all user_accounts" ON public.user_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all suppliers" ON public.suppliers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all sales" ON public.sales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all stock_transfers" ON public.stock_transfers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- REGISTROS INICIALES DE SUCURSALES
INSERT INTO public.branches (id, name, code, address, phone, manager_name, is_main, is_active)
VALUES 
  ('branch-1', 'Sucursal 1 - Matriz (Principal)', 'SUC-01', 'Av. Principal 101, Col. Centro, CDMX', '+52 55 5555 0101', 'Emilio', true, true),
  ('branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'SUC-02', 'Plaza San Jerónimo Local 14, CDMX', '+52 55 5555 0202', 'Harold Anguiano', false, true),
  ('branch-3', 'Sucursal 3 - Insurgentes Sur', 'SUC-03', 'Av. Insurgentes Sur 1420, CDMX', '+52 55 5555 0303', 'Ana Lucía Morales', false, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  manager_name = EXCLUDED.manager_name;

-- REGISTROS INICIALES DE USUARIOS Y CREDENCIALES INDEPENDIENTES
INSERT INTO public.user_accounts (id, username, password, name, role, branch_id, branch_name, email, phone, position, bio)
VALUES
  ('user-admin-emilio', 'emilio', 'AdminPassword2026!', 'Emilio', 'Admin', 'branch-1', 'Sucursal 1 - Matriz (Principal)', 'emilio@palaciodebelleza.mx', '55-4123-9870', 'Director General & Administrador', 'Supervisión ejecutiva, control financiero, gestión multisucursales y altas de personal.'),
  ('user-gerente-harold', 'harold', 'Gerente2026#', 'Harold Anguiano', 'Gerente', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'harold@palaciodebelleza.mx', '55-7890-1234', 'Gerente Operativo de Sucursal', 'Supervisión de piso de ventas, clientes mayoristas e inventario en San Jerónimo.'),
  ('user-vendedor-sofia', 'ventas_matriz', 'Ventas2026!', 'Sofía Morales', 'Pos: ventas', 'branch-1', 'Sucursal 1 - Matriz (Principal)', 'sofia.caja@palaciodebelleza.mx', '55-8765-4321', 'Ejecutiva de Mostrador & Cajera POS', 'Atención personalizada al cliente y cobros en punto de venta matriz.'),
  ('user-vendedor-carlos', 'ventas_sanjeronimo', 'Ventas2026!', 'Carlos Mendoza', 'Pos: ventas', 'branch-2', 'Sucursal 2 - Plaza San Jerónimo', 'carlos.ventas@palaciodebelleza.mx', '55-2233-4455', 'Vendedor de Mostrador POS', 'Ventas de mostrador y cobros en terminal POS San Jerónimo.')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id;`;

  useEffect(() => {
    checkConn();
  }, []);

  const checkConn = async () => {
    setLoading(true);
    const res = await SupabaseService.checkConnection();
    setStatus(res);
    setLoading(false);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUploadToSupabase = async () => {
    setLoading(true);
    setSyncMessage(null);
    const ok = await SupabaseService.seedInitialData(products, customers, suppliers, sales, branches);
    setLoading(false);
    if (ok) {
      setSyncMessage('¡Datos sincronizados exitosamente a tu base de datos Supabase!');
      checkConn();
    } else {
      setSyncMessage('Error al sincronizar. Asegúrate de ejecutar el código SQL primero en Supabase.');
    }
  };

  const handlePullFromSupabase = async () => {
    setLoading(true);
    setSyncMessage(null);
    const [p, c, s, sa] = await Promise.all([
      SupabaseService.fetchProducts(),
      SupabaseService.fetchCustomers(),
      SupabaseService.fetchSuppliers(),
      SupabaseService.fetchSales(),
    ]);
    setLoading(false);

    if (p || c || s || sa) {
      onDataLoadedFromSupabase({
        products: p || undefined,
        customers: c || undefined,
        suppliers: s || undefined,
        sales: sa || undefined,
      });
      setSyncMessage('¡Datos actualizados desde Supabase!');
    } else {
      setSyncMessage('No se encontraron registros en Supabase o las tablas aún no se han creado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Configuración y Enlace Supabase</h3>
              <p className="text-xs text-slate-300 font-mono">ID: yioyruhnrcenyxkkgvun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              status.connected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            {status.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold">
                {status.connected ? 'Conexión Establecida con Supabase' : 'Verificando Configuración'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">{status.message}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                Host: https://yioyruhnrcenyxkkgvun.supabase.co
              </p>
            </div>
            <button
              onClick={checkConn}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-black/5 text-slate-600 transition"
              title="Revisar conexión"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {syncMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Instructions Step by Step */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#0F172A] text-sm flex items-center justify-between">
              <span>Paso a Paso: Ejecutar SQL en Supabase</span>
              <a
                href="https://supabase.com/dashboard/project/yioyruhnrcenyxkkgvun/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Abrir SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>
            <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <li>Abre el panel de tu proyecto en Supabase (<strong>yioyruhnrcenyxkkgvun</strong>).</li>
              <li>Entra a la pestaña <strong>SQL Editor</strong> en la barra lateral izquierda.</li>
              <li>Copia el script SQL de abajo con el botón <strong>Copiar SQL</strong>.</li>
              <li>Pega el código en una nueva consulta y haz clic en <strong>RUN</strong>.</li>
              <li>¡Listo! Tus tablas de productos, clientes, proveedores y ventas quedarán activas.</li>
            </ol>
          </div>

          {/* Code Viewer with Copy Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Script SQL de Creación y Permisos
              </span>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
              <code>{sqlCode}</code>
            </pre>
          </div>

          {/* Sync Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleUploadToSupabase}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir Datos Locales a Supabase</span>
            </button>

            <button
              onClick={handlePullFromSupabase}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar Desde Supabase</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {onOpenGlobalClear ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGlobalClear();
              }}
              className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Borrado global de registros de prueba"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrado Global de Pruebas</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
