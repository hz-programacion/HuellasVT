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

test('verifyHappyEndingAuthorization blocks unverified clicks and approves valid last 4 phone digits or owner UID', () => {
  const samplePet = {
    authorWhatsApp: '3462 551423',
    authorUid: 'owner-uid-123',
  };

  assert.equal(getPhoneLast4Digits(samplePet.authorWhatsApp), '1423');

  // Rejects when checkbox is false
  const noCheck = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '1423',
    confirmedSafeCheckbox: false,
  });
  assert.equal(noCheck.authorized, false);

  // Rejects wrong 4 digits
  const wrongCode = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '9999',
    confirmedSafeCheckbox: true,
  });
  assert.equal(wrongCode.authorized, false);

  // Approves exact last 4 digits of publisher WhatsApp
  const validLast4 = verifyHappyEndingAuthorization({
    pet: samplePet,
    inputCode: '1423',
    confirmedSafeCheckbox: true,
  });
  assert.equal(validLast4.authorized, true);
  assert.equal(validLast4.method, 'phone_last4');

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

