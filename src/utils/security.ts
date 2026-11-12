import { Pet } from '../types';

/**
 * Security, input sanitization, ownership verification, and anti-spam validation utilities for Huella VT.
 */

const LAST_PUBLISH_KEY = 'huella_vt_last_publish_ts';
const MIN_PUBLISH_INTERVAL_MS = 15 * 1000; // 15 seconds cooldown between posts

/**
 * Strips HTML tags, control characters, and dangerous script patterns from user input
 */
export function sanitizeInputText(input: string, maxLength = 300): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Strip control chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalizes and validates an Argentine WhatsApp phone number (specifically tailored for Venado Tuerto 3462 or national numbers)
 */
export function validateAndFormatWhatsApp(rawPhone: string): {
  isValid: boolean;
  cleanDigits: string;
  formattedDisplay: string;
  error?: string;
} {
  const digits = (rawPhone || '').replace(/\D/g, '');

  // Strip leading 549 or 54 or 0
  let local = digits;
  if (local.startsWith('549')) {
    local = local.slice(3);
  } else if (local.startsWith('54')) {
    local = local.slice(2);
  }
  if (local.startsWith('0')) {
    local = local.slice(1);
  }

  // Remove typical Argentine '15' after area code if 11-12 digits
  if (local.startsWith('346215') && local.length >= 10) {
    local = '3462' + local.slice(6);
  }

  if (local.length < 8 || local.length > 13) {
    return {
      isValid: false,
      cleanDigits: local,
      formattedDisplay: rawPhone,
      error: 'Ingresá un número válido con código de área (ej. 3462 551234).',
    };
  }

  // Format nicely if it starts with 3462 (Venado Tuerto)
  const formattedDisplay = local.startsWith('3462')
    ? `3462 ${local.slice(4)}`
    : local;

  return {
    isValid: true,
    cleanDigits: local,
    formattedDisplay,
  };
}

/**
 * Extracts the last 4 digits of a phone number for ownership verification
 */
export function getPhoneLast4Digits(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length < 4) return digits;
  return digits.slice(-4);
}

/**
 * Returns a masked hint of the publisher's phone (e.g. "3462 ••••23")
 * so the real owner knows which phone number was used without exposing the full last 4 digits.
 */
export function getMaskedPhoneHint(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  const last2 = digits.slice(-2);
  return `•••• ••${last2}`;
}

export interface HappyEndingVerificationResult {
  authorized: boolean;
  method?: 'admin' | 'owner_account' | 'phone_last4';
  error?: string;
}

/**
 * Verifies whether a user is authorized to mark a pet report as "Final Feliz / Resuelto".
 * Prevents accidental 1-click status changes by random visitors.
 */
export function verifyHappyEndingAuthorization(params: {
  pet: Pick<Pet, 'authorWhatsApp' | 'authorUid'>;
  inputCode: string;
  confirmedSafeCheckbox: boolean;
  currentUserUid?: string | null;
  isSuperAdmin?: boolean;
}): HappyEndingVerificationResult {
  const { pet, inputCode, confirmedSafeCheckbox, currentUserUid, isSuperAdmin } = params;

  if (!confirmedSafeCheckbox) {
    return {
      authorized: false,
      error: 'Debés marcar la casilla confirmando que la mascota ya está a salvo con su familia.',
    };
  }

  // 1. SuperAdmin override
  if (isSuperAdmin) {
    return { authorized: true, method: 'admin' };
  }

  // 2. Authenticated publisher account match
  if (currentUserUid && pet.authorUid && currentUserUid === pet.authorUid) {
    return { authorized: true, method: 'owner_account' };
  }

  // 3. Phone last 4 digits or Master Moderators Code ('VT24')
  const cleanInput = (inputCode || '').trim().toUpperCase();
  if (cleanInput === 'VT24') {
    return { authorized: true, method: 'admin' };
  }

  const inputDigits = cleanInput.replace(/\D/g, '');
  const expectedLast4 = getPhoneLast4Digits(pet.authorWhatsApp);

  if (inputDigits.length >= 4 && expectedLast4.length === 4) {
    if (inputDigits.slice(-4) === expectedLast4) {
      return { authorized: true, method: 'phone_last4' };
    }
  }

  return {
    authorized: false,
    error:
      'Código incorrecto. Ingresá los últimos 4 dígitos del WhatsApp con el que se publicó el aviso.',
  };
}

/**
 * Checks client-side rate limit to prevent accidental double-submits or spam
 */
export function checkPublishRateLimit(nowMs: number = Date.now()): {
  allowed: boolean;
  waitSeconds: number;
} {
  if (typeof localStorage === 'undefined') {
    return { allowed: true, waitSeconds: 0 };
  }
  const lastRaw = localStorage.getItem(LAST_PUBLISH_KEY);
  if (!lastRaw) return { allowed: true, waitSeconds: 0 };

  const lastTs = Number(lastRaw);
  if (Number.isNaN(lastTs)) return { allowed: true, waitSeconds: 0 };

  const elapsed = nowMs - lastTs;
  if (elapsed < MIN_PUBLISH_INTERVAL_MS) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((MIN_PUBLISH_INTERVAL_MS - elapsed) / 1000),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

export function recordPublishTimestamp(nowMs: number = Date.now()): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LAST_PUBLISH_KEY, String(nowMs));
  }
}

/**
 * Truncates text cleanly at word boundary with ellipsis so UI or Canvas never overflows
 */
export function truncateClean(text: string, maxChars: number): string {
  if (!text) return '';
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  const sliced = clean.slice(0, maxChars - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.6) {
    return sliced.slice(0, lastSpace) + '…';
  }
  return sliced + '…';
}
