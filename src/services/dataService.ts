import { Pet, Sponsor, PetStatus, SolidarityCampaign } from '../types';
import { INITIAL_PETS, INITIAL_SPONSORS, INITIAL_CAMPAIGNS } from './seedData';
import {
  sanitizeInputText,
  validateAndFormatWhatsApp,
  recordPublishTimestamp,
  recordDeviceOwnedPet,
  generateRandomSecurityPin,
} from '../utils/security';
import { applyContributionToCampaign, determineInitialCampaignStatus } from '../utils/campaigns';
import {
  isFirebaseConfigured,
  db,
  auth,
  googleProvider,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
} from './firebase';

const CACHE_TTL_MS = 5 * 60 * 1000;
const PETS_LOCAL_STORAGE_KEY = 'huella_vt_pets_v2';
const SPONSORS_LOCAL_STORAGE_KEY = 'huella_vt_sponsors_v2';
const CAMPAIGNS_LOCAL_STORAGE_KEY = 'huella_vt_campaigns_v1';
const SESSION_CACHE_PETS_KEY = 'huella_vt_cache_pets_v2';
const SESSION_CACHE_SPONSORS_KEY = 'huella_vt_cache_sponsors_v2';
const SESSION_CACHE_CAMPAIGNS_KEY = 'huella_vt_cache_campaigns_v1';
const AUTH_USER_KEY = 'huella_vt_auth_user';

export interface AppUser {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  isFirebaseUser?: boolean;
}

type Listener = () => void;
const changeListeners: Set<Listener> = new Set();

export function subscribeToDataChanges(callback: Listener): () => void {
  changeListeners.add(callback);
  return () => {
    changeListeners.delete(callback);
  };
}

function notifyDataChanged() {
  sessionStorage.removeItem(SESSION_CACHE_PETS_KEY);
  sessionStorage.removeItem(SESSION_CACHE_SPONSORS_KEY);
  sessionStorage.removeItem(SESSION_CACHE_CAMPAIGNS_KEY);
  changeListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error notifying data change:', e);
    }
  });
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean as T;
}

// -------------------------------------------------------------
// Authentication
// -------------------------------------------------------------
export function getCurrentUser(): AppUser | null {
  if (isFirebaseConfigured && auth?.currentUser) {
    const u = auth.currentUser;
    return {
      uid: u.uid,
      displayName: u.displayName || 'Vecino de Venado Tuerto',
      email: u.email || undefined,
      photoURL: u.photoURL || undefined,
      isFirebaseUser: true,
    };
  }

  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function subscribeToAuthChanges(callback: (user: AppUser | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Vecino de Venado Tuerto',
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          isFirebaseUser: true,
        });
      } else {
        callback(getCurrentUser());
      }
    });
  }
  callback(getCurrentUser());
  return () => {};
}

export async function loginWithGoogle(): Promise<AppUser> {
  if (isFirebaseConfigured && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user: AppUser = {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Vecino de Venado Tuerto',
        email: result.user.email || undefined,
        photoURL: result.user.photoURL || undefined,
        isFirebaseUser: true,
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      console.warn('Firebase signInWithPopup fallback to local session:', err);
    }
  }

  const demoUser: AppUser = {
    uid: `user-vt-${Date.now().toString(36)}`,
    displayName: 'Vecino de Venado Tuerto',
    email: 'vecino.vt@huellavt.org',
    photoURL:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isFirebaseUser: false,
  };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
  return demoUser;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
  }
  localStorage.removeItem(AUTH_USER_KEY);
}

// -------------------------------------------------------------
// Pets Data Access
// -------------------------------------------------------------
export async function getPets(): Promise<Pet[]> {
  const cached = sessionStorage.getItem(SESSION_CACHE_PETS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data as Pet[];
      }
    } catch {
      // ignore
    }
  }

  const localData = localStorage.getItem(PETS_LOCAL_STORAGE_KEY);
  let baselinePets: Pet[];
  if (localData) {
    try {
      baselinePets = JSON.parse(localData);
    } catch {
      baselinePets = INITIAL_PETS;
      localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(baselinePets));
    }
  } else {
    baselinePets = INITIAL_PETS;
    localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(baselinePets));
  }

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'pets'),
        where('status', 'in', ['lost', 'found', 'adoption', 'resolved'])
      );
      const snapshot = await getDocs(q);
      const remoteList: Pet[] = [];
      snapshot.forEach((docSnapshot) => {
        const d = docSnapshot.data() as Pet;
        if (['lost', 'found', 'adoption', 'resolved'].includes(d.status)) {
          remoteList.push({ ...d, id: docSnapshot.id });
        }
      });

      if (remoteList.length > 0) {
        const mergedMap = new Map<string, Pet>();
        remoteList.forEach((p) => mergedMap.set(p.id, p));
        baselinePets.forEach((p) => {
          if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
        });
        const merged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        sessionStorage.setItem(
          SESSION_CACHE_PETS_KEY,
          JSON.stringify({ timestamp: Date.now(), data: merged })
        );
        return merged;
      }
    } catch (err) {
      if (
        auth?.currentUser &&
        err instanceof Error &&
        err.message.includes('Missing or insufficient permissions')
      ) {
        handleFirestoreError(err, OperationType.LIST, 'pets');
      }
      console.warn('Firestore getDocs fallback to local store:', err);
    }
  }

  sessionStorage.setItem(
    SESSION_CACHE_PETS_KEY,
    JSON.stringify({ timestamp: Date.now(), data: baselinePets })
  );
  return baselinePets;
}

