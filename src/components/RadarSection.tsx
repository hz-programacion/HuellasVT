import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pet, Sponsor, VENADO_TUERTO_BARRIOS } from '../types';
import { PetCard } from './PetCard';
import { SponsorInFeedCard } from './SponsorInFeedCard';
import { InteractiveMap } from './InteractiveMap';
import { HappyEndingsStrip } from './HappyEndingsStrip';
import { findSmartMatches } from '../utils/matching';
import { shouldInjectSponsorCard } from '../utils/sponsorRules';
import { DateRangeFilter, DATE_RANGE_OPTIONS, isWithinDateRange } from '../utils/dateFilter';
import { Search, MapPin, X, Clock, LayoutGrid, Map as MapIcon, Columns } from 'lucide-react';

interface RadarSectionProps {
  pets: Pet[];
  sponsors: Sponsor[];
  onOpenStoryCanvas: (pet: Pet) => void;
  onOpenSmartMatch: (pet: Pet) => void;
  onOpenDetail: (pet: Pet) => void;
  onMarkHappyEnding: (pet: Pet) => void;
  onOpenPublish: () => void;
}

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.02,
    },
  },
};

export const RadarSection: React.FC<RadarSectionProps> = ({
  pets,
  sponsors,
  onOpenStoryCanvas,
  onOpenSmartMatch,
  onOpenDetail,
  onMarkHappyEnding,
  onOpenPublish,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'lost' | 'found' | 'resolved'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [barrioFilter, setBarrioFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'both' | 'grid' | 'map'>('both');

  const activeSponsors = useMemo(() => {
    return sponsors.filter((s) => s.isActive);
  }, [sponsors]);

  const smartMatchesCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const pet of pets) {
      if (pet.status === 'lost') {
        const matches = findSmartMatches(pet, pets);
        map.set(pet.id, matches.length);
      }
    }
    return map;
  }, [pets]);

  // Filtered pet list (in-memory, instant 0-cost reads)
  const filteredPets = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return pets.filter((pet) => {
      if (statusFilter === 'all') {
        if (pet.status === 'adoption') return false;
      } else {
        if (pet.status !== statusFilter) return false;
      }

      if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
      if (barrioFilter !== 'all' && pet.barrio !== barrioFilter) return false;
      if (!isWithinDateRange(pet, dateRange)) return false;

      if (query) {
        const haystack = `${pet.name} ${pet.breed} ${pet.color} ${pet.description} ${pet.barrio} ${pet.collarInfo || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [pets, statusFilter, speciesFilter, barrioFilter, dateRange, searchQuery]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSpeciesFilter('all');
    setBarrioFilter('all');
    setDateRange('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    speciesFilter !== 'all' ||
    barrioFilter !== 'all' ||
    dateRange !== 'all' ||
    Boolean(searchQuery.trim());

  // Composite key triggers staggered reveal animation when any filter changes
  const staggerKey = `${statusFilter}-${speciesFilter}-${barrioFilter}-${dateRange}-${searchQuery}`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14171A] border border-black/8 dark:border-white/8 shadow-xs space-y-4">
        {/* Top Search Input, Barrio Dropdown & View Mode Switcher */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por color, raza, nombre, collar (ej. 'canela', 'caniche')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38] placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-3 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:w-60">
              <MapPin className="w-4 h-4 text-[#FF4D38] absolute left-3 top-3.5" />
              <select
                value={barrioFilter}
                onChange={(e) => setBarrioFilter(e.target.value)}
                aria-label="Filtrar por barrio de Venado Tuerto"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38] appearance-none font-mono"
              >
                <option value="all">📍 Todos los barrios de VT</option>
                {VENADO_TUERTO_BARRIOS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle (Grilla + Mapa / Grilla / Mapa) */}
            <div
              role="group"
              aria-label="Cambiar modo de visualización del radar"
              className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl shrink-0"
            >
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'both'
                    ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5 text-[#FF4D38]" />
                <span>Grilla + Mapa</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grilla</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Solo Mapa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row: Status, Date Range & Species */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-3 rounded-lg text-xs font-display font-semibold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('lost')}
              className={`py-1.5 px-3 rounded-lg text-xs font-display font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'lost'
                  ? 'bg-[#FF4D38] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>🔴</span>
              <span>Perdidos</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('found')}
              className={`py-1.5 px-3 rounded-lg text-xs font-display font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'found'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>🟢</span>
              <span>Encontrados</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`py-1.5 px-3 rounded-lg text-xs font-display font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-[#F59E0B] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>🎉</span>
              <span>Finales Felices</span>
            </button>
          </div>

          {/* Date Range Segmented Filter (Todas, Últ. 24h, 7 días, 30 días) */}
          <div
            role="group"
            aria-label="Filtrar por rango de fecha de publicación"
            className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
          >
            <span className="pl-2 pr-1 text-neutral-400 flex items-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer ${
                  dateRange === opt.id
                    ? 'bg-[#111315] text-white dark:bg-white dark:text-[#111315] font-bold shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>

          {/* Species Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => setSpeciesFilter('all')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-display font-medium transition whitespace-nowrap cursor-pointer ${
                speciesFilter === 'all'
                  ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Cualquiera
            </button>
            <button
              type="button"
              onClick={() => setSpeciesFilter('dog')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-display font-medium transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                speciesFilter === 'dog'
                  ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              🐶 Perros
            </button>
            <button
              type="button"
              onClick={() => setSpeciesFilter('cat')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-display font-medium transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                speciesFilter === 'cat'
                  ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              🐱 Gatos
            </button>
          </div>
        </div>

        {/* Status Summary Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 pt-1">
          <span>
            Mostrando <strong className="text-[#111315] dark:text-white">{filteredPets.length}</strong>{' '}
            {filteredPets.length === 1 ? 'reporte comunitario' : 'reportes comunitarios'} en caché local
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-mono text-[#FF4D38] hover:underline transition cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Interactive Leaflet + OpenStreetMap Radar (shown in 'both' or 'map' viewMode) */}
      {(viewMode === 'both' || viewMode === 'map') && (
        <InteractiveMap
          pets={filteredPets}
          sponsors={activeSponsors}
          onOpenDetail={onOpenDetail}
          onOpenStoryCanvas={onOpenStoryCanvas}
        />
      )}

      {/* Pet Cards Grid with Staggered Reveal & In-Feed Native Sponsor Insertion */}
      {(viewMode === 'both' || viewMode === 'grid') && (
        <>
          {filteredPets.length > 0 ? (
            <motion.div
              key={staggerKey}
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredPets.map((pet, index) => {
                  const matchCount = smartMatchesCountMap.get(pet.id) || 0;
                  const elements: React.ReactNode[] = [];

                  elements.push(
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      index={index}
                      hasMatches={matchCount > 0}
                      onOpenStoryCanvas={onOpenStoryCanvas}
                      onOpenSmartMatch={onOpenSmartMatch}
                      onOpenDetail={onOpenDetail}
                      onMarkHappyEnding={onMarkHappyEnding}
                    />
                  );

                  if (shouldInjectSponsorCard(index, 5) && activeSponsors.length > 0) {
                    const sponsorIndex = Math.floor(index / 5) % activeSponsors.length;
                    const sponsor = activeSponsors[sponsorIndex];
                    elements.push(
                      <SponsorInFeedCard
                        key={`in-feed-sponsor-${index}-${sponsor.id}`}
                        sponsor={sponsor}
                      />
                    );
                  }

                  return elements;
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]">
              <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-base text-[#111315] dark:text-white">
                No se encontraron reportes en ese rango de fechas o filtros
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Probá ampliar el rango de fechas a 7 o 30 días, o publicá una nueva alerta comunitaria.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="py-2 px-4 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold cursor-pointer"
                >
                  Ver todas las fechas
                </button>
                <button
                  type="button"
                  onClick={onOpenPublish}
                  className="py-2 px-4 rounded-xl bg-[#FF4D38] hover:bg-[#e03a26] text-white font-display font-semibold text-xs transition cursor-pointer"
                >
                  Publicar Alerta
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Horizontal Editorial Showcase of Verified Happy Endings */}
      <HappyEndingsStrip pets={pets} onSelectPet={onOpenDetail} />
    </section>
  );
};
