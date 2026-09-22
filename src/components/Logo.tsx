import React from 'react';

export const LOGO_URL =
  'https://yioyruhnrcenyxkkgvun.supabase.co/storage/v1/object/public/Logo/palaciodebellezalogo.png';

export const APP_ICON_URL =
  'https://yioyruhnrcenyxkkgvun.supabase.co/storage/v1/object/public/Logo/palaciodebellezaicono.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
}) => {
  // Escalas de altura para mostrar el logotipo completo y proporcional (500x334) sin recortar ni encapsular
  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-32 md:h-40',
  };

  return (
    <img
      src={LOGO_URL}
      alt="Palacio de Belleza"
      className={`w-auto max-w-full object-contain select-none shrink-0 ${heightMap[size]} ${className}`}
      loading="eager"
    />
  );
};

