import { DependencyList, useEffect, useRef, useState } from 'react';

export const usePolling = (
  callback: () => Promise<void> | (() => void),
  time: number,
  skip: boolean,
  deps: DependencyList
) => {
  const [timeoutUpdate, setTimeoutUpdate] = useState(0);

  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // initial execution
    if (!skip) callback();
  }, [...deps]);

  useEffect(() => {
    let timeout: number;

    function tick() {
      const currentCallback = savedCallback.current();
      if (currentCallback instanceof Promise) {
        currentCallback.then(() => {
          setTimeoutUpdate(timeoutUpdate + 1);
        });
      } else {
        currentCallback();
        setTimeoutUpdate(timeoutUpdate + 1);
      }
    }

    if (!skip) {
      timeout = window.setTimeout(tick, time);
    }
    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutUpdate, ...deps]);

  return;
};
