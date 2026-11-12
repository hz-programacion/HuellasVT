import React, { useState } from 'react';
import { Pet, PetStatus, PetSpecies, PetSize, PetAge, VENADO_TUERTO_BARRIOS } from '../types';
import { compressImageFile, formatFileSize, CompressionResult } from '../utils/imageCompressor';
import {
  validateAndFormatWhatsApp,
  checkPublishRateLimit,
  generateRandomSecurityPin,
} from '../utils/security';
import { savePet, getCurrentUser, loginWithGoogle } from '../services/dataService';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface PublishModalProps {
  onClose: () => void;
  onPetCreated: (newPet: Pet) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ onClose, onPetCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [status, setStatus] = useState<PetStatus>('lost');
  const [photoResult, setPhotoResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Step 2 states
  const [name, setName] = useState('');
  const [isUnknownName, setIsUnknownName] = useState(false);
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [barrio, setBarrio] = useState<string>(VENADO_TUERTO_BARRIOS[0]);
  const [addressOrReference, setAddressOrReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [collarInfo, setCollarInfo] = useState('');

  // Adoption specific
  const [size, setSize] = useState<PetSize>('medium');
  const [age, setAge] = useState<PetAge>('young');
  const [isCastrated, setIsCastrated] = useState(false);
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isKidFriendly, setIsKidFriendly] = useState(true);
  const [isUrgentTransit, setIsUrgentTransit] = useState(false);
  const [shelterName, setShelterName] = useState('');

  // Step 3 states
  const [authorName, setAuthorName] = useState(() => getCurrentUser()?.displayName || '');
  const [authorWhatsApp, setAuthorWhatsApp] = useState('');
  const [securityPin, setSecurityPin] = useState(() => generateRandomSecurityPin());

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg(null);
      const result = await compressImageFile(file, 600, 0.7);
      setPhotoResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al comprimir la imagen';
      setErrorMsg(message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!photoResult) {
        setErrorMsg('Por favor seleccioná una foto para que los vecinos reconozcan a la mascota.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!isUnknownName && !name.trim()) {
        setErrorMsg('Ingresá el nombre o marcá la opción "Sin nombre conocido".');
        return;
      }
      if (!color.trim()) {
        setErrorMsg('Ingresá el color o rasgos principales de la mascota.');
        return;
      }
      if (!description.trim()) {
        setErrorMsg('Agregá una breve descripción (dónde se vio, temperamento, etc.).');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setErrorMsg('Por favor ingresá tu nombre o el de la persona de contacto.');
      return;
    }

    const phoneCheck = validateAndFormatWhatsApp(authorWhatsApp);
    if (!phoneCheck.isValid) {
      setErrorMsg(phoneCheck.error || 'Ingresá un número de WhatsApp válido.');
      return;
    }

    const rateCheck = checkPublishRateLimit();
    if (!rateCheck.allowed) {
      setErrorMsg(
        `Protección anti-spam activa: por favor esperá ${rateCheck.waitSeconds}s antes de publicar otra alerta.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Auto login in 1 click if not logged in
      let currentUser = getCurrentUser();
      if (!currentUser) {
        currentUser = await loginWithGoogle();
      }

      const finalName = isUnknownName || !name.trim() ? 'Sin identificar' : name.trim();

      const newPet = await savePet({
        name: finalName,
        status,
        species,
        breed: breed.trim() || 'Mestizo',
        color: color.trim(),
        gender,
        size,
        age,
        barrio,
        addressOrReference: addressOrReference.trim() || barrio,
        date,
        description: description.trim(),
        collarInfo: collarInfo.trim() || undefined,
        isCastrated,
        isVaccinated,
        isKidFriendly,
        isUrgentTransit,
        shelterName: shelterName.trim() || undefined,
        isVerifiedShelter: Boolean(shelterName.trim()),
        photoBase64: photoResult!.base64,
        photoOriginalSizeKb: photoResult!.originalSizeKb,
        photoOptimizedSizeKb: photoResult!.optimizedSizeKb,
        authorName: authorName.trim(),
        authorWhatsApp: phoneCheck.cleanDigits,
        authorUid: currentUser.uid,
      });

      onPetCreated(newPet);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la publicación';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Publicar mascota"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-xl bg-white dark:bg-[#14171A] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-5 sm:p-6 text-[#111315] dark:text-[#EDEDED]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                PASO {step} DE 3
              </span>
              <h3 className="font-display font-bold text-lg">
                {step === 1 && 'Tipo de Alerta y Fotografía'}
                {step === 2 && 'Datos de la Mascota'}
                {step === 3 && 'Contacto Directo en Venado Tuerto'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className={`h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-[#FF4D38]' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
          <div className={`h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-[#FF4D38]' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
          <div className={`h-1.5 rounded-full transition-colors ${step === 3 ? 'bg-[#FF4D38]' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
          {/* STEP 1: Tipo y Foto con Compresión WebP */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                  ¿Cuál es el estado del reporte?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('lost')}
                    className={`py-3 px-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      status === 'lost'
                        ? 'border-[#FF4D38] bg-[#FF4D38]/10 text-[#FF4D38] font-bold shadow-sm'
                        : 'border-black/10 dark:border-white/10 hover:border-black/20 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="text-xl">🔴</span>
                    <span className="text-xs font-display">Se Perdió</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('found')}
                    className={`py-3 px-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      status === 'found'
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981] font-bold shadow-sm'
                        : 'border-black/10 dark:border-white/10 hover:border-black/20 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="text-xl">🟢</span>
                    <span className="text-xs font-display">Lo Encontré</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('adoption')}
                    className={`py-3 px-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      status === 'adoption'
                        ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED] font-bold shadow-sm'
                        : 'border-black/10 dark:border-white/10 hover:border-black/20 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="text-xl">🟣</span>
                    <span className="text-xs font-display">En Adopción</span>
                  </button>
                </div>
              </div>

              {/* Photo Upload with Client-Side Canvas WebP Compression */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                  Fotografía de la mascota (Optimizada en navegador)
                </label>

                {photoResult ? (
                  <div className="relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] p-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={photoResult.base64}
                        alt="Preview"
                        className="w-24 h-24 rounded-lg object-cover border border-black/10 dark:border-white/10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Optimizada con éxito!</span>
                        </div>
                        <div className="mt-1 text-xs text-neutral-500 font-mono space-y-0.5">
                          <p>Original: <span className="line-through">{formatFileSize(photoResult.originalSizeKb)}</span></p>
                          <p className="text-[#111315] dark:text-white font-bold">
                            WebP en memoria: {formatFileSize(photoResult.optimizedSizeKb)}
                            <span className="ml-1.5 text-emerald-600 font-semibold">(-{photoResult.savingsPercent}%)</span>
                          </p>
                        </div>
                        <label className="mt-2 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          Cambiar imagen
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-black/15 dark:border-white/15 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FF4D38] transition bg-[#FAF7F2] dark:bg-[#0B0C0E]">
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-[#FF4D38] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-mono text-neutral-500">
                          Comprimiendo a WebP en el navegador...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-3">
                          <Camera className="w-6 h-6" />
                        </div>
                        <span className="font-display font-semibold text-sm text-[#111315] dark:text-white">
                          Subir o sacar foto
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          PNG, JPG, HEIC. Se optimiza a 600x600 WebP (Cero costo de servidor).
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isCompressing}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Datos de la Mascota */}
          {step === 2 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUnknownName}
                    placeholder="Ej. Toby, Lola..."
                    className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38] disabled:opacity-50"
                  />
                  <label className="mt-1 flex items-center gap-2 text-xs text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnknownName}
                      onChange={(e) => setIsUnknownName(e.target.checked)}
                      className="rounded text-[#FF4D38]"
                    />
                    <span>Sin nombre conocido / Lo encontré</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                    Especie
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSpecies('dog')}
                      className={`py-2 px-3 rounded-lg border text-xs font-display flex items-center justify-center gap-1.5 transition ${
                        species === 'dog'
                          ? 'border-[#111315] dark:border-white bg-[#111315] text-white dark:bg-white dark:text-[#111315] font-bold'
                          : 'border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <span>🐶</span> Perro
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecies('cat')}
                      className={`py-2 px-3 rounded-lg border text-xs font-display flex items-center justify-center gap-1.5 transition ${
                        species === 'cat'
                          ? 'border-[#111315] dark:border-white bg-[#111315] text-white dark:bg-white dark:text-[#111315] font-bold'
                          : 'border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <span>🐱</span> Gato
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                    Barrio de Venado Tuerto
                  </label>
                  <select
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                  >
                    {VENADO_TUERTO_BARRIOS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                    Fecha del suceso
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                    Color o pelaje dominante
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Marrón con patas blancas, negro azabache..."
                    className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                    Raza o cruza (opcional)
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ej. Caniche, Mestizo, Ovejero cruza..."
                    className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                  Esquina o lugar de referencia
                </label>
                <input
                  type="text"
                  value={addressOrReference}
                  onChange={(e) => setAddressOrReference(e.target.value)}
                  placeholder="Ej. Cerca de Plaza San Martín / Belgrano al 700..."
                  className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                  Descripción y rasgos particulares
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comportamiento, collar, señas particulares, cicatrices..."
                  className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                />
              </div>

              {/* Extra toggles for Adoption */}
              {status === 'adoption' && (
                <div className="p-3 rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/5 space-y-2">
                  <div className="text-xs font-bold text-[#7C3AED] uppercase font-mono">
                    Ficha de Adopción Responsable
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCastrated}
                        onChange={(e) => setIsCastrated(e.target.checked)}
                      />
                      <span>Castrado/a</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVaccinated}
                        onChange={(e) => setIsVaccinated(e.target.checked)}
                      />
                      <span>Vacunado/a</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isKidFriendly}
                        onChange={(e) => setIsKidFriendly(e.target.checked)}
                      />
                      <span>Apto niños</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 dark:text-amber-400 font-semibold">
                      <input
                        type="checkbox"
                        checked={isUrgentTransit}
                        onChange={(e) => setIsUrgentTransit(e.target.checked)}
                      />
                      <span>🚨 Tránsito urgente</span>
                    </label>
                  </div>
                  <div className="pt-1">
                    <input
                      type="text"
                      value={shelterName}
                      onChange={(e) => setShelterName(e.target.value)}
                      placeholder="Nombre de Protectora / Refugio (si aplica)"
                      className="w-full px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A] text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Contacto */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
                <p className="font-semibold mb-1">💬 Contacto Directo en 1 Clic</p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Los vecinos podrán contactarte instantáneamente tocando el botón de WhatsApp desde la ficha o el cartel viral.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                  Tu Nombre o Apodo
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej. Lucas, Melina..."
                  className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-neutral-500 mb-1">
                  Número de WhatsApp (con o sin 0/15)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-neutral-400">
                    +54 9
                  </span>
                  <input
                    type="tel"
                    value={authorWhatsApp}
                    onChange={(e) => setAuthorWhatsApp(e.target.value)}
                    placeholder="3462 551234"
                    className="w-full pl-16 pr-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D38] font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Sugerencia para Venado Tuerto: 3462 XXXXXX
                </p>
              </div>

              {/* Private 4-Digit Security PIN to prevent public phone spoofing */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-mono font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    PIN Secreto de Cierre (4 dígitos privados)
                  </label>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200 font-mono text-[10px] font-bold">
                    NO PÚBLICO
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-28 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-white dark:bg-[#111315] font-mono text-base font-extrabold tracking-widest text-center text-[#111315] dark:text-white"
                  />
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug flex-1">
                    Guardá este PIN (distinto a tu teléfono). Como tu WhatsApp es público para recibir ayuda, solo este PIN privado o este dispositivo podrán marcar el <strong>Final Feliz</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-black/5 dark:border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-black/10 dark:border-white/10 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Atrás
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#111315] hover:bg-black text-white dark:bg-[#FAF7F2] dark:hover:bg-white dark:text-[#111315] font-display font-bold text-xs transition shadow"
              >
                Continuar
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[#FF4D38] hover:bg-[#e03a26] text-white font-display font-bold text-xs transition shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publicando alerta...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publicar en Huella VT</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
