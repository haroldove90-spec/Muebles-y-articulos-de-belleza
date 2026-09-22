import React from 'react';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { PWAInstallModal } from './PWAInstallModal';
import { LogOut, Shield, User, ShoppingBag, Menu, Database } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onOpenSupabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onLogout,
  onToggleSidebar,
  sidebarOpen,
  onOpenSupabase,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          bg: 'bg-pink-100 text-[#E6007E] border-pink-300',
          icon: <Shield className="w-3.5 h-3.5 text-[#E6007E]" />,
        };
      case 'Gerente':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <User className="w-3.5 h-3.5 text-purple-700" />,
        };
      case 'Pos: ventas':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />,
        };
      default:
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: <User className="w-3.5 h-3.5 text-sky-700" />,
        };
    }
  };

  const badge = getRoleBadge(currentRole);

  return (
    <header
      id="institutional-header"
      className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xs"
    >
      {/* Left: Hamburger (desktop/tablet toggle) + System Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir o cerrar menú lateral"
            className="p-2 rounded-xl text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition active:scale-95 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Logo size="md" showSubtitle={true} />
      </div>

      {/* Right: Active Role Identification, Quick PWA Install, and Logout Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Identificación del Rol Activo */}
        <div
          id="active-role-indicator"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${badge.bg}`}
        >
          {badge.icon}
          <span className="capitalize">{currentRole}</span>
        </div>

        {/* Botón de Enlace Supabase */}
        {onOpenSupabase && (
          <button
            id="supabase-status-btn"
            onClick={onOpenSupabase}
            title="Base de Datos Supabase"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Supabase</span>
          </button>
        )}

        {/* Botón de instalación rápida de la aplicación */}
        <div className="hidden sm:block">
          <PWAInstallModal buttonText="Instala Palacio de Belleza" variant="header" />
        </div>

        {/* Botón de Cierre de Sesión */}
        <button
          id="logout-button"
          onClick={onLogout}
          title="Cerrar sesión / Cambiar de rol"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
