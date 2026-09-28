/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ACTIVITIES } from './data/activities';
import { Activity, ActivityId, SavedBadge, AppSettings } from './types';
import { DigitalMirror } from './components/DigitalMirror';
import { ScoreProgress } from './components/ScoreProgress';
import { GentleVoiceBar } from './components/GentleVoiceBar';
import { StepGuideCard } from './components/StepGuideCard';
import { CelebrationModal } from './components/CelebrationModal';
import { BadgeGalleryModal } from './components/BadgeGalleryModal';
import { SettingsModal } from './components/SettingsModal';
import { playPop, playChime, playStarSound, stopSpeech } from './utils/audio';
import {
  Sparkles,
  Trophy,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Smile,
  ChevronRight,
  Crosshair,
} from 'lucide-react';

const STORAGE_KEY_BADGES = 'cinta_nadi_badges_v1';
const STORAGE_KEY_SETTINGS = 'cinta_nadi_settings_v1';

export default function App() {
  // Navigation: 'menu' (Home Selection - No Camera) or 'practice' (Active Digital Mirror with Camera)
  const [currentView, setCurrentView] = useState<'menu' | 'practice'>('menu');
  const [activeActivityId, setActiveActivityId] = useState<ActivityId>('teeth');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Step Precision Progress (runs 1 to 100 per step)
  const [stepMotionProgress, setStepMotionProgress] = useState<number>(0);
  const [isSensorAccurate, setIsSensorAccurate] = useState<boolean>(false);

  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [latestSnapshot, setLatestSnapshot] = useState<string | undefined>(undefined);
  const [badges, setBadges] = useState<SavedBadge[]>([]);

  // Default app settings
  const [settings, setSettings] = useState<AppSettings>({
    voiceEnabled: true,
    voiceVolume: 1.0,
    speechRate: 1.02,
    speechPitch: 1.35,
    autoAdvanceOnMotion: true,
    gentleReminderIntervalSec: 12,
    mirrorFilter: 'stars',
    highContrast: false,
  });

  // Load saved badges and settings
  useEffect(() => {
    try {
      const savedBadges = localStorage.getItem(STORAGE_KEY_BADGES);
      if (savedBadges) {
        setBadges(JSON.parse(savedBadges));
      }
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed saving settings:', e);
    }
  };

  const currentActivity: Activity =
    ACTIVITIES.find((a) => a.id === activeActivityId) || ACTIVITIES[0];
  const currentStep = currentActivity.steps[currentStepIndex];
  const totalSteps = currentActivity.steps.length;

  // Real-time Overall Score (0 to 100) dynamically driven by step precision!
  // If sensor stops, score stops immediately!
  const overallScore = Math.min(
    100,
    Math.floor(currentStepIndex * 20 + stepMotionProgress * 0.2)
  );

  // Open activity from Menu -> Activates Camera
  const handleStartActivity = (id: ActivityId) => {
    stopSpeech();
    playChime(0.4);
    setActiveActivityId(id);
    setCurrentStepIndex(0);
    setStepMotionProgress(0);
    setIsSensorAccurate(false);
    setIsCelebrationOpen(false);
    setLatestSnapshot(undefined);
    setCurrentView('practice');
  };

  // Return to Menu -> Completely stops speech and unmounts Camera
  const handleReturnToMenu = () => {
    stopSpeech();
    playPop(0.3);
    setCurrentView('menu');
    setIsCelebrationOpen(false);
    setIsSensorAccurate(false);
  };

  // Called by DigitalMirror when sensor detects movement (accurate or not)
  const handleUpdateStepProgress = useCallback((newProgress: number, isAccurate: boolean) => {
    setStepMotionProgress(newProgress);
    setIsSensorAccurate(isAccurate);
  }, []);

  // When step reaches 100% accuracy
  const handleStepCompleted = useCallback(() => {
    // Reached 100 on current step!
    if (currentStepIndex === totalSteps - 1) {
      // Final step completed -> Celebratory modal
      setTimeout(() => {
        setIsCelebrationOpen(true);
        const newBadge: SavedBadge = {
          id: 'badge_' + Date.now(),
          activityId: currentActivity.id,
          title: currentActivity.title,
          badgeName: currentActivity.badgeName,
          timestamp: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          score: 100,
          photoUrl: latestSnapshot,
        };

        setBadges((prev) => {
          const updated = [newBadge, ...prev];
          try {
            localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(updated));
          } catch (e) {
            console.warn('Error saving badge:', e);
          }
          return updated;
        });
      }, 500);
    }
  }, [currentStepIndex, totalSteps, currentActivity, latestSnapshot]);

  // When clicking Next Step
  const handleNextStep = () => {
    stopSpeech();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setStepMotionProgress(0);
      setIsSensorAccurate(false);
    } else {
      setIsCelebrationOpen(true);
    }
  };

  const handlePrevStep = () => {
    stopSpeech();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setStepMotionProgress(0);
      setIsSensorAccurate(false);
    }
  };

  // Manual assistance button ("Aku Sedang Melakukan!" / Guru Bantu)
  const handleManualAction = () => {
    setStepMotionProgress((prev) => {
      const next = Math.min(100, prev + 10);
      if (next >= 100) {
        handleStepCompleted();
      }
      return next;
    });
    setIsSensorAccurate(true);
  };

  const handleRestartPractice = () => {
    playPop(0.3);
    setCurrentStepIndex(0);
    setStepMotionProgress(0);
    setIsSensorAccurate(false);
    setIsCelebrationOpen(false);
  };

  const handleSnapshotTaken = (dataUrl: string) => {
    setLatestSnapshot(dataUrl);
    playStarSound(0.4);
  };

  const handleClearBadges = () => {
    setBadges([]);
    try {
      localStorage.removeItem(STORAGE_KEY_BADGES);
    } catch (e) {
      console.warn('Error clearing badges:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-pink-50 flex flex-col justify-between selection:bg-amber-300">
      {/* Top Application Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-sm sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Title & Mascot Logo */}
          <div className="flex items-center gap-3">
            {currentView === 'practice' && (
              <button
                onClick={handleReturnToMenu}
                className="p-2 sm:px-3 sm:py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-2xl text-xs sm:text-sm border-2 border-amber-500 shadow-sm transition-all flex items-center gap-1.5"
                title="Kembali ke Menu Pilihan Kegiatan (Matikan Kamera)"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Pilihan Menu</span>
              </button>
            )}

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                if (currentView === 'practice') handleReturnToMenu();
              }}
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center animate-wiggle shrink-0">
                <span className="text-2xl sm:text-3xl select-none">⭐</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-600 tracking-tight font-heading leading-none">
                    CINTA NADI
                  </h1>
                  <span className="text-[10px] sm:text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Bina Diri
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-600 truncate max-w-[200px] sm:max-w-none">
                  Cermin Digital Interaktif Anak Tunagrahita
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions: Trophies & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playPop(0.3);
                setIsGalleryOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-950 font-black rounded-2xl text-xs sm:text-sm border-2 border-amber-300 shadow-sm transition-all"
              title="Lihat Piala & Lencana yang Diraih"
            >
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline">Piala Saya</span>
              <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[11px]">
                {badges.length}
              </span>
            </button>

            <button
              onClick={() => {
                playPop(0.3);
                setIsSettingsOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm border border-slate-300 transition-all flex items-center gap-1.5"
              title="Pengaturan Guru & Orang Tua"
            >
              <Settings className="w-4 h-4 text-slate-700" />
              <span className="hidden md:inline">Mode Pendamping</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. HOME MENU VIEW (NO CAMERA ACTIVE UNTIL MENU IS CLICKED) */}
      {/* ========================================================= */}
      {currentView === 'menu' && (
        <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center">
          <div className="bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-white mb-8 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-400 border-4 border-white shadow-xl rounded-3xl mx-auto flex items-center justify-center text-4xl sm:text-5xl mb-3 animate-bounce-slow">
                ⭐
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading mb-2">
                Halo Sahabat Hebat!
              </h2>
              <p className="text-base sm:text-xl font-bold text-slate-700 mb-3">
                Siap belajar bina diri di Cermin Ajaib hari ini?
              </p>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-2 rounded-full border-2 border-amber-300 shadow-sm text-xs sm:text-sm font-extrabold text-amber-900">
                <Crosshair className="w-4 h-4 text-emerald-600" />
                <span>Sensor latihan berjalan 1-100 saat gerakan tepat, dan berhenti jika belum tepat:</span>
              </div>
            </div>
          </div>

          {/* 3 Prominent Activity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACTIVITIES.map((act) => {
              const iconEmoji = act.id === 'teeth' ? '🪥' : act.id === 'hands' ? '🧼' : '🪮';
              const cardBg =
                act.id === 'teeth'
                  ? 'hover:border-sky-400 border-sky-200 bg-gradient-to-b from-sky-50 to-white'
                  : act.id === 'hands'
                  ? 'hover:border-emerald-400 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white'
                  : 'hover:border-amber-400 border-amber-200 bg-gradient-to-b from-amber-50 to-white';

              const buttonBg =
                act.id === 'teeth'
                  ? 'bg-sky-500 hover:bg-sky-600 border-sky-300'
                  : act.id === 'hands'
                  ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-300'
                  : 'bg-amber-500 hover:bg-amber-600 border-amber-300 text-slate-950';

              return (
                <div
                  key={act.id}
                  className={`rounded-3xl p-6 border-4 shadow-xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer ${cardBg}`}
                  onClick={() => handleStartActivity(act.id)}
                >
                  <div>
                    <div className="w-20 h-20 rounded-3xl bg-white border-4 border-amber-300 shadow-md flex items-center justify-center text-5xl mx-auto mb-4 animate-bounce-slow">
                      {iconEmoji}
                    </div>

                    <div className="text-center">
                      <span className="text-xs uppercase font-extrabold text-amber-700 tracking-wider">
                        Praktek Mandiri
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1 mb-2">
                        {act.title}
                      </h3>
                      <p className="text-sm font-bold text-slate-600 mb-4">
                        {act.tagline}
                      </p>

                      <div className="flex flex-col gap-1.5 text-xs text-left bg-white/80 p-3 rounded-2xl border border-slate-200 mb-5">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Sensor Presisi: Berjalan 1-100 saat Tepat</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                          <Crosshair className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Skor Berhenti Jika Gerakan di Luar Target</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Suara Pengingat Lembut Bimbingan Fokus</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartActivity(act.id);
                    }}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-white shadow-lg flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${buttonBg}`}
                  >
                    <span>Mulai Latihan Cermin</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* 2. PRACTICE VIEW (CAMERA ONLY MOUNTS HERE ON MENU CLICK)  */}
      {/* ========================================================= */}
      {currentView === 'practice' && (
        <main className="max-w-7xl mx-auto w-full p-3 sm:p-5 flex-1 flex flex-col gap-4">
          {/* Activity Switcher Bar while practicing */}
          <div className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-300 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {ACTIVITIES.map((act) => {
                const isSelected = act.id === activeActivityId;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      playPop(0.3);
                      setActiveActivityId(act.id);
                      setCurrentStepIndex(0);
                      setStepMotionProgress(0);
                      setIsSensorAccurate(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 shadow-sm font-extrabold border border-amber-500'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{act.id === 'teeth' ? '🪥' : act.id === 'hands' ? '🧼' : '🪮'}</span>
                    <span>{act.shortTitle}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleReturnToMenu}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
              title="Kembali ke Menu Utama & Matikan Kamera"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Menu</span>
            </button>
          </div>

          {/* Core Workspace: Split Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
            {/* Left Column: Digital Mirror with Target Zone & Sensor Accuracy Tracking */}
            <div className="lg:col-span-7 flex flex-col min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
              <DigitalMirror
                activityId={currentActivity.id}
                filterStyle={settings.mirrorFilter}
                overlayType={currentStep.overlayType}
                motionProgress={stepMotionProgress}
                onUpdateStepProgress={handleUpdateStepProgress}
                onStepCompleted={handleStepCompleted}
                onSnapshotTaken={handleSnapshotTaken}
                currentStepTitle={currentStep.title}
                isCompleted={overallScore >= 100}
              />
            </div>

            {/* Right Column: Score, Gentle Voice, and PECS Step Guide */}
            <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4 justify-between">
              {/* 1. Score Progress (Shows Step Sensor 1-100 & Running Overall Score 100) */}
              <ScoreProgress
                score={overallScore}
                stepProgress={stepMotionProgress}
                isAccurate={isSensorAccurate}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
              />

              {/* 2. Gentle Voice Reminder with Indonesian Speech and Friendly Mascot */}
              <GentleVoiceBar
                promptText={currentStep.gentleVoicePrompt}
                voiceEnabled={settings.voiceEnabled}
                onToggleVoice={() =>
                  saveSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })
                }
                activityName={currentActivity.shortTitle}
              />

              {/* 3. Illustrated Step Guide Card with Precision Feedback */}
              <StepGuideCard
                step={currentStep}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
                stepProgress={stepMotionProgress}
                isAccurate={isSensorAccurate}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
                onEncourageAction={handleManualAction}
                isReadyForNext={stepMotionProgress >= 100}
                themeColor={currentActivity.themeColor}
              />
            </div>
          </div>
        </main>
      )}

      {/* Playful Footer */}
      <footer className="w-full bg-white/80 backdrop-blur-xs border-t-2 border-amber-200 py-2.5 px-4 text-center mt-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-1.5 font-medium">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <Smile className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>CINTA NADI: Cermin Digital Bina Diri Anak Tunagrahita</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✨ Sensor Presisi 1-100: Skor berjalan saat gerakan tepat, berhenti saat tidak tepat ✨</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCelebrationOpen && (
        <CelebrationModal
          activity={currentActivity}
          score={100}
          onRestart={handleRestartPractice}
          onChooseOther={() => {
            setIsCelebrationOpen(false);
            handleReturnToMenu();
          }}
          snapshotUrl={latestSnapshot}
          voiceEnabled={settings.voiceEnabled}
        />
      )}

      <BadgeGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        badges={badges}
        onClearBadges={handleClearBadges}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={saveSettings}
      />
    </div>
  );
}
