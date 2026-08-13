export const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const checkCollision = (
  playerLane: number,
  jumpY: number,
  isSliding: boolean,
  obsLane: number,
  obsZ: number,
  obsHeight: number,
  obsType: string
): boolean => {
  if (playerLane !== obsLane) return false;
  if (obsZ < 0.5 || obsZ > 2.5) return false;

  if (obsType === 'LOW_BEAM' || obsType === 'BARRIER-LOW') {
    return jumpY < 1.0;
  }
  if (obsType === 'BARRIER-HIGH' || obsType === 'WALL') {
    return !isSliding;
  }
  return true;
};