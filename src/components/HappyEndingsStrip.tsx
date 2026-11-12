import React from 'react';
import { Pet } from '../types';
import { Sparkles, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { formatRelativeTime } from '../utils/dateFilter';

interface HappyEndingsStripProps {
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
}

/**
 * Editorial Horizontal Showcase of Verified Happy Endings ("Muro de Reencuentros")
 * Celebrates pets in Venado Tuerto that returned home with verified ownership.
 */
export const HappyEndingsStrip: React.FC<HappyEndingsStripProps> = ({ pets, onSelectPet }) => {
  const resolvedPets = pets.filter((p) => p.status === 'resolved');
  if (resolvedPets.length === 0) return null;

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-white/80 to-emerald-500/10 dark:from-amber-500/10 dark:via-[#14171A] dark:to-emerald-500/10 p-5 sm:p-6 shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#F59E0B] text-black shadow-xs">
            <Sparkles className="w-4 h-4 fill-black" />
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
              Historias Verificadas en Venado Tuerto
            </span>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-[#111315] dark:text-white leading-tight">
              Reencuentros y Finales Felices de la Comunidad
            </h2>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verificados por sus dueños</span>
        </span>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {resolvedPets.map((pet) => (
          <div
            key={pet.id}
            role="button"
            tabIndex={0}
            data-cursor="VER HISTORIA"
            onClick={() => onSelectPet(pet)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPet(pet);
              }
            }}
            className="snap-start shrink-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0B0C0E] border border-amber-500/25 hover:border-[#F59E0B] p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
              <img
                src={pet.photoBase64}
                alt={pet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#F59E0B] text-black text-[9px] font-mono font-bold">
                🎉
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-display font-extrabold text-sm text-[#111315] dark:text-white truncate group-hover:text-[#F59E0B] transition">
                  {pet.name}
                </h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#F59E0B] shrink-0" />
              </div>

              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#F59E0B] shrink-0" />
                <span className="truncate">{pet.barrio}</span>
                <span>·</span>
                <span>{formatRelativeTime(pet.resolvedAt || pet.createdAt)}</span>
              </p>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-1.5 leading-snug italic">
                &ldquo;{pet.resolvedNotes || pet.description}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
