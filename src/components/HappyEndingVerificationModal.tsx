import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pet } from '../types';
import {
  getMaskedPhoneHint,
  verifyHappyEndingAuthorization,
  sanitizeInputText,
} from '../utils/security';
import { getCurrentUser } from '../services/dataService';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  HeartHandshake,
} from 'lucide-react';

interface HappyEndingVerificationModalProps {
  pet: Pet;
  onClose: () => void;
  onVerifiedConfirm: (petId: string, resolvedNotes?: string) => Promise<void>;
}

export const HappyEndingVerificationModal: React.FC<HappyEndingVerificationModalProps> = ({
  pet,
  onClose,
  onVerifiedConfirm,
}) => {
  const currentUser = getCurrentUser();
  const isOwnerSession = Boolean(
    currentUser && pet.authorUid && currentUser.uid === pet.authorUid
  );

  const [inputCode, setInputCode] = useState('');
  const [resolvedNotes, setResolvedNotes] = useState('');
  const [confirmedSafe, setConfirmedSafe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maskedHint = getMaskedPhoneHint(pet.authorWhatsApp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const verification = verifyHappyEndingAuthorization({
      pet,
      inputCode,
      confirmedSafeCheckbox: confirmedSafe,
      currentUserUid: currentUser?.uid,
    });

    if (!verification.authorized) {
      setErrorMsg(verification.error || 'No se pudo verificar la titularidad de la publicación.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanNotes = resolvedNotes.trim()
        ? sanitizeInputText(resolvedNotes, 200)
        : undefined;
      await onVerifiedConfirm(pet.id, cleanNotes);
      onClose();
    } catch {
      setErrorMsg('Ocurrió un error al registrar el Final Feliz. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Verificación de Final Feliz para ${pet.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-lg bg-white dark:bg-[#14171A] rounded-3xl border border-amber-500/35 shadow-2xl overflow-hidden text-[#111315] dark:text-[#EDEDED]"
      >
        {/* Top Sticky Header */}
        <div className="px-5 py-4 border-b border-black/8 dark:border-white/8 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#F59E0B] text-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
                Protocolo Anti-Error · Confirmación Segura
              </span>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-[#111315] dark:text-white leading-tight">
                ¿{pet.name} ya volvió a casa?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar verificación"
            className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Pet Summary Card */}
          <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#0B0C0E] border border-black/8 dark:border-white/8 flex items-center gap-3.5">
            <img
              src={pet.photoBase64}
              alt={pet.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-black/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base text-[#111315] dark:text-white truncate">
                  {pet.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold">
                  {pet.barrio}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                Publicado por: <strong className="text-[#111315] dark:text-white">{pet.authorName}</strong>
              </p>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                WhatsApp registrado: {maskedHint}
              </p>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              Para evitar que alguien marque por accidente a{' '}
              <strong className="text-[#111315] dark:text-white">{pet.name}</strong> como encontrado
              cuando aún sigue buscándose, validamos que seas quien publicó el aviso o un moderador.
            </div>
          </div>

          {/* Verification Input or Session Match */}
          {isOwnerSession ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Sesión verificada automáticamente como autor de la publicación (
                <strong>{currentUser?.displayName}</strong>).
              </span>
            </div>
          ) : (
            <div>
              <label
                htmlFor="happy-ending-code-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5"
              >
                Últimos 4 dígitos del WhatsApp del publicante ({maskedHint})
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
                <input
                  id="happy-ending-code-input"
                  type="text"
                  inputMode="text"
                  maxLength={12}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ej. últimos 4 números de tu celular..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-[#FAF7F2] dark:bg-[#0B0C0E] font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <span className="text-[11px] font-mono text-neutral-400 block mt-1">
                Ingresá los últimos 4 números del teléfono de {pet.authorName} para desbloquear el cambio de estado.
              </span>
            </div>
          )}

          {/* Optional Reunion Story */}
          <div>
            <label
              htmlFor="happy-ending-notes"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5"
            >
              Contanos brevemente cómo fue el reencuentro (Opcional)
            </label>
            <textarea
              id="happy-ending-notes"
              rows={2}
              maxLength={180}
              value={resolvedNotes}
              onChange={(e) => setResolvedNotes(e.target.value)}
              placeholder="Ej. ¡Apareció sana y salva gracias al aviso de una vecina de Barrio Rivadavia!"
              className="w-full px-3.5 py-2 rounded-xl border border-black/12 dark:border-white/12 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>

          {/* Mandatory Safety Confirmation Checkbox */}
          <label className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B0C0E] flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmedSafe}
              onChange={(e) => {
                setConfirmedSafe(e.target.checked);
                if (errorMsg) setErrorMsg(null);
              }}
              className="mt-0.5 rounded text-[#F59E0B] focus:ring-[#F59E0B]"
            />
            <span className="text-xs text-neutral-700 dark:text-neutral-200 leading-snug">
              <strong>Confirmo que {pet.name} ya se encuentra a salvo</strong> con su familia o
              adoptante responsable y autorizo cerrar la alerta de búsqueda activa.
            </span>
          </label>

          {/* Error Feedback */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-display font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-[#F59E0B] hover:bg-amber-500 text-black font-display font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>{isSubmitting ? 'Verificando...' : 'Confirmar ¡Final Feliz!'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
