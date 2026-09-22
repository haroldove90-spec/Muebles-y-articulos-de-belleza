import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  inverted = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', title: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', title: 'text-lg md:text-xl', sub: 'text-xs' },
    lg: { icon: 'w-16 h-16', title: 'text-2xl md:text-3xl', sub: 'text-sm' },
    xl: { icon: 'w-24 h-24', title: 'text-3xl md:text-4xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Visual Castle Logo Emblem */}
      <div className={`relative shrink-0 ${currentSize.icon} flex items-center justify-center`}>
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="castleGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2A9D"/>
              <stop offset="45%" stopColor="#E6007E"/>
              <stop offset="100%" stopColor="#A50054"/>
            </linearGradient>
            <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155"/>
              <stop offset="50%" stopColor="#0F172A"/>
              <stop offset="100%" stopColor="#020617"/>
            </linearGradient>
          </defs>

          {/* Left Wing Tower */}
          <path d="M96 220 L130 220 L130 190 L140 190 L140 205 L150 205 L150 190 L160 190 L160 310 L96 310 Z" fill="url(#castleGradLogo)" stroke="#880044" strokeWidth="4"/>
          <rect x="112" y="235" width="16" height="24" rx="8" fill="#FFFFFF" stroke="#4A0429" strokeWidth="3"/>

          {/* Right Wing Tower */}
          <path d="M352 190 L362 190 L362 205 L372 205 L372 190 L382 190 L382 220 L416 220 L416 310 L352 310 Z" fill="url(#castleGradLogo)" stroke="#880044" strokeWidth="4"/>
          <rect x="384" y="235" width="16" height="24" rx="8" fill="#FFFFFF" stroke="#4A0429" strokeWidth="3"/>

          {/* Left Main Watchtower */}
          <path d="M128 110 L142 110 L142 125 L154 125 L154 110 L168 110 L168 125 L180 125 L180 110 L194 110 L194 140 L204 150 L204 320 L118 320 L118 150 L128 140 Z" fill="url(#castleGradLogo)" stroke="#FF6BB5" strokeWidth="4"/>
          <rect x="146" y="165" width="22" height="34" rx="11" fill="#FFFFFF" stroke="#4A0429" strokeWidth="3"/>
          <line x1="157" y1="165" x2="157" y2="199" stroke="#4A0429" strokeWidth="2.5"/>
          <line x1="146" y1="182" x2="168" y2="182" stroke="#4A0429" strokeWidth="2.5"/>

          {/* Right Main Watchtower */}
          <path d="M318 110 L332 110 L332 125 L344 125 L344 110 L358 110 L358 125 L370 125 L370 110 L384 110 L384 140 L394 150 L394 320 L308 320 L308 150 L318 140 Z" fill="url(#castleGradLogo)" stroke="#FF6BB5" strokeWidth="4"/>
          <rect x="344" y="165" width="22" height="34" rx="11" fill="#FFFFFF" stroke="#4A0429" strokeWidth="3"/>
          <line x1="355" y1="165" x2="355" y2="199" stroke="#4A0429" strokeWidth="2.5"/>
          <line x1="344" y1="182" x2="366" y2="182" stroke="#4A0429" strokeWidth="2.5"/>

          {/* Center Castle Main Gate / Wall */}
          <path d="M192 185 L208 185 L208 200 L224 200 L224 185 L240 185 L240 200 L256 200 L256 185 L272 185 L272 200 L288 200 L288 185 L304 185 L304 200 L320 200 L320 320 L192 320 Z" fill="url(#castleGradLogo)" stroke="#FF6BB5" strokeWidth="3"/>

          {/* Center Pavilion */}
          <polygon points="256,170 310,215 310,325 202,325 202,215" fill="#C20067" stroke="#FF4DA8" strokeWidth="3.5"/>
          <polygon points="256,182 298,218 298,320 214,320 214,218" fill="url(#castleGradLogo)"/>

          {/* Center Main Window */}
          <rect x="242" y="235" width="28" height="42" rx="14" fill="#FFFFFF" stroke="#4A0429" strokeWidth="3.5"/>
          <line x1="256" y1="235" x2="256" y2="277" stroke="#4A0429" strokeWidth="2.5"/>
          <line x1="242" y1="256" x2="270" y2="256" stroke="#4A0429" strokeWidth="2.5"/>

          {/* Base Platform */}
          <polygon points="60,335 452,335 440,365 72,365" fill="url(#pedestalGrad)" stroke="#E6007E" strokeWidth="3"/>
          <rect x="52" y="333" width="408" height="5" fill="#FF2A9D"/>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-black tracking-wider uppercase font-['Playfair_Display',serif] ${currentSize.title} ${
            inverted ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          Palacio <span className="text-[#E6007E]">de Belleza</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-medium tracking-normal italic font-['Alex_Brush',cursive,sans-serif] ${currentSize.sub} ${
              inverted ? 'text-pink-300' : 'text-[#D60072]'
            }`}
          >
            Muebles y artículos de belleza
          </span>
        )}
      </div>
    </div>
  );
};
