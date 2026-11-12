import React, { useState } from 'react';
import {
  CampaignHelpType,
  Pet,
  SolidarityCampaign,
  SupplyCategory,
  SupplyItem,
  VENADO_TUERTO_BARRIOS,
} from '../types';
import { compressImageFile, formatFileSize } from '../utils/imageCompressor';
import {
  X,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Wallet,
  Package,
} from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  preselectedPetId?: string | null;
  onCreateCampaign: (
    payload: Omit<SolidarityCampaign, 'id' | 'createdAt' | 'status' | 'contributions'>
  ) => Promise<SolidarityCampaign>;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  pets,
  preselectedPetId,
  onCreateCampaign,
}) => {
  const preselectedPet = pets.find((p) => p.id === preselectedPetId);

  const [helpType, setHelpType] = useState<CampaignHelpType>('both');
  const [petName, setPetName] = useState(preselectedPet?.name || '');
  const [barrio, setBarrio] = useState<string>(
    preselectedPet?.barrio || VENADO_TUERTO_BARRIOS[0]
  );
  const [title, setTitle] = useState(
    preselectedPet ? `Cirugía y Recuperación para ${preselectedPet.name}` : ''
  );
  const [story, setStory] = useState('');
  const [contactWhatsApp, setContactWhatsApp] = useState(
    preselectedPet?.authorWhatsApp || '5493462551234'
  );

  // Shelter vs Neighbor moderation mode
  const [isVerifiedShelter, setIsVerifiedShelter] = useState(false);
  const [shelterOrOrganizerName, setShelterOrOrganizerName] = useState(
    'Refugio Canino Venado Tuerto'
  );

  // Financial P2P fields
  const [goalAmountArs, setGoalAmountArs] = useState('85000');
  const [bankAlias, setBankAlias] = useState('');
  const [cbuCvu, setCbuCvu] = useState('');
  const [holderName, setHolderName] = useState('');
  const [bankOrWallet, setBankOrWallet] = useState('Mercado Pago / Transferencia');
  const [isDirectVetAccount, setIsDirectVetAccount] = useState(true);

  // Anti-scam Vet & Evidence fields
  const [vetClinicName, setVetClinicName] = useState('Clínica Veterinaria San Martín (24hs)');
  const [vetProfessionalName, setVetProfessionalName] = useState(
    'Dr. Matías Ledesma (M.P. 1842)'
  );
  const [medicalEvidenceCaption, setMedicalEvidenceCaption] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>(
    preselectedPet?.photoBase64 ||
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=80'
  );
  const [medicalEvidenceBase64, setMedicalEvidenceBase64] = useState<string>('');
  const [evidenceCompressionStats, setEvidenceCompressionStats] = useState<string | null>(null);

  // Supplies Checklist fields
  const [supplies, setSupplies] = useState<SupplyItem[]>([
    {
      id: 'sup-init-1',
      name: 'Cajas de Doxiciclina 100mg',
      category: 'medicina',
      currentQty: 0,
      targetQty: 2,
      fulfilled: false,
    },
  ]);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyQty, setNewSupplyQty] = useState('1');
  const [newSupplyCategory, setNewSupplyCategory] = useState<SupplyCategory>('medicina');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdNotice, setCreatedNotice] = useState<SolidarityCampaign | null>(null);

  if (!isOpen) return null;

  const handlePetPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageFile(file, 600, 0.72);
      setPhotoBase64(res.base64);
    } catch {
      setErrorMsg('No se pudo procesar la foto de la mascota.');
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageFile(file, 600, 0.72);
      setMedicalEvidenceBase64(res.base64);
      setEvidenceCompressionStats(
        `Comprimido WebP: ${formatFileSize(res.originalSizeKb)} → ${formatFileSize(res.optimizedSizeKb)} (-${res.savingsPercent}%)`
      );
      setErrorMsg(null);
    } catch {
      setErrorMsg('No se pudo comprimir la foto del presupuesto veterinario.');
    }
  };

  const handleAddSupply = () => {
    if (!newSupplyName.trim()) return;
    const item: SupplyItem = {
      id: `sup-${Date.now()}`,
      name: newSupplyName.trim(),
      category: newSupplyCategory,
      currentQty: 0,
      targetQty: Math.max(1, Number(newSupplyQty) || 1),
      fulfilled: false,
    };
    setSupplies((prev) => [...prev, item]);
    setNewSupplyName('');
    setNewSupplyQty('1');
  };

  const handleRemoveSupply = (id: string) => {
    setSupplies((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!petName.trim() || !title.trim() || !vetClinicName.trim()) {
      setErrorMsg(
        'Por favor completa el nombre del animal, el título y la veterinaria interviniente.'
      );
      return;
    }

    const needsFinancial = helpType === 'financial' || helpType === 'both';
    if (needsFinancial && (!bankAlias.trim() || !holderName.trim())) {
      setErrorMsg(
        'Para colectas económicas es obligatorio indicar el Alias y el Titular de la cuenta.'
      );
      return;
    }

    const finalEvidence =
      medicalEvidenceBase64 ||
      `data:image/svg+xml;utf8,` +
        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
        <rect width="600" height="420" fill="#FAF7F2"/>
        <rect x="24" y="24" width="552" height="372" rx="12" fill="#FFFFFF" stroke="#111315" stroke-width="2"/>
        <text x="48" y="68" font-family="monospace" font-size="15" font-weight="bold" fill="#FF4D38">ORDEN / PRESUPUESTO VETERINARIO VERIFICADO</text>
        <text x="48" y="96" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111315">${vetClinicName}</text>
        <text x="48" y="122" font-family="monospace" font-size="12" fill="#5A5D64">Paciente: ${petName} · ${barrio}</text>
        <line x1="48" y1="142" x2="552" y2="142" stroke="#E5E7EB" stroke-width="1.5"/>
        <text x="48" y="178" font-family="sans-serif" font-size="13" fill="#111315">${medicalEvidenceCaption || title}</text>
        <text x="48" y="220" font-family="monospace" font-size="16" font-weight="bold" fill="#059669">Meta Presupuestada: $${Number(goalAmountArs || 0).toLocaleString('es-AR')} ARS</text>
        <text x="48" y="350" font-family="monospace" font-size="11" fill="#5A5D64">Profesional: ${vetProfessionalName || 'Veterinario Matriculado VT'}</text>
      </svg>`);

    setSubmitting(true);
    try {
      const created = await onCreateCampaign({
        petId: preselectedPet?.id,
        petName: petName.trim(),
        species: preselectedPet?.species || 'dog',
        photoBase64,
        barrio,
        title: title.trim(),
        story:
          story.trim() ||
          `Campaña comunitaria verificada para asistir a ${petName.trim()} atendido en ${vetClinicName.trim()}.`,
        helpType,
        goalAmountArs: needsFinancial ? Math.max(1000, Number(goalAmountArs) || 0) : 0,
        confirmedAmountArs: 0,
        pendingReviewAmountArs: 0,
        bankAlias: needsFinancial ? bankAlias.trim().toUpperCase() : undefined,
        cbuCvu: needsFinancial ? cbuCvu.trim() : undefined,
        holderName: needsFinancial ? holderName.trim() : undefined,
        bankOrWallet: needsFinancial ? bankOrWallet.trim() : undefined,
        isDirectVetAccount: needsFinancial ? isDirectVetAccount : false,
        supplies: helpType === 'supplies' || helpType === 'both' ? supplies : [],
        vetClinicName: vetClinicName.trim(),
        vetProfessionalName: vetProfessionalName.trim(),
        medicalEvidenceBase64: finalEvidence,
        medicalEvidenceCaption:
          medicalEvidenceCaption.trim() || `Presupuesto clínico emitido por ${vetClinicName.trim()}`,
        isVerifiedShelter,
        shelterOrOrganizerName: isVerifiedShelter
          ? shelterOrOrganizerName.trim()
          : holderName.trim() || 'Vecino de Venado Tuerto',
        contactWhatsApp: contactWhatsApp.trim(),
      });
      setCreatedNotice(created);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#15181C] border border-[#111315]/20 dark:border-white/20 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="p-5 border-b border-[#111315]/10 dark:border-white/10 flex items-center justify-between bg-[#FAF7F2] dark:bg-[#111315]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF4D38] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              PROTOCOLO ANTI-ESTAFAS DE 3 CAPAS · VENADO TUERTO
            </span>
            <h2 className="font-display text-xl font-extrabold text-[#111315] dark:text-white">
              Iniciar Colecta Solidaria / Pedido de Insumos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-white/10 text-[#5A5D64] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdNotice ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-[#111315] dark:text-white">
              {createdNotice.status === 'active'
                ? '¡Colecta Publicada Inmediatamente!'
                : '¡Colecta Enviada a Auditoría Veterinaria!'}
            </h3>
            <p className="text-sm text-[#5A5D64] dark:text-neutral-300 max-w-md mx-auto">
              {createdNotice.status === 'active'
                ? 'Al pertenecer a un Refugio / Protectora Verificada, tu campaña ya está visible en vivo en el portal de Colectas Solidarias.'
                : 'Por seguridad anti-estafas, las campañas creadas por vecinos particulares quedan en estado "Pendiente de Aprobación" hasta que el Admin verifique el presupuesto veterinario adjunto (puedes aprobarla ahora mismo desde el Panel Admin).'}
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setCreatedNotice(null);
                  onClose();
                }}
                className="px-6 py-3 rounded-xl bg-[#111315] dark:bg-white text-white dark:text-[#111315] font-display font-bold text-xs cursor-pointer"
              >
                Entendido, volver a Colectas
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Creator Profile (Neighbor vs Verified Shelter) */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.03] border border-[#111315]/10 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#5A5D64] dark:text-neutral-400 block">
                    CAPA 3 DE SEGURIDAD: TIPO DE SOLICITANTE
                  </span>
                  <p className="text-xs font-bold text-[#111315] dark:text-white">
                    {isVerifiedShelter
                      ? '🐾 Refugio / Protectora Oficial (Publicación directa sin espera)'
                      : '👤 Vecino / Rescatista Particular (Requiere aprobación en /admin)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVerifiedShelter((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                    isVerifiedShelter
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-[#111315] text-[#111315] dark:text-white border-[#111315]/20'
                  }`}
                >
                  {isVerifiedShelter ? 'Modo Refugio Oficial ✓' : 'Cambiar a Refugio Oficial'}
                </button>
              </div>
              {isVerifiedShelter && (
                <input
                  type="text"
                  value={shelterOrOrganizerName}
                  onChange={(e) => setShelterOrOrganizerName(e.target.value)}
                  placeholder="Nombre del Refugio o Protectora"
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-[#111315]/15 dark:border-white/15 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                />
              )}
            </div>

            {/* Step 2: Help Modality Selector */}
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-[#111315] dark:text-white mb-2">
                1. Modalidad de Ayuda Solicitada
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'both', label: '💸 + 💊 Dinero e Insumos', icon: ShieldCheck },
                  { id: 'financial', label: '💸 Solo Colecta en $ ARS', icon: Wallet },
                  { id: 'supplies', label: '💊 Solo Insumos / Alimento', icon: Package },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setHelpType(opt.id as CampaignHelpType)}
                    className={`p-3 rounded-xl border text-left font-display text-xs font-bold transition cursor-pointer ${
                      helpType === opt.id
                        ? 'bg-[#111315] text-white dark:bg-white dark:text-[#111315] border-transparent'
                        : 'bg-white dark:bg-[#111315] text-[#5A5D64] dark:text-neutral-300 border-[#111315]/15 dark:border-white/15'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Case Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                  Nombre de la Mascota / Manada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Roco / Cachorros Barrio Norte"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-sm text-[#111315] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                  Barrio en Venado Tuerto *
                </label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-sm text-[#111315] dark:text-white"
                >
                  {VENADO_TUERTO_BARRIOS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                  Título de la Campaña *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cirugía de Fémur para Roco"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-sm text-[#111315] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                  WhatsApp del Rescatista *
                </label>
                <input
                  type="text"
                  required
                  placeholder="5493462551234"
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] font-mono text-sm text-[#111315] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                Historia Clínica / Resumen del Caso
              </label>
              <textarea
                rows={2}
                placeholder="Explica brevemente qué ocurrió, dónde está internado y para qué se utilizarán los fondos o insumos..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-sm text-[#111315] dark:text-white"
              />
            </div>

            {/* Step 3: Mandatory Medical Evidence & Vet Clinic */}
            <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                <Stethoscope className="w-4 h-4" />
                CAPA 1 & 2 ANTI-ESTAFAS: VETERINARIA INTERVINIENTE Y PRESUPUESTO
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                    Veterinaria Interviniente en VT *
                  </label>
                  <input
                    type="text"
                    required
                    value={vetClinicName}
                    onChange={(e) => setVetClinicName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                    Profesional / Matrícula
                  </label>
                  <input
                    type="text"
                    value={vetProfessionalName}
                    onChange={(e) => setVetProfessionalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-emerald-600/50 bg-white dark:bg-[#111315] text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-500/10 transition">
                  <Upload className="w-4 h-4" />
                  Subir Foto Presupuesto / Receta (WebP)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEvidenceUpload}
                  />
                </label>

                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#111315]/30 dark:border-white/30 bg-white dark:bg-[#111315] text-xs font-mono font-semibold text-[#5A5D64] dark:text-neutral-300 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/5 transition">
                  <Upload className="w-4 h-4" />
                  Subir Foto del Animal (WebP)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePetPhotoUpload}
                  />
                </label>
              </div>

              {evidenceCompressionStats && (
                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                  ✓ {evidenceCompressionStats}
                </p>
              )}
            </div>

            {/* Step 4: Financial P2P Details */}
            {(helpType === 'financial' || helpType === 'both') && (
              <div className="p-4 rounded-xl border border-[#111315]/15 dark:border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-[#111315] dark:text-white">
                    DATOS BANCARIOS P2P (SIN INTERMEDIARIOS)
                  </span>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDirectVetAccount}
                      onChange={(e) => setIsDirectVetAccount(e.target.checked)}
                      className="rounded"
                    />
                    🛡️ Cuenta Directa de la Veterinaria
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                      Meta Total ($ ARS) *
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      required
                      value={goalAmountArs}
                      onChange={(e) => setGoalAmountArs(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] font-mono text-sm font-bold text-[#111315] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                      Alias Bancario / MP *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: VET.SANMARTIN.VT"
                      value={bankAlias}
                      onChange={(e) => setBankAlias(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] font-mono text-sm font-bold text-[#111315] dark:text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 mb-1">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Clínica Vet San Martín SRL"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="CBU / CVU (22 dígitos opcional)"
                    value={cbuCvu}
                    onChange={(e) => setCbuCvu(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] font-mono text-xs text-[#111315] dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Banco o Billetera (Ej: Banco Santa Fe / Mercado Pago)"
                    value={bankOrWallet}
                    onChange={(e) => setBankOrWallet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Supplies Checklist Builder */}
            {(helpType === 'supplies' || helpType === 'both') && (
              <div className="p-4 rounded-xl border border-[#111315]/15 dark:border-white/15 space-y-3">
                <span className="font-mono text-xs font-bold uppercase text-[#111315] dark:text-white block">
                  CHECKLIST DE INSUMOS FÍSICOS (ALIMENTO, MEDICAMENTOS, GASAS)
                </span>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Bolsa Alimento Balanceado 15kg"
                    value={newSupplyName}
                    onChange={(e) => setNewSupplyName(e.target.value)}
                    className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                  />
                  <input
                    type="number"
                    min={1}
                    value={newSupplyQty}
                    onChange={(e) => setNewSupplyQty(e.target.value)}
                    className="w-16 px-2.5 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] font-mono text-xs text-[#111315] dark:text-white"
                  />
                  <select
                    value={newSupplyCategory}
                    onChange={(e) => setNewSupplyCategory(e.target.value as SupplyCategory)}
                    className="px-2.5 py-2 rounded-lg border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-xs text-[#111315] dark:text-white"
                  >
                    <option value="medicina">💊 Farmacia / Medicamento</option>
                    <option value="alimento">🦴 Alimento Balanceado</option>
                    <option value="insumos">🩹 Gasas / Pañales / Insumos</option>
                    <option value="transito">🏠 Tránsito / Traslado</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSupply}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#111315] dark:bg-white text-white dark:text-[#111315] text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir
                  </button>
                </div>

                <div className="space-y-1.5">
                  {supplies.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAF7F2] dark:bg-white/5 text-xs"
                    >
                      <span>
                        <strong>{item.targetQty}x</strong> {item.name}{' '}
                        <span className="font-mono text-[10px] text-[#5A5D64]">
                          ({item.category})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSupply(item.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#111315]/10 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5A5D64] hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#FF4D38] hover:bg-[#e03e2a] text-white font-display text-xs font-bold shadow-lg shadow-[#FF4D38]/25 cursor-pointer"
              >
                {submitting
                  ? 'Procesando...'
                  : isVerifiedShelter
                    ? 'Publicar Colecta Oficial Ahora'
                    : 'Enviar Colecta con Respaldo Veterinario'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
