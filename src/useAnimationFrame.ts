import { useRef } from "react";

type Subscriber = (animation: () => void) => void;
type Unsubscriber = () => void;

/**
 * Provides two functions, a `Subscriber` and an `Unsubscriber`,
 * that simplify the use of `requestAnimationFrame`.
 *
 * `Subscriber` accepts an animation and registers its Id, and cancels
 * any registered animation.
 *
 * `Unsubscriber` removes the registered animation, if there's one.
 */
const useAnimationFrame = (): [Subscriber, Unsubscriber] => {
  const animationId = useRef<number | null>(null);

  const unsusbcribeAnimation: Unsubscriber = () => {
    if (!animationId.current) return;

    cancelAnimationFrame(animationId.current);
    animationId.current = null;
  };

  const subscribeAnimation: Subscriber = animation => {
    if (animationId.current) unsusbcribeAnimation();
    animationId.current = requestAnimationFrame(animation);
  };

  return [subscribeAnimation, unsusbcribeAnimation];
};

export default useAnimationFrame;
