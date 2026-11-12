import React from 'react';
import { Radar, Heart, ShieldAlert, Store, Plus, HeartHandshake, Sparkles } from 'lucide-react';

interface FloatingBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPublish: () => void;
}

/**
 * Symmetrical 7-Column Mobile Navigation Bar:
 * 3 modules on the left (Radar, Adopción, Colectas)
 * + Central Action Button in the exact middle (Column 4)
 * 3 modules on the right (24hs SOS, Guía, Historias)
 */
export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenPublish,
}) => {
  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="lg:hidden fixed bottom-3 left-2 right-2 z-40 max-w-md mx-auto"
    >
      <div className="relative rounded-2xl bg-white/95 dark:bg-[#111315]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl px-1.5 py-1.5 grid grid-cols-7 items-center">
        {/* Left 1: Radar */}
        <button
          onClick={() => onSelectTab('radar')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition cursor-pointer ${
            currentTab === 'radar'
              ? 'text-[#FF4D38] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Radar className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-display mt-0.5 truncate max-w-full">Radar</span>
        </button>

        {/* Left 2: Adopción */}
        <button
          onClick={() => onSelectTab('adoptions')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition cursor-pointer ${
            currentTab === 'adoptions'
              ? 'text-[#7C3AED] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-display mt-0.5 truncate max-w-full">Adopción</span>
        </button>

        {/* Left 3: Colectas */}
        <button
          onClick={() => onSelectTab('campaigns')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition cursor-pointer ${
            currentTab === 'campaigns'
              ? 'text-[#059669] dark:text-[#34D399] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-display mt-0.5 truncate max-w-full">Colectas</span>
        </button>

        {/* Column 4 (EXACT CENTER): Elevated Magnetic-style Central CTA */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenPublish}
            aria-label="Publicar mascota"
            className="relative -top-3.5 w-11 h-11 rounded-full bg-[#FF4D38] hover:bg-[#e03a26] text-white flex items-center justify-center shadow-xl shadow-[#FF4D38]/40 border-4 border-[#FAF7F2] dark:border-[#0B0C0E] transition transform active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Right 1: 24hs SOS */}
        <button
          onClick={() => onSelectTab('emergency')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition cursor-pointer ${
            currentTab === 'emergency'
              ? 'text-[#10B981] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-display mt-0.5 truncate max-w-full">24hs SOS</span>
        </button>

        {/* Right 2: Guía */}
        <button
          onClick={() => onSelectTab('directory')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition cursor-pointer ${
            currentTab === 'directory'
              ? 'text-[#F59E0B] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-display mt-0.5 truncate max-w-full">Guía</span>
        </button>

        {/* Right 3: Historias (6th Module for Perfect Symmetry) */}
        <button
          onClick={() => onSelectTab('stories')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition cursor-pointer ${
            currentTab === 'stories'
              ? 'text-[#F59E0B] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-display mt-0.5 truncate max-w-full">Historias</span>
        </button>
      </div>
    </nav>
  );
};
