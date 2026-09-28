import React from 'react';
import { X, Settings, Volume2, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { AppSettings, MirrorFilter } from '../types';
import { speakGentle, playPop } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const testVoice = () => {
    speakGentle('Halo sahabat pintar! Wah, kamu hebat sekali hari ini! Ayo kita berlatih dengan riang gembira dan penuh semangat! Hore!', {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      volume: settings.voiceVolume,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                Pengaturan Pendamping & Cermin
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Khusus Guru SLB & Orang Tua untuk kenyamanan anak
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPop(0.3);
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-5 space-y-5 text-sm">
          {/* Gentle Voice Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-sky-50 rounded-2xl border border-sky-100">
            <div>
              <div className="font-extrabold text-slate-800">
                Pengingat Suara Lembut (TTS)
              </div>
              <div className="text-xs text-slate-500">
                Suara ramah untuk menjaga fokus anak selama praktek
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceEnabled}
              onChange={(e) =>
                onUpdateSettings({ ...settings, voiceEnabled: e.target.checked })
              }
              className="w-6 h-6 accent-sky-600 rounded cursor-pointer"
            />
          </div>

          {/* Voice Speed & Cheerfulness */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700">Gaya Suara Kak Nadi:</span>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {settings.speechRate >= 1.05 ? 'Super Ceria' : settings.speechRate >= 1.0 ? 'Ceria & Semangat' : 'Lembut & Santai'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Ceria & Semangat ✨', rate: 1.02, pitch: 1.35 },
                { label: 'Super Ceria! 🎉', rate: 1.05, pitch: 1.4 },
                { label: 'Lembut & Santai 🌸', rate: 0.92, pitch: 1.2 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => onUpdateSettings({ ...settings, speechRate: opt.rate, speechPitch: opt.pitch })}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.speechRate === opt.rate
                      ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm font-extrabold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Mode Notice */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
            💡 Suara pendamping hanya berbunyi 1 kali saat langkah baru dimulai (tidak berulang-ulang), atau dapat ditekan tombol "Ulangi Suara" kapan saja.
          </div>

          {/* Frame Style Selector */}
          <div>
            <span className="font-bold text-slate-700 block mb-1.5">
              Bingkai Cermin Ajaib:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'stars' as MirrorFilter, label: '⭐ Bintang Emas' },
                { id: 'rainbow' as MirrorFilter, label: '🌈 Pelangi Ceria' },
                { id: 'bubbles' as MirrorFilter, label: '🧼 Gelembung Busa' },
                { id: 'simple' as MirrorFilter, label: '✨ Polos Bersih' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ ...settings, mirrorFilter: f.id })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                    settings.mirrorFilter === f.id
                      ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice sample test button */}
          <button
            onClick={testVoice}
            className="w-full py-2.5 px-4 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold rounded-xl flex items-center justify-center gap-2 border border-sky-300 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tes Suara Lembut Kak Nadi</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              playPop(0.3);
              onClose();
            }}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-sm shadow-md transition-all active:scale-95"
          >
            Simpan & Mulai
          </button>
        </div>
      </div>
    </div>
  );
};
