import React from 'react';
import { Plus, Sun, Moon, Shield, Download, Search, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPublish: () => void;
  onOpenCommandPalette: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenPublish,
  onOpenCommandPalette,
  isDark,
  onToggleTheme,
  onOpenAdmin,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden backdrop-blur-xl bg-[#FAF7F2]/90 dark:bg-[#0B0C0E]/90 border-b border-black/8 dark:border-white/8 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('radar')}
          className="text-left font-display font-extrabold text-base sm:text-xl tracking-tight text-[#111315] dark:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 group cursor-pointer"
          aria-label="Ir al inicio de Huella VT"
        >
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FF4D38] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm group-hover:scale-105 transition shrink-0">
            🐾
          </span>
          <span className="tracking-tight">HUELLA VT</span>
        </button>

        {/* Zone 2: Navigation Links (6 Balanced Modules on Desktop) */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-xs xl:text-sm font-display font-medium text-neutral-600 dark:text-neutral-300 min-w-0">
          <button
            onClick={() => onSelectTab('radar')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'radar'
                ? 'text-[#FF4D38] font-bold border-b-2 border-[#FF4D38]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Radar
          </button>

          <button
            onClick={() => onSelectTab('adoptions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'adoptions'
                ? 'text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Adopciones
          </button>

          <button
            onClick={() => onSelectTab('campaigns')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1 ${
              currentTab === 'campaigns'
                ? 'text-[#059669] dark:text-[#34D399] font-bold border-b-2 border-[#059669] dark:border-[#34D399]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            <span>Colectas</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] font-bold">
              P2P
            </span>
          </button>

          <button
            onClick={() => onSelectTab('emergency')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'emergency'
                ? 'text-[#10B981] font-bold border-b-2 border-[#10B981]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Veterinarias 24hs
          </button>

          <button
            onClick={() => onSelectTab('directory')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'directory'
                ? 'text-[#F59E0B] font-bold border-b-2 border-[#F59E0B]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Guía Comercial
          </button>

          <button
            onClick={() => onSelectTab('stories')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1 ${
              currentTab === 'stories'
                ? 'text-[#F59E0B] font-bold border-b-2 border-[#F59E0B]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Historias</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Utilities (Mobile-Safe, Zero Horizontal Overflow) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          {/* Quick Command Palette Trigger (⌘K) */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Buscador rápido y paleta de comandos"
            title="Búsqueda rápida (⌘K / Ctrl+K)"
            className="flex items-center justify-center gap-1.5 p-2 sm:py-1.5 sm:px-2.5 rounded-lg border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-xs font-mono shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-medium">Buscar</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              aria-label="Instalar app en tu dispositivo"
              className="hidden md:flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-mono font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-1.5 sm:p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shrink-0 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin shortcut button */}
          <button
            onClick={onOpenAdmin}
            aria-label="Panel de Administración"
            className="p-1.5 sm:p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shrink-0 cursor-pointer"
            title="Panel de SuperAdmin"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Primary CTA - Never clipped on mobile viewports */}
          <button
            onClick={onOpenPublish}
            aria-label="Publicar mascota perdida o en adopción"
            className="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl bg-[#FF4D38] hover:bg-[#e03a26] text-white font-display font-bold text-[11px] sm:text-xs shadow-md hover:shadow-lg transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span>Publicar Alerta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
