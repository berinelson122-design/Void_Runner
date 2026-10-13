import { create } from 'zustand';
import { CommandNode, DeviceType } from '../types';

// --- CONTROL SETTINGS START ---
export interface ControlBinding {
  pc: string;
  mobile: string;
  console: string;
}

export const DEFAULT_BINDINGS: Record<CommandNode, ControlBinding> = {
  UP: { pc: 'KeyW / ArrowUp', mobile: 'Swipe Up / Tap Jump', console: 'Left Stick Up / D-Pad Up / Button A' },
  DOWN: { pc: 'KeyS / ArrowDown', mobile: 'Swipe Down / Tap Slide', console: 'Left Stick Down / D-Pad Down / Button B' },
  LEFT: { pc: 'KeyA / ArrowLeft', mobile: 'Swipe Left / Joy Left', console: 'Left Stick Left / D-Pad Left' },
  RIGHT: { pc: 'KeyD / ArrowRight', mobile: 'Swipe Right / Joy Right', console: 'Left Stick Right / D-Pad Right' },
  ACTION: { pc: 'Space', mobile: 'Tap Action', console: 'Button X / Right Trigger' },
  BOMB: { pc: 'KeyE', mobile: 'Tap Bomb', console: 'Button Y / Left Trigger' },
  FOCUS: { pc: 'ShiftLeft', mobile: 'Hold Focus', console: 'Left Shoulder LB' },
  /* NEW CODE ADDITIONS START: SHIFT COMMAND BINDINGS */
  SHIFT: { pc: 'Shift / KeyF / Space', mobile: 'Tap Shift Button', console: 'Left Shoulder LB / Button X' },
  /* NEW CODE ADDITIONS END: SHIFT COMMAND BINDINGS */
};
// --- CONTROL SETTINGS END ---

interface InputState {
  commands: Record<CommandNode, boolean>;
  deviceType: DeviceType;
  bindings: Record<CommandNode, ControlBinding>;
  sensitivity: number;
  vibration: boolean;
  setDevice: (type: DeviceType) => void;
  setCommand: (cmd: CommandNode, active: boolean) => void;
  triggerCommand: (cmd: CommandNode) => void;
  updateBinding: (cmd: CommandNode, device: DeviceType, val: string) => void;
  setSensitivity: (val: number) => void;
  toggleVibration: () => void;
}

const defaultCommands: Record<CommandNode, boolean> = {
  UP: false,
  DOWN: false,
  LEFT: false,
  RIGHT: false,
  ACTION: false,
  BOMB: false,
  FOCUS: false,
  /* NEW CODE ADDITIONS START: DEFAULT SHIFT COMMAND STATE */
  SHIFT: false,
  /* NEW CODE ADDITIONS END: DEFAULT SHIFT COMMAND STATE */
};

export const useInputStore = create<InputState>((set) => ({
  commands: { ...defaultCommands },
  deviceType: 'PC',
  bindings: { ...DEFAULT_BINDINGS },
  sensitivity: 1.0,
  vibration: true,

  setDevice: (deviceType) => set({ deviceType }),
  setCommand: (cmd, active) =>
    set((state) => ({ commands: { ...state.commands, [cmd]: active } })),
  triggerCommand: (cmd) => {
    set((state) => ({ commands: { ...state.commands, [cmd]: true } }));
    setTimeout(() => {
      set((state) => ({ commands: { ...state.commands, [cmd]: false } }));
    }, 120);
  },

  // --- CONTROL SETTINGS START ---
  updateBinding: (cmd, device, val) =>
    set((state) => ({
      bindings: {
        ...state.bindings,
        [cmd]: {
          ...state.bindings[cmd],
          [device.toLowerCase()]: val,
        },
      },
    })),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  toggleVibration: () => set((state) => ({ vibration: !state.vibration })),
  // --- CONTROL SETTINGS END ---
}));