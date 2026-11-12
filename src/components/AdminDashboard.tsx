import React, { useState, useMemo } from 'react';
import {
  Pet,
  Sponsor,
  SponsorCategory,
  SponsorTier,
  PetStatus,
  SolidarityCampaign,
  VENADO_TUERTO_BARRIOS,
} from '../types';
import { calculateStorageUsage, getSponsorExpirationStatus } from '../utils/sponsorRules';
import { calculateCampaignProgress, formatArs } from '../utils/campaigns';
import { deriveSecretPinForPet } from '../utils/security';
import {
  saveSponsor,
  deleteSponsor,
  updatePetStatus,
  updatePetDetails,
  deletePet,
  cleanOldPets,
  resetToSeedData,
  exportBackupDataset,
  importBackupDataset,
  updateCampaignAdmin,
  confirmAllPendingContributions,
  deleteCampaign,
} from '../services/dataService';
import {
  Shield,
  Trash2,
  Plus,
  RefreshCw,
  Database,
  Edit2,
  X,
  Sparkles,
  BarChart3,
  Search,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  HeartHandshake,
  FileSearch,
} from 'lucide-react';

interface AdminDashboardProps {
  pets: Pet[];
  sponsors: Sponsor[];
  campaigns?: SolidarityCampaign[];
  onClose: () => void;
  onDataRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  pets,
  sponsors,
  campaigns = [],
  onClose,
  onDataRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'pets' | 'campaigns' | 'sponsors' | 'backup'>('metrics');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [inspectingCampaignEvidence, setInspectingCampaignEvidence] = useState<SolidarityCampaign | null>(null);

