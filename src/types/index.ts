export type PetStatus = 'lost' | 'found' | 'adoption' | 'resolved';

export type PetSpecies = 'dog' | 'cat' | 'other';

export type PetSize = 'small' | 'medium' | 'large';

export type PetAge = 'puppy' | 'young' | 'adult' | 'senior';

export interface Pet {
  id: string;
  name: string;
  status: PetStatus;
  species: PetSpecies;
  breed: string;
  color: string;
  gender: 'male' | 'female' | 'unknown';
  size?: PetSize;
  age?: PetAge;
  barrio: string;
  addressOrReference: string;
  date: string; // YYYY-MM-DD
  description: string;
  collarInfo?: string;
  isCastrated?: boolean;
  isVaccinated?: boolean;
  isKidFriendly?: boolean;
  isUrgentTransit?: boolean;
  shelterName?: string;
  isVerifiedShelter?: boolean;
  photoBase64: string;
  photoOriginalSizeKb?: number;
  photoOptimizedSizeKb?: number;
  authorName: string;
  authorWhatsApp: string;
  authorUid?: string;
  securityPin?: string;
  applauseCount?: number;
  linkedCampaignId?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  resolvedAt?: number;
  resolvedNotes?: string;
}

export type SponsorCategory = 'veterinaria' | 'pet_shop' | 'peluqueria' | 'guarderia';

export type SponsorTier = 'padrino_gold' | 'guardia_24h' | 'comercio_amigo';

export interface Sponsor {
  id: string;
  name: string;
  category: SponsorCategory;
  tier: SponsorTier;
  isOnDutyToday: boolean;
  address: string;
  phone: string;
  whatsApp: string;
  mapsUrl: string;
  promoTitle: string;
  promoDescription: string;
  couponCode: string;
  logoBase64?: string;
  bannerColor?: string;
  expirationDate: string; // YYYY-MM-DD
  isActive: boolean;
  lat?: number;
  lng?: number;
  createdAt: number;
}

export type CampaignHelpType = 'financial' | 'supplies' | 'both';

export type CampaignStatus = 'active' | 'pending_approval' | 'completed';

export type SupplyCategory = 'medicina' | 'alimento' | 'insumos' | 'transito';

export interface SupplyItem {
  id: string;
  name: string;
  category: SupplyCategory;
  targetQty: number;
  currentQty: number;
  fulfilled: boolean;
}

export interface CampaignContribution {
  id: string;
  donorName: string;
  amountArs: number;
  message: string;
  status: 'confirmed' | 'in_review';
  createdAt: number;
}

export interface SolidarityCampaign {
  id: string;
  petId?: string;
  petName: string;
  species: PetSpecies;
  barrio: string;
  title: string;
  story: string;
  helpType: CampaignHelpType;
  status: CampaignStatus;
  photoBase64: string;

  // A. Financial P2P Argentina Fields
  goalAmountArs?: number;
  confirmedAmountArs?: number;
  pendingReviewAmountArs?: number;
  bankAlias?: string;
  cbuCvu?: string;
  holderName?: string;
  bankOrWallet?: string;
  isDirectVetAccount?: boolean;

  // B. Supplies Checklist
  supplies: SupplyItem[];

  // C. 3-Layer Anti-Scam & Transparency
  medicalEvidenceBase64?: string;
  medicalEvidenceCaption?: string;
  paidReceiptBase64?: string;
  paidReceiptCaption?: string;
  vetClinicName: string;
  vetProfessionalName?: string;
  isVerifiedShelter: boolean;
  shelterOrOrganizerName: string;
  contactWhatsApp: string;
  contributions: CampaignContribution[];
  createdAt: number;
}

export const VENADO_TUERTO_BARRIOS = [
  'Barrio Centro',
  'Barrio Rivadavia',
  'San José Obrero',
  'Barrio Norte',
  'Barrio San Vicente',
  'General Belgrano',
  'Ciudad Nueva',
  'Tiro Federal',
  'Barrio Santa Fe',
  'Malvinas Argentinas',
  'Alejandro Gutiérrez',
  'Barrio San Martín',
  'Barrio Iturbide',
  'Barrio Provincias Unidas',
  'Barrio Victoria',
  'Villa Casey',
  'Zona Rural / Quintas',
] as const;

export type BarrioName = (typeof VENADO_TUERTO_BARRIOS)[number];
