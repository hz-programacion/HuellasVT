import { Pet } from '../types';

export type DateRangeFilter = 'all' | '24h' | '7d' | '30d';

export const DATE_RANGE_OPTIONS: { id: DateRangeFilter; label: string; shortLabel: string }[] = [
  { id: 'all', label: 'Cualquier fecha', shortLabel: 'Todas' },
  { id: '24h', label: 'Últimas 24 horas', shortLabel: 'Últ. 24h' },
  { id: '7d', label: 'Últimos 7 días', shortLabel: '7 días' },
  { id: '30d', label: 'Últimos 30 días', shortLabel: '30 días' },
];

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

/**
 * Checks if a pet was published within the specified date range relative to `nowMs`.
 * Uses `createdAt` timestamp for accurate hour/day filtering.
 */
export function isWithinDateRange(
  pet: Pick<Pet, 'createdAt' | 'date'>,
  range: DateRangeFilter,
  nowMs: number = Date.now()
): boolean {
  if (range === 'all') return true;

  const timestamp = pet.createdAt || (pet.date ? new Date(pet.date).getTime() : nowMs);
  const ageMs = Math.max(0, nowMs - timestamp);

  switch (range) {
    case '24h':
      return ageMs <= 24 * HOUR_MS;
    case '7d':
      return ageMs <= 7 * DAY_MS;
    case '30d':
      return ageMs <= 30 * DAY_MS;
    default:
      return true;
  }
}

/**
 * Returns a human-friendly relative time badge in Spanish (e.g. "Hace 3h", "Hace 2 días")
 */
export function formatRelativeTime(createdAt: number, nowMs: number = Date.now()): string {
  if (!createdAt) return 'Reciente';
  const diffMs = Math.max(0, nowMs - createdAt);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / HOUR_MS);
  const diffDays = Math.floor(diffMs / DAY_MS);

  if (diffMinutes < 5) return 'Hace instantes';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 30) return `Hace ${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
}
