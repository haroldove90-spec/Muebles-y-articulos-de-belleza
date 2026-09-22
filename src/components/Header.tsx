import React from 'react';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { PWAInstallModal } from './PWAInstallModal';
import { LogOut, Shield, User, ShoppingBag, Menu, Database, Trash2 } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onOpenSupabase?: () => void;
  onOpenGlobalClear?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onLogout,
  onToggleSidebar,
  sidebarOpen,
  onOpenSupabase,
  onOpenGlobalClear,
  onOpenProfile,
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
  const canManageSystem = currentRole === 'Admin' || currentRole === 'Gerente';

  return (
    <header
      id="institutional-header"
      className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-xs gap-3"
    >
      {/* Left: System Logo + Desktop-Only Sidebar Toggle (hidden on mobile and tablet) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir o cerrar menú lateral"
            className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center min-w-0">
          <Logo size="md" className="h-9 sm:h-10 md:h-11" showSubtitle={true} />
        </div>
      </div>

      {/* Right: Active Role Badge, Desktop Management Tools, and Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Identificación del Rol Activo / Acceso Rápido a Perfil */}
        <button
          id="active-role-indicator"
          onClick={onOpenProfile}
          title="Ver y actualizar mi perfil de usuario"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border shrink-0 transition hover:opacity-90 active:scale-95 cursor-pointer ${badge.bg}`}
        >
          {badge.icon}
          <span className="capitalize">{currentRole}</span>
        </button>


        {/* Botón de Enlace Supabase (Exclusivo Admin/Gerente en pantallas amplias) */}
        {canManageSystem && onOpenSupabase && (
          <button
            id="supabase-status-btn"
            onClick={onOpenSupabase}
            title="Base de Datos Supabase"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase</span>
          </button>
        )}

        {/* Botón de Borrado Global del Sistema (Exclusivo Admin/Gerente en pantallas amplias) */}
        {canManageSystem && onOpenGlobalClear && (
          <button
            id="header-global-clear-btn"
            onClick={onOpenGlobalClear}
            title="Borrar registros de prueba de todo el sistema"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Borrado Global</span>
          </button>
        )}

        {/* Botón de instalación rápida de la aplicación (Visible solo en desktop para no saturar tablet/móvil) */}
        <div className="hidden lg:block">
          <PWAInstallModal buttonText="Instalar App" variant="header" />
        </div>

        {/* Botón de Cierre de Sesión */}
        <button
          id="logout-button"
          onClick={onLogout}
          title="Cerrar sesión / Cambiar de rol"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition active:scale-95 cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
