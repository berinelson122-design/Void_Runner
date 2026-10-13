import { create } from 'zustand';
import { Lane, PowerUpType, ActivePowerUp, DimensionTierPreset, RunnerRecord, DailyMission, MissionAlert, MissionType } from '../types';
import { AudioSynth as audioSynth } from '../services/AudioSynth';
import { loadOrGenerateDailyMission, saveDailyMission, DAILY_MISSION_STORAGE_KEY } from '../utils/dailyMission';

/* NEW CODE ADDITIONS START: LOCAL STORAGE KEYS */
export const STORAGE_KEYS = {
  TOP_SCORE: 'VOID_RUNNER_TOPSCORE',
  BEST_DISTANCE: 'VOID_RUNNER_BEST_DISTANCE',
  RUNNERS_HISTORY: 'VOID_RUNNER_BEST_DISTANCE_HISTORY',
  PLAYER_CALLSIGN: 'VOID_RUNNER_CALLSIGN',
  DAILY_MISSION: DAILY_MISSION_STORAGE_KEY,
} as const;
/* NEW CODE ADDITIONS END: LOCAL STORAGE KEYS */

/* NEW CODE ADDITIONS START: PROGRESSIVE DIFFICULTY SPEED CONSTANTS */
export const INITIAL_SPEED = 24.0;
export const SPEED_ACCELERATION_PER_METER = 0.012; // Natural velocity gain per meter traveled
export const MAX_BASE_SPEED = 62.0; // Terminal cyber-velocity cap
/* NEW CODE ADDITIONS END: PROGRESSIVE DIFFICULTY SPEED CONSTANTS */

/* NEW CODE ADDITIONS START: DIMENSION TIER PRESETS (EVERY 2000 METERS) */
export const TIER_INTERVAL_METERS = 2000;

export const DIMENSION_TIERS: DimensionTierPreset[] = [
  {
    tier: 0,
    name: 'TIER I // CYBER VOID',
    subName: 'DEEP OBSIDIAN BOUNDARY',
    minDistance: 0,
    skyColor: 0x000000,
    fogColor: 0x05000a,
    fogDensity: 0.015,
    gridColorCenter: 0xff003c, // Cyber-Red
    gridColorGrid: 0xe056fd,   // Red-Violet
    ambientLightColor: 0xffffff,
    dirLightColor: 0xff003c,
    pillarColor1: 0xff003c,
    pillarColor2: 0xe056fd,
    accentHex: '#FF003C',
    secondaryHex: '#E056FD',
  },
  {
    tier: 1,
    name: 'TIER II // SYNTHWAVE HORIZON',
    subName: 'NEON INDIGO DRIFT',
    minDistance: 2000,
    skyColor: 0x0a0118,
    fogColor: 0x120326,
    fogDensity: 0.016,
    gridColorCenter: 0xff007f, // Hot Magenta
    gridColorGrid: 0x00f0ff,   // Neon Cyan
    ambientLightColor: 0xd9b3ff,
    dirLightColor: 0xff007f,
    pillarColor1: 0xff007f,
    pillarColor2: 0x00f0ff,
    accentHex: '#FF007F',
    secondaryHex: '#00F0FF',
  },
  {
    tier: 2,
    name: 'TIER III // MATRIX OVERCLOCK',
    subName: 'TOXIC SYNAPSE GRID',
    minDistance: 4000,
    skyColor: 0x011409,
    fogColor: 0x021f10,
    fogDensity: 0.017,
    gridColorCenter: 0x00ff66, // Acid Emerald
    gridColorGrid: 0x39ff14,   // Radioactive Lime
    ambientLightColor: 0xaaffcc,
    dirLightColor: 0x00ff66,
    pillarColor1: 0x00ff66,
    pillarColor2: 0x39ff14,
    accentHex: '#00FF66',
    secondaryHex: '#39FF14',
  },
  {
    tier: 3,
    name: 'TIER IV // SOLAR CRUCIBLE',
    subName: 'CRIMSON FLARE EXPANSE',
    minDistance: 6000,
    skyColor: 0x1a0300,
    fogColor: 0x240600,
    fogDensity: 0.018,
    gridColorCenter: 0xff2200, // Crimson Fire
    gridColorGrid: 0xffaa00,   // Molten Gold
    ambientLightColor: 0xffccaa,
    dirLightColor: 0xff2200,
    pillarColor1: 0xff2200,
    pillarColor2: 0xffaa00,
    accentHex: '#FF2200',
    secondaryHex: '#FFAA00',
  },
  {
    tier: 4,
    name: 'TIER V // SINGULARITY NEXUS',
    subName: 'HYPER-VOID EVENT HORIZON',
    minDistance: 8000,
    skyColor: 0x0d001a,
    fogColor: 0x140026,
    fogDensity: 0.019,
    gridColorCenter: 0xffffff, // Pure Plasma White
    gridColorGrid: 0xe056fd,   // Electric Violet
    ambientLightColor: 0xffffff,
    dirLightColor: 0xffffff,
    pillarColor1: 0xffffff,
    pillarColor2: 0xe056fd,
    accentHex: '#FFFFFF',
    secondaryHex: '#E056FD',
  },
];

