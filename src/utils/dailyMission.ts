/* NEW CODE ADDITIONS START: DAILY MISSION GENERATOR AND UTILITIES */
import { DailyMission, MissionType } from '../types';

export const DAILY_MISSION_STORAGE_KEY = 'VOID_RUNNER_DAILY_MISSION';

/**
 * Returns current local date formatted as YYYY-MM-DD
 */
export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Deterministic hash generator from date string for reproducible daily mission roll
 */
export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

interface MissionTemplate {
  type: MissionType;
  title: string;
  descriptionTemplate: (target: number) => string;
  possibleTargets: number[];
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'ORBS_SINGLE_RUN',
    title: 'DATA EXTRACTION // ORB RECOVERY',
    descriptionTemplate: (target) => `Harvest ${target} Cyber-Orbs in a single continuous run`,
    possibleTargets: [35, 40, 50, 60],
  },
  {
    type: 'DISTANCE_SINGLE_RUN',
    title: 'DEEP INFILTRATION // RUNNER METRICS',
    descriptionTemplate: (target) => `Penetrate ${target.toLocaleString()} meters through the Void in a single run`,
    possibleTargets: [1200, 1500, 2000, 2500],
  },
  {
    type: 'COMBO_STREAK',
    title: 'HARMONIC SYNAPSE // STREAK PROTOCOL',
    descriptionTemplate: (target) => `Achieve a continuous combo streak of ${target} consecutive orbs`,
    possibleTargets: [12, 16, 20, 25],
  },
  {
    type: 'DIMENSION_SHIFTS',
    title: 'WARP OVERDRIVE // PHASE SHIFTER',
    descriptionTemplate: (target) => `Trigger Dimension Shift ${target} times in a single run`,
    possibleTargets: [2, 3, 4],
  },
];

const POSSIBLE_REWARDS = [3000, 4500, 5000, 6500, 8000, 10000];

/**
 * Procedurally generates deterministic daily mission based on calendar date key
 */
export const generateDailyMission = (dateKey: string = getTodayDateKey()): DailyMission => {
  const seed = hashString(dateKey);
  const templateIndex = seed % MISSION_TEMPLATES.length;
  const template = MISSION_TEMPLATES[templateIndex];

  const targetIndex = (Math.floor(seed / 7)) % template.possibleTargets.length;
  const targetValue = template.possibleTargets[targetIndex];

  const rewardIndex = (Math.floor(seed / 13)) % POSSIBLE_REWARDS.length;
  const rewardPoints = POSSIBLE_REWARDS[rewardIndex];

  return {
    id: `mission-${dateKey}`,
    dateKey,
    type: template.type,
    title: template.title,
    description: template.descriptionTemplate(targetValue),
    targetValue,
    currentProgress: 0,
    completed: false,
    rewardPoints,
    rewardClaimed: false,
  };
};

/**
 * Loads daily mission from localStorage; refreshes if date has shifted to a new calendar day
 */
export const loadOrGenerateDailyMission = (): DailyMission => {
  const todayKey = getTodayDateKey();
  try {
    const raw = localStorage.getItem(DAILY_MISSION_STORAGE_KEY);
    if (raw) {
      const parsed: DailyMission = JSON.parse(raw);
      if (parsed && parsed.dateKey === todayKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading daily mission:', err);
  }

  // Generate fresh mission for today
  const newMission = generateDailyMission(todayKey);
  saveDailyMission(newMission);
  return newMission;
};

/**
 * Persists updated daily mission into localStorage
 */
export const saveDailyMission = (mission: DailyMission): void => {
  try {
    localStorage.setItem(DAILY_MISSION_STORAGE_KEY, JSON.stringify(mission));
  } catch (err) {
    console.error('Error saving daily mission:', err);
  }
};
/* NEW CODE ADDITIONS END: DAILY MISSION GENERATOR AND UTILITIES */
