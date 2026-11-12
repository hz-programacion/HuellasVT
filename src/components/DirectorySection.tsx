import React, { useState } from 'react';
import { Sponsor, SponsorCategory } from '../types';
import { MapPin, PhoneCall, MessageCircle, ExternalLink, Sparkles, Tag, Check, Copy } from 'lucide-react';

interface DirectorySectionProps {
  sponsors: Sponsor[];
}

export const DirectorySection: React.FC<DirectorySectionProps> = ({ sponsors }) => {
  const [selectedCategory, setSelectedCategory] = useState<SponsorCategory | 'all'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Rubros' },
    { id: 'veterinaria', label: 'Clínicas & Urgencias' },
    { id: 'pet_shop', label: 'Pet Shops & Forrajerías' },
    { id: 'peluqueria', label: 'Peluquerías & Spa' },
    { id: 'guarderia', label: 'Guarderías & Paseadores' },
  ] as const;

  const filtered = sponsors.filter(
    (s) => selectedCategory === 'all' || s.category === selectedCategory
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 fill-[#F59E0B]" />
          <span>GUÍA COMERCIAL & SERVICIOS PET-FRIENDLY</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#111315] dark:text-white">
          Comercios que apoyan la red de Venado Tuerto
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-2xl">
          Beneficios exclusivos para vecinos, guardias de emergencia y compras solidarias en negocios locales.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl w-fit">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id as SponsorCategory | 'all')}
            className={`py-2 px-4 rounded-lg font-display text-xs font-semibold transition ${
              selectedCategory === c.id
                ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sponsor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sponsor) => {
          const waMessage = encodeURIComponent(
            `Hola ${sponsor.name}! Vi su perfil en Huella VT y quisiera hacer una consulta...`
          );
          const waUrl = `https://wa.me/549${sponsor.whatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;

          return (
            <div
              key={sponsor.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                sponsor.tier === 'padrino_gold'
                  ? 'border-[#F59E0B] bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 dark:from-[#17140B] dark:via-[#14171A] dark:to-[#17130A]'
                  : 'border-black/8 dark:border-white/8 bg-white dark:bg-[#14171A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {sponsor.category.replace('_', ' ')}
                  </span>
                  {sponsor.tier === 'padrino_gold' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B] text-white">
                      PADRINO GOLD
                    </span>
                  )}
                  {sponsor.isOnDutyToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981] text-white">
                      GUARDIA HOY
                    </span>
                  )}
                </div>

                <h3 className="font-display font-extrabold text-xl text-[#111315] dark:text-white">
                  {sponsor.name}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4D38] shrink-0" />
                  <span>{sponsor.address}</span>
                </p>

                {/* Promo Box */}
                {sponsor.promoTitle && (
                  <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{sponsor.promoTitle}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                      {sponsor.promoDescription}
                    </p>

                    {sponsor.couponCode && (
                      <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700">
                        <span className="font-mono text-xs font-bold text-[#111315] dark:text-white">
                          {sponsor.couponCode}
                        </span>
                        <button
                          onClick={() => handleCopy(sponsor.couponCode)}
                          className="flex items-center gap-1 text-[11px] font-display font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
                        >
                          {copiedCode === sponsor.couponCode ? (
                            <>
                              <Check className="w-3 h-3 text-[#10B981]" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <a
                  href={`tel:${sponsor.phone.replace(/[^0-9]/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-display font-semibold text-xs transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Llamar
                </a>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-display font-semibold text-xs transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>

                <a
                  href={sponsor.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition"
                  title="Ver en Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
