import { useRef, useEffect, RefObject } from "react";

/**
 * Creates a mutation observer on a given node that will call the callback
 * each time the node changes.
 */
const useMutationCallback = (
  node: RefObject<HTMLElement>,
  callback: MutationCallback,
): void => {
  const observer = useRef<MutationObserver | null>(null);

  const getObserver = (): MutationObserver => {
    if (!observer.current) {
      observer.current = new MutationObserver(callback);
    }

    return observer.current;
  };

  useEffect((): (() => void) => {
    const observer = getObserver();
    if (node.current) observer.observe(node.current);
    return (): void => observer.disconnect();
  });
};

export default useMutationCallback;
