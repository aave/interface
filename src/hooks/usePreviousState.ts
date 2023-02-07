import { useEffect, useRef } from 'react';

export default function usePreviousState<T>(value: T): T {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
}
