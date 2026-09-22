import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, ShoppingBag, Eye } from 'lucide-react';

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
        {/* Subtle Brand Watermark / Centered Logo Icon */}
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 md:w-28 md:h-28 mb-3 drop-shadow-lg">
            <svg viewBox="0 0 512 512" fill="none" className="w-full h-full">
              <defs>
                <linearGradient id="castleGradSel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2A9D" />
                  <stop offset="50%" stopColor="#E6007E" />
                  <stop offset="100%" stopColor="#B8005E" />
                </linearGradient>
              </defs>
              <circle cx="256" cy="256" r="240" fill="#FFFFFF" stroke="#E6007E" strokeWidth="8" />
              {/* Castle towers */}
              <path d="M128 150 L142 150 L142 165 L154 165 L154 150 L168 150 L168 165 L180 165 L180 150 L194 150 L194 180 L204 190 L204 330 L118 330 L118 190 L128 180 Z" fill="url(#castleGradSel)" />
              <path d="M318 150 L332 150 L332 165 L344 165 L344 150 L358 150 L358 165 L370 165 L370 150 L384 150 L384 180 L394 190 L394 330 L308 330 L308 190 L318 180 Z" fill="url(#castleGradSel)" />
              <polygon points="256,190 310,235 310,335 202,335 202,235" fill="#C20067" />
              <polygon points="256,202 298,238 298,330 214,330 214,238" fill="url(#castleGradSel)" />
              <rect x="242" y="255" width="28" height="42" rx="14" fill="#FFFFFF" />
              <rect x="146" y="200" width="22" height="34" rx="11" fill="#FFFFFF" />
              <rect x="344" y="200" width="22" height="34" rx="11" fill="#FFFFFF" />
              <polygon points="80,345 432,345 420,370 92,370" fill="#1E293B" stroke="#E6007E" strokeWidth="3" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-wide font-['Playfair_Display',serif]">
            PALACIO DE BELLEZA
          </h1>
          <p className="text-sm md:text-base text-[#E6007E] font-['Alex_Brush',cursive] italic mt-0.5">
            Muebles y artículos de belleza
          </p>
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