  // Pets Moderation Filters & Inline Edit State
  const [petSearch, setPetSearch] = useState('');
  const [petStatusFilter, setPetStatusFilter] = useState<'all' | PetStatus>('all');
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isSavingPet, setIsSavingPet] = useState(false);

  // Sponsor editing state
  const [editingSponsor, setEditingSponsor] = useState<Partial<Sponsor> | null>(null);
  const [isSavingSponsor, setIsSavingSponsor] = useState(false);

  // Backup import state
  const [jsonImportText, setJsonImportText] = useState('');

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // Calculate DB health
  const storageHealth = calculateStorageUsage(pets, sponsors);

  const activePets = useMemo(() => pets.filter((p) => p.status !== 'resolved'), [pets]);
  const resolvedPets = useMemo(() => pets.filter((p) => p.status === 'resolved'), [pets]);
  const lostPetsCount = useMemo(() => pets.filter((p) => p.status === 'lost').length, [pets]);
  const adoptionPetsCount = useMemo(
    () => pets.filter((p) => p.status === 'adoption').length,
    [pets]
  );

  // Barrio Analytics Breakdown
  const barrioRanking = useMemo(() => {
    const counts = new Map<string, { total: number; lost: number; resolved: number }>();
    for (const p of pets) {
      const current = counts.get(p.barrio) || { total: 0, lost: 0, resolved: 0 };
      current.total += 1;
      if (p.status === 'lost') current.lost += 1;
      if (p.status === 'resolved') current.resolved += 1;
      counts.set(p.barrio, current);
    }
    return Array.from(counts.entries())
      .map(([barrio, stats]) => ({ barrio, ...stats }))
      .sort((a, b) => b.total - a.total);
  }, [pets]);

  // Filtered Pets for Moderation Table
  const filteredModerationPets = useMemo(() => {
    const q = petSearch.toLowerCase().trim();
    return pets.filter((p) => {
      if (petStatusFilter !== 'all' && p.status !== petStatusFilter) return false;
      if (q) {
        const hay = `${p.name} ${p.barrio} ${p.breed} ${p.authorName} ${p.authorWhatsApp}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [pets, petSearch, petStatusFilter]);

  // 1-Click Clean 30+ day reports
  const handleClean30Days = async () => {
    try {
      const deletedCount = await cleanOldPets(30);
      showToast(`Limpieza completada: se purgaron ${deletedCount} registros antiguos.`);
      onDataRefresh();
    } catch {
      showToast('Error al ejecutar la limpieza.');
    }
  };

  const handleResetData = () => {
    resetToSeedData();
    onDataRefresh();
    showToast('Base de datos restaurada a los casos iniciales de Venado Tuerto.');
  };

  const handleOpenNewSponsor = () => {
    setEditingSponsor({
      name: '',
      category: 'veterinaria',
      tier: 'comercio_amigo',
      isOnDutyToday: false,
      address: 'Venado Tuerto',
      phone: '03462 ',
      whatsApp: '3462',
      mapsUrl: 'https://maps.google.com',
      promoTitle: '',
      promoDescription: '',
      couponCode: 'HUELLA',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
    });
  };

  const handleSaveSponsorForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor?.name) return;

    try {
      setIsSavingSponsor(true);
      await saveSponsor(editingSponsor as Sponsor);
      setEditingSponsor(null);
      onDataRefresh();
      showToast('Comercio patrocinador guardado correctamente.');
    } finally {
      setIsSavingSponsor(false);
    }
  };

  // Quick 1-click toggle for 24h On-Duty Veterinary status
  const handleToggleOnDuty = async (sponsor: Sponsor) => {
    await saveSponsor({
      ...sponsor,
      isOnDutyToday: !sponsor.isOnDutyToday,
    });
    onDataRefresh();
    showToast(
      !sponsor.isOnDutyToday
        ? `🚨 ${sponsor.name} asignada como Guardia 24hs Activa Hoy.`
        : `${sponsor.name} removida del turno de guardia de hoy.`
    );
  };

  const handleDeleteSponsorItem = async (id: string) => {
    await deleteSponsor(id);
    onDataRefresh();
    showToast('Comercio eliminado del directorio.');
  };

  const handleStatusChange = async (petId: string, newStatus: PetStatus) => {
    await updatePetStatus(petId, newStatus);
    onDataRefresh();
    showToast(`Estado actualizado a "${newStatus.toUpperCase()}".`);
  };

  // Quick revert when someone marked a pet resolved by mistake
  const handleRevertResolved = async (pet: Pet) => {
    await updatePetStatus(pet.id, 'lost');
    onDataRefresh();
    showToast(`Se reactivó la búsqueda de ${pet.name} como PERDIDO.`);
  };

  const handleSaveEditedPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet) return;
    try {
      setIsSavingPet(true);
      await updatePetDetails(editingPet);
      setEditingPet(null);
      onDataRefresh();
      showToast(`Ficha de ${editingPet.name} actualizada con éxito.`);
    } finally {
      setIsSavingPet(false);
    }
  };

  const handleDeletePet = async (petId: string, name: string) => {
    await deletePet(petId);
    onDataRefresh();
    showToast(`Publicación de ${name} eliminada.`);
  };

  // Backup Download
  const handleDownloadBackup = () => {
    const json = exportBackupDataset(pets, sponsors, campaigns);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `huella-vt-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Respaldo JSON descargado correctamente.');
  };

  const handleApproveCampaign = async (c: SolidarityCampaign) => {
    await updateCampaignAdmin(c.id, { status: 'active' });
    onDataRefresh();
    showToast(`Colecta de ${c.petName} aprobada tras verificar evidencia veterinaria.`);
  };

  const handleConfirmPendingContributions = async (c: SolidarityCampaign) => {
    await confirmAllPendingContributions(c.id);
    onDataRefresh();
    showToast(`Aportes en revisión de ${c.petName} conciliados y sumados al monto oficial.`);
  };

  const handleDeleteCampaignItem = async (c: SolidarityCampaign) => {
    await deleteCampaign(c.id);
    onDataRefresh();
    showToast(`Colecta de ${c.petName} eliminada.`);
  };

  const handleImportBackup = () => {
    if (!jsonImportText.trim()) return;
    try {
      const result = importBackupDataset(jsonImportText);
      setJsonImportText('');
      onDataRefresh();
      showToast(
        `Restauración exitosa: ${result.petsCount} mascotas, ${result.sponsorsCount} comercios y ${result.campaignsCount} colectas.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al importar el JSON.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Centro de Comando SuperAdmin"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-6xl bg-white dark:bg-[#14171A] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl p-5 sm:p-6 text-[#111315] dark:text-[#EDEDED] max-h-[92dvh] flex flex-col">
        {/* Top Sticky Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/8 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#111315] text-[#F59E0B] dark:bg-white dark:text-[#111315] shadow-sm">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl">
                  Centro de Comando & Moderación · HUELLA VT
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  ADMIN ACTIVO
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                Auditoría de alertas, reversión de estados erróneos, turnos 24hs y respaldos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="py-1.5 px-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-mono font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de administración"
              className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Feedback inside Admin */}
        {feedbackNotice && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feedbackNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setFeedbackNotice(null)}
              className="text-xs underline ml-3"
            >
              OK
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-5 border-b border-black/8 dark:border-white/8 pb-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`py-2 px-3.5 rounded-xl font-display text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'metrics'
                  ? 'bg-[#111315] text-white dark:bg-white dark:text-[#111315] shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analítica & Barrios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pets')}
              className={`py-2 px-3.5 rounded-xl font-display text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pets'
                  ? 'bg-[#FF4D38] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Moderación de Mascotas ({pets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('campaigns')}
              className={`py-2 px-3.5 rounded-xl font-display text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'campaigns'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Colectas & Auditoría Anti-Estafas ({campaigns.length})</span>
              {campaigns.some((c) => c.status === 'pending_approval') && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black font-mono text-[10px] font-extrabold">
                  {campaigns.filter((c) => c.status === 'pending_approval').length} pend.
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sponsors')}
              className={`py-2 px-3.5 rounded-xl font-display text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sponsors'
                  ? 'bg-[#F59E0B] text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sponsors & Guardias 24hs ({sponsors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`py-2 px-3.5 rounded-xl font-display text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'backup'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup & Seguridad</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            title="Restaurar los datos semilla originales"
            className="text-xs text-neutral-400 hover:text-[#FF4D38] flex items-center gap-1 font-mono cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restaurar Datos Demo</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: METRICS, BARRIO RANKING & DATABASE HEALTH          */}
        {/* ========================================================= */}
        {activeTab === 'metrics' && (
          <div className="overflow-y-auto space-y-6 flex-1 pr-1">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E]">
                <span className="text-[11px] font-mono text-neutral-500">Perdidos Hoy</span>
                <p className="font-display font-extrabold text-2xl mt-1 text-[#FF4D38] tabular-nums">
                  {lostPetsCount}
                </p>
                <span className="text-[10px] font-mono text-neutral-400">Urgencia activa</span>
              </div>

              <div className="p-4 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E]">
                <span className="text-[11px] font-mono text-neutral-500">En Adopción</span>
                <p className="font-display font-extrabold text-2xl mt-1 text-[#7C3AED] tabular-nums">
                  {adoptionPetsCount}
                </p>
                <span className="text-[10px] font-mono text-neutral-400">En refugios / vecinos</span>
              </div>

              <div className="p-4 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E]">
                <span className="text-[11px] font-mono text-neutral-500">Finales Felices</span>
                <p className="font-display font-extrabold text-2xl mt-1 text-[#10B981] tabular-nums">
                  {resolvedPets.length}
                </p>
                <span className="text-[10px] font-mono text-neutral-400">Verificados con PIN</span>
              </div>

              <div className="p-4 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E]">
                <span className="text-[11px] font-mono text-neutral-500">Sponsors Activos</span>
                <p className="font-display font-extrabold text-2xl mt-1 text-[#F59E0B] tabular-nums">
                  {sponsors.filter((s) => s.isActive).length}
                </p>
                <span className="text-[10px] font-mono text-neutral-400">Comercios amigos</span>
              </div>

              <div className="p-4 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E] col-span-2 sm:col-span-1">
                <span className="text-[11px] font-mono text-neutral-500">Guardias 24hs Hoy</span>
                <p className="font-display font-extrabold text-2xl mt-1 text-emerald-600 tabular-nums">
                  {sponsors.filter((s) => s.isOnDutyToday).length}
                </p>
                <span className="text-[10px] font-mono text-neutral-400">Turno veterinario</span>
              </div>
            </div>

            {/* Barrio Heatmap / Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 p-5 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF4D38]" />
                    <span>Mapa de Incidencia por Barrio de Venado Tuerto</span>
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {barrioRanking.length} barrios con actividad
                  </span>
                </div>

                <div className="space-y-2.5">
                  {barrioRanking.slice(0, 6).map((item) => {
                    const maxTotal = Math.max(1, barrioRanking[0]?.total || 1);
                    const widthPct = Math.round((item.total / maxTotal) * 100);
                    return (
                      <div key={item.barrio} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-[#111315] dark:text-white">
                            {item.barrio}
                          </span>
                          <span className="text-neutral-500">
                            {item.total} {item.total === 1 ? 'caso' : 'casos'} ({item.lost} perdidos ·{' '}
                            {item.resolved} resueltos)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FF4D38] to-[#F59E0B]"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Storage & Auto-Purge Box */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="p-5 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span className="font-display font-bold text-sm">Uso de Cuota Cloud</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {storageHealth.usedMb} MB / {storageHealth.maxMb} MB
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.max(2, storageHealth.percent)}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-mono text-neutral-500 mt-2.5">
                    {storageHealth.totalDocs} documentos activos · Compresión WebP automática en cliente.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A] flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-display font-bold text-sm">
                      Purga Inteligente de Casos Antiguos
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Libera espacio eliminando únicamente las alertas resueltas con más de 30 días de antigüedad.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClean30Days}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 font-display font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Ejecutar Limpieza (+30 días)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PETS MODERATION & INLINE CASE EDITOR               */}
        {/* ========================================================= */}
        {activeTab === 'pets' && (
          <div className="overflow-y-auto space-y-4 flex-1 pr-1">
            {/* Search & Status Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2] dark:bg-[#0B0C0E] p-3.5 rounded-2xl border border-black/8 dark:border-white/8">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                  placeholder="Buscar por mascota, barrio, publicante o WhatsApp..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A] text-xs font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'lost', 'found', 'adoption', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPetStatusFilter(st)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                      petStatusFilter === st
                        ? 'bg-[#111315] text-white dark:bg-white dark:text-[#111315]'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {st === 'all'
                      ? 'Todos'
                      : st === 'lost'
                      ? '🔴 Perdidos'
                      : st === 'found'
                      ? '🟢 Encontrados'
                      : st === 'adoption'
                      ? '🟣 Adopción'
                      : '🎉 Final Feliz'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Pet Editor Modal/Drawer */}
            {editingPet && (
              <form
                onSubmit={handleSaveEditedPet}
                className="p-4 sm:p-5 rounded-2xl border-2 border-[#FF4D38]/40 bg-[#FAF7F2] dark:bg-[#0B0C0E] space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-black/8 dark:border-white/8">
                  <span className="font-display font-extrabold text-sm text-[#FF4D38]">
                    ✏️ Editando Ficha de Mascota: {editingPet.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingPet(null)}
                    className="text-neutral-400 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-mono text-neutral-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editingPet.name}
                      onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-neutral-500 mb-1">Estado</label>
                    <select
                      value={editingPet.status}
                      onChange={(e) =>
                        setEditingPet({ ...editingPet, status: e.target.value as PetStatus })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]"
                    >
                      <option value="lost">🔴 Perdido</option>
                      <option value="found">🟢 Encontrado</option>
                      <option value="adoption">🟣 En Adopción</option>
                      <option value="resolved">🎉 Final Feliz (Resuelto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-neutral-500 mb-1">Barrio</label>
                    <select
                      value={editingPet.barrio}
                      onChange={(e) => setEditingPet({ ...editingPet, barrio: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]"
                    >
                      {VENADO_TUERTO_BARRIOS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-neutral-500 mb-1">WhatsApp Autor</label>
                    <input
                      type="text"
                      value={editingPet.authorWhatsApp}
                      onChange={(e) =>
                        setEditingPet({ ...editingPet, authorWhatsApp: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-mono text-neutral-500 mb-1">
                      Esquina / Referencia
                    </label>
                    <input
                      type="text"
                      value={editingPet.addressOrReference}
                      onChange={(e) =>
                        setEditingPet({ ...editingPet, addressOrReference: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-neutral-500 mb-1">
                      Nota de Reencuentro (Final Feliz)
                    </label>
                    <input
                      type="text"
                      value={editingPet.resolvedNotes || ''}
                      onChange={(e) =>
                        setEditingPet({ ...editingPet, resolvedNotes: e.target.value })
                      }
                      placeholder="Ej. Volvió sano y salvo con su dueña..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-mono text-neutral-500 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={editingPet.description}
                    onChange={(e) => setEditingPet({ ...editingPet, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPet.isUrgentTransit)}
                      onChange={(e) =>
                        setEditingPet({ ...editingPet, isUrgentTransit: e.target.checked })
                      }
                      className="rounded text-[#FF4D38]"
                    />
                    <span>🚨 Marcar como Tránsito Urgente</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPet(null)}
                      className="py-1.5 px-3 rounded-lg text-xs text-neutral-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPet}
                      className="py-1.5 px-4 rounded-xl bg-[#FF4D38] text-white font-display font-bold text-xs shadow-sm cursor-pointer"
                    >
                      {isSavingPet ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Pets Moderation Table */}
            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF7F2] dark:bg-[#0B0C0E] border-b border-black/10 dark:border-white/10 text-neutral-500">
                  <tr>
                    <th className="p-3">Mascota</th>
                    <th className="p-3">Barrio & Ref</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Publicante & PIN</th>
                    <th className="p-3 text-right">Acciones de Moderación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredModerationPets.map((pet) => (
                    <tr key={pet.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="p-3 flex items-center gap-2.5">
                        <img
                          src={pet.photoBase64}
                          alt={pet.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold font-display text-sm text-[#111315] dark:text-white block">
                            {pet.name}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {pet.breed} · {pet.color}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-[11px]">
                        <span className="font-bold text-[#111315] dark:text-white block">
                          {pet.barrio}
                        </span>
                        <span className="text-neutral-400 truncate max-w-[180px] block">
                          {pet.addressOrReference}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={pet.status}
                            onChange={(e) => handleStatusChange(pet.id, e.target.value as PetStatus)}
                            aria-label={`Cambiar estado de ${pet.name}`}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-[11px]"
                          >
                            <option value="lost">🔴 Perdido</option>
                            <option value="found">🟢 Encontrado</option>
                            <option value="adoption">🟣 Adopción</option>
                            <option value="resolved">🎉 Final Feliz</option>
                          </select>

                          {pet.status === 'resolved' && (
                            <button
                              type="button"
                              onClick={() => handleRevertResolved(pet)}
                              title="Revertir Final Feliz accidental y reactivar búsqueda"
                              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reactivar</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-[11px]">
                        <span className="font-semibold block">{pet.authorName}</span>
                        <span className="text-neutral-400 block">
                          Tel: {pet.authorWhatsApp} · PIN Secreto:{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {deriveSecretPinForPet(pet)}
                          </strong>
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPet(pet)}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
                          title="Editar todos los datos de la ficha"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePet(pet.id, pet.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer"
                          title="Eliminar publicación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2B: SOLIDARITY CAMPAIGNS & ANTI-SCAM MODERATION       */}
        {/* ========================================================= */}
        {activeTab === 'campaigns' && (
          <div className="overflow-y-auto space-y-4 flex-1 pr-1">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <strong className="font-display font-extrabold text-sm text-[#111315] dark:text-white block">
                  🛡️ Auditoría de Colectas Solidarias & Banco de Insumos (Sistema 3 Capas)
                </strong>
                <span className="text-neutral-600 dark:text-neutral-300">
                  Verificá los presupuestos veterinarios adjuntos antes de habilitar colectas de vecinos particulares y conciliá aportes reportados en revisión.
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#14171A] border border-emerald-500/30 shrink-0">
                {campaigns.filter((c) => c.status === 'pending_approval').length} pendientes de aprobación
              </span>
            </div>

            {inspectingCampaignEvidence && (
              <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-[#FAF7F2] dark:bg-[#0B0C0E] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 block">
                      EVIDENCIA MÉDICA ADJUNTA (WEBP)
                    </span>
                    <h4 className="font-display font-bold text-sm">
                      {inspectingCampaignEvidence.title} — {inspectingCampaignEvidence.vetClinicName}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingCampaignEvidence(null)}
                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-auto rounded-xl bg-white p-2 border border-black/10 flex justify-center">
                  <img
                    src={
                      inspectingCampaignEvidence.paidReceiptBase64 ||
                      inspectingCampaignEvidence.medicalEvidenceBase64
                    }
                    alt="Presupuesto veterinario"
                    className="max-h-64 w-auto rounded"
                  />
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF7F2] dark:bg-[#0B0C0E] border-b border-black/10 dark:border-white/10 text-neutral-500">
                  <tr>
                    <th className="p-3">Caso & Veterinaria</th>
                    <th className="p-3">Estado & Solicitante</th>
                    <th className="p-3">Progreso P2P / Insumos</th>
                    <th className="p-3">Alias Bancario</th>
                    <th className="p-3 text-right">Acciones Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {campaigns.map((c) => {
                    const prog = calculateCampaignProgress(c);
                    return (
                      <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={c.photoBase64}
                              alt={c.petName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div>
                              <span className="font-display font-bold text-sm text-[#111315] dark:text-white block">
                                {c.petName} ({c.barrio})
                              </span>
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                🏥 {c.vetClinicName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : c.status === 'completed'
                                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                  : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {c.status === 'active'
                              ? 'ACTIVA'
                              : c.status === 'completed'
                                ? '100% CERRADA'
                                : 'PENDIENTE APROBACIÓN'}
                          </span>
                          <span className="block text-[10px] text-neutral-400 mt-1">
                            {c.isVerifiedShelter ? '🐾 Refugio Oficial' : '👤 Vecino Particular'} ·{' '}
                            {c.shelterOrOrganizerName}
                          </span>
                        </td>

                        <td className="p-3">
                          {prog.goalArs > 0 && (
                            <div>
                              <span className="font-bold text-[#111315] dark:text-white">
                                {formatArs(prog.totalRaisedArs)} / {formatArs(prog.goalArs)} (
                                {prog.totalPercent}%)
                              </span>
                              {prog.inReviewArs > 0 && (
                                <span className="block text-[10px] text-amber-600 dark:text-amber-400">
                                  ⏳ {formatArs(prog.inReviewArs)} en revisión
                                </span>
                              )}
                            </div>
                          )}
                          {c.supplies.length > 0 && (
                            <span className="block text-[10px] text-neutral-500">
                              💊 {prog.fulfilledSuppliesCount}/{prog.totalSuppliesCount} insumos
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          {prog.shouldHideBankAlias ? (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              🔒 Oculto (100% Meta)
                            </span>
                          ) : (
                            <span className="font-bold">{c.bankAlias || 'Solo Insumos'}</span>
                          )}
                        </td>

                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setInspectingCampaignEvidence(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            title="Ver presupuesto veterinario"
                          >
                            <FileSearch className="w-3.5 h-3.5 text-[#FF4D38]" />
                            <span>Evidencia</span>
                          </button>

                          {c.status === 'pending_approval' && (
                            <button
                              type="button"
                              onClick={() => handleApproveCampaign(c)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              ✓ Aprobar 1-Clic
                            </button>
                          )}

                          {(c.pendingReviewAmountArs || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPendingContributions(c)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-bold cursor-pointer"
                              title="Confirmar aportes reportados por vecinos"
                            >
                              ✓ Conciliar {formatArs(c.pendingReviewAmountArs)}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteCampaignItem(c)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer"
                            title="Eliminar colecta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SPONSORS, 24H ON-DUTY TOGGLE & RENEWALS            */}
        {/* ========================================================= */}
        {activeTab === 'sponsors' && (
          <div className="overflow-y-auto space-y-4 flex-1 pr-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-neutral-500 font-mono">
                Activá o cambiá la Veterinaria de Guardia 24hs con 1 clic o gestioná cupones comerciales
              </span>
              <button
                type="button"
                onClick={handleOpenNewSponsor}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#F59E0B] hover:bg-amber-500 text-black font-display font-bold text-xs transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Sponsor / Veterinaria</span>
              </button>
            </div>

            {/* Sponsor Edit Form */}
            {editingSponsor && (
              <form
                onSubmit={handleSaveSponsorForm}
                className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                  <h4 className="font-display font-bold text-xs uppercase text-amber-800 dark:text-amber-400">
                    {editingSponsor.id ? 'Editar Comercio / Veterinaria' : 'Registrar Nuevo Sponsor'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingSponsor(null)}
                    className="text-neutral-400 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editingSponsor.name || ''}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, name: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">Rubro</label>
                    <select
                      value={editingSponsor.category || 'veterinaria'}
                      onChange={(e) =>
                        setEditingSponsor({
                          ...editingSponsor,
                          category: e.target.value as SponsorCategory,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    >
                      <option value="veterinaria">Veterinaria</option>
                      <option value="pet_shop">Pet Shop & Forrajería</option>
                      <option value="peluqueria">Peluquería Canina</option>
                      <option value="guarderia">Guardería / Paseador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">Nivel / Plan</label>
                    <select
                      value={editingSponsor.tier || 'comercio_amigo'}
                      onChange={(e) =>
                        setEditingSponsor({
                          ...editingSponsor,
                          tier: e.target.value as SponsorTier,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    >
                      <option value="padrino_gold">Padrino Gold (Destacado)</option>
                      <option value="guardia_24h">Guardia 24hs</option>
                      <option value="comercio_amigo">Comercio Amigo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={editingSponsor.whatsApp || ''}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, whatsApp: e.target.value })
                      }
                      placeholder="3462 123456"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">Dirección en VT</label>
                    <input
                      type="text"
                      value={editingSponsor.address || ''}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, address: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">
                      Fecha Vencimiento Abono
                    </label>
                    <input
                      type="date"
                      value={editingSponsor.expirationDate || ''}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, expirationDate: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">Título Beneficio</label>
                    <input
                      type="text"
                      value={editingSponsor.promoTitle || ''}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, promoTitle: e.target.value })
                      }
                      placeholder="Ej. 15% OFF en consulta"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A]"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 font-mono mb-1">Código Cupón</label>
                    <input
                      type="text"
                      value={editingSponsor.couponCode || ''}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, couponCode: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#14171A] font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSponsor.isOnDutyToday || false}
                      onChange={(e) =>
                        setEditingSponsor({ ...editingSponsor, isOnDutyToday: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>🚨 De Guardia Hoy (Turno 24hs activo)</span>
                  </label>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSponsor(null)}
                      className="py-1 px-3 rounded text-xs text-neutral-500 hover:text-black dark:hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSponsor}
                      className="py-1.5 px-4 rounded-xl bg-[#111315] hover:bg-black text-white dark:bg-white dark:text-[#111315] text-xs font-bold font-display transition cursor-pointer"
                    >
                      {isSavingSponsor ? 'Guardando...' : 'Guardar Sponsor'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sponsors Table with 1-Click 24h On-Duty Toggle */}
            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] dark:bg-[#0B0C0E] border-b border-black/10 dark:border-white/10 font-mono text-neutral-500">
                  <tr>
                    <th className="p-3">Comercio / Veterinaria</th>
                    <th className="p-3">Rubro & Cupón</th>
                    <th className="p-3">Turno Guardia 24hs Hoy</th>
                    <th className="p-3">Vigencia Abono</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono">
                  {sponsors.map((s) => {
                    const expStatus = getSponsorExpirationStatus(s.expirationDate);
                    const renewWaText = encodeURIComponent(
                      `Hola ${s.name}! Te escribimos desde HUELLA VT (Venado Tuerto) para comentarte que tu abono de Comercio Amigo (${s.couponCode}) vence el ${s.expirationDate}. ¿Deseás renovarlo para seguir apoyando la red de rescate?`
                    );
                    const renewWaUrl = `https://wa.me/549${s.whatsApp.replace(/[^0-9]/g, '')}?text=${renewWaText}`;

                    return (
                      <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="p-3">
                          <span className="font-bold font-display text-sm text-[#111315] dark:text-white block">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">{s.address}</span>
                        </td>
                        <td className="p-3 text-[11px]">
                          <span className="uppercase text-neutral-500 block">{s.category}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            Cupón: {s.couponCode}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleOnDuty(s)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              s.isOnDutyToday
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            {s.isOnDutyToday ? '🚨 EN GUARDIA HOY (Activo)' : 'Asignar Turno Hoy'}
                          </button>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded border text-[11px] font-bold ${expStatus.badgeClass}`}
                          >
                            {expStatus.label}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <a
                            href={renewWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enviar aviso de renovación por WhatsApp"
                            className="inline-flex p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setEditingSponsor(s)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSponsorItem(s.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BACKUP JSON, RESTORE & SECURITY AUDIT              */}
        {/* ========================================================= */}
        {activeTab === 'backup' && (
          <div className="overflow-y-auto space-y-5 flex-1 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Export Box */}
              <div className="p-5 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold block">
                    Respaldo Completo Instantáneo
                  </span>
                  <h3 className="font-display font-extrabold text-base mt-1">
                    Exportar Base de Datos en JSON
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Descarga un archivo <code>.json</code> con las {pets.length} publicaciones de
                    mascotas y los {sponsors.length} comercios registrados para resguardo externo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Backup JSON Ahora</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="p-5 rounded-2xl border border-black/8 dark:border-white/8 bg-[#FAF7F2] dark:bg-[#0B0C0E] space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold block">
                    Restauración de Lote
                  </span>
                  <h3 className="font-display font-extrabold text-base mt-1">
                    Importar Respaldo JSON
                  </h3>
                </div>

                <textarea
                  rows={3}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='Pegá aquí el contenido del archivo JSON exportado...'
                  className="w-full p-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#14171A] text-xs font-mono"
                />

                <button
                  type="button"
                  onClick={handleImportBackup}
                  disabled={!jsonImportText.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#111315] dark:bg-white text-white dark:text-[#111315] font-display font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restaurar Datos desde JSON</span>
                </button>
              </div>
            </div>

            {/* Security Protections Checklist */}
            <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-display font-bold text-sm">
                   Capas de Seguridad y Prevención de Errores Activas
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-black/6 dark:border-white/6">
                  <strong className="text-[#111315] dark:text-white block mb-1">
                    ✓ Verificación Anti-Error Final Feliz
                  </strong>
                  Exige los últimos 4 dígitos del WhatsApp del publicante o sesión propietaria antes
                  de marcar una mascota como encontrada.
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-black/6 dark:border-white/6">
                  <strong className="text-[#111315] dark:text-white block mb-1">
                    ✓ Saneamiento XSS & Rate-Limit
                  </strong>
                  Todas las entradas eliminan etiquetas HTML/scripts y aplican enfriamiento de 15s
                  entre publicaciones.
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-black/6 dark:border-white/6">
                  <strong className="text-[#111315] dark:text-white block mb-1">
                    ✓ Reversión Instantánea Admin
                  </strong>
                  Permite reactivar cualquier alerta cerrada por error con un clic desde la tabla de
                  moderación.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-black/8 dark:border-white/8 flex justify-between items-center text-xs text-neutral-500 shrink-0">
          <span className="font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF4D38]" />
            <span>HUELLA VT · Venado Tuerto, Santa Fe</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-display font-bold transition cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
