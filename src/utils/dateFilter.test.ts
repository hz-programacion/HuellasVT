import test from 'node:test';
import assert from 'node:assert/strict';
import { isWithinDateRange, formatRelativeTime } from './dateFilter';
import {
  sanitizeInputText,
  validateAndFormatWhatsApp,
  truncateClean,
  verifyHappyEndingAuthorization,
  getPhoneLast4Digits,
} from './security';

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

test('isWithinDateRange accurately filters 24h, 7d, 30d and all', () => {
  const now = 1762900000000;

  const pet12hAgo = { createdAt: now - 12 * HOUR_MS, date: '2026-11-12' };
  const pet3dAgo = { createdAt: now - 3 * DAY_MS, date: '2026-11-09' };
  const pet15dAgo = { createdAt: now - 15 * DAY_MS, date: '2026-10-28' };
  const pet45dAgo = { createdAt: now - 45 * DAY_MS, date: '2026-09-28' };

  // 24h filter
  assert.equal(isWithinDateRange(pet12hAgo, '24h', now), true);
  assert.equal(isWithinDateRange(pet3dAgo, '24h', now), false);

  // 7d filter
  assert.equal(isWithinDateRange(pet12hAgo, '7d', now), true);
  assert.equal(isWithinDateRange(pet3dAgo, '7d', now), true);
  assert.equal(isWithinDateRange(pet15dAgo, '7d', now), false);

  // 30d filter
  assert.equal(isWithinDateRange(pet15dAgo, '30d', now), true);
  assert.equal(isWithinDateRange(pet45dAgo, '30d', now), false);

  // all filter
  assert.equal(isWithinDateRange(pet45dAgo, 'all', now), true);
});

test('formatRelativeTime returns clear Spanish relative strings', () => {
  const now = 1762900000000;
  assert.equal(formatRelativeTime(now - 2 * 60 * 1000, now), 'Hace instantes');
  assert.equal(formatRelativeTime(now - 5 * HOUR_MS, now), 'Hace 5h');
  assert.equal(formatRelativeTime(now - 1 * DAY_MS, now), 'Ayer');
  assert.equal(formatRelativeTime(now - 4 * DAY_MS, now), 'Hace 4 días');
});

test('sanitizeInputText strips HTML tags and script vectors', () => {
  const dirty = '<script>alert("xss")</script>Perro <b>encontrado</b> en   Plaza San Martín';
  const clean = sanitizeInputText(dirty, 100);
  assert.equal(clean, 'alert("xss")Perro encontrado en Plaza San Martín');
  assert.ok(!clean.includes('<'));
  assert.ok(!clean.includes('>'));
});

test('validateAndFormatWhatsApp normalizes Venado Tuerto numbers', () => {
  const res1 = validateAndFormatWhatsApp('03462 15-551423');
  assert.equal(res1.isValid, true);
  assert.equal(res1.cleanDigits, '3462551423');
  assert.equal(res1.formattedDisplay, '3462 551423');

  const resInvalid = validateAndFormatWhatsApp('1234');
  assert.equal(resInvalid.isValid, false);
});

test('truncateClean truncates at word boundaries without cutting words awkwardly', () => {
  const longText = 'Mora y sus 3 cachorros encontrados en un terreno baldío del Barrio Santa Fe';
  const short = truncateClean(longText, 35);
  assert.ok(short.length <= 35);
  assert.ok(short.endsWith('…'));
});

test('verifyHappyEndingAuthorization blocks public phone last 4 digits and requires secret PIN or owner UID', () => {
  const samplePet = {
    id: 'pet-vt-1',
    authorWhatsApp: '3462 551423',
    authorUid: 'owner-uid-123',
    securityPin: '8492',
  };

  assert.equal(getPhoneLast4Digits(samplePet.authorWhatsApp), '1423');

  // Rejects when checkbox is false
  const noCheck = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '8492',
    confirmedSafeCheckbox: false,
  });
  assert.equal(noCheck.authorized, false);

  // Explicitly blocks public phone last 4 digits ('1423') to prevent spoofing!
  const spoofAttemptWithPublicPhone = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '1423',
    confirmedSafeCheckbox: true,
  });
  assert.equal(spoofAttemptWithPublicPhone.authorized, false);
  assert.ok(spoofAttemptWithPublicPhone.error?.includes('público'));

  // Approves exact private securityPin ('8492')
  const validPin = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '8492',
    confirmedSafeCheckbox: true,
  });
  assert.equal(validPin.authorized, true);
  assert.equal(validPin.method, 'secret_pin');

  // Approves authenticated publisher account
  const validOwnerUid = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '',
    confirmedSafeCheckbox: true,
    currentUserUid: 'owner-uid-123',
  });
  assert.equal(validOwnerUid.authorized, true);
  assert.equal(validOwnerUid.method, 'owner_account');
});

