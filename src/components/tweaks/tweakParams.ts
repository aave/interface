import { useCallback, useSyncExternalStore } from 'react';

/**
 * Design-review switches ("tweaks") that ride the URL, so a link opens the version it was copied
 * from. Only active in preview builds: everywhere else every param resolves to its default and the
 * URL is never read or written.
 *
 * The values also live in sessionStorage so they survive in-app navigation, where Next rebuilds the
 * URL from the route. `syncTweakParamsToUrl` puts them back after each route change.
 */
export const TWEAKS_ENABLED =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_TWEAKS === 'true';

const STORAGE_KEY = 'tweakParams';

type TweakState = Record<string, string>;

let state: TweakState = {};
let hydrated = false;
const defaults: Record<string, string> = {};
const listeners = new Set<() => void>();

const readStorage = (): TweakState => {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '{}') as TweakState;
  } catch {
    return {};
  }
};

const writeStorage = () => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private windows can refuse storage; the URL still carries the choice.
  }
};

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  const fromUrl: TweakState = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    fromUrl[key] = value;
  });
  // The URL wins over the remembered choice: a shared link must open what its sender saw.
  state = { ...readStorage(), ...fromUrl };
};

/** Writes every non-default tweak onto the current URL, and drops the ones back at default. */
export const syncTweakParamsToUrl = () => {
  if (!TWEAKS_ENABLED || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  Object.keys(defaults).forEach((param) => {
    const value = state[param];
    if (value && value !== defaults[param]) url.searchParams.set(param, value);
    else url.searchParams.delete(param);
  });
  // Next keeps its own routing state on the history entry: keep it, change only the address.
  window.history.replaceState(window.history.state, '', url.toString());
};

export const setTweakParam = (param: string, value: string) => {
  if (!TWEAKS_ENABLED) return;
  hydrate();
  state = { ...state, [param]: value };
  writeStorage();
  syncTweakParamsToUrl();
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * One switch. Returns the default outside preview builds, so the default must be a complete,
 * shippable state.
 */
export function useTweakParam<T extends string>(
  param: string,
  values: readonly T[],
  defaultValue: T
): [T, (value: T) => void] {
  defaults[param] = defaultValue;

  const read = useCallback((): T => {
    if (!TWEAKS_ENABLED) return defaultValue;
    hydrate();
    const value = state[param] as T | undefined;
    return value && values.includes(value) ? value : defaultValue;
  }, [param, values, defaultValue]);

  const value = useSyncExternalStore(subscribe, read, () => defaultValue);
  const setValue = useCallback((next: T) => setTweakParam(param, next), [param]);

  return [value, setValue];
}
