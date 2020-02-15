import { useRef } from "react";

/**
 * Simplifies the use of listeners.
 *
 * @returns `subscribeListeners`, `unsubscribeListeners` and `callListeners`.
 */
const useListeners = <T extends Function>(): [
  (...fns: T[]) => void,
  (...fns: T[]) => void,
  (...args: unknown[]) => void,
] => {
  const listeners = useRef<T[]>([]);

  const subscribeListeners = (...fns: T[]): void => {
    const { current: currentListeners } = listeners;

    listeners.current = currentListeners.concat(fns);
  };

  const unsubscribeListeners = (...fns: T[]): void => {
    const { current: currentListeners } = listeners;

    listeners.current = currentListeners.filter(
      listener => !fns.includes(listener),
    );
  };

  const callListeners = (...args: unknown[]): void => {
    listeners.current.forEach((listener: T) => {
      listener(...args);
    });
  };

  return [subscribeListeners, unsubscribeListeners, callListeners];
};

export default useListeners;
