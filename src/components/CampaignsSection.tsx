import React, { useState, useEffect } from 'react';
import { SolidarityCampaign, Sponsor, SupplyItem } from '../types';
import {
  calculateCampaignProgress,
  findMatchingSponsorForSupply,
  formatArs,
} from '../utils/campaigns';
import { compressImageFile } from '../utils/imageCompressor';
import {
  ShieldCheck,
  Copy,
  Check,
  HeartHandshake,
  FileSearch,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  Plus,
  X,
  Stethoscope,
  Receipt,
  Upload,
  PackageCheck,
  Wallet,
} from 'lucide-react';

interface CampaignsSectionProps {
  campaigns: SolidarityCampaign[];
  sponsors: Sponsor[];
  highlightedCampaignId?: string | null;
  onOpenCreateCampaign: () => void;
  onReportTransfer: (
    campaignId: string,
    payload: { donorName: string; amountArs: number; message: string }
  ) => Promise<void>;
  onToggleSupplyItem: (
    campaignId: string,
    supplyId: string,
    incrementByOne: boolean
  ) => Promise<void>;
  onUploadPaidReceipt: (campaignId: string, receiptBase64: string) => Promise<void>;
}

type CardSubTab = 'money' | 'supplies' | 'donors';

export const CampaignsSection: React.FC<CampaignsSectionProps> = ({
  campaigns,
  sponsors,
  highlightedCampaignId,
  onOpenCreateCampaign,
  onReportTransfer,
  onToggleSupplyItem,
  onUploadPaidReceipt,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'financial' | 'supplies' | 'completed'>(
    'all'
  );
  const [cardTabs, setCardTabs] = useState<Record<string, CardSubTab>>({});
  const [copiedAliasId, setCopiedAliasId] = useState<string | null>(null);
  const [copiedCbuId, setCopiedCbuId] = useState<string | null>(null);

  // Modal states
  const [transferModalCampaign, setTransferModalCampaign] =
    useState<SolidarityCampaign | null>(null);
  const [donorName, setDonorName] = useState('');
  const [amountInput, setAmountInput] = useState('5000');
  const [donorMessage, setDonorMessage] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Evidence inspection modal
  const [evidenceModal, setEvidenceModal] = useState<{
    campaign: SolidarityCampaign;
    mode: 'budget' | 'receipt';
  } | null>(null);

  // Paid receipt upload state for completed campaigns
  const [uploadingReceiptForId, setUploadingReceiptForId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTransferModalCampaign(null);
        setEvidenceModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const visibleCampaigns = campaigns.filter((c) => {
    if (c.status === 'pending_approval') return false;
    if (filterType === 'completed') return c.status === 'completed';
    if (filterType === 'financial') return c.helpType === 'financial' || c.helpType === 'both';
    if (filterType === 'supplies') return c.helpType === 'supplies' || c.helpType === 'both';
    return true;
  });

  const getActiveCardTab = (campaign: SolidarityCampaign): CardSubTab => {
    const explicit = cardTabs[campaign.id];
    if (explicit) return explicit;
    if (filterType === 'supplies' && campaign.supplies.length > 0) return 'supplies';
    if (campaign.helpType === 'supplies') return 'supplies';
    return 'money';
  };

  const setActiveCardTab = (campaignId: string, tab: CardSubTab) => {
    setCardTabs((prev) => ({ ...prev, [campaignId]: tab }));
  };

  const handleCopyText = async (text: string, id: string, type: 'alias' | 'cbu') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (type === 'alias') {
      setCopiedAliasId(id);
      setTimeout(() => setCopiedAliasId(null), 2600);
    } else {
      setCopiedCbuId(id);
      setTimeout(() => setCopiedCbuId(null), 2600);
    }
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalCampaign || submittingTransfer) return;
    setTransferError(null);

    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed < 100 || parsed > 50000000) {
      setTransferError('Ingresá un monto válido entre $100 y $50.000.000 ARS.');
      return;
    }

    setSubmittingTransfer(true);
    try {
      await onReportTransfer(transferModalCampaign.id, {
        donorName: donorName.trim() || 'Vecino Anónimo',
        amountArs: Math.round(parsed),
        message: donorMessage.trim() || '¡Mucha fuerza y pronta recuperación!',
      });
      setActiveCardTab(transferModalCampaign.id, 'money');
      setTransferModalCampaign(null);
      setDonorName('');
      setAmountInput('5000');
      setDonorMessage('');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const handleReceiptFileChange = async (
    campaignId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceiptForId(campaignId);
    try {
      const compressed = await compressImageFile(file, 600, 0.72);
      await onUploadPaidReceipt(campaignId, compressed.base64);
    } finally {
      setUploadingReceiptForId(null);
    }
  };

  const buildSupplyWhatsAppLink = (campaign: SolidarityCampaign, item: SupplyItem) => {
    const cleanPhone = campaign.contactWhatsApp.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hola! Vi la colecta solidaria por *${campaign.petName}* en HUELLA VT y quiero donar el insumo: *${item.name}* (${item.currentQty}/${item.targetQty}). ¿Cómo coordinamos la entrega en Venado Tuerto?`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const buildSponsorPurchaseWhatsAppLink = (
    campaign: SolidarityCampaign,
    item: SupplyItem,
    sponsor: Sponsor
  ) => {
    const cleanPhone = sponsor.whatsApp.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hola *${sponsor.name}*! Quiero comprar con descuento solidario de HUELLA VT: *${item.name}* para enviar directo al caso de *${campaign.petName}* (Contacto rescatista: ${campaign.contactWhatsApp}).`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 overflow-x-hidden">
      {/* Editorial Header Banner */}
      <div className="relative rounded-3xl border border-[#111315]/12 dark:border-white/12 bg-white dark:bg-[#15181C] p-5 sm:p-8 mb-7 overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] uppercase tracking-wider mb-3 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>P2P DIRECTO SIN COMISIONES · SISTEMA ANTI-ESTAFAS 3 CAPAS</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111315] dark:text-[#F5F2EB] leading-[1.08]">
              Colectas Solidarias &{' '}
              <span className="text-[#FF4D38] underline decoration-[#FF4D38]/30 underline-offset-4">
                Banco de Insumos
              </span>
            </h1>
            <p className="mt-2.5 text-xs sm:text-base text-[#5A5D64] dark:text-[#9CA3AF] leading-relaxed">
              Transferencias 100% directas al Alias de la veterinaria interviniente o protectora en
              Venado Tuerto. Cada caso exige{' '}
              <strong className="text-[#111315] dark:text-white">
                presupuesto clínico auditable
              </strong>{' '}
              y oculta automáticamente el Alias al cumplirse el 100% de la meta.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={onOpenCreateCampaign}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FF4D38] hover:bg-[#e63e2a] text-white font-display font-bold text-xs sm:text-sm shadow-lg shadow-[#FF4D38]/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Iniciar Colecta / Pedir Insumos</span>
            </button>
          </div>
        </div>

        {/* Compact 3-Pillar Anti-Scam Strip */}
        <div className="mt-5 pt-4 border-t border-[#111315]/8 dark:border-white/8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#111315]">
            <span className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
              01
            </span>
            <span className="text-[#111315] dark:text-neutral-200 font-medium">
              <strong>Presupuesto Obligatorio:</strong> Orden clínica auditable en 1 clic.
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#111315]">
            <span className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
              02
            </span>
            <span className="text-[#111315] dark:text-neutral-200 font-medium">
              <strong>Cuenta en Veterinaria:</strong> Sello de cobro directo en clínica.
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#111315]">
            <span className="w-6 h-6 rounded-md bg-[#FF4D38]/15 text-[#FF4D38] flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
              03
            </span>
            <span className="text-[#111315] dark:text-neutral-200 font-medium">
              <strong>Cierre al 100%:</strong> Oculta el Alias automáticamente en la meta.
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'all', label: 'Todas las Campañas' },
            { id: 'financial', label: '💸 Colectas en $ ARS' },
            { id: 'supplies', label: '💊 Insumos & Alimento' },
            { id: 'completed', label: '🎉 Metas Cumplidas (100%)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as typeof filterType)}
              className={`px-3 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer border ${
                filterType === tab.id
                  ? 'bg-[#111315] text-white dark:bg-white dark:text-[#111315] border-transparent shadow-xs'
                  : 'bg-white dark:bg-[#15181C] text-[#5A5D64] dark:text-neutral-300 border-[#111315]/10 dark:border-white/10 hover:border-[#111315]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-xs text-[#5A5D64] dark:text-neutral-400">
          {visibleCampaigns.length} campañas activas en Venado Tuerto
        </span>
      </div>

      {/* Clean, Uncluttered Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCampaigns.map((campaign) => {
          const progress = calculateCampaignProgress(campaign);
          const isHighlighted = highlightedCampaignId === campaign.id;
          const hasFinancial =
            (campaign.helpType === 'financial' || campaign.helpType === 'both') &&
            (campaign.goalAmountArs || 0) > 0;
          const hasSupplies =
            (campaign.helpType === 'supplies' || campaign.helpType === 'both') &&
            campaign.supplies.length > 0;
          const activeSubTab = getActiveCardTab(campaign);

          return (
            <article
              key={campaign.id}
              id={`campaign-card-${campaign.id}`}
              className={`rounded-3xl bg-white dark:bg-[#15181C] border transition-all overflow-hidden flex flex-col justify-between ${
                isHighlighted
                  ? 'border-[#FF4D38] ring-2 ring-[#FF4D38]/30 shadow-xl'
                  : 'border-[#111315]/12 dark:border-white/12 shadow-xs hover:shadow-lg'
              }`}
            >
              <div>
                {/* 1. CLEAN IDENTITY HEADER */}
                <div className="p-5 border-b border-[#111315]/8 dark:border-white/8 flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[#111315]/12 dark:border-white/12 bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={campaign.photoBase64}
                      alt={campaign.petName}
                      className="w-full h-full object-cover"
                    />
                    {progress.isGoalReached && (
                      <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                          campaign.isVerifiedShelter
                            ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {campaign.isVerifiedShelter
                          ? `🐾 ${campaign.shelterOrOrganizerName}`
                          : '🛡️ Auditado por Admin'}
                      </span>
                      <span className="font-mono text-[11px] text-[#5A5D64] dark:text-neutral-400">
                        📍 {campaign.barrio}
                      </span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#111315] dark:text-white leading-snug">
                      {campaign.title}
                    </h2>

                    <p className="mt-1 text-xs text-[#5A5D64] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {campaign.story}
                    </p>
                  </div>
                </div>

                {/* 2. VETERINARY CLINIC & 1-CLICK EVIDENCE BAR */}
                <div className="px-5 py-2.5 bg-[#FAF7F2] dark:bg-[#111315] border-b border-[#111315]/8 dark:border-white/8 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs min-w-0">
                    <Stethoscope className="w-4 h-4 text-[#FF4D38] shrink-0" />
                    <span className="text-[#111315] dark:text-neutral-200 truncate">
                      Clínica: <strong>{campaign.vetClinicName}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEvidenceModal({ campaign, mode: 'budget' })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B1F24] border border-[#111315]/15 dark:border-white/15 hover:border-[#FF4D38] text-[11px] font-mono font-bold text-[#111315] dark:text-white transition cursor-pointer shrink-0"
                  >
                    <FileSearch className="w-3.5 h-3.5 text-[#FF4D38]" />
                    <span>🔍 Ver Presupuesto</span>
                  </button>
                </div>

                {/* 3. SEGMENTED CARD SUB-TABS (Eliminates visual clutter!) */}
                <div className="px-5 pt-3.5 flex items-center gap-1.5 border-b border-[#111315]/8 dark:border-white/8 bg-white dark:bg-[#15181C]">
                  {hasFinancial && (
                    <button
                      type="button"
                      onClick={() => setActiveCardTab(campaign.id, 'money')}
                      className={`pb-2.5 px-3 text-xs font-display font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                        activeSubTab === 'money'
                          ? 'border-[#FF4D38] text-[#FF4D38]'
                          : 'border-transparent text-[#5A5D64] dark:text-neutral-400 hover:text-[#111315] dark:hover:text-white'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Colecta ($ ARS)</span>
                      <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
                        {progress.totalPercent}%
                      </span>
                    </button>
                  )}

                  {hasSupplies && (
                    <button
                      type="button"
                      onClick={() => setActiveCardTab(campaign.id, 'supplies')}
                      className={`pb-2.5 px-3 text-xs font-display font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                        activeSubTab === 'supplies'
                          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                          : 'border-transparent text-[#5A5D64] dark:text-neutral-400 hover:text-[#111315] dark:hover:text-white'
                      }`}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Insumos</span>
                      <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
                        {progress.fulfilledSuppliesCount}/{progress.totalSuppliesCount}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveCardTab(campaign.id, 'donors')}
                    className={`pb-2.5 px-3 text-xs font-display font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      activeSubTab === 'donors'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-[#5A5D64] dark:text-neutral-400 hover:text-[#111315] dark:hover:text-white'
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Donantes ({campaign.contributions.length})</span>
                  </button>
                </div>

                {/* 4. ACTIVE SUB-TAB CONTENT */}
                <div className="p-5">
                  {/* SUB-TAB A: FINANCIAL P2P & BANK ALIAS */}
                  {activeSubTab === 'money' && hasFinancial && (
                    <div className="space-y-4">
                      {/* Clear Numbers Row */}
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#5A5D64] dark:text-neutral-400 block">
                            TOTAL RECAUDADO vs META
                          </span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#111315] dark:text-white">
                              {formatArs(progress.totalRaisedArs)}
                            </span>
                            <span className="font-mono text-xs text-[#5A5D64] dark:text-neutral-400">
                              / {formatArs(progress.goalArs)} ARS
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold ${
                            progress.isGoalReached
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-[#FF4D38]/15 text-[#FF4D38]'
                          }`}
                        >
                          {progress.totalPercent}%
                        </span>
                      </div>

                      {/* Dual Progress Bar */}
                      <div>
                        <div
                          className="w-full h-3.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex p-0.5 border border-[#111315]/10 dark:border-white/10"
                          role="progressbar"
                          aria-valuenow={progress.totalPercent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            style={{ width: `${progress.confirmedPercent}%` }}
                            className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500 rounded-l-full"
                          />
                          {progress.inReviewPercent > 0 && (
                            <div
                              style={{ width: `${progress.inReviewPercent}%` }}
                              className="h-full bg-amber-400 transition-all duration-500 rounded-r-full"
                            />
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            ● Confirmado: {formatArs(progress.confirmedArs)}
                          </span>
                          <span className="text-amber-700 dark:text-amber-300 font-semibold">
                            ● En revisión: {formatArs(progress.inReviewArs)}
                          </span>
                          {progress.remainingArs > 0 && (
                            <span className="text-[#5A5D64] dark:text-neutral-400">
                              Faltan {formatArs(progress.remainingArs)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 100% Goal Reached vs Active P2P Bank Ticket */}
                      {progress.shouldHideBankAlias ? (
                        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3">
                          <div>
                            <span className="font-display font-extrabold text-sm sm:text-base text-emerald-800 dark:text-emerald-300 block">
                              🎉 ¡META CUMPLIDA! Colecta cerrada
                            </span>
                            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 mt-0.5">
                              El Alias bancario fue ocultado automáticamente al alcanzar el 100%
                              para evitar sobre-recaudación.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {campaign.paidReceiptBase64 ? (
                              <button
                                type="button"
                                onClick={() => setEvidenceModal({ campaign, mode: 'receipt' })}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold transition cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>🧾 Ver Factura Veterinaria Pagada</span>
                              </button>
                            ) : (
                              <label className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold transition cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>
                                  {uploadingReceiptForId === campaign.id
                                    ? 'Comprimiendo WebP...'
                                    : 'Subir Factura Pagada (Cierre)'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleReceiptFileChange(campaign.id, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-[#111315]/15 dark:border-white/15 bg-[#FAF7F2] dark:bg-[#111315] p-4 space-y-3">
                          {campaign.isDirectVetAccount && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold">
                              🛡️ Fondos recibidos directamente por {campaign.vetClinicName}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-[#16191E] border border-[#111315]/10 dark:border-white/10">
                            <div className="min-w-0">
                              <span className="font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 block">
                                ALIAS ({campaign.bankOrWallet || 'Transferencia'})
                              </span>
                              <span className="font-mono text-base sm:text-lg font-extrabold text-[#111315] dark:text-white select-all break-all">
                                {campaign.bankAlias}
                              </span>
                              <span className="font-mono text-[11px] text-[#5A5D64] dark:text-neutral-400 block truncate">
                                Titular: <strong>{campaign.holderName}</strong>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(campaign.bankAlias || '', campaign.id, 'alias')
                              }
                              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition cursor-pointer shrink-0 border ${
                                copiedAliasId === campaign.id
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-[#FAF7F2] dark:bg-[#111315] text-[#111315] dark:text-white border-[#111315]/20 dark:border-white/20 hover:border-[#FF4D38]'
                              }`}
                            >
                              {copiedAliasId === campaign.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>📋 Copiar Alias</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            {campaign.cbuCvu && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(campaign.cbuCvu!, campaign.id, 'cbu')
                                }
                                className="text-[11px] font-mono text-[#5A5D64] dark:text-neutral-400 underline hover:text-[#FF4D38] text-left cursor-pointer"
                              >
                                {copiedCbuId === campaign.id
                                  ? '✓ CBU/CVU copiado al portapapeles'
                                  : `Copiar CBU/CVU: ${campaign.cbuCvu}`}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setTransferModalCampaign(campaign)}
                              className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF4D38] hover:bg-[#e03e2a] text-white font-display text-xs font-bold transition cursor-pointer shadow-sm"
                            >
                              <span>🙌 ¡Ya transferí! Informar mi aporte</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB B: INTERACTIVE SUPPLIES CHECKLIST */}
                  {activeSubTab === 'supplies' && hasSupplies && (
                    <div className="space-y-3">
                      {campaign.supplies.map((item) => {
                        const pct = Math.min(
                          100,
                          Math.round((item.currentQty / Math.max(1, item.targetQty)) * 100)
                        );
                        const isComplete = item.fulfilled || item.currentQty >= item.targetQty;
                        const matchedSponsor = findMatchingSponsorForSupply(item, sponsors);

                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl p-3.5 border transition ${
                              isComplete
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : 'bg-[#FAF7F2] dark:bg-[#111315] border-[#111315]/10 dark:border-white/10'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-display font-bold text-xs sm:text-sm ${
                                    isComplete
                                      ? 'line-through text-emerald-700 dark:text-emerald-400'
                                      : 'text-[#111315] dark:text-white'
                                  }`}
                                >
                                  {item.name}
                                </span>
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/8 dark:bg-white/10">
                                  {item.currentQty}/{item.targetQty} unid.
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {!isComplete && (
                                  <a
                                    href={buildSupplyWhatsAppLink(campaign, item)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-bold transition"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>🤝 Yo dono este insumo</span>
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    onToggleSupplyItem(campaign.id, item.id, !isComplete)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-[#111315]/15 dark:border-white/15 text-[11px] font-mono font-semibold hover:bg-[#111315] hover:text-white dark:hover:bg-white dark:hover:text-[#111315] transition cursor-pointer"
                                >
                                  {isComplete ? '↺ Reabrir' : '✓ +1 recibido'}
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full transition-all duration-500 ${
                                  isComplete ? 'bg-emerald-500' : 'bg-[#FF4D38]'
                                }`}
                              />
                            </div>

                            {matchedSponsor && !isComplete && (
                              <div className="mt-2.5 pt-2 border-t border-[#111315]/8 dark:border-white/8">
                                <a
                                  href={buildSponsorPurchaseWhatsAppLink(
                                    campaign,
                                    item,
                                    matchedSponsor
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-semibold transition"
                                >
                                  <span className="inline-flex items-center gap-1.5 truncate">
                                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="truncate">
                                      🛒 Comprar en <strong>{matchedSponsor.name}</strong> con
                                      descuento solidario y envío directo
                                    </span>
                                  </span>
                                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 font-bold shrink-0">
                                    Sponsor
                                  </span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SUB-TAB C: LIVE DONOR MURAL */}
                  {activeSubTab === 'donors' && (
                    <div className="space-y-2.5">
                      {campaign.contributions.length === 0 ? (
                        <p className="text-xs text-[#5A5D64] dark:text-neutral-400 italic py-4 text-center">
                          Sé el primer vecino en inaugurar el mural solidario de {campaign.petName}.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {campaign.contributions.map((contrib) => (
                            <div
                              key={contrib.id}
                              className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#111315] border border-[#111315]/8 dark:border-white/8 text-xs flex items-start justify-between gap-2"
                            >
                              <div className="text-[#111315] dark:text-neutral-200">
                                <span>❤️ </span>
                                <strong>{contrib.donorName}</strong> aportó{' '}
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                  {formatArs(contrib.amountArs)}
                                </span>
                                {contrib.message && (
                                  <p className="text-[#5A5D64] dark:text-neutral-400 mt-0.5 italic">
                                    “{contrib.message}”
                                  </p>
                                )}
                              </div>
                              <span
                                className={`font-mono text-[10px] px-2 py-0.5 rounded shrink-0 ${
                                  contrib.status === 'confirmed'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {contrib.status === 'confirmed' ? '✓ Confirmado' : '⏳ En revisión'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. COMPACT FOOTER TICKER (Latest contribution preview) */}
              <div className="px-5 py-3 bg-[#FAF7F2] dark:bg-[#111315]/80 border-t border-[#111315]/8 dark:border-white/8 flex items-center justify-between gap-2 text-xs">
                {campaign.contributions.length > 0 ? (
                  <div className="truncate text-[#5A5D64] dark:text-neutral-300">
                    <span>❤️ Último aporte: </span>
                    <strong className="text-[#111315] dark:text-white">
                      {campaign.contributions[0].donorName}
                    </strong>{' '}
                    ({formatArs(campaign.contributions[0].amountArs)})
                  </div>
                ) : (
                  <span className="text-[#5A5D64] dark:text-neutral-400 font-mono text-[11px]">
                    Sin comisiones · 100% directo al caso
                  </span>
                )}

                {hasSupplies && activeSubTab !== 'supplies' && (
                  <button
                    type="button"
                    onClick={() => setActiveCardTab(campaign.id, 'supplies')}
                    className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
                  >
                    Ver {campaign.supplies.length} insumos pedidos →
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* MODAL 1: "🙌 ¡Ya transferí! Informar mi aporte" */}
      {transferModalCampaign && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setTransferModalCampaign(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15181C] border border-[#111315]/15 dark:border-white/15 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#FF4D38] font-bold">
                  ACTUALIZACIÓN EN TIEMPO REAL
                </span>
                <h3 className="font-display text-xl font-extrabold text-[#111315] dark:text-white mt-0.5">
                  🙌 Informar mi transferencia
                </h3>
                <p className="text-xs text-[#5A5D64] dark:text-neutral-400 mt-1">
                  Caso: <strong>{transferModalCampaign.petName}</strong> · Alias:{' '}
                  <span className="font-mono font-bold">{transferModalCampaign.bankAlias}</span>
                </p>
              </div>
              <button
                onClick={() => setTransferModalCampaign(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-[#5A5D64] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferError && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-mono">
                {transferError}
              </div>
            )}

            <form onSubmit={handleSubmitTransfer} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[#5A5D64] dark:text-neutral-300 mb-1.5">
                  Monto transferido ($ ARS) *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[2500, 5000, 10000, 15000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAmountInput(String(preset))}
                      className={`py-1.5 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                        Number(amountInput) === preset
                          ? 'bg-[#FF4D38] text-white border-[#FF4D38]'
                          : 'bg-[#FAF7F2] dark:bg-white/5 text-[#111315] dark:text-white border-[#111315]/15 dark:border-white/15'
                      }`}
                    >
                      {formatArs(preset)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={100}
                  max={50000000}
                  step={100}
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] font-mono text-base font-bold text-[#111315] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#5A5D64] dark:text-neutral-300 mb-1.5">
                  Tu Nombre (o déjalo vacío para Vecino Anónimo)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Ej: Sofía G. / Vecino Barrio Centro"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-sm text-[#111315] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#5A5D64] dark:text-neutral-300 mb-1.5">
                  Mensaje de aliento para el mural
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="¡Pronta recuperación!"
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#111315]/20 dark:border-white/20 bg-white dark:bg-[#111315] text-sm text-[#111315] dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-200">
                Tu aporte se sumará al instante a la barra como <strong>Monto en Revisión</strong> y
                al mural público mientras la veterinaria o titular concilia el extracto bancario.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalCampaign(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5A5D64] hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingTransfer}
                  className="px-5 py-2.5 rounded-xl bg-[#FF4D38] hover:bg-[#e03e2a] text-white font-display text-xs font-bold shadow-lg shadow-[#FF4D38]/25 cursor-pointer"
                >
                  {submittingTransfer ? 'Registrando...' : 'Confirmar y Sumar a la Barra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: "🔍 Ver presupuesto / historia clínica" or Paid Receipt */}
      {evidenceModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEvidenceModal(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#15181C] border border-[#111315]/20 dark:border-white/20 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-[#111315]/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                  AUDITORÍA COMUNITARIA ANTI-ESTAFAS · CAPA 1 & 2
                </span>
                <h3 className="font-display text-lg font-extrabold text-[#111315] dark:text-white">
                  {evidenceModal.mode === 'receipt'
                    ? `Factura Veterinaria Pagada — Caso ${evidenceModal.campaign.petName}`
                    : `Presupuesto / Orden Clínica — Caso ${evidenceModal.campaign.petName}`}
                </h3>
              </div>
              <button
                onClick={() => setEvidenceModal(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-[#5A5D64] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-[#FAF7F2] dark:bg-[#0D0F12] flex flex-col items-center">
              <div className="w-full max-h-[62vh] overflow-auto rounded-xl border border-[#111315]/15 dark:border-white/15 bg-white p-2 flex items-center justify-center">
                <img
                  src={
                    evidenceModal.mode === 'receipt' && evidenceModal.campaign.paidReceiptBase64
                      ? evidenceModal.campaign.paidReceiptBase64
                      : evidenceModal.campaign.medicalEvidenceBase64
                  }
                  alt="Respaldo veterinario"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>

              <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#15181C] border border-[#111315]/10 dark:border-white/10">
                  <span className="font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 block">
                    CLÍNICA VETERINARIA INTERVINIENTE
                  </span>
                  <strong className="text-[#111315] dark:text-white text-sm">
                    {evidenceModal.campaign.vetClinicName}
                  </strong>
                  {evidenceModal.campaign.vetProfessionalName && (
                    <span className="block font-mono text-[11px] text-[#5A5D64] dark:text-neutral-400">
                      Profesional: {evidenceModal.campaign.vetProfessionalName}
                    </span>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#15181C] border border-[#111315]/10 dark:border-white/10">
                  <span className="font-mono text-[10px] uppercase text-[#5A5D64] dark:text-neutral-400 block">
                    DIAGNÓSTICO / DETALLE AUDITADO
                  </span>
                  <strong className="text-[#111315] dark:text-white text-xs">
                    {evidenceModal.mode === 'receipt'
                      ? evidenceModal.campaign.paidReceiptCaption || 'Factura cancelada en clínica'
                      : evidenceModal.campaign.medicalEvidenceCaption ||
                        'Presupuesto veterinario verificado'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
