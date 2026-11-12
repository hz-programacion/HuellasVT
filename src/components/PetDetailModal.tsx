import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pet } from '../types';
import { formatRelativeTime } from '../utils/dateFilter';
import { validateAndFormatWhatsApp } from '../utils/security';
import { resolvePetCoordinates } from '../utils/venadoTuertoCoords';
import {
  X,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  ExternalLink,
  Zap,
  Copy,
  Check,
  Clock,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface PetDetailModalProps {
  pet: Pet;
  matchCount?: number;
  onClose: () => void;
  onOpenStoryCanvas: (pet: Pet) => void;
  onOpenSmartMatch?: (pet: Pet) => void;
  onMarkHappyEnding: (pet: Pet) => void;
}

export const PetDetailModal: React.FC<PetDetailModalProps> = ({
  pet,
  matchCount = 0,
  onClose,
  onOpenStoryCanvas,
  onOpenSmartMatch,
  onMarkHappyEnding,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [fitContain, setFitContain] = useState(false);

  const statusMeta = {
    lost: {
      label: 'SE BUSCA · PERDIDO',
      bg: 'bg-[#FF4D38] text-white',
      accentText: 'text-[#FF4D38]',
    },
    found: {
      label: 'ENCONTRADO EN TRÁNSITO',
      bg: 'bg-[#10B981] text-white',
      accentText: 'text-[#10B981]',
    },
    adoption: {
      label: 'EN ADOPCIÓN RESPONSABLE',
      bg: 'bg-[#7C3AED] text-white',
      accentText: 'text-[#7C3AED]',
    },
    resolved: {
      label: '¡FINAL FELIZ! · EN CASA',
      bg: 'bg-[#F59E0B] text-white',
      accentText: 'text-[#F59E0B]',
    },
  }[pet.status];

  const coords = resolvePetCoordinates(pet);
  const formattedPhone = validateAndFormatWhatsApp(pet.authorWhatsApp).formattedDisplay;
  const waMessage = encodeURIComponent(
    `Hola ${pet.authorName}! Vi la ficha de ${pet.name} (${pet.barrio}) en Huella VT y me comunico para ayudar...`
  );
  const waUrl = `https://wa.me/549${pet.authorWhatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;
  const mapsQuery = encodeURIComponent(
    `${pet.addressOrReference || pet.barrio}, Venado Tuerto, Santa Fe, Argentina`
  );
  const mapsUrl = `https://maps.google.com/?q=${mapsQuery}`;

  const handleCopySummary = async () => {
    const text = `🐾 ${statusMeta.label}: ${pet.name} en ${pet.barrio} (Venado Tuerto). ${pet.breed} · ${pet.color}. Ref: ${pet.addressOrReference}. Contacto WhatsApp: ${formattedPhone} (${pet.authorName}).`;
    await navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha detallada de ${pet.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col bg-white dark:bg-[#14171A] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-[#111315] dark:text-[#EDEDED]"
      >
        {/* Dedicated Sticky Top Header — Never clips or overlaps content */}
        <div className="px-5 py-3.5 border-b border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#111315] flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <span
              className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider shadow-xs shrink-0 ${statusMeta.bg}`}
            >
              {statusMeta.label}
            </span>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#111315] dark:text-white truncate">
              {pet.name}
            </h2>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Publicado {formatRelativeTime(pet.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#111315] dark:text-white transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Complete Visible Photo Frame */}
          <div className="md:col-span-5 relative bg-neutral-900 flex flex-col justify-between min-h-[260px] sm:min-h-[320px] md:min-h-[420px]">
            <img
              src={pet.photoBase64}
              alt={pet.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full ${
                fitContain ? 'object-contain bg-neutral-950' : 'object-cover object-center'
              } transition-all duration-300`}
            />

            {/* Top & Bottom subtle scrims */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

            {/* Top Right Photo Fit Toggle */}
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setFitContain((v) => !v)}
                title="Alternar foto completa sin recorte"
                className="px-2.5 py-1.5 rounded-lg bg-black/65 hover:bg-black/85 text-white text-[11px] font-mono backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{fitContain ? 'Llenar marco' : 'Ver foto entera'}</span>
              </button>
            </div>

            {/* Bottom Location & Geotag Overlay */}
            <div className="absolute bottom-3.5 left-4 right-4 text-white z-10">
              <p className="text-xs font-mono font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF4D38] shrink-0" />
                <span>{pet.barrio}, Venado Tuerto</span>
              </p>
              <span className="text-[10px] font-mono text-white/75 block mt-0.5">
                GPS aprox: {coords.lat.toFixed(4)}°S, {coords.lng.toFixed(4)}°O
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Dossier & Actions */}
          <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Verified Reunion Note if Resolved */}
              {pet.status === 'resolved' && pet.resolvedNotes && (
                <div className="p-3.5 rounded-xl bg-amber-500/12 border border-amber-500/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-mono font-bold uppercase text-amber-700 dark:text-amber-300 block">
                      Historia del Reencuentro Verificado
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-200 mt-0.5 italic">
                      &ldquo;{pet.resolvedNotes}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Especie y Raza
                  </span>
                  <span className="font-display font-bold text-sm text-[#111315] dark:text-white mt-0.5 block">
                    {pet.species === 'cat' ? '🐱 Gato' : '🐶 Perro'} · {pet.breed || 'Mestizo'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Pelaje / Color
                  </span>
                  <span className="font-display font-bold text-sm text-[#111315] dark:text-white mt-0.5 block">
                    {pet.color}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/6 dark:border-white/6 sm:col-span-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                      Esquina / Zona de Referencia ({pet.date})
                    </span>
                    <span className="font-mono font-semibold text-xs text-[#111315] dark:text-white mt-0.5 block truncate">
                      📍 {pet.addressOrReference || pet.barrio}
                    </span>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-white dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-xs font-display font-semibold flex items-center gap-1 hover:border-[#FF4D38] transition shrink-0"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[11px] font-mono uppercase text-neutral-400 font-semibold mb-1.5">
                  Descripción y Señas Particulares
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-[#FAF7F2] dark:bg-[#0B0C0E] p-3.5 rounded-xl border border-black/6 dark:border-white/6">
                  {pet.description}
                </p>
                {pet.collarInfo && (
                  <p className="text-xs font-mono text-neutral-500 mt-1.5">
                    <strong>Collar / Identificación:</strong> {pet.collarInfo}
                  </p>
                )}
              </div>

              {/* Health & Shelter Attributes if applicable */}
              {(pet.isCastrated || pet.isVaccinated || pet.isKidFriendly || pet.shelterName) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                  {pet.shelterName && (
                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                      ★ {pet.shelterName}
                    </span>
                  )}
                  {pet.isCastrated && <span>· ✓ Castrado/a</span>}
                  {pet.isVaccinated && <span>· ✓ Vacunado/a</span>}
                  {pet.isKidFriendly && <span>· ✓ Sociable / Apto niños</span>}
                </div>
              )}

              {/* Smart Match Alert if available */}
              {matchCount > 0 && onOpenSmartMatch && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSmartMatch(pet);
                  }}
                  className="w-full p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-mono">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                    <span>
                      Detectamos {matchCount}{' '}
                      {matchCount === 1 ? 'reporte compatible' : 'reportes compatibles'} en Venado
                      Tuerto
                    </span>
                  </span>
                  <span className="underline shrink-0 ml-2">Comparar →</span>
                </button>
              )}

              {/* Security & Anti-Fraud Advisory */}
              <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-start gap-2.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111315] dark:text-white">
                    Consejo de Seguridad Vecinal:
                  </strong>{' '}
                  Nunca realices transferencias de dinero por adelantado ni entregues códigos de
                  verificación de WhatsApp. Coordiná los reencuentros en lugares públicos de Venado
                  Tuerto.
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-black/8 dark:border-white/8 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-display font-bold text-xs sm:text-sm transition shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ({pet.authorName})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStoryCanvas(pet);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#111315] hover:bg-[#FF4D38] text-white dark:bg-white dark:text-[#111315] dark:hover:bg-[#FF4D38] dark:hover:text-white font-display font-bold text-xs sm:text-sm transition shadow-md cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Descargar Afiche Redes</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-mono transition cursor-pointer"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Resumen copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar contacto ({formattedPhone})</span>
                    </>
                  )}
                </button>

                {pet.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onMarkHappyEnding(pet);
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-display font-bold transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Confirmar ¡Volvió a Casa! (Verificado)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
