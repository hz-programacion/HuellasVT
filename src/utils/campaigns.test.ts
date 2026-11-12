import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCampaignProgress,
  determineInitialCampaignStatus,
  applyContributionToCampaign,
  formatArs,
} from './campaigns';
import { SolidarityCampaign } from '../types';

const mockCampaign: SolidarityCampaign = {
  id: 'camp-test-1',
  petName: 'Roco',
  species: 'dog',
  barrio: 'Barrio San Vicente',
  title: 'Cirugía traumatológica para Roco',
  story: 'Atropellado en Av. Chapuis, necesita clavo intramedular.',
  helpType: 'both',
  status: 'active',
  photoBase64: 'data:image/webp;base64,test',
  goalAmountArs: 100000,
  confirmedAmountArs: 70000,
  pendingReviewAmountArs: 15000,
  bankAlias: 'VET.SANMARTIN.VT',
  holderName: 'Veterinaria San Martín SRL',
  bankOrWallet: 'Banco Santa Fe',
  isDirectVetAccount: true,
  supplies: [
    {
      id: 'sup-1',
      name: 'Cajas de Doxiciclina 100mg',
      category: 'medicina',
      targetQty: 2,
      currentQty: 1,
      fulfilled: false,
    },
  ],
  vetClinicName: 'Veterinaria San Martín 24hs',
  isVerifiedShelter: false,
  shelterOrOrganizerName: 'Luciana G.',
  contactWhatsApp: '3462551423',
  contributions: [],
  createdAt: 1762900000000,
};

test('calculateCampaignProgress computes dual progress and hides Alias when 100% is reached', () => {
  const progress85 = calculateCampaignProgress(mockCampaign);
  assert.equal(progress85.confirmedPercent, 70);
  assert.equal(progress85.inReviewPercent, 15);
  assert.equal(progress85.totalPercent, 85);
  assert.equal(progress85.isGoalReached, false);
  assert.equal(progress85.shouldHideBankAlias, false);
  assert.equal(progress85.suppliesPercent, 50);

  // Now simulate a $15,000 neighbor contribution that pushes total to $100,000 (100%)
  const updated = applyContributionToCampaign(mockCampaign, {
    donorName: 'Sofía',
    amountArs: 15000,
    message: '¡Pronta recuperación para Roco!',
  });

  const progress100 = calculateCampaignProgress(updated);
  assert.equal(progress100.totalRaisedArs, 100000);
  assert.equal(progress100.totalPercent, 100);
  assert.equal(progress100.isGoalReached, true);
  assert.equal(progress100.shouldHideBankAlias, true);
  assert.equal(updated.status, 'completed');
  assert.equal(updated.contributions.length, 1);
  assert.equal(updated.contributions[0].donorName, 'Sofía');
});

test('determineInitialCampaignStatus fast-tracks verified shelters and holds neighbor campaigns for moderation', () => {
  assert.equal(determineInitialCampaignStatus(true), 'active');
  assert.equal(determineInitialCampaignStatus(false), 'pending_approval');
  assert.equal(formatArs(120000), '$120.000');
});
