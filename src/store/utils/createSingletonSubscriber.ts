import { useEffect } from 'react';

import { useRootStore } from '../root';

/**
 * This function returns a useEffect hook which will call `implementation` based on the supplied `interval`.
 * The useEffect uses global state to ensure only a single interval is running at any given time.
 * @param implementation the implementation to execute
 * @param interval the interval for in which the implementation should be executed
 * @returns react hook
 */
export function createSingletonSubscriber<T extends () => Promise<void>>(
  implementation: T,
  interval: number
): () => T {
  let id: NodeJS.Timer | null;
  let listeners = 0;
  function subscribe() {
    implementation();
    listeners++;
    if (!id) {
      id = setInterval(implementation, interval);
    }
  }
  function unsubscribe() {
    listeners--;
    if (id && listeners === 0) {
      clearInterval(id);
      id = null;
    }
  }
  return () => {
    const [currentMarket, account] = useRootStore((state) => [state.currentMarket, state.account]);
    useEffect(() => {
      subscribe();
      return unsubscribe;
    }, [currentMarket, account]);
    return implementation;
  };
}