export async function savePet(pet: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet> {
  const id = `pet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  );
  const waValidation = validateAndFormatWhatsApp(pet.authorWhatsApp);
  const activeUid = auth?.currentUser?.uid || pet.authorUid || `user-vt-${Date.now().toString(36)}`;
  const cleanPhone = waValidation.isValid
    ? waValidation.cleanDigits.slice(0, 25)
    : sanitizeInputText(pet.authorWhatsApp, 25);
  const finalSecurityPin =
    pet.securityPin && /^\d{4,6}$/.test(pet.securityPin.trim())
      ? pet.securityPin.trim()
      : generateRandomSecurityPin(cleanPhone);

  const newPet: Pet = stripUndefined({
    ...pet,
    id,
    name: sanitizeInputText(pet.name, 60) || 'Sin identificar',
    breed: sanitizeInputText(pet.breed, 60) || 'Mestizo',
    color: sanitizeInputText(pet.color, 80) || 'Varios colores',
    barrio: sanitizeInputText(pet.barrio, 60) || 'Barrio Centro',
    addressOrReference: sanitizeInputText(pet.addressOrReference || pet.barrio, 120),
    date: sanitizeInputText(pet.date, 20) || new Date().toISOString().split('T')[0],
    description: sanitizeInputText(pet.description, 400) || 'Sin descripción adicional.',
    collarInfo: pet.collarInfo ? sanitizeInputText(pet.collarInfo, 100) : undefined,
    shelterName: pet.shelterName ? sanitizeInputText(pet.shelterName, 80) : undefined,
    photoBase64: pet.photoBase64.slice(0, 450000),
    authorName: sanitizeInputText(pet.authorName, 60) || 'Vecino VT',
    authorWhatsApp: cleanPhone,
    authorUid: sanitizeInputText(activeUid, 128),
    securityPin: finalSecurityPin,
    createdAt: Date.now(),
  });

  if (isFirebaseConfigured && db && auth?.currentUser) {
    try {
      const firestorePayload = { ...newPet };
      delete firestorePayload.linkedCampaignId;
      delete firestorePayload.securityPin;
      delete firestorePayload.applauseCount;
      await setDoc(doc(db, 'pets', id), firestorePayload);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.CREATE, `pets/${id}`);
      }
      console.warn('Firestore setDoc fallback to local store:', err);
    }
  }

  const current = await getPets();
  const updated = [newPet, ...current];
  localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  recordPublishTimestamp();
  recordDeviceOwnedPet(id, finalSecurityPin);

  notifyDataChanged();
  return newPet;
}

export async function applaudPetReunion(petId: string): Promise<void> {
  const current = await getPets();
  const updated = current.map((p) => {
    if (p.id !== petId) return p;
    return {
      ...p,
      applauseCount: (p.applauseCount || 12) + 1,
    };
  });
  localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
}

export async function updatePetStatus(
  petId: string,
  newStatus: PetStatus,
  resolvedNotes?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: newStatus,
  };
  if (newStatus === 'resolved') {
    updateData.resolvedAt = Date.now();
    if (resolvedNotes) {
      updateData.resolvedNotes = sanitizeInputText(resolvedNotes, 200);
    }
  }

  if (isFirebaseConfigured && db && auth?.currentUser) {
    try {
      await updateDoc(doc(db, 'pets', petId), updateData);
    } catch (err) {
      console.warn('Firestore updateDoc fallback to local store:', err);
    }
  }

  const current = await getPets();
  const updated = current.map((p) => {
    if (p.id !== petId) return p;
    const next = { ...p, ...updateData } as Pet;
    if (newStatus !== 'resolved') {
      delete next.resolvedAt;
      delete next.resolvedNotes;
    }
    return next;
  });
  localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(updated));

  notifyDataChanged();
}

export async function updatePetDetails(updatedPet: Pet): Promise<Pet> {
  const cleanPet: Pet = stripUndefined({
    ...updatedPet,
    name: sanitizeInputText(updatedPet.name, 60) || 'Sin identificar',
    breed: sanitizeInputText(updatedPet.breed, 60) || 'Mestizo',
    color: sanitizeInputText(updatedPet.color, 80) || 'Varios colores',
    barrio: sanitizeInputText(updatedPet.barrio, 60) || 'Barrio Centro',
    addressOrReference: sanitizeInputText(updatedPet.addressOrReference || updatedPet.barrio, 120),
    description: sanitizeInputText(updatedPet.description, 400) || 'Sin descripción adicional.',
    collarInfo: updatedPet.collarInfo ? sanitizeInputText(updatedPet.collarInfo, 100) : undefined,
    shelterName: updatedPet.shelterName ? sanitizeInputText(updatedPet.shelterName, 80) : undefined,
    authorName: sanitizeInputText(updatedPet.authorName, 60) || 'Vecino VT',
    authorWhatsApp: sanitizeInputText(updatedPet.authorWhatsApp, 25),
    resolvedNotes: updatedPet.resolvedNotes
      ? sanitizeInputText(updatedPet.resolvedNotes, 200)
      : undefined,
  });

  const current = await getPets();
  const updated = current.map((p) => (p.id === cleanPet.id ? cleanPet : p));
  localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
  return cleanPet;
}

export async function deletePet(petId: string): Promise<void> {
  if (isFirebaseConfigured && db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, 'pets', petId));
    } catch (err) {
      if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.DELETE, `pets/${petId}`);
      }
      console.warn('Firestore deleteDoc fallback to local store:', err);
    }
  }

  const current = await getPets();
  const updated = current.filter((p) => p.id !== petId);
  localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(updated));

  notifyDataChanged();
}

export async function cleanOldPets(daysThreshold = 30): Promise<number> {
  const current = await getPets();
  const now = Date.now();
  const cutoff = now - daysThreshold * 24 * 60 * 60 * 1000;

  const toKeep: Pet[] = [];
  const toDelete: Pet[] = [];

  for (const pet of current) {
    if (pet.createdAt < cutoff && pet.status === 'resolved') {
      toDelete.push(pet);
    } else {
      toKeep.push(pet);
    }
  }

  if (toDelete.length > 0) {
    localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(toKeep));
    notifyDataChanged();
  }

  return toDelete.length;
}

// -------------------------------------------------------------
// Sponsors Data Access
// -------------------------------------------------------------
export async function getSponsors(): Promise<Sponsor[]> {
  const cached = sessionStorage.getItem(SESSION_CACHE_SPONSORS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data as Sponsor[];
      }
    } catch {
      // ignore
    }
  }

  const local = localStorage.getItem(SPONSORS_LOCAL_STORAGE_KEY);
  let baselineSponsors: Sponsor[];
  if (local) {
    try {
      baselineSponsors = JSON.parse(local);
    } catch {
      baselineSponsors = INITIAL_SPONSORS;
      localStorage.setItem(SPONSORS_LOCAL_STORAGE_KEY, JSON.stringify(baselineSponsors));
    }
  } else {
    baselineSponsors = INITIAL_SPONSORS;
    localStorage.setItem(SPONSORS_LOCAL_STORAGE_KEY, JSON.stringify(baselineSponsors));
  }

  if (isFirebaseConfigured && db) {
    try {
      const sponsorsQuery = query(
        collection(db, 'sponsors'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(sponsorsQuery);
      const remoteList: Sponsor[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Sponsor;
        if (data.isActive) {
          remoteList.push({ ...data, id: d.id });
        }
      });
      if (remoteList.length > 0) {
        const mergedMap = new Map<string, Sponsor>();
        remoteList.forEach((s) => mergedMap.set(s.id, s));
        baselineSponsors.forEach((s) => {
          if (!mergedMap.has(s.id)) mergedMap.set(s.id, s);
        });
        const merged = Array.from(mergedMap.values());
        sessionStorage.setItem(
          SESSION_CACHE_SPONSORS_KEY,
          JSON.stringify({ timestamp: Date.now(), data: merged })
        );
        return merged;
      }
    } catch (err) {
      console.warn('Firestore getSponsors fallback to local store:', err);
    }
  }

  sessionStorage.setItem(
    SESSION_CACHE_SPONSORS_KEY,
    JSON.stringify({ timestamp: Date.now(), data: baselineSponsors })
  );
  return baselineSponsors;
}

export async function saveSponsor(
  sponsor: Omit<Sponsor, 'id' | 'createdAt'> & { id?: string }
): Promise<Sponsor> {
  const id = (
    sponsor.id || `spon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const item: Sponsor = stripUndefined({
    ...sponsor,
    id,
    name: sanitizeInputText(sponsor.name, 80),
    address: sanitizeInputText(sponsor.address, 120),
    phone: sanitizeInputText(sponsor.phone, 30),
    whatsApp: sanitizeInputText(sponsor.whatsApp, 25),
    mapsUrl: sanitizeInputText(sponsor.mapsUrl, 300),
    promoTitle: sanitizeInputText(sponsor.promoTitle, 120),
    promoDescription: sanitizeInputText(sponsor.promoDescription, 260),
    couponCode: sanitizeInputText(sponsor.couponCode, 40),
    expirationDate: sanitizeInputText(sponsor.expirationDate, 20),
    createdAt: Date.now(),
  });

  if (isFirebaseConfigured && db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'sponsors', id), item);
    } catch (err) {
      console.warn('Firestore setDoc sponsor fallback to local store:', err);
    }
  }

  const current = await getSponsors();
  const index = current.findIndex((s) => s.id === id);
  let updated: Sponsor[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  localStorage.setItem(SPONSORS_LOCAL_STORAGE_KEY, JSON.stringify(updated));

  notifyDataChanged();
  return item;
}

