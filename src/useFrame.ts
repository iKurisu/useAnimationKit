import { useRef } from "react";

/**
 * Utility to control animation frames.
 *
 * @returns `getFrame`, `increaseFrame` and `resetFrame`.
 */
const useFrame = (): [() => number, () => void, () => void] => {
  const frame = useRef(0);

  const getFrame = (): number => frame.current;

  const increaseFrame = (): void => {
    const { current: currentFrame } = frame;
    frame.current = currentFrame + 1;
  };

  const resetFrame = (): void => {
    frame.current = 0;
  };

  return [getFrame, increaseFrame, resetFrame];
};

export default useFrame;
