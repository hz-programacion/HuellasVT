import React from 'react';
import { Radar, Heart, ShieldAlert, Store, Plus } from 'lucide-react';

interface FloatingBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPublish: () => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenPublish,
}) => {
  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="lg:hidden fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto"
    >
      <div className="relative rounded-2xl bg-white/90 dark:bg-[#111315]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl px-3 py-2 flex items-center justify-between">
        <button
          onClick={() => onSelectTab('radar')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'radar'
              ? 'text-[#FF4D38] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Radar className="w-5 h-5" />
          <span className="text-[10px] font-display mt-0.5">Radar</span>
        </button>

        <button
          onClick={() => onSelectTab('adoptions')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'adoptions'
              ? 'text-[#7C3AED] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-display mt-0.5">Adopciones</span>
        </button>

        {/* Elevated Magnetic-style Central CTA */}
        <button
          onClick={onOpenPublish}
          aria-label="Publicar mascota"
          className="relative -top-4 w-12 h-12 rounded-full bg-[#FF4D38] hover:bg-[#e03a26] text-white flex items-center justify-center shadow-xl shadow-[#FF4D38]/40 border-4 border-[#FAF7F2] dark:border-[#0B0C0E] transition transform active:scale-95"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => onSelectTab('emergency')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'emergency'
              ? 'text-[#10B981] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-display mt-0.5">24hs SOS</span>
        </button>

        <button
          onClick={() => onSelectTab('directory')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'directory'
              ? 'text-[#F59E0B] font-bold'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-display mt-0.5">Comercios</span>
        </button>
      </div>
    </nav>
  );
};
