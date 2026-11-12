import React from 'react';
import { Pet } from '../types';
import { MatchResult } from '../utils/matching';
import { X, Zap, MessageCircle, MapPin, Calendar } from 'lucide-react';

interface SmartMatchModalProps {
  targetPet: Pet;
  matches: MatchResult[];
  onClose: () => void;
  onSelectPet?: (pet: Pet) => void;
}

export const SmartMatchModal: React.FC<SmartMatchModalProps> = ({
  targetPet,
  matches,
  onClose,
  onSelectPet,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detector de coincidencias inteligentes"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-2xl bg-white dark:bg-[#14171A] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-5 sm:p-6 text-[#111315] dark:text-[#EDEDED] max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Zap className="w-6 h-6 animate-bounce" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg">
                  Smart Match • Coincidencias en Venado Tuerto
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {matches.length} {matches.length === 1 ? 'coincidencia' : 'coincidencias'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Detectamos reportes con rasgos y ubicación compatibles para <strong>{targetPet.name}</strong> ({targetPet.barrio}).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detector"
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {matches.map(({ pet, matchScore, reasons }) => {
            const encodedMsg = encodeURIComponent(
              `Hola! Te escribo desde Huella VT respecto a ${pet.name || 'la mascota'} en ${pet.barrio}. Creo que podría coincidir con un reporte de ${targetPet.name}.`
            );
            const waLink = `https://wa.me/549${pet.authorWhatsApp.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;

            return (
              <div
                key={pet.id}
                className="p-4 rounded-xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E] hover:border-amber-500/40 transition group"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Photo */}
                  <div className="relative w-full sm:w-36 h-36 rounded-lg overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-800">
                    <img
                      src={pet.photoBase64}
                      alt={pet.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white font-mono text-[10px] font-bold">
                      {matchScore}% MATCH
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-bold text-base text-[#111315] dark:text-white">
                          {pet.name}
                        </h4>
                        <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {pet.status === 'found' ? '🟢 ENCONTRADO' : '🔴 PERDIDO'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <MapPin className="w-3.5 h-3.5" />
                          {pet.barrio}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          {pet.date}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 line-clamp-2">
                        {pet.description}
                      </p>

                      {/* Reasons badge cluster */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {reasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono bg-white dark:bg-[#14171A] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white font-display font-semibold text-xs transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Hablar con {pet.authorName} por WhatsApp
                      </a>
                      {onSelectPet && (
                        <button
                          onClick={() => {
                            onSelectPet(pet);
                            onClose();
                          }}
                          className="py-2 px-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-display font-medium text-xs transition"
                        >
                          Ver Ficha
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition"
          >
            Entendido, seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
};
