import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Pet, Sponsor, VENADO_TUERTO_BARRIOS } from '../types';
import { formatRelativeTime } from '../utils/dateFilter';
import {
  Search,
  X,
  MapPin,
  PhoneCall,
  Sparkles,
  Plus,
  Heart,
  ShieldAlert,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandPaletteModalProps {
  pets: Pet[];
  sponsors: Sponsor[];
  onClose: () => void;
  onSelectPet: (pet: Pet) => void;
  onSelectTab: (tab: 'radar' | 'adoptions' | 'campaigns' | 'emergency' | 'directory' | 'stories') => void;
  onOpenPublish: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  pets,
  sponsors,
  onClose,
  onSelectPet,
  onSelectTab,
  onOpenPublish,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cleanQuery = query.toLowerCase().trim();

  const matchedPets = useMemo(() => {
    if (!cleanQuery) return pets.slice(0, 4);
    return pets
      .filter((p) => {
        const hay = `${p.name} ${p.breed} ${p.color} ${p.barrio} ${p.addressOrReference} ${p.description}`.toLowerCase();
        return hay.includes(cleanQuery);
      })
      .slice(0, 5);
  }, [pets, cleanQuery]);

  const matchedSponsors = useMemo(() => {
    if (!cleanQuery) return sponsors.filter((s) => s.isOnDutyToday).slice(0, 2);
    return sponsors
      .filter((s) => {
        const hay = `${s.name} ${s.address} ${s.promoTitle} ${s.category}`.toLowerCase();
        return hay.includes(cleanQuery);
      })
      .slice(0, 3);
  }, [sponsors, cleanQuery]);

  const statusBadge = {
    lost: { text: 'PERDIDO', cls: 'bg-[#FF4D38] text-white' },
    found: { text: 'ENCONTRADO', cls: 'bg-[#10B981] text-white' },
    adoption: { text: 'ADOPCIÓN', cls: 'bg-[#7C3AED] text-white' },
    resolved: { text: 'EN CASA', cls: 'bg-[#F59E0B] text-white' },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscador rápido global Huella VT"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 pt-12 sm:pt-20 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl bg-white dark:bg-[#14171A] rounded-3xl border border-black/12 dark:border-white/15 shadow-2xl overflow-hidden text-[#111315] dark:text-[#EDEDED]"
      >
        {/* Top Search Input */}
        <div className="px-5 py-4 border-b border-black/8 dark:border-white/8 flex items-center gap-3 bg-[#FAF7F2] dark:bg-[#111315]">
          <Search className="w-5 h-5 text-[#FF4D38] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar mascota por nombre, barrio, color, veterinaria 24hs..."
            className="flex-1 bg-transparent text-sm sm:text-base font-display font-medium focus:outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-mono text-neutral-400 hover:text-black dark:hover:text-white px-2 py-1"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador rápido"
            className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-5 max-h-[68vh] overflow-y-auto space-y-5">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2">
              Acciones Directas en Venado Tuerto
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPublish();
                }}
                className="p-3 rounded-xl bg-[#FF4D38]/10 hover:bg-[#FF4D38]/20 border border-[#FF4D38]/25 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="p-2 rounded-lg bg-[#FF4D38] text-white">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-display font-bold text-xs block text-[#111315] dark:text-white">
                    Publicar Alerta
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">En 3 pasos</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('emergency');
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/25 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="p-2 rounded-lg bg-[#10B981] text-white">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-display font-bold text-xs block text-[#111315] dark:text-white">
                    Guardia 24hs SOS
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Urgencias hoy</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('adoptions');
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 border border-[#7C3AED]/25 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="p-2 rounded-lg bg-[#7C3AED] text-white">
                  <Heart className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-display font-bold text-xs block text-[#111315] dark:text-white">
                    Adoptar en VT
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Santuario</span>
                </div>
              </button>
            </div>
          </div>

          {/* Matched Pets */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2">
              {cleanQuery ? `Mascotas encontradas (${matchedPets.length})` : 'Alertas Recientes en Venado Tuerto'}
            </span>
            {matchedPets.length > 0 ? (
              <div className="space-y-2">
                {matchedPets.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectPet(pet);
                    }}
                    className="w-full p-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#0B0C0E] hover:bg-neutral-200/70 dark:hover:bg-neutral-800/80 border border-black/6 dark:border-white/6 flex items-center justify-between gap-3 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={pet.photoBase64}
                        alt={pet.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/10"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              statusBadge[pet.status].cls
                            }`}
                          >
                            {statusBadge[pet.status].text}
                          </span>
                          <span className="font-display font-bold text-sm text-[#111315] dark:text-white truncate">
                            {pet.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            · {formatRelativeTime(pet.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-neutral-500 truncate mt-0.5">
                          📍 {pet.barrio} · {pet.breed} ({pet.color})
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 font-mono py-3">
                No se encontraron mascotas con "{query}".
              </p>
            )}
          </div>

          {/* Matched Veterinary / Sponsors */}
          {matchedSponsors.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                Veterinarias de Guardia y Comercios Amigos
              </span>
              <div className="space-y-2">
                {matchedSponsors.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {s.isOnDutyToday && (
                          <span className="px-2 py-0.5 rounded bg-[#10B981] text-white text-[9px] font-mono font-bold">
                            GUARDIA 24HS
                          </span>
                        )}
                        <span className="font-display font-bold text-sm text-[#111315] dark:text-white truncate">
                          {s.name}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-500 truncate mt-0.5">
                        📍 {s.address} · 📞 {s.phone}
                      </p>
                    </div>
                    <a
                      href={`tel:${s.phone.replace(/[^0-9]/g, '')}`}
                      className="py-1.5 px-3 rounded-xl bg-[#10B981] text-white text-xs font-display font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Llamar</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#111315] flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>HUELLA VT · Red de Rescate y Adopción Vecinal</span>
          <span>ESC para cerrar</span>
        </div>
      </motion.div>
    </div>
  );
};
