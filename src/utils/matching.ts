import { Pet } from '../types';

export interface MatchResult {
  pet: Pet;
  matchScore: number; // 0 - 100
  reasons: string[];
}

/**
 * Normalizes text for fuzzy token matching
 */
export function normalizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/**
 * Smart Match algorithm:
 * Given a target pet (typically 'lost'), evaluates all other pets
 * to find candidate matches (typically 'found').
 */
export function findSmartMatches(targetPet: Pet, candidateList: Pet[]): MatchResult[] {
  const matches: MatchResult[] = [];

  // If target is lost, compare with found or resolved (found recently)
  // If target is found, compare with lost
  const targetOppositeStatus = targetPet.status === 'lost' ? 'found' : 'lost';

  const candidates = candidateList.filter(
    (p) => p.id !== targetPet.id && (p.status === targetOppositeStatus || p.status === 'found')
  );

  const targetTokens = [
    ...normalizeText(targetPet.color),
    ...normalizeText(targetPet.breed),
    ...normalizeText(targetPet.description),
  ];

  for (const candidate of candidates) {
    let score = 0;
    const reasons: string[] = [];

    // Species check - must be identical
    if (candidate.species !== targetPet.species) {
      continue;
    }
    score += 20;

    // Barrio check
    if (candidate.barrio && targetPet.barrio && candidate.barrio === targetPet.barrio) {
      score += 35;
      reasons.push(`Mismo barrio (${candidate.barrio})`);
    } else if (candidate.barrio && targetPet.barrio) {
      score += 10;
      reasons.push(`Zona cercana (${candidate.barrio})`);
    }

    // Gender check
    if (
      candidate.gender !== 'unknown' &&
      targetPet.gender !== 'unknown' &&
      candidate.gender === targetPet.gender
    ) {
      score += 10;
      reasons.push(`Mismo sexo (${candidate.gender === 'male' ? 'Macho' : 'Hembra'})`);
    }

    // Color and visual token overlap
    const candidateTokens = [
      ...normalizeText(candidate.color),
      ...normalizeText(candidate.breed),
      ...normalizeText(candidate.description),
    ];

    const sharedTokens = Array.from(new Set(targetTokens.filter((t) => candidateTokens.includes(t))));
    if (sharedTokens.length > 0) {
      const tokenPoints = Math.min(25, sharedTokens.length * 8);
      score += tokenPoints;
      reasons.push(`Rasgos coincidentes: ${sharedTokens.slice(0, 3).join(', ')}`);
    }

    // Date proximity (within 14 days)
    if (targetPet.date && candidate.date) {
      const targetTime = new Date(targetPet.date).getTime();
      const candidateTime = new Date(candidate.date).getTime();
      const diffDays = Math.abs(targetTime - candidateTime) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        score += 10;
        reasons.push('Reportados en fechas muy cercanas (±7 días)');
      } else if (diffDays <= 14) {
        score += 5;
      }
    }

    // Collar or specific marks
    if (candidate.collarInfo && targetPet.collarInfo) {
      score += 10;
      reasons.push('Ambos reportes mencionan collar o placa');
    }

    const finalScore = Math.min(100, score);
    if (finalScore >= 40) {
      matches.push({
        pet: candidate,
        matchScore: finalScore,
        reasons,
      });
    }
  }

  // Sort by highest match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
