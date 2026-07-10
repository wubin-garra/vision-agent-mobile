export function getCreditsBalance(memoryCount: number, bonusPoints = 0): number {
  return memoryCount * 5 + 19 + bonusPoints;
}

export const INVITE_REWARD = 20;
export const CAPTURE_COST = 1;
