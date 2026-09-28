export type ActivityId = 'teeth' | 'hands' | 'hair';

export type MirrorFilter = 'stars' | 'rainbow' | 'bubbles' | 'simple';

export interface ActivityStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  gentleVoicePrompt: string;
  gentleVoiceReminder: string;
  durationSeconds: number; // recommended practice duration
  iconType: 'toothbrush' | 'soap' | 'comb' | 'water' | 'smile' | 'rub' | 'clean';
  overlayType: 'teeth-sparkle' | 'bubbles' | 'comb-sparkle' | 'clean-star';
}

export interface Activity {
  id: ActivityId;
  title: string;
  shortTitle: string;
  tagline: string;
  themeColor: string;
  accentBg: string;
  steps: ActivityStep[];
  celebrationTitle: string;
  celebrationMessage: string;
  badgeName: string;
  badgeDescription: string;
}

export interface SavedBadge {
  id: string;
  activityId: ActivityId;
  title: string;
  badgeName: string;
  timestamp: string;
  score: number;
  photoUrl?: string;
}

export interface AppSettings {
  voiceEnabled: boolean;
  voiceVolume: number; // 0 to 1
  speechRate: number; // 0.7 to 1.1 (gentle is ~0.85)
  speechPitch: number; // 1.0 to 1.3
  autoAdvanceOnMotion: boolean;
  gentleReminderIntervalSec: number; // e.g. 12 seconds
  mirrorFilter: MirrorFilter;
  highContrast: boolean;
}
