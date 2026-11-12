import {
  SolidarityCampaign,
  CampaignStatus,
  CampaignContribution,
  SupplyItem,
  Sponsor,
} from '../types';
import { sanitizeInputText } from './security';

export interface CampaignProgressMetrics {
  goalArs: number;
  confirmedArs: number;
  inReviewArs: number;
  totalRaisedArs: number;
  remainingArs: number;
  confirmedPercent: number;
  inReviewPercent: number;
  totalPercent: number;
  isGoalReached: boolean;
  shouldHideBankAlias: boolean;
  totalSuppliesCount: number;
  fulfilledSuppliesCount: number;
  suppliesPercent: number;
}

/**
 * Formats an integer amount in Argentine Peso notation (e.g., "$120.000 ARS")
 */
export function formatArs(amount: number = 0): string {
  const safe = Math.max(0, Math.round(amount));
  return `$${safe.toLocaleString('es-AR')}`;
}

/**
 * Determines initial status when a campaign is created:
 * - Verified Shelters get immediate Fast-Track publication ('active')
 * - Regular neighbors start in 'pending_approval' until Admin verifies the medical receipt
 */
export function determineInitialCampaignStatus(isVerifiedShelter: boolean): CampaignStatus {
  return isVerifiedShelter ? 'active' : 'pending_approval';
}

/**
 * Calculates dual-progress bar metrics and enforces the 100% auto-close & alias-hiding rule
 */
export function calculateCampaignProgress(
  campaign: Pick<
    SolidarityCampaign,
    'goalAmountArs' | 'confirmedAmountArs' | 'pendingReviewAmountArs' | 'status' | 'supplies'
  >
): CampaignProgressMetrics {
  const goalArs = Math.max(0, campaign.goalAmountArs || 0);
  const confirmedArs = Math.max(0, campaign.confirmedAmountArs || 0);
  const inReviewArs = Math.max(0, campaign.pendingReviewAmountArs || 0);
  const totalRaisedArs = confirmedArs + inReviewArs;
  const remainingArs = Math.max(0, goalArs - totalRaisedArs);

  let confirmedPercent = 0;
  let inReviewPercent = 0;
  let totalPercent = 0;

  if (goalArs > 0) {
    confirmedPercent = Math.min(100, Math.round((confirmedArs / goalArs) * 100));
    totalPercent = Math.min(100, Math.round((totalRaisedArs / goalArs) * 100));
    inReviewPercent = Math.max(0, totalPercent - confirmedPercent);
  }

  const isGoalReached =
    campaign.status === 'completed' || (goalArs > 0 && totalRaisedArs >= goalArs);

  // Critical anti-overcollection rule: hide Alias automatically when goal reaches 100%
  const shouldHideBankAlias = isGoalReached;

  // Supplies progress
  const supplies = campaign.supplies || [];
  const totalSuppliesCount = supplies.reduce((acc, s) => acc + Math.max(1, s.targetQty), 0);
  const fulfilledSuppliesCount = supplies.reduce(
    (acc, s) => acc + Math.min(s.targetQty, s.fulfilled ? s.targetQty : s.currentQty),
    0
  );
  const suppliesPercent =
    totalSuppliesCount > 0 ? Math.min(100, Math.round((fulfilledSuppliesCount / totalSuppliesCount) * 100)) : 0;

  return {
    goalArs,
    confirmedArs,
    inReviewArs,
    totalRaisedArs,
    remainingArs,
    confirmedPercent,
    inReviewPercent,
    totalPercent,
    isGoalReached,
    shouldHideBankAlias,
    totalSuppliesCount,
    fulfilledSuppliesCount,
    suppliesPercent,
  };
}

/**
 * Pure function that applies a neighbor's P2P contribution ("🙌 ¡Ya transferí!")
 * and automatically closes the campaign if the 100% threshold is reached.
 */
export function applyContributionToCampaign(
  campaign: SolidarityCampaign,
  params: {
    donorName: string;
    amountArs: number;
    message: string;
    autoConfirm?: boolean;
  }
): SolidarityCampaign {
  const cleanAmount = Math.max(100, Math.min(10000000, Math.round(params.amountArs)));
  const cleanDonor = sanitizeInputText(params.donorName, 50) || 'Vecino Anónimo';
  const cleanMessage =
    sanitizeInputText(params.message, 140) || `¡Mucha fuerza para ${campaign.petName}!`;

  const newContribution: CampaignContribution = {
    id: `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    donorName: cleanDonor,
    amountArs: cleanAmount,
    message: cleanMessage,
    status: params.autoConfirm ? 'confirmed' : 'in_review',
    createdAt: Date.now(),
  };

  const nextConfirmed =
    (campaign.confirmedAmountArs || 0) + (params.autoConfirm ? cleanAmount : 0);
  const nextPending =
    (campaign.pendingReviewAmountArs || 0) + (params.autoConfirm ? 0 : cleanAmount);
  const goal = campaign.goalAmountArs || 0;
  const totalAfter = nextConfirmed + nextPending;

  const reached100 = goal > 0 && totalAfter >= goal;

  return {
    ...campaign,
    confirmedAmountArs: nextConfirmed,
    pendingReviewAmountArs: nextPending,
    status: reached100 ? 'completed' : campaign.status,
    contributions: [newContribution, ...(campaign.contributions || [])],
  };
}

/**
 * Matches a physical supply item to an active local Sponsor in Venado Tuerto for B2B solidarity purchase
 */
export function findMatchingSponsorForSupply(
  supply: SupplyItem,
  sponsors: Sponsor[]
): Sponsor | null {
  const active = sponsors.filter((s) => s.isActive);
  if (active.length === 0) return null;

  if (supply.category === 'alimento') {
    return active.find((s) => s.category === 'pet_shop') || active[0];
  }
  if (supply.category === 'medicina' || supply.category === 'insumos') {
    return active.find((s) => s.category === 'veterinaria') || active[0];
  }
  return active[0];
}