export const getDimensionTierPreset = (distance: number): DimensionTierPreset => {
  const tierIndex = Math.min(
    DIMENSION_TIERS.length - 1,
    Math.max(0, Math.floor(distance / TIER_INTERVAL_METERS))
  );
  return DIMENSION_TIERS[tierIndex];
};
/* NEW CODE ADDITIONS END: DIMENSION TIER PRESETS (EVERY 2000 METERS) */

/* NEW CODE ADDITIONS START: TOP RUNNERS LEADERBOARD UTILITIES */
export const DEFAULT_TOP_RUNNERS: RunnerRecord[] = [
  { id: 'def-1', callsign: 'GHOST // VEX-77', distance: 6420, score: 185400, tierReached: 3, maxCombo: 34, timestamp: Date.now() - 86400000 * 3 },
  { id: 'def-2', callsign: 'KAI // CYBER-99', distance: 4890, score: 124300, tierReached: 2, maxCombo: 25, timestamp: Date.now() - 86400000 * 2 },
  { id: 'def-3', callsign: 'CIPHER // NYX-01', distance: 3750, score: 89400, tierReached: 1, maxCombo: 19, timestamp: Date.now() - 86400000 },
  { id: 'def-4', callsign: 'OPERATOR // ZERO', distance: 2420, score: 54600, tierReached: 1, maxCombo: 14, timestamp: Date.now() - 3600000 * 8 },
  { id: 'def-5', callsign: 'ROOKIE // BLADE', distance: 1680, score: 32900, tierReached: 0, maxCombo: 8, timestamp: Date.now() - 3600000 * 2 },
];

export const loadTopRunners = (): RunnerRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RUNNERS_HISTORY);
    if (!raw) return DEFAULT_TOP_RUNNERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 5);
    }
    return DEFAULT_TOP_RUNNERS;
  } catch {
    return DEFAULT_TOP_RUNNERS;
  }
};

export const saveRunToHistory = (
  callsign: string,
  distance: number,
  score: number,
  maxCombo: number
): RunnerRecord[] => {
  const history = loadTopRunners();
  const currentDist = Math.floor(distance);
  const tierReached = Math.min(DIMENSION_TIERS.length - 1, Math.floor(currentDist / TIER_INTERVAL_METERS));

  const newEntry: RunnerRecord = {
    id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    callsign: callsign.trim() || 'OPERATOR // 01',
    distance: currentDist,
    score: Math.floor(score),
    tierReached,
    maxCombo,
    timestamp: Date.now(),
  };

  const combined = [newEntry, ...history];
  // Sort primarily by distance descending, secondarily by score
  combined.sort((a, b) => b.distance !== a.distance ? b.distance - a.distance : b.score - a.score);
  const top5 = combined.slice(0, 5);

  try {
    localStorage.setItem(STORAGE_KEYS.RUNNERS_HISTORY, JSON.stringify(top5));
  } catch (err) {
    console.error('Failed to save runners history:', err);
  }

  return top5;
};
/* NEW CODE ADDITIONS END: TOP RUNNERS LEADERBOARD UTILITIES */

/* NEW CODE ADDITIONS START: COMBO MULTIPLIER CONSTANTS & UTILITY */
export const getComboMultiplier = (streak: number): number => {
  if (streak >= 30) return 8;
  if (streak >= 21) return 6;
  if (streak >= 15) return 5;
  if (streak >= 10) return 4;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
};

export const getComboRank = (streak: number): string => {
  if (streak >= 30) return 'SINGULARITY';
  if (streak >= 21) return 'VOID-ASCENT';
  if (streak >= 15) return 'CYBER-SYNC';
  if (streak >= 10) return 'OVERDRIVE';
  if (streak >= 6) return 'HYPER';
  if (streak >= 3) return 'SURGE';
  return 'STANDARD';
};
/* NEW CODE ADDITIONS END: COMBO MULTIPLIER CONSTANTS & UTILITY */

