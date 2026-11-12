import React, { useState } from 'react';
import { Sponsor } from '../types';
import { Sparkles, Copy, Check, MessageCircle, MapPin, Tag } from 'lucide-react';

interface SponsorInFeedCardProps {
  sponsor: Sponsor;
}

export const SponsorInFeedCard: React.FC<SponsorInFeedCardProps> = ({ sponsor }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(sponsor.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMessage = encodeURIComponent(
    `Hola ${sponsor.name}! Vi su beneficio "${sponsor.promoTitle}" (Cupón: ${sponsor.couponCode}) en la plataforma Huella VT y quisiera consultarles...`
  );
  const waUrl = `https://wa.me/549${sponsor.whatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;

  return (
    <aside
      aria-label="Espacio comercial comunitario"
      className="relative rounded-2xl overflow-hidden border-2 border-[#F59E0B]/40 bg-gradient-to-br from-[#FFFBEB] via-white to-[#FEF3C7] dark:from-[#1A160F] dark:via-[#14171A] dark:to-[#17130A] shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between"
    >
      {/* Top Banner Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#F59E0B] tracking-wider uppercase">
            <Sparkles className="w-4 h-4 fill-[#F59E0B]" />
            <span>Comercio Amigo de la Comunidad</span>
          </div>

          {sponsor.isOnDutyToday && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981] text-white">
              GUARDIA HOY
            </span>
          )}
        </div>

        {/* Sponsor Name & Address */}
        <h3 className="font-display font-extrabold text-xl text-[#111315] dark:text-white leading-tight">
          {sponsor.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
          <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
          <span className="truncate">{sponsor.address}</span>
        </div>

        {/* Promo Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-white/80 dark:bg-black/40 border border-[#F59E0B]/20 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309] dark:text-[#FBBF24]">
            <Tag className="w-3.5 h-3.5" />
            <span>{sponsor.promoTitle}</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
            {sponsor.promoDescription}
          </p>

          {/* Copyable Coupon Code */}
          <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-dashed border-neutral-300 dark:border-neutral-700">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Cupón de descuento:</span>
              <span className="font-mono font-bold text-xs text-[#111315] dark:text-white tracking-wider">
                {sponsor.couponCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCoupon}
              className="flex items-center gap-1 py-1 px-2.5 rounded-md bg-[#111315] hover:bg-black text-white dark:bg-white dark:text-[#111315] text-[11px] font-display font-semibold transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#10B981]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Contact Action */}
      <div className="mt-4 pt-3 border-t border-[#F59E0B]/20 flex items-center justify-between gap-2">
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
          Impulsando el rescate animal en VT
        </span>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white font-display font-semibold text-xs transition shadow-sm shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Consultar
        </a>
      </div>
    </aside>
  );
};
