export const HEART_GAME_GOAL = 10;

export function addCaughtHeart(score: number) {
  return Math.min(score + 1, HEART_GAME_GOAL);
}

export function allPromisesSealed(sealedCount: number, promiseCount: number) {
  return promiseCount > 0 && sealedCount === promiseCount;
}
