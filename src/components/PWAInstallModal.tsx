import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';
import { APP_ICON_URL } from './Logo';

interface PWAInstallModalProps {
  buttonText?: string;
  variant?: 'header' | 'sidebar' | 'banner';
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  buttonText = 'Instala Palacio de Belleza',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled && !installedSuccess) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">App Instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        id="pwa-install-button"
        onClick={handleInstallClick}
        title="Instalar como App en Android, iOS o PC"
        className={`flex items-center gap-2 font-semibold text-xs md:text-sm rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer ${
          variant === 'header'
            ? 'bg-[#E6007E] hover:bg-[#D60072] text-white px-3.5 py-2'
            : 'w-full justify-center bg-pink-50 hover:bg-pink-100 text-[#E6007E] border border-pink-200 px-4 py-2.5'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="truncate">{buttonText}</span>
      </button>

      {/* Guidance Modal for iOS, Chrome, or Manual PWA install */}
      {showModal && (
        <div
          id="pwa-guide-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={APP_ICON_URL}
                  alt="Palacio de Belleza"
                  className="w-9 h-9 object-contain select-none"
                />
                <div>
                  <h3 className="text-base font-bold">Instalar Palacio de Belleza</h3>
                  <p className="text-xs text-slate-300">Punto de Venta Web Pro (PWA)</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-700 text-sm">
              <p className="font-medium text-[#1E293B]">
                Accede rápidamente sin barras de navegación y trabaja en modo táctil de pantalla completa:
              </p>

              {isIOS ? (
                <div className="space-y-3 bg-pink-50/60 p-4 rounded-xl border border-pink-100">
                  <div className="flex items-center gap-2 font-bold text-pink-900">
                    <Smartphone className="w-5 h-5 text-[#E6007E]" />
                    <span>En iPhone o iPad (Safari):</span>
                  </div>
                  <ol className="space-y-2 text-xs text-pink-950 pl-5 list-decimal">
                    <li>
                      Toca el botón <span className="font-bold inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-pink-200"><Share2 className="w-3 h-3" /> Compartir</span> en la barra inferior de Safari.
                    </li>
                    <li>
                      Desliza y selecciona <span className="font-bold inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-pink-200"><PlusSquare className="w-3 h-3" /> Agregar a pantalla de inicio</span>.
                    </li>
                    <li>
                      Presiona <strong>Agregar</strong> en la esquina superior derecha.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Laptop className="w-5 h-5 text-[#E6007E]" />
                    <span>En Android, Chrome o Edge (PC):</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-700 pl-5 list-decimal">
                    <li>
                      Presiona el ícono de <strong>Instalar</strong> en la barra de direcciones o menú del navegador (tres puntos ⋮).
                    </li>
                    <li>
                      Haz clic en <strong>&quot;Instalar Palacio de Belleza&quot;</strong>.
                    </li>
                    <li>
                      ¡Listo! La aplicación se abrirá como un programa de escritorio independiente.
                    </li>
                  </ol>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