export async function deleteSponsor(sponsorId: string): Promise<void> {
  const current = await getSponsors();
  const updated = current.filter((s) => s.id !== sponsorId);
  localStorage.setItem(SPONSORS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
}

// -------------------------------------------------------------
// Solidarity Campaigns & Supplies Bank Data Access
// -------------------------------------------------------------
export async function getCampaigns(): Promise<SolidarityCampaign[]> {
  const cached = sessionStorage.getItem(SESSION_CACHE_CAMPAIGNS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data as SolidarityCampaign[];
      }
    } catch {
      // ignore
    }
  }

  const local = localStorage.getItem(CAMPAIGNS_LOCAL_STORAGE_KEY);
  let campaigns: SolidarityCampaign[];
  if (local) {
    try {
      campaigns = JSON.parse(local);
    } catch {
      campaigns = INITIAL_CAMPAIGNS;
      localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(campaigns));
    }
  } else {
    campaigns = INITIAL_CAMPAIGNS;
    localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(campaigns));
  }

  sessionStorage.setItem(
    SESSION_CACHE_CAMPAIGNS_KEY,
    JSON.stringify({ timestamp: Date.now(), data: campaigns })
  );
  return campaigns;
}

export async function createSolidarityCampaign(
  draft: Omit<SolidarityCampaign, 'id' | 'status' | 'createdAt' | 'contributions'>
): Promise<SolidarityCampaign> {
  const id = `camp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const initialStatus = determineInitialCampaignStatus(draft.isVerifiedShelter);

  const newCampaign: SolidarityCampaign = stripUndefined({
    ...draft,
    id,
    petName: sanitizeInputText(draft.petName, 60) || 'Rescatado VT',
    title: sanitizeInputText(draft.title, 100) || 'Colecta Solidaria',
    story: sanitizeInputText(draft.story, 450) || '',
    vetClinicName: sanitizeInputText(draft.vetClinicName, 90) || 'Veterinaria de Venado Tuerto',
    shelterOrOrganizerName: sanitizeInputText(draft.shelterOrOrganizerName, 80) || 'Vecino de VT',
    contactWhatsApp: sanitizeInputText(draft.contactWhatsApp, 25),
    bankAlias: draft.bankAlias ? sanitizeInputText(draft.bankAlias, 50).toUpperCase() : undefined,
    cbuCvu: draft.cbuCvu ? sanitizeInputText(draft.cbuCvu, 30) : undefined,
    holderName: draft.holderName ? sanitizeInputText(draft.holderName, 80) : undefined,
    bankOrWallet: draft.bankOrWallet ? sanitizeInputText(draft.bankOrWallet, 50) : undefined,
    status: initialStatus,
    contributions: [],
    createdAt: Date.now(),
  });

  const current = await getCampaigns();
  const updated = [newCampaign, ...current];
  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
  return newCampaign;
}

export async function reportCampaignTransfer(
  campaignId: string,
  params: { donorName: string; amountArs: number; message: string }
): Promise<SolidarityCampaign | null> {
  const current = await getCampaigns();
  let updatedTarget: SolidarityCampaign | null = null;

  const updatedList = current.map((c) => {
    if (c.id !== campaignId) return c;
    updatedTarget = applyContributionToCampaign(c, params);
    return updatedTarget;
  });

  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  notifyDataChanged();
  return updatedTarget;
}

export async function toggleSupplyItemStatus(
  campaignId: string,
  supplyId: string,
  incrementByOne = true
): Promise<void> {
  const current = await getCampaigns();
  const updated = current.map((c) => {
    if (c.id !== campaignId) return c;
    const nextSupplies = c.supplies.map((s) => {
      if (s.id !== supplyId) return s;
      if (incrementByOne && !s.fulfilled) {
        const nextQty = Math.min(s.targetQty, s.currentQty + 1);
        return {
          ...s,
          currentQty: nextQty,
          fulfilled: nextQty >= s.targetQty,
        };
      }
      const nextFulfilled = !s.fulfilled;
      return {
        ...s,
        fulfilled: nextFulfilled,
        currentQty: nextFulfilled ? s.targetQty : 0,
      };
    });
    return { ...c, supplies: nextSupplies };
  });

  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
}

export async function updateCampaignAdmin(
  campaignId: string,
  patch: Partial<SolidarityCampaign>
): Promise<void> {
  const current = await getCampaigns();
  const updated = current.map((c) => {
    if (c.id !== campaignId) return c;
    const next = { ...c, ...patch };
    if (
      next.goalAmountArs &&
      (next.confirmedAmountArs || 0) + (next.pendingReviewAmountArs || 0) >= next.goalAmountArs
    ) {
      next.status = 'completed';
    }
    return next;
  });

  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
}

export async function confirmAllPendingContributions(campaignId: string): Promise<void> {
  const current = await getCampaigns();
  const updated = current.map((c) => {
    if (c.id !== campaignId) return c;
    const nextConfirmed = (c.confirmedAmountArs || 0) + (c.pendingReviewAmountArs || 0);
    const nextContribs = c.contributions.map((item) => ({
      ...item,
      status: 'confirmed' as const,
    }));
    const reached100 = Boolean(c.goalAmountArs && nextConfirmed >= c.goalAmountArs);
    return {
      ...c,
      confirmedAmountArs: nextConfirmed,
      pendingReviewAmountArs: 0,
      status: reached100 ? ('completed' as const) : c.status,
      contributions: nextContribs,
    };
  });

  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const current = await getCampaigns();
  const updated = current.filter((c) => c.id !== campaignId);
  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  notifyDataChanged();
}

export function resetToSeedData(): void {
  localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PETS));
  localStorage.setItem(SPONSORS_LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SPONSORS));
  localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CAMPAIGNS));
  notifyDataChanged();
}

export function exportBackupDataset(
  pets: Pet[],
  sponsors: Sponsor[],
  campaigns: SolidarityCampaign[] = []
): string {
  return JSON.stringify(
    {
      platform: 'HUELLA VT · Venado Tuerto',
      exportedAt: new Date().toISOString(),
      petsCount: pets.length,
      sponsorsCount: sponsors.length,
      campaignsCount: campaigns.length,
      pets,
      sponsors,
      campaigns,
    },
    null,
    2
  );
}

export function importBackupDataset(rawJson: string): {
  petsCount: number;
  sponsorsCount: number;
  campaignsCount: number;
} {
  const parsed = JSON.parse(rawJson);
  const incomingPets = Array.isArray(parsed.pets) ? (parsed.pets as Pet[]) : [];
  const incomingSponsors = Array.isArray(parsed.sponsors) ? (parsed.sponsors as Sponsor[]) : [];
  const incomingCampaigns = Array.isArray(parsed.campaigns)
    ? (parsed.campaigns as SolidarityCampaign[])
    : [];

  if (
    incomingPets.length === 0 &&
    incomingSponsors.length === 0 &&
    incomingCampaigns.length === 0
  ) {
    throw new Error('El archivo JSON no contiene registros válidos.');
  }

  if (incomingPets.length > 0) {
    localStorage.setItem(PETS_LOCAL_STORAGE_KEY, JSON.stringify(incomingPets));
  }
  if (incomingSponsors.length > 0) {
    localStorage.setItem(SPONSORS_LOCAL_STORAGE_KEY, JSON.stringify(incomingSponsors));
  }
  if (incomingCampaigns.length > 0) {
    localStorage.setItem(CAMPAIGNS_LOCAL_STORAGE_KEY, JSON.stringify(incomingCampaigns));
  }

  notifyDataChanged();
  return {
    petsCount: incomingPets.length,
    sponsorsCount: incomingSponsors.length,
    campaignsCount: incomingCampaigns.length,
  };
}
