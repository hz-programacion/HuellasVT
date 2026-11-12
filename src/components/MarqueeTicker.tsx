import React from 'react';
import { Pet, Sponsor } from '../types';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface MarqueeTickerProps {
  pets: Pet[];
  sponsors: Sponsor[];
  onSelectPet?: (pet: Pet) => void;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ pets, sponsors, onSelectPet }) => {
  const urgentPets = pets.filter((p) => p.status === 'lost' || p.isUrgentTransit).slice(0, 5);
  const dutyVet = sponsors.find((s) => s.isOnDutyToday);
  const goldSponsor = sponsors.find((s) => s.tier === 'padrino_gold');

  return (
    <div
      aria-label="Cinta de alertas urgentes en tiempo real"
      className="w-full bg-[#111315] text-white py-2 px-2 overflow-hidden border-y border-white/10"
    >
      <div className="flex items-center space-x-8 animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
        {/* Urgent alert items */}
        {urgentPets.map((pet) => (
          <div
            key={pet.id}
            onClick={() => onSelectPet && onSelectPet(pet)}
            className="inline-flex items-center gap-2 cursor-pointer hover:text-[#FF4D38] transition font-mono text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF4D38] animate-ping" />
            <span className="font-bold text-[#FF4D38]">ALERTA VT:</span>
            <span>{pet.name} ({pet.breed || 'Mascota'})</span>
            <span className="text-neutral-400">visto en {pet.barrio}</span>
            <span className="text-neutral-600">·</span>
          </div>
        ))}

        {dutyVet && (
          <div className="inline-flex items-center gap-2 font-mono text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-emerald-400">GUARDIA 24HS HOY:</span>
            <span>{dutyVet.name}</span>
            <span className="text-neutral-400">({dutyVet.address})</span>
            <span className="text-neutral-600">·</span>
          </div>
        )}

        {goldSponsor && (
          <div className="inline-flex items-center gap-2 font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-400">PADRINO OFICIAL:</span>
            <span>{goldSponsor.name}</span>
            <span className="text-neutral-400">({goldSponsor.promoTitle})</span>
            <span className="text-neutral-600">·</span>
          </div>
        )}

        {/* Repetition for continuous loop */}
        <div className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Reportes comunitarios 100% gratuitos y sin intermediarios en Venado Tuerto</span>
          <span className="text-neutral-600">·</span>
        </div>
      </div>
    </div>
  );
};
