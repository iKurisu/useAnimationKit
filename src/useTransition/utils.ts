const framesInMs = 60 / 1000;

/**
 * @param duration The duration of the transition.
 * @returns The frames of the transition.
 */
export const toFrames = (duration: number): number => duration * framesInMs;

/**
 * @param currentFrame The transition's current frame.
 * @param maxFrames The frames of the transition.
 * @returns The easing progress.
 */
export const getProgress = (currentFrame: number, maxFrames: number): number =>
  maxFrames === 0 ? 1 : currentFrame / maxFrames;

/**
 * @param property A mapped property.
 * @param ease An ease value.
 * @returns The new property value with the ease applied.
 */
export const applyEase = (
  initial: number,
  target: number,
  ease: number,
): number => ease * (target - initial) + initial;
