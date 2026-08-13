export type DeviceType = 'PC' | 'MOBILE' | 'CONSOLE';

export type CommandNode = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ACTION' | 'BOMB' | 'FOCUS';

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

export type CollectibleType = 'ORB' | 'HEALTH';

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
  collected: boolean;
}

export interface GameStats {
  score: number;
  distance: number;
  multiplier: number;
  speed: number;
  orbs: number;
  health: number;
  isGameOver: boolean;
  isStarted: boolean;
}