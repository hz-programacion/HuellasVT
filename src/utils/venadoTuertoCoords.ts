import { Pet, Sponsor } from '../types';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/**
 * Center of Venado Tuerto, Santa Fe, Argentina (Plaza San Martín)
 */
export const VENADO_TUERTO_CENTER: LatLngPoint = {
  lat: -33.7456,
  lng: -61.9688,
};

/**
 * Real-world coordinates for neighborhoods (barrios) in Venado Tuerto, Santa Fe
 */
export const BARRIO_COORDINATES: Record<string, LatLngPoint> = {
  'Barrio Centro': { lat: -33.7456, lng: -61.9688 },
  'Barrio Rivadavia': { lat: -33.7512, lng: -61.9615 },
  'San José Obrero': { lat: -33.7365, lng: -61.9762 },
  'Barrio Norte': { lat: -33.7328, lng: -61.9648 },
  'Barrio San Vicente': { lat: -33.7418, lng: -61.9542 },
  'General Belgrano': { lat: -33.7485, lng: -61.9785 },
  'Ciudad Nueva': { lat: -33.7582, lng: -61.9525 },
  'Tiro Federal': { lat: -33.7295, lng: -61.9710 },
  'Barrio Santa Fe': { lat: -33.7555, lng: -61.9720 },
  'Malvinas Argentinas': { lat: -33.7615, lng: -61.9665 },
  'Alejandro Gutiérrez': { lat: -33.7440, lng: -61.9595 },
  'Barrio San Martín': { lat: -33.7498, lng: -61.9840 },
  'Barrio Iturbide': { lat: -33.7540, lng: -61.9810 },
  'Barrio Provincias Unidas': { lat: -33.7395, lng: -61.9855 },
  'Barrio Victoria': { lat: -33.7465, lng: -61.9510 },
  'Villa Casey': { lat: -33.7245, lng: -61.9580 },
  'Zona Rural / Quintas': { lat: -33.7650, lng: -61.9890 },
};

/**
 * Known specific landmarks/corners in Venado Tuerto for seed accuracy
 */
const LANDMARK_COORDINATES: Record<string, LatLngPoint> = {
  'pet-vt-1': { lat: -33.7452, lng: -61.9682 }, // Plaza San Martín, Belgrano y Marconi
  'pet-vt-2': { lat: -33.7468, lng: -61.9664 }, // San Martín y 25 de Mayo
  'pet-vt-3': { lat: -33.7506, lng: -61.9622 }, // España y Pellegrini (Escuela Normal)
  'pet-vt-4': { lat: -33.7524, lng: -61.9598 }, // Alvear al 600
  'pet-vt-5': { lat: -33.7362, lng: -61.9758 }, // San José Obrero
  'pet-vt-6': { lat: -33.7552, lng: -61.9718 }, // Av. Jorge Newbery y Santa Fe
  'pet-vt-7': { lat: -33.7482, lng: -61.9776 }, // Chacabuco y Güemes
  'pet-vt-8': { lat: -33.7578, lng: -61.9532 }, // Comandante Espora y Quintana
};

/**
 * Deterministic hash from string ID so custom created pets without explicit GPS
 * land on a consistent, realistic street corner within their selected Barrio.
 */
function deterministicOffset(seed: string): { dLat: number; dLng: number } {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    h1 = (h1 << 5) - h1 + char;
    h2 = (h2 << 3) + h2 + char * 7;
  }
  const norm1 = ((Math.abs(h1) % 1000) / 1000 - 0.5) * 0.0055;
  const norm2 = ((Math.abs(h2) % 1000) / 1000 - 0.5) * 0.0065;
  return { dLat: norm1, dLng: norm2 };
}

export function resolvePetCoordinates(pet: Pet): LatLngPoint {
  if (typeof pet.lat === 'number' && typeof pet.lng === 'number') {
    return { lat: pet.lat, lng: pet.lng };
  }
  if (LANDMARK_COORDINATES[pet.id]) {
    return LANDMARK_COORDINATES[pet.id];
  }
  const base = BARRIO_COORDINATES[pet.barrio] || VENADO_TUERTO_CENTER;
  const { dLat, dLng } = deterministicOffset(`${pet.id}-${pet.addressOrReference || ''}`);
  return {
    lat: Number((base.lat + dLat).toFixed(6)),
    lng: Number((base.lng + dLng).toFixed(6)),
  };
}

export function resolveSponsorCoordinates(sponsor: Sponsor): LatLngPoint {
  if (typeof sponsor.lat === 'number' && typeof sponsor.lng === 'number') {
    return { lat: sponsor.lat, lng: sponsor.lng };
  }
  const sponsorLocations: Record<string, LatLngPoint> = {
    'spon-vt-1': { lat: -33.7434, lng: -61.9698 }, // Av. Casey 450
    'spon-vt-2': { lat: -33.7478, lng: -61.9652 }, // Belgrano 890
    'spon-vt-3': { lat: -33.7445, lng: -61.9638 }, // Marconi y San Martín
    'spon-vt-4': { lat: -33.7492, lng: -61.9742 }, // Chacabuco 1120
  };
  if (sponsorLocations[sponsor.id]) {
    return sponsorLocations[sponsor.id];
  }
  const { dLat, dLng } = deterministicOffset(sponsor.id);
  return {
    lat: Number((VENADO_TUERTO_CENTER.lat + dLat).toFixed(6)),
    lng: Number((VENADO_TUERTO_CENTER.lng + dLng).toFixed(6)),
  };
}
