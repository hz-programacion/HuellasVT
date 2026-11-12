import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pet, Sponsor } from './types';
import { getPets, getSponsors, updatePetStatus, subscribeToDataChanges } from './services/dataService';
import { findSmartMatches } from './utils/matching';
import { triggerHappyEndingConfetti } from './utils/confetti';
import { Header } from './components/Header';
import { MarqueeTicker } from './components/MarqueeTicker';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Hero } from './components/Hero';
import { RadarSection } from './components/RadarSection';
import { AdoptionsSection } from './components/AdoptionsSection';
import { EmergencySosSection } from './components/EmergencySosSection';
import { DirectorySection } from './components/DirectorySection';
import { PublishModal } from './components/PublishModal';
import { StoryCanvasModal } from './components/StoryCanvasModal';
import { SmartMatchModal } from './components/SmartMatchModal';
import { PetDetailModal } from './components/PetDetailModal';
import { HappyEndingVerificationModal } from './components/HappyEndingVerificationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { FloatingBottomNav } from './components/FloatingBottomNav';
import { FluidAtmosphere } from './components/FluidAtmosphere';
import { CustomCursor } from './components/CustomCursor';
import { Sparkles, Shield } from 'lucide-react';

export default function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentTab, setCurrentTab] = useState<'radar' | 'adoptions' | 'emergency' | 'directory'>('radar');

  // Modals state
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedPetForStory, setSelectedPetForStory] = useState<Pet | null>(null);
  const [selectedPetForMatch, setSelectedPetForMatch] = useState<Pet | null>(null);
  const [selectedPetForDetail, setSelectedPetForDetail] = useState<Pet | null>(null);
  const [selectedPetForHappyEnding, setSelectedPetForHappyEnding] = useState<Pet | null>(null);
  const [happyEndingNotice, setHappyEndingNotice] = useState<string | null>(null);

  // Global keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huella_vt_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.getElementById('theme-color-meta');
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('huella_vt_theme', 'dark');
      if (metaTheme) metaTheme.setAttribute('content', '#0B0C0E');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('huella_vt_theme', 'light');
      if (metaTheme) metaTheme.setAttribute('content', '#FAF7F2');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Load pets and sponsors
  const loadData = useCallback(async () => {
    try {
      const [loadedPets, loadedSponsors] = await Promise.all([getPets(), getSponsors()]);
      setPets(loadedPets);
      setSponsors(loadedSponsors);
    } catch (err) {
      console.warn('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

  // Sponsors references
  const dutyVet = useMemo(() => sponsors.find((s) => s.isOnDutyToday) || null, [sponsors]);
  const padrinoGold = useMemo(() => sponsors.find((s) => s.tier === 'padrino_gold') || null, [sponsors]);

  // Featured urgent pet for Hero spotlight
  const featuredPet = useMemo(
    () => pets.find((p) => p.status === 'lost') || pets.find((p) => p.status === 'found') || null,
    [pets]
  );

  // Counts
  const activeCount = useMemo(() => pets.filter((p) => p.status !== 'resolved').length, [pets]);
  const resolvedCount = useMemo(() => pets.filter((p) => p.status === 'resolved').length, [pets]);

  // Verified Handler for Final Feliz (only called after passing HappyEndingVerificationModal)
  const handleVerifiedHappyEnding = async (petId: string, resolvedNotes?: string) => {
    try {
      await updatePetStatus(petId, 'resolved', resolvedNotes);
      triggerHappyEndingConfetti();
      const target = pets.find((p) => p.id === petId);
      const name = target ? target.name : 'La mascota';
      setHappyEndingNotice(
        `¡Final Feliz Verificado en Venado Tuerto! ${name} ya está en casa con su familia.`
      );
      setTimeout(() => setHappyEndingNotice(null), 5500);
    } catch (e) {
      console.warn('Error marking happy ending:', e);
    }
  };

  // Handler when a new pet is created
  const handlePetCreated = (newPet: Pet) => {
    triggerHappyEndingConfetti();
    if (newPet.status === 'lost') {
      const matches = findSmartMatches(newPet, pets);
      if (matches.length > 0) {
        setSelectedPetForMatch(newPet);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#111315] dark:bg-[#0B0C0E] dark:text-[#EDEDED] relative transition-colors duration-300">
      {/* Subtle Analog Grain Texture Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Context-Aware Fluid Mesh Atmosphere + Invisible Gooey SVG Filter */}
      <FluidAtmosphere currentTab={currentTab} />

      {/* Custom Contextual Spring-Physics Follower Cursor (Desktop) */}
      <CustomCursor />

      {/* Top Kinetic Ticker */}
      <MarqueeTicker
        pets={pets}
        sponsors={sponsors}
        onSelectPet={(p) => setSelectedPetForDetail(p)}
      />

      {/* Top Bar (3-Zone Contract) */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as typeof currentTab)}
        onOpenPublish={() => setIsPublishOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Subtle PWA Install Banner */}
      <PWAInstallBanner />

      {/* Happy Ending Toast Notice */}
      {happyEndingNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-[#111315] dark:bg-white text-white dark:text-[#111315] shadow-2xl flex items-center gap-3 border border-amber-500/50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md"
        >
          <span className="p-2 rounded-xl bg-[#F59E0B] text-black shrink-0">
            <Sparkles className="w-5 h-5 fill-black" />
          </span>
          <div className="text-xs">
            <span className="font-display font-bold block text-sm">¡Final Feliz Verificado!</span>
            <span>{happyEndingNotice}</span>
          </div>
          <button
            onClick={() => setHappyEndingNotice(null)}
            className="text-neutral-400 hover:text-white dark:hover:text-black ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1 pb-24 lg:pb-12">
        {currentTab === 'radar' && (
          <>
            <Hero
              resolvedCount={resolvedCount}
              activeCount={activeCount}
              dutyVet={dutyVet}
              padrinoGold={padrinoGold}
              featuredPet={featuredPet}
              onSelectPet={(pet) => setSelectedPetForDetail(pet)}
              onOpenPublish={() => setIsPublishOpen(true)}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onGoToEmergency={() => setCurrentTab('emergency')}
              onGoToAdoptions={() => setCurrentTab('adoptions')}
            />

            <RadarSection
              pets={pets}
              sponsors={sponsors}
              onOpenStoryCanvas={(pet) => setSelectedPetForStory(pet)}
              onOpenSmartMatch={(pet) => setSelectedPetForMatch(pet)}
              onOpenDetail={(pet) => setSelectedPetForDetail(pet)}
              onMarkHappyEnding={(pet) => setSelectedPetForHappyEnding(pet)}
              onOpenPublish={() => setIsPublishOpen(true)}
            />
          </>
        )}

        {currentTab === 'adoptions' && (
          <AdoptionsSection
            pets={pets}
            onOpenStoryCanvas={(pet) => setSelectedPetForStory(pet)}
            onOpenDetail={(pet) => setSelectedPetForDetail(pet)}
            onMarkHappyEnding={(pet) => setSelectedPetForHappyEnding(pet)}
            onOpenPublish={() => setIsPublishOpen(true)}
          />
        )}

        {currentTab === 'emergency' && (
          <EmergencySosSection sponsors={sponsors} />
        )}

        {currentTab === 'directory' && (
          <DirectorySection sponsors={sponsors} />
        )}
      </main>

      {/* Mobile Dynamic Island Navigation */}
      <FloatingBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as typeof currentTab)}
        onOpenPublish={() => setIsPublishOpen(true)}
      />

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-4 sm:px-6 bg-[#FAF7F2] dark:bg-[#0B0C0E] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-[#111315] dark:text-white">
              HUELLA VT
            </span>
            <span>·</span>
            <span>Venado Tuerto, Santa Fe (33°45′S 61°58′O)</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-neutral-500 hover:text-black dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Centro de Comando Admin</span>
            </button>
            <span>·</span>
            <a
              href="https://wa.me/5493462551423"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Mesa de Ayuda
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCommandPaletteOpen && (
        <CommandPaletteModal
          pets={pets}
          sponsors={sponsors}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectPet={(pet) => setSelectedPetForDetail(pet)}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenPublish={() => setIsPublishOpen(true)}
        />
      )}

      {isPublishOpen && (
        <PublishModal
          onClose={() => setIsPublishOpen(false)}
          onPetCreated={handlePetCreated}
        />
      )}

      {selectedPetForStory && (
        <StoryCanvasModal
          pet={selectedPetForStory}
          activeSponsor={padrinoGold || dutyVet}
          onClose={() => setSelectedPetForStory(null)}
        />
      )}

      {selectedPetForMatch && (
        <SmartMatchModal
          targetPet={selectedPetForMatch}
          matches={findSmartMatches(selectedPetForMatch, pets)}
          onClose={() => setSelectedPetForMatch(null)}
          onSelectPet={(p) => {
            setSelectedPetForMatch(null);
            setSelectedPetForDetail(p);
          }}
        />
      )}

      {selectedPetForDetail && (
        <PetDetailModal
          pet={selectedPetForDetail}
          matchCount={
            selectedPetForDetail.status === 'lost' || selectedPetForDetail.status === 'found'
              ? findSmartMatches(selectedPetForDetail, pets).length
              : 0
          }
          onClose={() => setSelectedPetForDetail(null)}
          onOpenStoryCanvas={(pet) => setSelectedPetForStory(pet)}
          onOpenSmartMatch={(pet) => setSelectedPetForMatch(pet)}
          onMarkHappyEnding={(pet) => setSelectedPetForHappyEnding(pet)}
        />
      )}

      {selectedPetForHappyEnding && (
        <HappyEndingVerificationModal
          pet={selectedPetForHappyEnding}
          onClose={() => setSelectedPetForHappyEnding(null)}
          onVerifiedConfirm={handleVerifiedHappyEnding}
        />
      )}

      {isAdminOpen && (
        <AdminDashboard
          pets={pets}
          sponsors={sponsors}
          onClose={() => setIsAdminOpen(false)}
          onDataRefresh={loadData}
        />
      )}
    </div>
  );
}
