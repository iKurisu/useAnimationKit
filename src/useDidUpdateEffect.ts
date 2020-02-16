import { useEffect, EffectCallback, useRef } from "react";

/**
 * Calls the effect only when the component updates.
 */
const useDidUpdateEffect = <D>(effect: EffectCallback, deps?: D[]): void => {
  const didMount = useRef(false);

  const setDidMount = (): void => {
    didMount.current = true;
  };

  useEffect(didMount.current ? effect : setDidMount, deps);
};

export default useDidUpdateEffect;
