import React from 'react';
import { ActiveModule, UserRole } from '../types';
import { ShoppingCart, Store, Package, Users, Truck, ReceiptText } from 'lucide-react';

interface BottomBarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  currentRole: UserRole;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeModule,
  onSelectModule,
  currentRole,
}) => {
  // Pos: ventas has access to POS, Marketplace, Clientes, and Ventas
  const allModules: { id: ActiveModule; label: string; icon: React.ReactNode; allowedRoles: UserRole[] }[] = [
    {
      id: 'pos',
      label: 'POS',
      icon: <ShoppingCart className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Pos: ventas', 'Supervisor'],
    },
    {
      id: 'marketplace',
      label: 'Catálogo',
      icon: <Store className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Pos: ventas', 'Supervisor'],
    },
    {
      id: 'products',
      label: 'Inventario',
      icon: <Package className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Supervisor'],
    },
    {
      id: 'clientes' as any,
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Pos: ventas', 'Supervisor'],
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: <ReceiptText className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente', 'Pos: ventas', 'Supervisor'],
    },
    {
      id: 'suppliers',
      label: 'Proveedores',
      icon: <Truck className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Gerente'],
    },
  ];

  const visibleModules = allModules
    .filter((m) => m.allowedRoles.includes(currentRole))
    .slice(0, 5); // Clean 4-5 touch items for thumb zone

  return (
    <nav
      id="mobile-bottom-bar"
      aria-label="Navegación táctil móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-1 py-1.5 shadow-lg safe-bottom"
    >
      <div className="grid grid-flow-col auto-cols-fr gap-1 items-center max-w-lg mx-auto">
        {visibleModules.map((item) => {
          const targetId = item.id === ('clientes' as any) ? 'customers' : item.id;
          const isActive = activeModule === targetId;

          return (
            <button
              key={item.label}
              id={`bottom-nav-${item.label.toLowerCase()}`}
              onClick={() => onSelectModule(targetId)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-[#E6007E] font-bold bg-pink-50/70'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-0.5 truncate max-w-[70px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E6007E] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
