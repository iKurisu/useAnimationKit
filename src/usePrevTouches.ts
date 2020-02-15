import { useRef } from "react";

type PrevTouches = [number, number];

/**
 * Stores the last two touch positions. Useful to get an idea of how fast
 * the user moves his finger across the screen.
 *
 * Returns two functions: `getTouchOffset`, which returns the difference
 * between both touches, and `setPrevTouch`, which stores a new touch and
 * returns the new offset.
 */
const usePrevTouches = (): [() => number, (touch: number) => number] => {
  const prevTouches = useRef<PrevTouches>([0, 0]);

  const getTouchOffset = (): number => {
    const [lastTouch, currentTouch] = prevTouches.current;

    return lastTouch - currentTouch;
  };

  const setPrevTouch = (touch: number): number => {
    const lastTouch = prevTouches.current[1];
    prevTouches.current = [lastTouch, touch];

    return lastTouch - touch;
  };

  return [getTouchOffset, setPrevTouch];
};

export default usePrevTouches;
