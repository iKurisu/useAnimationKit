import { RefObject, useContext, useEffect, Context } from "react";
import useBoundingClientRect from "./useBoundingClientRect";
import useIntersection from "./useIntersection";
import { Subscriber, Unsubscriber, ManualScroller } from "./types";

type Unit = "%" | "px" | "vh" | "vw" | "vmax" | "vmin";

interface Bounds {
  start: number;
  end: number;
  unit?: Unit;
}

/**
 * Provides a parallax effect for a given element.
 *
 * @param element The HTMLElement to apply the effect on.
 * @param ctx A custom scroll context.
 * @param bounds The bounds of the parallax. It has two required properties,
 * `start` and `end`, which specify the position of the element when it
 * enters/leaves the screen from the bottom or from the top, respectively, and
 * an optional property to specify the unit.
 *
 * Note: the effect will only take place while the element is visible.
 */
const useParallax = (
  element: RefObject<HTMLElement>,
  ctx: Context<{
    subscriber: [Subscriber, Unsubscriber];
    manualScroll: ManualScroller;
  }>,
  bounds: Bounds,
): void => {
  const { start, end, unit = "%" } = bounds;
  const boundDiff = end - start;
  const rect = useBoundingClientRect(element);
  const [isIntersecting] = useIntersection(element);

  const {
    subscriber: [subscribe, unsubscribe],
  } = useContext(ctx);

  useEffect(() => {
    if (!rect) return;

    const { innerHeight } = window;
    const { height, top } = rect;
    const distanceFromElement = top <= innerHeight ? top : innerHeight;
    const diffPerScrolledPx = boundDiff / (height + distanceFromElement);

    const parallax = (scroll: number): void => {
      if (!element.current) return;

      if (isIntersecting) {
        const absScroll = Math.abs(scroll);
        const scrolledFromElement = absScroll + distanceFromElement - top;
        const offset = diffPerScrolledPx * scrolledFromElement;

        element.current.style.transform = `translateY(${start +
          offset}${unit})`;
      }
    };

    subscribe(parallax);
    return (): void => unsubscribe(parallax);
  }, [rect, isIntersecting]);
};

export default useParallax;
