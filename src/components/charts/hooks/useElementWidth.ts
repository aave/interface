import { useCallback, useRef, useState } from 'react';

export const useElementWidth = <T extends HTMLElement>() => {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver>();

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return { ref, width };
};
