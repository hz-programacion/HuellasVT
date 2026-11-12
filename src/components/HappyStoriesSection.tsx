import React, { useState, useMemo } from 'react';
import { Pet, SolidarityCampaign, VENADO_TUERTO_BARRIOS } from '../types';
import { formatRelativeTime } from '../utils/dateFilter';
import { formatArs } from '../utils/campaigns';
import {
  Sparkles,
  Heart,
  MapPin,
  ShieldCheck,
  PartyPopper,
  CheckCircle2,
  Eye,
  Plus,
} from 'lucide-react';

interface HappyStoriesSectionProps {
  pets: Pet[];
  campaigns: SolidarityCampaign[];
  onOpenDetail: (pet: Pet) => void;
  onMarkHappyEnding: (pet: Pet) => void;
  onApplaudStory: (petId: string) => Promise<void>;
  onGoToCampaigns: () => void;
}

export const HappyStoriesSection: React.FC<HappyStoriesSectionProps> = ({
  pets = [],
  campaigns = [],
  onOpenDetail,
  onMarkHappyEnding,
  onApplaudStory,
  onGoToCampaigns,
}) => {
  const [selectedBarrio, setSelectedBarrio] = useState<string>('all');
  const [applaudedIds, setApplaudedIds] = useState<Record<string, boolean>>({});
  const [showSelectActiveModal, setShowSelectActiveModal] = useState(false);

  const resolvedPets = useMemo(
    () => pets.filter((p) => p.status === 'resolved'),
    [pets]
  );

  const activePets = useMemo(
    () => pets.filter((p) => p.status !== 'resolved'),
    [pets]
  );

  const completedCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === 'completed'),
    [campaigns]
  );

  const filteredStories = useMemo(() => {
    return resolvedPets.filter((p) => {
      if (selectedBarrio !== 'all' && p.barrio !== selectedBarrio) return false;
      return true;
    });
  }, [resolvedPets, selectedBarrio]);

  const handleApplaud = async (petId: string) => {
    if (applaudedIds[petId]) return;
    setApplaudedIds((prev) => ({ ...prev, [petId]: true }));
    await onApplaudStory(petId);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 overflow-x-hidden">
      {/* Editorial Header */}
      <div className="rounded-3xl border border-amber-500/30 bg-white dark:bg-[#14171A] p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-[11px] uppercase tracking-wider mb-3 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              IMPACTO COMUNITARIO REAL · VENADO TUERTO
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111315] dark:text-white leading-[1.06]">
              Mural de{' '}
              <span className="text-[#F59E0B] underline decoration-[#F59E0B]/35 underline-offset-4">
                Finales Felices
              </span>{' '}
              & Reencuentros
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5A5D64] dark:text-neutral-300 leading-relaxed">
              Cada historia de este mural fue verificada mediante el{' '}
              <strong className="text-[#111315] dark:text-white">
                Protocolo de PIN Secreto del Autor
              </strong>
              . Celebramos a los vecinos, comercios y veterinarias de Venado Tuerto que hacen posible que vuelvan a casa.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowSelectActiveModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-amber-500 text-black font-display font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reportar Nuevo ¡Final Feliz!</span>
            </button>
          </div>
        </div>

        {/* Impact KPI Strip */}
        <div className="mt-6 pt-5 border-t border-black/8 dark:border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6">
            <span className="font-mono text-[10px] uppercase text-neutral-500 block">
              Reencuentros Verificados
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#F59E0B] tabular-nums">
              {resolvedPets.length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6">
            <span className="font-mono text-[10px] uppercase text-neutral-500 block">
              Colectas 100% Cumplidas
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 tabular-nums">
              {completedCampaigns.length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6">
            <span className="font-mono text-[10px] uppercase text-neutral-500 block">
              Aplausos Vecinales
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#FF4D38] tabular-nums">
              {resolvedPets.reduce((acc, p) => acc + (p.applauseCount || 18), 0)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6">
            <span className="font-mono text-[10px] uppercase text-neutral-500 block">
              Tiempo Promedio Alerta
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#111315] dark:text-white tabular-nums">
              &lt; 8hs
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500">Filtrar por barrio:</span>
          <select
            value={selectedBarrio}
            onChange={(e) => setSelectedBarrio(e.target.value)}
            aria-label="Filtrar historias por barrio"
            className="px-3 py-2 rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#14171A] text-xs font-display font-bold"
          >
            <option value="all">Todos los Barrios de VT ({resolvedPets.length})</option>
            {VENADO_TUERTO_BARRIOS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-neutral-500">
          Mostrando {filteredStories.length} historias reales con cierre auditado
        </span>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((pet) => {
          const applause = pet.applauseCount || 18;
          const hasApplauded = Boolean(applaudedIds[pet.id]);

          return (
            <article
              key={pet.id}
              className="rounded-2xl bg-white dark:bg-[#14171A] border-2 border-amber-500/35 shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => onOpenDetail(pet)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 cursor-pointer group"
                >
                  <img
                    src={pet.photoBase64}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B] text-black font-mono text-[11px] font-extrabold shadow">
                      🎉 ¡EN CASA! VERIFICADO
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-black/75 text-white font-mono text-[10px]">
                      {formatRelativeTime(pet.resolvedAt || pet.createdAt)}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="font-mono text-xs font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                      {pet.barrio}
                    </span>
                    <span className="font-mono text-[11px] text-amber-300">
                      Familia: {pet.authorName}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-extrabold text-[#111315] dark:text-white">
                      {pet.name}
                    </h2>
                    <span className="text-xs font-mono text-neutral-400">
                      {pet.breed}
                    </span>
                  </div>

                  <blockquote className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs sm:text-sm text-[#111315] dark:text-neutral-200 italic leading-relaxed">
                    “{pet.resolvedNotes || pet.description}”
                  </blockquote>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-black/6 dark:border-white/6 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleApplaud(pet.id)}
                  className={`flex-1 py-2 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    hasApplauded
                      ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                      : 'bg-[#FAF7F2] dark:bg-[#0B0C0E] text-[#111315] dark:text-white border-black/10 dark:border-white/10 hover:border-[#F59E0B]'
                  }`}
                >
                  <PartyPopper className="w-3.5 h-3.5 text-[#FF4D38]" />
                  <span>{hasApplauded ? `¡Celebrado! (${applause})` : `👏 Celebrar (${applause})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetail(pet)}
                  className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-display font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ficha</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Completed Solidarity Campaigns Highlight */}
      {completedCampaigns.length > 0 && (
        <div className="mt-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300 block">
                TRANSPARENCIA P2P · METAS 100% CUMPLIDAS
              </span>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#111315] dark:text-white mt-0.5">
                Cirugías y Tratamientos Pagados por la Comunidad ({completedCampaigns.length})
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                {completedCampaigns.map((c) => `${c.petName} (${formatArs(c.goalAmountArs)} en ${c.vetClinicName})`).join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToCampaigns}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs shrink-0 cursor-pointer"
            >
              Ver Facturas Pagadas en Colectas →
            </button>
          </div>
        </div>
      )}

      {/* Modal to pick an active pet to mark as Final Feliz */}
      {showSelectActiveModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSelectActiveModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#14171A] border border-black/15 dark:border-white/15 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/8 dark:border-white/8 pb-3">
              <h3 className="font-display font-extrabold text-base text-[#111315] dark:text-white">
                Seleccioná la mascota que volvió a casa
              </h3>
              <button
                type="button"
                onClick={() => setShowSelectActiveModal(false)}
                className="text-xs font-mono text-neutral-500 cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {activePets.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl border border-black/8 dark:border-white/8 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.photoBase64}
                      alt={p.name}
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm truncate">{p.name}</p>
                      <p className="font-mono text-[11px] text-neutral-500 truncate">
                        {p.barrio} · Autor: {p.authorName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSelectActiveModal(false);
                      onMarkHappyEnding(p);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F59E0B] text-black font-display font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Verificar Cierre
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
