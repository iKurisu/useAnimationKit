import { RefObject, useRef, WheelEvent, TouchEvent, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BezierEasing from "bezier-easing";
import useAnimationFrame from "./useAnimationFrame";
import useFrame from "./useFrame";
import useListeners from "./useListeners";
import { CubicBezier } from "./types";
import usePrevTouches from "./usePrevTouches";

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
  config: ScrollConfig,
): [EventHandlers, Subscriber, Unsubscriber, ManualScroller] => {
  const {
    distance,
    duration,
    timing = defaultTiming,
    limitMod = {},
    withRouter = false,
    preserveScroll = false,
  } = config;

  const [subscribeAnimation, unsuscribeAnimation] = useAnimationFrame();
  const [getFrame, increaseFrame, resetFrame] = useFrame();
  const [getTouchOffset, setPrevTouch] = usePrevTouches();
  const [
    subscribeListeners,
    unsubscribeListeners,
    callListeners,
  ] = useListeners<Listener>();

  const location = withRouter ? useLocation() : { pathname: "/" };

  const target = useRef(0);
  const topLimit = useRef(0);
  const bottomLimit = useRef(0);

  /**
   * Returns the current node if it exists. Otherwise, it throws an error.
   */
  const getCurrentNode = (): HTMLElement => {
    if (!ref.current) {
      throw Error("The given ref does not have an html element assigned.");
    }

    return ref.current as HTMLElement;
  };

  const calcTopLimit = (): number => topLimit.current;

  const calcBottomLimit = (): number => {
    const { clientHeight } = getCurrentNode();

    return clientHeight - window.innerHeight + bottomLimit.current;
  };

  const limit = (x: number): number => {
    const topLimit = calcTopLimit();
    const bottomLimit = calcBottomLimit();

    return x < topLimit ? topLimit : x > bottomLimit ? bottomLimit : x;
  };

  const setTarget = (x: number): void => {
    target.current = x;
  };

  const increaseTarget = (x: number): void => setTarget(target.current + x);

  useEffect(() => {
    const { top = (): number => 0, bottom = (): number => 0 } = limitMod;

    if (!preserveScroll) {
      getCurrentNode().style.transform = "translateY(0)";
      target.current = 0;
    }

    topLimit.current = top();
    bottomLimit.current = bottom();
  }, [location.pathname]);

  /** Performs a scroll-like animation to the given position. */
  const manualScroll = ({
    to,
    duration,
    timing = defaultTiming,
  }: ManualScrollConfig): Promise<void> =>
    new Promise(res => {
      const currentNode = getCurrentNode();
      const from = limit(-getValue(currentNode.style.transform));
      const maxFrames = (duration / 1000) * 60;
      const easing = BezierEasing(...timing);

      setTarget(to);
      resetFrame();

      const animation = (): void => {
        const currentFrame = getFrame();

        const ease = maxFrames === 0 ? 1 : currentFrame / maxFrames;
        const value = limit((from + to) * easing(ease) - from);

        callListeners(value, bottomLimit);

        currentNode.style.transform = `translateY(${-value}px)`;

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
    const { current: currentTarget } = target;
    const currentNode = getCurrentNode();

    const from = limit(-getValue(currentNode.style.transform));
    const topLimit = calcTopLimit();
    const bottomLimit = calcBottomLimit();

    if (
      (currentTarget > topLimit && e.deltaY > 0) ||
      (currentTarget < bottomLimit && e.deltaY < 0)
    ) {
      setTarget(from);
    }

    increaseTarget(e.deltaY > 0 ? distance : -distance);
    resetFrame();

    const animation = (): void => {
      const currentFrame = getFrame();

      const ease = maxFrames === 0 ? 1 : currentFrame / maxFrames;
      const value = limit((target.current - from) * easing(ease) + from);

      callListeners(value, bottomLimit);

      currentNode.style.transform = `translateY(${-value}px)`;

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
    setPrevTouch(e.touches[0].clientY);
  };

  const touchMove = (e: TouchEvent<HTMLElement>): void => {
    setPrevTouch(e.touches[0].clientY);

    const currentNode = getCurrentNode();
    const from = -getValue(currentNode.style.transform);
    const value = limit(from + getTouchOffset());
    const bottomLimit = calcBottomLimit();

    callListeners(value, bottomLimit);

    currentNode.style.transform = `translateY(${-value}px)`;
  };

  const touchEnd = (e: TouchEvent<HTMLElement>): void => {
    const currentNode = getCurrentNode();
    const from = -getValue(currentNode.style.transform);
    const bottomLimit = calcBottomLimit();

    e.persist();

    const animation = (): void => {
      const currentFrame = getFrame();

      const ease = maxFrames === 0 ? 1 : currentFrame / maxFrames;
      const d = getTouchOffset();
      const value = limit(from + d * 60 * easing(ease));

      callListeners(value, bottomLimit);

      currentNode.style.transform = `translateY(${-value}px)`;

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
