import React from 'react';
import { Sponsor } from '../types';
import { PhoneCall, MessageCircle, MapPin, ExternalLink, ShieldAlert, Clock } from 'lucide-react';

interface EmergencySosSectionProps {
  sponsors: Sponsor[];
}

export const EmergencySosSection: React.FC<EmergencySosSectionProps> = ({ sponsors }) => {
  const vets = sponsors.filter((s) => s.category === 'veterinaria');
  const onDutyVets = vets.filter((v) => v.isOnDutyToday);
  const otherVets = vets.filter((v) => !v.isOnDutyToday);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>RED DE URGENCIAS VETERINARIAS VT</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111315] dark:text-white">
            Veterinarias de Guardia 24hs y Atención Médica
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1">
            Ubicación exacta, teléfonos de emergencia directa y WhatsApp activo para atención inmediata en Venado Tuerto.
          </p>
        </div>
      </div>

      {/* On Duty Priority Cards */}
      <div className="space-y-4 mb-8">
        <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
          De Turno Hoy / Guardia Activa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onDutyVets.map((vet) => (
            <div
              key={vet.id}
              className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-[#14171A] p-6 shadow-md hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase">
                      GUARDIA ACTIVA HOY
                    </span>
                  </div>
                  <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400">
                    24 Horas
                  </span>
                </div>

                <h4 className="font-display font-black text-xl text-[#111315] dark:text-white mt-3">
                  {vet.name}
                </h4>

                <div className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300 font-mono">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#FF4D38] shrink-0" />
                    <span>{vet.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Urgencias médicas, cirugías e internación</span>
                  </p>
                </div>

                {vet.promoTitle && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 font-display">
                      {vet.promoTitle}
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-0.5">
                      {vet.promoDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={`tel:${vet.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs transition shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Llamar Urgencia</span>
                </a>

                <a
                  href={`https://wa.me/549${vet.whatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    'Hola, me comunico por una urgencia veterinaria en Venado Tuerto a través de Huella VT...'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-display font-semibold text-xs transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp SOS</span>
                </a>

                <a
                  href={vet.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Cómo llegar</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Clinics in Venado Tuerto */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold mb-3">
          Otras Clínicas y Consultorios en la Ciudad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherVets.map((vet) => (
            <div
              key={vet.id}
              className="rounded-xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#14171A] p-4 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-display font-bold text-base text-[#111315] dark:text-white">
                  {vet.name}
                </h4>
                <p className="text-xs text-neutral-500 font-mono mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {vet.address}
                </p>
                {vet.promoTitle && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 bg-amber-500/10 p-2 rounded-lg">
                    {vet.promoTitle}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <a
                  href={`tel:${vet.phone.replace(/[^0-9]/g, '')}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-center text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition"
                >
                  Llamar
                </a>
                <a
                  href={vet.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition"
                  title="Abrir en mapa"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
