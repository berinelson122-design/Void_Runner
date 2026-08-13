import { useEffect } from 'react';
import { useInputStore } from '../store/useInputStore';
import { useGameStore } from '../store/useGameStore';
import { CommandNode } from '../types';

export const useUniversalInput = () => {
  const { setCommand, setDevice, triggerCommand } = useInputStore();
  const { moveLane, setJumping, setSliding, isJumping, isSliding } = useGameStore();

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let gamepadAnimationId: number;

    // --- CONTROL SETTINGS START ---
    // Keyboard Event Handlers (PC Input)
    const handleKeyDown = (e: KeyboardEvent) => {
      setDevice('PC');
      const keyMap: Record<string, CommandNode> = {
        ArrowUp: 'UP',
        KeyW: 'UP',
        ArrowDown: 'DOWN',
        KeyS: 'DOWN',
        ArrowLeft: 'LEFT',
        KeyA: 'LEFT',
        ArrowRight: 'RIGHT',
        KeyD: 'RIGHT',
        Space: 'ACTION',
        ShiftLeft: 'FOCUS',
        KeyE: 'BOMB',
      };

      const cmd = keyMap[e.code];
      if (cmd) {
        setCommand(cmd, true);

        if (cmd === 'LEFT') moveLane('LEFT');
        if (cmd === 'RIGHT') moveLane('RIGHT');
        if (cmd === 'UP' && !isJumping) setJumping(true);
        if (cmd === 'DOWN' && !isSliding) setSliding(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, CommandNode> = {
        ArrowUp: 'UP',
        KeyW: 'UP',
        ArrowDown: 'DOWN',
        KeyS: 'DOWN',
        ArrowLeft: 'LEFT',
        KeyA: 'LEFT',
        ArrowRight: 'RIGHT',
        KeyD: 'RIGHT',
        Space: 'ACTION',
        ShiftLeft: 'FOCUS',
        KeyE: 'BOMB',
      };
      const cmd = keyMap[e.code];
      if (cmd) setCommand(cmd, false);
    };

    // Touch Event Handlers (Mobile Input)
    const handleTouchStart = (e: TouchEvent) => {
      setDevice('MOBILE');
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
          moveLane('RIGHT');
          triggerCommand('RIGHT');
        } else if (dx < -30) {
          moveLane('LEFT');
          triggerCommand('LEFT');
        }
      } else {
        setJumping(true);
        if (dy < -30 && !isJumping) {
          triggerCommand('UP');
        } else if (dy > 30 && !isSliding) {
          setSliding(true);
          triggerCommand('DOWN');
        }
      }
    };

    // Console Gamepad Polling Loop (Console Input)
    let prevLeftStickX = 0;
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1];

      if (gp) {
        setDevice('CONSOLE');
        const stickX = gp.axes[0] || 0;
        const stickY = gp.axes[1] || 0;

        // Stick X Threshold for Lane Shift
        if (stickX < -0.5 && prevLeftStickX >= -0.5) {
          moveLane('LEFT');
          triggerCommand('LEFT');
        } else if (stickX > 0.5 && prevLeftStickX <= 0.5) {
          moveLane('RIGHT');
          triggerCommand('RIGHT');
        }
        prevLeftStickX = stickX;

        // Jump (Button 0 or Stick Up)
        if ((gp.buttons[0]?.pressed || stickY < -0.6) && !isJumping) {
          setJumping(true);
          triggerCommand('UP');
        }

        // Slide (Button 1 or Stick Down)
        if ((gp.buttons[1]?.pressed || stickY > 0.6) && !isSliding) {
          setSliding(true);
          triggerCommand('DOWN');
        }
      }

      gamepadAnimationId = requestAnimationFrame(pollGamepad);
    };

    gamepadAnimationId = requestAnimationFrame(pollGamepad);
    // --- CONTROL SETTINGS END ---

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(gamepadAnimationId);
    };
  }, [moveLane, setJumping, setSliding, isJumping, isSliding, setCommand, setDevice, triggerCommand]);
};