/* NEW CODE ADDITIONS START: DIMENSION BOOST CONSTANTS */
export const MAX_BOOST = 100;
export const BOOST_PER_ORB = 20; // 5 orbs to reach 100%
export const SHIFT_DURATION_SECONDS = 5.0; // 5 seconds intangible speed burst
export const SHIFT_SPEED_BONUS = 20.0;
/* NEW CODE ADDITIONS END: DIMENSION BOOST CONSTANTS */

/* NEW CODE ADDITIONS START: POWER-UP CONSTANTS */
export const POWER_UP_DURATION_SECONDS = 8.0;
export const COMBO_FREEZE_DURATION_SECONDS = 5.0;
/* NEW CODE ADDITIONS END: POWER-UP CONSTANTS */

interface GameState {
  score: number;
  distance: number;
  bestDistance: number;
  multiplier: number;
  speed: number;
  orbs: number;
  health: number;
  topScore: number;
  /* NEW CODE ADDITIONS START: COMBO MULTIPLIER STATE DEFINITIONS */
  combo: number;
  comboMultiplier: number;
  maxCombo: number;
  comboRank: string;
  comboLostAlert: boolean;
  /* NEW CODE ADDITIONS END: COMBO MULTIPLIER STATE DEFINITIONS */
  /* NEW CODE ADDITIONS START: DIMENSION BOOST STATE DEFINITIONS */
  dimensionBoost: number;
  isDimensionShiftActive: boolean;
  dimensionShiftTimer: number;
  /* NEW CODE ADDITIONS END: DIMENSION BOOST STATE DEFINITIONS */
  /* NEW CODE ADDITIONS START: ACTIVE POWER UP STATE DEFINITION */
  activePowerUp: ActivePowerUp | null;
  /* NEW CODE ADDITIONS END: ACTIVE POWER UP STATE DEFINITION */
  /* NEW CODE ADDITIONS START: DIMENSION TIER & LEADERBOARD STATE */
  currentTier: number;
  tierShiftAlert: { active: boolean; tier: number; name: string } | null;
  topRunners: RunnerRecord[];
  playerCallsign: string;
  setPlayerCallsign: (callsign: string) => void;
  dismissTierShiftAlert: () => void;
  /* NEW CODE ADDITIONS END: DIMENSION TIER & LEADERBOARD STATE */
  /* NEW CODE ADDITIONS START: DAILY MISSION STATE DEFINITIONS */
  dailyMission: DailyMission;
  isMissionDrawerOpen: boolean;
  missionAlert: MissionAlert | null;
  dimensionShiftsInRun: number;
  toggleMissionDrawer: (force?: boolean) => void;
  dismissMissionAlert: () => void;
  checkAndAwardMission: (type: MissionType, currentVal: number) => void;
  /* NEW CODE ADDITIONS END: DAILY MISSION STATE DEFINITIONS */
  isGameOver: boolean;
  isStarted: boolean;
  playerLane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  obstacles: any[];
  collectibles: any[];

  startGame: () => void;
  resetGame: () => void;
  setGameOver: () => void;
  moveLane: (dir: 'LEFT' | 'RIGHT') => void;
  setJumping: (jumping: boolean) => void;
  setSliding: (sliding: boolean) => void;
  addScore: (pts: number) => void;
  collectOrb: () => void;
  /* NEW CODE ADDITIONS START: POWER UP COLLECT ACTION */
  collectPowerUp: (type: PowerUpType) => void;
  /* NEW CODE ADDITIONS END: POWER UP COLLECT ACTION */
  /* NEW CODE ADDITIONS START: MISS ORB COMBO ACTION */
  missOrb: () => void;
  /* NEW CODE ADDITIONS END: MISS ORB COMBO ACTION */
  takeDamage: (amount: number) => void;
  /* NEW CODE ADDITIONS START: SET SPEED & TRIGGER DIMENSION SHIFT ACTION */
  setSpeed: (speed: number) => void;
  triggerDimensionShift: () => boolean;
  phaseThroughObstacle: () => void;
  /* NEW CODE ADDITIONS END: SET SPEED & TRIGGER DIMENSION SHIFT ACTION */
  updateTick: (delta: number) => void;
}

