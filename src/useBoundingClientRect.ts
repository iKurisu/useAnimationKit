import { RefObject, useState } from "react";
import useMutationCallback from "./useMutationCallback";

/** Provides the bounding client rect of an HTML element. */
const useBoundingClientRect = (
  element: RefObject<HTMLElement>,
): DOMRect | null => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateBoundingClientRect = (): void => {
    if (element.current) {
      setRect(element.current.getBoundingClientRect());
    }
  };

  useMutationCallback(element, updateBoundingClientRect);

  return rect;
};

export default useBoundingClientRect;
