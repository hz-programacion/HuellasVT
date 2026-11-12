import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pet } from '../types';
import { formatRelativeTime } from '../utils/dateFilter';
import {
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Eye,
} from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  index?: number;
  onOpenStoryCanvas: (pet: Pet) => void;
  onOpenSmartMatch?: (pet: Pet) => void;
  onOpenDetail?: (pet: Pet) => void;
  onMarkHappyEnding: (pet: Pet) => void;
  hasMatches?: boolean;
}

export const petCardVariants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.96,
  },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(index * 0.06, 0.42),
      duration: 0.46,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  index = 0,
  onOpenStoryCanvas,
  onOpenSmartMatch,
  onOpenDetail,
  onMarkHappyEnding,
  hasMatches = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [spotlight, setSpotlight] = useState({
    rotateX: 0,
    rotateY: 0,
    mouseX: 0,
    mouseY: 0,
    active: false,
  });

  const statusBadge = {
    lost: {
      text: 'PERDIDO',
      color: 'bg-[#FF4D38] text-white',
      borderHover: 'hover:border-[#FF4D38]/50',
      glowRgba: 'rgba(255, 77, 56, 0.16)',
    },
    found: {
      text: 'ENCONTRADO',
      color: 'bg-[#10B981] text-white',
      borderHover: 'hover:border-[#10B981]/50',
      glowRgba: 'rgba(16, 185, 129, 0.16)',
    },
    adoption: {
      text: 'EN ADOPCIÓN',
      color: 'bg-[#7C3AED] text-white',
      borderHover: 'hover:border-[#7C3AED]/50',
      glowRgba: 'rgba(124, 58, 237, 0.16)',
    },
    resolved: {
      text: '¡FINAL FELIZ!',
      color: 'bg-[#F59E0B] text-white',
      borderHover: 'hover:border-[#F59E0B]/50',
      glowRgba: 'rgba(245, 158, 11, 0.16)',
    },
  }[pet.status];

  const waMessage = encodeURIComponent(
    `Hola! Vi tu publicación sobre ${pet.name} en el ${pet.barrio} a través de la plataforma Huella VT...`
  );
  const waUrl = `https://wa.me/549${pet.authorWhatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const normX = mouseX / rect.width;
    const normY = mouseY / rect.height;

    setSpotlight({
      rotateX: (0.5 - normY) * 4.5,
      rotateY: (normX - 0.5) * 4.5,
      mouseX,
      mouseY,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, rotateX: 0, rotateY: 0, active: false }));
  };

  return (
    <motion.article
      layout
      custom={index}
      variants={petCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${spotlight.rotateX}deg) rotateY(${spotlight.rotateY}deg)`,
        transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`group relative rounded-2xl overflow-hidden border transition-shadow duration-300 flex flex-col justify-between ${
        pet.status === 'resolved'
          ? 'bg-[#FAF7F2] dark:bg-[#121417] border-amber-500/40 shadow-xs'
          : `bg-white dark:bg-[#14171A] border-black/10 dark:border-white/10 ${statusBadge.borderHover} shadow-xs hover:shadow-2xl`
      }`}
    >
      {/* Dynamic Spotlight Searchlight Overlay */}
      {spotlight.active && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(360px circle at ${spotlight.mouseX}px ${spotlight.mouseY}px, ${statusBadge.glowRgba}, transparent 75%)`,
          }}
        />
      )}

      {/* Photo Frame */}
      <div
        data-cursor="VER FICHA"
        className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900"
      >
        {!imageError ? (
          <img
            src={pet.photoBase64}
            alt={`${pet.name} - ${pet.barrio}, Venado Tuerto`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            onClick={() => onOpenDetail && onOpenDetail(pet)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer"
          />
        ) : (
          <div
            onClick={() => onOpenDetail && onOpenDetail(pet)}
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 text-neutral-400 cursor-pointer"
          >
            <span className="text-4xl mb-1">{pet.species === 'cat' ? '🐱' : '🐶'}</span>
            <span className="text-xs font-mono">{pet.name}</span>
          </div>
        )}

        {/* Measured Gradient Scrim for bottom overlay contrast */}
        <div
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Left Status & Top Right Relative Time */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider shadow-md ${statusBadge.color}`}
            >
              {statusBadge.text}
            </span>
            {pet.isUrgentTransit && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#111315]/90 text-[#FF4D38] border border-[#FF4D38]/40">
                🚨 TRÁNSITO
              </span>
            )}
            {pet.linkedCampaignId && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-400/40">
                💸 COLECTA
              </span>
            )}
          </div>

          <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white/95 text-[10px] font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {formatRelativeTime(pet.createdAt)}
          </span>
        </div>

        {/* Happy Ending Seal Overlay */}
        {pet.status === 'resolved' && (
          <div
            onClick={() => onOpenDetail && onOpenDetail(pet)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="transform -rotate-6 border-2 border-[#F59E0B] bg-[#111315]/95 text-white rounded-2xl px-5 py-3 shadow-2xl flex flex-col items-center text-center">
              <span className="text-2xl mb-0.5">🎉🐾</span>
              <span className="font-display font-extrabold text-base text-[#F59E0B] tracking-tight">
                ¡VOLVIÓ A CASA!
              </span>
              <span className="text-[10px] font-mono text-neutral-300">
                Final Feliz Verificado
              </span>
            </div>
          </div>
        )}

        {/* Bottom Barrio & Shelter row on photo */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          <div className="flex items-center gap-1 text-xs font-mono font-semibold drop-shadow">
            <MapPin className="w-3.5 h-3.5 text-[#FF4D38] shrink-0" />
            <span className="truncate max-w-[180px]">{pet.barrio}</span>
          </div>

          {pet.shelterName && (
            <span className="text-[10px] font-mono text-violet-200 truncate max-w-[130px]">
              ★ {pet.shelterName}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between relative z-20">
        <div>
          {/* Header row: Name & Species */}
          <div className="flex items-baseline justify-between gap-2">
            <button
              type="button"
              data-cursor="VER FICHA"
              onClick={() => onOpenDetail && onOpenDetail(pet)}
              className="text-left font-display font-extrabold text-lg text-[#111315] dark:text-[#EDEDED] hover:text-[#FF4D38] dark:hover:text-[#FF4D38] leading-tight truncate transition-colors cursor-pointer"
            >
              {pet.name}
            </button>
            <span className="text-sm shrink-0" title={pet.species === 'cat' ? 'Gato' : 'Perro'}>
              {pet.species === 'cat' ? '🐱' : '🐶'}
            </span>
          </div>

          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono truncate">
            <span className="truncate">{pet.breed || 'Mestizo'}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{pet.color}</span>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2.5 line-clamp-2 leading-relaxed">
            {pet.resolvedNotes && pet.status === 'resolved' ? pet.resolvedNotes : pet.description}
          </p>

          {/* Reference / Collar quiet line */}
          {pet.addressOrReference && (
            <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">
              Ref: {pet.addressOrReference}
            </div>
          )}
        </div>

        {/* Smart Match Banner if matches exist */}
        {hasMatches && pet.status === 'lost' && onOpenSmartMatch && (
          <button
            type="button"
            data-cursor="COMPARAR"
            onClick={() => onOpenSmartMatch(pet)}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Posible coincidencia
            </span>
            <span className="text-[11px] underline">Ver reporte →</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-black/6 dark:border-white/6 flex items-center gap-1.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="CONTACTAR"
            aria-label={`Contactar por WhatsApp sobre ${pet.name}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-display font-bold text-xs transition shadow-xs whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            data-cursor="AFICHE IG"
            onClick={() => onOpenStoryCanvas(pet)}
            title="Descargar Afiche para Instagram / Estados"
            aria-label={`Descargar cartel para Stories de ${pet.name}`}
            className="flex items-center gap-1 py-2 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-display font-semibold transition cursor-pointer whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 text-[#FF4D38]" />
            <span>Afiche</span>
          </button>

          {onOpenDetail && (
            <button
              type="button"
              data-cursor="VER FICHA"
              onClick={() => onOpenDetail(pet)}
              title="Ver ficha completa"
              aria-label={`Ver ficha completa de ${pet.name}`}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {pet.status !== 'resolved' && (
            <button
              type="button"
              data-cursor="VERIFICAR"
              onClick={() => onMarkHappyEnding(pet)}
              title="Confirmar ¡Volvió a casa! (Con verificación anti-error)"
              aria-label={`Confirmar final feliz verificado de ${pet.name}`}
              className="p-2 rounded-xl bg-amber-500/12 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
