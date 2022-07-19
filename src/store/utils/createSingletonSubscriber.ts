import { useEffect } from 'react';

/**
 * This function returns a useEffect hook which will call `implementation` based on the supplied `interval`.
 * The useEffect uses global state to ensure only a single interval is running at any given time.
 * @param implementation the implementation to execute
 * @param interval the interval for in which the implementation should be executed
 * @returns react hook
 */
export function createSingletonSubscriber(implementation: () => void, interval: number) {
  let id: NodeJS.Timer | null;
  let listeners = 0;
  function subscribe() {
    listeners++;
    if (!id) {
      id = setInterval(implementation, interval);
    }
  }
  function unsubscribe() {
    listeners--;
    if (id && listeners === 0) {
      console.log('unsubscribed');
      clearInterval(id);
      id = null;
    }
  }
  return () =>
    useEffect(() => {
      subscribe();
      return unsubscribe;
    }, []);
}
