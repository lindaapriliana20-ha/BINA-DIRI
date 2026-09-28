import React from 'react';
import { Award, Star, X, Calendar, Sparkles, Trash2, Camera } from 'lucide-react';
import { SavedBadge } from '../types';
import { playPop } from '../utils/audio';

interface BadgeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: SavedBadge[];
  onClearBadges?: () => void;
}

export const BadgeGalleryModal: React.FC<BadgeGalleryModalProps> = ({
  isOpen,
  onClose,
  badges,
  onClearBadges,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md text-amber-950">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Piala & Bintang Bina Diri
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Koleksi penghargaan selamat dan hebat yang telah kamu raih!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPop(0.3);
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          {badges.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-4xl">
                🌟
              </div>
              <h4 className="text-lg font-bold text-slate-800 font-heading">
                Belum Ada Lencana Tersimpan
              </h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                Ayo mulai praktek menggosok gigi, mencuci tangan, atau menyisir rambut sampai nilai 100 untuk meraih lencana pertamamu!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="bg-gradient-to-br from-amber-50 to-sky-50 rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-2xl flex items-center justify-center shrink-0 shadow-xs">
                      {b.activityId === 'teeth' ? '🪥' : b.activityId === 'hands' ? '🧼' : '🪮'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Skor {b.score}/100</span>
                      </div>
                      <h4 className="font-black text-slate-800 text-base font-heading truncate">
                        {b.badgeName}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{b.timestamp}</span>
                      </p>
                    </div>
                  </div>

                  {b.photoUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-amber-300">
                      <img
                        src={b.photoUrl}
                        alt="Foto Juara"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Total Lencana: {badges.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {badges.length > 0 && onClearBadges && (
              <button
                onClick={onClearBadges}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Lencana</span>
              </button>
            )}
            <button
              onClick={() => {
                playPop(0.3);
                onClose();
              }}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              Tutup Galeri
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
