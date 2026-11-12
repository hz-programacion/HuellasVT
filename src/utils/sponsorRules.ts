import { Sponsor, Pet } from '../types';

export interface SponsorExpirationStatus {
  status: 'active' | 'expiring_soon' | 'expired';
  daysRemaining: number;
  label: string;
  badgeClass: string;
}

/**
 * Calculates days remaining and traffic light status for a sponsor subscription
 */
export function getSponsorExpirationStatus(
  expirationDate: string,
  currentDate: Date = new Date()
): SponsorExpirationStatus {
  if (!expirationDate) {
    return {
      status: 'expired',
      daysRemaining: 0,
      label: 'Sin fecha',
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    };
  }

  // Parse YYYY-MM-DD cleanly at local midnight
  const [year, month, day] = expirationDate.split('-').map(Number);
  const exp = new Date(year, month - 1, day, 23, 59, 59);
  const now = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      daysRemaining: diffDays,
      label: `Vencido (${Math.abs(diffDays)}d)`,
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    };
  }

  if (diffDays <= 5) {
    return {
      status: 'expiring_soon',
      daysRemaining: diffDays,
      label: `Vence en ${diffDays}d`,
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    };
  }

  return {
    status: 'active',
    daysRemaining: diffDays,
    label: `Vigente (${diffDays}d)`,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  };
}

/**
 * Determines whether a native sponsor card should be injected after a given pet index.
 * Rule: Insert at position 6 (i.e. every 5 pets, position index 4, 9, 14...)
 */
export function shouldInjectSponsorCard(zeroBasedIndex: number, interval = 5): boolean {
  return (zeroBasedIndex + 1) % interval === 0;
}

/**
 * Calculates estimated Firestore storage usage in Megabytes against the 1024 MB Spark free tier.
 */
export function calculateStorageUsage(
  pets: Pet[],
  sponsors: Sponsor[]
): {
  usedMb: number;
  maxMb: number;
  percent: number;
  petBytes: number;
  sponsorBytes: number;
  totalDocs: number;
} {
  const MAX_SPARK_MB = 1024;

  let petBytes = 0;
  for (const pet of pets) {
    // Rough JSON payload size in bytes
    const basePayload = JSON.stringify({
      ...pet,
      photoBase64: '',
    }).length;
    const photoBytes = pet.photoBase64 ? pet.photoBase64.length : 0;
    petBytes += basePayload + photoBytes;
  }

  let sponsorBytes = 0;
  for (const sponsor of sponsors) {
    const basePayload = JSON.stringify({
      ...sponsor,
      logoBase64: '',
    }).length;
    const logoBytes = sponsor.logoBase64 ? sponsor.logoBase64.length : 0;
    sponsorBytes += basePayload + logoBytes;
  }

  const totalBytes = petBytes + sponsorBytes;
  const usedMb = +(totalBytes / (1024 * 1024)).toFixed(3);
  const percent = +((usedMb / MAX_SPARK_MB) * 100).toFixed(2);

  return {
    usedMb,
    maxMb: MAX_SPARK_MB,
    percent,
    petBytes,
    sponsorBytes,
    totalDocs: pets.length + sponsors.length,
  };
}
