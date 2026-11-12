import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pet, PetSize, PetAge } from '../types';
import { PetCard } from './PetCard';
import { DateRangeFilter, DATE_RANGE_OPTIONS, isWithinDateRange } from '../utils/dateFilter';
import { Heart, Clock } from 'lucide-react';

interface AdoptionsSectionProps {
  pets: Pet[];
  onOpenStoryCanvas: (pet: Pet) => void;
  onOpenDetail: (pet: Pet) => void;
  onMarkHappyEnding: (pet: Pet) => void;
  onOpenPublish: () => void;
}

export const AdoptionsSection: React.FC<AdoptionsSectionProps> = ({
  pets,
  onOpenStoryCanvas,
  onOpenDetail,
  onMarkHappyEnding,
  onOpenPublish,
}) => {
  const [selectedSize, setSelectedSize] = useState<PetSize | 'all'>('all');
  const [selectedAge, setSelectedAge] = useState<PetAge | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [onlyCastrated, setOnlyCastrated] = useState(false);
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);
  const [onlyKidFriendly, setOnlyKidFriendly] = useState(false);
  const [onlyUrgentTransit, setOnlyUrgentTransit] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<string>('all');

  const adoptionPets = useMemo(() => {
    return pets.filter((p) => p.status === 'adoption');
  }, [pets]);

  const shelters = useMemo(() => {
    const set = new Set<string>();
    adoptionPets.forEach((p) => {
      if (p.shelterName) set.add(p.shelterName);
    });
    return Array.from(set);
  }, [adoptionPets]);

  const filteredPets = useMemo(() => {
    return adoptionPets.filter((p) => {
      if (selectedSize !== 'all' && p.size !== selectedSize) return false;
      if (selectedAge !== 'all' && p.age !== selectedAge) return false;
      if (!isWithinDateRange(p, dateRange)) return false;
      if (onlyCastrated && !p.isCastrated) return false;
      if (onlyVaccinated && !p.isVaccinated) return false;
      if (onlyKidFriendly && !p.isKidFriendly) return false;
      if (onlyUrgentTransit && !p.isUrgentTransit) return false;
      if (selectedShelter !== 'all' && p.shelterName !== selectedShelter) return false;
      return true;
    });
  }, [
    adoptionPets,
    selectedSize,
    selectedAge,
    dateRange,
    onlyCastrated,
    onlyVaccinated,
    onlyKidFriendly,
    onlyUrgentTransit,
    selectedShelter,
  ]);

  const clearFilters = () => {
    setSelectedSize('all');
    setSelectedAge('all');
    setDateRange('all');
    setOnlyCastrated(false);
    setOnlyVaccinated(false);
    setOnlyKidFriendly(false);
    setOnlyUrgentTransit(false);
    setSelectedShelter('all');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Editorial Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-mono font-bold mb-2">
          <Heart className="w-3.5 h-3.5 fill-[#7C3AED]" />
          <span>SANTUARIO DE ADOPCIONES RESPONSABLES</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#111315] dark:text-white [text-wrap:balance]">
          Dales una segunda oportunidad en Venado Tuerto
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-2xl">
          Conectamos directamente a familias responsables con rescatistas y protectoras locales sin costos ni trabas burocráticas.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14171A] border border-black/8 dark:border-white/8 shadow-xs mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Size Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono text-neutral-500 font-semibold">Tamaño:</span>
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {(['all', 'small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 rounded-md font-display transition whitespace-nowrap ${
                    selectedSize === sz
                      ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {sz === 'all' ? 'Todos' : sz === 'small' ? 'Chico' : sz === 'medium' ? 'Mediano' : 'Grande'}
                </button>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono text-neutral-500 font-semibold">Edad:</span>
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {(['all', 'puppy', 'young', 'adult'] as const).map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setSelectedAge(ag)}
                  className={`px-2.5 py-1 rounded-md font-display transition whitespace-nowrap ${
                    selectedAge === ag
                      ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {ag === 'all' ? 'Todas' : ag === 'puppy' ? 'Cachorro' : ag === 'young' ? 'Joven' : 'Adulto'}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter (Todas, Últ. 24h, 7 días, 30 días) */}
          <div
            role="group"
            aria-label="Filtrar adopciones por rango de fecha"
            className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs"
          >
            <span className="pl-2 pr-1 text-neutral-400 flex items-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                className={`py-1 px-2.5 rounded-md font-mono transition whitespace-nowrap ${
                  dateRange === opt.id
                    ? 'bg-[#7C3AED] text-white font-bold shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>

          {/* Shelter Filter Dropdown */}
          {shelters.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-mono text-neutral-500 font-semibold">Refugio:</span>
              <select
                value={selectedShelter}
                onChange={(e) => setSelectedShelter(e.target.value)}
                aria-label="Filtrar por refugio o protectora"
                className="px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 text-xs font-display"
              >
                <option value="all">Todos los refugios</option>
                {shelters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Attribute Toggles */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCastrated}
                onChange={(e) => setOnlyCastrated(e.target.checked)}
                className="rounded text-[#7C3AED]"
              />
              <span>Castrado</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyVaccinated}
                onChange={(e) => setOnlyVaccinated(e.target.checked)}
                className="rounded text-[#7C3AED]"
              />
              <span>Vacunado</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyKidFriendly}
                onChange={(e) => setOnlyKidFriendly(e.target.checked)}
                className="rounded text-[#7C3AED]"
              />
              <span>Apto niños</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#FF4D38] font-semibold">
              <input
                type="checkbox"
                checked={onlyUrgentTransit}
                onChange={(e) => setOnlyUrgentTransit(e.target.checked)}
                className="rounded text-[#FF4D38]"
              />
              <span>🚨 Tránsito urgente</span>
            </label>
          </div>

          <span className="font-mono text-neutral-500">
            {filteredPets.length} {filteredPets.length === 1 ? 'mascota en adopción' : 'mascotas en adopción'}
          </span>
        </div>
      </div>

      {/* Grid of Adoptable Pets with Staggered Reveal */}
      {filteredPets.length > 0 ? (
        <motion.div
          key={`${selectedSize}-${selectedAge}-${dateRange}-${selectedShelter}-${onlyCastrated}-${onlyVaccinated}-${onlyKidFriendly}-${onlyUrgentTransit}`}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredPets.map((pet, idx) => (
              <PetCard
                key={pet.id}
                pet={pet}
                index={idx}
                onOpenStoryCanvas={onOpenStoryCanvas}
                onOpenDetail={onOpenDetail}
                onMarkHappyEnding={onMarkHappyEnding}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]">
          <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-[#111315] dark:text-white">
            No se encontraron mascotas en adopción con esos filtros o fechas
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Probá ampliar el rango de fechas o limpiar los filtros.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="py-2 px-4 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold"
            >
              Ver todas
            </button>
            <button
              type="button"
              onClick={onOpenPublish}
              className="py-2 px-4 rounded-xl bg-[#7C3AED] hover:bg-violet-700 text-white font-display font-semibold text-xs transition"
            >
              Publicar en Adopción
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
