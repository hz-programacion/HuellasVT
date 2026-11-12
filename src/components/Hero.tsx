import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Pet, Sponsor } from '../types';
import {
  ShieldAlert,
  Sparkles,
  HeartHandshake,
  PhoneCall,
  ArrowRight,
  Zap,
  MapPin,
  Search,
} from 'lucide-react';
import { formatRelativeTime } from '../utils/dateFilter';

interface HeroProps {
  resolvedCount: number;
  activeCount: number;
  dutyVet: Sponsor | null;
  padrinoGold: Sponsor | null;
  featuredPet?: Pet | null;
  onSelectPet?: (pet: Pet) => void;
  onOpenPublish: () => void;
  onOpenCommandPalette?: () => void;
  onGoToEmergency: () => void;
  onGoToAdoptions: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  resolvedCount,
  activeCount,
  dutyVet,
  padrinoGold,
  featuredPet,
  onSelectPet,
  onOpenPublish,
  onOpenCommandPalette,
  onGoToEmergency,
  onGoToAdoptions,
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const targetCounter = resolvedCount + 138;
  const [displayCounter, setDisplayCounter] = useState(100);

  // Kinetic numeric scramble / count-up on mount
  useEffect(() => {
    let frame = 0;
    const totalFrames = 22;
    const timer = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplayCounter(targetCounter);
        clearInterval(timer);
      } else {
        const progress = frame / totalFrames;
        setDisplayCounter(Math.round(100 + (targetCounter - 100) * progress));
      }
    }, 28);
    return () => clearInterval(timer);
  }, [targetCounter]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-6 pb-10 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF4D38]/8 dark:bg-[#FF4D38]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#F59E0B]/8 dark:bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Editorial Split: Masthead + Live Urgent Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-8">
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111315]/5 dark:bg-white/10 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FF4D38] animate-pulse" />
            <span>Venado Tuerto, Santa Fe · Red Ciudadana en Tiempo Real</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.06] text-[#111315] dark:text-white [text-wrap:balance]">
            Ninguna patita sola.{' '}
            <span className="relative inline-block italic font-normal">
              <span>El radar vecinal</span>
              {/* SVG Hand-Drawn Animated Path Underline */}
              <svg
                viewBox="0 0 320 16"
                fill="none"
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full h-3.5 pointer-events-none"
              >
                <motion.path
                  d="M3 11.5C68 3.5 145 14.5 215 6.5C255 2.5 292 10.5 317 7.5"
                  stroke="#FF4D38"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.4 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </span>{' '}
            que las devuelve a casa.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
            Reportes geolocalizados en todos los barrios de Venado Tuerto, generador de afiches virales para Instagram Stories y guardia veterinaria 24hs verificada.
          </p>

          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              data-cursor="BUSCAR ⌘K"
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-4 px-4 py-2.5 rounded-xl bg-white dark:bg-[#14171A] border border-black/10 dark:border-white/10 shadow-xs hover:border-[#FF4D38]/50 transition text-xs text-neutral-500 dark:text-neutral-400 group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#FF4D38] group-hover:scale-110 transition" />
                <span>Buscar por barrio, raza, collar o veterinaria 24hs...</span>
              </span>
              <kbd className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-300">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Live Featured Urgent Alert Card */}
        {featuredPet && onSelectPet && (
          <div className="lg:col-span-4">
            <div
              onClick={() => onSelectPet(featuredPet)}
              role="button"
              tabIndex={0}
              data-cursor="VER CASO URGENTE"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPet(featuredPet);
                }
              }}
              className="group cursor-pointer rounded-2xl border border-[#FF4D38]/30 bg-white/95 dark:bg-[#14171A]/95 p-3.5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3.5"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={featuredPet.photoBase64}
                  alt={featuredPet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-[#FF4D38] ring-2 ring-white animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF4D38]">
                    ● Alerta en Curso
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {formatRelativeTime(featuredPet.createdAt)}
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-base text-[#111315] dark:text-white truncate mt-0.5 group-hover:text-[#FF4D38] transition">
                  {featuredPet.name}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#FF4D38] shrink-0" />
                  <span className="truncate">{featuredPet.barrio}</span>
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-display font-bold text-[#111315] dark:text-white mt-1.5 group-hover:translate-x-0.5 transition">
                  <span>Ver ficha y ayudar</span>
                  <ArrowRight className="w-3 h-3 text-[#FF4D38]" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Bento 1: Live Counter & Callout (7 cols) */}
        <div
          style={{
            transform: `translate3d(${offset.x * 0.4}px, ${offset.y * 0.4}px, 0)`,
            transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="md:col-span-7 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#14171A] p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400">
                Finales Felices Verificados
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-black text-4xl sm:text-5xl text-[#111315] dark:text-white tabular-nums">
                  +{displayCounter}
                </span>
                <span className="text-xs font-display font-semibold text-emerald-600 dark:text-emerald-400">
                  mascotas recuperadas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-medium">
                {activeCount} alertas activas
              </span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenPublish}
              data-cursor="PUBLICAR EN 3 PASOS"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#FF4D38] hover:bg-[#e03a26] text-white font-display font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Publicar Mascota Perdida o Encontrada</span>
            </button>

            <button
              onClick={onGoToAdoptions}
              data-cursor="SANTUARIO"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-display font-semibold text-sm transition cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Adoptar</span>
            </button>
          </div>
        </div>

        {/* Bento 2: SOS Guardia 24hs (5 cols) */}
        <div
          style={{
            transform: `translate3d(${-offset.x * 0.5}px, ${-offset.y * 0.5}px, 0)`,
            transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="md:col-span-5 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-[#062016] dark:via-[#14171A] dark:to-[#091a13] p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Urgencia · Guardia 24hs Hoy</span>
              </div>
              <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-[#111315] dark:text-white mt-2 leading-tight">
              {dutyVet ? dutyVet.name : 'Veterinaria San Martín 24hs'}
            </h3>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 font-mono">
              📍 {dutyVet ? dutyVet.address : 'Av. Casey 450, Venado Tuerto'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center gap-2">
            <a
              href={`tel:${dutyVet ? dutyVet.phone.replace(/[^0-9]/g, '') : '03462421800'}`}
              data-cursor="LLAMAR 24HS"
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-xs transition shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Llamar Urgencia
            </a>
            <button
              onClick={onGoToEmergency}
              className="py-2 px-3 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer"
            >
              Ver Todas
            </button>
          </div>
        </div>

        {/* Bento 3: Padrino Oficial / Sponsor Gold (Full 12 cols subtle strip) */}
        {padrinoGold && (
          <div className="md:col-span-12 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                  Padrino Oficial de la Red
                </span>
                <p className="text-xs font-display font-bold text-[#111315] dark:text-white">
                  {padrinoGold.name} ·{' '}
                  <span className="font-normal text-neutral-600 dark:text-neutral-400">
                    {padrinoGold.promoTitle}
                  </span>
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/549${padrinoGold.whatsApp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-display font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Aprovechar beneficio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
