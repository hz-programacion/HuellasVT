import test from 'node:test';
import assert from 'node:assert/strict';
import { getSponsorExpirationStatus, shouldInjectSponsorCard, calculateStorageUsage } from './sponsorRules';
import { Pet, Sponsor } from '../types';

test('getSponsorExpirationStatus correctly classifies active, expiring soon, and expired', () => {
  const baseDate = new Date(2026, 10, 12); // Nov 12, 2026

  // Expired 2 days ago
  const expired = getSponsorExpirationStatus('2026-11-10', baseDate);
  assert.equal(expired.status, 'expired');
  assert.ok(expired.daysRemaining < 0);

  // Expiring in 3 days (<= 5)
  const expiringSoon = getSponsorExpirationStatus('2026-11-15', baseDate);
  assert.equal(expiringSoon.status, 'expiring_soon');
  assert.ok(expiringSoon.daysRemaining <= 5 && expiringSoon.daysRemaining > 0);

  // Active in 20 days
  const active = getSponsorExpirationStatus('2026-12-02', baseDate);
  assert.equal(active.status, 'active');
  assert.ok(active.daysRemaining > 5);
});

test('shouldInjectSponsorCard triggers after every 5 items', () => {
  assert.equal(shouldInjectSponsorCard(0), false);
  assert.equal(shouldInjectSponsorCard(3), false);
  assert.equal(shouldInjectSponsorCard(4), true); // 5th item -> position 6 is sponsor
  assert.equal(shouldInjectSponsorCard(8), false);
  assert.equal(shouldInjectSponsorCard(9), true); // 10th item
});

test('calculateStorageUsage computes MB against 1024 MB free limit', () => {
  const dummyPets: Pet[] = [
    {
      id: 'p1',
      name: 'Firulais',
      status: 'lost',
      species: 'dog',
      breed: 'Callejero',
      color: 'Negro',
      gender: 'male',
      barrio: 'Barrio Rivadavia',
      addressOrReference: 'España 500',
      date: '2026-11-10',
      description: 'Perdido',
      photoBase64: 'A'.repeat(50000), // ~50KB
      authorName: 'Ana',
      authorWhatsApp: '3462123456',
      createdAt: Date.now(),
    },
  ];

  const dummySponsors: Sponsor[] = [
    {
      id: 's1',
      name: 'Veterinaria Central',
      category: 'veterinaria',
      tier: 'guardia_24h',
      isOnDutyToday: true,
      address: 'Mitre 200',
      phone: '3462-421111',
      whatsApp: '3462421111',
      mapsUrl: 'https://maps.google.com',
      promoTitle: 'Consulta 15% OFF',
      promoDescription: 'Mencionando Huella VT',
      couponCode: 'HUELLAVT15',
      expirationDate: '2026-12-31',
      isActive: true,
      createdAt: Date.now(),
    },
  ];

  const usage = calculateStorageUsage(dummyPets, dummySponsors);
  assert.equal(usage.maxMb, 1024);
  assert.ok(usage.usedMb > 0);
  assert.equal(usage.totalDocs, 2);
  assert.ok(usage.percent < 1);
});
