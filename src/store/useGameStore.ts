import { create } from 'zustand';
import { Lane } from '../types';
import { AudioSynth as audioSynth } from '../services/AudioSynth';

interface GameState {
  score: number;
  distance: number;
  multiplier: number;
  speed: number;
  orbs: number;
  health: number;
  topScore: number;
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
  takeDamage: (amount: number) => void;
  updateTick: (delta: number) => void;
}

const initialSpeed = 24.0;
const INITIAL_HEALTH = 100;

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  distance: 0,
  multiplier: 1,
  speed: initialSpeed,
  orbs: 0,
  health: INITIAL_HEALTH,
  topScore: parseInt(localStorage.getItem('VOID_RUNNER_TOPSCORE') || '0', 10),
  isGameOver: false,
  isStarted: false,
  playerLane: 0,
  isJumping: false,
  isSliding: false,
  obstacles: [],
  collectibles: [],

  startGame: () => {
    audioSynth.startMusic();
    set({ isStarted: true, isGameOver: false });
  },

  resetGame: () => {
    audioSynth.startMusic();
    set({
      score: 0,
      distance: 0,
      multiplier: 1,
      speed: initialSpeed,
      orbs: 0,
      health: INITIAL_HEALTH,
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
    localStorage.setItem('VOID_RUNNER_TOPSCORE', nextTop.toString());

    set({ isGameOver: true, topScore: nextTop });
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
    set((state) => ({ score: state.score + pts * state.multiplier })),

  collectOrb: () => {
    set((state) => ({
      orbs: state.orbs + 1,
      score: state.score + 50 * state.multiplier,
      health: Math.min(INITIAL_HEALTH, state.health + 5),
    }));
  },

  takeDamage: (amount) => {
    set((state) => {
      const nextHp = Math.max(0, state.health - amount);
      const gameOver = nextHp <= 0;
      if (gameOver) {
        audioSynth.stopMusic();
        audioSynth.playGameOverSound();
        const nextTop = Math.max(state.topScore, state.score);
        localStorage.setItem('VOID_RUNNER_TOPSCORE', nextTop.toString());
        return { health: 0, isGameOver: true, topScore: nextTop };
      }
      return { health: nextHp };
    });
  },

  updateTick: (delta) => {
    const state = get();
    if (!state.isStarted || state.isGameOver) return;

    // Track Distance and Dynamic Speed Scaling
    const nextDist = state.distance + state.speed * delta;
    const nextSpeed = initialSpeed + Math.floor(nextDist / 100) * 1.5;
    const nextScore = Math.floor(nextDist * 10) + state.orbs * 50;

    set({
      distance: nextDist,
      speed: nextSpeed,
      score: nextScore,
    });
  },
}));