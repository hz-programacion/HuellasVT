import { Pet } from '../types';

/**
 * Security, input sanitization, ownership verification, and anti-spam validation utilities for Huella VT.
 */

const LAST_PUBLISH_KEY = 'huella_vt_last_publish_ts';
const OWNED_PETS_STORAGE_KEY = 'huella_vt_device_owned_pets_v1';
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
 * Extracts the last 4 digits of a phone number
 */
export function getPhoneLast4Digits(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length < 4) return digits;
  return digits.slice(-4);
}

/**
 * Returns a masked hint of the publisher's phone (e.g. "•••• ••23")
 */
export function getMaskedPhoneHint(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  const last2 = digits.slice(-2);
  return `•••• ••${last2}`;
}

/**
 * Generates a random 4-digit private security PIN that is different from the phone's last 4 digits
 */
export function generateRandomSecurityPin(rawPhone = ''): string {
  const phoneLast4 = getPhoneLast4Digits(rawPhone);
  let pin = String(Math.floor(1000 + Math.random() * 9000));
  if (pin === phoneLast4) {
    pin = String(((Number(pin) + 1357) % 9000) + 1000);
  }
  return pin;
}

/**
 * Derives the private 4-digit secret PIN for a pet.
 * Never equals the public phone number's last 4 digits.
 */
export function deriveSecretPinForPet(
  pet: Pick<Pet, 'id' | 'authorWhatsApp' | 'securityPin'>
): string {
  const phoneLast4 = getPhoneLast4Digits(pet.authorWhatsApp);
  if (pet.securityPin && /^\d{4,6}$/.test(pet.securityPin.trim()) && pet.securityPin.trim() !== phoneLast4) {
    return pet.securityPin.trim();
  }
  const seedStr = `${pet.id || 'vt'}-secret-pin`;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let code = String((Math.abs(hash) % 9000) + 1000);
  if (code === phoneLast4) {
    code = String(((Number(code) + 2468) % 9000) + 1000);
  }
  return code;
}

/**
 * Records that the current browser/device created this pet alert so the owner is recognized seamlessly
 */
export function recordDeviceOwnedPet(petId: string, securityPin: string): void {
  if (typeof localStorage === 'undefined' || !petId) return;
  try {
    const raw = localStorage.getItem(OWNED_PETS_STORAGE_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[petId] = securityPin;
    localStorage.setItem(OWNED_PETS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function isPetOwnedByCurrentDevice(petId?: string): boolean {
  if (typeof localStorage === 'undefined' || !petId) return false;
  try {
    const raw = localStorage.getItem(OWNED_PETS_STORAGE_KEY);
    if (!raw) return false;
    const map: Record<string, string> = JSON.parse(raw);
    return Boolean(map[petId]);
  } catch {
    return false;
  }
}

export interface HappyEndingVerificationResult {
  authorized: boolean;
  method?: 'admin' | 'owner_account' | 'device_owner' | 'secret_pin';
  error?: string;
}

/**
 * Verifies whether a user is authorized to mark a pet report as "Final Feliz / Resuelto".
 * Explicitly blocks using the public phone number's last 4 digits because the phone is visible on the card.
 * Requires either:
 *  - Authenticated publisher UID
 *  - Device ownership token (created on this device)
 *  - Private 4-digit Security PIN (created at publication time, never shown on public cards)
 *  - Master Moderator Code ('VT24')
 */
export function verifyHappyEndingAuthorization(params: {
  pet: Pick<Pet, 'id' | 'authorWhatsApp' | 'authorUid' | 'securityPin'>;
  inputCode: string;
  confirmedSafeCheckbox: boolean;
  currentUserUid?: string | null;
  isDeviceOwner?: boolean;
  isSuperAdmin?: boolean;
}): HappyEndingVerificationResult {
  const {
    pet,
    inputCode,
    confirmedSafeCheckbox,
    currentUserUid,
    isDeviceOwner,
    isSuperAdmin,
  } = params;

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

  // 3. Created on this browser/device
  if (isDeviceOwner || isPetOwnedByCurrentDevice(pet.id)) {
    return { authorized: true, method: 'device_owner' };
  }

  // 4. Master Moderator Code ('VT24') or Private Secret PIN
  const cleanInput = (inputCode || '').trim().toUpperCase();
  if (cleanInput === 'VT24') {
    return { authorized: true, method: 'admin' };
  }

  const publicPhoneLast4 = getPhoneLast4Digits(pet.authorWhatsApp);
  if (cleanInput && cleanInput === publicPhoneLast4) {
    return {
      authorized: false,
      error:
        'Por seguridad anti-sabotaje, no se aceptan los últimos 4 números del teléfono (ya que el número es público en la ficha). Ingresá tu PIN Secreto de 4 dígitos creado al publicar.',
    };
  }

  const expectedSecretPin = deriveSecretPinForPet(pet);
  if (cleanInput && cleanInput === expectedSecretPin.toUpperCase()) {
    return { authorized: true, method: 'secret_pin' };
  }

  return {
    authorized: false,
    error:
      'PIN Secreto incorrecto. Ingresá la Clave Privada de 4 dígitos que recibiste al publicar el aviso (o usá el botón para avisar al dueño por WhatsApp).',
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
