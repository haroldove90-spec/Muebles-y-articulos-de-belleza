import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, ShoppingBag, Eye } from 'lucide-react';
import { LOGO_URL } from './Logo';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

interface RoleCardData {
  role: UserRole;
  icon: React.ReactNode;
  accentBorder: string;
  badgeBg: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  const rolesList: RoleCardData[] = [
    {
      role: 'Admin',
      icon: <ShieldCheck className="w-9 h-9 text-[#E6007E]" />,
      accentBorder: 'hover:border-[#E6007E] focus:border-[#E6007E]',
      badgeBg: 'bg-pink-50 text-[#E6007E]',
    },
    {
      role: 'Gerente',
      icon: <UserCheck className="w-9 h-9 text-purple-600" />,
      accentBorder: 'hover:border-purple-600 focus:border-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700',
    },
    {
      role: 'Pos: ventas',
      icon: <ShoppingBag className="w-9 h-9 text-emerald-600" />,
      accentBorder: 'hover:border-emerald-600 focus:border-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      role: 'Supervisor',
      icon: <Eye className="w-9 h-9 text-sky-600" />,
      accentBorder: 'hover:border-sky-600 focus:border-sky-600',
      badgeBg: 'bg-sky-50 text-sky-700',
    },
  ];

  return (
    <div
      id="role-selector-screen"
      className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Logotipo Oficial Completo sin encapsular */}
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <img
            src={LOGO_URL}
            alt="Palacio de Belleza"
            className="h-28 sm:h-36 md:h-44 w-auto max-w-full object-contain select-none drop-shadow-sm"
            loading="eager"
          />
        </div>

        {/* 
          Acceso por Roles en Inicio (Cuadrícula 2 Columnas Móvil / 4 Columnas Escritorio):
          Selector limpio con tarjetas independientes para cada rol. Sin header, sin descripciones, solo nombre del rol.
        */}

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {rolesList.map((item) => (
            <button
              key={item.role}
              id={`role-btn-${item.role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectRole(item.role)}
              className={`group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm transition-all duration-200 cursor-pointer active:scale-98 hover:shadow-lg ${item.accentBorder}`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${item.badgeBg}`}
              >
                {item.icon}
              </div>

              {/* Solo nombre del rol */}
              <span className="text-base sm:text-lg md:text-xl font-bold text-[#1E293B] group-hover:text-[#0F172A] text-center tracking-tight capitalize">
                {item.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
