import React from 'react';
import { Plus, Sun, Moon, Shield, Download, Search } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FAF7F2]/90 dark:bg-[#0B0C0E]/90 border-b border-black/8 dark:border-white/8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('radar')}
          className="text-left font-display font-extrabold text-xl tracking-tight text-[#111315] dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 group"
          aria-label="Ir al inicio de Huella VT"
        >
          <span className="w-8 h-8 rounded-lg bg-[#FF4D38] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition">
            🐾
          </span>
          <span className="tracking-tight">HUELLA VT</span>
        </button>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-display font-medium text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => onSelectTab('radar')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'radar'
                ? 'text-[#FF4D38] font-bold border-b-2 border-[#FF4D38]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Radar de Mascotas
          </button>

          <button
            onClick={() => onSelectTab('adoptions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'adoptions'
                ? 'text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Santuario Adopciones
          </button>

          <button
            onClick={() => onSelectTab('emergency')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'emergency'
                ? 'text-[#10B981] font-bold border-b-2 border-[#10B981]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Veterinarias 24hs
          </button>

          <button
            onClick={() => onSelectTab('directory')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'directory'
                ? 'text-[#F59E0B] font-bold border-b-2 border-[#F59E0B]'
                : 'hover:text-[#111315] dark:hover:text-white'
            }`}
          >
            Guía Comercial
          </button>
        </nav>

        {/* Zone 3: Primary Action + Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Command Palette Trigger (⌘K) */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Buscador rápido y paleta de comandos"
            title="Búsqueda rápida (⌘K / Ctrl+K)"
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-xs font-mono shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-medium">Buscar...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              aria-label="Instalar app en tu dispositivo"
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-black/10 dark:border-white/10 text-xs font-mono font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin shortcut button */}
          <button
            onClick={onOpenAdmin}
            aria-label="Panel de Administración"
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Panel de SuperAdmin"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenPublish}
            aria-label="Publicar mascota perdida o en adopción"
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#FF4D38] hover:bg-[#e03a26] text-white font-display font-bold text-xs shadow-md hover:shadow-lg transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Alerta</span>
          </button>
        </div>
      </div>
    </header>
  );
};