const INITIAL_HEALTH = 100;

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  distance: 0,
  /* NEW CODE ADDITIONS START: BEST DISTANCE LOCAL STORAGE INITIALIZATION */
  bestDistance: parseFloat(localStorage.getItem(STORAGE_KEYS.BEST_DISTANCE) || '0'),
  /* NEW CODE ADDITIONS END: BEST DISTANCE LOCAL STORAGE INITIALIZATION */
  multiplier: 1,
  speed: INITIAL_SPEED,
  orbs: 0,
  health: INITIAL_HEALTH,
  topScore: parseInt(localStorage.getItem(STORAGE_KEYS.TOP_SCORE) || '0', 10),
  /* NEW CODE ADDITIONS START: COMBO MULTIPLIER INITIAL STATE */
  combo: 0,
  comboMultiplier: 1,
  maxCombo: 0,
  comboRank: 'STANDARD',
  comboLostAlert: false,
  /* NEW CODE ADDITIONS END: COMBO MULTIPLIER INITIAL STATE */
  /* NEW CODE ADDITIONS START: DIMENSION BOOST INITIAL STATE */
  dimensionBoost: 0,
  isDimensionShiftActive: false,
  dimensionShiftTimer: 0,
  /* NEW CODE ADDITIONS END: DIMENSION BOOST INITIAL STATE */
  /* NEW CODE ADDITIONS START: ACTIVE POWER UP INITIAL STATE */
  activePowerUp: null,
  /* NEW CODE ADDITIONS END: ACTIVE POWER UP INITIAL STATE */
  /* NEW CODE ADDITIONS START: DIMENSION TIER & LEADERBOARD INITIAL STATE */
  currentTier: 0,
  tierShiftAlert: null,
  topRunners: loadTopRunners(),
  playerCallsign: localStorage.getItem(STORAGE_KEYS.PLAYER_CALLSIGN) || 'OPERATOR // 01',
  setPlayerCallsign: (callsign: string) => {
    localStorage.setItem(STORAGE_KEYS.PLAYER_CALLSIGN, callsign);
    set({ playerCallsign: callsign });
  },
  dismissTierShiftAlert: () => set({ tierShiftAlert: null }),
  /* NEW CODE ADDITIONS END: DIMENSION TIER & LEADERBOARD INITIAL STATE */
  /* NEW CODE ADDITIONS START: DAILY MISSION INITIAL STATE */
  dailyMission: loadOrGenerateDailyMission(),
  isMissionDrawerOpen: false,
  missionAlert: null,
  dimensionShiftsInRun: 0,
  toggleMissionDrawer: (force?: boolean) => {
    set((s) => ({ isMissionDrawerOpen: force !== undefined ? force : !s.isMissionDrawerOpen }));
  },
  dismissMissionAlert: () => set({ missionAlert: null }),
  checkAndAwardMission: (type: MissionType, currentVal: number) => {
    const state = get();
    const mission = state.dailyMission;
    if (mission.type !== type || mission.completed) return;

    const progress = Math.min(mission.targetValue, Math.max(mission.currentProgress, currentVal));
    if (progress >= mission.targetValue) {
      const updatedMission: DailyMission = {
        ...mission,
        currentProgress: mission.targetValue,
        completed: true,
        rewardClaimed: true,
      };
      saveDailyMission(updatedMission);
      audioSynth.playMissionComplete();

      const newScore = state.score + mission.rewardPoints;
      const nextTop = Math.max(state.topScore, newScore);
      localStorage.setItem(STORAGE_KEYS.TOP_SCORE, nextTop.toString());

      set({
        dailyMission: updatedMission,
        score: newScore,
        topScore: nextTop,
        missionAlert: {
          active: true,
          rewardPoints: mission.rewardPoints,
          title: mission.title,
        },
      });
    } else if (progress > mission.currentProgress) {
      const updatedMission: DailyMission = {
        ...mission,
        currentProgress: progress,
      };
      saveDailyMission(updatedMission);
      set({ dailyMission: updatedMission });
    }
  },
  /* NEW CODE ADDITIONS END: DAILY MISSION INITIAL STATE */
  isGameOver: false,
  isStarted: false,
  playerLane: 0,
  isJumping: false,
  isSliding: false,
  obstacles: [],
  collectibles: [],

  startGame: () => {
    /* NEW CODE ADDITIONS START: AUDIO SYNTH TIER BASSLINE INITIALIZATION */
    audioSynth.setDimensionTier(0);
    audioSynth.startMusic(0);
    /* NEW CODE ADDITIONS END: AUDIO SYNTH TIER BASSLINE INITIALIZATION */
    /* NEW CODE ADDITIONS START: LOAD AND SYNC DAILY MISSION RUN PROGRESS */
    const currentMission = loadOrGenerateDailyMission();
    const activeMission: DailyMission = currentMission.completed
      ? currentMission
      : { ...currentMission, currentProgress: 0 };
    /* NEW CODE ADDITIONS END: LOAD AND SYNC DAILY MISSION RUN PROGRESS */
    set({
      isStarted: true,
      isGameOver: false,
      speed: INITIAL_SPEED,
      distance: 0,
      score: 0,
      multiplier: 1,
      orbs: 0,
      /* NEW CODE ADDITIONS START: RESET COMBO ON START */
      combo: 0,
      comboMultiplier: 1,
      maxCombo: 0,
      comboRank: 'STANDARD',
      comboLostAlert: false,
      /* NEW CODE ADDITIONS END: RESET COMBO ON START */
      dimensionBoost: 0,
      isDimensionShiftActive: false,
      dimensionShiftTimer: 0,
      /* NEW CODE ADDITIONS START: RESET POWER UP ON START */
      activePowerUp: null,
      /* NEW CODE ADDITIONS END: RESET POWER UP ON START */
      /* NEW CODE ADDITIONS START: RESET TIER STATE ON START */
      currentTier: 0,
      tierShiftAlert: null,
      topRunners: loadTopRunners(),
      /* NEW CODE ADDITIONS END: RESET TIER STATE ON START */
      /* NEW CODE ADDITIONS START: SYNC DAILY MISSION ON START */
      dailyMission: activeMission,
      missionAlert: null,
      dimensionShiftsInRun: 0,
      /* NEW CODE ADDITIONS END: SYNC DAILY MISSION ON START */
    });
  },

  resetGame: () => {
    /* NEW CODE ADDITIONS START: AUDIO SYNTH TIER BASSLINE REBOOT */
    audioSynth.setDimensionTier(0);
    audioSynth.startMusic(0);
    /* NEW CODE ADDITIONS END: AUDIO SYNTH TIER BASSLINE REBOOT */
    /* NEW CODE ADDITIONS START: LOAD AND SYNC DAILY MISSION RUN PROGRESS ON REBOOT */
    const currentMission = loadOrGenerateDailyMission();
    const activeMission: DailyMission = currentMission.completed
      ? currentMission
      : { ...currentMission, currentProgress: 0 };
    /* NEW CODE ADDITIONS END: LOAD AND SYNC DAILY MISSION RUN PROGRESS ON REBOOT */
    set({
      score: 0,
      distance: 0,
      multiplier: 1,
      speed: INITIAL_SPEED,
      orbs: 0,
      health: INITIAL_HEALTH,
      /* NEW CODE ADDITIONS START: RESET COMBO ON REBOOT */
      combo: 0,
      comboMultiplier: 1,
      maxCombo: 0,
      comboRank: 'STANDARD',
      comboLostAlert: false,
      /* NEW CODE ADDITIONS END: RESET COMBO ON REBOOT */
      /* NEW CODE ADDITIONS START: RESET BOOST STATE */
      dimensionBoost: 0,
      isDimensionShiftActive: false,
      dimensionShiftTimer: 0,
      /* NEW CODE ADDITIONS END: RESET BOOST STATE */
      /* NEW CODE ADDITIONS START: RESET POWER UP ON REBOOT */
      activePowerUp: null,
      /* NEW CODE ADDITIONS END: RESET POWER UP ON REBOOT */
      /* NEW CODE ADDITIONS START: RESET TIER ON REBOOT */
      currentTier: 0,
      tierShiftAlert: null,
      topRunners: loadTopRunners(),
      /* NEW CODE ADDITIONS END: RESET TIER ON REBOOT */
      /* NEW CODE ADDITIONS START: SYNC DAILY MISSION ON REBOOT */
      dailyMission: activeMission,
      missionAlert: null,
      dimensionShiftsInRun: 0,
      /* NEW CODE ADDITIONS END: SYNC DAILY MISSION ON REBOOT */
      isGameOver: false,
      isStarted: true,
      playerLane: 0,
      isJumping: false,
      isSliding: false,
    });
  },

  setGameOver: () => {
    audioSynth.stopMusic();
    audioSynth.playGameOverSound();
    const currentScore = get().score;
    const currentTop = get().topScore;
    const nextTop = Math.max(currentTop, currentScore);
    localStorage.setItem(STORAGE_KEYS.TOP_SCORE, nextTop.toString());

    /* NEW CODE ADDITIONS START: SAVE BEST DISTANCE ON GAME OVER */
    const currentDist = Math.floor(get().distance);
    const currentBestDist = get().bestDistance;
    const nextBestDist = Math.max(currentBestDist, currentDist);
    localStorage.setItem(STORAGE_KEYS.BEST_DISTANCE, nextBestDist.toString());
    /* NEW CODE ADDITIONS END: SAVE BEST DISTANCE ON GAME OVER */

    /* NEW CODE ADDITIONS START: SAVE RUN TO TOP RUNNERS HISTORY ON GAME OVER */
    const updatedHistory = saveRunToHistory(
      get().playerCallsign,
      get().distance,
      get().score,
      get().maxCombo
    );
    /* NEW CODE ADDITIONS END: SAVE RUN TO TOP RUNNERS HISTORY ON GAME OVER */

    set({
      isGameOver: true,
      topScore: nextTop,
      bestDistance: nextBestDist,
      topRunners: updatedHistory,
      isDimensionShiftActive: false,
      dimensionShiftTimer: 0,
      comboLostAlert: false,
      /* NEW CODE ADDITIONS START: RESET POWER UP ON GAME OVER */
      activePowerUp: null,
      /* NEW CODE ADDITIONS END: RESET POWER UP ON GAME OVER */
    });
  },

  moveLane: (dir) =>
    set((state) => {
      if (state.isGameOver || !state.isStarted) return state;
      let nextLane: Lane = state.playerLane;
      if (dir === 'LEFT' && state.playerLane > -1) {
        nextLane = (state.playerLane - 1) as Lane;
      } else if (dir === 'RIGHT' && state.playerLane < 1) {
        nextLane = (state.playerLane + 1) as Lane;
      }
      return { playerLane: nextLane };
    }),

  setJumping: (jumping) => set({ isJumping: jumping }),
  setSliding: (sliding) => set({ isSliding: sliding }),

  addScore: (pts) =>
    set((state) => {
      const doubleScoreFactor = state.activePowerUp?.type === 'DOUBLE_SCORE' ? 2 : 1;
      return { score: state.score + pts * state.comboMultiplier * doubleScoreFactor };
    }),

  /* NEW CODE ADDITIONS START: POWER UP COLLECT IMPLEMENTATION */
  collectPowerUp: (type: PowerUpType) => {
    const state = get();
    if (!state.isStarted || state.isGameOver) return;

    if (type === 'COMBO_FREEZE') {
      audioSynth.playComboFreezeCollect();
    } else {
      audioSynth.playPowerUpCollect();
    }

    const duration = type === 'COMBO_FREEZE' ? COMBO_FREEZE_DURATION_SECONDS : POWER_UP_DURATION_SECONDS;
    const doubleScoreFactor = type === 'DOUBLE_SCORE' || state.activePowerUp?.type === 'DOUBLE_SCORE' ? 2 : 1;
    const bonusPts = 250 * state.comboMultiplier * doubleScoreFactor;

    set({
      activePowerUp: {
        type,
        duration,
        maxDuration: duration,
      },
      score: state.score + bonusPts,
    });
  },
  /* NEW CODE ADDITIONS END: POWER UP COLLECT IMPLEMENTATION */

  /* NEW CODE ADDITIONS START: COMBO MULTIPLIER ORB COLLECTION & MISS HANDLERS */
  collectOrb: () => {
    set((state) => {
      const nextCombo = state.combo + 1;
      const nextMultiplier = getComboMultiplier(nextCombo);
      const nextRank = getComboRank(nextCombo);
      const nextMaxCombo = Math.max(state.maxCombo, nextCombo);

      // Play escalating combo chime
      audioSynth.playComboUp(nextCombo);

      const nextBoost = state.isDimensionShiftActive
        ? state.dimensionBoost
        : Math.min(MAX_BOOST, state.dimensionBoost + BOOST_PER_ORB);

      // Score bonus: base 50 points * combo multiplier + streak bonus (doubled if DOUBLE_SCORE powerup active)
      const doubleScoreFactor = state.activePowerUp?.type === 'DOUBLE_SCORE' ? 2 : 1;
      const orbScorePoints = (50 * nextMultiplier + nextCombo * 10) * doubleScoreFactor;

      return {
        orbs: state.orbs + 1,
        combo: nextCombo,
        comboMultiplier: nextMultiplier,
        multiplier: nextMultiplier,
        maxCombo: nextMaxCombo,
        comboRank: nextRank,
        comboLostAlert: false,
        score: state.score + orbScorePoints,
        health: Math.min(INITIAL_HEALTH, state.health + 5),
        dimensionBoost: nextBoost,
      };
    });
    /* NEW CODE ADDITIONS START: MISSION TRACKING ON ORB */
    const currentOrbs = get().orbs;
    const currentMaxCombo = get().maxCombo;
    get().checkAndAwardMission('ORBS_SINGLE_RUN', currentOrbs);
    get().checkAndAwardMission('COMBO_STREAK', currentMaxCombo);
    /* NEW CODE ADDITIONS END: MISSION TRACKING ON ORB */
  },

  missOrb: () => {
    set((state) => {
      if (state.combo === 0) return state;

      /* NEW CODE ADDITIONS START: COMBO FREEZE PROTECTION ON MISSED ORB */
      // When Combo Freeze is active, prevent the player's combo multiplier from resetting for 5 seconds!
      if (state.activePowerUp?.type === 'COMBO_FREEZE') {
        audioSynth.playComboFreezeProtect();
        return state;
      }
      /* NEW CODE ADDITIONS END: COMBO FREEZE PROTECTION ON MISSED ORB */

      // Missed consecutive orb: break combo streak
      audioSynth.playComboBreak();
      return {
        combo: 0,
        comboMultiplier: 1,
        multiplier: 1,
        comboRank: 'STANDARD',
        comboLostAlert: true,
      };
    });
  },
  /* NEW CODE ADDITIONS END: COMBO MULTIPLIER ORB COLLECTION & MISS HANDLERS */

  /* NEW CODE ADDITIONS START: TRIGGER DIMENSION SHIFT & SET SPEED IMPLEMENTATION */
  setSpeed: (speed) => set({ speed }),

  triggerDimensionShift: () => {
    const state = get();
    if (!state.isStarted || state.isGameOver) return false;
    if (state.dimensionBoost < MAX_BOOST || state.isDimensionShiftActive) return false;

    audioSynth.playDimensionShift();

    const nextShifts = state.dimensionShiftsInRun + 1;
    set({
      isDimensionShiftActive: true,
      dimensionShiftTimer: SHIFT_DURATION_SECONDS,
      dimensionBoost: MAX_BOOST,
      dimensionShiftsInRun: nextShifts,
    });
    /* NEW CODE ADDITIONS START: MISSION TRACKING ON SHIFT */
    get().checkAndAwardMission('DIMENSION_SHIFTS', nextShifts);
    /* NEW CODE ADDITIONS END: MISSION TRACKING ON SHIFT */
    return true;
  },

  phaseThroughObstacle: () => {
    const state = get();
    if (!state.isDimensionShiftActive && state.activePowerUp?.type !== 'SHIELD') return;
    audioSynth.playPhaseThrough();
    const doubleScoreFactor = state.activePowerUp?.type === 'DOUBLE_SCORE' ? 2 : 1;
    set((s) => ({
      score: s.score + 150 * s.comboMultiplier * doubleScoreFactor,
    }));
  },
  /* NEW CODE ADDITIONS END: TRIGGER DIMENSION SHIFT & SET SPEED IMPLEMENTATION */

  takeDamage: (amount) => {
    set((state) => {
      /* NEW CODE ADDITIONS START: IMMUNITY / INTANGIBILITY DURING SHIFT OR SHIELD */
      if (state.isDimensionShiftActive) {
        return state;
      }
      if (state.activePowerUp?.type === 'SHIELD') {
        audioSynth.playShieldDeflect();
        return state;
      }
      /* NEW CODE ADDITIONS END: IMMUNITY / INTANGIBILITY DURING SHIFT OR SHIELD */

      /* NEW CODE ADDITIONS START: BREAK COMBO ON DAMAGE (PROTECTED IF COMBO FREEZE IS ACTIVE) */
      const isComboFreeze = state.activePowerUp?.type === 'COMBO_FREEZE';
      if (state.combo > 0) {
        if (isComboFreeze) {
          audioSynth.playComboFreezeProtect();
        } else {
          audioSynth.playComboBreak();
        }
      }
      /* NEW CODE ADDITIONS END: BREAK COMBO ON DAMAGE (PROTECTED IF COMBO FREEZE IS ACTIVE) */

      const nextHp = Math.max(0, state.health - amount);
      const gameOver = nextHp <= 0;
      if (gameOver) {
        audioSynth.stopMusic();
        audioSynth.playGameOverSound();
        const nextTop = Math.max(state.topScore, state.score);
        localStorage.setItem(STORAGE_KEYS.TOP_SCORE, nextTop.toString());

        /* NEW CODE ADDITIONS START: SAVE BEST DISTANCE ON LETHAL DAMAGE */
        const currentDist = Math.floor(state.distance);
        const nextBestDist = Math.max(state.bestDistance, currentDist);
        localStorage.setItem(STORAGE_KEYS.BEST_DISTANCE, nextBestDist.toString());
        /* NEW CODE ADDITIONS END: SAVE BEST DISTANCE ON LETHAL DAMAGE */

        /* NEW CODE ADDITIONS START: SAVE RUN TO TOP RUNNERS ON LETHAL DAMAGE */
        const updatedHistory = saveRunToHistory(
          state.playerCallsign,
          state.distance,
          state.score,
          state.maxCombo
        );
        /* NEW CODE ADDITIONS END: SAVE RUN TO TOP RUNNERS ON LETHAL DAMAGE */

        return {
          health: 0,
          isGameOver: true,
          topScore: nextTop,
          bestDistance: nextBestDist,
          topRunners: updatedHistory,
          isDimensionShiftActive: false,
          dimensionShiftTimer: 0,
          activePowerUp: null,
          combo: 0,
          comboMultiplier: 1,
          multiplier: 1,
          comboRank: 'STANDARD',
          comboLostAlert: false,
        };
      }
      return {
        health: nextHp,
        combo: isComboFreeze ? state.combo : 0,
        comboMultiplier: isComboFreeze ? state.comboMultiplier : 1,
        multiplier: isComboFreeze ? state.multiplier : 1,
        comboRank: isComboFreeze ? state.comboRank : 'STANDARD',
        comboLostAlert: isComboFreeze ? false : true,
      };
    });
  },

  updateTick: (delta) => {
    const state = get();
    if (!state.isStarted || state.isGameOver) return;

    /* NEW CODE ADDITIONS START: POWER UP TIMER TICK */
    let nextPowerUp = state.activePowerUp;
    if (nextPowerUp) {
      const nextDuration = nextPowerUp.duration - delta;
      if (nextDuration <= 0) {
        audioSynth.playPowerUpExpire();
        nextPowerUp = null;
      } else {
        nextPowerUp = {
          ...nextPowerUp,
          duration: nextDuration,
        };
      }
    }
    /* NEW CODE ADDITIONS END: POWER UP TIMER TICK */

    /* NEW CODE ADDITIONS START: DIMENSION SHIFT TICK AND NATURAL SPEED PROGRESSION */
    let nextShiftActive = state.isDimensionShiftActive;
    let nextShiftTimer = state.dimensionShiftTimer;
    let nextBoost = state.dimensionBoost;

    if (nextShiftActive) {
      nextShiftTimer = Math.max(0, nextShiftTimer - delta);
      nextBoost = (nextShiftTimer / SHIFT_DURATION_SECONDS) * MAX_BOOST;
      if (nextShiftTimer <= 0) {
        nextShiftActive = false;
        nextBoost = 0;
      }
    }

    // Natural difficulty progression: Smooth continuous velocity curve as distance increases
    const distanceGain = state.distance * SPEED_ACCELERATION_PER_METER;
    const curveBonus = Math.sqrt(Math.max(0, state.distance)) * 0.15;
    const baseProgressiveSpeed = Math.min(MAX_BASE_SPEED, INITIAL_SPEED + distanceGain + curveBonus);
    const currentSpeed = nextShiftActive ? baseProgressiveSpeed + SHIFT_SPEED_BONUS : baseProgressiveSpeed;
    const nextDist = state.distance + currentSpeed * delta;
    
    // Distance tick score with combo multiplier bonus (doubled if DOUBLE_SCORE powerup active)
    const doubleScoreFactor = state.activePowerUp?.type === 'DOUBLE_SCORE' ? 2 : 1;
    const distanceScoreDelta = Math.floor(currentSpeed * delta * 10 * state.comboMultiplier * doubleScoreFactor);
    const nextScore = state.score + Math.max(1, distanceScoreDelta);

    /* NEW CODE ADDITIONS START: DIMENSION TIER PROGRESSION (EVERY 2000 METERS) */
    const prevTier = Math.min(DIMENSION_TIERS.length - 1, Math.floor(state.distance / TIER_INTERVAL_METERS));
    const nextTier = Math.min(DIMENSION_TIERS.length - 1, Math.floor(nextDist / TIER_INTERVAL_METERS));
    let nextTierAlert = state.tierShiftAlert;

    if (nextTier > prevTier) {
      audioSynth.playDimensionTierUp();
      audioSynth.setDimensionTier(nextTier);
      const preset = DIMENSION_TIERS[nextTier];
      nextTierAlert = {
        active: true,
        tier: nextTier,
        name: preset.name,
      };
    }
    /* NEW CODE ADDITIONS END: DIMENSION TIER PROGRESSION (EVERY 2000 METERS) */

    set({
      distance: nextDist,
      speed: currentSpeed,
      score: nextScore,
      currentTier: nextTier,
      tierShiftAlert: nextTierAlert,
      isDimensionShiftActive: nextShiftActive,
      dimensionShiftTimer: nextShiftTimer,
      dimensionBoost: nextBoost,
      activePowerUp: nextPowerUp,
    });
    /* NEW CODE ADDITIONS START: MISSION TRACKING ON DISTANCE TICK */
    get().checkAndAwardMission('DISTANCE_SINGLE_RUN', Math.floor(nextDist));
    /* NEW CODE ADDITIONS END: MISSION TRACKING ON DISTANCE TICK */
    /* NEW CODE ADDITIONS END: DIMENSION SHIFT TICK AND NATURAL SPEED PROGRESSION */
  },
}));