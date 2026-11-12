import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2, Sparkles, Monitor } from 'lucide-react';

const DISMISS_STORAGE_KEY = 'huella_vt_pwa_banner_dismissed';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(DISMISS_STORAGE_KEY) === '1';
    }
    return false;
  });
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : 'android'
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, '1');
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <div
        role="region"
        aria-label="Instalar aplicación web progresiva Huella VT"
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-[#14171A]/90 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-[#FF4D38]/40">
          {/* Subtle left glow */}
          <div
            className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-[#FF4D38]/10 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#111315] dark:bg-white text-white dark:text-[#111315] flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5 text-[#FF4D38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs sm:text-sm text-[#111315] dark:text-white">
                  Instalar App Huella VT en tu pantalla de inicio
                </span>
                <span className="hidden md:inline-block text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  · Acceso rápido Offline & SOS 24hs
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug mt-0.5">
                Recibí visibilidad inmediata de alertas urgentes en tu barrio sin ocupar memoria en tu teléfono.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#111315] hover:bg-[#FF4D38] text-white dark:bg-white dark:text-[#111315] dark:hover:bg-[#FF4D38] dark:hover:text-white font-display font-bold text-xs transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Ocultar aviso de instalación"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Guided PWA Installation Modal */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cómo instalar Huella VT en tu dispositivo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-[#14171A] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-6 text-[#111315] dark:text-[#EDEDED]">
            <div className="flex items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF4D38] text-white flex items-center justify-center font-bold text-lg shadow-md">
                  🐾
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg leading-tight">
                    Instalar Huella VT (Web App)
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Acceso directo sin pasar por tiendas de aplicaciones
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Cerrar guía de instalación"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl my-4">
              <button
                type="button"
                onClick={() => setSelectedPlatform('android')}
                className={`py-2 px-2 rounded-lg text-xs font-display font-semibold transition ${
                  selectedPlatform === 'android'
                    ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform('ios')}
                className={`py-2 px-2 rounded-lg text-xs font-display font-semibold transition ${
                  selectedPlatform === 'ios'
                    ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                iPhone / Safari
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform('desktop')}
                className={`py-2 px-2 rounded-lg text-xs font-display font-semibold transition ${
                  selectedPlatform === 'desktop'
                    ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                PC / Mac
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 my-4 text-xs sm:text-sm">
              {selectedPlatform === 'android' && (
                <>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/5 dark:border-white/5 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#FF4D38]">01.</span>
                    <p>
                      Tocá el ícono de menú <strong>(⋮ tres puntos)</strong> en la esquina superior derecha de Chrome.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/5 dark:border-white/5 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#FF4D38]">02.</span>
                    <p>
                      Seleccioná <strong>&ldquo;Instalar aplicación&rdquo;</strong> o <strong>&ldquo;Agregar a la pantalla principal&rdquo;</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>El ícono de Huella VT aparecerá junto a tus apps con guardia 24hs a 1 clic.</span>
                  </div>
                </>
              )}

              {selectedPlatform === 'ios' && (
                <>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/5 dark:border-white/5 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#FF4D38]">01.</span>
                    <p className="flex-1">
                      En la barra inferior de Safari, tocá el botón <strong>Compartir</strong>{' '}
                      <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" />.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/5 dark:border-white/5 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#FF4D38]">02.</span>
                    <p className="flex-1">
                      Deslizá hacia abajo y elegí <strong>&ldquo;Agregar a Inicio&rdquo;</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-neutral-500 mx-0.5" />.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Se abrirá a pantalla completa igual que una app nativa de iOS.</span>
                  </div>
                </>
              )}

              {selectedPlatform === 'desktop' && (
                <>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/5 dark:border-white/5 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#FF4D38]">01.</span>
                    <p className="flex-1">
                      En la barra de direcciones de Chrome o Edge, hacé clic en el ícono de <strong>Instalar</strong>{' '}
                      <Monitor className="w-3.5 h-3.5 inline text-neutral-500 mx-0.5" /> a la derecha de la URL.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Ideal para veterinarias, refugios y voluntarios que monitorean el radar.</span>
                  </div>
                </>
              )}
            </div>

            {installSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>¡Instalación iniciada con éxito!</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#111315] hover:bg-black text-white dark:bg-white dark:text-[#111315] font-display font-bold text-xs transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
