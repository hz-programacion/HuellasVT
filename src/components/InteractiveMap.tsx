import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Pet, Sponsor } from '../types';
import {
  VENADO_TUERTO_CENTER,
  resolvePetCoordinates,
  resolveSponsorCoordinates,
} from '../utils/venadoTuertoCoords';
import { formatRelativeTime } from '../utils/dateFilter';
import {
  MapPin,
  Navigation,
  MessageCircle,
  Share2,
  Eye,
  ShieldAlert,
  Layers,
  X,
  Clock,
} from 'lucide-react';

interface InteractiveMapProps {
  pets: Pet[];
  sponsors?: Sponsor[];
  onOpenDetail: (pet: Pet) => void;
  onOpenStoryCanvas: (pet: Pet) => void;
}

const STATUS_PIN_COLORS: Record<
  Pet['status'],
  { hex: string; label: string; ringRgba: string }
> = {
  lost: {
    hex: '#FF4D38',
    label: 'PERDIDO',
    ringRgba: 'rgba(255, 77, 56, 0.22)',
  },
  found: {
    hex: '#10B981',
    label: 'ENCONTRADO',
    ringRgba: 'rgba(16, 185, 129, 0.22)',
  },
  adoption: {
    hex: '#7C3AED',
    label: 'ADOPCIÓN',
    ringRgba: 'rgba(124, 58, 237, 0.22)',
  },
  resolved: {
    hex: '#F59E0B',
    label: 'EN CASA',
    ringRgba: 'rgba(245, 158, 11, 0.20)',
  },
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pets,
  sponsors = [],
  onOpenDetail,
  onOpenStoryCanvas,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(() =>
    pets.length > 0 ? pets[0].id : null
  );
  const [showGuardiaVets, setShowGuardiaVets] = useState(true);
  const [tileStyle, setTileStyle] = useState<'editorial' | 'osm'>('editorial');

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) || pets[0] || null,
    [pets, selectedPetId]
  );

  const dutyVets = useMemo(
    () => sponsors.filter((s) => s.isActive && s.category === 'veterinaria'),
    [sponsors]
  );

  // Initialize Leaflet Map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [VENADO_TUERTO_CENTER.lat, VENADO_TUERTO_CENTER.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersGroup;

    // Ensure proper size calculation after container mount
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      radiusCircleRef.current = null;
    };
  }, []);

  // Render Pet Markers & Guardia 24hs Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Add Pet Markers
    pets.forEach((pet) => {
      const coords = resolvePetCoordinates(pet);
      const pinMeta = STATUS_PIN_COLORS[pet.status];
      const isSelected = selectedPet?.id === pet.id;
      const emoji = pet.species === 'cat' ? '🐱' : '🐶';

      const html = `
        <div style="position:relative; width:48px; height:54px; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
          ${
            pet.status === 'lost' || pet.status === 'found'
              ? `<span class="huella-pin-pulse" style="position:absolute; top:2px; width:42px; height:42px; border-radius:9999px; background:${pinMeta.hex}; pointer-events:none;"></span>`
              : ''
          }
          <div style="
            position:relative;
            width:${isSelected ? '46px' : '40px'};
            height:${isSelected ? '46px' : '40px'};
            border-radius:9999px;
            border:3px solid ${pinMeta.hex};
            background:#111315;
            box-shadow:0 8px 20px rgba(0,0,0,0.35);
            overflow:hidden;
            display:flex;
            align-items:center;
            justify-content:center;
            transition:all 0.2s ease;
            transform:${isSelected ? 'scale(1.12)' : 'scale(1)'};
          ">
            <img
              src="${pet.photoBase64}"
              alt="${pet.name}"
              referrerpolicy="no-referrer"
              onerror="this.style.display='none'"
              style="width:100%; height:100%; object-fit:cover;"
            />
            <span style="position:absolute; bottom:-1px; right:-1px; font-size:11px; background:#111315; border-radius:999px; padding:1px;">${emoji}</span>
          </div>
          <div style="
            width:0;
            height:0;
            border-left:6px solid transparent;
            border-right:6px solid transparent;
            border-top:8px solid ${pinMeta.hex};
            margin-top:-1px;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'huella-marker-icon',
        html,
        iconSize: [48, 54],
        iconAnchor: [24, 52],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon });
      marker.on('click', () => {
        setSelectedPetId(pet.id);
        map.flyTo([coords.lat, coords.lng], 15, {
          animate: true,
          duration: 0.65,
        });
      });

      marker.addTo(markersGroup);
    });

    // 2. Add Guardia 24hs Veterinary Markers if enabled
    if (showGuardiaVets) {
      dutyVets.forEach((vet) => {
        const coords = resolveSponsorCoordinates(vet);
        const vetHtml = `
          <div title="${vet.name} (${vet.address})" style="
            display:flex;
            align-items:center;
            gap:4px;
            padding:4px 8px;
            border-radius:999px;
            background:#111315;
            color:#FFFFFF;
            border:2px solid #10B981;
            box-shadow:0 6px 16px rgba(0,0,0,0.3);
            font-family:'JetBrains Mono', monospace;
            font-size:10px;
            font-weight:700;
            white-space:nowrap;
          ">
            <span style="color:#10B981;">✚</span>
            <span>24HS</span>
          </div>
        `;

        const vetIcon = L.divIcon({
          className: 'huella-marker-icon',
          html: vetHtml,
          iconSize: [64, 28],
          iconAnchor: [32, 14],
        });

        const vetMarker = L.marker([coords.lat, coords.lng], { icon: vetIcon });
        vetMarker.bindTooltip(
          `<strong>${vet.name}</strong><br/>📍 ${vet.address}<br/>📞 ${vet.phone}`,
          { direction: 'top', offset: [0, -10] }
        );
        vetMarker.addTo(markersGroup);
      });
    }
  }, [pets, dutyVets, showGuardiaVets, selectedPet]);

  // Draw Approximate Privacy/Search Radius Circle around Selected Pet
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (!selectedPet) return;
    const coords = resolvePetCoordinates(selectedPet);
    const pinMeta = STATUS_PIN_COLORS[selectedPet.status];

    const circle = L.circle([coords.lat, coords.lng], {
      radius: 190, // 190m approximate neighborhood search zone for privacy
      color: pinMeta.hex,
      weight: 2,
      opacity: 0.75,
      fillColor: pinMeta.hex,
      fillOpacity: 0.12,
      dashArray: '6, 6',
    }).addTo(map);

    radiusCircleRef.current = circle;
  }, [selectedPet]);

  const handleRecenterVenadoTuerto = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([VENADO_TUERTO_CENTER.lat, VENADO_TUERTO_CENTER.lng], 14, {
      animate: true,
      duration: 0.7,
    });
  };

  const handleSelectPetFromStrip = (pet: Pet) => {
    setSelectedPetId(pet.id);
    const map = mapInstanceRef.current;
    if (!map) return;
    const coords = resolvePetCoordinates(pet);
    map.flyTo([coords.lat, coords.lng], 15, {
      animate: true,
      duration: 0.65,
    });
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A] shadow-xl">
      {/* Top Editorial Map Controls Bar */}
      <div className="px-4 py-3 border-b border-black/8 dark:border-white/8 flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] dark:bg-[#111315]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#FF4D38]/12 text-[#FF4D38]">
            <MapPin className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm text-[#111315] dark:text-white">
                Radar Geoespacial Venado Tuerto (OpenStreetMap)
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 font-semibold">
                {pets.length} {pets.length === 1 ? 'alerta geolocalizada' : 'alertas geolocalizadas'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              Radio de privacidad vecinal de 190m por esquina · Cartografía libre sin costo de licencia
            </p>
          </div>
        </div>

        {/* Map Layer & Recenter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowGuardiaVets((v) => !v)}
            className={`py-1.5 px-3 rounded-xl font-mono text-xs border transition flex items-center gap-1.5 cursor-pointer ${
              showGuardiaVets
                ? 'bg-[#10B981]/12 border-[#10B981]/40 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'bg-white dark:bg-[#14171A] border-black/10 dark:border-white/10 text-neutral-500'
            }`}
          >
            <span>✚</span>
            <span>Guardias 24hs ({dutyVets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTileStyle((s) => (s === 'editorial' ? 'osm' : 'editorial'))}
            className="py-1.5 px-3 rounded-xl font-mono text-xs bg-white dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:border-black/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>{tileStyle === 'editorial' ? 'Mapa Editorial' : 'OSM Estándar'}</span>
          </button>

          <button
            type="button"
            onClick={handleRecenterVenadoTuerto}
            className="py-1.5 px-3 rounded-xl font-display font-bold text-xs bg-[#111315] text-white dark:bg-white dark:text-[#111315] hover:bg-[#FF4D38] dark:hover:bg-[#FF4D38] dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Centrar Plaza San Martín</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport + Floating Selected Pet Dossier */}
      <div className="relative h-[480px] sm:h-[540px] w-full">
        <div
          ref={mapContainerRef}
          aria-label="Mapa interactivo de mascotas en Venado Tuerto"
          className={`huella-leaflet-map ${
            tileStyle === 'editorial' ? 'huella-map-editorial' : 'huella-map-classic'
          } w-full h-full z-10`}
        />

        {/* Top Left Legend Pill */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#14171A]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg text-[11px] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D38]" />
            Perdido
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            Encontrado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            Final Feliz
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✚</span>
            Veterinaria 24hs
          </span>
        </div>

        {/* Floating Glassmorphic Pet Inspector Card on Map */}
        {selectedPet && (
          <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:w-96 z-20 rounded-2xl bg-white/95 dark:bg-[#14171A]/95 backdrop-blur-xl border border-black/12 dark:border-white/15 shadow-2xl p-4 transition-all">
            <div className="flex items-start gap-3.5">
              <img
                src={selectedPet.photoBase64}
                alt={selectedPet.name}
                referrerPolicy="no-referrer"
                onClick={() => onOpenDetail(selectedPet)}
                className="w-20 h-20 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0 cursor-pointer hover:opacity-90 transition"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white"
                    style={{ backgroundColor: STATUS_PIN_COLORS[selectedPet.status].hex }}
                  >
                    {STATUS_PIN_COLORS[selectedPet.status].label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {formatRelativeTime(selectedPet.createdAt)}
                  </span>
                </div>

                <h4
                  onClick={() => onOpenDetail(selectedPet)}
                  className="font-display font-extrabold text-base text-[#111315] dark:text-white truncate mt-1 cursor-pointer hover:text-[#FF4D38]"
                >
                  {selectedPet.name}
                </h4>

                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-300 truncate">
                  📍 {selectedPet.barrio} · {selectedPet.addressOrReference || selectedPet.barrio}
                </p>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                  {selectedPet.breed} · {selectedPet.color}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-black/8 dark:border-white/8 flex items-center gap-2">
              <a
                href={`https://wa.me/549${selectedPet.authorWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola! Vi a ${selectedPet.name} en el Mapa Radar de Huella VT (${selectedPet.barrio})...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenStoryCanvas(selectedPet)}
                className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-display font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FF4D38]" />
                <span>Afiche</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDetail(selectedPet)}
                className="py-2 px-3 rounded-xl bg-[#111315] hover:bg-[#FF4D38] text-white dark:bg-white dark:text-[#111315] dark:hover:bg-[#FF4D38] dark:hover:text-white text-xs font-display font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ficha</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick-Jump Horizontal Strip of Geotagged Alerts */}
      {pets.length > 0 && (
        <div className="px-4 py-2.5 border-t border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono uppercase text-neutral-400 shrink-0">
            Saltar a pin:
          </span>
          {pets.map((pet) => {
            const isSelected = selectedPet?.id === pet.id;
            const dotColor = STATUS_PIN_COLORS[pet.status].hex;
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() => handleSelectPetFromStrip(pet)}
                className={`py-1 px-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#111315] text-white dark:bg-white dark:text-[#111315] font-bold shadow-xs'
                    : 'bg-white dark:bg-[#14171A] text-neutral-600 dark:text-neutral-300 border border-black/8 dark:border-white/8 hover:border-black/25'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="truncate max-w-[130px]">{pet.name}</span>
                <span className="text-[10px] opacity-70">({pet.barrio.replace('Barrio ', '')})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
