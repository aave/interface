import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

// in memory fallback used when `localStorage` throws an error
export const inMemoryData = new Map<string, unknown>();

export type LocalStorageOptions<T> = {
  defaultValue?: T | (() => T);
  storageSync?: boolean;
  serializer?: {
    stringify: (value: unknown) => string;
    parse: (value: string) => unknown;
  };
};

// - `useLocalStorageState()` return type
// - first two values are the same as `useState`
export type LocalStorageState<T> = [
  T,
  Dispatch<SetStateAction<T>>,
  {
    isPersistent: boolean;
    removeItem: () => void;
  }
];

export function useLocalStorageState(
  key: string,
  options?: LocalStorageOptions<undefined>
): LocalStorageState<unknown>;
export function useLocalStorageState<T>(
  key: string,
  options?: Omit<LocalStorageOptions<T | undefined>, 'defaultValue'>
): LocalStorageState<T | undefined>;
export function useLocalStorageState<T>(
  key: string,
  options?: LocalStorageOptions<T>
): LocalStorageState<T>;
export function useLocalStorageState<T = undefined>(
  key: string,
  options?: LocalStorageOptions<T | undefined>
): LocalStorageState<T | undefined> {
  const serializer = options?.serializer;
  const [defaultValue] = useState(options?.defaultValue);
  return useLocalStorage(
    key,
    defaultValue,
    options?.storageSync,
    serializer?.parse,
    serializer?.stringify
  );
}

function useLocalStorage<T>(
  key: string,
  defaultValue: T | undefined,
  storageSync = true,
  parse: (value: string) => unknown = parseJSON,
  stringify: (value: unknown) => string = JSON.stringify
): LocalStorageState<T | undefined> {
  // we keep the `parsed` value in a ref because `useSyncExternalStore` requires a cached version
  const storageItem = useRef<{ string: string | null; parsed: T | undefined }>({
    string: null,
    parsed: undefined,
  });

  const value = useSyncExternalStore(
    // useSyncExternalStore.subscribe
    useCallback(
      (onStoreChange) => {
        const onChange = (localKey: string): void => {
          if (key === localKey) {
            onStoreChange();
          }
        };
        callbacks.add(onChange);
        return (): void => {
          callbacks.delete(onChange);
        };
      },
      [key]
    ),

    // useSyncExternalStore.getSnapshot
    () => {
      const string = goodTry(() => localStorage.getItem(key)) ?? null;

      if (inMemoryData.has(key)) {
        storageItem.current.parsed = inMemoryData.get(key) as T | undefined;
      } else if (string !== storageItem.current.string) {
        let parsed: T | undefined;

        try {
          parsed = string === null ? defaultValue : (parse(string) as T);
        } catch {
          parsed = defaultValue;
        }

        storageItem.current.parsed = parsed;
      }

      storageItem.current.string = string;

      // store default value in localStorage:
      // - initial issue: https://github.com/astoilkov/use-local-storage-state/issues/26
      //   issues that were caused by incorrect initial and secondary implementations:
      //   - https://github.com/astoilkov/use-local-storage-state/issues/30
      //   - https://github.com/astoilkov/use-local-storage-state/issues/33
      if (string === null && defaultValue !== undefined) {
        // reasons for `localStorage` to throw an error:
        // - maximum quota is exceeded
        // - under Mobile Safari (since iOS 5) when the user enters private mode
        //   `localStorage.setItem()` will throw
        // - trying to access localStorage object when cookies are disabled in Safari throws
        //   "SecurityError: The operation is insecure."
        // eslint-disable-next-line no-console
        goodTry(() => {
          const str = stringify(defaultValue);
          localStorage.setItem(key, str);
          storageItem.current = { string, parsed: defaultValue };
        });
      }

      return storageItem.current.parsed;
    },

    // useSyncExternalStore.getServerSnapshot
    () => defaultValue
  );
  const setState = useCallback(
    (newValue: SetStateAction<T | undefined>): void => {
      const val = newValue instanceof Function ? newValue(storageItem.current.parsed) : newValue;

      // reasons for `localStorage` to throw an error:
      // - maximum quota is exceeded
      // - under Mobile Safari (since iOS 5) when the user enters private mode
      //   `localStorage.setItem()` will throw
      // - trying to access `localStorage` object when cookies are disabled in Safari throws
      //   "SecurityError: The operation is insecure."
      try {
        localStorage.setItem(key, stringify(val));

        inMemoryData.delete(key);
      } catch {
        inMemoryData.set(key, val);
      }

      triggerCallbacks(key);
    },
    [key, stringify]
  );

  // - syncs change across tabs, windows, iframes
  // - the `storage` event is called only in all tabs, windows, iframe's except the one that
  //   triggered the change
  useEffect(() => {
    if (!storageSync) {
      return undefined;
    }

    const onStorage = (e: StorageEvent): void => {
      if (e.storageArea === goodTry(() => localStorage) && e.key === key) {
        triggerCallbacks(key);
      }
    };

    window.addEventListener('storage', onStorage);

    return (): void => window.removeEventListener('storage', onStorage);
  }, [key, storageSync]);

  return useMemo(
    () => [
      value,
      setState,
      {
        isPersistent: value === defaultValue || !inMemoryData.has(key),
        removeItem(): void {
          goodTry(() => localStorage.removeItem(key));

          inMemoryData.delete(key);

          triggerCallbacks(key);
        },
      },
    ],
    [key, setState, value, defaultValue]
  );
}

// notifies all instances using the same `key` to update
const callbacks = new Set<(key: string) => void>();
function triggerCallbacks(key: string): void {
  for (const callback of [...callbacks]) {
    callback(key);
  }
}

// a wrapper for `JSON.parse()` that supports "undefined" value. otherwise,
// `JSON.parse(JSON.stringify(undefined))` returns the string "undefined" not the value `undefined`
function parseJSON(value: string): unknown {
  return value === 'undefined' ? undefined : JSON.parse(value);
}

function goodTry<T>(tryFn: () => T): T | undefined {
  try {
    return tryFn();
  } catch {
    // eslint-disable-next-line no-console
    console.error('Error in goodTry');
  }
}

export function getLocalStorageValue<T>(
  key: string,
  defaultValue: T,
  parse: (value: string) => T = JSON.parse
): T {
  const string = goodTry(() => localStorage.getItem(key)) ?? null;
  return string === null ? defaultValue : parse(string);
}
