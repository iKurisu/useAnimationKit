import { RefObject } from "react";
import BezierEasing from "bezier-easing";
import mapProperties from "./useTransition/mapProperties";
import stringifyProperties from "./useTransition/stringify";
import { getProgress, toFrames } from "./useTransition/utils";
import { Properties } from "./useTransition/types";
import useAnimationFrame from "./useAnimationFrame";
import useFrame from "./useFrame";

type CubicBezier = [number, number, number, number];

export interface TransitionProps {
  from: Properties;
  to: Properties;
  duration: number;
  timing?: CubicBezier;
  delay?: number;
}

const defaultTiming: CubicBezier = [0, 0, 1, 1];

/**
 * Generates a function that will perform a transition from A to B on a ref
 * object.
 *
 * @param element A ref object.
 * @param props The transition's properties: `from`, `to` and `config`.
 *
 * @returns A function that will perform the transition when called and resolve
 * a promise once it's done.
 */
const useTransition = (
  element: RefObject<HTMLElement>,
  props: TransitionProps,
): (() => Promise<void>) => {
  const [subscribeAnimation, unsubscribeAnimation] = useAnimationFrame();
  const [getFrame, increaseFrame, resetFrame] = useFrame();

  const { from, to, duration, timing = defaultTiming, delay = 0 } = props;

  const transition = (): Promise<void> =>
    new Promise((resolve): void => {
      const easing = BezierEasing(...timing);
      const mappedProperties = mapProperties(from, to);
      const frames = toFrames(duration);

      const animation = (): void => {
        const currentFrame = getFrame();

        const ease = easing(getProgress(currentFrame, frames));
        const maxEase = easing(getProgress(Math.ceil(frames), frames));

        if (element.current) {
          const stage = maxEase > 1 ? ease / maxEase : ease;
          const styles = stringifyProperties(mappedProperties, stage);

          Object.assign(element.current.style, styles);
        }

        if (currentFrame >= frames) {
          resetFrame();
          unsubscribeAnimation();
          resolve();
        } else {
          increaseFrame();
          subscribeAnimation(animation);
        }
      };

      setTimeout(animation, delay);
    });

  return transition;
};

export default useTransition;
