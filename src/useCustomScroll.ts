import { RefObject, useRef, WheelEvent, TouchEvent, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BezierEasing from "bezier-easing";
import useAnimationFrame from "./useAnimationFrame";
import useFrame from "./useFrame";
import useListeners from "./useListeners";
import { CubicBezier } from "./types";

interface ScrollConfig {
  distance: number;
  duration: number;
  timing?: CubicBezier;
  limitMod?: {
    top?: () => number;
    bottom?: () => number;
  };
  withRouter?: boolean;
  preserveScroll?: boolean;
}

interface ManualScrollConfig {
  to: number;
  duration: number;
  timing?: CubicBezier;
}

type TouchEvents = "onTouchStart" | "onTouchMove" | "onTouchEnd";

type EventHandlers = {
  [k in TouchEvents]: (e: TouchEvent<HTMLElement>) => void;
} & {
  onWheel: (e: WheelEvent<HTMLElement>) => void;
};

/** The function that will get called when the user scrolls. */
type Listener = (scroll: number, max: number) => void;
type Subscriber = (listener: Listener) => void;
type Unsubscriber = (listener: Listener) => void;

type ManualScroller = (config: ManualScrollConfig) => void;

const defaultTiming: CubicBezier = [0, 0, 0.2, 1];

const getValue = (str: string): number => {
  const match = str.match(/-?\d+(\.\d+)?/g);

  return match ? +match[0] : 0;
};

/** Makes an element scrollable. */
const useCustomScroll = (
  ref: RefObject<HTMLElement>,
  {
    distance,
    duration,
    timing = defaultTiming,
    limitMod: {
      top: limitModTop = (): number => 0,
      bottom: limitModBottom = (): number => 0,
    } = {},
    withRouter = false,
    preserveScroll = false,
  }: ScrollConfig,
): [EventHandlers, Subscriber, Unsubscriber, ManualScroller] => {
  const [subscribeAnimation, unsuscribeAnimation] = useAnimationFrame();
  const [getFrame, increaseFrame, resetFrame] = useFrame();
  const [
    subscribeListeners,
    unsubscribeListeners,
    callListeners,
  ] = useListeners<Listener>();

  const location = withRouter ? useLocation() : { pathname: "/" };

  const prevTouches = useRef([0, 0]);
  const target = useRef(0);
  const topLimit = useRef(0);
  const bottomLimit = useRef(0);

  const getCurrentNode = (): HTMLElement => {
    return ref.current as HTMLElement;
  };

  const calcBottomLimit = (): number => {
    const { clientHeight } = getCurrentNode();

    return clientHeight - window.innerHeight + bottomLimit.current;
  };

  const limit = (x: number): number => {
    const bottomLimit = calcBottomLimit();

    return x > 0 ? 0 : x < -bottomLimit ? -bottomLimit : x;
  };

  const setTarget = (x: number): void => {
    target.current = x;
  };

  const increaseTarget = (x: number): void => {
    setTarget(target.current + x);
  };

  const resetPrevTouches = (x: number): void => {
    prevTouches.current = [x, x];
  };

  const setPrevTouch = (x: number): void => {
    prevTouches.current = [prevTouches.current[1], x];
  };

  useEffect(() => {
    if (!preserveScroll) {
      getCurrentNode().style.transform = "translateY(0)";
      target.current = 0;
    }

    topLimit.current = limitModTop();
    bottomLimit.current = limitModBottom();
  }, [location.pathname]);

  /** Performs a scroll-like animation to the given position. */
  const manualScroll = async ({
    to,
    duration,
    timing = defaultTiming,
  }: ManualScrollConfig): Promise<void> =>
    new Promise(res => {
      const currentNode = getCurrentNode();
      const from = limit(getValue(currentNode.style.transform));
      const maxFrames = (duration / 1000) * 60;
      const easing = BezierEasing(...timing);
      const bottomLimit = calcBottomLimit();

      setTarget(-to);
      resetFrame();

      const animation = (): void => {
        const currentFrame = getFrame();

        const ease = maxFrames === 0 ? 1 : currentFrame / maxFrames;
        const value = limit(-(from + to) * easing(ease) + from);

        callListeners(value, -bottomLimit);

        currentNode.style.transform = `translateY(${value}px)`;

        if (currentFrame === maxFrames) {
          resetFrame();
          unsuscribeAnimation();
          res();
        } else {
          increaseFrame();
          subscribeAnimation(animation);
        }
      };

      animation();
    });

  const easing = BezierEasing(...timing);
  const maxFrames = (duration / 1000) * 60;

  const wheel = (e: WheelEvent<HTMLElement>): void => {
    const currentNode = getCurrentNode();
    const { current: currentTarget } = target;
    const from = limit(getValue(currentNode.style.transform));

    const bottomLimit = calcBottomLimit();

    if (
      (currentTarget > 0 && e.deltaY > 0) ||
      (currentTarget < -bottomLimit && e.deltaY < 0)
    ) {
      setTarget(from);
    }

    increaseTarget(e.deltaY < 0 ? distance : -distance);
    resetFrame();

    const animation = (): void => {
      const currentFrame = getFrame();

      const ease = maxFrames === 0 ? 1 : currentFrame / maxFrames;
      const value = limit((target.current - from) * easing(ease) + from);

      callListeners(value, -bottomLimit);

      currentNode.style.transform = `translateY(${value}px)`;

      if (currentFrame === maxFrames) {
        resetFrame();
        unsuscribeAnimation();
      } else {
        increaseFrame();
        subscribeAnimation(animation);
      }
    };

    animation();
  };

  const touchStart = (e: TouchEvent<HTMLElement>): void => {
    unsuscribeAnimation();
    resetFrame();
    resetPrevTouches(e.touches[0].clientY);
  };

  const touchMove = (e: TouchEvent<HTMLElement>): void => {
    const currentNode = getCurrentNode();
    const from = getValue(currentNode.style.transform);
    const value = limit(from - (prevTouches.current[1] - e.touches[0].clientY));
    const bottomLimit = calcBottomLimit();

    callListeners(value, -bottomLimit);

    currentNode.style.transform = `translateY(${value}px)`;

    setPrevTouch(e.touches[0].clientY);
  };

  const touchEnd = (e: TouchEvent<HTMLElement>): void => {
    const currentNode = getCurrentNode();
    const from = getValue(currentNode.style.transform);
    const bottomLimit = calcBottomLimit();

    e.persist();

    const animation = (): void => {
      const currentFrame = getFrame();

      const ease = maxFrames === 0 ? 1 : currentFrame / maxFrames;
      const d = prevTouches.current[0] - prevTouches.current[1];
      const value = limit(from - d * 60 * easing(ease));

      callListeners(value, -bottomLimit);

      currentNode.style.transform = `translateY(${limit(value)}px)`;

      if (currentFrame === maxFrames) {
        resetFrame();
        unsuscribeAnimation();
      } else {
        increaseFrame();
        subscribeAnimation(animation);
      }
    };

    animation();
  };

  return [
    {
      onWheel: wheel,
      onTouchStart: touchStart,
      onTouchMove: touchMove,
      onTouchEnd: touchEnd,
    },
    subscribeListeners,
    unsubscribeListeners,
    manualScroll,
  ];
};

export default useCustomScroll;
