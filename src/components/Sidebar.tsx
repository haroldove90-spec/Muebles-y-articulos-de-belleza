import React from 'react';
import { ActiveModule, UserRole } from '../types';
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  ReceiptText,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  Trash2,
} from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  currentRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  onOpenSupabase?: () => void;
  onOpenGlobalClear?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  currentRole,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  onOpenSupabase,
  onOpenGlobalClear,
}) => {
  const menuItems: {
    id: ActiveModule;
    label: string;
    description: string;
    icon: React.ReactNode;
    allowedRoles: UserRole[];
  }[] = [
    {
      id: 'metrics',
      label: currentRole === 'Pos: ventas' ? 'Corte y Métricas' : 'Métricas',
      description:
        currentRole === 'Admin'
          ? 'KPIs e Inteligencia de Negocio'
          : currentRole === 'Gerente'
          ? 'Rendimiento y Metas de Tienda'
          : 'Arqueo de caja y turno hoy',
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Pos: ventas'],
    },
    {
      id: 'pos',
      label: 'Punto de Venta (POS)',
      description: 'Caja rápida y cobro táctil',
      icon: <ShoppingCart className="w-5 h-5" />,
      allowedRoles: ['Pos: ventas'], // SOLO rol Pos: Ventas
    },
    {
      id: 'products',
      label: 'Inventario y Productos',
      description: 'Altas, existencias y precios',
      icon: <Package className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente'], // Administrado por Gerente y Admin
    },
    {
      id: 'customers',
      label: 'Clientes y Salones',
      description: 'Directorio y cuentas mayoristas',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente'], // Administrado por Gerente y Admin
    },
    {
      id: 'suppliers',
      label: 'Proveedores',
      description: 'Fabricantes y distribuidores',
      icon: <Truck className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente'], // Administrado por Gerente y Admin
    },
    {
      id: 'sales',
      label: currentRole === 'Pos: ventas' ? 'Ventas del Día' : 'Historial de Ventas',
      description:
        currentRole === 'Pos: ventas'
          ? 'Tickets y ventas de tu turno'
          : 'Auditoría, cortes y cancelaciones',
      icon: <ReceiptText className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Pos: ventas'],
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Collapse Toggle */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>Módulos de Sistema</span>
          </div>
        )}
        <button
          id="sidebar-collapse-button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems
          .filter((item) => item.allowedRoles.includes(currentRole))
          .map((item) => {
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#E6007E] text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {item.label}
                    </p>
                    <p
                      className={`text-[11px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-pink-100' : 'text-slate-500'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
      </nav>

      {/* Bottom PWA Install, Supabase, and Logout */}
      <div className="p-3 border-t border-slate-200/90 space-y-2">
        {onOpenSupabase && (
          <button
            onClick={onOpenSupabase}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Base de Datos Supabase"
          >
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            {!isCollapsed && <span>Supabase Conectado</span>}
          </button>
        )}

        {onOpenGlobalClear && (
          <button
            id="sidebar-global-clear-btn"
            onClick={onOpenGlobalClear}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition active:scale-95 cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Borrar registros de prueba de todo el sistema"
          >
            <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
            {!isCollapsed && <span>Borrado Global</span>}
          </button>
        )}

        {!isCollapsed ? (
          <PWAInstallModal buttonText="Instala Palacio de Belleza" variant="sidebar" />
        ) : (
          <div className="flex justify-center">
            <PWAInstallModal buttonText="" variant="sidebar" />
          </div>
        )}

        <button
          id="sidebar-logout-button"
          onClick={onLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition active:scale-95 cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
