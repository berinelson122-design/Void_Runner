export type DeviceType = 'PC' | 'MOBILE' | 'CONSOLE';

/* NEW CODE ADDITIONS START: COMMAND NODE EXPANSION */
export type CommandNode = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ACTION' | 'BOMB' | 'FOCUS' | 'SHIFT';
/* NEW CODE ADDITIONS END: COMMAND NODE EXPANSION */

export type Lane = -1 | 0 | 1;

export type ObstacleType =
  | 'BARRIER-LOW'
  | 'BARRIER-HIGH'
  | 'PILLAR'
  | 'GAP'
  | 'BARRIER'
  | 'WALL'
  | 'LOW_BEAM'
  | 'CYBER_GATE';

/* NEW CODE ADDITIONS START: POWER-UP COLLECTIBLE TYPES */
export type PowerUpType = 'SHIELD' | 'DOUBLE_SCORE' | 'COMBO_FREEZE';

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;
  maxDuration: number;
}
/* NEW CODE ADDITIONS END: POWER-UP COLLECTIBLE TYPES */

export type CollectibleType = 'ORB' | 'HEALTH' | 'POWER_UP';

export interface Obstacle {
  id: string;
  lane: Lane;
  z: number;
  type: ObstacleType;
  passed: boolean;
  height: number;
}

export interface Collectible {
  id: string;
  lane: Lane;
  z: number;
  y: number;
  type: CollectibleType;
  /* NEW CODE ADDITIONS START: POWER-UP COLLECTIBLE FIELD */
  powerUpType?: PowerUpType;
  /* NEW CODE ADDITIONS END: POWER-UP COLLECTIBLE FIELD */
  collected: boolean;
}

export interface GameStats {
  score: number;
  distance: number;
  bestDistance: number;
  multiplier: number;
  speed: number;
  orbs: number;
  health: number;
  /* NEW CODE ADDITIONS START: DIMENSION BOOST STATS */
  dimensionBoost: number;
  isDimensionShiftActive: boolean;
  dimensionShiftDuration: number;
  /* NEW CODE ADDITIONS END: DIMENSION BOOST STATS */
  /* NEW CODE ADDITIONS START: COMBO MULTIPLIER SYSTEM STATS */
  combo: number;
  comboMultiplier: number;
  maxCombo: number;
  comboRank: string;
  /* NEW CODE ADDITIONS END: COMBO MULTIPLIER SYSTEM STATS */
  /* NEW CODE ADDITIONS START: ACTIVE POWER UP STATS */
  activePowerUp: ActivePowerUp | null;
  /* NEW CODE ADDITIONS END: ACTIVE POWER UP STATS */
  /* NEW CODE ADDITIONS START: DIMENSION TIER SYSTEM STATS */
  currentTier: number;
  /* NEW CODE ADDITIONS END: DIMENSION TIER SYSTEM STATS */
  isGameOver: boolean;
  isStarted: boolean;
}

/* NEW CODE ADDITIONS START: DIMENSION TIER PRESET INTERFACE */
export interface DimensionTierPreset {
  tier: number;
  name: string;
  subName: string;
  minDistance: number;
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  gridColorCenter: number;
  gridColorGrid: number;
  ambientLightColor: number;
  dirLightColor: number;
  pillarColor1: number;
  pillarColor2: number;
  accentHex: string;
  secondaryHex: string;
}
/* NEW CODE ADDITIONS END: DIMENSION TIER PRESET INTERFACE */

/* NEW CODE ADDITIONS START: TOP RUNNERS LEADERBOARD INTERFACE */
export interface RunnerRecord {
  id: string;
  callsign: string;
  distance: number;
  score: number;
  tierReached: number;
  maxCombo: number;
  timestamp: number;
}
/* NEW CODE ADDITIONS END: TOP RUNNERS LEADERBOARD INTERFACE */

/* NEW CODE ADDITIONS START: DAILY MISSION SYSTEM TYPES */
export type MissionType =
  | 'ORBS_SINGLE_RUN'
  | 'DISTANCE_SINGLE_RUN'
  | 'COMBO_STREAK'
  | 'DIMENSION_SHIFTS';

export interface DailyMission {
  id: string;
  dateKey: string;
  type: MissionType;
  title: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  completed: boolean;
  rewardPoints: number;
  rewardClaimed: boolean;
}

export interface MissionAlert {
  active: boolean;
  rewardPoints: number;
  title: string;
}
/* NEW CODE ADDITIONS END: DAILY MISSION SYSTEM TYPES */