import { useEffect, useState } from 'react';

/**
 * Debounce a primitive value. Returns `value` after it has been stable for
 * `delay` ms — use this to delay derived effects (queries, expensive
 * computations) while the user is still interacting with the source input.
 *
 * For "max" / sentinel selections where the change should be applied
 * immediately, branch around the debounced value at the call site.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
